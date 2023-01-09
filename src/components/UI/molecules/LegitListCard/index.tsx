import type { HTMLAttributes } from 'react';

import { Box, Flexbox, Icon, Image, Typography, useTheme } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';

import { LegitLabel } from '@components/UI/atoms';

import type { ProductListCardVariant } from '@typings/common';

import { MoreButton } from './LegitListCard.styles';

export interface LegitListCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ProductListCardVariant;
  customStyle?: CustomStyle;
}

// TODO 기능 구현
function LegitListCard({ variant, customStyle, ...props }: LegitListCardProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  return (
    <Flexbox
      {...props}
      gap={16}
      alignment={variant === 'listB' ? 'center' : undefined}
      css={customStyle}
    >
      <Box
        customStyle={{
          position: 'relative',
          flexGrow: 1,
          minWidth: variant === 'listB' ? 60 : 120,
          maxWidth: variant === 'listB' ? 60 : 120,
          borderRadius: 8
        }}
      >
        <Image
          ratio="5:6"
          src="https://s3.ap-northeast-2.amazonaws.com/mrcamel/product/20221130_36198894_0.jpg"
          alt="20221130_36198894_0.jpg"
          round={8}
          disableOnBackground={false}
        />
        {variant === 'listA' && (
          <LegitLabel
            opinion="authentic"
            text="정품의견"
            customStyle={{
              position: 'absolute',
              top: 8,
              left: 8
            }}
          />
        )}
      </Box>
      <Box
        customStyle={{
          position: 'relative',
          flexGrow: 1
        }}
      >
        <Typography variant="body2" weight="bold">
          구찌
        </Typography>
        <Typography
          variant="body2"
          noWrap
          lineClamp={2}
          customStyle={{
            marginTop: 2,
            color: common.ui60
          }}
        >
          [팝니다] 구찌 스니커즈 급처
        </Typography>
        <Typography
          variant="h3"
          weight="bold"
          customStyle={{
            marginTop: 4
          }}
        >
          99만원
        </Typography>
        {variant === 'listA' && (
          <Flexbox
            gap={12}
            customStyle={{
              marginTop: 8
            }}
          >
            <Flexbox gap={2}>
              <Icon name="OpinionAuthenticFilled" width={12} height={12} color={common.ui80} />
              <Typography
                variant="small2"
                weight="medium"
                customStyle={{
                  color: common.ui80
                }}
              >
                2
              </Typography>
            </Flexbox>
            <Flexbox gap={2}>
              <Icon name="OpinionFakeFilled" width={12} height={12} color={common.ui80} />
              <Typography
                variant="small2"
                weight="medium"
                customStyle={{
                  color: common.ui80
                }}
              >
                2
              </Typography>
            </Flexbox>
          </Flexbox>
        )}
        <MoreButton variant={variant}>
          <Icon name="MoreHorizFilled" color={common.ui80} />
        </MoreButton>
      </Box>
    </Flexbox>
  );
}

export default LegitListCard;
