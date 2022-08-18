import { Fragment } from 'react';

import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import omitBy from 'lodash-es/omitBy';
import isEmpty from 'lodash-es/isEmpty';
import styled from '@emotion/styled';

import type { SuggestKeyword } from '@dto/product';
import { KeywordItemSub } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import { filterGenders } from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/common';
import capitalize from '@utils/capitalize';

import type { TotalSearchItem } from '@typings/search';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

interface SearchListProps {
  searchValue: string;
  suggestKeywords: SuggestKeyword[];
  onClickTotalSearch: (parameter: TotalSearchItem) => void;
}

function SearchList({ searchValue, suggestKeywords, onClickTotalSearch }: SearchListProps) {
  const router = useRouter();
  const {
    theme: { palette }
  } = useTheme();
  const { data: { info: { value: { gender: userGender = '' } = {} } = {} } = {} } =
    useQueryUserInfo();
  const categoryKeywordList = suggestKeywords.filter(({ type }) => type === 0);
  const brandKeywordList = suggestKeywords.filter(
    ({ type, keywordBrand }) => type === 2 && !!keywordBrand
  );

  const handleClickCategoryLabel =
    ({
      index,
      parentId,
      subParentId,
      keyword,
      count
    }: {
      index: number;
      parentId: number;
      subParentId: number;
      keyword: string;
      count: number;
    }) =>
    () => {
      logEvent(attrKeys.search.CLICK_AUTO, {
        name: 'SEARCH',
        type: 'CATEGORY',
        index,
        keyword: keyword?.replace(/\(P\)/, ''),
        count
      });
      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.productName.SEARCH,
        title: attrProperty.productTitle.BANNERC,
        type: attrProperty.productType.INPUT
      });
      router
        .replace({
          pathname: '/search',
          query: { keyword: searchValue }
        })
        .then(() =>
          router.push({
            pathname: `/products/categories/${(keyword || '').split('>')[1].replace(/\(P\)/g, '')}`,
            query: {
              parentIds: [parentId],
              subParentIds: [subParentId],
              genders: [keyword.split('>')[0] === '남성' ? 'male' : 'female']
            }
          })
        );
    };

  const handleClickBrand = (item: SuggestKeyword) => () => {
    logEvent(attrKeys.search.CLICK_BANNERB, { name: 'SEARCH' });
    onClickTotalSearch({
      keyword: item.keywordBrand,
      title: 'BANNERB',
      keywordItem: item
    });
  };

  const handleClickRecomm =
    ({
      keyword,
      keywordDeco,
      brandId,
      gender,
      parentId,
      subParentId,
      idFilterIds = [],
      categorySizeIds = [],
      lineIds = [],
      maxPrice
    }: KeywordItemSub) =>
    () => {
      logEvent(attrKeys.search.CLICK_RECOMMFILTER, {
        name: attrProperty.productName.SEARCHMODAL,
        att: keyword
      });
      logEvent(attrKeys.search.SUBMIT_SEARCH, {
        name: attrProperty.productName.SEARCH,
        title: attrProperty.productTitle.RECOMMFILTER,
        type: 'INPUT',
        keyword: searchValue,
        keywordDeco,
        brandId,
        gender,
        parentId,
        subParentId,
        idFilterIds,
        categorySizeIds,
        lineIds,
        maxPrice
      });
      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.productName.SEARCH,
        title: attrProperty.productTitle.RECOMMFILTER,
        type: attrProperty.productType.INPUT,
        keyword
      });
      router
        .replace({
          pathname: '/search',
          query: { keyword: searchValue }
        })
        .then(() =>
          router.push({
            pathname: `/products/search/${keyword}`,
            query: omitBy(
              {
                brandIds: brandId ? [brandId] : [],
                genderIds: gender
                  ? [
                      filterGenders.common.id,
                      filterGenders[gender as keyof typeof filterGenders].id
                    ]
                  : [],
                parentIds: parentId ? [parentId] : [],
                subParentIds: subParentId ? [subParentId] : [],
                idFilterIds,
                categorySizeIds,
                lineIds,
                minPrice: maxPrice ? String(0) : undefined,
                maxPrice: maxPrice ? String(maxPrice) : undefined
              },
              isEmpty
            )
          })
        );
    };

  const handleClickList = (item: SuggestKeyword, index: number) => () => {
    const { keyword, count, brandId, categoryId } = item;

    logEvent(attrKeys.search.CLICK_AUTO, {
      name: 'SEARCH',
      type: 'KEYWORD',
      index,
      keyword,
      count
    });
    onClickTotalSearch({
      keyword,
      title: 'AUTO',
      keywordItem: item,
      count,
      brandId,
      categoryId,
      type: 'auto'
    });
  };

  // const searchHelperKeyword = ((categoryKeywordList.length > 0 && categoryKeywordList) ||
  //   (brandKeywordList.length > 0 && brandKeywordList) ||
  //   searchResult)[0];

  return (
    <>
      {/* {!!searchHelperKeyword && ( */}
      {/*  <SearchHelperBanner */}
      {/*    keyword={searchHelperKeyword.keyword} */}
      {/*    brandName={brandKeywordList.length > 0 ? searchHelperKeyword.brandName : undefined} */}
      {/*    brandId={brandKeywordList.length > 0 ? searchHelperKeyword.brandId : undefined} */}
      {/*    categoryName={ */}
      {/*      (categoryKeywordList.length > 0 */}
      {/*        ? searchHelperKeyword.keyword.substring( */}
      {/*            searchHelperKeyword.keyword.lastIndexOf('>') + 1 */}
      {/*          ) */}
      {/*        : searchHelperKeyword.categoryName) ?? undefined */}
      {/*    } */}
      {/*    parentId={searchHelperKeyword.parentId ?? undefined} */}
      {/*    subParentId={searchHelperKeyword.subParentId ?? undefined} */}
      {/*  /> */}
      {/* )} */}
      <Flexbox component="section" direction="vertical" gap={8}>
        {categoryKeywordList.length > 0 ? (
          <Box>
            {categoryKeywordList.map(
              ({ parentId, subParentId, keyword, count, recommFilters }, index) => (
                <Box
                  key={`item-map-${keyword}`}
                  customStyle={{
                    borderBottom: `1px solid ${palette.common.grey['80']}`,
                    padding: (recommFilters || []).length > 0 ? '8px 0' : 0,
                    backgroundColor: palette.common.grey['95']
                  }}
                >
                  <Flexbox
                    customStyle={{ padding: '12px 20px' }}
                    onClick={handleClickCategoryLabel({
                      index,
                      parentId,
                      subParentId,
                      keyword,
                      count
                    })}
                  >
                    <Flexbox gap={4} customStyle={{ flex: 1 }}>
                      {keyword.split('>').map((word, secondIndex) => (
                        <Fragment key={`category-label-${word}`}>
                          {secondIndex !== 0 && (
                            <Icon
                              name="CaretRightOutlined"
                              size="small"
                              customStyle={{ color: palette.common.grey['80'] }}
                            />
                          )}
                          <Typography
                            variant="body2"
                            weight={
                              secondIndex + 1 === keyword.split('>').length ? 'bold' : 'medium'
                            }
                            customStyle={{ lineHeight: '16px' }}
                          >
                            {word.replace(/\(P\)/, '')}
                          </Typography>
                        </Fragment>
                      ))}
                    </Flexbox>
                    <Icon name="CaretRightOutlined" size="small" />
                  </Flexbox>
                  {(recommFilters || []).map((recommFilter) => (
                    <Flexbox
                      gap={8}
                      alignment="center"
                      key={`category-recommend-filter-keyword-${recommFilter.keywordDeco}`}
                      customStyle={{ padding: '10px 20px', color: palette.primary.main }}
                      onClick={handleClickRecomm({
                        ...recommFilter,
                        parentId,
                        gender:
                          recommFilter.gender ??
                          ((userGender === 'F' && 'female') ||
                            (userGender === 'M' && 'male') ||
                            null)
                      })}
                    >
                      <FilterFilled />
                      <Typography brandColor="primary" customStyle={{ flex: 1 }}>
                        {recommFilter.keywordDeco}
                      </Typography>
                      <Icon
                        name="CaretRightOutlined"
                        size="small"
                        customStyle={{ color: palette.primary.main }}
                      />
                    </Flexbox>
                  ))}
                </Box>
              )
            )}
          </Box>
        ) : (
          brandKeywordList.map((item) => (
            <Box
              key={`alert-${item.keyword}`}
              customStyle={{
                borderBottom: `1px solid ${palette.common.grey['80']}`,
                padding: (item.recommFilters || []).length > 0 ? '8px 0' : 0,
                backgroundColor: palette.common.grey['95']
              }}
            >
              <Flexbox onClick={handleClickBrand(item)} customStyle={{ padding: '12px 20px' }}>
                <Flexbox gap={5} alignment="center">
                  <Typography variant="body2" weight="bold">
                    {capitalize(item.keywordEng)}
                  </Typography>
                  <Typography variant="body2">{item.keywordBrand}</Typography>
                </Flexbox>
                <Flexbox gap={4} alignment="center" customStyle={{ marginLeft: 'auto' }}>
                  <Typography variant="small2" customStyle={{ color: palette.common.grey['60'] }}>
                    {commaNumber(item.count)}
                  </Typography>
                  <Icon name="CaretRightOutlined" color={palette.common.grey['20']} size="small" />
                </Flexbox>
              </Flexbox>
              {(item.recommFilters || []).map((recommFilter) => (
                <Flexbox
                  gap={8}
                  alignment="center"
                  key={`brand-recommend-filter-keyword-${recommFilter.keywordDeco}`}
                  customStyle={{ padding: '10px 20px', color: palette.primary.main }}
                  onClick={handleClickRecomm({
                    ...recommFilter,
                    gender:
                      recommFilter.gender ??
                      ((userGender === 'F' && 'female') || (userGender === 'M' && 'male') || null)
                  })}
                >
                  <FilterFilled />
                  <Typography brandColor="primary" customStyle={{ flex: 1 }}>
                    {recommFilter.keywordDeco}
                  </Typography>
                  <Icon
                    name="CaretRightOutlined"
                    size="small"
                    customStyle={{ color: palette.primary.main }}
                  />
                </Flexbox>
              ))}
            </Box>
          ))
        )}
        <Box component="ul">
          {suggestKeywords.map((item, index) => (
            <ItemLi
              key={`search-keyword-suggest-${item.keyword}`}
              onClick={handleClickList(item, index)}
              isType={item.type === 0}
            >
              <Typography variant="body1" dangerouslySetInnerHTML={{ __html: item.keywordDeco }} />
              {item.count > 0 && (
                <Typography variant="small2" customStyle={{ color: palette.common.grey['60'] }}>
                  {commaNumber(item.count)}
                </Typography>
              )}
            </ItemLi>
          ))}
        </Box>
      </Flexbox>
    </>
  );
}

const ItemLi = styled.li<{ isType: boolean }>`
  display: ${({ isType }) => (isType ? 'none' : 'flex')};
  align-items: center;
  cursor: pointer;
  padding: 10px 20px;
  gap: 8px;
`;

function FilterFilled() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 4H4V6.41421L10 12.4142V22.4142L14 18.4142V12.4142L20 6.41421V4Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SearchList;
