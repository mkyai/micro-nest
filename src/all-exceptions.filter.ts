import { ArgumentsHost, Catch } from "@nestjs/common";
import { BaseRpcExceptionFilter } from "@nestjs/microservices";
import { MicroException } from "./exceptions";

// @ts-ignore
@Catch()
export class AllExceptionsFilter extends BaseRpcExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    return super.catch(new MicroException(exception), host);
  }
}
