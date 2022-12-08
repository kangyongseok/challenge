import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import { debounce } from 'lodash-es';
import dayjs from 'dayjs';
import styled from '@emotion/styled';

import { ProductGridCard, ProductGridCardSkeleton } from '@components/UI/molecules';
import Skeleton from '@components/UI/atoms/Skeleton';

import { GuideProducts } from '@dto/personal';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchGuideAllProducts } from '@api/personal';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getOnlyObjectValue } from '@utils/common';

import { activeMyFilterState } from '@recoil/productsFilter';
import { personalGuideListCurrentThemeState } from '@recoil/home';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

function HomePersonalGuideProductList() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();
  const listScrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const [guideProductsNum, setGuideProductsNum] = useRecoilState(
    personalGuideListCurrentThemeState
  );
  const setActiveMyFilterState = useSetRecoilState(activeMyFilterState);
  const { data: userInfo } = useQueryUserInfo();
  const {
    data: products,
    isLoading,
    refetch
  } = useQuery(queryKeys.personals.guideAllProducts(), () => fetchGuideAllProducts(), {
    staleTime: 5 * 60 * 1000
  });
  const [filterData, setFilterData] = useState<GuideProducts[]>([]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const initTime = SessionStorage.get(sessionStorageKeys.personalProductsCache);
      if (initTime) {
        if (dayjs().diff(dayjs(initTime as string), 'minute') > 30) {
          SessionStorage.set(
            sessionStorageKeys.personalProductsCache,
            dayjs().format('YYYY-MM-DD HH:mm')
          );
          refetch();
        }
      }
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, [refetch]);

  useEffect(() => {
    if (products) {
      setFilterData(products.filter((data) => !!data.products));
    }
  }, [products]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    logEvent(attrKeys.home.CLICK_REFRESH_PRODUCT, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.PERSONAL_GUIDE
    });

    (listScrollRef.current as HTMLDivElement).scrollTo(0, 0);

    if (target.dataset.left) {
      if (guideProductsNum === 0) {
        setGuideProductsNum(filterData.length - 1);
        return;
      }
      setGuideProductsNum((props) => props - 1);
      return;
    }

    if (target.dataset.right) {
      if (guideProductsNum === filterData.length - 1) {
        setGuideProductsNum(0);
        return;
      }
      setGuideProductsNum((props) => props + 1);
    }
  };

  const handleClickAll = () => {
    logEvent(attrKeys.home.CLICK_PRODUCT_LIST, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.PERSONAL_GUIDE
    });

    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.PERSONAL,
      type: attrProperty.type.GUIDED
    });

    if (filterData) {
      if (isLoading || !filterData[guideProductsNum].name) return;
      const genderSizeType = filterData[guideProductsNum].purchaseTypeValue === 40;
      const origin: { [propsName: string]: string } = {
        idFilterIds: filterData[guideProductsNum].idFilter,
        distance: filterData[guideProductsNum].distance
      };

      if (genderSizeType) {
        if (!userInfo) {
          origin.genders = 'male';
        } else {
          origin.genders = userInfo.info.value.gender === 'M' ? 'male' : 'female';
          setActiveMyFilterState(true);
        }
      }

      const isValueQuery = Object.keys(origin).filter((q) => !!origin[q]);

      router.push({
        pathname: `/products/search/${filterData[guideProductsNum].name}`,
        query: getOnlyObjectValue(isValueQuery, origin)
      });
    }
  };

  const handleScroll = debounce(() => {
    logEvent(attrKeys.home.SWIPE_X_CARD, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.PERSONAL_GUIDE
    });
  }, 300);

  return (
    <section>
      <Box customStyle={{ position: 'relative', padding: '0 20px' }}>
        <Flexbox alignment="flex-start">
          {isLoading && (
            <Flexbox direction="vertical" gap={4} customStyle={{ flexGrow: 1 }}>
              <Skeleton width="100%" maxWidth="120px" height="24px" isRound disableAspectRatio />
              <Skeleton width="100%" maxWidth="100px" height="24px" isRound disableAspectRatio />
            </Flexbox>
          )}
          {!isLoading && (
            <Flexbox direction="vertical" customStyle={{ flexGrow: 1 }}>
              <Typography variant="h3" weight="bold">
                {filterData[guideProductsNum]?.title || ''}
              </Typography>
              <Typography variant="h3" weight="bold">
                {filterData[guideProductsNum]?.name || ''}
              </Typography>
            </Flexbox>
          )}
          <Button
            variant="inline"
            endIcon={<Icon name="CaretRightOutlined" />}
            size="small"
            onClick={handleClickAll}
            customStyle={{ height: 24, padding: 0 }}
          >
            전체보기
          </Button>
        </Flexbox>
      </Box>
      <List onScroll={handleScroll} ref={listScrollRef}>
        {isLoading &&
          Array.from({ length: 10 }).map((_, index) => (
            <ProductGridCardSkeleton
              // eslint-disable-next-line react/no-array-index-key
              key={`home-personal-guide-product-skeleton-${index}`}
              isRound
              hasAreaWithDateInfo={false}
              hasMetaInfo={false}
              compact
              gap={8}
            />
          ))}
        {!isLoading &&
          filterData[guideProductsNum]?.products?.content.map((product, index) => (
            <ProductGridCard
              key={`home-personal-guide-product-${product.id}`}
              product={product}
              isRound
              compact
              gap={8}
              hideProductLabel
              hideMetaCamelInfo
              hideAreaWithDateInfo
              productAtt={{
                name: attrProperty.name.MAIN,
                title: attrProperty.title.PERSONAL_GUIDE,
                id: product.id,
                index: index + 1,
                brand: product.brand.name,
                category: product.category.name,
                parentId: product.category.parentId,
                site: product.site.name,
                price: product.price,
                cluster: product.cluster,
                source: attrProperty.source.MAIN_PERSONAL_GUIDE
              }}
              wishAtt={{
                name: attrProperty.name.MAIN,
                title: attrProperty.title.PERSONAL_GUIDE,
                id: product.id,
                index: index + 1,
                brand: product.brand.name,
                category: product.category.name,
                parentId: product.category.parentId,
                site: product.site.name,
                price: product.price,
                cluster: product.cluster,
                source: attrProperty.source.MAIN_PERSONAL_GUIDE
              }}
              source={attrProperty.source.MAIN_PERSONAL_GUIDE}
            />
          ))}
      </List>
      <Flexbox alignment="center" justifyContent="center" customStyle={{ marginTop: 32 }}>
        <Button
          customStyle={{ borderRadius: 36, width: 44, outline: 'none' }}
          data-left="-1"
          onClick={handleClick}
        >
          <Icon name="CaretLeftOutlined" />
        </Button>
        <Typography
          weight="medium"
          customStyle={{ color: common.ui80, padding: '0 20px', textAlign: 'center' }}
        >
          <span style={{ color: common.ui20, minWidth: 9, display: 'inline-block' }}>
            {guideProductsNum + 1}
          </span>{' '}
          / {filterData.length}
        </Typography>
        <Button
          customStyle={{ borderRadius: 36, width: 44, outline: 'none' }}
          data-right="1"
          onClick={handleClick}
        >
          <Icon name="CaretRightOutlined" />
        </Button>
      </Flexbox>
    </section>
  );
}

const List = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  column-gap: 12px;
  margin-top: 20px;
  padding: 0 20px;
  overflow-x: auto;

  & > div {
    width: 120px;
  }
`;

export default HomePersonalGuideProductList;
