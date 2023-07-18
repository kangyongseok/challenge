import { useRef, useState } from 'react';

import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { BottomSheet, Box, Button, Flexbox, Icon, Input, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import type { CommonCode } from '@dto/common';

import { postOrderDelivery } from '@api/order';
import { fetchCommonCodeDetails } from '@api/common';

import queryKeys from '@constants/queryKeys';

import { ordersDetailOpenInvoiceNumberDialogState } from '@recoil/ordersDetail';

function OrdersDetailInvoiceNumberDialog() {
  const router = useRouter();
  const { id } = router.query;

  const queryClient = useQueryClient();

  const [open, setOpenState] = useRecoilState(ordersDetailOpenInvoiceNumberDialogState);

  const [openBottomSheet, setOpenBottomSheet] = useState(false);
  const [selectedDeliveryCompany, setSelectedDeliveryCompany] = useState<CommonCode>();
  const [value, setValue] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  const { data = [] } = useQuery(queryKeys.commons.codeDetails({ codeId: 21 }), () =>
    fetchCommonCodeDetails({
      codeId: 21
    })
  );

  const { mutate, isLoading } = useMutation(postOrderDelivery);

  const handleClick = (commonCode: CommonCode) => () => {
    setSelectedDeliveryCompany(commonCode);
    setOpenBottomSheet(false);
  };

  const handleClickPost = () => {
    if (!selectedDeliveryCompany || !value || isLoading) return;

    mutate(
      {
        id: Number(id),
        type: 1,
        contents: value.split('-').join(''),
        deliveryCode: selectedDeliveryCompany.name
      },
      {
        async onSuccess() {
          await queryClient.refetchQueries({
            queryKey: queryKeys.orders.order(Number(id))
          });
          setSelectedDeliveryCompany(undefined);
          setValue('');
          setOpenState(false);
        }
      }
    );
  };

  const handleClose = () => setOpenState(false);

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <Typography variant="h3" weight="bold">
          송장번호를 입력해주세요.
        </Typography>
        <Typography
          variant="h4"
          customStyle={{
            marginTop: 8
          }}
        >
          입력하면 배송중으로 변경됩니다.
        </Typography>
        <Flexbox
          direction="vertical"
          gap={8}
          customStyle={{
            marginTop: 32
          }}
        >
          <Typography weight="medium" color="ui60" textAlign="left">
            송장번호
          </Typography>
          <SelectBox onClick={() => setOpenBottomSheet(true)}>
            <Typography
              variant="h4"
              color={selectedDeliveryCompany?.description ? 'black' : 'ui80'}
            >
              {selectedDeliveryCompany?.description || '택배사 선택'}
            </Typography>
            <Icon name="DropdownFilled" viewBox="0 0 12 24" color="ui60" />
          </SelectBox>
          <Input
            ref={inputRef}
            onChange={(e) => setValue(e.currentTarget.value)}
            value={value}
            placeholder="송장번호"
            fullWidth
            size="large"
          />
        </Flexbox>
        <Flexbox
          direction="vertical"
          gap={8}
          customStyle={{
            marginTop: 32
          }}
        >
          <Button
            variant="solid"
            brandColor="black"
            size="large"
            fullWidth
            disabled={!selectedDeliveryCompany || !value || isLoading}
            onClick={handleClickPost}
          >
            송장번호 입력
          </Button>
          <Button variant="ghost" brandColor="black" size="large" fullWidth onClick={handleClose}>
            취소
          </Button>
        </Flexbox>
      </Dialog>
      <BottomSheet
        open={openBottomSheet}
        onClose={() => setOpenBottomSheet(false)}
        disableSwipeable
      >
        <Flexbox
          direction="vertical"
          gap={26}
          customStyle={{
            position: 'relative',
            padding: 20
          }}
        >
          <Flexbox direction="vertical" gap={8}>
            {data?.map(({ name, description, ...props }) => (
              <Button
                key={`delivery-company-${name}`}
                variant="inline"
                size="xlarge"
                brandColor="black"
                fullWidth
                onClick={handleClick({ name, description, ...props })}
                customStyle={{
                  justifyContent: 'flex-start',
                  paddingLeft: 0,
                  paddingRight: 0
                }}
              >
                {description}
              </Button>
            ))}
          </Flexbox>
          <Box
            customStyle={{
              minHeight: 52
            }}
          >
            <Box
              customStyle={{
                position: 'fixed',
                left: 0,
                bottom: 0,
                width: '100%',
                padding: 20
              }}
            >
              <Button
                variant="ghost"
                brandColor="black"
                size="xlarge"
                fullWidth
                onClick={() => setOpenBottomSheet(false)}
              >
                취소
              </Button>
            </Box>
          </Box>
        </Flexbox>
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
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
  border-radius: 8px;
`;

export default OrdersDetailInvoiceNumberDialog;
