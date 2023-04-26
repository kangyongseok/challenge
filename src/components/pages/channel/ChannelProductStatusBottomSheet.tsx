import { useCallback, useEffect } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { BottomSheet, Button, Flexbox, Typography } from 'mrcamel-ui';
import { useMutation } from '@tanstack/react-query';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { putProductUpdateStatus } from '@api/product';

import { productStatus } from '@constants/channel';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getLogEventAtt, getLogEventTitle } from '@utils/channel';

import { channelBottomSheetStateFamily } from '@recoil/channel/atom';

interface ChannelProductStatusBottomSheetProps {
  id: number;
  channelId?: number;
  status: number;
  targetUserId?: number;
  isChannel?: boolean;
  onSuccessProductUpdateStatus?: () => void;
}

function ChannelProductStatusBottomSheet({
  id,
  channelId,
  status,
  isChannel = false,
  onSuccessProductUpdateStatus
}: ChannelProductStatusBottomSheetProps) {
  const [{ open }, setProductStatusBottomSheetState] = useRecoilState(
    channelBottomSheetStateFamily('productStatus')
  );
  const setSelectTargetUserBottomSheetState = useSetRecoilState(
    channelBottomSheetStateFamily('selectTargetUser')
  );

  const { mutate: mutatePutProductUpdateStatus, isLoading } = useMutation(putProductUpdateStatus);

  useEffect(() => {
    if (open) {
      logEvent(attrKeys.channel.VIEW_PRODUCT_MODAL, {
        name: attrProperty.name.CHANNEL_DETAIL,
        title: getLogEventTitle(status)
      });
    }
  }, [open, status]);

  const handleClose = useCallback(() => {
    setProductStatusBottomSheetState({ open: false, isChannel });
  }, [isChannel, setProductStatusBottomSheetState]);

  const handleClickStatus = useCallback(
    (newStatus: number, newChannelId?: number) => () => {
      if (isLoading || !id) return;

      logEvent(attrKeys.channel.CLICK_PRODUCT_MODAL, {
        name: attrProperty.name.CHANNEL,
        title: getLogEventTitle(status),
        att: status === 8 && newStatus === 0 ? 'SHOW' : getLogEventAtt(newStatus)
      });

      setProductStatusBottomSheetState({ open: false, isChannel });
      mutatePutProductUpdateStatus(
        { productId: id, status: newStatus, channelId: newChannelId },
        {
          onSuccess() {
            if (onSuccessProductUpdateStatus) onSuccessProductUpdateStatus();

            if (newStatus === 1)
              setTimeout(
                () =>
                  setSelectTargetUserBottomSheetState({
                    open: true,
                    isChannel,
                    location: 'CHANNEL_DETAIL'
                  }),
                500
              );
          }
        }
      );
    },
    [
      id,
      isChannel,
      isLoading,
      mutatePutProductUpdateStatus,
      onSuccessProductUpdateStatus,
      setProductStatusBottomSheetState,
      setSelectTargetUserBottomSheetState,
      status
    ]
  );

  useEffect(() => {
    if (open) {
      logEvent(attrKeys.channel.VIEW_PRODUCT_MODAL, { title: getLogEventTitle(status) });
    }
  }, [open, status]);

  return (
    <BottomSheet disableSwipeable open={open} onClose={handleClose}>
      <Flexbox direction="vertical" gap={20} customStyle={{ padding: 20 }}>
        <Flexbox direction="vertical">
          {productStatus[0] !== productStatus[status as keyof typeof productStatus] && (
            <Menu variant="h3" weight="medium" onClick={handleClickStatus(0)}>
              판매중
            </Menu>
          )}
          {[productStatus[0], productStatus[1], productStatus[2], productStatus[3]].includes(
            productStatus[status as keyof typeof productStatus]
          ) && (
            <Menu variant="h3" weight="medium" onClick={handleClickStatus(4, channelId)}>
              예약중
            </Menu>
          )}
          {![productStatus[1], productStatus[2], productStatus[3], productStatus[8]].includes(
            productStatus[status as keyof typeof productStatus]
          ) && (
            <Menu variant="h3" weight="medium" onClick={handleClickStatus(1)}>
              판매완료
            </Menu>
          )}
          {productStatus[0] === productStatus[status as keyof typeof productStatus] && (
            <Menu variant="h3" weight="medium" onClick={handleClickStatus(8)}>
              숨기기
            </Menu>
          )}
        </Flexbox>
        <Button size="xlarge" variant="ghost" brandColor="black" fullWidth onClick={handleClose}>
          취소
        </Button>
      </Flexbox>
    </BottomSheet>
  );
}

const Menu = styled(Typography)`
  padding: 12px;
  text-align: center;
  cursor: pointer;
`;

export default ChannelProductStatusBottomSheet;
