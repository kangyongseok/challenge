import { Box, Image, Typography, dark, useTheme } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';
import { PopupButton } from '@typeform/embed-react';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { ImageBox, InfoBox, StyledLegitContactBanner } from './LegitContactBanner.styles';

interface LegitContactBannerProps {
  isDark?: boolean;
  isFixed?: boolean;
  onClose?: () => void;
  customStyle?: CustomStyle;
}

function LegitContactBanner({
  isDark = false,
  isFixed = false,
  onClose,
  customStyle
}: LegitContactBannerProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  return (
    <PopupButton
      id="rmVuaCLl"
      as="section"
      style={{ width: '100%' }}
      onClose={onClose}
      onReady={() => {
        logEvent(attrKeys.legit.CLICK_BANNER, {
          name: attrProperty.legitName.LEGIT_PROFILE,
          title: attrProperty.legitTitle.JOINUS
        });
      }}
    >
      <Box
        customStyle={{
          position: 'relative',
          height: 72,
          ...customStyle
        }}
      >
        <StyledLegitContactBanner isDark={isDark} isFixed={isFixed}>
          <InfoBox>
            <Typography
              variant="body1"
              weight="bold"
              customStyle={{ color: isDark ? dark.palette.common.ui20 : common.uiBlack }}
            >
              꼭 명품감정사가 아니더라도,
            </Typography>
            <Typography
              variant="body2"
              customStyle={{ color: isDark ? dark.palette.common.ui60 : common.ui60 }}
            >
              사진으로 정가품 의견이 가능한 분들은 연락주세요
            </Typography>
          </InfoBox>
          <ImageBox>
            <Image
              height={107}
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/legit/legit.png`}
              alt="Legit Img"
              disableAspectRatio
            />
          </ImageBox>
        </StyledLegitContactBanner>
      </Box>
    </PopupButton>
  );
}

export default LegitContactBanner;
