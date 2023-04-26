import { useRouter } from 'next/router';
import { Typography } from 'mrcamel-ui';
import dayjs from 'dayjs';
import { QueryClient, useMutation } from '@tanstack/react-query';
import styled from '@emotion/styled';

import type { ChannelAppointmentResult } from '@dto/channel';

import { putProductUpdateStatus } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { productStatus } from '@constants/channel';

import type { MemorizedMessage } from '@typings/channel';

interface ChannelAppointmentMessageProps extends Omit<MemorizedMessage, 'message' | 'userReview'> {
  productId: number;
  status: number;
  appointment: ChannelAppointmentResult;
  isSeller: boolean;
  targetUserName: string;
  isTargetUserSeller: boolean;
}

function ChannelAppointmentMessage({
  productId,
  status,
  appointment: { dateAppointment, notiTime, type },
  isPushNoti,
  showChangeProductStatus,
  showAppointmentDetail,
  isSeller,
  targetUserName,
  isTargetUserSeller
}: ChannelAppointmentMessageProps) {
  const router = useRouter();

  const { mutate: mutatePutProductUpdateStatus, isLoading } = useMutation(putProductUpdateStatus);

  const appointmentNotiTime = notiTime === 60 ? '1시간' : `${notiTime}분`;
  const showChangeProductStatusMessage =
    isSeller &&
    showChangeProductStatus &&
    productStatus[status as keyof typeof productStatus] === productStatus[0];

  const handleClickViewAppointment = () => {
    router.push({
      pathname: `/channels/${router.query.id}/appointment`
    });
  };

  const handleClickUpdate = () => {
    if (isLoading) return;

    mutatePutProductUpdateStatus(
      { productId, status: 4 },
      {
        onSuccess() {
          const queryClient = new QueryClient();

          queryClient.invalidateQueries(queryKeys.channels.channel(Number(router.query.id || '')));
        }
      }
    );
  };

  return isPushNoti ? (
    <PushNotiMessage variant="body2" weight="medium">{`${
      isTargetUserSeller ? '판매자' : '구매자'
    } ${targetUserName}님과 약속시간 ${appointmentNotiTime} 전이에요.`}</PushNotiMessage>
  ) : (
    <>
      {type === 'CREATE' && (
        <>
          <AppointmentMessage variant="body2" weight="medium">
            {dayjs(dateAppointment).format('MM월 DD일(dd) A HH:mm에 직거래 약속이 생성되었어요.')}
            {!!notiTime && (
              <>
                <br />
                {`${appointmentNotiTime} 전 알려드릴게요!`}
              </>
            )}
          </AppointmentMessage>
          {showChangeProductStatusMessage && (
            <AppointmentMessage variant="body2" weight="medium">
              매물을 예약중으로 바꿀까요?
              <span onClick={handleClickUpdate}>예약중으로 변경하기</span>
            </AppointmentMessage>
          )}
        </>
      )}
      {type === 'UPDATE' && (
        <AppointmentMessage variant="body2" weight="medium">
          직거래 약속이 수정되었어요.
          {showAppointmentDetail && <span onClick={handleClickViewAppointment}>약속보기</span>}
          {!!notiTime && (
            <>
              <br />
              {`${appointmentNotiTime} 전 알려드릴게요!`}
            </>
          )}
        </AppointmentMessage>
      )}
      {type === 'DELETE' && (
        <AppointmentMessage variant="body2" weight="medium">
          약속이 취소되었어요.
        </AppointmentMessage>
      )}
    </>
  );
}

const PushNotiMessage = styled(Typography)`
  padding: 12px;
  margin: 20px 0;
  color: ${({ theme: { palette } }) => palette.primary.light};
  background-color: ${({ theme: { palette } }) => palette.primary.bgLight};
  border-radius: 8px;
  text-align: center;
`;

const AppointmentMessage = styled(Typography)`
  color: ${({ theme: { palette } }) => palette.common.ui60};
  text-align: center;
  margin: 20px 0;

  span {
    margin-left: 3px;
    text-decoration: underline;
  }
`;

export default ChannelAppointmentMessage;
