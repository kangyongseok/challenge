import { useState } from 'react';

import dayjs from 'dayjs';
import type { AdminMessage } from '@sendbird/chat/message';
import Toast from '@mrcamelhub/camel-ui-toast';
import { Box, Button, Flexbox, Icon, Typography } from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

import { OrderEmptyInvoiceNumberDialog, OrderInvoiceNumberDialog } from '@components/pages/order';

import type { Order } from '@dto/order';

import { getFormatPhoneNumberDashParser } from '@utils/formats';
import { copyToClipboard } from '@utils/common';

interface ChannelOrderOperatorProgressMessageProps {
  message: AdminMessage;
  order?: Order | null;
  isSeller: boolean;
  onClickOrderDetail: () => void;
}

function ChannelOrderOperatorProgressMessage({
  message: { createdAt },
  order,
  isSeller,
  onClickOrderDetail
}: ChannelOrderOperatorProgressMessageProps) {
  const {
    palette: { common }
  } = useTheme();

  const [openInvoiceDialog, setInvoiceDialog] = useState(false);
  const [openEmptyInvoiceDialog, setEmptyInvoiceDialog] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCopyAddress = () => {
    if (!order?.deliveryInfo.address) return;

    copyToClipboard(order?.deliveryInfo.address);
    setOpen(true);
  };

  if (isSeller) {
    return (
      <>
        <Flexbox
          gap={4}
          alignment="flex-end"
          customStyle={{
            margin: '20px 0'
          }}
        >
          <Box
            customStyle={{
              flexGrow: 1,
              maxWidth: 265,
              padding: 20,
              border: `1px solid ${common.line01}`,
              borderRadius: 20,
              overflow: 'hidden'
            }}
          >
            {order?.type === 2 && (
              <Typography
                variant="body3"
                weight="bold"
                color="primary-light"
                customStyle={{
                  marginBottom: 4
                }}
              >
                카멜 구매대행
              </Typography>
            )}
            <Typography variant="h4" weight="bold">
              구매대행중
            </Typography>
            <Typography
              customStyle={{
                marginTop: 8
              }}
            >
              구매대행이 완료되면 송장번호를 입력해주세요.
            </Typography>
            <Box
              customStyle={{ background: common.bg02, borderRadius: 8, padding: 8, marginTop: 20 }}
            >
              <Flexbox
                alignment="center"
                justifyContent="space-between"
                customStyle={{ marginBottom: 8 }}
              >
                <Typography color="ui60" variant="body2">
                  받는 주소
                </Typography>
                <Typography color="ui60" variant="body3" onClick={handleCopyAddress}>
                  <Icon name="CopyOutlined" color="ui80" size="small" />
                  주소복사
                </Typography>
              </Flexbox>
              <Typography variant="body2" customStyle={{ marginBottom: 4 }}>
                {order?.deliveryInfo.name}{' '}
                <span style={{ color: common.ui60 }}>
                  {getFormatPhoneNumberDashParser(order?.deliveryInfo?.phone || '')}
                </span>
              </Typography>
              <Typography variant="body2">{order?.deliveryInfo.address}</Typography>
            </Box>
            {order?.status === 5 && order?.result === 1 && (
              <>
                <Button
                  size="medium"
                  fullWidth
                  customStyle={{ marginTop: 20 }}
                  variant="ghost"
                  brandColor="black"
                  onClick={() => setInvoiceDialog(true)}
                >
                  송장번호 입력
                </Button>
                <Typography
                  customStyle={{ marginTop: 16, textDecoration: 'underline', textAlign: 'center' }}
                  onClick={() => setEmptyInvoiceDialog(true)}
                >
                  송장번호가 없나요?
                </Typography>
              </>
            )}
            <Flexbox
              alignment="center"
              gap={4}
              onClick={onClickOrderDetail}
              customStyle={{
                margin: '20px -20px -20px',
                padding: '12px 20px',
                backgroundColor: common.bg02
              }}
            >
              <Icon name="FileFilled" color="primary-light" />
              <Typography weight="medium" color="primary-light">
                주문상세보기
              </Typography>
            </Flexbox>
          </Box>
          <Typography variant="small2" color="ui60">
            {dayjs(createdAt).format('A hh:mm')}
          </Typography>
        </Flexbox>
        <Toast open={open} onClose={() => setOpen(false)}>
          주소가 복사되었어요.
        </Toast>
        <OrderInvoiceNumberDialog
          open={openInvoiceDialog}
          setInvoiceDialog={setInvoiceDialog}
          id={order?.id}
        />
        <OrderEmptyInvoiceNumberDialog
          open={openEmptyInvoiceDialog}
          setEmptyInvoiceDialog={setEmptyInvoiceDialog}
          id={order?.id}
        />
      </>
    );
  }

  return (
    <Flexbox
      gap={4}
      alignment="flex-end"
      customStyle={{
        margin: '20px 0'
      }}
    >
      <Box
        customStyle={{
          flexGrow: 1,
          maxWidth: 265,
          padding: 20,
          border: `1px solid ${common.line01}`,
          borderRadius: 20,
          overflow: 'hidden'
        }}
      >
        {order?.type === 2 && (
          <Typography
            variant="body3"
            weight="bold"
            color="primary-light"
            customStyle={{
              marginBottom: 4
            }}
          >
            카멜 구매대행
          </Typography>
        )}
        <Typography variant="h4" weight="bold">
          구매대행중
        </Typography>
        <Typography
          customStyle={{
            marginTop: 8
          }}
        >
          판매자에게 매물을 구매하고 있어요.
        </Typography>
        <Typography
          customStyle={{
            marginTop: 8
          }}
        >
          카멜이 매물을 받아 확인 후 배송해드릴게요.
        </Typography>
        <Flexbox
          alignment="center"
          gap={4}
          onClick={onClickOrderDetail}
          customStyle={{
            margin: '20px -20px -20px',
            padding: '12px 20px',
            backgroundColor: common.bg02
          }}
        >
          <Icon name="FileFilled" color="primary-light" />
          <Typography weight="medium" color="primary-light">
            주문상세보기
          </Typography>
        </Flexbox>
      </Box>
      <Typography variant="small2" color="ui60">
        {dayjs(createdAt).format('A hh:mm')}
      </Typography>
    </Flexbox>
  );
}

export default ChannelOrderOperatorProgressMessage;
