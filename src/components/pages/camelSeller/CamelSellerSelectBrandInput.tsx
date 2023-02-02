import type { RefObject } from 'react';

import { useRecoilState } from 'recoil';
import { Box, Icon, Input, useTheme } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { camelSellerBrandSearchValueState } from '@recoil/camelSeller';

interface CamelSellerSelectBrandInputProps {
  inputBoxRef: RefObject<HTMLDivElement>;
  triggered: boolean;
}

function CamelSellerSelectBrandInput({ inputBoxRef, triggered }: CamelSellerSelectBrandInputProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [value, setValue] = useRecoilState(camelSellerBrandSearchValueState);

  return (
    <>
      <Box
        ref={inputBoxRef}
        customStyle={{
          position: triggered ? 'fixed' : 'static',
          top: 56,
          width: triggered ? '100%' : 'calc(100% + 40px)',
          margin: '0 -20px',
          padding: '0 20px 12px',
          backgroundColor: common.uiWhite,
          zIndex: 1
        }}
      >
        <Input
          variant="solid"
          size="large"
          startAdornment={<Icon name="SearchOutlined" />}
          onChange={(e) => setValue(e.currentTarget.value)}
          onFocus={() =>
            logEvent(attrKeys.camelSeller.CLICK_BRAND_SEARCH, {
              name: attrProperty.name.PRODUCT_BRAND
            })
          }
          value={value}
          placeholder="브랜드 검색"
          fullWidth
        />
      </Box>
      {triggered && <Box customStyle={{ minHeight: 56 }} />}
    </>
  );
}

export default CamelSellerSelectBrandInput;
