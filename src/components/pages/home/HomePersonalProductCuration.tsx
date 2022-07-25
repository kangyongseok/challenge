/* eslint-disable @typescript-eslint/ban-ts-comment,no-param-reassign */
import { useEffect, useRef } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, CtaButton, Flexbox, Icon, Typography } from 'mrcamel-ui';
import dayjs from 'dayjs';

import { ProductListCard, ProductListCardSkeleton } from '@components/UI/molecules';
import { Skeleton } from '@components/UI/atoms';

import { Product } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchSearchAiProduct } from '@api/product';
import { fetchBaseInfo } from '@api/personal';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import personalProductCurationState, {
  currentSlideState,
  searchParamsState
} from '@recoil/personalProductCuration';
import { deviceIdState } from '@recoil/common';

function HomePersonalProductCuration() {
  const router = useRouter();
  const [currentSlide, setCurrentSlideState] = useRecoilState(currentSlideState);
  const [searchAiProducts, setPersonalProductCurationState] = useRecoilState(
    personalProductCurationState
  );
  const searchParams = useRecoilValue(searchParamsState);
  const deviceId = useRecoilValue(deviceIdState);
  const { data: baseInfo, isFetched } = useQuery(queryKeys.personals.baseInfo(deviceId), () =>
    fetchBaseInfo(deviceId)
  );

  const slideUpdateReciveRef = useRef(false);
  const prevCurrentSlideRef = useRef(-1);

  const { brandIds = [], categoryIds = [], keyword } = searchParams;

  const { data: { content: products = [] } = {}, isFetched: productsFetched } = useQuery(
    queryKeys.products.searchAiProduct(searchParams),
    () => fetchSearchAiProduct(searchParams),
    {
      enabled: (!!brandIds.length || !!categoryIds.length || !!keyword) && isFetched,
      staleTime: 10 * 60 * 1000
    }
  );

  const swiperRef = useRef<SwiperClass>();

  const handleClickShowAll = () => {
    if (baseInfo?.aiCategories) {
      const { searchTag, brand, category } = baseInfo.aiCategories[currentSlide];
      logEvent(attrKeys.home.CLICK_PERSONAL_ALL, {
        name: attrProperty.productName.MAIN,
        title: attrProperty.productTitle.PERSONAL,
        att: `${brand?.name} ${category.name}`
      });

      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.productName.MAIN,
        title: attrProperty.productTitle.PERSONAL,
        type: attrProperty.productType.GUIDED
      });

      if (searchTag) {
        router.push(`/products/search/${searchTag}`);
        return;
      }

      if (brand?.id && category.id) {
        router.push(
          `/products/brands/${brand.name}?parentIds=${category.parentId}&subParentIds=${category.id}`
        );
        return;
      }

      if (brand?.id) {
        router.push(`/products/brands/${brand.name}`);
        return;
      }

      if (category.id) {
        router.push(
          `/products/categories/${category.name}?parentIds=${category.parentId}&subParentIds=${category.id}`
        );
      }
    }
  };

  const handleSlideChange = ({ activeIndex }: SwiperClass) => {
    setCurrentSlideState(activeIndex);
  };

  useEffect(() => {
    if (!slideUpdateReciveRef.current && productsFetched && products.length) {
      slideUpdateReciveRef.current = true;
      setPersonalProductCurationState((prevState) => {
        const newSearchAiProducts = [...prevState];
        newSearchAiProducts[currentSlide] = products;
        return newSearchAiProducts;
      });
    }
  }, [setPersonalProductCurationState, currentSlide, products, productsFetched]);

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.updateAutoHeight();
      swiperRef.current.slideTo(currentSlide);
    }
  }, [currentSlide, searchAiProducts]);

  useEffect(() => {
    if (prevCurrentSlideRef.current !== currentSlide) {
      slideUpdateReciveRef.current = false;
    }
    prevCurrentSlideRef.current = currentSlide;
  }, [currentSlide]);

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
      source: attrProperty.productSource.MAIN_PERSONAL
    };
  };

  const handleProductAtt = (product: Product, i: number) => {
    return {
      name: attrProperty.productName.MAIN_PERSONAL,
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
      scorePriceRate: product.scorePriceRate
    };
  };

  return (
    <Box component="section">
      <Flexbox
        alignment="center"
        justifyContent="space-between"
        customStyle={{ margin: '16px 0 20px' }}
      >
        <Typography variant="body2">
          업데이트 <strong>{dayjs().format('YYYY-MM-DD HH:mm')}</strong>
        </Typography>
        <Flexbox alignment="center" onClick={handleClickShowAll}>
          <Typography variant="body2" weight="bold">
            전체보기
          </Typography>
          <Icon name="CaretRightOutlined" width={14} height={14} />
        </Flexbox>
      </Flexbox>
      <Swiper
        onInit={(swiper) => {
          if (swiper) {
            swiperRef.current = swiper;
          }
        }}
        autoHeight
        spaceBetween={20}
        onSlideChangeTransitionEnd={handleSlideChange}
      >
        {!baseInfo?.aiCategories && (
          <SwiperSlide>
            {Array.from({ length: 10 }).map((_, childIndex) => (
              <ProductListCardSkeleton
                // eslint-disable-next-line react/no-array-index-key
                key={`personal-curation-product-card-skeleton-${childIndex}`}
                customStyle={{
                  marginBottom: 20
                }}
              />
            ))}
          </SwiperSlide>
        )}
        {baseInfo?.aiCategories &&
          baseInfo?.aiCategories.map(({ viewTag, brand, category }, index) => {
            const uniqKey = `${viewTag}-${(brand || {}).id || 0}-${(category || {}).id || 0}`;
            return (
              <SwiperSlide key={`aiCategory-product-${uniqKey}`}>
                {(!isFetched || !searchAiProducts[index] || !searchAiProducts[index].length) &&
                  Array.from({ length: 10 }).map((_, childIndex) => (
                    <ProductListCardSkeleton
                      // eslint-disable-next-line react/no-array-index-key
                      key={`personal-curation-product-card-skeleton-${uniqKey}-${childIndex}`}
                      customStyle={{
                        marginBottom: 20
                      }}
                    />
                  ))}
                {(!isFetched || !searchAiProducts[index] || !searchAiProducts[index].length) && (
                  <Skeleton
                    width="100%"
                    height="41px"
                    disableAspectRatio
                    customStyle={{ marginBottom: 20, borderRadius: 8 }}
                  />
                )}
                {isFetched &&
                  searchAiProducts[index] &&
                  searchAiProducts[index].map((product, i) => (
                    <ProductListCard
                      key={`personal-curation-product-card-${uniqKey}-${product.id}`}
                      product={product}
                      hideAlert
                      hideProductLabel
                      customStyle={{
                        marginBottom: 20
                      }}
                      productAtt={handleProductAtt(product, i)}
                      wishAtt={handleWishAtt(product, i)}
                      name={attrProperty.productName.MAIN_PERSONAL}
                      source={attrProperty.productSource.MAIN_PERSONAL}
                    />
                  ))}
                {isFetched && searchAiProducts[index] && (
                  <CtaButton
                    variant="ghost"
                    fullWidth
                    onClick={handleClickShowAll}
                    customStyle={{ marginBottom: 20 }}
                  >
                    전체보기
                  </CtaButton>
                )}
              </SwiperSlide>
            );
          })}
      </Swiper>
    </Box>
  );
}

export default HomePersonalProductCuration;
