import { useState } from 'react';

import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Radio, Typography } from 'mrcamel-ui';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import { Header, NewProductListCard } from '@components/UI/molecules';
import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import { fetchProduct } from '@api/product';

import queryKeys from '@constants/queryKeys';

import { commaNumber } from '@utils/formats';

import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';

const clientKey = 'test_ck_YoEjb0gm23PwJGeqBK68pGwBJn5e';
// const clientKey = process.env.TOSS_PAYMENTS_TEST_CLIENT_KEY;

function ProductsPayments() {
  const router = useRouter();
  const productId = Number(((router.query.id as string) || '').split('-').at(-1));
  const [addressOn, setAddressOn] = useState(false);
  const { data: myUserInfo } = useQueryMyUserInfo();
  const { data: { product } = {} } = useQuery(
    queryKeys.products.product({ productId }),
    () => fetchProduct({ productId }),
    { enabled: !!productId }
  );

  const handleClickPayments = async () => {
    const tossPayments = await loadTossPayments(clientKey);
    tossPayments
      .requestPayment('카드', {
        // 결제 수단 파라미터
        // 결제 정보 파라미터
        amount: product?.price || 0,
        orderId: 'eb945NxqJo7WhMPUx9lEZ',
        orderName: product?.title || '',
        customerName: myUserInfo?.info?.value?.name || '이름없음',
        successUrl: 'http://localhost:8080/success',
        failUrl:
          process.env.NODE_ENV !== 'development' ? 'https://mrcamel.co.kr' : 'http://localhost:3000'
      })
      .catch(function (error) {
        if (error.code === 'USER_CANCEL') {
          // 결제 고객이 결제창을 닫았을 때 에러 처리
        } else if (error.code === 'INVALID_CARD_COMPANY') {
          // 유효하지 않은 카드 코드에 대한 에러 처리
        }
      });
  };

  const handleClickChange = () => {
    setAddressOn(true);
  };

  return (
    <GeneralTemplate
      header={
        <Header showRight={false}>
          <Typography variant="h3" weight="bold">
            안전결제
          </Typography>
        </Header>
      }
    >
      <Box customStyle={{ height: 20 }} />
      {product && (
        <NewProductListCard
          product={product}
          variant="listB"
          hideAreaInfo
          hideMetaInfo
          hideWishButton
        />
      )}
      <Gap
        height={8}
        customStyle={{ margin: '20px 0', marginLeft: -20, width: 'calc(100% + 40px)' }}
      />
      <AddressArea>
        <Typography weight="bold" variant="h3" customStyle={{ marginBottom: 10 }}>
          배송지
        </Typography>
        {!addressOn && (
          <Button variant="solid" fullWidth size="large" onClick={handleClickChange}>
            배송지 입력
          </Button>
        )}
        {addressOn && (
          <>
            <Typography>{myUserInfo?.info?.value?.name || '이름없음'} 010-1234-1234</Typography>
            <Typography>
              {myUserInfo?.area?.values?.filter((area) => area.isActive)[0].areaName}
            </Typography>
            <Button>배송지변경</Button>
          </>
        )}
      </AddressArea>
      <Gap
        height={8}
        customStyle={{ margin: '20px 0', marginLeft: -20, width: 'calc(100% + 40px)' }}
      />
      <PaymentInfo>
        <Typography weight="bold" variant="h3" customStyle={{ marginBottom: 10 }}>
          결제금액
        </Typography>
        <Flexbox justifyContent="space-between">
          <Typography>상품금액</Typography>
          <Typography>{product?.price}</Typography>
        </Flexbox>
        <Flexbox justifyContent="space-between">
          <Typography>안전결제수수료</Typography>
          <Typography>10,000</Typography>
        </Flexbox>
        <Flexbox justifyContent="space-between">
          <Typography>총 결제금액</Typography>
          <Typography>10,000</Typography>
        </Flexbox>
      </PaymentInfo>
      <Gap
        height={8}
        customStyle={{ margin: '20px 0', marginLeft: -20, width: 'calc(100% + 40px)' }}
      />
      <HowToPayment>
        <Typography weight="bold" variant="h3" customStyle={{ marginBottom: 10 }}>
          결제방법
        </Typography>
        <Flexbox>
          <Radio />
          <Typography>간편결제</Typography>
        </Flexbox>
        <Flexbox justifyContent="space-between">
          <Flexbox>
            <Radio />
            <Typography>신용/체크카드</Typography>
          </Flexbox>
          <Flexbox>
            <Radio />
            <Typography>무통장입금</Typography>
          </Flexbox>
        </Flexbox>
        <Flexbox justifyContent="space-between">
          <Flexbox>
            <Radio />
            <Typography>카카오페이</Typography>
          </Flexbox>
          <Flexbox>
            <Radio />
            <Typography>네이버페이</Typography>
          </Flexbox>
        </Flexbox>
      </HowToPayment>
      <Button
        fullWidth
        variant="solid"
        size="large"
        onClick={handleClickPayments}
        customStyle={{ marginTop: 20 }}
      >
        {commaNumber(product?.price || 0)}원 결제하기
      </Button>
    </GeneralTemplate>
  );
}

const AddressArea = styled.div``;
const PaymentInfo = styled.div``;
const HowToPayment = styled.div``;

export default ProductsPayments;
