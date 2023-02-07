import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { BottomSheet, Box, Button, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import { useMutation } from '@tanstack/react-query';
import styled from '@emotion/styled';

import { Badge } from '@components/UI/atoms';

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
      palette: { common }
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

  const isDeletedProduct = productStatusCode.deleted === status;

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
          onSuccess() {
            setTimeout(() => {
              setSelectTargetUserBottomSheetState({
                open: true,
                isChannel: false,
                location: 'PRODUCT_DETAIL'
              });
            }, 500);
            refresh();
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
          refresh();
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
      <SellerBottomNav alignment="center" justifyContent="space-between">
        {status === 0 && (
          <Flexbox
            direction="vertical"
            alignment="center"
            gap={7}
            customStyle={{ flex: 1 }}
            onClick={handleClickHoisting}
          >
            <IconPullUp />
            <Typography
              draggable={false}
              variant="small1"
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
          onClick={handleClickChannel}
        >
          <Box customStyle={{ position: 'relative' }}>
            <Icon name="BnChatOutlined" color="#7B7D85" />
            <CustomBadge
              open={unreadMessageCount > 0}
              type="alone"
              width={unreadMessageCount > 99 ? 20 : 16}
              height={unreadMessageCount > 99 ? 20 : 16}
              unreadMessageCount={unreadMessageCount}
            >
              {getUnreadMessagesCount(unreadMessageCount)}
            </CustomBadge>
          </Box>
          <Typography variant="small1" weight="medium" customStyle={{ color: common.ui60 }}>
            채팅목록
          </Typography>
        </Flexbox>
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
          <IconChangeStatus />
          <Typography
            draggable={false}
            variant="small1"
            weight="medium"
            customStyle={{ color: common.ui60 }}
          >
            상태변경
          </Typography>
        </Flexbox>
        {status !== 1 && (
          <Flexbox
            direction="vertical"
            alignment="center"
            gap={7}
            customStyle={{ flex: 1 }}
            onClick={handleClickEdit}
          >
            <IconEdit />
            <Typography
              draggable={false}
              variant="small1"
              weight="medium"
              customStyle={{ color: common.ui60 }}
            >
              수정
            </Typography>
          </Flexbox>
        )}
        {!isDeletedProduct && (
          <Flexbox
            direction="vertical"
            alignment="center"
            gap={7}
            customStyle={{ flex: 1 }}
            onClick={handleClickDelete}
          >
            <IconDelete />
            <Typography
              draggable={false}
              variant="small1"
              weight="medium"
              customStyle={{ color: common.ui60 }}
            >
              삭제
            </Typography>
          </Flexbox>
        )}
      </SellerBottomNav>
      <BottomSheet
        open={openChangeStatus}
        onClose={() => setOpenChangeStatus(false)}
        disableSwipeable
      >
        <Flexbox direction="vertical" gap={20} customStyle={{ padding: 20 }}>
          <Flexbox direction="vertical">
            {status !== 4 && status !== 8 && (
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
    </StyledWrap>
  );
}

const StyledWrap = styled.div`
  width: 100%;
  min-height: 72px;
  user-select: none;
`;

const SellerBottomNav = styled(Flexbox)`
  position: fixed;
  bottom: 0;
  left: 0;
  background: white;
  width: 100%;
  height: 72px;
  z-index: ${({ theme: { zIndex } }) => zIndex.bottomNav + 1};
  padding: 12px;
  box-shadow: 0px -4px 8px rgba(0, 0, 0, 0.12);
`;

const CustomBadge = styled(Badge)<{ unreadMessageCount: number }>`
  position: absolute;
  top: ${({ unreadMessageCount }) => (unreadMessageCount > 99 ? -7 : -2)}px !important;
  right: ${({ unreadMessageCount }) => (unreadMessageCount > 99 ? -7 : -4)}px !important;
  background-color: ${({ theme: { palette } }) => palette.primary.light};
  font-weight: 500;
`;

const Menu = styled(Typography)`
  padding: 12px;
  text-align: center;
  cursor: pointer;
`;

function IconPullUp() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 3H20V5H4V3ZM12 6.58579L17.4142 12L16 13.4142L13 10.4142V21H11V10.4142L8 13.4142L6.58579 12L12 6.58579Z"
        fill="#7B7D85"
      />
    </svg>
  );
}

function IconChangeStatus() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.9999 2.58578L21.4141 8L15.9999 13.4142L14.5857 12L17.5857 9H6.99991V7H17.5857L14.5857 4L15.9999 2.58578Z"
        fill="#7B7D85"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.41412 12L6.41412 15L16.9999 15V17L6.41412 17L9.41412 20L7.99991 21.4142L2.58569 16L7.99991 10.5858L9.41412 12Z"
        fill="#7B7D85"
      />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.0001 2.58578L21.4143 7L9.51135 18.903L3.62573 20.3744L5.09714 14.4887L17.0001 2.58578ZM16.4143 6L18.0001 7.58579L18.5859 7L17.0001 5.41421L16.4143 6ZM16.5859 9L15.0001 7.41421L6.90306 15.5112L6.37447 17.6256L8.48885 17.097L16.5859 9Z"
        fill="#7B7D85"
      />
    </svg>
  );
}

function IconDelete() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 9V17H13V9H15Z" fill="#7B7D85" />
      <path d="M11 17V9H9V17H11Z" fill="#7B7D85" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 3H8V5H3V7H5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7H21.5V5H16V3ZM7 19V7H17V19H7Z"
        fill="#7B7D85"
      />
    </svg>
  );
}

export default ProductSellerBottomMenu;
