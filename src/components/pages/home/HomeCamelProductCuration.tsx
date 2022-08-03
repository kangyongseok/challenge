import { useCallback, useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Chip, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import debounce from 'lodash-es/debounce';
import styled from '@emotion/styled';

import ProductTitle from '@components/UI/molecules/ProductTitle';
import ProductGridCard from '@components/UI/molecules/ProductGridCard';
import { ProductGridCardSkeleton } from '@components/UI/molecules';

import type { Product } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchSearch } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  camelProductCurationState,
  chipMenuPrevScrollState,
  productCurationPrevScrollState,
  searchParamsState,
  searchParamsWithDeviceIdSelector
} from '@recoil/camelProductCuration';

function HomeCamelProductCuration() {
  const router = useRouter();
  const [{ brandsAndCategories, selectedChip }, setCamelProductCurationState] =
    useRecoilState(camelProductCurationState);
  const [chipMenuPrevScroll, setChipMenuPrevScrollState] = useRecoilState(chipMenuPrevScrollState);
  const [productCurationPrevScroll, setProductCurationPrevScrollState] = useRecoilState(
    productCurationPrevScrollState
  );
  const searchParams = useRecoilValue(searchParamsWithDeviceIdSelector);
  const setSearchParamsState = useSetRecoilState(searchParamsState);
  const {
    theme: { palette }
  } = useTheme();
  const {
    data: search,
    isLoading,
    isFetching
  } = useQuery(queryKeys.products.search(searchParams), () => fetchSearch(searchParams));

  const chipMenuRef = useRef<HTMLDivElement | null>(null);
  const productCurationRef = useRef<HTMLDivElement | null>(null);

  const debChipMenuHandleScroll = useRef(
    debounce(() => {
      if (chipMenuRef.current) {
        setChipMenuPrevScrollState(chipMenuRef.current.scrollLeft);
      }
    }, 100)
  ).current;

  const debProductCurationHandleScroll = useRef(
    debounce(() => {
      if (productCurationRef.current) {
        setProductCurationPrevScrollState(productCurationRef.current.scrollLeft);
      }
    }, 100)
  ).current;

  const { brandIds = [], parentIds = [] } = searchParams;

  useEffect(() => {
    if (search && !brandsAndCategories.length) {
      const brands = search.searchOptions.brands
        .map(({ id: brandId, name, count }) => ({ name, brandId, count }))
        .filter(({ count }) => count > 8);
      const categories = search.searchOptions.parentCategories.map(({ name, id, count }) => ({
        name: name.replace('(P)', ''),
        parentId: id ?? undefined,
        count
      }));

      setCamelProductCurationState({
        brandsAndCategories: [...brands, ...categories],
        selectedChip: 0
      });
    }
  }, [setCamelProductCurationState, search, brandsAndCategories]);

  const handleClickChip = (e: MouseEvent<HTMLButtonElement>) => {
    logEvent(attrKeys.home.CLICK_TAG, {
      name: 'MAIN',
      title: 'CAMEL'
    });

    const target = e.currentTarget;
    if (target.dataset.brandId) {
      setCamelProductCurationState((prevState) => ({
        ...prevState,
        selectedChip: Number(target.dataset.brandId)
      }));
      setSearchParamsState((prevState) => {
        const prevSearchParams = { ...prevState };
        delete prevSearchParams.parentIds;

        return {
          ...prevSearchParams,
          brandIds: [Number(target.dataset.brandId)]
        };
      });
      return;
    }
    if (target.dataset.parentId) {
      setCamelProductCurationState((prevState) => ({
        ...prevState,
        selectedChip: Number(target.dataset.parentId)
      }));
      setSearchParamsState((prevState) => {
        const prevSearchParams = { ...prevState };
        delete prevSearchParams.brandIds;

        return {
          ...prevSearchParams,
          parentIds: [Number(target.dataset.parentId)]
        };
      });
      return;
    }

    if (selectedChip !== 0) {
      setCamelProductCurationState((prevState) => ({
        ...prevState,
        selectedChip: 0
      }));
      setSearchParamsState({
        size: 29,
        siteUrlIds: [161],
        order: 'recommDesc'
      });
    }
  };
  const handleScrollChipMenu = useCallback(
    () => debChipMenuHandleScroll(),
    [debChipMenuHandleScroll]
  );

  const handleScrollProductCuration = debounce(() => {
    logEvent(attrKeys.home.SWIPE_X_TAG, {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.CAMEL
    });
    debProductCurationHandleScroll();
  }, 200);

  useEffect(() => {
    if (chipMenuRef.current && chipMenuPrevScroll) {
      chipMenuRef.current.scrollTo(chipMenuPrevScroll, 0);
    }
    if (productCurationRef.current && productCurationPrevScroll) {
      productCurationRef.current.scrollTo(productCurationPrevScroll, 0);
    }
  }, [chipMenuPrevScroll, productCurationPrevScroll]);

  const handleWishAtt = (product: Product, i: number) => {
    return {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.PERSONAL,
      id: product.id,
      index: i + 1,
      brand: product.brand.name,
      category: product.category.name,
      parentId: product.category.parentId,
      line: product.line,
      site: product.site.name,
      price: product.price,
      scoreTotal: product.scoreTotal,
      cluster: product.cluster,
      source: attrProperty.productSource.MAIN_CAMEL
    };
  };

  const handleProductAtt = (product: Product, i: number) => {
    return {
      name: attrProperty.productName.MAIN_CAMEL,
      title: attrProperty.productTitle.PERSONAL,
      index: i + 1,
      id: product.id,
      brand: product.brand.name,
      category: product.category.name,
      parentCategory: FIRST_CATEGORIES[product.category.parentId as number],
      line: product.line,
      site: product.site.name,
      price: product.price,
      scoreTotal: product.scoreTotal,
      scoreStatus: product.scoreStatus,
      scoreSeller: product.scoreSeller,
      scorePrice: product.scorePrice,
      scorePriceAvg: product.scorePriceAvg,
      scorePriceCount: product.scorePriceCount,
      scorePriceRate: product.scorePriceRate,
      source: attrProperty.productSource.MAIN_CAMEL
    };
  };

  const handleClickShowAll = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.CAMEL,
      type: attrProperty.productType.GUIDED
    });

    router.push({
      pathname: '/products/camel',
      query: {
        siteUrlIds: [161],
        brandIds,
        parentIds
      }
    });
  };

  return (
    <Box component="section" customStyle={{ marginTop: 64 }}>
      <ProductTitle
        title="카멜 인증 판매자"
        description="카멜이 인증한 판매자들의 추천매물이에요."
        isSafe
        showAllButtonHref="/products/camel?siteUrlIds=161"
        onClickShowAllButton={() => {
          SessionStorage.set(sessionStorageKeys.productsEventProperties, {
            name: attrProperty.productName.MAIN,
            title: attrProperty.productTitle.CAMEL,
            type: attrProperty.productType.GUIDED
          });
          logEvent(attrKeys.home.CLICK_PRODUCT_LIST, {
            name: attrProperty.productName.MAIN,
            title: attrProperty.productTitle.CAMEL
          });
        }}
      />
      <ChipMenu ref={chipMenuRef} onScroll={handleScrollChipMenu}>
        <Chip
          variant={selectedChip === 0 ? 'contained' : 'outlined'}
          brandColor={selectedChip === 0 ? 'black' : 'grey'}
          size="small"
          isRound={false}
          onClick={handleClickChip}
          customStyle={{
            minWidth: 'fit-content'
          }}
        >
          전체
        </Chip>
        {brandsAndCategories.map(({ name, brandId, parentId }) => (
          <Chip
            key={`camel-product-curation-chip-${name}`}
            variant={
              selectedChip === brandId || selectedChip === parentId ? 'contained' : 'outlined'
            }
            brandColor={selectedChip === brandId || selectedChip === parentId ? 'black' : 'grey'}
            size="small"
            isRound={false}
            data-brand-id={brandId}
            data-parent-id={parentId}
            customStyle={{
              minWidth: 'fit-content'
            }}
            onClick={handleClickChip}
          >
            {name}
          </Chip>
        ))}
      </ChipMenu>
      <ProductCuration ref={productCurationRef} onScroll={handleScrollProductCuration}>
        <ProductCurationList>
          {isLoading || isFetching || !search
            ? Array.from(new Array(20), (_, index) => (
                <ProductGridCardSkeleton
                  key={`carmel-product-curation-card-skeleton-${index}`}
                  isRound
                />
              ))
            : search?.page.content.map((product, i) => (
                <ProductGridCard
                  key={`carmel-product-curation-card-${product.id}`}
                  product={product}
                  hideProductLabel
                  wishAtt={handleWishAtt(product, i)}
                  productAtt={handleProductAtt(product, i)}
                  name={attrProperty.productName.MAIN_CAMEL}
                  source={attrProperty.productSource.MAIN_CAMEL}
                  compact
                  isRound
                />
              ))}
        </ProductCurationList>
        {search?.page.content && (
          <Flexbox alignment="center" justifyContent="center">
            <ShowAllButton onClick={handleClickShowAll}>
              <Icon
                name="ArrowRightOutlined"
                width={34}
                height={34}
                color={palette.common.grey[40]}
              />
              <Typography
                variant="body2"
                weight="medium"
                customStyle={{ color: palette.common.grey[40] }}
              >
                전체보기
              </Typography>
            </ShowAllButton>
          </Flexbox>
        )}
      </ProductCuration>
    </Box>
  );
}

const ChipMenu = styled.div`
  white-space: nowrap;
  overflow-x: auto;
  margin: 16px -20px 0;
  padding: 0 20px;

  & > button {
    display: inline-block;
    margin-right: 6px;
    &:last-child {
      margin-right: 0;
    }
  }
`;

const ProductCuration = styled.div`
  display: grid;
  grid-template-columns: auto 140px;
  margin: 16px -20px 0;
  padding-left: 20px;
  overflow-x: auto;
`;

const ProductCurationList = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(2, auto);
  gap: 32px 12px;
  width: fit-content;

  & > div {
    width: 156px;
  }
`;

const ShowAllButton = styled.button`
  background-color: ${({ theme }) => theme.palette.common.white};
  border-radius: 50%;
  box-shadow: 0 0 16px rgb(0 0 0 / 10%);
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default HomeCamelProductCuration;
