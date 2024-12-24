import { useState } from "react"
import useRequest from "../../hooks/use-request"
import Router from "next/router"

const NewTicket = () => {
    const [title, setTitle] = useState('')
    const [price, setPrice] = useState('')

    const { doRequest, errors } = useRequest({
        url: '/api/tickets',
        method: 'post',
        body: {
            title: title,
            price: price
        },
        onSuccess: () => {
            Router.push('/')
        }
    })

    const onBlur = () => {
        const value = parseFloat(price)

        //if the entered value by the user is valid number
        //format it and only include 2 digits after decimal point
        if (!isNaN(value))
            setPrice(value.toFixed(2))
    }

    const onSubmit = (event) => {
        event.preventDefault()
        doRequest()
    }

    return (
        <form onSubmit={onSubmit}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 mt-5">

                        <div className="form-group">
                            <label>Title</label>
                            <input
                                className="form-control"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Price</label>
                            <input
                                className="form-control"
                                value={price}
                                onChange={e => setPrice(e.target.value)}

                                onBlur={onBlur}
                            />
                        </div>

                        {errors}

                        <div className="row justify-content-center mt-2">
                            <div className="col-8 col-md-6">
                                <button className="custom-btn">Create Ticket</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </form>
    )
}

export default NewTicket