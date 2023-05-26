// TODO
import { kafka, rabbitmq, redis, tcp } from "./transport";
enum Layers {
  redis,
  tcp,
  kafka,
  rabbitmq,
}

const Transport = (layer: Layers) => {
  switch (layer) {
    case Layers.tcp:
      return tcp();
    case Layers.redis:
      return redis();
    case Layers.kafka:
      return kafka();
    case Layers.rabbitmq:
      return rabbitmq();

    default:
      return redis();
  }
};

class TransportLayer {
  constructor(private config?: any) {}
  redis() {
    return redis();
  }
}
const redisLayer = new TransportLayer().redis();
