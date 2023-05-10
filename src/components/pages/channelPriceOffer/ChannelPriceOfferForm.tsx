import { ChangeEvent, useEffect, useRef, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Chip,
  Flexbox,
  Icon,
  Input,
  Toast,
  Typography,
  useTheme
} from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import { postProductOffer } from '@api/productOffer';
import { fetchChannel } from '@api/channel';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/formats';
import { checkAgent } from '@utils/common';

import { prevChannelAlarmPopup } from '@recoil/common';
import useOsAlarm from '@hooks/useOsAlarm';

function ChannelPriceOfferForm() {
  const router = useRouter();
  const { id, from } = router.query;

  const {
    theme: {
      palette: { secondary, common }
    }
  } = useTheme();

  const [discountRate, setDiscountRate] = useState(0);
  const [maximumDiscountPrice, setMaximumDiscountPrice] = useState(0);
  const [maximumOfferPossiblePrice, setMaximumOfferPossiblePrice] = useState(0);
  const [value, setValue] = useState<string | number>('');
  const [showHelperText, setShowHelperText] = useState(false);
  const [open, setOpen] = useState(false);
  const setOsAlarm = useOsAlarm();
  const prevChannelAlarm = useRecoilValue(prevChannelAlarmPopup);

  const { data: { product } = {}, isLoading } = useQuery(
    queryKeys.channels.channel(Number(id)),
    () => fetchChannel(Number(id)),
    {
      enabled: !!id
    }
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const inputSelectionEndRef = useRef(String(product?.price || '').length);

  const { mutate, isLoading: isLoadingMutate } = useMutation(postProductOffer);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.currentTarget.value.replace(/,/g, '').replace(/\D/g, ''));

    if (newValue > (product?.price || 0)) {
      setValue(product?.price || 0);
      return;
    }

    inputSelectionEndRef.current = e.currentTarget.selectionEnd || 0;

    setValue(newValue);
  };

  const handleClickChip = (discountPrice: number) => () => {
    const newValue = Number(value || 0) - discountPrice;

    if (newValue < maximumOfferPossiblePrice) {
      setValue(maximumOfferPossiblePrice);
      setOpen(true);
      return;
    }

    setValue(newValue);
  };

  const handleClickReset = () => {
    if (!product || isLoadingMutate) return;

    setValue(Number(product?.price));
  };

  const handleClick = () => {
    if (!product) return;

    setOsAlarm();
    if (prevChannelAlarm && checkAgent.isIOSApp()) return;

    logEvent(attrKeys.channel.SUBMIT_PRODUCT_OFFER, {
      name: attrProperty.name.PRODUCT_OFFER,
      offeredPrice: Number(value),
      data: {
        ...product
      }
    });

    mutate(
      {
        productId: product?.id,
        channelId: Number(id),
        price: Number(value)
      },
      {
        onSuccess() {
          if (from === 'productDetail') {
            router.replace(`/channels/${id}`);
          } else {
            router.back();
          }
        }
      }
    );
  };

  useEffect(() => {
    if (!product) return;

    if (product?.price >= 500000) {
      setDiscountRate(0.2);
    } else if (product?.price >= 300000) {
      setDiscountRate(0.25);
    } else if (product?.price >= 200000) {
      setDiscountRate(0.3);
    } else if (product?.price >= 100000) {
      setDiscountRate(0.35);
    } else if (product?.price >= 50000) {
      setDiscountRate(0.4);
    } else if (product?.price >= 30000) {
      setDiscountRate(0.45);
    }
  }, [product]);

  useEffect(() => {
    if (!product || !discountRate) return;

    setMaximumDiscountPrice((product?.price || 0) * discountRate);
  }, [product, discountRate]);

  useEffect(() => {
    if (!product || !maximumDiscountPrice) return;
    setMaximumOfferPossiblePrice((product?.price || 0) - maximumDiscountPrice);
  }, [product, maximumDiscountPrice]);

  useEffect(() => {
    if (!maximumOfferPossiblePrice) return;

    setShowHelperText(!!value && value < maximumOfferPossiblePrice);
  }, [value, maximumOfferPossiblePrice]);

  useEffect(() => {
    if (!product) return;

    setValue(Number(product?.price));
  }, [product]);

  useEffect(() => {
    if (inputRef.current) {
      const inputElement = inputRef.current.getElementsByTagName('input');

      if (inputElement[0]) {
        inputElement[0].setSelectionRange(
          inputSelectionEndRef.current || String(commaNumber(value)).length,
          inputSelectionEndRef.current || String(commaNumber(value)).length
        );
      }
    }
  }, [value]);

  return (
    <>
      <Flexbox
        component="section"
        direction="vertical"
        customStyle={{
          flex: 1,
          padding: '32px 20px 0'
        }}
      >
        <Typography
          weight="medium"
          customStyle={{
            color: common.ui60
          }}
        >
          제안가격
        </Typography>
        <Input
          ref={inputRef}
          pattern="[0-9,]*"
          inputMode="numeric"
          size="xlarge"
          fullWidth
          startAdornment={<Icon name="WonFilled" />}
          onChange={handleChange}
          value={commaNumber(value)}
          disabled={isLoading || isLoadingMutate}
          customStyle={{
            marginTop: 8
          }}
        />
        {showHelperText && (
          <Typography
            variant="body2"
            customStyle={{
              marginTop: 8,
              color: secondary.red.light
            }}
          >
            너무 낮은 금액으로는 제안할 수 없어요.
          </Typography>
        )}
        <Flexbox
          alignment="center"
          justifyContent="space-between"
          customStyle={{
            marginTop: 20
          }}
        >
          <Flexbox gap={8}>
            <Chip
              variant="ghost"
              brandColor="black"
              isRound={false}
              onClick={handleClickChip(1000)}
              disabled={!value || showHelperText || isLoading || isLoadingMutate}
            >
              -1,000원
            </Chip>
            <Chip
              variant="ghost"
              brandColor="black"
              isRound={false}
              onClick={handleClickChip(5000)}
              disabled={!value || showHelperText || isLoading || isLoadingMutate}
            >
              -5,000원
            </Chip>
            {(product?.price || 0) > 100000 && (
              <Chip
                variant="ghost"
                brandColor="black"
                isRound={false}
                onClick={handleClickChip(10000)}
                disabled={!value || showHelperText || isLoading || isLoadingMutate}
              >
                -10,000원
              </Chip>
            )}
          </Flexbox>
          {value !== product?.price && (
            <Icon name="RotateOutlined" color={common.ui60} onClick={handleClickReset} />
          )}
        </Flexbox>
      </Flexbox>
      <Box
        component="section"
        customStyle={{
          padding: 20
        }}
      >
        <Button
          variant="solid"
          brandColor="black"
          size="xlarge"
          fullWidth
          onClick={handleClick}
          disabled={
            !value || value === product?.price || showHelperText || isLoading || isLoadingMutate
          }
        >
          제안하기
        </Button>
      </Box>
      <Toast open={open} onClose={() => setOpen(false)}>
        너무 낮은 금액으로는 제안할 수 없어요.
      </Toast>
    </>
  );
}

export default ChannelPriceOfferForm;
