export const SUBSCRIPTION_DURATION_DAYS = 34;

export const SUBSCRIPTION_PLANS = [
  { id: 1, name: 'Plan 1', priceUsd: 5_200, dailyCreditUsd: 100_000, totalCreditUsd: 3_400_000 },
  { id: 2, name: 'Plan 2', priceUsd: 7_200, dailyCreditUsd: 120_000, totalCreditUsd: 4_080_000 },
  { id: 3, name: 'Plan 3', priceUsd: 12_000, dailyCreditUsd: 220_000, totalCreditUsd: 7_480_000 }
] as const;

export const getSubscriptionPlan = (planId: number) =>
  SUBSCRIPTION_PLANS.find((plan) => plan.id === planId);
