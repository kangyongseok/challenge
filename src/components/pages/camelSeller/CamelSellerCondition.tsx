import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { camelSellerDialogStateFamily, camelSellerTempSaveDataState } from '@recoil/camelSeller';

function CamelSellerCondition() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const setOpen = useSetRecoilState(camelSellerDialogStateFamily('condition'));
  const tempData = useRecoilValue(camelSellerTempSaveDataState);

  const handleClick = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_EDIT, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.CONDITION,
      att: tempData.condition.synonyms
    });

    setOpen(({ type }) => ({ type, open: true }));
  };

  return (
    <Flexbox
      alignment="center"
      justifyContent="space-between"
      customStyle={{ height: 61, borderBottom: `1px solid ${common.line01}`, cursor: 'pointer' }}
      onClick={handleClick}
    >
      <Typography variant="h4" color={!tempData.condition.name ? 'ui80' : undefined}>
        {tempData.condition.name || '상태'}
      </Typography>
      <Icon
        name="Arrow2RightOutlined"
        width={20}
        height={20}
        color={common.ui80}
        customStyle={{
          minWidth: 20
        }}
      />
    </Flexbox>
  );
}

export default CamelSellerCondition;
