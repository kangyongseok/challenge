import { useEffect } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';

import { Image } from '@components/UI/atoms';

import ChannelTalk from '@library/channelTalk';
import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/formats';

import { homeLegitResultTooltipCloseState } from '@recoil/home';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

import {
  MessageTypography,
  StyledLegitInduceFloatingBanner
} from './LegitInduceFloatingBanner.styles';

export interface LegitInduceFloatingBannerProps {
  themeType?: 'light' | 'dark';
  edgeSpacing?: number;
  halfRound?: boolean;
  bottom?: number;
  channelTalkPosition?: number;
  name?: string;
  customStyle?: CustomStyle;
}

function LegitInduceFloatingBanner({
  themeType = 'dark',
  edgeSpacing,
  halfRound,
  bottom = 72,
  channelTalkPosition,
  name,
  customStyle
}: LegitInduceFloatingBannerProps) {
  const router = useRouter();

  const closeLegitResultTooltip = useRecoilValue(homeLegitResultTooltipCloseState);

  const {
    theme: {
      palette: { secondary, common }
    }
  } = useTheme();

  const { data: { recommLegitInfo: { images = [], legitTargetCount = 0 } = {} } = {} } =
    useQueryUserInfo();

  const handleClick = () => {
    logEvent(attrKeys.legit.CLICK_LEGIT_FLOATING, {
      name,
      title: attrProperty.legitTitle.WISH_TO_LEGIT
    });
    router.push({
      pathname: '/wishes',
      query: {
        hiddenTab: 'legit'
      }
    });
  };

  useEffect(() => {
    if (legitTargetCount && channelTalkPosition && closeLegitResultTooltip) {
      ChannelTalk.moveChannelButtonPosition(channelTalkPosition);
    }

    return () => {
      ChannelTalk.resetChannelButtonPosition();
    };
  }, [legitTargetCount, channelTalkPosition, closeLegitResultTooltip]);

  useEffect(() => {
    if (legitTargetCount) {
      logEvent(attrKeys.legit.VIEW_LEGIT_FLOATING, {
        name,
        title: attrProperty.legitTitle.WISH_TO_LEGIT
      });
    }
  }, [legitTargetCount, name]);

  if (!legitTargetCount || !closeLegitResultTooltip) return null;

  return (
    <StyledLegitInduceFloatingBanner
      themeType={themeType}
      edgeSpacing={edgeSpacing}
      halfRound={halfRound}
      bottom={bottom}
      css={customStyle}
      onClick={handleClick}
    >
      <Flexbox alignment="center" customStyle={{ padding: '12px 20px' }}>
        <Box customStyle={{ position: 'relative', minWidth: 40, minHeight: 32, maxHeight: 32 }}>
          {images.map((image, index) => (
            <Image
              key={`legit-induce-image-${image.slice(image.lastIndexOf('/') + 1)}`}
              width="32px"
              height="32px"
              src={image}
              alt="Product Img"
              disableAspectRatio
              customStyle={{
                position: 'absolute',
                top: 0,
                left: index * 4,
                border: `1px solid ${common.grey['90']}`,
                borderRadius: 4,
                zIndex: 3 - index
              }}
            />
          ))}
        </Box>
        <Flexbox
          alignment="center"
          customStyle={{
            flexGrow: 1,
            margin: '0 4px 0 8px',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden'
          }}
        >
          <MessageTypography themeType={themeType}>
            찜한 매물 중 <strong>사진감정가능</strong> 모아보기
          </MessageTypography>
          <Typography variant="body2" weight="bold" customStyle={{ color: secondary.red.main }}>
            +{commaNumber(legitTargetCount)}
          </Typography>
        </Flexbox>
        <Icon
          name="CaretRightOutlined"
          size="small"
          color={themeType === 'dark' ? common.white : undefined}
          customStyle={{ minWidth: 16, cursor: 'pointer' }}
        />
      </Flexbox>
    </StyledLegitInduceFloatingBanner>
  );
}

export default LegitInduceFloatingBanner;
