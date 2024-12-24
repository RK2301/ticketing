import Link from "next/link"

const OrderIndex = ({ orders }) => {

    const orderList = orders.map(order => {
        return (
            <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.ticket.title}</td>
                <td>{order.ticket.price}</td>
                <td>{order.status}</td>
                <td>
                    <Link href='/orders/[orderId]' as={`/orders/${order.id}`}>
                        View Order
                    </Link>
                </td>
            </tr>
        )
    })

    return (
        <div className="container mt-5 mt-md-3">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <h1>Orders</h1>
                </div>
            </div>

            <div className="row justify-content-center">
                <div className="col-md-8 table-container">
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>OrderID</th>
                                <th>Ticket</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody>
                            {orderList}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

OrderIndex.getInitialProps = async (context, client) => {
    const { data } = await client.get('/api/orders')
    return { orders: data }
}

export default OrderIndex