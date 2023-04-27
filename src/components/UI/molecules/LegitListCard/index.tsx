import type { HTMLAttributes } from 'react';
import { useMemo, useState } from 'react';

import { Box, Flexbox, Icon, Image, Typography, useTheme } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';

import { LegitLabel } from '@components/UI/atoms';

import type { ProductLegit } from '@dto/productLegit';

import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber, getProductCardImageResizePath } from '@utils/common';

import type { ProductListCardVariant } from '@typings/common';

import { Description, MoreButton } from './LegitListCard.styles';

export interface LegitListCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ProductListCardVariant;
  productLegit: Partial<ProductLegit>;
  userId?: number;
  hidePrice?: boolean;
  hideResult?: boolean;
  hideMore?: boolean;
  customStyle?: CustomStyle;
  customTitleStyle?: CustomStyle;
}

function LegitListCard({
  variant,
  productLegit,
  userId = 0,
  hidePrice,
  hideResult,
  hideMore,
  customStyle,
  customTitleStyle,
  ...props
}: LegitListCardProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const {
    productResult: {
      quoteTitle = '',
      title: productTitle = '',
      brand: { nameEng = '' } = {},
      imageMain = '',
      imageThumbnail = '',
      price
    } = {},
    legitOpinions = []
  } = productLegit;

  const [loadFailed, setLoadFailed] = useState(false);

  const { authenticCount, fakeCount } = useMemo(
    () => ({
      authenticCount: legitOpinions.filter((legitOpinion) => legitOpinion.result === 1).length,
      fakeCount: legitOpinions.filter((legitOpinion) => legitOpinion.result === 2).length
    }),
    [legitOpinions]
  );
  const { result: opinionResult, description } =
    legitOpinions.find(({ roleLegit }) => roleLegit.userId === userId) || {};

  return (
    <Flexbox
      {...props}
      gap={16}
      alignment={variant === 'listB' ? 'center' : undefined}
      customStyle={{ cursor: 'pointer' }}
      css={customStyle}
    >
      <Box
        customStyle={{
          position: 'relative',
          flexGrow: 1,
          minWidth: variant === 'listB' ? 60 : 100,
          maxWidth: variant === 'listB' ? 60 : 100,
          borderRadius: 8
        }}
      >
        <Image
          ratio="5:6"
          src={
            loadFailed
              ? imageThumbnail || imageMain
              : getProductCardImageResizePath(imageThumbnail || imageMain)
          }
          alt={`${productTitle} 이미지`}
          round={8}
          onError={() => setLoadFailed(true)}
        />
        {variant === 'listA' && (
          <>
            {opinionResult === 1 && (
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
            {opinionResult === 2 && (
              <LegitLabel
                opinion="fake"
                text="가품의심"
                customStyle={{
                  position: 'absolute',
                  top: 8,
                  left: 8
                }}
              />
            )}
            {opinionResult === 0 && (
              <LegitLabel
                opinion="impossible"
                text="감정불가"
                customStyle={{
                  position: 'absolute',
                  top: 8,
                  left: 8
                }}
              />
            )}
          </>
        )}
      </Box>
      <Flexbox
        direction="vertical"
        gap={2}
        customStyle={{
          position: 'relative',
          flexGrow: 1,
          padding: '2px 0'
        }}
      >
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
          customStyle={
            customTitleStyle || {
              color: common.ui60
            }
          }
        >
          {variant === 'listA' ? productTitle : quoteTitle}
        </Typography>
        {!hidePrice && (
          <Typography
            variant="h3"
            weight="bold"
            customStyle={{
              paddingTop: 2
            }}
          >
            {`${commaNumber(getTenThousandUnitPrice(price || 0))}만원`}
          </Typography>
        )}
        {variant === 'listA' && (
          <Flexbox
            direction="vertical"
            gap={6}
            customStyle={{
              paddingTop: 6
            }}
          >
            <Description
              variant="body3"
              customStyle={{
                color: common.ui60
              }}
            >
              {description}
            </Description>
            {!hideResult && (
              <Flexbox gap={12}>
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
          </Flexbox>
        )}
        {!hideMore && (
          <MoreButton variant={variant}>
            <Icon name="MoreHorizFilled" color={common.ui80} />
          </MoreButton>
        )}
      </Flexbox>
    </Flexbox>
  );
}

export default LegitListCard;
