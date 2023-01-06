import { useSetRecoilState } from 'recoil';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from 'react-query';
import { useMutation } from 'react-query';
import { useRouter } from 'next/router';
import { Typography } from 'mrcamel-ui';
import { AdminMessage } from '@sendbird/chat/message';
import styled from '@emotion/styled';

import type { ChannelDetail } from '@dto/channel';

import { logEvent } from '@library/amplitude';

import { putProductUpdateStatus } from '@api/product';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';

import { channelPushPageState } from '@recoil/channel';

interface ChannelAdminMessageProps {
  message: AdminMessage;
  productId: number;
  targetUserId: number;
  refetchChannel: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ChannelDetail, unknown>>;
}

function ChannelAdminMessage({
  message,
  productId,
  targetUserId,
  refetchChannel
}: ChannelAdminMessageProps) {
  const router = useRouter();

  const setChannelPushPageState = useSetRecoilState(channelPushPageState);

  const { mutate: mutatePutProductUpdateStatus, isLoading } = useMutation(putProductUpdateStatus);

  const handleClickViewAppointment = () => {
    router
      .push({
        pathname: `/channels/${router.query.id}/appointment`
      })
      .then(() => {
        if (checkAgent.isIOSApp()) window.webkit?.messageHandlers?.callInputHide?.postMessage?.(0);
      });
  };

  const handleClickUpdate = () => {
    if (isLoading) return;

    mutatePutProductUpdateStatus(
      { productId, status: 4 },
      {
        onSuccess() {
          refetchChannel();
        }
      }
    );
  };

  const handleClickViewReviews = () => {
    logEvent(attrKeys.channel.CLICK_REVIEW_DETAIL, {
      name: attrProperty.name.CHANNEL_DETAIL,
      att: 'SEND'
    });

    const pathname = `/userInfo/${targetUserId}?tab=reviews`;

    if (checkAgent.isIOSApp()) {
      setChannelPushPageState('userInfo');
      window.webkit?.messageHandlers?.callRedirect?.postMessage?.(
        JSON.stringify({
          pathname,
          redirectChannelUrl: router.asPath
        })
      );

      return;
    }

    router.push(pathname);
  };

  return message.customType === 'appointmentPushNoti' ? (
    <PushNotiMessage variant="body2" weight="medium">
      {message.message}
    </PushNotiMessage>
  ) : (
    <AdminTextMessage variant="body2" weight="medium">
      {message.message.replace(/예약중으로 변경하기|약속보기|보낸 후기 보기/, '')}
      {message.customType === 'productReserve' && (
        <span onClick={handleClickUpdate}>예약중으로 변경하기</span>
      )}
      {message.customType === 'appointmentUpdated' && (
        <span onClick={handleClickViewAppointment}>약속보기</span>
      )}
      {message.customType === 'reviewSent' && (
        <span onClick={handleClickViewReviews}>보낸 후기 보기</span>
      )}
    </AdminTextMessage>
  );
}

const PushNotiMessage = styled(Typography)`
  padding: 12px;
  margin: 20px 0;
  color: ${({ theme: { palette } }) => palette.primary.light};
  background-color: ${({ theme: { palette } }) => palette.primary.bgLight};
  border-radius: 8px;
  text-align: center;
  white-space: pre-wrap;
  word-break: break-all;
`;

const AdminTextMessage = styled(Typography)`
  color: ${({ theme: { palette } }) => palette.common.ui60};
  text-align: center;
  margin: 20px 0;
  white-space: pre-wrap;
  word-break: break-all;

  span {
    margin-left: 3px;
    text-decoration: underline;
  }
`;

export default ChannelAdminMessage;
