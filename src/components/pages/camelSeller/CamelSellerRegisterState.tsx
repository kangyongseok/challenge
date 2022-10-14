import { useEffect, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Flexbox, Icon, Label, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { CAMEL_SELLER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { CamelSellerLocalStorage } from '@typings/camelSeller';
import {
  camelSellerBooleanStateFamily,
  camelSellerEditState,
  camelSellerSubmitState
} from '@recoil/camelSeller';

function CamelSellerRegisterState() {
  const {
    theme: {
      palette: { secondary, common }
    }
  } = useTheme();
  const router = useRouter();
  const [camelSeller, setCamelSeller] = useState<CamelSellerLocalStorage>();
  const editData = useRecoilValue(camelSellerEditState);
  const submitData = useRecoilValue(camelSellerSubmitState);
  const editMode = useRecoilValue(camelSellerBooleanStateFamily('edit'));
  const { isState } = useRecoilValue(camelSellerBooleanStateFamily('submitClick'));

  useEffect(() => {
    setCamelSeller(editData || (LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage));
  }, [submitData, editData]);

  const handleClickStyle = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_EDIT, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.STYLE
    });

    if (editMode.isState) {
      router.push(`/camelSeller/selectProductState?id=${router.query.id}`);
      return;
    }
    router.push('/camelSeller/selectProductState');
  };

  return (
    <Flexbox alignment="center" justifyContent="space-between" onClick={handleClickStyle}>
      {camelSeller?.size?.name && camelSeller?.color?.name ? (
        <Flexbox alignment="center" gap={8}>
          <ProductStateLabel text={camelSeller?.size?.name} variant="contained" />
          <ProductStateLabel text={camelSeller?.color?.name} variant="contained" />
        </Flexbox>
      ) : (
        <Typography
          variant="h4"
          weight="medium"
          customStyle={{
            color: !camelSeller?.size?.name && isState ? secondary.red.light : common.ui80
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
