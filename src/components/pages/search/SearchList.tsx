import type { MouseEvent } from 'react';
import { Fragment } from 'react';

import { useRecoilValue } from 'recoil';
import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import type { SuggestKeyword } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/common';
import capitalize from '@utils/capitalize';

import type { SelectItem, TotalSearchItem } from '@typings/search';
import { showAppDownloadBannerState } from '@recoil/common';

import SearchHelperBanner from './SearchHelperBanner';

interface SearchListProps {
  searchResult: SuggestKeyword[];
  onClick: (parameter: TotalSearchItem) => void;
  onClickCategory: (parameter: SelectItem) => void;
}

function SearchList({ searchResult, onClick, onClickCategory }: SearchListProps) {
  const {
    theme: { palette }
  } = useTheme();
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const categoryKeywordList = searchResult.filter((result) => result.type === 0);
  const brandKeywordList = searchResult.filter((item) => item.type === 2 && !!item.keywordBrand);

  const parserKeyword = (keyword: string) =>
    keyword.split('>').map((word, i) => (
      <Flexbox key={`keyword-${word}`} alignment="center">
        {word.replace('(P)', '')}
        {i + 1 < keyword.split('>').length && (
          <Icon
            name="CaretRightOutlined"
            color={palette.common.grey['20']}
            size="small"
            customStyle={{ margin: '0 5px' }}
          />
        )}
      </Flexbox>
    ));

  const handleClickBrand =
    ({ keyword, item }: { keyword: string; item: SuggestKeyword }) =>
    () => {
      logEvent(attrKeys.search.CLICK_BANNERB, { name: 'SEARCH' });
      onClick({
        keyword,
        title: 'BANNERB',
        keywordItem: item
      });
    };

  const handleClickList = (e: MouseEvent<HTMLLIElement>) => {
    const target = e.currentTarget;
    logEvent(attrKeys.search.CLICK_AUTO, {
      name: 'SEARCH',
      type: 'KEYWORD',
      index: target.dataset.index,
      keyword: target.dataset.keyword,
      count: target.dataset.count
    });

    onClick({
      keyword: target.dataset.keyword || '',
      title: 'AUTO',
      keywordItem: JSON.parse(target.dataset.item as string),
      count: Number(target.dataset.count),
      brandId: Number(target.dataset.brandId),
      categoryId: Number(target.dataset.categoryId),
      type: 'auto'
    });
  };

  const handleClickMap = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget as HTMLDivElement;
    const genders = (target.dataset.keyword as string).split('>')[0] === '남성' ? 'male' : 'female';

    logEvent(attrKeys.search.CLICK_AUTO, {
      name: 'SEARCH',
      type: 'CATEGORY',
      index: target.dataset.index,
      keyword: target.dataset.keyword?.replace('(P)', ''),
      count: target.dataset.count
    });

    onClickCategory({
      keyword: '',
      parentIds: String(target.dataset.parentId) || '',
      subParentIds: String(target.dataset.subId) || '',
      categoryKeyword: target.dataset.keyword,
      genders
    });
  };

  const searchHelperKeyword = ((categoryKeywordList.length > 0 && categoryKeywordList) ||
    (brandKeywordList.length > 0 && brandKeywordList) ||
    searchResult)[0];

  return (
    <>
      {!!searchHelperKeyword && (
        <SearchHelperBanner
          keyword={searchHelperKeyword.keyword}
          brandName={brandKeywordList.length > 0 ? searchHelperKeyword.brandName : undefined}
          brandId={brandKeywordList.length > 0 ? searchHelperKeyword.brandId : undefined}
          categoryName={
            (categoryKeywordList.length > 0
              ? searchHelperKeyword.keyword.substring(
                  searchHelperKeyword.keyword.lastIndexOf('>') + 1
                )
              : searchHelperKeyword.categoryName) ?? undefined
          }
          parentId={searchHelperKeyword.parentId ?? undefined}
          subParentId={searchHelperKeyword.subParentId ?? undefined}
        />
      )}
      <Flexbox component="section" direction="vertical" gap={8}>
        {categoryKeywordList.length > 0 ? (
          <Box>
            {categoryKeywordList.map((item, i) => (
              <CategoryLabel
                index={i}
                data-index={i}
                data-parent-id={item.parentId}
                data-sub-id={item.subParentId}
                data-keyword={item.keyword}
                data-count={item.count}
                onClick={handleClickMap}
                key={`item-map-${item.keyword}`}
                showAppDownloadBanner={showAppDownloadBanner}
              >
                {parserKeyword(item.keyword)}
              </CategoryLabel>
            ))}
          </Box>
        ) : (
          brandKeywordList.map((item) => (
            <BrandLabel
              key={`alert-${item.keyword}`}
              onClick={handleClickBrand({ keyword: item.keywordBrand, item })}
              showAppDownloadBanner={showAppDownloadBanner}
            >
              <Flexbox gap={5} alignment="center">
                <Typography variant="body2" weight="bold">
                  {capitalize(item.keywordEng)}
                </Typography>
                <Typography variant="body2">{item.keywordBrand}</Typography>
              </Flexbox>
              <Flexbox gap={4} alignment="center" customStyle={{ marginLeft: 'auto' }}>
                <Typography variant="small2" customStyle={{ color: palette.common.grey['60'] }}>
                  ({commaNumber(item.count)})
                </Typography>
                <Icon name="CaretRightOutlined" color={palette.common.grey['20']} size="small" />
              </Flexbox>
            </BrandLabel>
          ))
        )}
        <Box component="ul">
          {searchResult.map((item: SuggestKeyword, i) => (
            <Fragment key={`list-${item.keyword}`}>
              <ItemLi
                data-keyword={item.keyword}
                data-brand-id={item.brandId}
                data-category-id={item.categoryId}
                data-count={item.count}
                data-item={JSON.stringify(item)}
                data-index={i}
                onClick={handleClickList}
                isType={item.type === 0}
              >
                <Typography
                  variant="body1"
                  dangerouslySetInnerHTML={{ __html: item.keywordDeco }}
                />
                {item.count > 0 && (
                  <Typography variant="small2" customStyle={{ color: palette.common.grey['60'] }}>
                    {commaNumber(item.count)}회
                  </Typography>
                )}
              </ItemLi>
            </Fragment>
          ))}
        </Box>
      </Flexbox>
    </>
  );
}

