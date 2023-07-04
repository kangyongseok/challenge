import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Button, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { loginBottomSheetState } from '@recoil/common';
import { channelDialogStateFamily } from '@recoil/channel';
import useSession from '@hooks/useSession';

import OrderSearchDelieryForm from './OrderSearchDelieryForm';

function OrderSingleButtonGroup({
  isApproval,
  isLoginAccountUser,
  isDelivery,
  isViewLogin,
  setOpenAcceptDialog,
  setInvoiceDialog
}: {
  isApproval: boolean;
  isLoginAccountUser: boolean;
  isDelivery: boolean;
  isViewLogin: boolean;
  setOpenAcceptDialog: (value: boolean) => void;
  setInvoiceDialog: (value: boolean) => void;
}) {
  const {
    theme: {
      palette: { primary }
    }
  } = useTheme();
  const { push } = useRouter();

  const { isLoggedInWithSMS } = useSession();

  const setLoginBottomSheet = useSetRecoilState(loginBottomSheetState);
  const setOrderRefuseState = useSetRecoilState(channelDialogStateFamily('orderRequestRefuse'));

  const handleAccept = () => {
    if (!isLoggedInWithSMS) {
      setLoginBottomSheet({ open: true, returnUrl: '' });
      return;
    }

    if (isLoginAccountUser) {
      setOpenAcceptDialog(true);
    } else {
      push('/mypage/settings/account');
    }
  };

  if (isViewLogin) {
    return (
      <Button
        fullWidth
        brandColor="black"
        variant="solid"
        size="xlarge"
        customStyle={{ marginTop: 20, marginBottom: 32 }}
        onClick={() => setLoginBottomSheet({ open: true, returnUrl: '' })}
      >
        로그인하기
      </Button>
    );
  }

  if (isDelivery) {
    return <OrderSearchDelieryForm />;
  }

  if (isApproval) {
    return (
      <Button
        fullWidth
        brandColor="black"
        variant="solid"
        size="xlarge"
        customStyle={{ marginTop: 20 }}
        onClick={() => setInvoiceDialog(true)}
      >
        송장번호 입력
      </Button>
    );
  }
  return (
    <>
      <Button
        fullWidth
        brandColor="black"
        variant="solid"
        size="xlarge"
        customStyle={{ marginTop: 20 }}
        onClick={handleAccept}
      >
        {isLoginAccountUser ? '판매 수락하기' : '정산계좌 입력하고 판매 수락하기'}
      </Button>
      <Button
        fullWidth
        brandColor="black"
        variant="ghost"
        size="xlarge"
        customStyle={{ marginTop: 8 }}
        onClick={() => {
          setOrderRefuseState((prevState) => ({
            ...prevState,
            open: true
          }));
        }}
      >
        거절하기
      </Button>
      <Typography customStyle={{ marginTop: 12, textAlign: 'center', marginBottom: 32 }}>
        카멜 안전결제 첫 이용시{' '}
        <span style={{ fontWeight: 700, color: primary.main }}>5,000원</span> 페이백!
      </Typography>
    </>
  );
}

export default OrderSingleButtonGroup;
