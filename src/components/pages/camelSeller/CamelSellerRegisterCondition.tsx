import { useEffect, useMemo, useState } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';

import { CommonCode } from '@dto/common';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  camelSellerBooleanStateFamily,
  camelSellerDialogStateFamily,
  // camelSellerSubmitState,
  camelSellerTempSaveDataState
} from '@recoil/camelSeller';

function CamelSellerRegisterCondition() {
  const {
    theme: {
      palette: { secondary, common }
    }
  } = useTheme();
  const { isState } = useRecoilValue(camelSellerBooleanStateFamily('submitClick'));
  const tempData = useRecoilValue(camelSellerTempSaveDataState);
  const setOpen = useSetRecoilState(camelSellerDialogStateFamily('condition'));
  const [condition, setCondition] = useState<CommonCode | { id: number; name: string } | null>(
    null
  );

  useEffect(() => {
    if (tempData.condition.name) {
      setCondition(tempData.condition);
    }
  }, [tempData]);

  const getColor = useMemo(() => {
    if (isState && !condition) {
      return secondary.red.light;
    }
    if (condition) {
      return common.ui20;
    }
    return common.ui80;
  }, [isState, condition, common.ui80, common.ui20, secondary.red.light]);

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
        {condition?.name || '상태'}
      </Typography>
      <Icon name="CaretRightOutlined" customStyle={{ color: common.ui80 }} />
    </Flexbox>
  );
}

export default CamelSellerRegisterCondition;
