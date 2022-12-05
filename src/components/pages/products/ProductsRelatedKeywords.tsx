import { useCallback, useEffect } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Chip } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Skeleton } from '@components/UI/atoms';

import type { RelatedKeyword } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { fetchSearchOptions } from '@api/product';

import queryKeys from '@constants/queryKeys';
import {
  APP_DOWNLOAD_BANNER_HEIGHT,
  APP_TOP_STATUS_HEIGHT,
  RELATED_KEYWORDS_HEIGHT
} from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import {
  filterOperationInfoSelector,
  isRelatedKeywordState,
  productsFilterProgressDoneState,
  searchParamsStateFamily
} from '@recoil/productsFilter';
import { showAppDownloadBannerState } from '@recoil/common';

function ProductsRelatedKeywords() {
  // const {
  //   theme: { zIndex }
  // } = useTheme();
  const router = useRouter();
  const { keyword = '', ...query } = router.query;
  const atomParam = router.asPath.split('?')[0];

  const progressDone = useRecoilValue(productsFilterProgressDoneState);
  const { selectedSearchOptionsHistory } = useRecoilValue(filterOperationInfoSelector);
  const { searchParams: searchOptionsParams } = useRecoilValue(
    searchParamsStateFamily(`searchOptions-${atomParam}`)
  );
  const setIsRelatedKeyword = useSetRecoilState(isRelatedKeywordState);
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

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

  useEffect(() => {
    setIsRelatedKeyword(
      !!(!progressDone || relatedKeywords.length > 0) && selectedSearchOptionsHistory.length === 0
    );
  }, [
    progressDone,
    relatedKeywords.length,
    selectedSearchOptionsHistory.length,
    setIsRelatedKeyword
  ]);

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
            pathname: router.pathname.replace('[keyword]', `${keyword} ${relatedKeyword}`).trim(),
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
      <KeywordWrapper
        showAppDownloadBanner={showAppDownloadBanner}
        layoutHeight={isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0}
      >
        <KeywordList>
          {!progressDone
            ? Array.from({ length: 10 }, (_, index) => (
                <Skeleton
                  // eslint-disable-next-line react/no-array-index-key
                  key={`related-keyword-skeleton-${index}`}
                  height="36px"
                  minWidth={`${(index % 2) * 47 + 82}px`}
                  disableAspectRatio
                  customStyle={{ borderRadius: 18 }}
                />
              ))
            : relatedKeywords.map((relatedKeyword) => (
                <KeywordChip
                  key={`related-keyword-${relatedKeyword.keyword}`}
                  size="large"
                  variant="contained"
                  onClick={handleClick(relatedKeyword)}
                >
                  {relatedKeyword.keyword}
                </KeywordChip>
              ))}
        </KeywordList>
      </KeywordWrapper>
      {/* <Gap
        height={8}
        customStyle={{
          position: 'fixed',
          marginTop: showAppDownloadBanner ? RELATED_KEYWORDS_HEIGHT : 4,
          zIndex: zIndex.header
        }}
      /> */}
    </Wrapper>
  ) : null;
}

const Wrapper = styled.section<{ show: boolean }>`
  position: relative;
  min-height: ${({ show }) => (show ? RELATED_KEYWORDS_HEIGHT + 8 : 0)}px;
  opacity: ${({ show }) => Number(show)};
  visibility: ${({ show }) => (show ? 'visible' : 'hidden')};
  transition: all 0.1s ease-in-out 0s;
`;

const KeywordWrapper = styled.div<{ showAppDownloadBanner: boolean; layoutHeight: number }>`
  position: fixed;
  background-color: ${({ theme }) => theme.palette.common.uiWhite};
  min-height: ${RELATED_KEYWORDS_HEIGHT}px;
  z-index: ${({ theme }) => theme.zIndex.header};
  width: 100%;
  overflow-x: auto;
  border-bottom: 8px solid ${({ theme: { palette } }) => palette.common.ui90};
  top: ${({ showAppDownloadBanner, layoutHeight }) =>
    showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT + 56 : 56 + layoutHeight}px;
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
