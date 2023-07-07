import { useCallback, useMemo } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { Box, Flexbox, Icon, Skeleton, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import UserAvatar from '@components/UI/organisms/UserAvatar';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { PAYMENTS_SUCCESS } from '@constants/localStorage';
import { HEADER_HEIGHT, IOS_SAFE_AREA_TOP } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getFormattedActivatedTime } from '@utils/formats';
import {
  getImagePathStaticParser,
  getImageResizePath,
  isExtendedLayoutIOSVersion
} from '@utils/common';

import { channelBottomSheetStateFamily } from '@recoil/channel/atom';

interface ChannelHeaderProps {
  isLoading?: boolean;
  isTargetUserSeller: boolean;
  isDeletedTargetUser: boolean;
  targetUserImage: string | undefined;
  targetUserName: string;
  targetUserId: number | undefined;
  isCrawlingProduct?: boolean;
  sellerUserId?: number;
  isAdminBlockUser?: boolean;
  isTargetUserBlocked?: boolean;
  dateActivated?: string;
  isAllOperatorProduct?: boolean;
}

function ChannelHeader({
  isLoading = false,
  isTargetUserSeller,
  isDeletedTargetUser,
  targetUserImage,
  targetUserName,
  targetUserId,
  isCrawlingProduct,
  sellerUserId,
  isAdminBlockUser,
  isTargetUserBlocked,
  dateActivated = '',
  isAllOperatorProduct
}: ChannelHeaderProps) {
  const router = useRouter();
  const { key } = router.query;
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();

  const setMoreBottomSheetState = useSetRecoilState(channelBottomSheetStateFamily('more'));
  const getTimeForamt = getFormattedActivatedTime(dateActivated);
  const handleClickClose = useCallback(() => {
    if (key) {
      router.replace('/mypage/nonMember/orders');
      return;
    }
    if (window.history.length > 2 && !LocalStorage.get(PAYMENTS_SUCCESS)) {
      router.back();
      return;
    }
    LocalStorage.remove(PAYMENTS_SUCCESS);
    router.replace({ pathname: '/channels', query: { type: 0 } });
  }, [router, key]);

  const handleClickTitle = useCallback(() => {
    if (!targetUserId || isDeletedTargetUser) return;

    logEvent(attrKeys.channel.CLICK_PROFILE, {
      name: attrProperty.name.CHANNEL_DETAIL,
      title: isTargetUserSeller ? attrProperty.title.SELLER : attrProperty.title.BUYER
    });

    const pathname = isCrawlingProduct
      ? `/sellerInfo/${sellerUserId}`
      : `/userInfo/${targetUserId}`;

    router.push(pathname);
  }, [
    targetUserId,
    isDeletedTargetUser,
    isTargetUserSeller,
    isCrawlingProduct,
    sellerUserId,
    router
  ]);

  const handleClickMore = useCallback(() => {
    logEvent(attrKeys.channel.CLICK_CHANNEL_MORE, { name: attrProperty.name.CHANNEL_DETAIL });

    setMoreBottomSheetState({ open: true, isChannel: true });
  }, [setMoreBottomSheetState]);

  const getOperatorTime = useMemo(() => {
    const now = dayjs();
    const start = dayjs().set('hour', 10).set('minute', 0).set('second', 0);
    const end = dayjs().set('hour', 19).set('minute', 0).set('second', 0);
    const weekday = now.day();

    return now.isBetween(start, end) && weekday >= 1 && weekday <= 5;
  }, []);

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
              {isAllOperatorProduct && (
                <Icon
                  name="Logo_45_45"
                  width={28}
                  height={28}
                  color={getOperatorTime ? 'primary' : 'ui80'}
                />
              )}
              {!isTargetUserBlocked &&
                !isAdminBlockUser &&
                !isDeletedTargetUser &&
                !isAllOperatorProduct && (
                  <UserAvatar
                    width={32}
                    height={32}
                    src={getImageResizePath({
                      imagePath: getImagePathStaticParser(targetUserImage || ''),
                      w: 32
                    })}
                    isRound
                    iconCustomStyle={{ width: 16, height: 16 }}
                  />
                )}
              <Flexbox direction="vertical">
                {isAllOperatorProduct && (
                  <Typography weight="bold" variant="h3">
                    {targetUserName}
                  </Typography>
                )}
                {!isAllOperatorProduct && (
                  <UserName
                    weight="bold"
                    disabled={isTargetUserBlocked || isAdminBlockUser || isDeletedTargetUser}
                  >
                    {`${targetUserName}${isDeletedTargetUser ? ' (탈퇴)' : ''}`}
                    {!isDeletedTargetUser && (isTargetUserBlocked || isAdminBlockUser) && ' (차단)'}
                  </UserName>
                )}
                {isAllOperatorProduct && (
                  <Flexbox alignment="center">
                    <Typography
                      color={getOperatorTime ? 'primary' : 'ui60'}
                      variant="small2"
                      weight="medium"
                    >
                      {getOperatorTime ? '운영중' : '운영시간 평일 10:00 ~ 19:00'} •
                    </Typography>
                  </Flexbox>
                )}
                {dateActivated && !isAllOperatorProduct && (
                  <Flexbox alignment="center">
                    {getTimeForamt.icon === 'time' ? (
                      <Icon
                        name="TimeOutlined"
                        customStyle={{
                          marginRight: 2,
                          height: '14px !important',
                          width: 14,
                          color: getTimeForamt.icon === 'time' ? common.ui60 : primary.light
                        }}
                      />
                    ) : (
                      <Box
                        customStyle={{
                          width: 5,
                          height: 5,
                          background: getTimeForamt.icon === 'time' ? common.ui60 : primary.light,
                          borderRadius: '50%',
                          marginRight: 5
                        }}
                      />
                    )}
                    <Typography
                      variant="body3"
                      color={getTimeForamt.icon === 'time' ? 'ui60' : 'primary-light'}
                    >
                      {getTimeForamt.text}
                    </Typography>
                  </Flexbox>
                )}
              </Flexbox>
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

const Layout = styled.div`
  position: relative;
  top: 0;
  height: calc(${HEADER_HEIGHT}px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'});
`;

const Wrapper = styled.div`
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
