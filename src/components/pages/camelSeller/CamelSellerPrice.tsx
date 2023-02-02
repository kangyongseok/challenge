import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  CheckboxGroup,
  Chip,
  Flexbox,
  Icon,
  Input,
  Typography,
  useTheme
} from 'mrcamel-ui';
import dayjs from 'dayjs';
import styled from '@emotion/styled';

import type { Product, RecentSearchParams } from '@dto/product';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber, getTenThousandUnitPrice } from '@utils/formats';
import { checkAgent } from '@utils/common';

import {
  camelSellerDialogStateFamily,
  camelSellerIsMovedScrollState,
  camelSellerModifiedPriceState,
  camelSellerPriceInputFocusState,
  camelSellerRecentPriceCardTabNumState,
  camelSellerTempSaveDataState
} from '@recoil/camelSeller';
import useQuerySearchHistory from '@hooks/useQuerySearchHistory';
import useDebounce from '@hooks/useDebounce';

function CamelSellerPrice() {
  const { query } = useRouter();

  const {
    theme: {
      palette: { common, primary }
    }
  } = useTheme();
  const focusTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const setOpenRecentPriceBottomSheet = useSetRecoilState(
    camelSellerDialogStateFamily('recentPrice')
  );
  const [tempData, setTempData] = useRecoilState(camelSellerTempSaveDataState);
  const setRecentPriceCardNum = useSetRecoilState(camelSellerRecentPriceCardTabNumState);
  const [modifiedPrice, setCamelSellerModifiedPriceState] = useRecoilState(
    camelSellerModifiedPriceState
  );
  const [isFocus, setIsFocus] = useRecoilState(camelSellerPriceInputFocusState);
  const [isMovedScroll, setIsMovedScroll] = useRecoilState(camelSellerIsMovedScrollState);
  const [isMounted, setIsMounted] = useState(false);
  const [changePrice, setChangePrice] = useState<number | string>(tempData.price);
  const [fetchData, setFetchData] = useState<RecentSearchParams>({});
  const [deliveryPrice, setDeliveryPrice] = useState(tempData.useDeliveryPrice);
  const { keywordQuery: { content = [], avgPrice = 0, isLine = '', isFetched } = {} } =
    useQuerySearchHistory({
      fetchData,
      type: 'keyword'
    });

  const inputRef = useRef<HTMLInputElement>(null);
  const inputScrollTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const inputFocusTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const inputContentFocusTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const debouncedValue = useDebounce(changePrice, 300);

  const handleClickRealTime = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_EDIT, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.MARKET_PRICE
    });

    setRecentPriceCardNum(null);
    setOpenRecentPriceBottomSheet(({ type }) => ({ type, open: true }));
  };

  const handleChangePrice = (e: ChangeEvent<HTMLInputElement>) => {
    const inputPrice = e.target.value.replace(/[^0-9]*/g, '');
    if (String(inputPrice).length > 10) return;
    setChangePrice(Number(inputPrice) || '');
  };

  const handleFocus = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_EDIT, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.PRICE
    });

    if (focusTimerRef.current) {
      clearTimeout(focusTimerRef.current);
    }

    setIsFocus(true);
  };

  const handleBlur = () => {
    focusTimerRef.current = setTimeout(() => {
      setIsFocus(false);
    }, 1000);
  };

  const handleClickPriceCard = (product: Product, index: number) => () => {
    logEvent(attrKeys.camelSeller.CLICK_MARKET_PRICE, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.RECOMM_PRICE,
      data: product,
      index: index + 1
    });

    setRecentPriceCardNum({
      id: product.id,
      index
    });
    setOpenRecentPriceBottomSheet(({ type }) => ({ type, open: true }));
  };

  const handleChangeDeliveryPrice = () => {
    setDeliveryPrice((prevState) => !prevState);
    setTempData((prevState) => ({
      ...prevState,
      useDeliveryPrice: !prevState.useDeliveryPrice
    }));
  };

  useEffect(() => {
    let newKeyword = tempData.title;
    if (!newKeyword && tempData.brand.name && tempData.category.name) {
      newKeyword = `${tempData.brand.name} ${tempData.category.name}`;
    }

    setFetchData({
      brandIds: tempData.brandIds,
      categoryIds: tempData.category.id ? [tempData.category.id] : [],
      keyword: newKeyword,
      conditionIds: tempData.condition.id ? [tempData.condition.id] : [],
      categorySizeIds: tempData.categorySizeIds,
      order: 'postedAllDesc' // updatedDesc
    });
  }, [
    tempData.brandIds,
    tempData.category.id,
    tempData.condition.id,
    tempData.brand.name,
    tempData.category.parentCategoryName,
    tempData.category.name,
    tempData.categorySizeIds,
    tempData.title
  ]);

  useEffect(() => {
    setChangePrice(tempData.price);
  }, [tempData.price]);

  useEffect(() => {
    setTempData((prevState) => ({
      ...prevState,
      price: Number(debouncedValue)
    }));
  }, [setTempData, debouncedValue]);

  useEffect(() => {
    setDeliveryPrice(tempData.useDeliveryPrice);
  }, [tempData.useDeliveryPrice]);

  useEffect(() => {
    if (modifiedPrice) {
      setChangePrice(modifiedPrice);
      setCamelSellerModifiedPriceState(0);
    }
  }, [modifiedPrice, setCamelSellerModifiedPriceState]);

  useEffect(() => {
    if (
      query.id &&
      query.anchor === 'price' &&
      tempData.price &&
      isMounted &&
      !isMovedScroll &&
      inputRef.current
    ) {
      inputScrollTimerRef.current = setTimeout(() => {
        if (!inputRef.current) return;

        setIsMovedScroll(true);

        const { offsetTop } = inputRef.current;
        window.scrollTo({
          top: offsetTop - 200,
          behavior: 'smooth'
        });

        inputFocusTimerRef.current = setTimeout(() => {
          if (!inputRef.current) return;

          const baseInputs = inputRef.current.getElementsByTagName('input');

          Array.from(baseInputs).forEach((baseInput) => {
            baseInput.focus();
          });
        }, 500);
      }, 500);
    }
  }, [query.id, query.anchor, tempData.price, isMounted, setIsMovedScroll, isMovedScroll]);

  useEffect(() => {
    if (checkAgent.isMobileApp() && isFocus && isFetched && content.length) {
      if (inputContentFocusTimerRef.current) {
        clearTimeout(inputContentFocusTimerRef.current);
      }

      inputContentFocusTimerRef.current = setTimeout(() => {
        if (inputRef.current)
          window.scrollTo({
            top: inputRef.current.offsetTop / 2,
            behavior: 'smooth'
          });
      }, 200);
    }
  }, [isFocus, isFetched, content]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (inputScrollTimerRef.current) {
        clearTimeout(inputScrollTimerRef.current);
      }
      if (inputFocusTimerRef.current) {
        clearTimeout(inputFocusTimerRef.current);
      }
      if (inputContentFocusTimerRef.current) {
        clearTimeout(inputContentFocusTimerRef.current);
      }
    };
  }, []);

  return (
    <Flexbox
      direction="vertical"
      customStyle={{
        padding: '8px 0',
        borderBottom: `1px solid ${common.line01}`
      }}
    >
      <Flexbox alignment="center" justifyContent="space-between">
        <Input
          ref={inputRef}
          inputMode="numeric"
          pattern="[0-9]*"
          variant="inline"
          size="large"
          placeholder="판매가격"
          value={changePrice ? commaNumber(changePrice as number) : ''}
          onChange={handleChangePrice}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onClick={() =>
            logEvent(attrKeys.camelSeller.CLICK_PRODUCT_EDIT, {
              name: attrProperty.name.PRODUCT_MAIN,
              title: attrProperty.title.PRICE,
              att: changePrice
            })
          }
          startAdornment={<Icon name="WonFilled" width={20} height={20} />}
          fullWidth
          customStyle={{
            paddingLeft: 0,
            paddingRight: 0
          }}
        />
        <CheckboxGroup
          text="배송비 포함"
          onChange={handleChangeDeliveryPrice}
          checked={deliveryPrice}
        />
      </Flexbox>
      <Box
        customStyle={{
          paddingLeft: 32
        }}
      >
        {content.length > 0 && avgPrice > 0 && !isLine && (
          <Typography
            variant="body2"
            customStyle={{
              '& > b': {
                fontWeight: 500,
                color: primary.light
              }
            }}
          >
            {tempData.brand.name} {tempData.category.name}&nbsp;
            <b>
              {commaNumber(getTenThousandUnitPrice(avgPrice))}
              만원
            </b>
            정도에 거래되고 있어요!
          </Typography>
        )}
        {content.length > 0 && avgPrice > 0 && isLine && (
          <Typography
            variant="body2"
            customStyle={{
              '& > b': {
                fontWeight: 500,
                color: primary.light
              }
            }}
          >
            이 모델은{' '}
            <b>
              {commaNumber(getTenThousandUnitPrice(avgPrice))}
              만원
            </b>
            정도에 거래되고 있어요!
          </Typography>
        )}
        {isFocus && content.length > 0 && (
          <List>
            {content.slice(0, 5).map((product, index) => (
              <Chip
                key={`camel-seller-price-chip-${product.id}`}
                isRound={false}
                onClick={handleClickPriceCard(product, index)}
                customStyle={{
                  height: 54,
                  padding: '8px 10px'
                }}
              >
                <Flexbox direction="vertical" alignment="flex-start">
                  <Typography variant="h4">
                    {getTenThousandUnitPrice(product.price || 0)}만원
                  </Typography>
                  <Typography
                    variant="body2"
                    customStyle={{
                      marginTop: 4,
                      color: common.ui60
                    }}
                  >
                    거래완료까지{' '}
                    {dayjs(product.dateUpdated).diff(product.datePosted, 'days') <= 1
                      ? 1
                      : dayjs(product.dateUpdated).diff(product.datePosted, 'days')}
                    일
                  </Typography>
                </Flexbox>
              </Chip>
            ))}
          </List>
        )}
        {content.length > 0 && (
          <Button
            variant="ghost"
            brandColor="black"
            size="large"
            onClick={handleClickRealTime}
            customStyle={{
              margin: '12px 0'
            }}
          >
            최근 실거래가 보기
          </Button>
        )}
      </Box>
    </Flexbox>
  );
}

const List = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  column-gap: 8px;
  margin: 12px -20px 0 -52px;
  padding: 0 20px 0 52px;
  overflow-x: auto;
`;

export default CamelSellerPrice;
