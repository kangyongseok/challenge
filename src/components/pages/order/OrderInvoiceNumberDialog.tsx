import { useRef, useState } from 'react';

import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import {
  BottomSheet,
  Button,
  Flexbox,
  Icon,
  Input,
  Typography,
  useTheme
} from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { postOrderDelivery } from '@api/order';
import { fetchCommonCodeDetails } from '@api/common';

import queryKeys from '@constants/queryKeys';

function OrderInvoiceNumberDialog({
  open,
  id,
  setInvoiceDialog
}: {
  open: boolean;
  id?: number;
  setInvoiceDialog: (value: boolean) => void;
}) {
  const {
    theme: {
      palette: { primary }
    }
  } = useTheme();
  const queryClient = useQueryClient();
  const { query } = useRouter();
  const invoiceNumberRef = useRef<HTMLInputElement | null>(null);

  const [companyInfo, setCompanyInfo] = useState<{ id: string; description: string }>({
    id: '',
    description: ''
  });
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [openSelectList, setSelectList] = useState(false);

  const { data: deliveryCompanys } = useQuery(queryKeys.commons.codeDetails({ codeId: 21 }), () =>
    fetchCommonCodeDetails({
      codeId: 21
    })
  );
  const { mutate: invoideMudate } = useMutation(postOrderDelivery);

  const handleCancel = () => {
    setInvoiceDialog(false);
  };

  const handleClickInvoice = () => {
    // eslint-disable-next-line no-console
    invoideMudate(
      {
        id: id || Number(query.id),
        type: 1,
        contents: invoiceNumber.split('-').join(''),
        deliveryCode: String(companyInfo.id)
      },
      {
        onSuccess() {
          setInvoiceDialog(false);
          setInvoiceNumber('');
          setCompanyInfo({ id: '', description: '' });
          queryClient.invalidateQueries({
            queryKey: queryKeys.orders.order(Number(query.id)),
            refetchType: 'active'
          });
        }
      }
    );
  };

  return (
    <>
      <Dialog open={open}>
        <Flexbox gap={8} direction="vertical" customStyle={{ textAlign: 'center' }}>
          <Typography weight="bold" variant="h3">
            송장번호를 입력해주세요.
          </Typography>
          <Typography variant="h4">입력하면 배송중으로 변경됩니다.</Typography>
        </Flexbox>
        <Flexbox customStyle={{ marginTop: 32, textAlign: 'left' }} direction="vertical">
          <Typography weight="medium" color="ui60">
            송장번호
          </Typography>
          <SelectBox onClick={() => setSelectList(true)}>
            <Typography variant="h4" color={companyInfo.description ? 'black' : 'ui80'}>
              {companyInfo.description || '택배사 선택'}
            </Typography>
            <Icon name="DropdownFilled" viewBox="0 0 12 24" color="ui60" />
          </SelectBox>
          <Input
            ref={invoiceNumberRef}
            placeholder="송장번호"
            fullWidth
            size="xlarge"
            customStyle={{ height: 44, marginTop: 8, fontSize: 15 }}
            type="text"
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
        </Flexbox>
        <Flexbox direction="vertical" gap={8} customStyle={{ marginTop: 32 }}>
          <Button
            fullWidth
            variant="solid"
            brandColor="black"
            size="large"
            onClick={handleClickInvoice}
            disabled={!invoiceNumber || !companyInfo.description}
          >
            송장번호 입력
          </Button>
          <Button fullWidth variant="ghost" size="large" onClick={handleCancel}>
            취소
          </Button>
        </Flexbox>
      </Dialog>
      <BottomSheet
        open={openSelectList}
        onClose={() => setSelectList(false)}
        disableSwipeable
        customStyle={{ padding: '22px 0 100px' }}
      >
        {deliveryCompanys?.map(({ description, name }) => (
          <Typography
            variant="h3"
            customStyle={{
              padding: '12px 20px',
              background: companyInfo.description === description ? primary.main : undefined
            }}
            color={companyInfo.description === description ? 'uiWhite' : undefined}
            key={`delivery-company-${name}`}
            onClick={() => {
              setCompanyInfo({ id: name, description });
              setSelectList(false);
              invoiceNumberRef.current?.querySelector('input')?.focus();
            }}
          >
            {description}
          </Typography>
        ))}
        <ButtonWrap alignment="center" justifyContent="center">
          <Button
            fullWidth
            size="xlarge"
            variant="ghost"
            brandColor="black"
            onClick={() => setSelectList(false)}
          >
            취소
          </Button>
        </ButtonWrap>
      </BottomSheet>
    </>
  );
}

const SelectBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-height: 44px;
  padding: 12px;
  margin-top: 8px;
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
  border-radius: 8px;
`;

const ButtonWrap = styled(Flexbox)`
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  padding: 20px;
  background: white;
`;

export default OrderInvoiceNumberDialog;
