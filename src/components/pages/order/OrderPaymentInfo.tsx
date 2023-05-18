import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { Box, Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import type { UserAccount } from '@dto/user';
import { OrderDelivery } from '@dto/order';

import { fetchCommonCodeDetails } from '@api/common';

import queryKeys from '@constants/queryKeys';

import { commaNumber } from '@utils/common';

import OrderSearchDelieryForm from './OrderSearchDelieryForm';

function OrderPaymentInfo({
  price,
  totalPrice,
  id,
  dateExpired,
  userAccounts,
  isDelivery,
  isReturn,
  isNotApproval,
  orderDelivery
}: {
  userAccounts: UserAccount[];
  price?: number;
  totalPrice?: number;
  id?: number;
  dateExpired?: string;
  isDelivery: boolean;
  isReturn: boolean;
  isNotApproval: boolean;
  orderDelivery?: OrderDelivery;
}) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: deliveryCompanys } = useQuery(
    queryKeys.commons.codeDetails({ codeId: 21 }),
    () =>
      fetchCommonCodeDetails({
        codeId: 21
      }),
    {
      enabled: !!isDelivery
    }
  );

  return (
    <>
      {!isReturn && !isNotApproval && (
        <>
          <SectionWrap>
            <Typography weight="bold" variant="h3">
              정산정보
            </Typography>
            <Flexbox
              alignment="center"
              justifyContent="space-between"
              customStyle={{ marginTop: 20 }}
            >
              <Typography variant="h4" color="ui60">
                판매금액
              </Typography>
              <Typography variant="h4">{commaNumber(price || 0)}원</Typography>
            </Flexbox>
            <Flexbox
              alignment="center"
              justifyContent="space-between"
              customStyle={{ marginTop: 8 }}
            >
              <Typography variant="h4" color="ui60">
                페이백
              </Typography>
              <Typography variant="h4">{commaNumber(5000)}원</Typography>
            </Flexbox>
            <Flexbox
              alignment="center"
              justifyContent="space-between"
              customStyle={{ marginTop: 8 }}
            >
              <Typography variant="h4" color="ui60">
                은행
              </Typography>
              <Typography variant="h4">{userAccounts[0]?.bankName}</Typography>
            </Flexbox>
            <Flexbox
              alignment="center"
              justifyContent="space-between"
              customStyle={{ marginTop: 8 }}
            >
              <Typography variant="h4" color="ui60">
                계좌번호
              </Typography>
              <Typography variant="h4">{userAccounts[0]?.accountNumber}</Typography>
            </Flexbox>
            <Flexbox
              alignment="center"
              justifyContent="space-between"
              customStyle={{ marginTop: 23 }}
            >
              <Typography weight="medium" variant="h4">
                정산예정금액
              </Typography>
              <Typography weight="bold" variant="h3" color="red-light">
                {commaNumber(totalPrice || 0)}원
              </Typography>
            </Flexbox>
          </SectionWrap>
          <Gap />
          <SectionWrap>
            <Typography weight="bold" variant="h3">
              배송정보
            </Typography>
            <Flexbox
              alignment="center"
              justifyContent="space-between"
              customStyle={{ marginTop: 20 }}
            >
              <Typography variant="h4" color="ui60">
                받는사람
              </Typography>
              <Typography variant="h4">(주)마스터카멜</Typography>
            </Flexbox>
            <Flexbox
              alignment="center"
              justifyContent="space-between"
              customStyle={{ marginTop: 8 }}
            >
              <Typography variant="h4" color="ui60">
                연락처
              </Typography>
              <Typography variant="h4">070-4788-9600</Typography>
            </Flexbox>
            {isDelivery && (
              <Flexbox
                alignment="center"
                justifyContent="space-between"
                customStyle={{ marginTop: 8 }}
              >
                <Typography variant="h4" color="ui60">
                  송장번호
                </Typography>
                <Typography variant="h4">
                  {
                    deliveryCompanys?.find(
                      (company) => company.name === orderDelivery?.deliveryCode
                    )?.description
                  }{' '}
                  {orderDelivery?.contents}
                </Typography>
              </Flexbox>
            )}
            <Flexbox
              alignment="flex-start"
              justifyContent="space-between"
              customStyle={{ marginTop: 8 }}
            >
              <Typography variant="h4" color="ui60">
                배송지
              </Typography>
              <Typography variant="h4">
                서울 용산구 한강대로 366 트윈시티 남산 2,
                <br />
                오피스동 8층 우편함
              </Typography>
            </Flexbox>
            {isDelivery && <OrderSearchDelieryForm />}
          </SectionWrap>
          <Gap />
        </>
      )}
      {isReturn && (
        <>
          <SectionWrap>
            <Typography weight="bold" variant="h3">
              반품정보
            </Typography>
            <Flexbox
              alignment="center"
              justifyContent="space-between"
              customStyle={{ marginTop: 20 }}
            >
              <Typography variant="h4" color="ui60">
                반품송장번호
              </Typography>
              <Typography variant="h4">택배사 택배송장번호</Typography>
            </Flexbox>
            <Box
              customStyle={{ marginTop: 20, background: common.bg02, borderRadius: 8, padding: 12 }}
            >
              <Typography color="ui60" variant="h4">
                반품사유
              </Typography>
              <Typography variant="h4" customStyle={{ marginTop: 8 }}>
                매물의 상태가 사진과 상이합니다.
              </Typography>
            </Box>
            <OrderSearchDelieryForm />;
          </SectionWrap>
          <Gap />
        </>
      )}
      <SectionWrap>
        <Typography weight="bold" variant="h3">
          거래정보
        </Typography>
        <Flexbox alignment="center" justifyContent="space-between" customStyle={{ marginTop: 20 }}>
          <Typography variant="h4" color="ui60">
            주문번호
          </Typography>
          <Typography variant="h4">{id}</Typography>
        </Flexbox>
        <Flexbox alignment="center" justifyContent="space-between" customStyle={{ marginTop: 8 }}>
          <Typography variant="h4" color="ui60">
            주문일시
          </Typography>
          <Typography variant="h4">{dayjs(dateExpired).format('YYYY.MM.DD. HH:MM ')}</Typography>
        </Flexbox>
      </SectionWrap>
    </>
  );
}

const SectionWrap = styled.section`
  padding: 32px 0;
`;

const Gap = styled.div`
  height: 8px;
  width: calc(100% + 40px);
  margin-left: -20px;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui95};
`;

export default OrderPaymentInfo;
