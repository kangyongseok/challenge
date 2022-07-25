import { memo } from 'react';
import type { MouseEvent } from 'react';

import { useRouter } from 'next/router';
import { Box, Chip, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Divider } from '@components/UI/molecules';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { pulse } from '@styles/transition';

interface ProductKeywordListProps {
  relatedKeywords?: string[];
  productId?: number;
}

function ProductKeywordList({ relatedKeywords, productId }: ProductKeywordListProps) {
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const dataRelatedKeyword = e.currentTarget.getAttribute('data-related-keyword');
    logEvent(attrKeys.products.CLICK_RECENT, {
      title: attrProperty.productTitle.RELATED,
      name: attrProperty.productName.PRODUCT_DETAIL,
      productId,
      keyword: dataRelatedKeyword
    });
    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.productName.PRODUCT,
      title: attrProperty.productTitle.DETAIL,
      type: attrProperty.productType.ETC
    });
    router.push(`/products/search/${dataRelatedKeyword}`);
  };

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
                data-related-keyword={relatedKeyword}
                onClick={handleClick}
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
