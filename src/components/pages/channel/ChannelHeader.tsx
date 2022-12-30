import { useCallback } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Icon, Skeleton, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import UserAvatar from '@components/UI/organisms/UserAvatar';

import { logEvent } from '@library/amplitude';

import { HEADER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';

import { channelBottomSheetStateFamily } from '@recoil/channel/atom';

interface ChannelHeaderProps {
  isLoading?: boolean;
  targetUserIsSeller: boolean;
  targetUserImage: string | undefined;
  targetUserName: string;
  targetUserId: number | undefined;
}

function ChannelHeader({
  isLoading = false,
  targetUserIsSeller,
  targetUserImage,
  targetUserName,
  targetUserId
}: ChannelHeaderProps) {
  const router = useRouter();

  const setMoreBottomSheetState = useSetRecoilState(channelBottomSheetStateFamily('more'));

  const handleClickClose = useCallback(() => {
    if (checkAgent.isIOSApp()) {
      window.webkit?.messageHandlers?.callClose?.postMessage?.(0);
      return;
    }

    if (window.history.length > 2) {
      router.back();
      return;
    }

    router.replace({ pathname: '/channels', query: { type: 0 } });
  }, [router]);

  const handleClickTitle = useCallback(() => {
    logEvent(attrKeys.channel.CLICK_PROFILE, {
      name: attrProperty.name.CHANNEL_DETAIL,
      title: targetUserIsSeller ? attrProperty.title.SELLER : attrProperty.title.BUYER
    });

    if (!targetUserId) return;

    if (checkAgent.isIOSApp()) {
      window.webkit?.messageHandlers?.callRedirect?.postMessage?.(
        JSON.stringify({
          pathname: `/userInfo/${targetUserId}`,
          redirectChannelUrl: router.asPath
        })
      );
      return;
    }

    router.push(`/userInfo/${targetUserId}`);
  }, [router, targetUserId, targetUserIsSeller]);

  const handleClickMore = useCallback(() => {
    logEvent(attrKeys.channel.CLICK_CHANNEL_MORE, { name: attrProperty.name.CHANNEL_DETAIL });

    setMoreBottomSheetState({ open: true, isChannel: true });
  }, [setMoreBottomSheetState]);

  return (
    <Layout>
      <Wrapper>
        <IconBox onClick={handleClickClose}>
          <Icon name="ArrowLeftOutlined" />
        </IconBox>
        {isLoading ? (
          <>
            <Title>
              <Skeleton width={32} height={32} round="50%" disableAspectRatio />
              <Skeleton width={80} height={24} round={8} disableAspectRatio />
            </Title>
            <Skeleton
              width={24}
              height={24}
              round={8}
              disableAspectRatio
              customStyle={{ marginRight: 16 }}
            />
          </>
        ) : (
          <>
            <Title onClick={handleClickTitle}>
              <UserAvatar
                src={targetUserImage || ''}
                width={32}
                height={32}
                isRound
                iconCustomStyle={{ width: 16, height: 16 }}
              />
              <Typography
                variant="h3"
                weight="bold"
                customStyle={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {targetUserName}
              </Typography>
            </Title>
            <IconBox onClick={handleClickMore}>
              <Icon name="MoreHorizFilled" />
            </IconBox>
          </>
        )}
      </Wrapper>
    </Layout>
  );
}

const Layout = styled.header`
  position: relative;
  min-height: ${HEADER_HEIGHT}px;
`;

const Wrapper = styled.div`
  position: fixed;
  width: 100%;
  height: ${HEADER_HEIGHT}px;
  display: flex;
  align-items: center;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  background-color: ${({ theme: { palette } }) => palette.common.uiWhite};
`;

const IconBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  padding: 16px;
`;

const Title = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  column-gap: 8px;
  flex: 1 1 auto;
  overflow: hidden;
  white-space: nowrap;
  padding: 16px 0;
  height: ${HEADER_HEIGHT}px;
  cursor: pointer;
`;

export default ChannelHeader;
