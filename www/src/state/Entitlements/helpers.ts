// product IDs look like "PREM:3M_0_999"
// if the product ID is null or something weird, assume normal one-month trial
export function getTrialMonths(productId: string) {
  try {
    const monthStr = productId.split(':')[1].split('M')[0];
    const monthNum = parseInt(monthStr, 10);
    return Number.isNaN(monthNum) ? 1 : monthNum;
  } catch (e) {
    return 1;
  }
}

export function getTrialDurationString(trialMonths: number | string) {
  return trialMonths === 1 ? '30-Day' : `${trialMonths} Months`;
}
