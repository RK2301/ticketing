import Queue from "bull";
import { ExpirationCompletePublisher } from "../events/publisher/expiration-complete-publisher";
import { natsWrapper } from "../nats-wrapper";

interface Payload {
    orderId: string
}

const expirationQueue = new Queue<Payload>('order:expiration', {
    redis: {
        host: process.env.REDIS_HOST
    }
})


expirationQueue.process(async (job) => {
    console.log(`Publish a event expiration:completed for orderId: ${job.data.orderId}`);

    new ExpirationCompletePublisher(natsWrapper.client).publish({
        orderId: job.data.orderId
    })
})

export { expirationQueue }