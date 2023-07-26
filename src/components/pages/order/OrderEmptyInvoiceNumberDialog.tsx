import { useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, Input, RadioGroup, Typography } from '@mrcamelhub/camel-ui';

import { postOrderDelivery } from '@api/order';

function OrderEmptyInvoiceNumberDialog({
  open,
  id,
  setEmptyInvoiceDialog
}: {
  open: boolean;
  id?: number;
  setEmptyInvoiceDialog: (value: boolean) => void;
}) {
  const { query } = useRouter();

  const [value, setValue] = useState('');
  const [directContent, setDirectContent] = useState('');

  const { mutate: invoideMudate } = useMutation(postOrderDelivery);

  const handleCancel = () => {
    setEmptyInvoiceDialog(false);
  };

  const handleClickInvoice = () => {
    // eslint-disable-next-line no-console
    invoideMudate(
      {
        id: id || Number(query.id),
        type: Number(value) as 0 | 1 | 2 | 3,
        contents: directContent
      },
      {
        onSuccess() {
          setEmptyInvoiceDialog(false);
        }
      }
    );
  };

  const handleChange = (newValue?: string | number) => setValue(String(newValue));

  const handleChangeDirectInput = (e: ChangeEvent<HTMLInputElement>) => {
    setDirectContent(e.target.value);
  };

  return (
    <Dialog open={open} customStyle={{ width: 311 }}>
      <Flexbox gap={8} direction="vertical" customStyle={{ textAlign: 'center' }}>
        <Typography weight="bold" variant="h3">
          송장번호가 없나요?
        </Typography>
        <Typography variant="h4">
          매물을 어떻게 구매자에게 전달하는지
          <br />
          선택해주세요.
        </Typography>
      </Flexbox>
      <Flexbox customStyle={{ marginTop: 32 }} direction="vertical">
        <Typography weight="medium" textAlign="left" color="ui60">
          전달방법
        </Typography>
        <Flexbox customStyle={{ flexWrap: 'wrap', marginTop: 16 }} gap={16}>
          <RadioGroup
            text="퀵 서비스"
            customStyle={{ minWidth: 'calc(50% - 8px)' }}
            onChange={handleChange}
            value="2"
            checked={value === '2'}
          />
          <RadioGroup
            text="용달"
            customStyle={{ minWidth: 'calc(50% - 8px)' }}
            onChange={handleChange}
            value="3"
            checked={value === '3'}
          />
          <RadioGroup
            text="직접 입력"
            customStyle={{ minWidth: 'calc(50% - 8px)' }}
            onChange={handleChange}
            value="0"
            checked={value === '0'}
          />
        </Flexbox>
        {value === '0' && (
          <Input
            fullWidth
            customStyle={{ marginTop: 10 }}
            placeholder="전달방법 입력"
            onChange={handleChangeDirectInput}
          />
        )}
      </Flexbox>
      <Flexbox direction="vertical" gap={8} customStyle={{ marginTop: 32 }}>
        <Button
          fullWidth
          variant="solid"
          brandColor="black"
          size="large"
          onClick={handleClickInvoice}
          disabled={!value}
        >
          확인
        </Button>
        <Button fullWidth variant="ghost" size="large" onClick={handleCancel}>
          취소
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default OrderEmptyInvoiceNumberDialog;
