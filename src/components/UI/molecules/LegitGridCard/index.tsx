import type { HTMLAttributes } from 'react';
import { useState } from 'react';

import { Box, Flexbox, Icon, Image, Typography, useTheme } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';

import { LegitLabel } from '@components/UI/atoms';

import type { Product, ProductResult } from '@dto/product';

import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber, getProductCardImageResizePath } from '@utils/common';

import type { ProductGridCardVariant } from '@typings/common';

import { Content, MoreButton, Overlay } from './LegitGridCard.styles';

export interface LegitGridCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ProductGridCardVariant;
  product: Product | ProductResult;
  result?: 0 | 1 | 2 | 3;
  resultCount?: number;
  authenticCount?: number;
  fakeCount?: number;
  status?: number;
  rank?: number;
  hideLabel?: boolean;
  hidePrice?: boolean;
  hideMetaInfo?: boolean;
  hideMoreButton?: boolean;
  customStyle?: CustomStyle;
  customTitleStyle?: CustomStyle;
}

function LegitGridCard({
  variant,
  product,
  result,
  resultCount,
  authenticCount = 0,
  fakeCount = 0,
  status,
  rank,
  hideLabel,
  hidePrice = true,
  hideMetaInfo = true,
  hideMoreButton = true,
  customStyle,
  customTitleStyle,
  ...props
}: LegitGridCardProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const {
    title,
    imageMain,
    imageThumbnail,
    brand: { nameEng = '' },
    price
  } = product || {};

  const [loadFailed, setLoadFailed] = useState(false);

  return (
    <Flexbox {...props} direction="vertical" customStyle={{ cursor: 'pointer' }} css={customStyle}>
      <Box
        customStyle={{
          position: 'relative'
        }}
      >
        <Image
          ratio="5:6"
          src={
            loadFailed
              ? imageMain || imageThumbnail
              : getProductCardImageResizePath(imageMain || imageThumbnail)
          }
          alt={`${title} 이미지`}
          round={variant !== 'gridA' ? 8 : 0}
          onError={() => setLoadFailed(true)}
        />
        {!hideLabel && (
          <>
            {result === 1 && (
              <LegitLabel
                opinion="authentic"
                text={`정품의견${resultCount ? ` ${resultCount}개` : ''}`}
                customStyle={{
                  position: 'absolute',
                  top: 8,
                  left: 8
                }}
              />
            )}
            {result === 2 && (
              <LegitLabel
                opinion="fake"
                text={`가품의심${resultCount ? ` ${resultCount}개` : ''}`}
                customStyle={{
                  position: 'absolute',
                  top: 8,
                  left: 8
                }}
              />
            )}
            {result === 3 && (
              <LegitLabel
                opinion="impossible"
                text={`감정불가${resultCount ? ` ${resultCount}개` : ''}`}
                customStyle={{
                  position: 'absolute',
                  top: 8,
                  left: 8
                }}
              />
            )}
            {!result && status === 20 && (
              <LegitLabel
                opinion="legitIng"
                text="감정중"
                customStyle={{
                  position: 'absolute',
                  top: 8,
                  left: 8
                }}
              />
            )}
          </>
        )}
        {rank && (
          <Overlay>
            <Typography
              variant="body2"
              weight="medium"
              customStyle={{
                color: common.cmn20
              }}
            >
              {`주간 ${rank}위`}
            </Typography>
          </Overlay>
        )}
      </Box>
      <Content variant={variant}>
        {!hideMoreButton && (
          <MoreButton variant={variant}>
            <Icon name="MoreHorizFilled" width={20} height={20} color={common.ui80} />
          </MoreButton>
        )}
        <Typography variant="body2" weight="bold">
          {nameEng
            .split(' ')
            .map(
              (splitNameEng) =>
                `${splitNameEng.charAt(0).toUpperCase()}${splitNameEng.slice(
                  1,
                  splitNameEng.length
                )}`
            )
            .join(' ')}
        </Typography>
        <Typography
          variant="body2"
          noWrap
          lineClamp={2}
          customStyle={{
            marginTop: 2,
            color: common.ui60,
            ...customTitleStyle
          }}
        >
          {title}
        </Typography>
        {!hidePrice && (
          <Typography
            variant="h3"
            weight="bold"
            customStyle={{
              marginTop: 4
            }}
          >
            {`${commaNumber(getTenThousandUnitPrice(price))}만원`}
          </Typography>
        )}
        {!hideMetaInfo && (
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
                {authenticCount}
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
                {fakeCount}
              </Typography>
            </Flexbox>
          </Flexbox>
        )}
      </Content>
    </Flexbox>
  );
}

export default LegitGridCard;
