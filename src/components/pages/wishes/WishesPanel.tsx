import { useEffect, useMemo, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Button, Dialog, Flexbox, Skeleton, Toast, Typography, useTheme } from 'mrcamel-ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import styled from '@emotion/styled';

import { ProductWishesCard, ProductWishesCardSkeleton, TopButton } from '@components/UI/molecules';

import type { CategoryWishesParams } from '@dto/user';
import type { CategoryValue } from '@dto/category';

import { logEvent } from '@library/amplitude';

import { postManage } from '@api/userHistory';
import { deleteWishSoldout, fetchCategoryWishes, postProductsAdd } from '@api/user';

import { productSellerType } from '@constants/user';
import queryKeys from '@constants/queryKeys';
import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { convertStringToArray } from '@utils/common';

import {
  openDeleteToastState,
  openRollbackToastState,
  openSoldoutDialogState,
  removeIdState
} from '@recoil/wishes';
import { deviceIdState, showAppDownloadBannerState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

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
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
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

  const { data: accessUser } = useQueryAccessUser();
  const { data, isLoading, isFetchedAfterMount, refetch } = useQuery(
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
    if (accessUser && data?.categories.length && initialCategories.length === 0) {
      setInitialCategories(data.categories);
    }
  }, [accessUser, data, initialCategories.length, setInitialCategories]);

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
  }, [accessUser, data, setInitialCategories]);

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

  if (isLoading) {
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

  if (!data || !accessUser) {
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

  if (data.userWishes.length === 0) {
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
          isLoading={isLoading}
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
                name={attrProperty.productName.WISH_LIST}
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
                  useChat: wishItem.product.sellerType !== productSellerType.collection
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
        customStyle={{ padding: 20, width: 300 }}
      >
        <Typography weight="medium" customStyle={{ marginBottom: 20, textAlign: 'center' }}>
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
      <Toast open={deleteToast} onClose={() => setDeleteToast(false)} autoHideDuration={4000}>
        <Flexbox justifyContent="space-between" alignment="center" gap={8}>
          <Typography
            weight="medium"
            customStyle={{ flexGrow: 1, color: common.uiWhite, textAlign: 'left' }}
          >
            찜 목록에서 삭제했어요.
          </Typography>
          <RollbackButton variant="solid" onClick={handleClickRollback}>
            되돌리기
          </RollbackButton>
        </Flexbox>
      </Toast>
      <Toast open={rollbackToast} onClose={() => setRollbackToast(false)}>
        삭제한 찜 목록을 다시 저장했어요.
      </Toast>
      <TopButton show name="WISH_LIST" customStyle={{ bottom: hiddenTab === 'legit' ? 105 : 80 }} />
    </>
  );
}

const RollbackButton = styled(Button)`
  background: none;
  padding: 0;
  height: auto;
  text-decoration: underline;
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui80};
`;

export default WishesPanel;
