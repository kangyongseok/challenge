import { useEffect, useMemo, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { isEmpty } from 'lodash-es';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from '@mrcamelhub/camel-ui-toast';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Box, Button, Flexbox, Skeleton, Typography } from '@mrcamelhub/camel-ui';

import { ProductWishesCard, ProductWishesCardSkeleton, TopButton } from '@components/UI/molecules';

import type { CategoryWishesParams } from '@dto/user';
import type { CategoryValue } from '@dto/category';

import { logEvent } from '@library/amplitude';

import { postManage } from '@api/userHistory';
import { deleteWishSoldout, fetchCategoryWishes, postProductsAdd } from '@api/user';

import { productType } from '@constants/user';
import queryKeys from '@constants/queryKeys';
import { APP_DOWNLOAD_BANNER_HEIGHT, IOS_SAFE_AREA_BOTTOM } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { convertStringToArray, isExtendedLayoutIOSVersion } from '@utils/common';

import {
  openDeleteToastState,
  openRollbackToastState,
  openSoldoutDialogState,
  removeIdState
} from '@recoil/wishes';
import { deviceIdState, showAppDownloadBannerState } from '@recoil/common';
import useSession from '@hooks/useSession';

import WishesNotice from './WishesNotice';
import type { OrderOptionKeys } from './WishesFilter';
import WishesFilter from './WishesFilter';
import WishesCategories from './WishesCategories';

interface WishesPanelProps {
  categoryWishesParam: CategoryWishesParams;
  selectedCategoryIds: number[];
  setSelectedCategoryIds: Dispatch<SetStateAction<number[]>>;
  initialCategories: CategoryValue[];
  setInitialCategories: Dispatch<SetStateAction<CategoryValue[]>>;
}

