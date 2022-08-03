import { useEffect, useMemo, useRef, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox, Typography } from 'mrcamel-ui';

import { ProductListCard, ProductListCardSkeleton } from '@components/UI/molecules';
import Skeleton from '@components/UI/atoms/Skeleton';

import type { CategoryValue } from '@dto/category';

import { logEvent } from '@library/amplitude';

import { postManage } from '@api/userHistory';
import { fetchCategoryWishes } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import convertStringToArray from '@utils/convertStringToArray';

import { deviceIdState, showAppDownloadBannerState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

import WishesNotice from './WishesNotice';
import type { OrderOptionKeys } from './WishesFilter';
import WishesFilter from './WishesFilter';
import WishesCategories from './WishesCategories';

function WishesPanel() {
  const router = useRouter();
  const { order = 'updatedDesc' }: { order?: OrderOptionKeys } = router.query;
  const deviceId = useRecoilValue(deviceIdState);
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  const productRefs = useRef<HTMLDivElement[]>([]);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [initialCategories, setInitialCategories] = useState<CategoryValue[]>([]);
  const categoryWishesParam = {
    size: 200,
    sort: [order],
    deviceId
  };

  const queryClient = useQueryClient();

  const { data: accessUser } = useQueryAccessUser();
  const { data, refetch, isLoading, isFetchedAfterMount } = useQuery(
    queryKeys.users.categoryWishes(categoryWishesParam),
    () => fetchCategoryWishes(categoryWishesParam),
    {
      refetchOnMount: true,
      enabled: !!accessUser,
      keepPreviousData: true
    }
  );

  const { mutate } = useMutation(postManage, {
    onSuccess: () => queryClient.invalidateQueries(queryKeys.users.userInfo())
  });

  const userWishes = useMemo(() => {
    if (!data) return [];

    return data.userWishes.filter(
      ({
        product: {
          category: { parentId }
        }
      }) => {
        if (selectedCategoryIds.length) {
          return selectedCategoryIds.includes(parentId || 0);
        }
        return true;
      }
    );
  }, [data, selectedCategoryIds]);

  const userWishCount = useMemo(
    () =>
      initialCategories
        .filter(({ id }) => {
          if (selectedCategoryIds.length) {
            return selectedCategoryIds.includes(id);
          }
          return true;
        })
        .map(({ count }) => count)
        .reduce((a, b) => a + b, 0),
    [initialCategories, selectedCategoryIds]
  );

  // 필터 버튼을 위해 최초 카테고리 정보를 저장
  useEffect(() => {
    if (accessUser && data?.categories.length && initialCategories.length === 0) {
      setInitialCategories(data.categories);
    }
  }, [accessUser, data, initialCategories.length]);

  useEffect(() => {
    if (accessUser) {
      const { categories = [] } = data || {};

      setInitialCategories((prevState) =>
        prevState
          .map((prevCategory) => ({
            ...prevCategory,
            count: (categories.find(({ name }) => name === prevCategory.name) || {}).count || 0
          }))
          .filter(({ count }) => count)
      );
    }
  }, [accessUser, data]);

  useEffect(() => {
    setSelectedCategoryIds((prevState) =>
      prevState.filter((id) =>
        initialCategories.map(({ id: initialCategoryId }) => initialCategoryId).includes(id)
      )
    );
  }, [initialCategories]);

  useEffect(() => {
    setSelectedCategoryIds(
      convertStringToArray(String(router.query.selectedCategoryIds)).filter((id) => id)
    );
  }, [router.query.selectedCategoryIds]);

  useEffect(() => {
    if (!accessUser) return;

    mutate({
      userId: accessUser.userId,
      event: 'VIEW_WISH_LIST'
    });
  }, [mutate, accessUser]);

  useEffect(() => {
    if (router.query.scrollToProductId && isFetchedAfterMount && data) {
      const product = productRefs.current.find(
        (productRef) =>
          Number(productRef.getAttribute('data-id') || 0) === Number(router.query.scrollToProductId)
      );

      if (product) {
        window.scrollTo(
          0,
          product.offsetTop - 171 - (showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0)
        );
        const newQuery = router.query;
        delete newQuery.scrollToProductId;
        router.replace(
          {
            pathname: router.pathname,
            query: newQuery
          },
          undefined,
          {
            shallow: true
          }
        );
      }
    }
  }, [router, isFetchedAfterMount, data, showAppDownloadBanner]);

  if (isLoading) {
    return (
      <>
        <Flexbox gap={6} customStyle={{ margin: '16px 0 24px' }}>
          <Skeleton
            width="45px"
            height="30px"
            disableAspectRatio
            customStyle={{ borderRadius: 4 }}
          />
          <Skeleton
            width="45px"
            height="30px"
            disableAspectRatio
            customStyle={{ borderRadius: 4 }}
          />
          <Skeleton
            width="45px"
            height="30px"
            disableAspectRatio
            customStyle={{ borderRadius: 4 }}
          />
        </Flexbox>
        <Flexbox justifyContent="space-between" customStyle={{ marginBottom: 16 }}>
          <Skeleton width="30px" height="18px" disableAspectRatio isRound />
          <Skeleton width="50px" height="18px" disableAspectRatio isRound />
        </Flexbox>
        <Flexbox direction="vertical" gap={20} customStyle={{ marginBottom: 20 }}>
          {Array.from({ length: 10 }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <ProductListCardSkeleton key={`wish-product-card-skeleton-${index}`} isRound />
          ))}
        </Flexbox>
      </>
    );
  }

  if (!data || !accessUser) {
    return (
      <WishesNotice
        icon="❤"
        moveTo="/login"
        message={
          <>
            로그인하고
            <br />
            똑똑하게 득템하세요!
          </>
        }
        buttonLabel="3초 로그인하기"
        onClickLog={() => {
          logEvent(attrKeys.wishes.CLICK_LOGIN, {
            name: 'WISH_LIST'
          });
        }}
      />
    );
  }

  if (data.userWishes.length === 0) {
    return (
      <WishesNotice
        icon="❤"
        moveTo="/search"
        message={
          <>
            마음에 드는 명품을 찜해보세요
            <Typography
              customStyle={{
                paddingTop: 8
              }}
            >
              내 취향 매물, 빠르게 다시 찾고 싶다면
              <br />
              하트를 눌러 명품을 저장해보세요
            </Typography>
          </>
        }
        buttonLabel="매물검색 하러가기"
        onClickLog={() => {
          logEvent(attrKeys.wishes.CLICK_SEARCHMODAL, {
            name: 'WISH_LIST',
            att: 'CONTENT'
          });
        }}
      />
    );
  }

  return (
    <>
      <WishesCategories categories={initialCategories} selectedCategoryIds={selectedCategoryIds} />
      {data && (
        <Box
          customStyle={{
            margin: '67px 0 12px 0'
          }}
        >
          <WishesFilter order={order} userWishCount={userWishCount} />
          <Flexbox direction="vertical" gap={20}>
            {userWishes.map((wishItem, index) => (
              <ProductListCard
                key={`wish-product-card-${wishItem.product.id}`}
                ref={(ref) => {
                  if (ref) {
                    productRefs.current[index] = ref;
                  }
                }}
                product={wishItem.product}
                hideAlert={false}
                name={attrProperty.productName.WISH_LIST}
                productAtt={{
                  name: attrProperty.productName.WISH_LIST,
                  index: index + 1,
                  id: wishItem.product.id,
                  brand: wishItem.product.brand.name,
                  category: wishItem.product.category.name,
                  line: wishItem.product.line,
                  site: wishItem.product.site.name,
                  price: wishItem.product.price,
                  scoreTotal: wishItem.product.scoreTotal,
                  scoreStatus: wishItem.product.scoreStatus,
                  scoreSeller: wishItem.product.scoreSeller,
                  scorePrice: wishItem.product.scorePrice,
                  scorePriceAvg: wishItem.product.scorePriceAvg,
                  scorePriceCount: wishItem.product.scorePriceCount,
                  scorePriceRate: wishItem.product.scorePriceRate,
                  source: attrProperty.productSource.WISH_LIST
                }}
                onWishAfterChangeCallback={refetch}
                data-id={wishItem.product.id}
                isRound
              />
            ))}
          </Flexbox>
        </Box>
      )}
    </>
  );
}

export default WishesPanel;
