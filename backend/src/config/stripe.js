import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

export const STRIPE_CONFIG = {
  monthlyPriceId: process.env.STRIPE_MONTHLY_PRICE_ID,
  yearlyPriceId: process.env.STRIPE_YEARLY_PRICE_ID,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
};

export default stripe;
