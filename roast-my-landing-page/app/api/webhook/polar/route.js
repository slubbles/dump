import { Webhooks } from "@polar-sh/nextjs";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET,
  onOrderPaid: async (payload) => {
    const order = payload.data;
    const metadata = order.metadata || {};
    const roastId = metadata.roastId;
    
    console.log(`[Polar] Order paid: ${order.id}, roastId: ${roastId}, amount: ${order.total_amount / 100}`);
    
    // In a production app with a DB, you'd mark the roast as "pro" here.
    // For now, we log it — the success page verifies via the Polar API.
  },
});
