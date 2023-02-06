import { MouseEvent, useCallback, useEffect, useMemo } from 'react';

import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { BottomSheet, Button, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import type { Product } from '@dto/product';

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
import { toastState } from '@recoil/common';
import { channelBottomSheetStateFamily } from '@recoil/channel';
import { camelSellerDialogStateFamily, camelSellerTempSaveDataState } from '@recoil/camelSeller';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

const TOAST_BOTTOM = 20;

interface UserShopProductManageBottomSheetProps {
  refetchData: () => Promise<void>;
}

function UserShopProductManageBottomSheet({ refetchData }: UserShopProductManageBottomSheetProps) {
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
    scorePriceRate
  } = useRecoilValue(userShopSelectedProductState) as Product;
  const resetTempData = useResetRecoilState(camelSellerTempSaveDataState);

  const { mutate: hoistingMutation } = useMutation(putProductHoisting);
  const { mutate: updateMutation, isLoading: isLoadingMutatePutProductUpdateStatus } =
    useMutation(putProductUpdateStatus);

  const setToastState = useSetRecoilState(toastState);
  const setOpenAppDown = useSetRecoilState(camelSellerDialogStateFamily('nonMemberAppdown'));
  const setOpenDelete = useSetRecoilState(userShopOpenStateFamily('deleteConfirm'));
  const setSelectTargetUserBottomSheetState = useSetRecoilState(
    channelBottomSheetStateFamily('selectTargetUser')
  );

  const { isSale, isSoldOut, isReserving, isHiding } = useMemo(
    () => ({
      isSale: status === 0,
      isSoldOut: status === 1,
      isReserving: status === 4,
      isHiding: status === 8
    }),
    [status]
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
          setToastState({
            type: 'sellerProductState',
            status: 'hoisting',
            customStyle: { bottom: TOAST_BOTTOM }
          });
          setOpenState(({ type }) => ({
            type,
            open: false
          }));
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
            setToastState({
              type: 'sellerProductState',
              status: 'soldout',
              customStyle: { bottom: TOAST_BOTTOM }
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
          if (dataStatus === productStatusCode.sale) {
            setToastState({
              type: 'sellerProductState',
              status: 'sell',
              customStyle: { bottom: TOAST_BOTTOM }
            });
          } else if (dataStatus === productStatusCode.reservation) {
            setToastState({
              type: 'sellerProductState',
              status: 'reserve',
              customStyle: { bottom: TOAST_BOTTOM }
            });
          } else if (dataStatus === productStatusCode.hidden) {
            setToastState({
              type: 'sellerProductState',
              status: 'hide',
              customStyle: { bottom: TOAST_BOTTOM }
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
              <Menu variant="h3" weight="medium" onClick={handleClickEdit}>
                수정하기
              </Menu>
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
              <Menu variant="h3" weight="medium" onClick={handleClickEdit}>
                수정하기
              </Menu>
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
