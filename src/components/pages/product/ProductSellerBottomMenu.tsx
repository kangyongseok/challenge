import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { BottomSheet, Button, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import { useMutation } from '@tanstack/react-query';
import styled from '@emotion/styled';

import type { Product } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import Sendbird from '@library/sendbird';
import { logEvent } from '@library/amplitude';

import { putProductHoisting, putProductUpdateStatus } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import { productStatusCode } from '@constants/product';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getTenThousandUnitPrice } from '@utils/formats';
import { checkAgent, needUpdateChatIOSVersion } from '@utils/common';
import { getUnreadMessagesCount } from '@utils/channel';

import { userShopOpenStateFamily, userShopSelectedProductState } from '@recoil/userShop';
import { dialogState, toastState } from '@recoil/common';
import { channelBottomSheetStateFamily, sendbirdState } from '@recoil/channel';
import { camelSellerDialogStateFamily, camelSellerTempSaveDataState } from '@recoil/camelSeller';

function ProductSellerBottomMenu({
  status,
  product,
  refresh
}: {
  status: number;
  product: Product | undefined;
  refresh: () => void;
}) {
  const {
    theme: {
      palette: { primary, secondary, common }
    }
  } = useTheme();
  const router = useRouter();
  const queryId = router.query.id as string;
  const splitRouter = queryId?.split('-');
  const parameter = {
    productId:
      splitRouter.length === 1 ? Number(queryId) : Number(splitRouter[splitRouter.length - 1])
  };

  const { initialized } = useRecoilValue(sendbirdState);

  const setDialogState = useSetRecoilState(dialogState);
  const setToastState = useSetRecoilState(toastState);
  const setOpenDelete = useSetRecoilState(userShopOpenStateFamily('deleteConfirm'));
  const setOpenAppDown = useSetRecoilState(camelSellerDialogStateFamily('nonMemberAppdown'));
  const setUserShopSelectedProductState = useSetRecoilState(userShopSelectedProductState);
  const resetTempData = useResetRecoilState(camelSellerTempSaveDataState);
  const setSelectTargetUserBottomSheetState = useSetRecoilState(
    channelBottomSheetStateFamily('selectTargetUser')
  );

  const { mutate: hoistingMutation } = useMutation(putProductHoisting);
  const { mutate: updateMutation } = useMutation(putProductUpdateStatus);

  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [openChangeStatus, setOpenChangeStatus] = useState(false);
  const [openMore, setOpenMore] = useState(false);

  const isDeletedProduct = productStatusCode.deleted === status;
  const isTransferred =
    (product?.productSeller?.type === 0 && product?.site?.id === 34) ||
    product?.productSeller?.type === 4;

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

  const getAttProperty = {
    id: product?.id,
    brand: product?.brand.name,
    category: product?.category.name,
    parentCategory: FIRST_CATEGORIES[product?.category.id as number],
    line: product?.line,
    site: product?.site.name,
    price: product?.price,
    scoreTotal: product?.scoreTotal,
    scoreStatus: product?.scoreStatus,
    scoreSeller: product?.scoreSeller,
    scorePrice: product?.scorePrice,
    scorePriceAvg: product?.scorePriceAvg,
    scorePriceCount: product?.scorePriceCount,
    scorePriceRate: product?.scorePriceRate
  };

  const handleClickStatus = (e: MouseEvent<HTMLDivElement>) => {
    const { dataset } = e.currentTarget as HTMLDivElement;

    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_MODAL, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: getTitle,
      att: getAtt(Number(dataset.statusId)),
      ...getAttProperty
    });

    if (Number(dataset.statusId) === 1) {
      setOpenChangeStatus(false);

      updateMutation(
        { productId: parameter.productId, status: 1 },
        {
          onSettled() {
            refresh();
          },
          onSuccess() {
            setTimeout(() => {
              setSelectTargetUserBottomSheetState({
                open: true,
                isChannel: false,
                location: 'PRODUCT_DETAIL'
              });
            }, 500);
          }
        }
      );

      return;
    }

    updateMutation(
      {
        ...parameter,
        status: Number(dataset.statusId)
      },
      {
        onSettled() {
          refresh();
        },
        onSuccess() {
          if (Number(dataset.statusId) === 0) {
            setToastState({
              type: 'sellerProductState',
              status: 'sell'
            });
          } else if (Number(dataset.statusId) === 4) {
            setToastState({
              type: 'sellerProductState',
              status: 'reserve'
            });
          }
          setOpenChangeStatus(false);
        }
      }
    );
  };

  const handleClickEdit = () => {
    if (process.env.NODE_ENV !== 'development') {
      if (!(checkAgent.isIOSApp() || checkAgent.isAndroidApp())) {
        setOpenAppDown(({ type }) => ({
          type,
          open: true
        }));
        return;
      }
    }

    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_EDIT, {
      name: attrProperty.name.PRODUCT_DETAIL,
      ...getAttProperty
    });

    SessionStorage.remove(sessionStorageKeys.isFirstVisitCamelSellerRegisterConfirm);
    resetTempData();

    router.push(`/camelSeller/registerConfirm/${parameter.productId}`);
  };

  const handleClickHoisting = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_MODAL, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: getTitle,
      att: 'UP',
      ...getAttProperty
    });

    hoistingMutation(parameter, {
      onSuccess() {
        setToastState({
          type: 'sellerProductState',
          status: 'hoisting'
        });
        setOpenChangeStatus(false);
      }
    });
  };

  const handleClickChannel = () => {
    logEvent(attrKeys.channel.CLICK_CHANNEL, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: attrProperty.title.PRODUCT
    });

    if (needUpdateChatIOSVersion()) {
      setDialogState({
        type: 'requiredAppUpdateForChat',
        customStyleTitle: { minWidth: 270 },
        disabledOnClose: true,
        secondButtonAction: () => {
          window.webkit?.messageHandlers?.callExecuteApp?.postMessage?.(
            'itms-apps://itunes.apple.com/app/id1541101835'
          );
        }
      });

      return;
    }

    router.push({
      pathname: '/channels',
      query: { productId: parameter.productId }
    });
  };

  const handleClickDelete = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_MODAL, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: getTitle,
      att: 'DELETE',
      ...getAttProperty
    });

    setUserShopSelectedProductState({ id: product?.id });

    setOpenDelete(({ type }) => ({
      type,
      open: true
    }));
  };

  useEffect(() => {
    if (initialized) {
      Sendbird.getCustomTypeChannels(String(parameter.productId)).then((channels) => {
        if (channels) {
          setUnreadMessageCount(
            channels.map((channel) => channel.unreadMessageCount).reduce((a, b) => a + b, 0)
          );
        }
      });
    }
  }, [parameter.productId, initialized]);

  return (
    <StyledWrap>
      <SellerBottomNav alignment="center" justifyContent="space-between" gap={8}>
        <Flexbox
          direction="vertical"
          gap={4}
          customStyle={{
            minWidth: 112,
            borderRight: `1px solid ${common.line01}`
          }}
        >
          <Typography
            weight="bold"
            customStyle={{
              fontSize: 20
            }}
          >
            {getTenThousandUnitPrice(product?.price || 0)}만원
          </Typography>
          <Typography
            weight="medium"
            onClick={handleClickChannel}
            customStyle={{
              color: primary.light
            }}
          >
            채팅목록 {getUnreadMessagesCount(unreadMessageCount)}
          </Typography>
        </Flexbox>
        <Flexbox
          customStyle={{
            flexGrow: 1
          }}
        >
          {status === 0 && (
            <Flexbox
              direction="vertical"
              alignment="center"
              gap={7}
              customStyle={{ flex: 1 }}
              onClick={handleClickHoisting}
            >
              <Icon name="PullUpOutlined" color={common.ui60} />
              <Typography
                draggable={false}
                variant="body2"
                weight="medium"
                customStyle={{ color: common.ui60 }}
              >
                끌어올리기
              </Typography>
            </Flexbox>
          )}
          <Flexbox
            direction="vertical"
            alignment="center"
            gap={7}
            customStyle={{ flex: 1 }}
            onClick={() => {
              setOpenChangeStatus(true);
              if (product) setUserShopSelectedProductState(product);
            }}
          >
            <Icon name="ChangeStatusOutlined" color={common.ui60} />
            <Typography
              draggable={false}
              variant="body2"
              weight="medium"
              customStyle={{ color: common.ui60 }}
            >
              상태변경
            </Typography>
          </Flexbox>
          <Flexbox
            direction="vertical"
            alignment="center"
            gap={7}
            customStyle={{ flex: 1 }}
            onClick={() => setOpenMore(true)}
          >
            <Icon name="MoreHorizFilled" color={common.ui60} />
            <Typography
              draggable={false}
              variant="body2"
              weight="medium"
              customStyle={{ color: common.ui60 }}
            >
              더보기
            </Typography>
          </Flexbox>
        </Flexbox>
      </SellerBottomNav>
      <BottomSheet
        open={openChangeStatus}
        onClose={() => setOpenChangeStatus(false)}
        disableSwipeable
      >
        <Flexbox direction="vertical" gap={20} customStyle={{ padding: 20 }}>
          <Flexbox direction="vertical">
            {status !== 4 && status !== 8 && isTransferred && (
              <Menu variant="h3" weight="medium" data-status-id={4} onClick={handleClickStatus}>
                예약중으로 변경
              </Menu>
            )}
            {status !== 1 && status !== 8 && (
              <Menu variant="h3" weight="medium" data-status-id={1} onClick={handleClickStatus}>
                판매완료로 변경
              </Menu>
            )}
            {status !== 0 && (
              <Menu variant="h3" weight="medium" data-status-id={0} onClick={handleClickStatus}>
                판매중으로 변경
              </Menu>
            )}
            {status === 0 && (
              <Menu variant="h3" weight="medium" data-status-id={8} onClick={handleClickStatus}>
                숨기기
              </Menu>
            )}
          </Flexbox>
          <Button
            fullWidth
            variant="ghost"
            brandColor="black"
            size="xlarge"
            onClick={() => setOpenChangeStatus(false)}
          >
            취소
          </Button>
        </Flexbox>
      </BottomSheet>
      <BottomSheet open={openMore} onClose={() => setOpenMore(false)} disableSwipeable>
        <Flexbox direction="vertical" gap={20} customStyle={{ padding: 20 }}>
          <Flexbox direction="vertical">
            {status !== 1 && isTransferred && (
              <Menu variant="h3" weight="medium" data-status-id={8} onClick={handleClickEdit}>
                수정
              </Menu>
            )}
            {!isDeletedProduct && (
              <Menu
                variant="h3"
                weight="medium"
                data-status-id={8}
                onClick={handleClickDelete}
                customStyle={{
                  color: secondary.red.light
                }}
              >
                삭제
              </Menu>
            )}
          </Flexbox>
          <Button
            fullWidth
            variant="ghost"
            brandColor="black"
            size="xlarge"
            onClick={() => setOpenMore(false)}
          >
            취소
          </Button>
        </Flexbox>
      </BottomSheet>
    </StyledWrap>
  );
}

const StyledWrap = styled.div`
  width: 100%;
  min-height: 77px;
`;

const SellerBottomNav = styled(Flexbox)`
  position: fixed;
  bottom: 0;
  left: 0;
  background: white;
  width: 100%;
  height: 77px;
  z-index: ${({ theme: { zIndex } }) => zIndex.bottomNav + 1};
  padding: 13px 12px 13px 20px;
  box-shadow: 0px -4px 8px rgba(0, 0, 0, 0.12);
`;

const Menu = styled(Typography)`
  padding: 12px;
  text-align: center;
  cursor: pointer;
`;

export default ProductSellerBottomMenu;
