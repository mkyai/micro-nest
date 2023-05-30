import * as winston from "winston";
import { LoggerOptions } from "winston";

import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";
import { Injectable } from "@nestjs/common";
import {
  utilities,
  WinstonModuleOptions,
  WinstonModuleOptionsFactory,
} from "nest-winston";
require("dotenv").config();

export const getLoggerConfig = (): LoggerOptions => {
  const transports: any = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        utilities.format.nestLike(process.env.SERVER_NAME || "Dev", {
          prettyPrint: true,
        })
      ),
    }),
  ];
  if (process.env.LOGTAIL_KEY) {
    transports.push(new LogtailTransport(new Logtail(process.env.LOGTAIL_KEY)));
  }
  return {
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.colorize({ message: true }),
      winston.format.timestamp({ format: "YYYY-MM-DD HH:MM:SS" }),
      winston.format.printf(
        ({ timestamp, level, message, ...args }) =>
          `[${timestamp}] [${level}] ${message} ${
            Object.keys(args).length ? JSON.stringify(args, null, 2) : ""
          }`
      )
    ),
    transports,
  };
};

// @ts-ignore
@Injectable()
export class WinstonConfigService implements WinstonModuleOptionsFactory {
  createWinstonModuleOptions():
    | Promise<WinstonModuleOptions>
    | WinstonModuleOptions {
    return getLoggerConfig();
  }
}
