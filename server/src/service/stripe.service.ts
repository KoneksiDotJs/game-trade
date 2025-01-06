import prisma from "../config/db";
import stripe from "../config/stripe";

export class StripeService {
  async createPaymentIntent(transactionId: number, amount: number) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents
      currency: "usd",
      metadata: { transactionId: transactionId.toString() },
    });

    await prisma.transaction.update({
      where: { id: transactionId },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return paymentIntent;
  }

  async cancelPaymentIntent(paymentIntentId: string) {
    await stripe.paymentIntents.cancel(paymentIntentId);
  }

  async handleWebhookEvent(event: any) {
    switch (event.type) {
      case "payment_intent.succeeded":
        await this.handlePaymentSuccess(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await this.handlePaymentFailure(event.data.object);
        break;
    }
  }

  private async handlePaymentSuccess(paymentIntent: any) {
    await prisma.transaction.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        status: "COMPLETED",
        paymentStatus: "paid",
        completedAt: new Date(),
      },
    });
  }

  private async handlePaymentFailure(paymentIntent: any) {
    await prisma.transaction.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        status: "CANCELLED",
        paymentStatus: "failed",
      },
    });
  }
}
