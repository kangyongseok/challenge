import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import debounce from 'lodash-es/debounce';
import { QueryClient, dehydrate, useQuery } from '@tanstack/react-query';
import { Typography, useTheme } from '@mrcamelhub/camel-ui';

import { BottomNavigation, Header } from '@components/UI/molecules';
import PageHead from '@components/UI/atoms/PageHead';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  BrandList,
  BrandSearchBar,
  BrandSectionIndexer,
  BrandSuggestList
} from '@components/pages/brand';

import type { SuggestParams } from '@dto/brand';

import { logEvent } from '@library/amplitude';

import { fetchBrands, fetchBrandsSuggest } from '@api/brand';

import queryKeys from '@constants/queryKeys';
import { doubleCon } from '@constants/consonant';
import attrKeys from '@constants/attrKeys';

import { deDuplication, getBrandListTitles, parseWordToConsonant, sortBrand } from '@utils/brands';

// eslint-disable-next-line no-useless-escape
export const koRegexp = /^[\w`.~!@#$%^&*|\\;:\/?]/;
// const enRegexp = /^[\d`.~!@#$%^&*|\\;:\/?]/;

function Brand() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const { data: brands = [] } = useQuery(queryKeys.brands.all, fetchBrands);
  const [keywordValue, setKeywordValue] = useState('');
  const [suggestParams, setSuggestParams] = useState<SuggestParams>({
    useCollabo: true,
    keyword: ''
  });
  const { data: keywordsSuggest = [] } = useQuery(
    queryKeys.brands.suggest(suggestParams),
    () => fetchBrandsSuggest(suggestParams),
    {
      enabled: suggestParams.keyword.length > 0,
      onSettled() {
        window.scrollTo(0, 0);
      }
    }
  );
  const brandNavRef = useRef<HTMLDivElement[]>([]);
  const debounceSuggestParams = useRef(
    debounce((keyword: string) => setSuggestParams((prevState) => ({ ...prevState, keyword })), 500)
  ).current;

  const { brandsTitleList, brandsIndexList, brandsList } = useMemo(() => {
    if (brands.length === 0) return { brandsTitleList: [], brandsIndexList: [], brandsList: [] };

    const brandsIndex = deDuplication(brands.map((data) => parseWordToConsonant(data.name[0])));
    // const filteredBrandsIndex = brandsIndex.filter((k: string) => !koRegexp.test(k));
    const filteredBrandsIndex = brandsIndex.filter(
      (k: string) => !koRegexp.test(k) && !doubleCon.includes(k)
    );

    if (brandsIndex.some((k: string) => koRegexp.test(k))) filteredBrandsIndex.push('#');

    return {
      brandsTitleList: getBrandListTitles(brandsIndex, koRegexp),
      brandsList: brands.sort((a, b) => sortBrand(a.name, b.name)),
      brandsIndexList: filteredBrandsIndex
    };
  }, [brands]);

  const handleChangeKeyword = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newKeyword = e.target.value;

      setKeywordValue(newKeyword);
      debounceSuggestParams(newKeyword);
    },
    [debounceSuggestParams]
  );

  useEffect(() => {
    logEvent(attrKeys.brand.VIEW_BRAND_LIST);
  }, []);

  return (
    <>
      <PageHead
        title="전국 중고명품 브랜드 모음! 비교분석은 카멜에서 하세요 | 카멜"
        description="중고명품, 이앱 저앱 모두 검색해보지 말고 카멜에서 바로 한번에 검색해보세요!"
        ogTitle="전국 중고명품 브랜드 모음! 비교분석은 카멜에서 하세요 | 카멜"
        ogDescription="중고명품, 이앱 저앱 모두 검색해보지 말고 카멜에서 바로 한번에 검색해보세요!"
        ogImage={`https://${process.env.IMAGE_DOMAIN}/assets/images/seo/main.webp`}
      />
      <GeneralTemplate
        disablePadding
        header={
          <Header customStyle={{ borderBottom: `${common.ui90} 1px solid` }}>
            <Typography variant="h3" weight="bold" textAlign="center">
              브랜드
            </Typography>
          </Header>
        }
        footer={<BottomNavigation />}
      >
        <BrandSearchBar value={keywordValue} onChange={handleChangeKeyword} />
        {keywordValue.length > 0 && keywordsSuggest.length > 0 ? (
          <BrandSuggestList brandsList={keywordsSuggest} />
        ) : (
          <>
            <BrandList
              brandNavRef={brandNavRef}
              brandsTitleList={brandsTitleList}
              brandsList={brandsList}
            />
            <BrandSectionIndexer brandNavRef={brandNavRef} brandsIndexList={brandsIndexList} />
          </>
        )}
      </GeneralTemplate>
    </>
  );
}

export async function getStaticProps() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(queryKeys.brands.all, fetchBrands);

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

export default Brand;
