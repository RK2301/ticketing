import useRequest from '../../hooks/use-request'
import Router from 'next/router'

const TicketShow = ({ currentUser, ticket }) => {

    const { doRequest, errors } = useRequest({
        url: '/api/orders',
        method: 'post',
        body: {
            ticketId: ticket.id
        },
        onSuccess: (order) => Router.push('/orders/[orderId]', `/orders/${order.id}`)
    })

    return (
        <div className="container">
            <div className="row justify-content-center mt-5">
                <div className="col-auto col-md-4">
                    <h1>
                        {ticket.title}
                    </h1>

                    <h4>
                        Price: {ticket.price}
                    </h4>
                </div>
            </div>

            <div className="row justify-content-center mt-2">
                <div className="col-md-6">
                    {errors}
                </div>
            </div>

            <div className="row justify-content-center mt-3">
                <div className="col-md-4 col-10">
                    <button onClick={() => doRequest()} className="custom-btn">Purchase</button>
                </div>
            </div>
        </div>
    )
}

TicketShow.getInitialProps = async (context, client) => {
    const { ticketId } = context.query
    const { data } = await client.get(`/api/tickets/${ticketId}`)
    return { ticket: data }
}

export default TicketShow