import { RequestHandler } from "express";
import { StripeService } from "../service/stripe.service";
import stripe from "../config/stripe";
import { config } from "../config/env";

const stripeService = new StripeService();

export const handleWebhook: RequestHandler = async(req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig as string,
            config.stripeWebhookSecret
        )

        await stripeService.handleWebhookEvent(event)

        res.json({ received: true })
    } catch (error: any) {
        res.status(400).send(`Webhook Error: ${error.message}`)
    }
}