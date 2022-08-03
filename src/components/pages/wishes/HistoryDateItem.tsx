import { useRouter } from 'next/router';
import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import ProductListCard from '@components/UI/molecules/ProductListCard';

import type { UserHistory } from '@dto/user';
import { Product } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

interface HistoryDateItemProps {
  date: string;
  userHistories: UserHistory[];
}

function HistoryDateItem({ date, userHistories }: HistoryDateItemProps) {
  const {
    theme: { palette }
  } = useTheme();
  const router = useRouter();

  const handleWishAtt = (product: Product, i: number) => {
    return {
      name: attrProperty.productName.RECENT_LIST,
      id: product.id,
      index: i + 1,
      brand: product.brand.name,
      category: product.category.name,
      parentId: product.category.parentId,
      line: product.line,
      site: product.site.name,
      price: product.price,
      scoreTotal: product.scoreTotal,
      cluster: product.cluster,
      source: attrProperty.productSource.RECENT_LIST
    };
  };

  return (
    <Box
      customStyle={{
        padding: '20px 0 12px 0'
      }}
    >
      <Typography
        variant="body2"
        weight="bold"
        customStyle={{
          marginBottom: 20,
          color: palette.common.grey['40']
        }}
      >
        {date}
      </Typography>
      <Flexbox direction="vertical" gap={12}>
        {userHistories.map((userHistory, i) => {
          const { type, product } = userHistory;
          if (type === 'PV') {
            return (
              <ProductListCard
                key={`user-history-product-PV-${product.id}`}
                product={product}
                wishAtt={handleWishAtt(product, i)}
                productAtt={{
                  name: attrProperty.productName.RECENT_LIST,
                  index: i + 1,
                  id: product.id,
                  brand: product.brand.name,
                  category: product.category.name,
                  parentCategory: FIRST_CATEGORIES[product.category.id as number],
                  line: product.line,
                  site: product.site.name,
                  price: product.price,
                  scoreTotal: product.scoreTotal,
                  scoreStatus: product.scoreStatus,
                  scoreSeller: product.scoreSeller,
                  scorePrice: product.scorePrice,
                  scorePriceAvg: product.scorePriceAvg,
                  scorePriceCount: product.scorePriceCount,
                  scorePriceRate: product.scorePriceRate,
                  source: attrProperty.productSource.RECENT_LIST
                }}
                source={attrProperty.productSource.RECENT_LIST}
                name={attrProperty.productName.RECENT_LIST}
                isRound
              />
            );
          }
          if (type === 'SE') {
            return (
              <Flexbox
                key={`user-history-product-SE-${userHistory.dateTime}`}
                gap={24}
                onClick={() => {
                  logEvent(attrKeys.wishes.CLICK_SEARCHMODAL, {
                    name: attrProperty.productName.RECENT_LIST,
                    att: 'CONTENT'
                  });
                  router.push({
                    pathname: '/search',
                    query: {
                      keyword: userHistory.message
                    }
                  });
                }}
              >
                <Typography
                  weight="bold"
                  variant="body2"
                  customStyle={{
                    color: palette.common.grey['60']
                  }}
                >
                  검색어
                </Typography>
                <Typography
                  weight="bold"
                  variant="body2"
                  customStyle={{
                    color: palette.common.grey['20']
                  }}
                >
                  {userHistory.message}
                </Typography>
              </Flexbox>
            );
          }
          return null;
        })}
      </Flexbox>
    </Box>
  );
}

export default HistoryDateItem;
