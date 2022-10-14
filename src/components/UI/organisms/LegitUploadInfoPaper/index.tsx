import type { PropsWithChildren } from 'react';

import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';

import Image from '@components/UI/atoms/Image';

import { Divider, StyledLegitUploadInfoPaper } from './LegitUploadInfoPaper.styles';

interface LegitUploadInfoPaperProps {
  model: {
    name: string;
    imagSrc: string;
  };
  title: string;
  description?: string;
  customStyle?: CustomStyle;
}

function LegitUploadInfoPaper({
  children,
  model: { name, imagSrc },
  title,
  description,
  customStyle
}: PropsWithChildren<LegitUploadInfoPaperProps>) {
  const {
    theme: {
      mode,
      palette: { common }
    }
  } = useTheme();
  return (
    <StyledLegitUploadInfoPaper css={customStyle}>
      <Image
        width={110}
        height={110}
        src={imagSrc}
        alt="Model Img"
        disableAspectRatio
        customStyle={{
          position: 'absolute',
          top: -55,
          left: '50%',
          transform: 'translateX(-50%)',
          mixBlendMode: mode === 'light' ? 'darken' : ''
        }}
      />
      <Flexbox direction="vertical" alignment="center" gap={4} customStyle={{ marginTop: 68 }}>
        <Typography variant="h3" weight="medium">
          {title}
        </Typography>
        <Typography variant="h4" customStyle={{ color: common.ui60 }}>
          {name}
        </Typography>
      </Flexbox>
      <Divider />
      <Box customStyle={{ padding: '0 20px 32px' }}>
        {children && (
          <Flexbox direction="vertical" gap={12}>
            <Typography variant="h4" weight="medium" customStyle={{ marginBottom: 12 }}>
              업로드 정보
            </Typography>
            {children}
          </Flexbox>
        )}
        {description && (
          <Typography variant="body2" customStyle={{ marginTop: 12 }}>
            {description}
          </Typography>
        )}
      </Box>
    </StyledLegitUploadInfoPaper>
  );
}

export default LegitUploadInfoPaper;
