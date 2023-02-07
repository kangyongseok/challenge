import { useCallback } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Chip, Skeleton } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import type { RelatedKeyword } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { fetchSearchOptions } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { RELATED_KEYWORDS_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  filterOperationInfoSelector,
  productsFilterProgressDoneState,
  searchParamsStateFamily
} from '@recoil/productsFilter';

function ProductsRelatedKeywords() {
  const router = useRouter();
  const { keyword = '', ...query } = router.query;
  const atomParam = router.asPath.split('?')[0];

  const progressDone = useRecoilValue(productsFilterProgressDoneState);
  const { selectedSearchOptionsHistory } = useRecoilValue(filterOperationInfoSelector);
  const { searchParams: searchOptionsParams } = useRecoilValue(
    searchParamsStateFamily(`searchOptions-${atomParam}`)
  );

  const { data: { relatedKeywords = [] } = {} } = useQuery(
    queryKeys.products.searchOptions(searchOptionsParams),
    () => fetchSearchOptions(searchOptionsParams),
    {
      keepPreviousData: true,
      enabled: Object.keys(searchOptionsParams).length > 0,
      staleTime: 5 * 60 * 1000,
      onSuccess(response) {
        if (selectedSearchOptionsHistory.length === 0) {
          const [relatedKeyword] = response.relatedKeywords || [];
          let title = attrProperty.title.brand;
          if (relatedKeyword?.categoryId) title = attrProperty.title.category;
          if (relatedKeyword?.lineId) title = attrProperty.title.line;

          if (response.relatedKeywords.length > 0) {
            logEvent(attrKeys.products.viewRecommKeyword, {
              name: attrProperty.name.productList,
              title
            });
          }
        }
      }
    }
  );

  const handleClick = useCallback(
    ({ keyword: relatedKeyword, ...rest }: RelatedKeyword) =>
      () => {
        let title = attrProperty.title.brand;

        if (rest.categoryId) title = attrProperty.title.category;
        if (rest.lineId) title = attrProperty.title.line;

        logEvent(attrKeys.products.clickRecommKeyword, {
          name: attrProperty.name.productList,
          title,
          att: relatedKeyword
        });
        router.push(
          {
            pathname: `/products/search/${String(keyword || '').replace(
              ` ${relatedKeyword}`,
              ''
            )} ${relatedKeyword}`,
            query
          },
          undefined,
          { shallow: true }
        );
      },
    [keyword, query, router]
  );

  return !progressDone || relatedKeywords.length > 0 ? (
    <Wrapper show={selectedSearchOptionsHistory.length === 0}>
      <KeywordWrapper>
        <KeywordList>
          {!progressDone
            ? Array.from({ length: 10 }, (_, index) => (
                <Skeleton
                  // eslint-disable-next-line react/no-array-index-key
                  key={`related-keyword-skeleton-${index}`}
                  height={36}
                  minWidth={(index % 2) * 47 + 82}
                  round={18}
                  disableAspectRatio
                />
              ))
            : relatedKeywords.map((relatedKeyword, index) => (
                <KeywordChip
                  // eslint-disable-next-line react/no-array-index-key
                  key={`related-keyword-${relatedKeyword.keyword}-${index}`}
                  size="large"
                  variant="solid"
                  onClick={handleClick(relatedKeyword)}
                >
                  {relatedKeyword.keyword}
                </KeywordChip>
              ))}
        </KeywordList>
      </KeywordWrapper>
    </Wrapper>
  ) : null;
}

const Wrapper = styled.section<{ show: boolean }>`
  position: relative;
  height: ${({ show }) => (show ? RELATED_KEYWORDS_HEIGHT : 0)}px;
  opacity: ${({ show }) => Number(show)};
  visibility: ${({ show }) => (show ? 'visible' : 'hidden')};
  transition: all 0.1s ease-in-out 0s;
`;

const KeywordWrapper = styled.div`
  background-color: ${({ theme }) => theme.palette.common.uiWhite};
  width: 100%;
  overflow-x: auto;
`;

const KeywordList = styled.div`
  padding: 4px 16px 12px;
  display: flex;
  align-items: center;
  column-gap: 6px;
  width: fit-content;
`;

const KeywordChip = styled(Chip)`
  background-color: ${({ theme: { palette } }) => palette.primary.light};
  white-space: nowrap;
  font-weight: ${({ theme: { typography } }) => typography.h4.weight.regular};
`;

export default ProductsRelatedKeywords;
