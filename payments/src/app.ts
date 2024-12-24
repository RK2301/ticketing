import express, { json } from 'express'
import CookieSession from 'cookie-session';
import { currentUser, errorHandler, NotFoundError } from '@rkh-ms/common';
import { createChargeRouter } from './routes/new';

const app = express()
//that because the traffic is being proximate to our app
//using ingress and ngrix
//so express will trust traffic even it's come from that proxy
app.set("trust proxy", true);

app.use(json())
app.use(CookieSession({
    signed: false,
    secure: true
}))

app.use(currentUser)
app.use(createChargeRouter)

app.use('*', (req, res) => {
    throw new NotFoundError()
})
app.use(errorHandler)

export { app }
