/**
 * Trikonekt Prime Membership Helper
 * Handles plan state, entitlements, and subscription validation
 */

export const PLAN_TYPES = {
  FREE: 'FREE',
  SUBSCRIPTION_750: 'SUBSCRIPTION_750',
  SUBSCRIPTION_99: 'SUBSCRIPTION_99',
};

export function getMerchantPlan() {
  const plan = localStorage.getItem('merchant_plan');
  if (plan === PLAN_TYPES.SUBSCRIPTION_750 || plan === PLAN_TYPES.SUBSCRIPTION_99) {
    return plan;
  }
  return PLAN_TYPES.FREE;
}

export function getSubscriptionDetails() {
  const plan = getMerchantPlan();
  const startedAt = localStorage.getItem('subscription_started_at');
  const expiresAt = localStorage.getItem('subscription_expires_at');
  const tenureMonths = Number(localStorage.getItem('subscription_tenure_months') || 0);
  const triCoins = Number(localStorage.getItem('merchant_tri_coins') || 0);

  let daysLeft = 0;
  let isExpired = false;

  if (expiresAt) {
    const diff = new Date(expiresAt).getTime() - Date.now();
    daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    isExpired = daysLeft <= 0;
  }

  const isPrime = (plan === PLAN_TYPES.SUBSCRIPTION_750 || plan === PLAN_TYPES.SUBSCRIPTION_99) && !isExpired;

  return {
    plan,
    isPrime,
    isExpired,
    daysLeft,
    startedAt,
    expiresAt,
    tenureMonths,
    triCoins,
  };
}

export function activateMerchantSubscription(planType) {
  const now = new Date();
  if (planType === PLAN_TYPES.SUBSCRIPTION_750) {
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem('merchant_plan', PLAN_TYPES.SUBSCRIPTION_750);
    localStorage.setItem('subscription_started_at', now.toISOString());
    localStorage.setItem('subscription_expires_at', expiresAt);
    localStorage.setItem('merchant_tri_coins', '615.00');
    return {
      success: true,
      message: '₹750 Yearly Subscription activated! 615 TRI Coins credited.',
      plan: PLAN_TYPES.SUBSCRIPTION_750,
      expiresAt,
    };
  } else if (planType === PLAN_TYPES.SUBSCRIPTION_99) {
    const prevTenure = Number(localStorage.getItem('subscription_tenure_months') || 0);
    const newTenure = Math.min(12, prevTenure + 1);
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem('merchant_plan', PLAN_TYPES.SUBSCRIPTION_99);
    localStorage.setItem('subscription_started_at', now.toISOString());
    localStorage.setItem('subscription_expires_at', expiresAt);
    localStorage.setItem('subscription_tenure_months', String(newTenure));
    const currentCoins = Number(localStorage.getItem('merchant_tri_coins') || 0);
    localStorage.setItem('merchant_tri_coins', (currentCoins + 81.18).toFixed(2));
    return {
      success: true,
      message: `₹99 Monthly Subscription activated for Month ${newTenure} of 12! 81.18 TRI Coins credited.`,
      plan: PLAN_TYPES.SUBSCRIPTION_99,
      expiresAt,
      tenureMonths: newTenure,
    };
  }
  return { success: false, message: 'Invalid plan type' };
}

export function isMerchantPrime() {
  const details = getSubscriptionDetails();
  return details.isPrime;
}
