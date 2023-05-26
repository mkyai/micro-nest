import { HttpException, NotFoundException } from "@nestjs/common";
import { snakeCase } from "lodash";
import { CRUD_FUNCTIONS } from "./constants";
import { ValidationException } from "./exceptions";
import { ResponseMetaInterface } from "./interface";

export const getCrudFunctions = (name: string, i: any, [m]: any) => {
  switch (name) {
    case "create":
      return i.save(i.create(m[0])).catch(async (e: any) =>
        Promise.reject(
          new ValidationException({
            field: e.detail.match(/(?<=Key \()(.*?)(?=\))/)[0],
            message: e.detail.split("=")[1].replace(/[()]/g, ""),
          })
        )
      );
    case "find":
      return i.find(m[0]);

    case "findAll":
      return i.findAndCount(m[0]);

    case "findOne":
      return i.findOne(m[0]);

    case "findOneOrFail":
      return i
        .findOne(m[0])
        .then(
          (v: any) =>
            v ?? Promise.reject(new NotFoundException(`No such record found!`))
        );

    case "update":
      return i
        .findOne(m[0])
        .then(
          (v: any) =>
            v ?? Promise.reject(new NotFoundException(`No such record found!`))
        )
        .then((resp: any) => {
          const { password, ...rest } = resp;
          i.save(i.create({ ...rest, ...m[1] }));
        });

    case "delete":
      return i.softDelete(m[0]);

    case "destroy":
      return i.delete(m[0]);

    default:
  }
};

export const getDataSourceFunctions = (
  name: string,
  t: string,
  i: any,
  [m]: any
) => {
  switch (name) {
    case "find":
      return i.query(
        `SELECT * FROM public.${t} ${m[0] ? "WHERE " + m[0] : ""}`
      );

    case "findOne":
      return i
        .query(
          `SELECT * FROM public.${t} ${m[0] ? "WHERE " + m[0] : ""} LIMIT 1`
        )
        .then((v: any) => v[0]);

    default:
  }
};

export const resolveCRUD = (descriptor: any): PropertyDescriptor => {
  const originalMethod = descriptor.value;

  const { name } = originalMethod;
  if (name === "pong") {
    descriptor.value = async function () {
      return "PONG 😊";
    };
    return descriptor;
  }
  if (!CRUD_FUNCTIONS.includes(name)) return descriptor;
  descriptor.value = async function (...args: any[]) {
    const result = originalMethod.apply(this, args);
    return Promise.resolve(result).then((v) =>
      v
        ? result
        : !!this.db
        ? getDataSourceFunctions(
            name,
            snakeCase(this.constructor.name.toString().replace("Listner", "s")),
            this.db,
            args
          )
        : getCrudFunctions(name, this.repo, args)
    );
  };

  return descriptor;
};

export const resolvePing = (descriptor: any): PropertyDescriptor => {
  descriptor.value = async function () {
    console.log("TODO: configure ping decorator");
  };

  return descriptor;
};

export const toSnakeCase = (obj: any): any => {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => toSnakeCase(item));
  }

  return Object.entries(obj).reduce((acc: any, [key, value]) => {
    const snakeCaseKey = key.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`
    );
    acc[snakeCaseKey] = toSnakeCase(value);

    return acc;
  }, {});
};

export const toCamelCase = (obj: any): any => {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => toCamelCase(item));
  }

  return Object.entries(obj).reduce((acc: any, [key, value]) => {
    const camelCaseKey = key.replace(/_([a-zA-Z])/g, (match, letter) =>
      letter.toUpperCase()
    );
    acc[camelCaseKey] = toCamelCase(value);

    return acc;
  }, {});
};

export const getJsonSize = (obj: Record<string, any>) => {
  const size = Buffer.byteLength(JSON.stringify(obj));

  return size > 1024 ? `${size / 1024} kb` : `${size} bytes`;
};

export const getResponseMeta = (obj: Record<string, any>, ts: number) => {
  return {
    success: !obj?.error,
    duration: Date.now() - ts,
    size: getJsonSize(obj),
    timestamp: new Date(),
  };
};

export class ResponseBuilder {
  data: Record<string, any>;

  meta: ResponseMetaInterface;

  constructor(data: Record<string, any>, ts: number) {
    if (!data) {
      this.data = {};
      this.meta = getResponseMeta(this.data, ts);
    } else {
      const { error, ...rest } = data;
      this.data = error ? rest : data;
      this.meta = getResponseMeta(data, ts);
    }
  }
}

export const validateResponse = (data: Record<string, any>, ts: number) => {
  const response = new ResponseBuilder(toCamelCase(data), ts);
  if (response.meta.success) return response;
  throw new HttpException(response, response.data.status);
};
