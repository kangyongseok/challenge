import { useRouter } from 'next/router';
import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';
// import ProductListCard from '@components/UI/molecules/ProductListCard';
import styled from '@emotion/styled';

import { ProductWishesCard } from '@components/UI/molecules';

import type { UserHistory } from '@dto/user';
import { Product } from '@dto/product';

import { logEvent } from '@library/amplitude';

// import { FIRST_CATEGORIES } from '@constants/category';
import { CAMEL_SUBSET_FONTFAMILY } from '@constants/common';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

interface HistoryDateItemProps {
  date: string;
  userHistories: UserHistory[];
}

function HistoryDateItem({ date, userHistories }: HistoryDateItemProps) {
  const {
    theme: {
      palette: { common }
    }
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
    <Box customStyle={{ marginTop: 39 }}>
      <Typography
        variant="h4"
        weight="bold"
        customStyle={{
          marginBottom: 20,
          color: common.ui20
        }}
      >
        {date}
      </Typography>
      <Box>
        <TimeLineWrap direction="vertical" gap={20}>
          {userHistories.map((userHistory, i) => {
            const { type, product } = userHistory;
            if (type === 'PV') {
              return (
                <ProductWishesCard
                  iconType="heart"
                  key={`user-history-product-PV-${product.id}`}
                  product={product}
                  wishAtt={handleWishAtt(product, i)}
                  source={attrProperty.productSource.RECENT_LIST}
                  name={attrProperty.productName.RECENT_LIST}
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
                />
              );
            }
            if (type === 'SE') {
              return (
                <KeywordFlexbox
                  alignment="center"
                  key={`user-history-product-SE-${userHistory.dateTime}`}
                  gap={24}
                  onClick={() => {
                    logEvent(attrKeys.wishes.CLICK_PRODUCT_LIST, {
                      name: attrProperty.productName.RECENT_LIST
                    });

                    router.push({
                      pathname: `/products/search/${userHistory.message}`
                    });
                  }}
                >
                  <KeywordTypo variant="small1" weight="medium">
                    검색어
                  </KeywordTypo>
                  <Typography
                    weight="medium"
                    variant="h4"
                    customStyle={{ fontFamily: CAMEL_SUBSET_FONTFAMILY }}
                  >
                    {userHistory.message}
                  </Typography>
                </KeywordFlexbox>
              );
            }
            return null;
          })}
        </TimeLineWrap>
      </Box>
    </Box>
  );
}

const TimeLineWrap = styled(Flexbox)`
  padding: 0 0 32px 14px;
  border-left: 1px solid ${({ theme: { palette } }) => palette.common.ui90};
`;

const KeywordTypo = styled(Typography)`
  color: ${({ theme: { palette } }) => palette.primary.dark};
  background: ${({ theme: { palette } }) => palette.primary.bgLight};
  padding: 6px 8px;
  border-radius: ${({ theme: { box } }) => box.round['24']};
  min-width: 48px;
`;

const KeywordFlexbox = styled(Flexbox)`
  position: relative;
  &::before {
    content: '';
    width: 5px;
    height: 5px;
    background: ${({ theme: { palette } }) => palette.primary.dark};
    position: absolute;
    top: 35%;
    left: -17px;
    border-radius: 50%;
  }
`;

export default HistoryDateItem;
