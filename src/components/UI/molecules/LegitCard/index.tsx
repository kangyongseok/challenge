import type { HTMLAttributes } from 'react';

import { Avatar, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';
import dayjs from 'dayjs';

import { Image, LegitLabel } from '@components/UI/atoms';

import type { ProductLegit } from '@dto/productLegit';

import { Content, ImageBox, Title } from './LegitCard.styles';

interface LegitCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'grid' | 'list';
  productLegit?: Partial<ProductLegit>;
  hideLegitLabelWithDate?: boolean;
  hidePlatformLogo?: boolean;
  customStyle?: CustomStyle;
}

function LegitCard({
  variant,
  productLegit,
  hideLegitLabelWithDate,
  hidePlatformLogo,

  customStyle,
  ...props
}: LegitCardProps) {
  const {
    result = 0,
    status = 0,
    dateCreated,
    productResult: {
      quoteTitle = '',
      title = '',
      brand: { nameEng = '' } = {},
      imageMain = '',
      imageThumbnail = '',
      site: { id: siteId = 0 } = {},
      postType = 0
    } = {}
  } = productLegit || {};

  const {
    theme: { box }
  } = useTheme();

  if (variant === 'list') {
    return (
      <Flexbox
        alignment="flex-start"
        gap={16}
        {...props}
        customStyle={{ ...customStyle, maxHeight: 56, cursor: 'pointer' }}
      >
        <ImageBox>
          <Image
            variant="backgroundImage"
            src={imageMain || imageThumbnail}
            alt="Product Legit Img"
          />
          {!hidePlatformLogo && postType !== 2 && (
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
        </ImageBox>
        <Content direction="vertical" gap={8}>
          <Flexbox direction="vertical" gap={6}>
            {!hideLegitLabelWithDate && (
              <Flexbox alignment="center" justifyContent="space-between" gap={10}>
                {result === 1 && <LegitLabel text="정품의견" />}
                {result === 2 && <LegitLabel variant="fake" text="가품의심" />}
                {!result && status === 20 && <LegitLabel variant="impossible" text="감정진행중" />}
                {result !== 1 && result !== 2 && status === 30 && (
                  <LegitLabel variant="impossible" text="감정불가" />
                )}
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
          </Flexbox>
        </Content>
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
        <LegitLabel
          text="정품의견"
          customStyle={{ position: 'absolute', top: 12, left: 12, zIndex: 1 }}
        />
      )}
      {result === 2 && (
        <LegitLabel
          variant="fake"
          text="가품의심"
          customStyle={{ position: 'absolute', top: 12, left: 12, zIndex: 1 }}
        />
      )}
      {!result && status === 20 && (
        <LegitLabel
          variant="impossible"
          text="감정진행중"
          customStyle={{ position: 'absolute', top: 12, left: 12, zIndex: 1 }}
        />
      )}
      {result !== 1 && result !== 2 && status === 30 && (
        <LegitLabel
          variant="impossible"
          text="감정불가"
          customStyle={{ position: 'absolute', top: 12, left: 12, zIndex: 1 }}
        />
      )}
      <Image variant="backgroundImage" src={imageMain || imageThumbnail} alt="Product Legit Img" />
      <Flexbox
        direction="vertical"
        gap={2}
        customStyle={{ padding: '12px 12px 20px', mixBlendMode: 'multiply' }}
      >
        <Image
          width="auto"
          height="24px"
          disableAspectRatio
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/horizon_brands/white/${nameEng
            .toLowerCase()
            .replace(/\s/g, '')}.jpg`}
        />
        <Flexbox direction="vertical">
          <Title variant="body2">{quoteTitle}</Title>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
}

export default LegitCard;