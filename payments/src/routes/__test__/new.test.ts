import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { Order } from '../../models/order'
import { OrderStatus } from '@rkh-ms/common'
import { stripe } from '../../stripe'
import { Payment } from '../../models/payment'
//jest.mock('../../stripe')

const createId = () => new mongoose.Types.ObjectId().toHexString()

it('return 404 when purchase order not exists', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: '1dd1dd',
            orderId: createId()
        })
        .expect(404)
})

it('return 401 when purchase order not belong to the user', async () => {
    //create order
    const order = Order.build({
        id: createId(),
        userId: '123',
        status: OrderStatus.Created,
        price: 70
    })
    await order.save()

    //make request to try to pay and expect error
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: '1dd1dd',
            orderId: order.id
        })
        .expect(401)
})

it('return 400 when purchase a cancelled order', async () => {

    const id = createId()

    //create a order
    const order = Order.build({
        id: createId(),
        userId: id,
        status: OrderStatus.Cancelled,
        price: 70
    })
    await order.save()

    //create req to pay for cancelled order
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(id))
        .send({
            token: 'dqwdqd',
            orderId: order.id
        })
        .expect(400)
})

it('returns 201 with a valid inputs', async () => {
    const id = createId()

    //create a order
    const order = Order.build({
        id: createId(),
        userId: id,
        status: OrderStatus.Created,
        price: Math.floor(Math.random() * 1000)
    })
    await order.save()

    //create req to pay for cancelled order
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(id))
        .send({
            token: 'tok_visa',
            orderId: order.id
        })
        .expect(201)

    //make request to get all charges done 
    const charges = (await stripe.charges.list()).data

    //iterate over charges and look for charge with
    //the order price
    const stripeCharge = charges.find(charge => charge.amount === order.price * 100)
    expect(stripeCharge).toBeDefined()
    expect(stripeCharge!.currency).toEqual('usd')
    expect(stripeCharge!.paid).toEqual(true)

    //expect payment acually created and saved
    const payment = await Payment.findOne({
        stripeId: stripeCharge!.id,
        orderId: order.id
    })
    expect(payment).not.toBeNull()

    // expect(stripe.charges.create).toHaveBeenCalled()
    // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]
    // expect(chargeOptions.amount).toEqual(order.price * 100)
    // expect(chargeOptions.currency).toEqual('usd')
    // expect(chargeOptions.source).toEqual('dqwdqd')
})

