import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Input, Typography } from 'mrcamel-ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import type { DeliveryInfo } from '@dto/order';

import { logEvent } from '@library/amplitude';

import { postUserDelivery } from '@api/user';
import { fetchProductOrder } from '@api/order';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function ProductOrderDeliveryInfoForm() {
  const router = useRouter();
  const { id } = router.query;
  const splitId = String(id).split('-');
  const productId = Number(splitId[splitId.length - 1] || 0);

  const { data: accessUser } = useQueryAccessUser();

  const [{ name, phone, address }, setDeliveryInfo] = useState<DeliveryInfo>({
    name: '',
    phone: '',
    address: ''
  });
  const [showHelperText, setShowHelperText] = useState(false);

  const { data: { deliveryInfo } = {}, isLoading } = useQuery(
    queryKeys.orders.productOrder({ productId }),
    () => fetchProductOrder({ productId }),
    {
      enabled: !!accessUser && !!productId,
      refetchOnMount: true
    }
  );

  const { mutate, isLoading: isLoadingMutate } = useMutation(postUserDelivery);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'phone') {
      setDeliveryInfo((prevState) => ({
        ...prevState,
        [e.target.name]: e.target.value.replace(/[^0-9]/g, '')
      }));
    } else {
      setDeliveryInfo((prevState) => ({
        ...prevState,
        [e.target.name]: e.target.value
      }));
    }
  };

  const handleChangeTextArea = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setDeliveryInfo((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));

  const handleClick = () => {
    mutate(
      {
        address,
        name,
        phone
      },
      {
        onSuccess() {
          logEvent(attrKeys.productOrder.SUBMIT_USER_DELIVERY, {
            name: attrProperty.name.DELIVERY_MANAGE,
            data: {
              address,
              name,
              phone
            }
          });
          router.back();
        }
      }
    );
  };

  useEffect(() => {
    if (!deliveryInfo) return;

    setDeliveryInfo(deliveryInfo);
  }, [deliveryInfo]);

  useEffect(() => {
    if (!phone || phone.length < 8) {
      setShowHelperText(true);
    } else {
      setShowHelperText(false);
    }
  }, [phone]);

  return (
    <>
      <Flexbox
        component="section"
        direction="vertical"
        gap={32}
        customStyle={{
          marginTop: 32
        }}
      >
        <Flexbox direction="vertical" gap={8}>
          <Typography weight="medium" color="ui60">
            이름
          </Typography>
          <Input
            fullWidth
            size="large"
            name="name"
            onChange={handleChange}
            value={name}
            placeholder="이름"
          />
        </Flexbox>
        <Flexbox direction="vertical" gap={8}>
          <Typography color="ui60">연락처</Typography>
          <Input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            fullWidth
            size="large"
            name="phone"
            onChange={handleChange}
            value={phone.replace(/-/g, '')}
            placeholder="연락처"
          />
          {showHelperText && (
            <Typography variant="body2" color="red-light">
              정확한 연락처를 입력해주세요.
            </Typography>
          )}
        </Flexbox>
        <Flexbox direction="vertical" gap={8}>
          <Typography color="ui60">주소</Typography>
          <TextArea name="address" onChange={handleChangeTextArea} value={address} />
        </Flexbox>
      </Flexbox>
      <Box
        customStyle={{
          width: '100%',
          minHeight: 92
        }}
      >
        <Button
          variant="solid"
          brandColor="black"
          size="xlarge"
          fullWidth
          onClick={handleClick}
          disabled={!name || !phone || phone.length < 8 || !address || isLoading || isLoadingMutate}
          customStyle={{
            position: 'fixed',
            left: 0,
            bottom: 0,
            width: 'calc(100% - 40px)',
            margin: 20
          }}
        >
          완료
        </Button>
      </Box>
    </>
  );
}

const TextArea = styled.textarea`
  padding: 12px;
  outline: 0;
  resize: none;
  height: 84px;
  border-radius: 8px;
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
  ${({
    theme: {
      typography: { h4 },
      palette: { common }
    }
  }) => ({
    fontSize: h4.size,
    fontWeight: h4.weight.regular,
    lineHeight: h4.lineHeight,
    letterSpacing: h4.letterSpacing,
    color: common.ui20
  })};

  &::placeholder {
    ${({
      theme: {
        palette: { common }
      }
    }) => ({
      color: common.ui80
    })};
  }
`;

export default ProductOrderDeliveryInfoForm;