const CategoryLabel = styled.div<{ index: number; showAppDownloadBanner: boolean }>`
  display: flex;
  align-items: center;
  font-size: ${({ theme: { typography } }) => typography.small1.size};
  height: 50px;
  background: ${({ theme }) => theme.palette.common.grey['95']};
  width: 100%;
  left: 0;
  top: ${({ index, showAppDownloadBanner }) =>
    showAppDownloadBanner ? `${index === 1 ? 160 : 115}px` : `${index === 1 ? 100 : 55}px`};
  padding: 16px 20px;
  cursor: pointer;
`;

const BrandLabel = styled.div<{ showAppDownloadBanner: boolean }>`
  display: flex;
  align-items: center;
  font-size: ${({ theme: { typography } }) => typography.small1.size};
  height: 50px;
  background: ${({ theme }) => theme.palette.common.grey['95']};
  width: 100%;
  left: 0;
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? 55 + APP_DOWNLOAD_BANNER_HEIGHT : 55}px;
  padding: 16px 20px;
  cursor: pointer;
  color: ${({ theme: { palette } }) => palette.common.grey['20']};
`;

const ItemLi = styled.li<{ isType: boolean }>`
  display: ${({ isType }) => (isType ? 'none' : 'flex')};
  align-items: center;
  cursor: pointer;
  padding: 10px 20px;
  gap: 8px;
`;

export default SearchList;
