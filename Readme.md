# MICRO-NEST

 <p align="center">
  <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">NestJs based decorators & helper functions for microservices.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>

## Quick Start

- Install
  `npm i @micro-nest/common`

- Imports

```
import { Listner, Listen, MicroConnect, Micro } from "@micro-nest/common"
import { Call } from "@micro-nest/common" # for gateway only
import { MicroException, ValidationException } from "@micro-nest/common"
```

## Description

- Provides a set of decorators to help you build microservices with NestJs
- Provides a set of helper functions to help you build microservices with NestJs
- RPC exception filter to handle exceptions thrown by microservices
- Transport layers to connect microservices with NestJs

## Code Less & Do More

- Naming conventions based decorators and function.
- Default is configured, just pass the options you want to override.
- Easy to use and configure.

## Architecture

- Microservices architecture is used to build these decorators & helper functions, where default transport layer is **RabbitMQ** ,however you can configure your transport layer according to your need from available transport layers. Sub nest projects are used to create individual microservices, microservices from other langauge, framework is also supported.

 <p align="center">
  <a href="https://radiansys.com/" target="blank"><img src="https://user-images.githubusercontent.com/99083966/236609851-1fc3edcb-2c5d-466e-b6ec-6226f6844b22.svg" alt="micro nest" /></a>
</p>

## Transport Layers:

- ### TCP

  - `tcp(host?:string, port?:number)`

- ### RABBITMQ

  - `rabbitmq(queue?:string, url?:string)`

- ### REDIS

  - `redis(host?:string, port?:number, password?:string, tls?: any)`

- ### KAFKA

  - `kafka(broker?:string)`

## Decorators:

- ### @MicroConnect()

  - Used to connect to a microservice

  ```
  export class UserService {

    @MicroConnect()
    auth: ClientProxy

  }
  ```

- ### @Micro()

  - Used to call a microservice event

  ```
  export class UserService {

    @MicroConnect()
    auth: ClientProxy

    @Micro()
    create() {}

  }
  ```

- ### @Listner()

  - Used to register a listner class

  ```
  @Listner()
  export class UserListner {

  }
  ```

- ### @Listen()

  - Used to listen a microservice event

  ```
  @Listner()
  export class UserListner {

    @Listen()
    create() {}

  }
  ```

## Default CRUD functions available

- create() {}
- findAll() {}
- findOne() {}
- findOrFail() {}
- update() {}
- updateAll() {}
- softDelete() {}
- hardDelete() {}
- paginate() {}
- ping() {}
- pong() {}

## Exceptions:

- throw new **MicroException()**
- throw new **ValidationException()**

## Strategy:

- **retryStrategy**

## Todo:

- [ ] Add more transport layers
- [ ] Add Http transport layer
- [ ] Add script to generate resources
- [✓] Add **@CRUD** decorator
- [ ] Error handling
- [✓] Availability ping check
- [ ] Dynamic config

## Organization

<a href="https://radiansys.com" target="_blank"><img src="https://radiansys.com/_next/static/media/radiansys.6e55f863.svg"></a>

## Stay in touch

- Author - [Lovneet](https://github.com/Lovneet-s)
- Maintainer - [Tara](https://github.com/tarasingh1)

## License

@micro-nest is [MIT licensed](LICENSE).
