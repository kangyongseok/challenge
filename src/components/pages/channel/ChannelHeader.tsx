import { useCallback } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Icon, Skeleton, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import UserAvatar from '@components/UI/organisms/UserAvatar';

import { logEvent } from '@library/amplitude';

import { HEADER_HEIGHT, IOS_SAFE_AREA_TOP } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent, isExtendedLayoutIOSVersion } from '@utils/common';

import { channelBottomSheetStateFamily, channelPushPageState } from '@recoil/channel/atom';

interface ChannelHeaderProps {
  isLoading?: boolean;
  isTargetUserSeller: boolean;
  isDeletedTargetUser: boolean;
  targetUserImage: string | undefined;
  targetUserName: string;
  targetUserId: number | undefined;
  isExternalPlatform?: boolean;
  sellerUserId?: number;
  isAdminBlockUser?: boolean;
}

function ChannelHeader({
  isLoading = false,
  isTargetUserSeller,
  isDeletedTargetUser,
  targetUserImage,
  targetUserName,
  targetUserId,
  isExternalPlatform,
  sellerUserId,
  isAdminBlockUser
}: ChannelHeaderProps) {
  const router = useRouter();

  const setMoreBottomSheetState = useSetRecoilState(channelBottomSheetStateFamily('more'));
  const setChannelPushPageState = useSetRecoilState(channelPushPageState);

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
    if (!targetUserId || isDeletedTargetUser) return;

    logEvent(attrKeys.channel.CLICK_PROFILE, {
      name: attrProperty.name.CHANNEL_DETAIL,
      title: isTargetUserSeller ? attrProperty.title.SELLER : attrProperty.title.BUYER
    });

    const pathname = isExternalPlatform
      ? `/sellerInfo/${sellerUserId}`
      : `/userInfo/${targetUserId}`;

    if (checkAgent.isIOSApp()) {
      setChannelPushPageState(isExternalPlatform ? 'sellerInfo' : 'userInfo');
      window.webkit?.messageHandlers?.callRedirect?.postMessage?.(
        JSON.stringify({
          pathname,
          redirectChannelUrl: router.asPath
        })
      );
      return;
    }

    router.push(pathname);
  }, [
    targetUserId,
    isDeletedTargetUser,
    isTargetUserSeller,
    isExternalPlatform,
    sellerUserId,
    router,
    setChannelPushPageState
  ]);

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
            <Title disabled={isDeletedTargetUser} onClick={handleClickTitle}>
              {!isAdminBlockUser && !isDeletedTargetUser && (
                <UserAvatar
                  src={targetUserImage || ''}
                  width={32}
                  height={32}
                  isRound
                  iconCustomStyle={{ width: 16, height: 16 }}
                />
              )}
              <UserName
                variant="h3"
                weight="bold"
                disabled={isAdminBlockUser || isDeletedTargetUser}
              >
                {`${targetUserName}${isDeletedTargetUser ? ' (탈퇴)' : ''}`}
                {!isDeletedTargetUser && isAdminBlockUser && ' (차단)'}
              </UserName>
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
  height: calc(${HEADER_HEIGHT}px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'});
`;

const Wrapper = styled.div`
  /* position: fixed; */
  width: 100%;
  height: calc(${HEADER_HEIGHT}px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'});
  display: flex;
  align-items: center;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  background-color: ${({ theme: { palette } }) => palette.common.uiWhite};
  padding-top: ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : 0};
`;

const IconBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  padding: 16px;
`;

const Title = styled.div<{ disabled?: boolean }>`
  display: flex;
  justify-content: start;
  align-items: center;
  column-gap: 8px;
  flex: 1 1 auto;
  overflow: hidden;
  white-space: nowrap;
  padding: 16px 0;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
`;

const UserName = styled(Typography)<{ disabled: boolean }>`
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ disabled, theme: { palette } }) => disabled && palette.common.ui60};
`;

export default ChannelHeader;
