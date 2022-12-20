import { useState } from 'react';

import { Box, Flexbox, Label, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import styled from '@emotion/styled';

import type { Product } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { IMG_CAMEL_PLATFORM_NUMBER } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber } from '@utils/common';

import CamelSellerProductCardDetail from './CamelSellerProductCardDetail';

function CamelSellerProductCard({ data, isActive }: { data: Product; isActive: boolean }) {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();
  const [openDetail, setOpenDetail] = useState(false);
  const isNormalseller =
    (data.site.id === 34 || data.productSeller.type === 4) && data.productSeller.type !== 3;

  const handleClickRecentProduct = () => {
    logEvent(attrKeys.camelSeller.CLICK_MARKET_PRODUCT, {
      name: attrProperty.name.MARKET_PRICE,
      title: attrProperty.title.PRODUCT
    });

    setOpenDetail((props) => !props);
  };

  if (openDetail || isActive) {
    return <CamelSellerProductCardDetail data={data} />;
  }

  return (
    <>
      <Flexbox gap={12} onClick={handleClickRecentProduct} alignment="center">
        <ProductImageBox alignment="center" justifyContent="center">
          <Img src={data.imageMain} alt={data.title} width={100} />
        </ProductImageBox>
        <Box>
          <Typography weight="medium" variant="small1">
            {data.title}
          </Typography>
          <Typography variant="small2">{data.quoteTitle}</Typography>
          <Flexbox alignment="center" gap={4} customStyle={{ margin: '5px 0 9px' }}>
            <Typography weight="bold" customStyle={{ minWidth: 'fit-content' }}>
              {commaNumber(getTenThousandUnitPrice(data.price))}만원
            </Typography>

            {data.labels.filter((label) => label.codeId === 14)[0] && (
              <Label
                variant="contained"
                text={data.labels.filter((label) => label.codeId === 14)[0].name}
                customStyle={{
                  width: 35,
                  height: 19,
                  background: primary.highlight,
                  color: primary.main
                }}
              />
            )}
          </Flexbox>
          <Flexbox alignment="center" gap={3}>
            {data.site.id && (
              <Img
                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${
                  isNormalseller ? IMG_CAMEL_PLATFORM_NUMBER : data.site.id
                }.png`}
                width="20px"
                alt={data.site.name}
              />
            )}
            <Typography weight="bold" variant="small2" customStyle={{ color: common.ui60 }}>
              {dayjs(new Date(data.dateUpdated)).format('MM월 DD일')} 거래완료
            </Typography>
          </Flexbox>
        </Box>
      </Flexbox>
      {/* {(openDetail || isActive) && <CamelSellerProductCardDetail data={data} />} */}
    </>
  );
}

const ProductImageBox = styled(Flexbox)`
  max-width: 100px;
  max-height: 100px;
  min-width: 100px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
`;

const Img = styled.img`
  border-radius: 4px;
`;

export default CamelSellerProductCard;
