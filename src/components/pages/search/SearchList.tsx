import type { MouseEvent } from 'react';
import { Fragment } from 'react';

import { useRecoilValue } from 'recoil';
import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { SearchHelperBanner } from '@components/pages/search';

import type { SuggestKeyword } from '@dto/product';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import commaNumber from '@utils/commaNumber';

import type { SelectItem, TotalSearchItem } from '@typings/search';
import { showAppDownloadBannerState } from '@recoil/common';

import SearchBrandList from './SearchBrandList';

interface SearchListProps {
  searchValue: string;
  searchResult: SuggestKeyword[];
  onClick: (parameter: TotalSearchItem) => void;
  onClickCategory: (parameter: SelectItem) => void;
}

function SearchList({ searchValue, searchResult, onClick, onClickCategory }: SearchListProps) {
  const {
    theme: { palette }
  } = useTheme();
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  const getSearchHelperKeyword = () => {
    let keyword = '';

    searchResult.forEach((item) => {
      if (item.type !== 0 && !!item.parentId && keyword.length === 0) keyword = item.keyword;
    });

    return keyword;
  };

  const parserKeyword = (keyword: string) => {
    return keyword.split('>').map((word, i) => (
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

  return (
    <>
      <Box
        customStyle={{
          height: searchResult.filter((item) => item.type === 0).length * 50 - 16
        }}
      >
        {searchResult
          .filter((item) => item.type === 0)
          .map((item, i) => (
            <HeaderList
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
            </HeaderList>
          ))}
      </Box>
      <ItemsArea>
        {searchResult.map((item: SuggestKeyword, i) => {
          const categoryKeywordList = searchResult.filter((result) => result.type === 0);
          if (item.type === 2 && item.keywordBrand && categoryKeywordList.length === 0) {
            return (
              <SearchBrandList key={`alert-${item.keyword}`} item={item} onClickList={onClick} />
            );
          }
          return (
            <Fragment key={`list-${item.keyword}`}>
              {i === 0 && searchValue.length > 1 && (
                <SearchHelperBanner
                  keyword={getSearchHelperKeyword()}
                  brandName={item.brandName ?? undefined}
                  brandId={item.brandId ?? undefined}
                  categoryName={item.categoryName ?? undefined}
                  parentId={item.parentId ?? undefined}
                  subParentId={item.subParentId ?? undefined}
                />
              )}
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
                <Flexbox gap={8} alignment="center">
                  <span dangerouslySetInnerHTML={{ __html: item.keywordDeco }} />
                  {item.count > 0 && (
                    <Typography variant="small2" customStyle={{ color: palette.common.grey['60'] }}>
                      ({commaNumber(item.count)})
                    </Typography>
                  )}
                </Flexbox>
              </ItemLi>
            </Fragment>
          );
        })}
      </ItemsArea>
    </>
  );
}

const HeaderList = styled.div<{ index: number; showAppDownloadBanner: boolean }>`
  display: flex;
  align-items: center;
  font-size: ${({ theme: { typography } }) => typography.small1.size};
  height: 50px;
  background: ${({ theme }) => theme.palette.common.grey['95']};
  width: 100%;
  position: absolute;
  left: 0;
  top: ${({ index, showAppDownloadBanner }) =>
    showAppDownloadBanner ? `${index === 1 ? 160 : 115}px` : `${index === 1 ? 100 : 55}px`};
  padding: 16px 26px;
  cursor: pointer;
`;

const ItemsArea = styled.ul`
  padding-top: 16px;
`;

const ItemLi = styled.li<{ isType: boolean }>`
  height: 45px;
  display: ${({ isType }) => (isType ? 'none' : 'flex')};
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
`;

export default SearchList;
