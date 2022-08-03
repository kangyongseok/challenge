import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import { PopupButton } from '@typeform/embed-react';
import styled from '@emotion/styled';

import { Image } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function LegitContactBanner() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  return (
    <PopupButton
      id="rmVuaCLl"
      as="div"
      style={{ width: '100%' }}
      onReady={() => {
        logEvent(attrKeys.legit.CLICK_LEGIT_BANNER, {
          name: attrProperty.legitName.LEGIT_MAIN,
          title: attrProperty.legitTitle.JOIN_BTN
        });
      }}
    >
      <StyledLegitContactBanner gap={10}>
        <Box
          customStyle={{
            flex: 1,
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
        >
          <Typography
            weight="bold"
            customStyle={{
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              color: common.black
            }}
          >
            꼭 명품감정사가 아니더라도,
          </Typography>
          <Typography
            variant="body2"
            customStyle={{
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}
          >
            사진으로 정가품 의견이 가능한 분들은 연락주세요
          </Typography>
        </Box>
        <Box customStyle={{ position: 'relative', minWidth: 100 }}>
          <Image
            width={124}
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/legit/legit.png`}
            alt="Legit Img"
            disableAspectRatio
            customStyle={{ position: 'absolute', top: '-85%', right: 0, minWidth: 124 }}
          />
        </Box>
      </StyledLegitContactBanner>
    </PopupButton>
  );
}

const StyledLegitContactBanner = styled(Flexbox)`
  margin: 52px -20px;
  padding: 17px 0 16px 20px;
  text-overflow: ellipsis;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.grey['90']};
  cursor: pointer;
`;

export default LegitContactBanner;
