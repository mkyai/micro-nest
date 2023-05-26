import {
  applyDecorators,
  Controller,
  Get,
  HttpException,
  UseFilters,
} from "@nestjs/common";
import { Client, MessagePattern, Transport } from "@nestjs/microservices";
import { camelCase, kebabCase, upperFirst } from "lodash";
import { WinstonModule } from "nest-winston";
import { of } from "rxjs";
import { catchError, timeout } from "rxjs/operators";
import { AllExceptionsFilter } from "./all-exceptions.filter";
import { resolveCRUD, validateResponse } from "./helper";
import { rabbitmq, redis } from "./transport";
import { getLoggerConfig } from "./winston.config";

require("dotenv").config();

export const Listner =
  (decorators?: any[]): ClassDecorator =>
  (target: Record<string, any>) => {
    return applyDecorators(...(decorators ?? []), Controller())(target);
  };

export const Listen =
  (event?: string): MethodDecorator =>
  (
    target: Record<string, any>,
    propertyKey: any,
    descriptor: PropertyDescriptor
  ) => {
    const service = `${camelCase(
      (event ?? target.constructor.name).toString().replace("Listner", "")
    )}.${propertyKey}`;

    return applyDecorators(
      UseFilters(new AllExceptionsFilter()),
      MessagePattern(service)
    )(target, propertyKey, resolveCRUD(descriptor));
  };

export const MicroConnect =
  (
    layer: Transport = parseInt(<string>process.env.TRANSPORT_LAYER, 10) || 1,
    queueName?: string
  ): PropertyDecorator =>
  (target: Record<string, any>, key: any) => {
    const queue = queueName ?? `micro_${key}_queue`;
    const config = layer === 5 ? rabbitmq(queue) : redis(); // TODO: configure other transport with switch

    return applyDecorators(Client(config))(target, key);
  };

export const Micro =
  (client?: string | number): MethodDecorator =>
  (target: any, key: any, descriptor: any) => {
    descriptor.value = function (...args: any[]) {
      const clientIndex = client && typeof client === "number" ? client : 0;
      const connection =
        client && typeof client === "string"
          ? client
          : Object.keys(target)[clientIndex];

      return this[`${connection}`]
        .send(`${connection}.${key}`, args)
        .pipe(catchError((val) => of(val)))
        .toPromise();
    };

    return descriptor;
  };

export const Call = (client?: string | number): MethodDecorator => {
  return (target: Record<string, any>, key: any, descriptor: any) => {
    descriptor.value = function (...args: any[]) {
      const start = Date.now();
      const clientIndex = client && typeof client === "number" ? client : 0;
      const connection =
        client && typeof client === "string"
          ? client
          : Object.keys(target)[clientIndex];

      return this[`${connection}`]
        .send(`${connection}.${key}`, args)
        .pipe(
          timeout(parseInt(<string>process.env.REQUEST_TIMEOUT, 10) || 5000)
        )
        .pipe(catchError((val) => of(val)))
        .toPromise()
        .then((res: Record<string, any>) => {
          return validateResponse(res, start);
        });
    };

    return descriptor;
  };
};

export const Ping =
  (): MethodDecorator =>
  (target: Record<string, any>, key: any, descriptor: any) => {
    descriptor.value = async function () {
      const status = await this.client
        .send(`${key}.ping`, [Date.now()])
        .pipe(timeout(2500))
        .toPromise()
        .catch(() => false);

      if (!status) {
        throw new HttpException(`${upperFirst(key)} Service unavailable!`, 503);
      }

      return status;
    };

    return applyDecorators(Get(`ping/${kebabCase(key)}`))(
      target,
      key,
      descriptor
    );
  };

export const MicroLogger = () => WinstonModule.createLogger(getLoggerConfig());
