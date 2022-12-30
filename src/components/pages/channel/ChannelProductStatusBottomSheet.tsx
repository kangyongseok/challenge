import { useCallback, useEffect } from 'react';

import { useRecoilState } from 'recoil';
import { useMutation } from 'react-query';
import { useRouter } from 'next/router';
import { BottomSheet, Button, Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { putProductUpdateStatus } from '@api/product';

import { productStatus } from '@constants/channel';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getLogEventAtt, getLogEventTitle } from '@utils/channel';

import { putProductUpdateStatusParams } from '@typings/products';
import { channelBottomSheetStateFamily } from '@recoil/channel/atom';

interface ChannelProductStatusBottomSheetProps {
  id: number;
  status: number;
  targetUserId?: number;
  isNoSellerReviewAndHasTarget?: boolean;
  isChannel?: boolean;
  onSuccessProductUpdateStatus?: () => void;
}

function ChannelProductStatusBottomSheet({
  id,
  status,
  targetUserId,
  isNoSellerReviewAndHasTarget = false,
  isChannel = true,
  onSuccessProductUpdateStatus
}: ChannelProductStatusBottomSheetProps) {
  const router = useRouter();
  const [{ open }, setProductStatusBottomSheetState] = useRecoilState(
    channelBottomSheetStateFamily('productStatus')
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
    (newStatus: number) => () => {
      if (isLoading || !id) return;

      logEvent(attrKeys.channel.CLICK_PRODUCT_MODAL, {
        name: attrProperty.name.CHANNEL,
        title: getLogEventTitle(status),
        att: status === 8 && newStatus === 0 ? 'SHOW' : getLogEventAtt(newStatus)
      });

      const params: putProductUpdateStatusParams = { productId: id, status: newStatus };

      if (newStatus === 1 && !!targetUserId) {
        params.soldType = 1;
        params.targetUserId = targetUserId;
      }

      mutatePutProductUpdateStatus(params, {
        onSuccess() {
          if (onSuccessProductUpdateStatus) onSuccessProductUpdateStatus();

          setProductStatusBottomSheetState({ open: false, isChannel });

          if (newStatus === 1 && isNoSellerReviewAndHasTarget) {
            router.push(
              {
                pathname: '/channels',
                query: {
                  productId: id,
                  isSelectTargetUser: true
                }
              },
              undefined,
              { shallow: true }
            );
          }
        }
      });
    },
    [
      id,
      isChannel,
      isLoading,
      isNoSellerReviewAndHasTarget,
      mutatePutProductUpdateStatus,
      onSuccessProductUpdateStatus,
      router,
      setProductStatusBottomSheetState,
      status,
      targetUserId
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
            <Menu variant="h3" weight="medium" onClick={handleClickStatus(4)}>
              예약중
            </Menu>
          )}
          {![productStatus[1], productStatus[2], productStatus[3]].includes(
            productStatus[status as keyof typeof productStatus]
          ) && (
            <Menu variant="h3" weight="medium" onClick={handleClickStatus(1)}>
              판매완료
            </Menu>
          )}
          {productStatus[8] !== productStatus[status as keyof typeof productStatus] && (
            <Menu variant="h3" weight="medium" onClick={handleClickStatus(8)}>
              숨기기
            </Menu>
          )}
          {productStatus[8] === productStatus[status as keyof typeof productStatus] && (
            <Menu variant="h3" weight="medium" onClick={handleClickStatus(0)}>
              보이기
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
