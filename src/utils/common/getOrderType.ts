export default function getOrderType(type: 0 | 1 | 2) {
  let newType = type === 1 ? 'LOCAL' : 'DELIVERY';

  if (type === 2) newType = 'OPERATOR';

  return newType;
}
