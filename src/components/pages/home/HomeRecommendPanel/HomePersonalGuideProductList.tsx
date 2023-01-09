import { useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Icon, Skeleton, Typography, useTheme } from 'mrcamel-ui';
import { debounce, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import styled from '@emotion/styled';

import { NewProductGridCard, NewProductGridCardSkeleton } from '@components/UI/molecules';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';
import ABTest from '@library/abTest';

import { fetchGuideAllProducts } from '@api/personal';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';
import abTestTaskNameKeys from '@constants/abTestTaskNameKeys';

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
    data: products = [],
    isLoading,
    refetch
  } = useQuery(queryKeys.personals.guideAllProducts(), () => fetchGuideAllProducts(), {
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true
  });

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

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    logEvent(attrKeys.home.CLICK_REFRESH_PRODUCT, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.PERSONAL_GUIDE
    });

    (listScrollRef.current as HTMLDivElement).scrollTo(0, 0);

    if (target.dataset.left) {
      if (guideProductsNum === 0) {
        setGuideProductsNum(products.length - 1);
        return;
      }
      setGuideProductsNum((props) => props - 1);
      return;
    }

    if (target.dataset.right) {
      if (guideProductsNum === products.length - 1) {
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

    if (!isEmpty(products)) {
      if (isLoading || !products[guideProductsNum].name) return;
      const genderSizeType = products[guideProductsNum].purchaseTypeValue === 40;
      const origin: { [propsName: string]: string } = {
        idFilterIds: products[guideProductsNum].idFilter,
        distance: products[guideProductsNum].distance
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
        pathname: `/products/search/${products[guideProductsNum].name}`,
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
              <Skeleton width="100%" maxWidth={120} height={24} round={8} disableAspectRatio />
              <Skeleton width="100%" maxWidth={100} height={24} round={8} disableAspectRatio />
            </Flexbox>
          )}
          {!isLoading && (
            <Flexbox direction="vertical" customStyle={{ flexGrow: 1 }}>
              <Typography variant="h3" weight="bold">
                {products[guideProductsNum]?.title || ''}
              </Typography>
              <Typography variant="h3" weight="bold">
                {products[guideProductsNum]?.name || ''}
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
      <List
        onScroll={handleScroll}
        ref={listScrollRef}
        css={{
          minHeight: ABTest.getBelong(abTestTaskNameKeys.BETTER_CARD_2301) === 'C' ? 222 : 286
        }}
      >
        {isLoading &&
          Array.from({ length: 10 }).map((_, index) => (
            <NewProductGridCardSkeleton
              // eslint-disable-next-line react/no-array-index-key
              key={`home-personal-guide-product-skeleton-${index}`}
              variant="swipeX"
              isRound
            />
          ))}
        {!isLoading &&
          products[guideProductsNum]?.products?.content.map((product, index) => (
            <NewProductGridCard
              key={`home-personal-guide-product-${product.id}`}
              variant="swipeX"
              product={product}
              isRound
              attributes={{
                name: attrProperty.name.MAIN,
                title: attrProperty.title.PERSONAL_GUIDE,
                source: attrProperty.source.MAIN_PERSONAL_GUIDE,
                index: index + 1
              }}
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
          / {products.length}
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
