import type { NextApiRequest, NextApiResponse } from 'next';

import { PLATFORMS, PRODUCT_DEAL_INFO, PRODUCT_STATES } from '@constants/product';

const MIN_NUMBER = 10000;
const MAX_NUMBER = 99999;
const PRICE_RANGE = 0.05;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'GET') {
      const baseProductDealInfos = Object.keys(PRODUCT_DEAL_INFO)
        .flatMap((type) =>
          PRODUCT_DEAL_INFO[type as keyof typeof PRODUCT_DEAL_INFO].map(
            ({ name: productName, price: productPrice }) => {
              const platform = PLATFORMS[type as keyof typeof PRODUCT_DEAL_INFO];
              const pickRandomPlatform = platform[Math.floor(Math.random() * platform.length)];
              const state = PRODUCT_STATES[type as keyof typeof PRODUCT_DEAL_INFO];
              const minPrice = productPrice - productPrice * PRICE_RANGE;
              const maxPrice = productPrice + productPrice * PRICE_RANGE;
              const probability = Math.random();

              return {
                userId: Math.round(
                  Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER
                ),
                platform: {
                  name: pickRandomPlatform.name,
                  filename: pickRandomPlatform.filename,
                  weight:
                    Number((Math.random() * 5 + 1).toFixed(1)) *
                    (pickRandomPlatform.importance ? 1.5 : 1)
                },
                product: {
                  name: productName,
                  state: state[Math.floor(Math.random() * state.length)],
                  price: Math.floor(
                    Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice
                  )
                },
                time:
                  probability < 0.3
                    ? Math.floor(Math.random() * 8) + 1
                    : Math.floor(Math.random() * 59) + 1,
                timeUnit: probability < 0.3 ? '시간 전' : '분 전'
              };
            }
          )
        )
        .sort((a, b) => {
          if (b.platform.weight === a.platform.weight) {
            return Math.random() < 0.5 ? -1 : 1;
          }

          return b.platform.weight - a.platform.weight;
        });

      res.statusCode = 200;
      return res.send(baseProductDealInfos);
    }
  } catch {
    res.statusCode = 500;
    return res.end();
  }
  res.statusCode = 404;
  return res.end();
};
