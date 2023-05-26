import {
  CustomTransportStrategy,
  GrpcOptions,
  KafkaOptions,
  MqttOptions,
  NatsOptions,
  RedisOptions,
  RmqOptions,
  Server,
  TcpOptions,
  Transport,
} from "@nestjs/microservices";
import { retryStrategy } from "./strategy";

require("dotenv").config();

class CustomPubSubServer extends Server implements CustomTransportStrategy {
  listen(callback: () => void) {
    callback();
  }

  close() {}
}

export const tcp = (
  host = process.env.TCP_HOST || "127.0.0.1",
  port = parseInt(<string>process.env.TCP_PORT, 10) || 8877
): TcpOptions => {
  return {
    transport: Transport.TCP,
    options: { host, port },
  };
};

export const mqtt = (
  url = process.env.MQTT_URL || "mqtt://127.0.0.1:1883"
): MqttOptions => {
  return {
    transport: Transport.MQTT,
    options: { url, protocol: "mqtts" },
  };
};

export const nats = (
  queue: string = `micro_${process.env.MS}_queue`,
  url = process.env.NATS_URL || "nats://127.0.0.1:4222"
): NatsOptions => {
  return {
    transport: Transport.NATS,
    options: {
      servers: [url],
      queue,
    },
  };
};

export const rabbitmq = (
  queue: string = `micro_${process.env.MS}_queue`,
  url: string = process.env.RABBITMQ_URL || "amqp://127.0.0.1:5672"
): RmqOptions => {
  return {
    transport: Transport.RMQ,
    options: {
      queue,
      urls: [url],
      queueOptions: {
        durable: false,
      },
    },
  };
};

export const redis = (
  host = process.env.REDIS_HOST || "127.0.0.1",
  port = parseInt(<string>process.env.REDIS_PORT, 10) || 6379,
  password = process.env.REDIS_PASSWORD || undefined,
  tls = process.env.REDIS_SSL && JSON.parse(process.env.REDIS_SSL)
    ? {
        servername: process.env.REDIS_HOST,
      }
    : undefined
): RedisOptions => {
  return {
    transport: Transport.REDIS,
    options: { host, port, password, tls, retryStrategy },
  };
};

export const kafka = (
  broker = process.env.KAFKA_BROKER || "127.0.0.1:9092"
): KafkaOptions => {
  return {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [broker],
      },
    },
  };
};

export const grps = (
  url = process.env.NATS_URL || "nats://127.0.0.1:4222",
  app = "app",
  protoPath = "src/app.proto"
): GrpcOptions => {
  return {
    transport: Transport.GRPC,
    options: {
      url,
      package: app,
      protoPath,
    },
  };
};

export const customTransportor = () => {
  return {
    strategy: new CustomPubSubServer(),
  };
};
