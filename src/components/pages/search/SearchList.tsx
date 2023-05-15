import { Fragment } from 'react';

import { useRouter } from 'next/router';
import omitBy from 'lodash-es/omitBy';
import isEmpty from 'lodash-es/isEmpty';
import capitalize from 'lodash-es/capitalize';
import { Box, Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';
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
    theme: {
      palette: { primary, common }
    }
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
                genderIds: gender ? [filterGenders[gender].id, filterGenders.common.id] : [],
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

  return (
    <Flexbox component="section" direction="vertical" customStyle={{ padding: '0 20px' }}>
      <Flexbox direction="vertical" gap={1} customStyle={{ backgroundColor: common.ui95 }}>
        {categoryKeywordList.length > 0
          ? categoryKeywordList.map(
              ({ parentId, subParentId, keyword, count, recommFilters }, index) => (
                <Box
                  key={`item-map-${keyword}`}
                  customStyle={{
                    padding: '8px 0',
                    backgroundColor: common.uiWhite,
                    cursor: 'pointer'
                  }}
                >
                  <Flexbox gap={16} alignment="center" customStyle={{ padding: '8px 0' }}>
                    <Icon
                      name="MenuOutlined"
                      width={28}
                      height={28}
                      customStyle={{
                        padding: 4,
                        backgroundColor: common.ui95,
                        borderRadius: '50%'
                      }}
                    />
                    <Flexbox gap={4} customStyle={{ alignItems: 'baseline', flex: 1 }}>
                      <Flexbox
                        alignment="center"
                        onClick={handleClickCategoryLabel({
                          index,
                          parentId,
                          subParentId,
                          keyword,
                          count
                        })}
                      >
                        {keyword.split('>').map((word, secondIndex) => (
                          <Fragment key={`category-label-${word}`}>
                            {secondIndex !== 0 && (
                              <Icon
                                name="CaretRightOutlined"
                                size="medium"
                                customStyle={{ color: common.ui80 }}
                              />
                            )}
                            <Typography
                              variant="h4"
                              weight={
                                secondIndex + 1 === keyword.split('>').length ? 'bold' : 'medium'
                              }
                            >
                              {word.replace(/\(P\)/, '')}
                            </Typography>
                          </Fragment>
                        ))}
                      </Flexbox>
                    </Flexbox>
                  </Flexbox>
                  {(recommFilters || []).map((recommFilter) => (
                    <Flexbox
                      gap={8}
                      alignment="center"
                      key={`category-recommend-filter-keyword-${recommFilter.keywordDeco}`}
                      customStyle={{ padding: '8px 0', color: primary.light }}
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
                      <Icon
                        name="FilterFilled"
                        color={primary.light}
                        width={28}
                        height={28}
                        customStyle={{ padding: 4 }}
                      />
                      <Typography color="primary-light" customStyle={{ flex: 1 }}>
                        {recommFilter.keywordDeco}
                      </Typography>
                      <Icon
                        name="CaretRightOutlined"
                        width={14}
                        height={14}
                        customStyle={{ color: primary.main }}
                      />
                    </Flexbox>
                  ))}
                </Box>
              )
            )
          : brandKeywordList.map((item) => (
              <Flexbox
                direction="vertical"
                key={`alert-${item.keyword}`}
                customStyle={{
                  padding: '8px 0',
                  backgroundColor: common.uiWhite,
                  cursor: 'pointer'
                }}
              >
                <Flexbox
                  alignment="center"
                  gap={16}
                  onClick={handleClickBrand(item)}
                  customStyle={{ padding: '8px 0' }}
                >
                  <BrandText>{item.keywordEng.charAt(0).toUpperCase()}</BrandText>
                  <Flexbox gap={4} customStyle={{ alignItems: 'baseline' }}>
                    <Typography variant="h4" weight="bold">
                      {item.keywordBrand}
                    </Typography>
                    <Typography variant="body2" brandColor="gray">
                      {capitalize(item.keywordEng)}
                    </Typography>
                  </Flexbox>
                </Flexbox>
                {(item.recommFilters || []).map((recommFilter) => (
                  <Flexbox
                    gap={16}
                    alignment="center"
                    key={`brand-recommend-filter-keyword-${recommFilter.keywordDeco}`}
                    customStyle={{ padding: '8px 0', color: primary.light }}
                    onClick={handleClickRecomm({
                      ...recommFilter,
                      gender:
                        recommFilter.gender ??
                        ((userGender === 'F' && 'female') || (userGender === 'M' && 'male') || null)
                    })}
                  >
                    <Icon
                      name="FilterFilled"
                      color={primary.light}
                      width={28}
                      height={28}
                      customStyle={{ padding: 4 }}
                    />
                    <Typography customStyle={{ flex: 1, color: 'inherit' }}>
                      {recommFilter.keywordDeco}
                    </Typography>
                    <Icon
                      name="CaretRightOutlined"
                      size="small"
                      customStyle={{ color: 'inherit' }}
                    />
                  </Flexbox>
                ))}
              </Flexbox>
            ))}
        {suggestKeywords.map((item, index) => (
          <Item
            key={`search-keyword-suggest-${item.keyword}`}
            onClick={handleClickList(item, index)}
            isType={item.type === 0}
          >
            <Icon
              name="SearchOutlined"
              size="medium"
              customStyle={{ color: common.ui80, minWidth: 20 }}
            />
            <Flexbox gap={4} customStyle={{ alignItems: 'baseline' }}>
              <Typography variant="h4" dangerouslySetInnerHTML={{ __html: item.keywordDeco }} />
              {item.count > 0 && (
                <Typography variant="body2" customStyle={{ color: common.ui60 }}>
                  {commaNumber(item.count)}
                </Typography>
              )}
            </Flexbox>
          </Item>
        ))}
      </Flexbox>
    </Flexbox>
  );
}

const Item = styled.div<{ isType: boolean }>`
  display: ${({ isType }) => (isType ? 'none' : 'flex')};
  align-items: center;
  cursor: pointer;
  padding: 20px 4px;
  gap: 20px;
  background-color: ${({ theme }) => theme.palette.common.uiWhite};
`;

const BrandText = styled(Typography)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;
  font-weight: 900;
  font-size: 17px;
  line-height: 24px;
  text-align: center;
  letter-spacing: -0.01em;
  background-color: ${({ theme }) => theme.palette.common.ui95};
  border-radius: 50%;
`;

export default SearchList;
