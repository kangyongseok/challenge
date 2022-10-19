import { useCallback, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';

import { useSetRecoilState } from 'recoil';
import { useMutation } from 'react-query';
import { useRouter } from 'next/router';
import { BottomSheet, Button, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { putProductHoisting, putProductUpdateStatus } from '@api/product';

import { CAMEL_SELLER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';

import { userShopOpenStateFamily } from '@recoil/userShop';
import { toastState } from '@recoil/common';
import { camelSellerDialogStateFamily } from '@recoil/camelSeller';

const TOAST_BOTTOM = 20;

function ProductSellerBottomMenu({ status }: { status: number }) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const router = useRouter();
  const { id } = router.query;
  const parameter = { productId: Number(id) };
  const setToastState = useSetRecoilState(toastState);
  const setOpenDelete = useSetRecoilState(userShopOpenStateFamily('deleteConfirm'));
  const { mutate: hoistingMutation } = useMutation(putProductHoisting);
  const { mutate: updateMutation } = useMutation(putProductUpdateStatus);
  const [openChangeStatus, setOpenChangeStatus] = useState(false);
  const setOpenAppDown = useSetRecoilState(camelSellerDialogStateFamily('nonMemberAppdown'));

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

  const handleClickStatus = (e: MouseEvent<HTMLDivElement>) => {
    const { dataset } = e.currentTarget as HTMLDivElement;
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_MODAL, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: getTitle,
      att: getAtt(Number(dataset.statusId))
    });

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
              status: 'sell',
              customStyle: { bottom: TOAST_BOTTOM }
            });
          } else if (Number(dataset.statusId) === 4) {
            setToastState({
              type: 'sellerProductState',
              status: 'reserve',
              customStyle: { bottom: TOAST_BOTTOM }
            });
          }

          setOpenChangeStatus(false);
          router.push('/user/shop');
        }
      }
    );
  };

  const handleClickEdit = () => {
    if (process.env.NODE_ENV !== 'development') {
      if (!(checkAgent.isAndroidApp() || checkAgent.isIOSApp())) {
        setOpenAppDown(({ type }) => ({
          type,
          open: true
        }));
        return;
      }
    }

    LocalStorage.remove(CAMEL_SELLER);
    router.push(`/camelSeller/registerConfirm?id=${router.query.id}`);
  };

  const handleClickHoisting = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_MODAL, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: getTitle,
      att: 'UP'
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

  const handleClickDelete = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_MODAL, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: getTitle,
      att: 'DELETE'
    });

    setOpenDelete(({ type }) => ({
      type,
      open: true
    }));

    // deleteMutation(parameter, {
    //   onSuccess() {
    //     setToastState({
    //       type: 'sellerProductState',
    //       status: 'deleted',
    //       customStyle: { bottom: TOAST_BOTTOM }
    //     });
    //     setOpenChangeStatus(false);
    //     router.replace('/user/shop');
    //   }
    // });
  };

  return (
    <StyledWrap>
      <SellerBottomNav alignment="center" justifyContent="space-between">
        <Flexbox
          direction="vertical"
          alignment="center"
          gap={7}
          customStyle={{ flex: 1 }}
          onClick={handleClickHoisting}
        >
          <IconPullUp />
          <Typography variant="small1" weight="medium" customStyle={{ color: common.ui60 }}>
            끌어올리기
          </Typography>
        </Flexbox>
        <Flexbox
          direction="vertical"
          alignment="center"
          gap={7}
          customStyle={{ flex: 1 }}
          onClick={() => setOpenChangeStatus(true)}
        >
          <IconChangeStatus />
          <Typography variant="small1" weight="medium" customStyle={{ color: common.ui60 }}>
            상태변경
          </Typography>
        </Flexbox>
        <Flexbox
          direction="vertical"
          alignment="center"
          gap={7}
          customStyle={{ flex: 1 }}
          onClick={handleClickEdit}
        >
          <IconEdit />
          <Typography variant="small1" weight="medium" customStyle={{ color: common.ui60 }}>
            수정
          </Typography>
        </Flexbox>
        <Flexbox
          direction="vertical"
          alignment="center"
          gap={7}
          customStyle={{ flex: 1 }}
          onClick={handleClickDelete}
        >
          <IconDelete />
          <Typography variant="small1" weight="medium" customStyle={{ color: common.ui60 }}>
            삭제
          </Typography>
        </Flexbox>
      </SellerBottomNav>
      <BottomSheet
        open={openChangeStatus}
        onClose={() => setOpenChangeStatus(false)}
        disableSwipeable
        customStyle={{ padding: 20 }}
      >
        <Flexbox gap={32} direction="vertical">
          {status !== 4 && (
            <Flexbox
              alignment="center"
              gap={15}
              customStyle={{ padding: '15px 15px 0 15px' }}
              onClick={handleClickStatus}
              data-status-id={4}
            >
              <Icon name="TimeOutlined" />
              <Typography variant="h4">예약중으로 변경</Typography>
            </Flexbox>
          )}
          {status !== 1 && (
            <Flexbox
              alignment="center"
              gap={15}
              customStyle={{ padding: '0 15px' }}
              onClick={handleClickStatus}
              data-status-id={1}
            >
              <Icon name="CheckOutlined" />
              <Typography variant="h4">판매완료로 변경</Typography>
            </Flexbox>
          )}
          {status !== 0 && (
            <Flexbox
              alignment="center"
              gap={15}
              customStyle={{ padding: '0 15px' }}
              onClick={handleClickStatus}
              data-status-id={0}
            >
              <Icon name="BoxOutlined" />
              <Typography variant="h4">판매중으로 변경</Typography>
            </Flexbox>
          )}
          <Button
            fullWidth
            variant="contained"
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