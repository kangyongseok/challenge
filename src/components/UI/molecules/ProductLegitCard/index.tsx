import type { HTMLAttributes } from 'react';

import { Avatar, Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';
import dayjs from 'dayjs';

import { Image, ProductLegitLabel } from '@components/UI/atoms';

import type { ProductLegit } from '@dto/product';

import { getTenThousandUnitPrice } from '@utils/formats';
import commaNumber from '@utils/commaNumber';

interface ProductLegitCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'grid' | 'list';
  productLegit?: Partial<ProductLegit>;
  hideProductLegitLabelWithDate?: boolean;
  hidePlatformLogo?: boolean;
  hidePlatformLogoWithPrice?: boolean;
  customStyle?: CustomStyle;
}

function ProductLegitCard({
  variant,
  productLegit,
  hideProductLegitLabelWithDate,
  hidePlatformLogo,
  hidePlatformLogoWithPrice,
  customStyle,
  ...props
}: ProductLegitCardProps) {
  const {
    result = 0,
    dateCreated,
    productResult: {
      title = '',
      price = 0,
      brand: { nameEng = '' } = {},
      imageMain = '',
      imageThumbnail = '',
      site: { id: siteId = 0 } = {}
    } = {}
  } = productLegit || {};

  const {
    theme: {
      palette: { common },
      box
    }
  } = useTheme();

  if (variant === 'list') {
    return (
      <Flexbox
        alignment="flex-start"
        gap={16}
        {...props}
        customStyle={{ ...customStyle, cursor: 'pointer' }}
      >
        <Box
          customStyle={{
            position: 'relative',
            minWidth: 56,
            maxWidth: 56,
            borderRadius: box.round['4'],
            overflow: 'hidden'
          }}
        >
          <Image
            variant="backgroundImage"
            src={imageMain || imageThumbnail}
            alt="Product Legit Img"
          />
          {!hidePlatformLogo && (
            <Avatar
              width={15}
              height={15}
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${siteId}.png`}
              alt="Platform Logo Img"
              customStyle={{
                position: 'absolute',
                top: 2,
                left: 2,
                boxShadow: box.shadow.platformLogo
              }}
            />
          )}
        </Box>
        <Flexbox
          direction="vertical"
          gap={8}
          customStyle={{
            flexGrow: 1,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden'
          }}
        >
          <Flexbox direction="vertical" gap={6}>
            {!hideProductLegitLabelWithDate && (
              <Flexbox alignment="center" justifyContent="space-between" gap={10}>
                <ProductLegitLabel text="정품의견" />
                <Typography className="legit-alert-date" variant="small2">
                  {dayjs(dateCreated).fromNow()}
                </Typography>
              </Flexbox>
            )}
            <Typography
              customStyle={{
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden'
              }}
            >
              {title}
            </Typography>
            {!hidePlatformLogoWithPrice && (
              <Flexbox alignment="center" gap={8}>
                <Avatar
                  width={20}
                  height={20}
                  src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${siteId}.png`}
                  alt="Platform Logo Img"
                />
                <Typography variant="body2" weight="bold">
                  {commaNumber(getTenThousandUnitPrice(price))}만원
                </Typography>
              </Flexbox>
            )}
          </Flexbox>
        </Flexbox>
      </Flexbox>
    );
  }

  return (
    <Flexbox
      direction="vertical"
      {...props}
      customStyle={{ ...customStyle, position: 'relative', cursor: 'pointer' }}
    >
      {result === 1 && (
        <ProductLegitLabel
          text="정품의견"
          customStyle={{ position: 'absolute', top: 12, left: 12 }}
        />
      )}
      {result === 2 && (
        <ProductLegitLabel
          variant="fake"
          text="가품의심"
          customStyle={{ position: 'absolute', top: 12, left: 12 }}
        />
      )}
      {result !== 1 && result !== 2 && (
        <ProductLegitLabel
          variant="impossible"
          text="감정불가"
          customStyle={{ position: 'absolute', top: 12, left: 12 }}
        />
      )}
      <Image variant="backgroundImage" src={imageMain || imageThumbnail} alt="Product Legit Img" />
      <Flexbox direction="vertical" gap={8} customStyle={{ padding: '16px 16px 20px' }}>
        <Typography variant="small2" weight="bold" customStyle={{ color: common.grey['60'] }}>
          {nameEng.toUpperCase()}
        </Typography>
        <Flexbox
          direction="vertical"
          customStyle={{
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden'
          }}
        >
          <Typography
            variant="small2"
            customStyle={{
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden'
            }}
          >
            {title}
          </Typography>
          <Typography variant="body2" weight="bold">
            {commaNumber(getTenThousandUnitPrice(price))}만원
          </Typography>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
}

export default ProductLegitCard;
