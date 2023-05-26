import { HttpStatus, UnprocessableEntityException } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";

interface ExceptionInterface {
  field: string;
  message: string;
}

export class ValidationException extends UnprocessableEntityException {
  constructor({ field, message }: ExceptionInterface) {
    super({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      errors: [
        {
          field,
          message,
        },
      ],
    });
  }
}

export class MicroException extends RpcException {
  constructor({ status, name, message, ...rest }: any) {
    const exception = {
      error: true,
      status: status ?? 500,
      name: status ? name : "Internal Server Error",
      message: `[${name}] : ${message}`,
      errors: rest.response?.errors,
    };

    super(exception);
  }
}
