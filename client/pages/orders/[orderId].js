import { useEffect, useState } from "react"
import StripeCheckout from "react-stripe-checkout"
import useRequest from "../../hooks/use-request"
import { OrderStatus } from "@rkh-ms/common"

const OrderShow = ({ currentUser, order }) => {
    const [timeLeft, setTimeLeft] = useState(0)
    const [timeFormat, setTimeFormat] = useState('')

    const [cpyOrder, setCpyOrder] = useState({ ...order })

    useEffect(() => {
        //set function to calculate time Left and call it every second
        const findTimeLeft = () => {
            const secondsLeft = Math.round((new Date(order.expiresAt) - new Date()) / 1000)
            setTimeLeft(secondsLeft > 0 ? secondsLeft : 0)

            if (secondsLeft > 0) {
                const minutes = Math.floor(secondsLeft / 60)
                const seconds = secondsLeft % 60
                setTimeFormat(`Time Left to Pay: ${minutes} minutes ${seconds} seconds`)
            }
        }

        findTimeLeft()
        const intervalId = setInterval(findTimeLeft, 1000)

        return () => {
            clearInterval(intervalId)
        }
    }, [])

    const { doRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id
        },
        onSuccess: (payment) => setCpyOrder({ ...cpyOrder, status: OrderStatus.Complete })
    })

    /**Show Proper Message indicate Order status
     * if user not already paid, show the time left to pay
     * else: if the user paid successfully show success message
     * if time has expired show error message
     */
    const Message = ({ }) => {
        if (timeLeft > 0)
            return timeFormat

        return (
            <div className={`alert mt-2 p-3 ${cpyOrder.status === OrderStatus.Complete ? "alert-success" : "alert-danger"}`} role="alert">
                <div style={{ textAlign: 'center' }}>

                    {
                        cpyOrder.status === OrderStatus.Complete ?
                            <>
                                <strong>Order has been paid successfully!</strong>
                                <p className="p-0 m-0">Thank you</p>
                            </>
                            :
                            <strong>Time has expired, You can not pay for this order anymore</strong>
                    }
                </div>
            </div>
        )
    }

    return (
        <div className="container">
            <div className="row justify-content-center mt-5">
                <div className="col-10 col-md-6">

                    <div className="row justify-content-center">
                        <div className="col-auto">
                            <h1>
                                {order.ticket.title}
                            </h1>
                        </div>
                    </div>

                    <div className="row justify-content-center mt-2">
                        <div className="col-auto">
                            <h4>
                                Price: {order.ticket.price}
                            </h4>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row justify-content-center mt-2">
                <div className="col-10 col-md-6">
                    <div className="row justify-content-center">
                        <div className="col-auto">
                            <Message />
                        </div>
                    </div>
                </div>
            </div>

            {cpyOrder.status === OrderStatus.Cancelled || cpyOrder.status === OrderStatus.Complete || timeLeft <= 0 ?
                <></> :
                (
                    <div className="row justify-content-center mt-3">
                        <div className="col-md-5 col-10">
                            <StripeCheckout
                                token={({ id }) => doRequest({ token: id })}
                                stripeKey="pk_test_51QURybB1vDg7eywRkmognA39SeJ5xKIf8Hl5VmlXSdeY67b9z9tAik6soO5Odi53BrCl1OZT6XfuuAmVaboMzByu00ujkbLxrx"
                                amount={order.ticket.price * 100}
                                email={currentUser.email}
                                currency="USD"
                            >
                                <div className="row justify-content-center">
                                    <button
                                        className="custom-btn"
                                    >
                                        Pay Now
                                    </button>
                                </div>
                            </StripeCheckout>
                        </div>
                    </div>
                )
            }


            <div className="row justify-content-center mt-3">
                <div className="col-md-5 col-10">
                    {errors}
                </div>
            </div>
        </div>
    )
}

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query
    const { data } = await client.get(`/api/orders/${orderId}`)

    return { order: data }
}

export default OrderShow