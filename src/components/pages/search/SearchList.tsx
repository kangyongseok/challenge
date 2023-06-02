import { Fragment, useEffect, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import omitBy from 'lodash-es/omitBy';
import isEmpty from 'lodash-es/isEmpty';
import capitalize from 'lodash-es/capitalize';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Flexbox, Icon, Typography } from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

import type { KeywordItemSub, SuggestKeyword } from '@dto/product';

import updateAccessUserOnBraze from '@library/updateAccessUserOnBraze';
import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchKeywordsSuggest } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { filterGenders } from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/formats';
import { getImageResizePath } from '@utils/common';

import { searchValueState } from '@recoil/search';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function SearchList() {
  const router = useRouter();

  const {
    palette: { common }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();

  const { data: { info: { value: { gender: userGender = '' } = {} } = {} } = {} } =
    useQueryUserInfo();

  const [categoryKeywords, setCategoryKeywords] = useState<SuggestKeyword[]>([]);
  const [brandKeywords, setBrandKeywords] = useState<SuggestKeyword[]>([]);

  const value = useRecoilValue(searchValueState);

  const { data = [], isLoading } = useQuery(
    queryKeys.products.keywordsSuggest(value),
    () => fetchKeywordsSuggest(value),
    {
      enabled: !!value
    }
  );

  const handleClick =
    ({
      keyword,
      count,
      brandId,
      categoryId,
      brandName,
      categoryName,
      line,
      index
    }: SuggestKeyword & {
      index: number;
    }) =>
    () => {
      logEvent(attrKeys.search.CLICK_AUTO, {
        name: attrProperty.name.SEARCH,
        type: 'KEYWORD',
        index,
        keyword,
        count
      });

      if (accessUser) {
        updateAccessUserOnBraze({ ...accessUser, lastKeyword: keyword });
      }

      logEvent(attrKeys.search.SUBMIT_SEARCH, {
        name: attrProperty.name.SEARCH,
        title: attrProperty.title.AUTO,
        type: attrProperty.type.INPUT,
        keyword,
        brandId,
        categoryId,
        brand: brandName,
        category: categoryName,
        line
      });

      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.name.SEARCH,
        title: attrProperty.title.AUTO,
        type: attrProperty.type.INPUT
      });

      router.push(`/products/search/${keyword}`);
    };

  const handleClickCategoryKeyword =
    ({
      keyword,
      index,
      count,
      parentId,
      subParentId
    }: SuggestKeyword & {
      index: number;
    }) =>
    () => {
      logEvent(attrKeys.search.CLICK_AUTO, {
        name: attrProperty.name.SEARCH,
        type: 'CATEGORY',
        index,
        keyword: keyword?.replace(/\(P\)/, ''),
        count
      });

      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.name.SEARCH,
        title: attrProperty.title.BANNERC,
        type: attrProperty.type.INPUT
      });

      router.push({
        pathname: `/products/categories/${(keyword || '').split('>')[1].replace(/\(P\)/g, '')}`,
        query: {
          parentIds: [parentId],
          subParentIds: [subParentId],
          genders: [keyword.split('>')[0] === '남성' ? 'male' : 'female']
        }
      });
    };

  const handleClickBrandKeyword =
    ({ keywordBrand, brandId, categoryId, brandName, categoryName, line }: SuggestKeyword) =>
    () => {
      logEvent(attrKeys.search.CLICK_BANNERB, { name: attrProperty.name.SEARCH });

      if (accessUser) {
        updateAccessUserOnBraze({ ...accessUser, lastKeyword: keywordBrand });
      }

      logEvent(attrKeys.search.SUBMIT_SEARCH, {
        name: attrProperty.name.SEARCH,
        title: attrProperty.title.BANNERB,
        type: 'INPUT',
        keyword: keywordBrand,
        brandId,
        categoryId,
        brand: brandName,
        category: categoryName,
        line
      });

      router.push(`/products/brands/${keywordBrand}`);
    };

  const handleClickRecommFilter =
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
        name: attrProperty.name.SEARCH,
        att: keyword
      });

      logEvent(attrKeys.search.SUBMIT_SEARCH, {
        name: attrProperty.name.SEARCH,
        title: attrProperty.title.RECOMMFILTER,
        type: attrProperty.type.INPUT,
        keyword: value,
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
        name: attrProperty.name.SEARCH,
        title: attrProperty.title.RECOMMFILTER,
        type: attrProperty.type.INPUT,
        keyword
      });

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
            maxPrice: maxPrice ? String(maxPrice) : undefined
          },
          isEmpty
        )
      });
    };

  useEffect(() => {
    if (!data || isLoading) return;

    setCategoryKeywords(data.filter(({ type }) => type === 0));
    setBrandKeywords(data.filter(({ type, keywordBrand }) => type === 2 && !!keywordBrand));
  }, [data, isLoading]);

  if (!value || !data || !data.length) return null;

  return (
    <Flexbox
      component="section"
      direction="vertical"
      customStyle={{
        marginTop: 4,
        padding: '0 20px'
      }}
    >
      {categoryKeywords.map(({ parentId, keyword, recommFilters = [], ...props }, index) => (
        <Flexbox
          key={`search-result-keyword-category-${keyword}`}
          direction="vertical"
          onClick={handleClickCategoryKeyword({
            parentId,
            keyword,
            recommFilters,
            index,
            ...props
          })}
          customStyle={{
            width: '100%',
            padding: '8px 0',
            borderBottom: `1px solid ${common.ui95}`
          }}
        >
          <Flexbox
            gap={16}
            alignment="center"
            customStyle={{
              padding: '8px 0',
              cursor: 'pointer'
            }}
          >
            <Avatar
              width={28}
              height={27}
              src={getImageResizePath({
                imagePath: `https://${
                  process.env.IMAGE_DOMAIN
                }/assets/images/category/ico_cate_${parentId}_${userGender.toLowerCase()}.png`,
                w: 48
              })}
              alt={keyword}
              round="50%"
              customStyle={{
                padding: 2,
                backgroundColor: common.bg02
              }}
            />
            <Flexbox
              alignment="center"
              customStyle={{
                flexGrow: 1
              }}
            >
              <Flexbox alignment="center">
                {keyword.split('>').map((splitKeyword, splitKeywordIndex) => (
                  <Fragment key={`search-result-category-${splitKeyword}`}>
                    <Typography
                      variant="h4"
                      weight={
                        splitKeywordIndex === keyword.split('>').length - 1 ? 'bold' : 'medium'
                      }
                    >
                      {splitKeyword.replace(/\(P\)/g, '')}
                    </Typography>
                    {splitKeywordIndex !== keyword.split('>').length - 1 && (
                      <Icon name="Arrow2RightOutlined" width={20} height={20} color="ui80" />
                    )}
                  </Fragment>
                ))}
              </Flexbox>
            </Flexbox>
          </Flexbox>
          {recommFilters?.map((recommFilter) => (
            <Flexbox
              key={`search-result-keyword-category-${keyword}-recomm-filter-${recommFilter.keywordDeco}`}
              alignment="center"
              gap={20}
              onClick={handleClickRecommFilter({
                ...recommFilter,
                parentId,
                gender:
                  recommFilter.gender ??
                  ((userGender === 'F' && 'female') || (userGender === 'M' && 'male') || null)
              })}
              customStyle={{
                padding: '12px 0 12px 4px',
                cursor: 'pointer'
              }}
            >
              <Icon name="FilterFilled" width={20} height={20} color="primary-light" />
              <Flexbox
                alignment="center"
                justifyContent="space-between"
                gap={8}
                customStyle={{
                  flexGrow: 1
                }}
              >
                <Typography
                  color="primary-light"
                  dangerouslySetInnerHTML={{ __html: recommFilter.keywordDeco }}
                />
                <Icon name="Arrow2RightOutlined" width={14} height={14} color="primary-light" />
              </Flexbox>
            </Flexbox>
          ))}
        </Flexbox>
      ))}
      {brandKeywords.map(({ keyword, keywordBrand, keywordEng, recommFilters = [], ...props }) => (
        <Flexbox
          key={`search-result-keyword-brand-${keyword}`}
          direction="vertical"
          onClick={handleClickBrandKeyword({
            keyword,
            keywordBrand,
            keywordEng,
            recommFilters,
            ...props
          })}
          customStyle={{
            width: '100%',
            padding: '8px 0',
            borderBottom: `1px solid ${common.ui95}`
          }}
        >
          <Flexbox
            gap={16}
            alignment="center"
            customStyle={{
              padding: '8px 0',
              cursor: 'pointer'
            }}
          >
            <Flexbox
              alignment="center"
              justifyContent="center"
              customStyle={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: common.bg02,
                fontSize: 17,
                lineHeight: '24px',
                letterSpacing: '-0.1em',
                fontWeight: 900
              }}
            >
              {keywordEng.charAt(0).toUpperCase()}
            </Flexbox>
            <Flexbox
              alignment="baseline"
              gap={4}
              customStyle={{
                flexGrow: 1
              }}
            >
              <Typography variant="h4" weight="bold">
                {keywordBrand}
              </Typography>
              <Typography variant="body2" color="ui60">
                {capitalize(keywordEng)}
              </Typography>
            </Flexbox>
          </Flexbox>
          {recommFilters?.map((recommFilter) => (
            <Flexbox
              key={`search-result-keyword-brand-${keyword}-recomm-filter-${recommFilter.keywordDeco}`}
              alignment="center"
              gap={20}
              onClick={handleClickRecommFilter({
                ...recommFilter,
                gender:
                  recommFilter.gender ??
                  ((userGender === 'F' && 'female') || (userGender === 'M' && 'male') || null)
              })}
              customStyle={{
                padding: '12px 0 12px 4px',
                cursor: 'pointer'
              }}
            >
              <Icon name="FilterFilled" width={20} height={20} color="primary-light" />
              <Flexbox
                alignment="center"
                justifyContent="space-between"
                gap={8}
                customStyle={{
                  flexGrow: 1
                }}
              >
                <Typography
                  color="primary-light"
                  dangerouslySetInnerHTML={{ __html: recommFilter.keywordDeco }}
                />
                <Icon name="Arrow2RightOutlined" width={14} height={14} color="primary-light" />
              </Flexbox>
            </Flexbox>
          ))}
        </Flexbox>
      ))}
      {data
        .filter(({ type }) => type !== 0)
        .map(({ keyword, keywordDeco, count, ...props }, index) => (
          <Flexbox
            key={`search-result-keyword-${keyword}`}
            alignment="center"
            gap={20}
            onClick={handleClick({
              keyword,
              keywordDeco,
              count,
              index,
              ...props
            })}
            customStyle={{
              width: '100%',
              padding: '20px 4px',
              borderBottom:
                index === data.filter(({ type }) => type !== 0).length - 1
                  ? undefined
                  : `1px solid ${common.ui95}`
            }}
          >
            <Icon name="SearchOutlined" width={20} height={20} color="ui80" />
            <Flexbox
              alignment="baseline"
              gap={4}
              customStyle={{
                flexGrow: 1
              }}
            >
              <Typography variant="h4" dangerouslySetInnerHTML={{ __html: keywordDeco }} />
              {count > 0 && (
                <Typography variant="body2" color="ui60">
                  {commaNumber(count)}
                </Typography>
              )}
            </Flexbox>
          </Flexbox>
        ))}
    </Flexbox>
  );
}

export default SearchList;
