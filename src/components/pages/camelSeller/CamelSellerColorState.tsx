import { useRecoilState } from 'recoil';
import { Chip, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import { CommonCode } from '@dto/common';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { toggleBottomSheetState } from '@recoil/camelSeller';

function CamelSellerColorState({
  colors,
  onClick
}: {
  colors: CommonCode[];
  onClick: (parameters: { id: number; name: string }) => void;
}) {
  const {
    theme: {
      palette: { primary, common },
      typography
    }
  } = useTheme();
  const [, atomToggleBottomSheet] = useRecoilState(toggleBottomSheetState);

  return (
    <>
      <Typography variant="h4" weight="medium" customStyle={{ color: primary.main }}>
        색상을 선택해주세요.
      </Typography>
      <Flexbox gap={8} customStyle={{ marginTop: 12, flexWrap: 'wrap' }}>
        {colors &&
          colors.map((color) => (
            <Chip
              key={`seller-product-color-${color.name}`}
              variant="solid"
              weight="regular"
              customStyle={{
                background: common.ui95,
                fontSize: typography.body1.size,
                color: common.ui20
              }}
              onClick={() => {
                logEvent(attrKeys.camelSeller.SELECT_ITEM, {
                  name: attrProperty.name.PRODUCT_OPTIONS,
                  title: attrProperty.title.RECOMM_COLOR,
                  att: color.name
                });

                onClick({ id: color.id, name: color.name });
              }}
            >
              {color.name}
            </Chip>
          ))}
      </Flexbox>
      <Typography
        weight="medium"
        onClick={() => {
          logEvent(attrKeys.camelSeller.CLICK_PRODUCT_OPTIONS, {
            name: attrProperty.name.PRODUCT_OPTIONS,
            title: attrProperty.title.NO_COLOR
          });

          atomToggleBottomSheet('color');
        }}
        customStyle={{
          marginTop: 8,
          color: common.ui60,
          textDecoration: 'underline'
        }}
      >
        찾는 색상이 없나요? 직접 선택해보세요.
      </Typography>
    </>
  );
}

export default CamelSellerColorState;
