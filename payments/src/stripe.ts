import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_KEY!, {
    //@ts-ignore
    apiVersion: '2024-12-18.acacia'
})