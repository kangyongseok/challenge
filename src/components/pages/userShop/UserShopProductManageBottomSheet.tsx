import { MouseEvent, useCallback, useEffect, useMemo } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useMutation } from 'react-query';
import { useRouter } from 'next/router';
import { BottomSheet, Button, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import type { Product } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { putProductHoisting, putProductUpdateStatus } from '@api/product';

import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';

import { userShopOpenStateFamily, userShopSelectedProductState } from '@recoil/userShop';
import { toastState } from '@recoil/common';
import { camelSellerDialogStateFamily } from '@recoil/camelSeller';

const TOAST_BOTTOM = 20;

function UserShopProductManageBottomSheet() {
  const router = useRouter();
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
    scorePriceRate,
    isNoSellerReviewAndHasTarget = false
  } = useRecoilValue(userShopSelectedProductState) as Product & {
    isNoSellerReviewAndHasTarget?: boolean;
  };

  const { mutate: hoistingMutation } = useMutation(putProductHoisting);
  const { mutate: updateMutation, isLoading: isLoadingMutatePutProductUpdateStatus } =
    useMutation(putProductUpdateStatus);

  const setToastState = useSetRecoilState(toastState);
  const setOpenAppDown = useSetRecoilState(camelSellerDialogStateFamily('nonMemberAppdown'));
  const setOpenDelete = useSetRecoilState(userShopOpenStateFamily('deleteConfirm'));
  const setOpenSoldOutFeedbackState = useSetRecoilState(userShopOpenStateFamily('soldOutFeedback'));

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

    if (dataStatus === 1) {
      setOpenState(({ type }) => ({
        type,
        open: false
      }));
      updateMutation(
        { productId: id, status: 1 },
        {
          onSuccess() {
            if (isNoSellerReviewAndHasTarget) {
              router.push({
                pathname: '/channels',
                query: {
                  productId: id,
                  isSelectTargetUser: true
                }
              });
            } else {
              setOpenSoldOutFeedbackState(({ type }) => ({
                type,
                open: true
              }));
            }
          }
        }
      );

      return;
    }
    updateMutation(
      { productId: id, status: dataStatus },
      {
        onSettled: () => {
          if (dataStatus === 0) {
            setToastState({
              type: 'sellerProductState',
              status: 'sell',
              customStyle: { bottom: TOAST_BOTTOM }
            });
          } else if (dataStatus === 4) {
            setToastState({
              type: 'sellerProductState',
              status: 'reserve',
              customStyle: { bottom: TOAST_BOTTOM }
            });
          }

          setOpenState(({ type }) => ({
            type,
            open: false
          }));
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
            <Menu variant="h3" weight="medium" data-status={8} onClick={handleClickUpdateStatus}>
              숨기기
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
