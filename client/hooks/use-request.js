import axios from "axios";
import { useState } from "react";

const useRequest = ({ url, method, body, onSuccess }) => {
    const [errors, setErrors] = useState(null)

    const doRequest = async (props = {}) => {
        try {
            setErrors(null)
            const res = await axios[method](url, { ...body, ...props })

            if (onSuccess)
                onSuccess(res.data)
        } catch (err) {
            console.log('Error: ');
            console.error(err);
            //return JSX blocks with errors
            setErrors(
                <div className='alert alert-danger mt-1'>
                    <ul className='my-0'>
                        {err.response?.data.errors?.map(err => <li key={err.message}> {err.message} </li>)}
                    </ul>
                </div>
            )
        }
    }

    return { doRequest, errors }
}

export default useRequest