import express from 'express';
import Stripe from 'stripe';
import prisma from '../config/database.js';
import { STRIPE_CONFIG } from '../config/stripe.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe webhook - needs raw body
router.post('/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        STRIPE_CONFIG.webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          await handleCheckoutComplete(session);
          break;
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object;
          await handleSubscriptionUpdated(subscription);
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          await handleSubscriptionDeleted(subscription);
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object;
          await handlePaymentSucceeded(invoice);
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object;
          await handlePaymentFailed(invoice);
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook handler error:', error);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  }
);

async function handleCheckoutComplete(session) {
  const { userId, plan } = session.metadata;

  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  // Get full subscription details from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(
    session.subscription
  );

  // Create or update subscription in database
  await prisma.subscription.upsert({
    where: { userId },
    update: {
      plan: plan,
      status: 'ACTIVE',
      stripeSubscriptionId: session.subscription,
      stripePriceId: stripeSubscription.items.data[0]?.price.id,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
    },
    create: {
      userId,
      plan: plan,
      status: 'ACTIVE',
      stripeSubscriptionId: session.subscription,
      stripePriceId: stripeSubscription.items.data[0]?.price.id,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
    }
  });

  console.log(`Subscription created for user ${userId}`);
}

async function handleSubscriptionUpdated(subscription) {
  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id }
  });

  if (!dbSubscription) {
    console.log('Subscription not found in database');
    return;
  }

  let status = 'ACTIVE';
  if (subscription.status === 'canceled') status = 'CANCELLED';
  if (subscription.status === 'past_due') status = 'EXPIRED';
  if (subscription.cancel_at_period_end) status = 'CANCELLED';

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    }
  });
}

async function handleSubscriptionDeleted(subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: 'CANCELLED' }
  });
}

async function handlePaymentSucceeded(invoice) {
  if (invoice.subscription) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: invoice.subscription },
      data: { status: 'ACTIVE' }
    });
  }
}

async function handlePaymentFailed(invoice) {
  if (invoice.subscription) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: invoice.subscription },
      data: { status: 'EXPIRED' }
    });
  }
}

export default router;
