import { useEffect, useState } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Flexbox, Icon, Label, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { fetchProduct } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { deviceIdState } from '@recoil/common';
import { camelSellerBooleanStateFamily, camelSellerTempSaveDataState } from '@recoil/camelSeller';

import CamelSellerSelectProductState from './CamelSellerSelectProductState';

function CamelSellerRegisterState() {
  const {
    theme: {
      palette: { secondary, common }
    }
  } = useTheme();
  const { query } = useRouter();
  const deviceId = useRecoilValue(deviceIdState);
  const productId = Number(query.id || 0);
  const [tempData, setTempData] = useRecoilState(camelSellerTempSaveDataState);
  const [isStatePage, setIsStatePage] = useState(false);
  const { isState } = useRecoilValue(camelSellerBooleanStateFamily('submitClick'));
  const { data: editData } = useQuery(
    queryKeys.products.sellerEditProducs({ productId, deviceId }),
    () => fetchProduct({ productId, deviceId }),
    {
      enabled: !!productId
    }
  );

  useEffect(() => {
    if (editData && !tempData.color.name) {
      setTempData({
        ...tempData,
        color: editData.product.colors ? editData.product.colors[0] : { id: 0, name: '' },
        size: editData.product.categorySizes
          ? editData.product.categorySizes[0]
          : { id: 0, name: '' }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData]);

  const handleClickStyle = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_EDIT, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.STYLE
    });

    setIsStatePage(true);
  };

  if (isStatePage) {
    return <CamelSellerSelectProductState close={() => setIsStatePage(false)} />;
  }

  return (
    <Flexbox alignment="center" justifyContent="space-between" onClick={handleClickStyle}>
      {tempData?.size?.name && tempData?.color?.name ? (
        <Flexbox alignment="center" gap={8}>
          <ProductStateLabel text={tempData?.size?.name} variant="solid" />
          <ProductStateLabel text={tempData?.color?.name} variant="solid" />
        </Flexbox>
      ) : (
        <Typography
          variant="h4"
          weight="medium"
          customStyle={{
            color: !tempData?.size?.name && isState ? secondary.red.light : common.ui80
          }}
        >
          사이즈 및 색상
        </Typography>
      )}
      <Icon name="CaretRightOutlined" customStyle={{ color: common.ui80 }} />
    </Flexbox>
  );
}

const ProductStateLabel = styled(Label)`
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui95};
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui20};
  font-size: ${({ theme: { typography } }) => typography.body1.size};
  font-weight: ${({ theme: { typography } }) => typography.body1.weight.regular};
  padding: 6px 12px;
  border-radius: 36px;
  min-height: 32px;
`;

export default CamelSellerRegisterState;
