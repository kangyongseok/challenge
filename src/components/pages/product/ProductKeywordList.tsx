import { memo } from 'react';

import { useRouter } from 'next/router';
import { Box, Chip, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Divider } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { pulse } from '@styles/transition';

interface ProductKeywordListProps {
  relatedKeywords?: string[];
  productId?: number;
}

function ProductKeywordList({ relatedKeywords, productId }: ProductKeywordListProps) {
  const router = useRouter();

  return (
    <Box customStyle={{ marginTop: 32 }}>
      <Typography variant="h4" weight="bold">
        키워드로 검색
      </Typography>
      <KeywordList>
        {relatedKeywords
          ? relatedKeywords.map((relatedKeyword) => (
              <Chip
                key={`related-keyword-${relatedKeyword}`}
                size="small"
                variant="ghost"
                brandColor="black"
                customStyle={{ flexWrap: 'wrap', whiteSpace: 'nowrap' }}
                onClick={() => {
                  logEvent(attrKeys.products.CLICK_RECENT, {
                    title: attrProperty.productTitle.RELATED,
                    name: attrProperty.productName.PRODUCT_DETAIL,
                    productId,
                    keyword: relatedKeyword
                  });
                  router.push(`/products/search/${relatedKeyword}`);
                }}
              >
                #{relatedKeyword}
              </Chip>
            ))
          : Array.from({ length: 5 }, (_, index) => (
              <Chip
                key={`related-keyword-loading-${index}`}
                size="small"
                variant="ghost"
                brandColor="black"
                customStyle={{
                  minWidth: 100,
                  animation: `${pulse} 800ms linear 0s infinite alternate`
                }}
              />
            ))}
      </KeywordList>
      <Divider />
    </Box>
  );
}

const KeywordList = styled.div`
  display: flex;
  flex-wrap: wrap;
  overflow-x: auto;
  margin-top: 16px;
  column-gap: 6px;
  row-gap: 8px;
`;

export default memo(ProductKeywordList);
