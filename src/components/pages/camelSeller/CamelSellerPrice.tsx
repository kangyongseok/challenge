import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { Box, Button, Flexbox, Tooltip, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import styled from '@emotion/styled';

import { TextInput } from '@components/UI/molecules';
import { Image } from '@components/UI/atoms';

import { SearchParams } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchSearchHistory } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { CAMEL_SELLER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber } from '@utils/common';

import type { CamelSellerLocalStorage, SubmitType } from '@typings/camelSeller';
import {
  camelSellerBooleanStateFamily,
  camelSellerDialogStateFamily,
  camelSellerEditState,
  camelSellerSubmitState,
  recentPriceCardTabNumState,
  setModifyProductPriceState
} from '@recoil/camelSeller';

function CamelSellerPrice() {
  const {
    theme: {
      palette: { primary, secondary, common },
      zIndex
    }
  } = useTheme();
  const [changePrice, setChangePrice] = useState<number | null>(null);
  const [isFocus, setIsFocus] = useState(false);
  const openRecnetPriceBottomSheet = useSetRecoilState(camelSellerDialogStateFamily('recentPrice'));
  const editMode = useRecoilValue(camelSellerBooleanStateFamily('edit'));
  const setRecentPriceCardNum = useSetRecoilState(recentPriceCardTabNumState);
  const [submitData, setSubmitData] = useRecoilState(camelSellerSubmitState);
  const modifyProductPrice = useRecoilValue(setModifyProductPriceState);
  const [editData, setEditData] = useRecoilState(camelSellerEditState);
  const { isState } = useRecoilValue(camelSellerBooleanStateFamily('submitClick'));
  const [openTooltip, setOpenTooltip] = useState(true);
  const [camelSeller, setCamelSeller] = useState<CamelSellerLocalStorage>();
  const [fetchData, setFetchData] = useState<SearchParams>({});
  const { data: searchHistory } = useQuery(
    queryKeys.products.searchHistoryTopFive(fetchData),
    () => fetchSearchHistory(fetchData),
    {
      enabled: !!fetchData?.keyword
    }
  );

  useEffect(() => {
    if (camelSeller) {
      setFetchData({
        brandIds: camelSeller.brand ? [camelSeller.brand.id] : [],
        categoryIds: camelSeller.category ? [camelSeller.category.id] : [],
        keyword: camelSeller.keyword,
        conditionIds: camelSeller.condition ? [camelSeller.condition?.id] : [],
        colorIds: camelSeller.color ? [camelSeller.color.id] : [],
        sizeIds: camelSeller.size ? [camelSeller.size.id] : [],
        order: 'postedAllDesc'
      });
    }
  }, [camelSeller, editData]);

  useEffect(() => {
    const localData = editData || (LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage);
    setCamelSeller(localData);
    setChangePrice(localData?.price as number);
    controlTooltip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData]);

  useEffect(() => {
    if (modifyProductPrice) {
      setChangePrice(modifyProductPrice);
    }
  }, [modifyProductPrice]);

  const controlTooltip = () => {
    const hideTooltip = SessionStorage.get(sessionStorageKeys.hideCamelSellerRecentPriceTooltip);
    if (hideTooltip) {
      setOpenTooltip(!hideTooltip);
    }
    window.addEventListener('click', () => {
      if (openTooltip && !hideTooltip) {
        setOpenTooltip(false);
        SessionStorage.set(sessionStorageKeys.hideCamelSellerRecentPriceTooltip, true);
      }
    });
  };

  const handleChangePrice = (e: ChangeEvent<HTMLInputElement>) => {
    const inputPrice = e.target.value.replace(/[^0-9]*/g, '');
    if (String(inputPrice).length <= 10) {
      if (Number(inputPrice) === 0) {
        setChangePrice(null);
        if (editMode.isState) {
          setEditData({
            ...(editData as CamelSellerLocalStorage),
            price: 0
          });
        } else {
          LocalStorage.set(CAMEL_SELLER, {
            ...(LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage),
            price: 0
          });
        }
      } else {
        setChangePrice(Number(inputPrice));
        setSubmitData({
          ...(submitData as SubmitType),
          price: Number(inputPrice)
        });
        if (editMode.isState) {
          setEditData({
            ...(editData as CamelSellerLocalStorage),
            price: Number(inputPrice)
          });
        } else {
          LocalStorage.set(CAMEL_SELLER, {
            ...(LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage),
            price: Number(inputPrice)
          });
        }
      }
    }
  };

  const handleFocus = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_EDIT, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.PRICE
    });

    setIsFocus(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocus(false);
    }, 1000);
  };

  return (
    <>
      <Flexbox justifyContent="space-between" customStyle={{ margin: '8px 0' }} alignment="center">
        <WonIcon color={isState && !changePrice ? secondary.red.light : common.ui20} />
        <MoneyInput
          placeholder="0"
          customStyle={{
            padding: 0,
            height: 'auto',
            marginLeft: 10
          }}
          isPrice={!!changePrice}
          inputMode="numeric"
          onChange={handleChangePrice}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={changePrice ? commaNumber(changePrice as number) : ''}
          min={1000}
        />
        {changePrice && changePrice > 0 && (
          <Typography customStyle={{ color: common.ui60, minWidth: 'fit-content' }}>
            {commaNumber(getTenThousandUnitPrice(changePrice as number))} 만원
          </Typography>
        )}
      </Flexbox>
      {searchHistory?.searchOptions?.avgPrice && (
        <>
          <Typography
            weight="medium"
            customStyle={{ display: 'inline-block', color: primary.light }}
            variant="small1"
          >
            {commaNumber(
              getTenThousandUnitPrice((searchHistory?.searchOptions?.avgPrice as number) || 0)
            )}
            만원
          </Typography>
          <Typography
            variant="small1"
            customStyle={{
              display: 'inline-block',
              paddingLeft: 3,
              color: common.ui60
            }}
          >
            정도에 거래되고 있는 모델이에요
          </Typography>
        </>
      )}
      {isFocus && (
        <PriceCardList alignment="center" gap={8}>
          {searchHistory?.page?.content.slice(0, 5).map((product, i) => (
            <PriceCard
              key={`recent-product-${product.id}`}
              onClick={() => {
                logEvent(attrKeys.camelSeller.CLICK_MARKET_PRICE, {
                  name: attrProperty.name.PRODUCT_MAIN,
                  title: attrProperty.title.SAMPLE,
                  index: i + 1
                });
                openRecnetPriceBottomSheet(({ type }) => ({ type, open: true }));
                setRecentPriceCardNum({ id: product.id, index: i });
              }}
            >
              <Typography weight="medium">
                {commaNumber(getTenThousandUnitPrice(product.price))}만원
              </Typography>
              <Flexbox alignment="center" gap={4}>
                <Image
                  disableAspectRatio
                  src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${product.siteUrl.id}.png`}
                  width={15}
                />
                <Typography variant="small1" customStyle={{ color: common.ui60 }}>
                  {dayjs(new Date(product.dateUpdated)).format('MM.DD')} 거래완료
                </Typography>
              </Flexbox>
            </PriceCard>
          ))}
        </PriceCardList>
      )}
      <Box>
        <Button
          variant="contained"
          onClick={() => {
            logEvent(attrKeys.camelSeller.CLICK_MARKET_PRICE, {
              name: attrProperty.name.PRODUCT_MAIN,
              title: attrProperty.title.MORE
            });

            setRecentPriceCardNum(null);
            openRecnetPriceBottomSheet(({ type }) => ({ type, open: true }));
          }}
          customStyle={{
            marginTop: 12,
            background: primary.highlight,
            color: primary.light
          }}
        >
          최근 실거래가 보기
        </Button>
        <RecentPriceTooltip
          open={openTooltip}
          placement="bottom"
          message="다른 사람들이 판매했던 가격을 확인할 수 있어요!"
          triangleLeft={20}
          customStyle={{ zIndex: zIndex.button - 1 }}
        />
      </Box>
    </>
  );
}

const MoneyInput = styled(TextInput)<{ isPrice: boolean }>`
  font-size: ${({ theme }) => theme.typography.h3.size};
  font-weight: ${({ theme }) => theme.typography.h2.weight.medium};
  width: 100%;
  border-radius: 0;
  caret-color: ${({ theme: { palette } }) => palette.primary.main};
  color: ${({
    isPrice,
    theme: {
      palette: { common }
    }
  }) => (isPrice ? common.ui20 : common.ui90)};
  &::placeholder {
    color: ${({
      theme: {
        palette: { common }
      }
    }) => common.ui90};
  }
`;

const PriceCardList = styled(Flexbox)`
  position: relative;
  width: calc(100% + 40px);
  margin-left: -20px;
  margin-top: 12px;
  padding: 0 20px;
  flex-wrap: nowrap;
  overflow: auto;
`;

const PriceCard = styled.div`
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui95};
  padding: 8px 12px;
  border-radius: 8px;
  min-width: 120px;
  height: 56px;
`;

const RecentPriceTooltip = styled(Tooltip)`
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui20};
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  margin-left: 131px;
  font-size: ${({ theme: { typography } }) => typography.small1.size};
  bottom: 5px;
`;

function WonIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.04 5H18.96L17.2457 11H14.7543L13.04 5L10.96 5.00001L9.24568 11H6.75428L5.03999 5H2.95996L4.67425 11H2V13H5.24568L6.95996 19H9.04L10.7543 13H13.2457L14.96 19H17.04L18.7543 13H22V11H19.3257L21.04 5ZM16.6743 13H15.3257L16 15.36L16.6743 13ZM12.6742 11L12 8.64007L11.3257 11H12.6742ZM8.67425 13H7.32571L7.99998 15.36L8.67425 13Z"
        fill={color}
      />
    </svg>
  );
}

export default CamelSellerPrice;
