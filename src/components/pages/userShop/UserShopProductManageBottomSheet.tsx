import { MouseEvent, useCallback, useEffect, useMemo } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useMutation } from 'react-query';
import { useRouter } from 'next/router';
import { BottomSheet, Box, Button, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';

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
  const setOpenSoldoutState = useSetRecoilState(userShopOpenStateFamily('soldOutConfirm'));
  const product = useRecoilValue(userShopSelectedProductState);
  const { mutate: hoistingMutation } = useMutation(putProductHoisting);
  const { mutate: updateMutation } = useMutation(putProductUpdateStatus);
  const setToastState = useSetRecoilState(toastState);
  const setOpenAppDown = useSetRecoilState(camelSellerDialogStateFamily('nonMemberAppdown'));
  const setOpenDelete = useSetRecoilState(userShopOpenStateFamily('deleteConfirm'));

  const { isSale, isSoldOut, isReserving } = useMemo(
    () => ({
      isSale: product.status === 0,
      isSoldOut: product.status === 1,
      isReserving: product.status === 4
    }),
    [product.status]
  );

  const getAttProperty = {
    id: product.id,
    brand: product?.brand?.name,
    category: product?.category?.name,
    parentCategory: FIRST_CATEGORIES[product.category?.id as number],
    line: product.line,
    site: product.site?.name,
    price: product.price,
    scoreTotal: product.scoreTotal,
    scoreStatus: product.scoreStatus,
    scoreSeller: product.scoreSeller,
    scorePrice: product.scorePrice,
    scorePriceAvg: product.scorePriceAvg,
    scorePriceCount: product.scorePriceCount,
    scorePriceRate: product.scorePriceRate
  };

  const getTitle = useMemo(() => {
    if (product.status === 0) return attrProperty.title.SALE;
    if (product.status === 4) return attrProperty.title.RESERVED;
    return attrProperty.title.SOLD;
  }, [product.status]);

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
    if (!product.id) return;
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_MODAL, {
      name: attrProperty.name.MY_STORE,
      title: getTitle,
      att: 'UP',
      ...getAttProperty
    });

    hoistingMutation(
      { productId: product.id },
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
    if (!product.id) return;
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
      setTimeout(() => {
        setOpenSoldoutState(({ type }) => ({ type, open: true }));
      }, 500);
      return;
    }
    updateMutation(
      { productId: product.id, status: dataStatus },
      {
        onSettled: () => {
          // if (dataStatus === 1) {
          //   setToastState({
          //     type: 'sellerProductState',
          //     status: 'soldout',
          //     customStyle: { bottom: TOAST_BOTTOM }
          //   });
          // }
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
    if (!product.id) return;
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
    if (!product.id) return;

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

    // LocalStorage.remove(CAMEL_SELLER);
    router.push(`/camelSeller/registerConfirm/${product.id}`);
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
      <Box customStyle={{ padding: 20 }}>
        {isSale && (
          <>
            <Flexbox
              gap={12}
              alignment="center"
              onClick={handleClickUpdatePosted}
              customStyle={{ height: 48, cursor: 'pointer' }}
            >
              <Icon name="PullUpOutlined" />
              <Typography>끌어올리기</Typography>
            </Flexbox>
            <Flexbox
              gap={12}
              alignment="center"
              onClick={handleClickUpdateStatus}
              data-status={4}
              customStyle={{ height: 48, cursor: 'pointer' }}
            >
              <Icon name="TimeOutlined" />
              <Typography>예약중으로 변경</Typography>
            </Flexbox>
            <Flexbox
              gap={12}
              alignment="center"
              onClick={handleClickUpdateStatus}
              data-status={1}
              customStyle={{ height: 48, cursor: 'pointer' }}
            >
              <Icon name="CheckOutlined" />
              <Typography>판매완료로 변경</Typography>
            </Flexbox>
            <Flexbox
              gap={12}
              alignment="center"
              customStyle={{ height: 48, cursor: 'pointer' }}
              onClick={handleClickEdit}
            >
              <Icon name="EditOutlined" />
              <Typography>수정하기</Typography>
            </Flexbox>
          </>
        )}
        {isReserving && (
          <>
            <Flexbox
              gap={12}
              alignment="center"
              onClick={handleClickUpdateStatus}
              data-status={1}
              customStyle={{ height: 48, cursor: 'pointer' }}
            >
              <Icon name="CheckOutlined" />
              <Typography>판매완료로 변경</Typography>
            </Flexbox>
            <Flexbox
              gap={12}
              alignment="center"
              onClick={handleClickUpdateStatus}
              data-status={0}
              customStyle={{ height: 48, cursor: 'pointer' }}
            >
              <Icon name="BoxOutlined" />
              <Typography>판매중으로 변경</Typography>
            </Flexbox>
            <Flexbox
              gap={12}
              alignment="center"
              customStyle={{ height: 48, cursor: 'pointer' }}
              onClick={handleClickEdit}
            >
              <Icon name="EditOutlined" />
              <Typography>수정하기</Typography>
            </Flexbox>
          </>
        )}
        {isSoldOut && (
          <Flexbox
            gap={12}
            alignment="center"
            onClick={handleClickUpdateStatus}
            data-status={0}
            customStyle={{ height: 48, cursor: 'pointer' }}
          >
            <Icon name="BoxOutlined" />
            <Typography>판매중으로 변경</Typography>
          </Flexbox>
        )}
        <Flexbox
          gap={12}
          alignment="center"
          onClick={handleClickDelete}
          customStyle={{ height: 48, cursor: 'pointer' }}
        >
          <Icon name="DeleteOutlined" color={red.main} />
          <Typography customStyle={{ color: red.main }}>삭제</Typography>
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
          customStyle={{ marginTop: 20 }}
        >
          취소
        </Button>
      </Box>
    </BottomSheet>
  );
}

export default UserShopProductManageBottomSheet;
