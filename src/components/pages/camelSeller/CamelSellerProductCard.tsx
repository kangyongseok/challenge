import { useEffect, useRef, useState } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { Avatar, Box, Button, Flexbox, Icon, Image, Label, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';

import { ImageDetailDialog } from '@components/UI/organisms';

import type { Product } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { productSellerType } from '@constants/user';
import { IMG_CAMEL_PLATFORM_NUMBER } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber } from '@utils/common';

import {
  camelSellerDialogStateFamily,
  camelSellerModifiedPriceState,
  camelSellerTempSaveDataState
} from '@recoil/camelSeller';

function CamelSellerProductCard({ data }: { data: Product }) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [tempData, setTempData] = useRecoilState(camelSellerTempSaveDataState);
  const setCamelSellerModifiedPriceState = useSetRecoilState(camelSellerModifiedPriceState);
  const setOpenRecentPriceBottomSheet = useSetRecoilState(
    camelSellerDialogStateFamily('recentPrice')
  );

  const [images, setImages] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const bodyOverflowHiddenTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const isNormalSeller = data?.sellerType === productSellerType.normal;

  const handleClick = () => {
    logEvent(attrKeys.camelSeller.CLICK_MARKET_PRICE, {
      name: attrProperty.name.MARKET_PRICE,
      title: attrProperty.title.LIST,
      att: data.price,
      data
    });

    setTempData({
      ...tempData,
      price: data.price
    });
    setCamelSellerModifiedPriceState(data.price);
    setOpenRecentPriceBottomSheet(({ type }) => ({ type, open: false }));
  };

  const handleClickImage = () => {
    logEvent(attrKeys.camelSeller.CLICK_PIC, {
      name: attrProperty.name.MARKET_PRICE,
      title: attrProperty.title.GALLERY
    });

    if (!images.length) return;

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);

    if (bodyOverflowHiddenTimerRef.current) {
      clearTimeout(bodyOverflowHiddenTimerRef.current);
    }

    bodyOverflowHiddenTimerRef.current = setTimeout(() => {
      document.body.style.overflow = 'hidden';
    }, 400);
  };

  useEffect(() => {
    const newImages = (data.imageDetails || '').split('|');

    newImages.push(data.imageMain || data.imageThumbnail);

    setImages(newImages.filter((newImage) => newImage));
  }, [data]);

  useEffect(() => {
    return () => {
      if (bodyOverflowHiddenTimerRef.current) {
        clearTimeout(bodyOverflowHiddenTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <Flexbox className={`recent-product-${data.id}`} gap={16}>
        <Box
          onClick={handleClickImage}
          customStyle={{
            position: 'relative',
            minWidth: 100,
            borderRadius: 8
          }}
        >
          <Image
            ratio="5:6"
            src={data.imageMain || data.imageThumbnail}
            alt={data.title}
            round={8}
          />
          {images.length > 0 && (
            <Label
              variant="solid"
              brandColor="black"
              startIcon={<Icon name="ImageFilled" width={12} height={12} />}
              size="xsmall"
              text={String(images.length)}
              customStyle={{
                position: 'absolute',
                top: 8,
                left: 8
              }}
            />
          )}
        </Box>
        <Box>
          <Flexbox alignment="baseline" gap={4}>
            <Typography variant="h3" weight="bold">
              {commaNumber(getTenThousandUnitPrice(data.price))}만원
            </Typography>
            <Typography
              variant="body2"
              customStyle={{
                color: common.ui60
              }}
            >
              거래완료까지{' '}
              {dayjs(data.dateUpdated).diff(data.datePosted, 'days') <= 1
                ? 1
                : dayjs(data.dateUpdated).diff(data.datePosted, 'days')}
              일
            </Typography>
          </Flexbox>
          <Flexbox
            gap={2}
            customStyle={{
              marginTop: 8
            }}
          >
            <Avatar
              width={12}
              height={12}
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${
                isNormalSeller ? IMG_CAMEL_PLATFORM_NUMBER : data.site.id
              }.png`}
              alt="플랫폼 이미지"
            />
            <Typography
              variant="small2"
              customStyle={{
                color: common.ui60
              }}
            >
              {dayjs(data.dateUpdated).format('MM월 DD일')} 거래완료
            </Typography>
          </Flexbox>
          <Button
            variant="ghost"
            brandColor="black"
            onClick={handleClick}
            customStyle={{
              marginTop: 12
            }}
          >
            이 가격으로 판매
          </Button>
        </Box>
      </Flexbox>
      <ImageDetailDialog open={open} onClose={handleClose} images={images} />
    </>
  );
}

export default CamelSellerProductCard;
