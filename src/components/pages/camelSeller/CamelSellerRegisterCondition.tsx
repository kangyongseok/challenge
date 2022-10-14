import { useEffect, useMemo, useState } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { CAMEL_SELLER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import type { CamelSellerLocalStorage } from '@typings/camelSeller';
import {
  camelSellerBooleanStateFamily,
  camelSellerDialogStateFamily,
  camelSellerEditState,
  camelSellerSubmitState
} from '@recoil/camelSeller';

function CamelSellerRegisterCondition() {
  const {
    theme: {
      palette: { secondary, common }
    }
  } = useTheme();

  const submitData = useRecoilValue(camelSellerSubmitState);
  const { isState } = useRecoilValue(camelSellerBooleanStateFamily('submitClick'));
  const [camelSeller, setCamelSeller] = useState<CamelSellerLocalStorage>();
  const editData = useRecoilValue(camelSellerEditState);
  const setOpen = useSetRecoilState(camelSellerDialogStateFamily('condition'));

  useEffect(() => {
    setCamelSeller(editData || (LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage));
  }, [submitData, editData]);

  const getColor = useMemo(() => {
    if (isState && !camelSeller?.condition?.id) {
      return secondary.red.light;
    }
    if (camelSeller?.condition?.id) {
      return common.ui20;
    }
    return common.ui80;
  }, [isState, camelSeller?.condition?.id, common.ui80, common.ui20, secondary.red.light]);

  const handleClick = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_EDIT, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.CONDITION
    });
    setOpen(({ type }) => ({ type, open: true }));
  };

  return (
    <Flexbox justifyContent="space-between" alignment="center" onClick={handleClick}>
      <Typography
        weight="medium"
        variant="h4"
        customStyle={{
          color: getColor
        }}
      >
        {camelSeller?.condition?.name || '상태'}
      </Typography>
      <Icon name="CaretRightOutlined" customStyle={{ color: common.ui80 }} />
    </Flexbox>
  );
}

export default CamelSellerRegisterCondition;
