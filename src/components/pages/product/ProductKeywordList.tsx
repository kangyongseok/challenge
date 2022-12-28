import { memo } from 'react';
import type { MouseEvent } from 'react';

import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Chip, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import { debounce } from 'lodash-es';
import styled from '@emotion/styled';

// import { Divider } from '@components/UI/molecules';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchRelatedKeywords } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { SearcgRelatedKeywordsParams } from '@typings/products';

// import { pulse } from '@styles/transition';

interface ProductKeywordListProps {
  productId?: number;
  params: SearcgRelatedKeywordsParams;
}

function ProductKeywordList({ productId, params }: ProductKeywordListProps) {
  const {
    theme: {
      palette: { primary, secondary, common }
    }
  } = useTheme();
  const router = useRouter();
  const { data } = useQuery(
    queryKeys.products.searchRelatedKeyword(params),
    () => fetchRelatedKeywords(params),
    {
      enabled: !!params.quoteTitle
    }
  );

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

  const handleClickScroll = debounce(() => {
    logEvent(attrKeys.products.SWIPE_X_RECENT, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: attrProperty.title.RELATED
    });
  }, 300);

  const line01 = data?.slice(0, 6);
  const line02 =
    data && (data as string[]).length > 6
      ? data?.slice(7, data.length < 13 ? data.length : 13)
      : [];

  const keywordBgColor = [primary.main, secondary.blue.main, secondary.purple.main];

  return (
    <Box customStyle={{ marginTop: 20 }}>
      <Typography variant="h3" weight="bold">
        같이 찾아본 키워드에요
      </Typography>
      <KeywordWrap direction="vertical" gap={8} onScroll={handleClickScroll}>
        <Flexbox alignment="center" customStyle={{ flexWrap: 'nowrap' }} gap={6}>
          {line01?.map((relatedKeyword: string) => (
            <Chip
              key={`related-keyword-${relatedKeyword}`}
              size="medium"
              variant="solid"
              customStyle={{
                flexWrap: 'wrap',
                whiteSpace: 'nowrap',
                background: keywordBgColor[Math.floor(Math.random() * 3)],
                color: common.uiWhite
              }}
              data-related-keyword={relatedKeyword}
              onClick={handleClick}
            >
              {relatedKeyword}
            </Chip>
          ))}
        </Flexbox>
        <Flexbox alignment="center" gap={6} customStyle={{ flexWrap: 'nowrap' }}>
          {line02?.map((relatedKeyword: string) => (
            <Chip
              key={`related-keyword-${relatedKeyword}`}
              size="medium"
              variant="solid"
              customStyle={{
                flexWrap: 'wrap',
                whiteSpace: 'nowrap',
                background: keywordBgColor[Math.floor(Math.random() * 3)],
                color: common.uiWhite
              }}
              data-related-keyword={relatedKeyword}
              onClick={handleClick}
            >
              {relatedKeyword}
            </Chip>
          ))}
        </Flexbox>
      </KeywordWrap>
      {/* <KeywordList>
        {relatedKeywords
          ? line01?.map((relatedKeyword) => (
              <Chip
                key={`related-keyword-${relatedKeyword}`}
                size="small"
                variant="ghost"
                brandColor="black"
                customStyle={{ flexWrap: 'wrap', whiteSpace: 'nowrap' }}
                data-related-keyword={relatedKeyword}
                onClick={handleClick}
              >
                {relatedKeyword}
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
      </KeywordList> */}
    </Box>
  );
}

const KeywordWrap = styled(Flexbox)`
  margin: 20px 0 0 -20px;
  width: calc(100% + 40px);
  overflow: auto;
  padding: 0 20px 32px;
  /* margin-bottom: 32px; */
  border-bottom: 8px solid ${({ theme: { palette } }) => palette.common.bg02};
`;

export default memo(ProductKeywordList);
