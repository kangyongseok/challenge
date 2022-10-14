import { useEffect, useState } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Box, Button, Flexbox, Label, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import styled from '@emotion/styled';

import type { Product } from '@dto/product';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

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
  setModifyProductPriceState
} from '@recoil/camelSeller';

function CamelSellerProductCardDetail({ data }: { data: Product }) {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();
  const [camelSeller, setCamelSeller] = useState<CamelSellerLocalStorage>();
  const openRecnetPriceBottomSheet = useSetRecoilState(camelSellerDialogStateFamily('recentPrice'));
  const editMode = useRecoilValue(camelSellerBooleanStateFamily('edit'));
  const [editData, setEditData] = useRecoilState(camelSellerEditState);
  const setModifyProductPrice = useSetRecoilState(setModifyProductPriceState);
  const [submitState, setSubmitState] = useRecoilState(camelSellerSubmitState);

  useEffect(() => {
    setCamelSeller(editData || (LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClickSellPrice = () => {
    logEvent(attrKeys.camelSeller.CLICK_MARKET_PRODUCT, {
      name: attrProperty.name.MARKET_PRICE,
      title: attrProperty.title.THIS_PRICE
    });
    if (editMode.isState) {
      setEditData({
        ...(editData as CamelSellerLocalStorage),
        price: data.price
      });
    } else {
      LocalStorage.set(CAMEL_SELLER, {
        ...camelSeller,
        price: data.price
      });
    }
    setModifyProductPrice(data.price);
    setSubmitState({
      ...(submitState as SubmitType),
      price: data.price
    });
    openRecnetPriceBottomSheet(({ type }) => ({ type, open: false }));
  };

  return (
    <StyledCardDetailWrap>
      <Flexbox alignment="center" gap={12} customStyle={{ overflowX: 'auto', padding: '0 20px' }}>
        <DetailImageWrap key={`image-detail-${data.imageMain.split('/')[5]}`}>
          <DetailImage src={data.imageMain} alt={data.imageMain.split('/')[5]} />
        </DetailImageWrap>
        {data.imageDetails.split('|').map((url) => (
          <DetailImageWrap key={`image-detail-${url.split('/')[5]}`}>
            <DetailImage src={url} alt={url.split('/')[5]} />
          </DetailImageWrap>
        ))}
      </Flexbox>
      <Box customStyle={{ padding: '0 20px', marginTop: 12 }}>
        <Box>
          <Typography>{data.title}</Typography>
          <Typography variant="small1" customStyle={{ color: common.ui60 }}>
            {data.quoteTitle}
          </Typography>
        </Box>
        <Flexbox customStyle={{ marginTop: 8 }} alignment="center" justifyContent="space-between">
          <Box>
            <Flexbox alignment="center" gap={8}>
              <Typography weight="bold" variant="h3">
                {commaNumber(getTenThousandUnitPrice(data.price))}만원
              </Typography>
              {data.labels[0] && (
                <Label
                  size="xsmall"
                  variant="contained"
                  text={data.labels.filter((label) => label.codeId === 14)[0].name}
                  customStyle={{
                    background: primary.highlight,
                    color: primary.main
                  }}
                />
              )}
            </Flexbox>
            <Flexbox alignment="center" customStyle={{ marginTop: 4 }}>
              {data.siteUrl.id && (
                <Img
                  src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${data.siteUrl.id}.png`}
                  width="20px"
                  alt={data.siteUrl.name}
                />
              )}
              <Typography
                variant="small2"
                weight="bold"
                customStyle={{ color: common.ui60, marginLeft: 4 }}
              >
                {dayjs(new Date(data.dateUpdated)).format('MM월 DD일')} 거래완료
              </Typography>
            </Flexbox>
          </Box>
          <Button variant="contained" onClick={handleClickSellPrice}>
            이 금액으로 판매하기
          </Button>
        </Flexbox>
      </Box>
    </StyledCardDetailWrap>
  );
}

const StyledCardDetailWrap = styled.div`
  background: ${({ theme: { palette } }) => palette.primary.bgLight};
  padding: 20px 0;
  margin-left: -20px;
  width: calc(100% + 40px);
`;

const DetailImageWrap = styled.div`
  min-width: 150px;
  width: 150px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
`;

const DetailImage = styled.img`
  min-height: 150px;
  object-fit: cover;
`;

const Img = styled.img``;

export default CamelSellerProductCardDetail;
