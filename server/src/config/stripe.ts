import Stripe from "stripe";
import { config } from "./env";

if (config.stripeApiSecret) throw new Error("Stripe API key is missing");

const stripe = new Stripe(config.stripeApiSecret, {
    apiVersion: '2024-12-18.acacia'
})

export default stripe;