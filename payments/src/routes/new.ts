import { BadRequestError, NotAuthroizedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@rkh-ms/common'
import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { Order } from '../models/order'
import 'express-async-errors'
import { stripe } from '../stripe'
import { Payment } from '../models/payment'
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.post('/api/payments',
    requireAuth,
    [
        body('token').notEmpty().withMessage('Must Include Token'),
        body('orderId').notEmpty().withMessage('orderId Must Included')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { token, orderId }: { token: string; orderId: string } = req.body

        // 1. Find if order exists
        const order = await Order.findById(orderId)
        if (!order)
            throw new NotFoundError()

        // 2. check if user try to pay for the order
        // is the same user who created the order
        if (req.currentUser!.id !== order.userId)
            throw new NotAuthroizedError()

        // 3. check if the order not cancelled
        if (order.status === OrderStatus.Cancelled)
            throw new BadRequestError('Order is Cancelled')

        //create a charge
        const charge = await stripe.charges.create({
            amount: order.price * 100,
            currency: 'usd',
            source: token
        })

        //save chargeid & orderid to indicate successfully payment
        const payment = Payment.build({
            stripeId: charge.id,
            orderId: order.id
        })
        await payment.save()

        //publish payment created event
        new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.stripeId
        })

        res.status(201).send(payment)
    }
)

export { router as createChargeRouter }