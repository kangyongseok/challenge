import { useCallback, useEffect, useMemo } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import { BottomSheet, Button, Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import type { PageProductResult, Product } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { putProductHoisting, putProductUpdateStatus } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { productStatusCode } from '@constants/product';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';

import { userShopOpenStateFamily, userShopSelectedProductState } from '@recoil/userShop';
import { channelBottomSheetStateFamily } from '@recoil/channel';
import { camelSellerDialogStateFamily, camelSellerTempSaveDataState } from '@recoil/camelSeller';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface UserShopProductManageBottomSheetProps {
  refetchData: () => Promise<void>;
  oldData: unknown[];
  pages: PageProductResult[];
}

function UserShopProductManageBottomSheet({
  refetchData,
  oldData,
  pages
}: UserShopProductManageBottomSheetProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: accessUser } = useQueryAccessUser();
  const {
    theme: {
      palette: {
        secondary: { red }
      }
    }
  } = useTheme();

  const toastStack = useToastStack();

  const [{ open }, setOpenState] = useRecoilState(userShopOpenStateFamily('manage'));
  const {
    id,
    brand,
    category,
    line,
    site,
    status,
    price,
    scoreTotal,
    scoreStatus,
    scoreSeller,
    scorePrice,
    scorePriceAvg,
    scorePriceCount,
    scorePriceRate,
    productSeller
  } = useRecoilValue(userShopSelectedProductState) as Product;
  const resetTempData = useResetRecoilState(camelSellerTempSaveDataState);

  const { mutate: hoistingMutation } = useMutation(putProductHoisting);
  const { mutate: updateMutation, isLoading: isLoadingMutatePutProductUpdateStatus } =
    useMutation(putProductUpdateStatus);

  const setOpenAppDown = useSetRecoilState(camelSellerDialogStateFamily('nonMemberAppdown'));
  const setOpenDelete = useSetRecoilState(userShopOpenStateFamily('deleteConfirm'));
  const setSelectTargetUserBottomSheetState = useSetRecoilState(
    channelBottomSheetStateFamily('selectTargetUser')
  );

  const { isSale, isSoldOut, isReserving, isHiding, isTransferred, isRegisterWait, isUpdateWait } =
    useMemo(
      () => ({
        isSale: status === 0,
        isSoldOut: status === 1,
        isReserving: status === 4,
        isHiding: status === 8,
        isTransferred: productSeller?.type === 3,
        isRegisterWait: status === 20,
        isUpdateWait: status === 21
      }),
      [status, productSeller]
    );

  const userProductsParams = useMemo(
    () => ({
      page: 0,
      status:
        router.query.tab === '0' || !router.query.tab
          ? [Number(router.query.tab || 0), 4, 8, 20, 21]
          : [1]
    }),
    [router.query.tab]
  );

  const getAttProperty = {
    id,
    brand: brand?.name,
    category: category?.name,
    parentCategory: FIRST_CATEGORIES[category?.id as number],
    line,
    site: site?.name,
    price,
    scoreTotal,
    scoreStatus,
    scoreSeller,
    scorePrice,
    scorePriceAvg,
    scorePriceCount,
    scorePriceRate
  };

  const getTitle = useMemo(() => {
    if (status === 0) return attrProperty.title.SALE;
    if (status === 4) return attrProperty.title.RESERVED;
    return attrProperty.title.SOLD;
  }, [status]);

  const getAtt = useCallback((dataStatus: number) => {
    switch (dataStatus) {
      case 0:
        return 'FORSALE';
      case 1:
        return 'SOLD';
      default:
        return 'RESERVED';
    }
  }, []);

  useEffect(() => {
    if (open) {
      logEvent(attrKeys.camelSeller.VIEW_PRODUCT_MODAL, {
        name: attrProperty.name.MY_STORE,
        title: getTitle
      });
    }
  }, [getTitle, open]);

  const handleClickUpdatePosted = () => {
    if (!id) return;
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_MODAL, {
      name: attrProperty.name.MY_STORE,
      title: getTitle,
      att: 'UP',
      ...getAttProperty
    });

    hoistingMutation(
      { productId: id },
      {
        onSuccess() {
          toastStack({
            children: '끌어올리기가 완료되었어요. 👍'
          });
          setOpenState(({ type }) => ({
            type,
            open: false
          }));
          queryClient.setQueryData(queryKeys.users.products(userProductsParams), {
            oldData,
            pages: pages.map((page) => {
              // const findIndex = page.content.findIndex(({ id: oldId }) => oldId === id);
              return {
                ...page,
                content: page.content.map((productList) => {
                  if (productList.id === id) {
                    return {
                      ...productList,
                      datePosted: dayjs().valueOf()
                    };
                  }
                  return productList;
                })
              };
            })
          });
        }
      }
    );
  };

  const handleClickUpdateStatus = (e: MouseEvent<HTMLDivElement>) => {
    if (!id || isLoadingMutatePutProductUpdateStatus) return;

    const dataStatus = Number(e.currentTarget.getAttribute('data-status'));

    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_MODAL, {
      name: attrProperty.name.MY_STORE,
      title: getTitle,
      att: getAtt(dataStatus),
      ...getAttProperty
    });

    queryClient.invalidateQueries(queryKeys.users.infoByUserId(accessUser?.userId || 0));

    if (dataStatus === productStatusCode.soldOut) {
      setOpenState(({ type }) => ({
        type,
        open: false
      }));
      updateMutation(
        { productId: id, status: 1 },
        {
          onSuccess() {
            setTimeout(
              () =>
                setSelectTargetUserBottomSheetState({
                  open: true,
                  isChannel: false,
                  location: 'STORE'
                }),
              300
            );
          },
          onSettled() {
            toastStack({
              children: '판매완료 처리되었어요!'
            });
            setTimeout(() => refetchData(), 500);
          }
        }
      );

      return;
    }

    updateMutation(
      { productId: id, status: dataStatus },
      {
        onSettled: () => {
          if (dataStatus === productStatusCode.forSale) {
            toastStack({
              children: '판매중으로 변경되었어요.'
            });
          } else if (dataStatus === productStatusCode.reservation) {
            toastStack({
              children: '예약중으로 변경되었어요.'
            });
          } else if (dataStatus === productStatusCode.hidden) {
            toastStack({
              children: '숨김 처리되었어요!'
            });
          }

          setOpenState(({ type }) => ({
            type,
            open: false
          }));
          setTimeout(() => refetchData(), 500);
        }
      }
    );
  };

  const handleClickDelete = () => {
    if (!id) return;
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_MODAL, {
      name: attrProperty.name.MY_STORE,
      title: getTitle,
      att: 'DELETE',
      ...getAttProperty
    });
    setOpenState(({ type }) => ({
      type,
      open: false
    }));

    setOpenDelete(({ type }) => ({
      type,
      open: true
    }));
  };

  const handleClickEdit = () => {
    if (!id) return;

    setOpenState(({ type }) => ({
      type,
      open: false
    }));

    if (process.env.NODE_ENV !== 'development') {
      if (!(checkAgent.isIOSApp() || checkAgent.isAndroidApp())) {
        setOpenAppDown(({ type }) => ({
          type,
          open: true
        }));
        return;
      }
    }

    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_MODAL, {
      name: attrProperty.name.MY_STORE,
      title: getTitle,
      att: 'EDIT',
      ...getAttProperty
    });

    SessionStorage.remove(sessionStorageKeys.isFirstVisitCamelSellerRegisterConfirm);
    resetTempData();

    router.push(`/camelSeller/registerConfirm/${id}`);
  };

  return (
    <BottomSheet
      open={open}
      onClose={() =>
        setOpenState(({ type }) => ({
          type,
          open: false
        }))
      }
      disableSwipeable
    >
      <Flexbox direction="vertical" gap={20} customStyle={{ padding: 20 }}>
        <Flexbox direction="vertical">
          {isSale && (
            <>
              <Menu variant="h3" weight="medium" onClick={handleClickUpdatePosted}>
                끌어올리기
              </Menu>
              <Menu variant="h3" weight="medium" data-status={4} onClick={handleClickUpdateStatus}>
                예약중으로 변경
              </Menu>
              <Menu variant="h3" weight="medium" data-status={1} onClick={handleClickUpdateStatus}>
                판매완료로 변경
              </Menu>
              {!isTransferred && (
                <Menu variant="h3" weight="medium" onClick={handleClickEdit}>
                  수정하기
                </Menu>
              )}
              <Menu variant="h3" weight="medium" data-status={8} onClick={handleClickUpdateStatus}>
                숨기기
              </Menu>
            </>
          )}
          {isReserving && (
            <>
              <Menu variant="h3" weight="medium" data-status={1} onClick={handleClickUpdateStatus}>
                판매완료로 변경
              </Menu>
              <Menu variant="h3" weight="medium" data-status={0} onClick={handleClickUpdateStatus}>
                판매중으로 변경
              </Menu>
              {!isTransferred && (
                <Menu variant="h3" weight="medium" onClick={handleClickEdit}>
                  수정하기
                </Menu>
              )}
            </>
          )}
          {isSoldOut && (
            <Menu variant="h3" weight="medium" data-status={0} onClick={handleClickUpdateStatus}>
              판매중으로 변경
            </Menu>
          )}
          {isHiding && (
            <Menu variant="h3" weight="medium" data-status={0} onClick={handleClickUpdateStatus}>
              판매중으로 변경
            </Menu>
          )}
          {(isUpdateWait || isRegisterWait) && (
            <>
              <Menu variant="h3" weight="medium" data-status={0} onClick={handleClickUpdateStatus}>
                판매중으로 변경
              </Menu>
              <Menu variant="h3" weight="medium" data-status={1} onClick={handleClickUpdateStatus}>
                판매완료로 변경
              </Menu>
            </>
          )}
          <Menu
            variant="h3"
            weight="medium"
            onClick={handleClickDelete}
            customStyle={{ color: red.main }}
          >
            삭제
          </Menu>
        </Flexbox>
        <Button
          fullWidth
          variant="ghost"
          size="xlarge"
          onClick={() =>
            setOpenState(({ type }) => ({
              type,
              open: false
            }))
          }
        >
          취소
        </Button>
      </Flexbox>
    </BottomSheet>
  );
}

const Menu = styled(Typography)`
  padding: 12px;
  text-align: center;
  cursor: pointer;
`;

export default UserShopProductManageBottomSheet;
