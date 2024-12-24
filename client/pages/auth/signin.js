import { useState } from 'react'
import useRequest from '../../hooks/use-request'
import Router from 'next/router'

const Signin = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const { doRequest, errors } = useRequest({
        url: '/api/users/signin',
        method: 'post',
        body: { email, password },
        onSuccess: () => Router.push('/')
    })
    const onSubmit = async (e) => {
        e.preventDefault()
        await doRequest()
    }
    return (
        <form onSubmit={onSubmit}>
            <div className='container mt-md-3 mt-5'>
                <div className='row justify-content-center'>
                    <div className='col-md-6'>

                        <div className='row justify-content-center'>
                            <div className='col-auto'>
                                <h1> GitTix </h1>
                            </div>
                        </div>
                        <div className='form-group'>
                            <label>Email</label>
                            <input className='form-control' value={email} onChange={e => setEmail(e.target.value)} />
                        </div>

                        <div className='form-group'>
                            <label>Password</label>
                            <input type='password' className='form-control' value={password} onChange={e => setPassword(e.target.value)} />
                        </div>

                        {errors}

                        <div className='row justify-content-center mt-2'>
                            <div className='col-8 col-md-6'>
                                <button className='custom-btn'>Sign In</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default Signin;