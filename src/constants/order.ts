export const orderStatus = {
  payment: 0,
  delivery: 1,
  calculate: 2,
  refund: 3
} as const;

export const orderResult = {
  wait: 0,
  process: 1,
  success: 2,
  cancel: 3
} as const;