function WishesPanel({
  categoryWishesParam,
  selectedCategoryIds,
  setSelectedCategoryIds,
  initialCategories,
  setInitialCategories
}: WishesPanelProps) {
  const router = useRouter();
  const { order = 'updatedDesc', hiddenTab }: { order?: OrderOptionKeys; hiddenTab?: string } =
    router.query;
  const deviceId = useRecoilValue(deviceIdState);
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const [openSoldout, setOpenSoldout] = useRecoilState(openSoldoutDialogState);
  const [deleteToast, setDeleteToast] = useRecoilState(openDeleteToastState);
  const [rollbackToast, setRollbackToast] = useRecoilState(openRollbackToastState);
  const removeId = useRecoilValue(removeIdState);

  const productRefs = useRef<HTMLDivElement[]>([]);

  const queryClient = useQueryClient();

  const { isLoggedIn, data: accessUser } = useSession();
  const { data, isFetchedAfterMount, refetch, isInitialLoading } = useQuery(
    queryKeys.users.categoryWishes(categoryWishesParam),
    () => fetchCategoryWishes(categoryWishesParam),
    {
      refetchOnMount: true,
      enabled: isLoggedIn,
      keepPreviousData: true
    }
  );

  const { mutate } = useMutation(postManage, {
    onSuccess: () => queryClient.invalidateQueries(queryKeys.users.userInfo())
  });
  const { mutate: deleteMutate } = useMutation(deleteWishSoldout, {
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.users.categoryWishes(categoryWishesParam));
      setOpenSoldout(false);
    }
  });
  const { mutate: mutatePostProductsAdd } = useMutation(postProductsAdd);

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
    if (isLoggedIn && data?.categories.length && initialCategories.length === 0) {
      setInitialCategories(data.categories);
    }
  }, [isLoggedIn, data, initialCategories.length, setInitialCategories]);

  useEffect(() => {
    if (isLoggedIn) {
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
  }, [isLoggedIn, data, setInitialCategories]);

  useEffect(() => {
    setSelectedCategoryIds((prevState) =>
      prevState.filter((id) =>
        initialCategories.map(({ id: initialCategoryId }) => initialCategoryId).includes(id)
      )
    );
  }, [initialCategories, setSelectedCategoryIds]);

  useEffect(() => {
    setSelectedCategoryIds(
      convertStringToArray(String(router.query.selectedCategoryIds)).filter((id) => id)
    );
  }, [router.query.selectedCategoryIds, setSelectedCategoryIds]);

  useEffect(() => {
    if (!isLoggedIn) return;

    mutate({
      userId: accessUser?.userId,
      event: 'VIEW_WISH_LIST'
    });
  }, [mutate, isLoggedIn, accessUser]);

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

  const handleClickDeleteCancel = () => {
    logEvent(attrKeys.wishes.CLICK_CLOSE, {
      name: attrProperty.name.deleteSoldoutPopup
    });

    setOpenSoldout(false);
  };

  const handleClickDelete = () => {
    logEvent(attrKeys.wishes.CLICK_DELETESOLDOUT, {
      name: attrProperty.name.deleteSoldoutPopup
    });

    deleteMutate();
  };

  const handleClickRollback = () => {
    logEvent(attrKeys.wishes.CLICK_UNDO, {
      name: attrProperty.name.wishList,
      title: attrProperty.title.wishCamel,
      id: removeId
    });

    mutatePostProductsAdd(
      { productId: removeId, deviceId },
      {
        onSuccess() {
          setRollbackToast(true);
          setDeleteToast(false);
          refetch();
        }
      }
    );
  };

  if (!isInitialLoading && !isLoggedIn) {
    return (
      <WishesNotice
        imgName="login-img"
        moveTo="/login"
        message={
          <>
            <Typography weight="bold" variant="h2" customStyle={{ marginBottom: 8 }}>
              찜❤️이 보이지않나요?
            </Typography>
            <Typography>
              카멜에 로그인하고
              <br />
              똑똑하게 득템하세요 😘
            </Typography>
          </>
        }
        buttonLabel="3초 로그인하기"
        onClickLog={() => {
          logEvent(attrKeys.wishes.CLICK_LOGIN, {
            name: attrProperty.name.wishList
          });
        }}
      />
    );
  }

  if (isInitialLoading && isLoggedIn) {
    return (
      <>
        <Flexbox gap={6} alignment="center" customStyle={{ height: 60 }}>
          <Skeleton width={63} height={33} round={36} disableAspectRatio />
          <Skeleton width={36} height={33} round={36} disableAspectRatio />
          <Skeleton width={45} height={33} round={36} disableAspectRatio />
        </Flexbox>
        <Flexbox customStyle={{ margin: '24px 0 16px' }} gap={4}>
          <Skeleton
            width={50}
            height={32}
            round={8}
            disableAspectRatio
            customStyle={{ marginRight: 'auto' }}
          />
          <Skeleton width={50} height={32} round={8} disableAspectRatio />
          <Skeleton width={105} height={32} round={8} disableAspectRatio />
        </Flexbox>
        <Flexbox direction="vertical" gap={20} customStyle={{ marginBottom: 20 }}>
          {Array.from({ length: 10 }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <ProductWishesCardSkeleton key={`wish-product-card-skeleton-${index}`} isRound />
          ))}
        </Flexbox>
      </>
    );
  }

  if (!isInitialLoading && isEmpty(data?.userWishes) && isLoggedIn) {
    return (
      <WishesNotice
        imgName="wishe-empty-img"
        moveTo="/search"
        message={
          <>
            <Typography weight="bold" variant="h2" customStyle={{ marginBottom: 8 }}>
              찜해보세요!
            </Typography>
            <Typography>
              내 취향 매물, 빠르게 다시 찾고 싶다면
              <br />
              하트를 눌러 명품을 저장해보세요😘
            </Typography>
          </>
        }
        buttonLabel="매물검색 하러가기"
        onClickLog={() => {
          logEvent(attrKeys.wishes.CLICK_SEARCHMODAL, {
            name: attrProperty.name.wishList,
            att: 'CONTENT'
          });
        }}
      />
    );
  }

  return (
    <>
      {hiddenTab !== 'legit' && (
        <WishesCategories
          isLoading={isInitialLoading}
          categories={initialCategories}
          selectedCategoryIds={selectedCategoryIds}
        />
      )}
      {data && (
        <Box customStyle={{ margin: '20px 0' }}>
          <WishesFilter order={order} userWishCount={userWishCount} />
          <Flexbox direction="vertical" gap={20}>
            {userWishes.map((wishItem, index) => (
              <ProductWishesCard
                data-id={wishItem.product.id}
                key={`wish-product-card-${wishItem.product.id}`}
                product={wishItem.product}
                // name={attrProperty.productName.WISH_LIST}
                source={attrProperty.productSource.WISH_LIST}
                onWishAfterChangeCallback={refetch}
                ref={(ref) => {
                  if (ref) {
                    productRefs.current[index] = ref;
                  }
                }}
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
                  source: attrProperty.productSource.WISH_LIST,
                  sellerType: wishItem.product.sellerType,
                  productSellerId: wishItem.product.productSeller.id,
                  productSellerType: wishItem.product.productSeller.type,
                  productSellerAccount: wishItem.product.productSeller.account,
                  useChat: wishItem.product.sellerType !== productType.collection
                }}
              />
            ))}
          </Flexbox>
        </Box>
      )}
      <Dialog
        open={openSoldout}
        onClose={() => {
          setOpenSoldout(false);
        }}
      >
        <Typography weight="medium" textAlign="center" customStyle={{ marginBottom: 20 }}>
          판매가 완료된 매물을
          <br />
          삭제하시겠습니까?
        </Typography>
        <Flexbox alignment="center" gap={7}>
          <Button
            size="large"
            fullWidth
            variant="ghost"
            brandColor="primary"
            onClick={handleClickDeleteCancel}
          >
            취소
          </Button>
          <Button
            size="large"
            fullWidth
            variant="solid"
            brandColor="primary"
            onClick={handleClickDelete}
          >
            확인
          </Button>
        </Flexbox>
      </Dialog>
      <Toast
        open={deleteToast}
        onClose={() => setDeleteToast(false)}
        autoHideDuration={4000}
        action={{
          text: '되돌리기',
          onClick: handleClickRollback
        }}
      >
        찜목록에서 삭제했어요.
      </Toast>
      <Toast open={rollbackToast} onClose={() => setRollbackToast(false)}>
        삭제한 찜목록을 다시 저장했어요.
      </Toast>
      <TopButton
        show
        name="WISH_LIST"
        customStyle={{
          bottom: `calc(${hiddenTab === 'legit' ? 105 : 80}px + ${
            isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_BOTTOM : '0px'
          })`
        }}
      />
    </>
  );
}

export default WishesPanel;
