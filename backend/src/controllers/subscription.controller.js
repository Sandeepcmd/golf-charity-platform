import prisma from '../config/database.js';
import stripe, { STRIPE_CONFIG } from '../config/stripe.js';
import { AppError } from '../middleware/error.middleware.js';

export const createCheckoutSession = async (req, res, next) => {
  try {
    const { plan } = req.body; // 'MONTHLY' or 'YEARLY'
    const user = req.user;

    // Check if user already has active subscription
    if (user.subscription && user.subscription.status === 'ACTIVE') {
      throw new AppError('Already have an active subscription', 400);
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: { userId: user.id }
      });

      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      });
    }

    // Get price ID based on plan
    const priceId = plan === 'YEARLY'
      ? STRIPE_CONFIG.yearlyPriceId
      : STRIPE_CONFIG.monthlyPriceId;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?subscription=cancelled`,
      metadata: {
        userId: user.id,
        plan
      }
    });

    res.json({
      success: true,
      data: { sessionId: session.id, url: session.url }
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscription = async (req, res, next) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (!subscription) {
      return res.json({
        success: true,
        data: null
      });
    }

    // Get Stripe subscription details if exists
    let stripeDetails = null;
    if (subscription.stripeSubscriptionId) {
      try {
        stripeDetails = await stripe.subscriptions.retrieve(
          subscription.stripeSubscriptionId
        );
      } catch (e) {
        console.error('Error fetching Stripe subscription:', e);
      }
    }

    res.json({
      success: true,
      data: {
        ...subscription,
        stripeDetails
      }
    });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (!subscription) {
      throw new AppError('No subscription found', 404);
    }

    if (subscription.stripeSubscriptionId) {
      // Cancel at period end (user keeps access until end of billing period)
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      });
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'CANCELLED' }
    });

    res.json({
      success: true,
      message: 'Subscription will be cancelled at end of billing period'
    });
  } catch (error) {
    next(error);
  }
};

export const resumeSubscription = async (req, res, next) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (!subscription) {
      throw new AppError('No subscription found', 404);
    }

    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false
      });
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'ACTIVE' }
    });

    res.json({
      success: true,
      message: 'Subscription resumed successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const createBillingPortalSession = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user.stripeCustomerId) {
      throw new AppError('No billing information found', 404);
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`
    });

    res.json({
      success: true,
      data: { url: session.url }
    });
  } catch (error) {
    next(error);
  }
};

// Sync subscription from Stripe (for local development without webhooks)
export const syncSubscription = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user.stripeCustomerId) {
      return res.json({
        success: true,
        data: null,
        message: 'No Stripe customer found'
      });
    }

    // Get customer's subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
      limit: 1
    });

    if (subscriptions.data.length === 0) {
      // Check for any subscription (including trialing, past_due)
      const allSubs = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        limit: 1
      });

      if (allSubs.data.length === 0) {
        return res.json({
          success: true,
          data: null,
          message: 'No subscription found in Stripe'
        });
      }
    }

    const stripeSub = subscriptions.data[0] || (await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      limit: 1
    })).data[0];

    if (!stripeSub) {
      return res.json({
        success: true,
        data: null,
        message: 'No subscription found'
      });
    }

    // Determine plan from price
    const priceId = stripeSub.items.data[0]?.price.id;
    const plan = priceId === STRIPE_CONFIG.yearlyPriceId ? 'YEARLY' : 'MONTHLY';

    // Upsert subscription in database
    const subscription = await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        plan,
        status: 'ACTIVE',
        stripeSubscriptionId: stripeSub.id,
        stripePriceId: priceId,
        currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000)
      },
      create: {
        userId: user.id,
        plan,
        status: 'ACTIVE',
        stripeSubscriptionId: stripeSub.id,
        stripePriceId: priceId,
        currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000)
      }
    });

    res.json({
      success: true,
      data: subscription,
      message: 'Subscription synced successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getPlans = async (req, res, next) => {
  try {
    const config = await prisma.prizePoolConfig.findFirst({
      where: { active: true }
    });

    // Default prices if no config exists
    const plans = {
      monthly: {
        id: 'MONTHLY',
        name: 'Monthly',
        price: config?.monthlyPrice || 9.99,
        interval: 'month',
        features: [
          'Enter monthly prize draws',
          'Track your golf scores',
          'Support your chosen charity',
          'Win amazing cash prizes'
        ]
      },
      yearly: {
        id: 'YEARLY',
        name: 'Yearly',
        price: config?.yearlyPrice || 99.99,
        interval: 'year',
        savings: '17%',
        features: [
          'All monthly features',
          'Save 17% annually',
          'Priority support',
          'Exclusive yearly member benefits'
        ]
      }
    };

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    next(error);
  }
};
