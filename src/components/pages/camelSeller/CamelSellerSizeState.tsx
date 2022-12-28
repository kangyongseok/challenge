import { useRecoilState } from 'recoil';
import { Chip, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import { SizeCode } from '@dto/common';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { toggleBottomSheetState } from '@recoil/camelSeller';

function CamelSellerSizeState({
  sizes,
  onClick
}: {
  sizes: SizeCode[];
  onClick: (parameters: { id: number; name: string }) => void;
}) {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();
  const [, atomToggleBottomSheet] = useRecoilState(toggleBottomSheetState);
  return (
    <>
      <Typography variant="h4" weight="medium" customStyle={{ color: primary.main }}>
        사이즈를 선택해주세요.
      </Typography>
      <Flexbox gap={8} customStyle={{ marginTop: 12, flexWrap: 'wrap' }}>
        <Chip
          variant="solid"
          customStyle={{
            background: common.ui95,
            color: common.ui20
          }}
          onClick={() => {
            onClick({ id: 0, name: 'ONE SIZE' });
          }}
        >
          ONE SIZE
        </Chip>
        {sizes &&
          sizes.map((size) => (
            <Chip
              key={`seller-product-color-${size.name}`}
              variant="solid"
              customStyle={{
                background: common.ui95,
                color: common.ui20
              }}
              onClick={() => {
                logEvent(attrKeys.camelSeller.SELECT_ITEM, {
                  name: attrProperty.name.PRODUCT_OPTIONS,
                  title: attrProperty.title.RECOMM_SIZE,
                  att: size.name
                });

                onClick({ id: size.id, name: size.name });
              }}
            >
              {size.name}
            </Chip>
          ))}
      </Flexbox>
      <Typography
        weight="medium"
        onClick={() => {
          logEvent(attrKeys.camelSeller.CLICK_PRODUCT_OPTIONS, {
            name: attrProperty.name.PRODUCT_OPTIONS,
            title: attrProperty.title.NO_SIZE
          });
          atomToggleBottomSheet('size');
        }}
        customStyle={{
          marginTop: 8,
          color: common.ui60,
          textDecoration: 'underline'
        }}
      >
        찾는 사이즈가 없나요? 직접 선택해보세요.
      </Typography>
    </>
  );
}

export default CamelSellerSizeState;
