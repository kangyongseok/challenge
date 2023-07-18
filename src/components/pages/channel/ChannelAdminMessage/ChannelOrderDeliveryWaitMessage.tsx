import { useState } from 'react';

import dayjs from 'dayjs';
import type { AdminMessage } from '@sendbird/chat/message';
import Toast from '@mrcamelhub/camel-ui-toast';
import { Box, Button, Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { OrderEmptyInvoiceNumberDialog, OrderInvoiceNumberDialog } from '@components/pages/order';

import type { Order } from '@dto/order';

import { getFormatPhoneNumberDashParser } from '@utils/formats';
import { copyToClipboard } from '@utils/common';

import useSession from '@hooks/useSession';

interface ChannelOrderDeliveryWaitMessageProps {
  message: AdminMessage;
  order?: Order | null;
  isSeller: boolean;
  onClickOrderDetail: () => void;
}

function ChannelOrderDeliveryWaitMessage({
  message: { data, createdAt },
  order,
  isSeller,
  onClickOrderDetail
}: ChannelOrderDeliveryWaitMessageProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: accessUser } = useSession();

  const [openInvoiceDialog, setInvoiceDialog] = useState(false);
  const [openEmptyInvoiceDialog, setEmptyInvoiceDialog] = useState(false);
  const [open, setOpen] = useState(false);

  if (data && accessUser?.userId !== Number(JSON.parse(data)?.userId)) return null;

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
              배송준비
            </Typography>
            <Typography customStyle={{ marginTop: 8 }}>
              택배를 보낸 뒤 송장번호를 입력해주세요.
              <br />
              미입력시 주문이 취소됩니다.
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
            {order?.status === 1 && order?.result === 0 && (
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
          <Typography
            variant="small2"
            customStyle={{
              color: common.ui60
            }}
          >
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
          배송준비
        </Typography>
        <Typography customStyle={{ marginTop: 8 }}>
          {order?.type === 2
            ? '카멜이 배송을 준비하고 있어요.'
            : '판매자가 배송을 준비하고 있어요.'}
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
      <Typography
        variant="small2"
        customStyle={{
          color: common.ui60
        }}
      >
        {dayjs(createdAt).format('A hh:mm')}
      </Typography>
    </Flexbox>
  );
}

export default ChannelOrderDeliveryWaitMessage;
