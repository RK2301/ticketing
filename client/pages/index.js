import Link from "next/link"

const LandingPage = ({ currentUser, tickets }) => {

    const ticketsList = tickets.map(ticket => (
        <tr key={ticket.id}>
            <td>
                {ticket.title}
            </td>
            <td>
                {ticket.price}
            </td>
            <td>
                <Link href='/tickets/[ticketId]' as={`/tickets/${ticket.id}`}>
                    More Details
                </Link>
            </td>
        </tr>
    ))

    return (
        <div className="container mt-5 mt-md-3">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <h1>Tickets</h1>
                </div>
            </div>

            <div className="row justify-content-center">

                <div className="col-12 col-md-8 table-container">
                    <table className="styled-table" >
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Price</th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody>
                            {ticketsList}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    )
}

LandingPage.getInitialProps = async (context, client, currentUser) => {
    const { data } = await client.get('/api/tickets')
    return { tickets: data }
}

export default LandingPage