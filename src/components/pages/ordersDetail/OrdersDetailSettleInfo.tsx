import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Button, Flexbox, Typography } from '@mrcamelhub/camel-ui';

import { Gap } from '@components/UI/atoms';

import { fetchUserAccounts } from '@api/user';

import queryKeys from '@constants/queryKeys';

import { commaNumber } from '@utils/formats';

import { ordersDetailSalesCancelDialogState } from '@recoil/ordersDetail';
import useSession from '@hooks/useSession';
import useOrdersDetail from '@hooks/useOrdersDetail';

function OrdersDetailRefundInfo() {
  const router = useRouter();
  const { id } = router.query;

  const setSalesCancelDialogState = useSetRecoilState(ordersDetailSalesCancelDialogState);

  const { isLoggedInWithSMS } = useSession();
  const {
    data: { price = 0, type, hold } = {},
    orderStatus,
    isSeller
  } = useOrdersDetail({ id: Number(id) });

  const { data: userAccounts = [] } = useQuery(
    queryKeys.users.userAccounts(),
    () => fetchUserAccounts(),
    {
      enabled: isLoggedInWithSMS
    }
  );

  if (
    !isSeller ||
    [
      '결제취소',
      '환불대기',
      '환불진행',
      '환불완료',
      '배송준비 중 취소 요청',
      '거래준비 중 취소 요청'
    ].includes(orderStatus.name)
  )
    return null;

  return (
    <>
      <Gap height={8} />
      <Flexbox
        component="section"
        direction="vertical"
        gap={20}
        customStyle={{
          padding: '32px 20px'
        }}
      >
        <Typography variant="h3" weight="bold">
          정산정보
        </Typography>
        <Flexbox direction="vertical" gap={4}>
          <Flexbox justifyContent="space-between" alignment="center">
            <Typography color="ui60">판매금액</Typography>
            <Typography>{commaNumber(price || 0)}원</Typography>
          </Flexbox>
          {type !== 1 && (
            <Flexbox justifyContent="space-between" alignment="center">
              <Typography color="ui60">배송비</Typography>
              <Typography>배송비 별도</Typography>
            </Flexbox>
          )}

          <Flexbox justifyContent="space-between" alignment="center">
            <Typography color="ui60">정산계좌</Typography>
            {!userAccounts[0] ? (
              <Typography color="ui60">정산계좌를 입력해주세요</Typography>
            ) : (
              <Typography>
                {userAccounts[0].bankName} {userAccounts[0].accountNumber}
              </Typography>
            )}
          </Flexbox>
          <Flexbox
            justifyContent="space-between"
            customStyle={{
              marginTop: 16
            }}
          >
            <Typography variant="h4" weight="medium">
              {['배송대기', '배송진행', '배송완료', '정산대기', '정산진행'].includes(
                orderStatus.name
              )
                ? '정산예정금액'
                : '정산금액'}
            </Typography>
            <Typography variant="h3" weight="bold" color="red-light">
              {commaNumber(price || 0)}원
            </Typography>
          </Flexbox>
          {['결제완료', '배송대기', '거래대기'].includes(orderStatus.name) && !hold && (
            <Button
              variant="ghost"
              brandColor="black"
              size="large"
              fullWidth
              onClick={() =>
                setSalesCancelDialogState({
                  open: true,
                  variant: orderStatus.name === '결제완료' ? 'refuse' : 'cancel'
                })
              }
              customStyle={{
                marginTop: 16
              }}
            >
              주문취소
            </Button>
          )}
        </Flexbox>
      </Flexbox>
    </>
  );
}

export default OrdersDetailRefundInfo;
