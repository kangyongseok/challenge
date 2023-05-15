import { useEffect } from 'react';

import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Dialog,
  Flexbox,
  Icon,
  Image,
  Label,
  Typography,
  useTheme
} from '@mrcamelhub/camel-ui';

import { Header } from '@components/UI/molecules';
import { Gap } from '@components/UI/atoms';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

interface SafePaymentGuideDialogProps {
  open: boolean;
  onClose: () => void;
  ctaType?: 'continue' | 'viewSafePaymentProducts';
}

function SafePaymentGuideDialog({
  open,
  onClose,
  ctaType = 'continue'
}: SafePaymentGuideDialogProps) {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const handleClick = () => {
    if (ctaType === 'viewSafePaymentProducts') {
      logEvent(attrKeys.home.CLICK_PRODUCT_LIST, {
        name: attrProperty.name.GUIDE,
        title: attrProperty.title.CAMEL_POSTED
      });

      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.name.GUIDE,
        title: attrProperty.title.CAMEL_POSTED,
        type: attrProperty.type.GUIDED
      });

      router.push({
        pathname: '/products/camel/새로 올라왔어요!',
        query: {
          order: 'postedAllDesc',
          idFilterIds: [6]
        }
      });
      return;
    }

    logEvent(attrKeys.products.CLICK_CLOSE, {
      name: attrProperty.name.GUIDE
    });

    onClose();
  };

  const handleClose = () => {
    logEvent(attrKeys.products.CLICK_CLOSE, {
      name: attrProperty.name.GUIDE
    });

    onClose();
  };

  useEffect(() => {
    if (open) {
      logEvent(attrKeys.productOrder.VIEW_GUIDE, {
        title: attrProperty.title.ORDER
      });
    }
  }, [open]);

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      customStyle={{
        overflowX: 'hidden'
      }}
    >
      <Header
        isTransparent
        leftIcon={
          <Box
            onClick={handleClose}
            customStyle={{
              padding: 16
            }}
          >
            <Icon name="CloseOutlined" />
          </Box>
        }
        showRight={false}
        hideTitle
        wrapperCustomStyle={{
          top: 0,
          left: 0
        }}
      />
      <Typography
        variant="h1"
        weight="bold"
        textAlign="center"
        customStyle={{
          marginTop: 32
        }}
      >
        수수료 없이 거래하는
        <br />
        카멜 안전결제
      </Typography>
      <Typography
        variant="h4"
        textAlign="center"
        customStyle={{
          marginTop: 12
        }}
      >
        누구나 안심하고 중고거래할 수 있는
        <br /> 카멜의 안전결제를 이용해보세요.
      </Typography>
      <Image
        width="auto"
        height={120}
        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/product-order/safepayment-free-coin.png`}
        alt="Coin Img"
        round={8}
        disableAspectRatio
        customStyle={{
          maxWidth: 335,
          margin: '32px auto 0'
        }}
      />
      <Box
        customStyle={{
          marginTop: 116,
          padding: '0 12px'
        }}
      >
        <Flexbox
          direction="vertical"
          gap={12}
          customStyle={{
            width: '100%'
          }}
        >
          <Flexbox justifyContent="space-between" gap={8}>
            <Typography variant="h2" weight="bold">
              사기 걱정없이
              <br />
              거래하세요
            </Typography>
            <Label
              variant="solid"
              brandColor="black"
              text="안전결제"
              round={8}
              customStyle={{
                marginTop: 8,
                height: 32,
                textAlign: 'center',
                fontSize: 16,
                fontWeight: 700
              }}
            />
          </Flexbox>
          <Typography variant="h4" color="ui60">
            구매자가 안전결제로 구매한 금액은
            <br />
            거래가 끝날때까지 카멜이 안전하게 보호해요.
          </Typography>
        </Flexbox>
        <Flexbox
          direction="vertical"
          gap={12}
          customStyle={{
            width: '100%',
            marginTop: 84
          }}
        >
          <Flexbox justifyContent="space-between" gap={8}>
            <Typography variant="h2" weight="bold">
              카멜에선
              <br />
              모든 수수료가 무료!
            </Typography>
            <Image
              width={80}
              height={64}
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/product-order/safepayment-coin.png`}
              alt="Coin Img"
              round={8}
              disableAspectRatio
              customStyle={{
                maxWidth: 335
              }}
            />
          </Flexbox>
          <Typography variant="h4" color="ui60">
            구매자, 판매자 모두 수수료 부담없이
            <br />
            안심하고 거래해보세요.
          </Typography>
        </Flexbox>
        <Flexbox
          direction="vertical"
          gap={12}
          customStyle={{
            width: '100%',
            marginTop: 84
          }}
        >
          <Flexbox justifyContent="space-between" gap={8}>
            <Typography variant="h2" weight="bold">
              카멜이 인증했어요
              <br />
              인증판매자
            </Typography>
            <Icon width={48} height={48} name="ShieldFilled" color="primary" />
          </Flexbox>
          <Typography variant="h4" color="ui60">
            카멜인증판매자와 거래하면
            <br />
            정품 고민 없이 거래할 수 있어요.
          </Typography>
        </Flexbox>
      </Box>
      <Gap
        height={1}
        customStyle={{
          width: 'calc(100% + 64px)',
          margin: '54px -32px 84px'
        }}
      />
      <Typography variant="h2" weight="bold" textAlign="center">
        안전결제, 이렇게 이용해요.
      </Typography>
      <Box
        customStyle={{
          maxWidth: 240,
          minWidth: 240,
          marginTop: 32,
          padding: 16,
          borderRadius: '0px 20px 20px 20px',
          backgroundColor: common.bg02
        }}
      >
        <Typography variant="h4" weight="bold">
          구매자 안전결제
        </Typography>
        <Typography
          color="ui60"
          customStyle={{
            marginTop: 4
          }}
        >
          신용카드, 가상계좌를 이용하여 결제합니다.
        </Typography>
      </Box>
      <Box
        customStyle={{
          maxWidth: 240,
          minWidth: 240,
          margin: '20px 0 0 auto',
          padding: 16,
          borderRadius: '20px 0px 20px 20px',
          backgroundColor: common.ui60
        }}
      >
        <Typography variant="h4" weight="bold" color="uiWhite">
          판매자 택배발송
        </Typography>
        <Typography
          color="ui80"
          customStyle={{
            marginTop: 4
          }}
        >
          판매승인 후, 2일 이내로 물건을 발송해주세요.
        </Typography>
      </Box>
      <Box
        customStyle={{
          maxWidth: 240,
          minWidth: 240,
          marginTop: 20,
          padding: 16,
          borderRadius: '0px 20px 20px 20px',
          backgroundColor: common.bg02
        }}
      >
        <Typography variant="h4" weight="bold">
          구매자 매물 수령 후 구매확정
        </Typography>
        <Typography
          color="ui60"
          customStyle={{
            marginTop: 4,
            color: common.ui60
          }}
        >
          꼼꼼히 확인하고 구매확정 해주세요.
        </Typography>
      </Box>
      <Box
        customStyle={{
          maxWidth: 240,
          minWidth: 240,
          margin: '20px 0 0 auto',
          padding: 16,
          borderRadius: '20px 0px 20px 20px',
          backgroundColor: common.ui60
        }}
      >
        <Typography
          variant="h4"
          weight="bold"
          customStyle={{
            color: common.uiWhite
          }}
        >
          판매자 정산
        </Typography>
        <Typography
          customStyle={{
            marginTop: 4,
            color: common.ui80
          }}
        >
          영업일 7일 이내 정산됩니다.
        </Typography>
        <Box
          customStyle={{
            width: '100%',
            height: 1,
            margin: '20px 0',
            backgroundColor: common.alpha20
          }}
        />
        <Typography
          variant="body2"
          customStyle={{
            color: common.ui80
          }}
        >
          최대 7일이 소요되며, 더 빠르게 정산될 수 있습니다. 구매확정 후 즉시 정산될 수 있도록
          준비중입니다.
        </Typography>
      </Box>
      <Box
        customStyle={{
          marginTop: 52,
          minHeight: 100
        }}
      >
        <Box
          customStyle={{
            position: 'fixed',
            left: 0,
            bottom: 0,
            width: '100%'
          }}
        >
          <Box
            customStyle={{
              height: 32,
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 100%)'
            }}
          />
          <Box
            customStyle={{
              padding: '0 16px 16px',
              backgroundColor: common.uiWhite
            }}
          >
            <Button
              variant="solid"
              brandColor="black"
              size="xlarge"
              fullWidth
              onClick={handleClick}
            >
              {ctaType === 'continue' ? '거래 계속하기' : '안전결제 가능한 매물보기'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}

export default SafePaymentGuideDialog;
