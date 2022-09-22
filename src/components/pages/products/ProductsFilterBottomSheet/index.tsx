import { useEffect } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { BottomSheet, Box, Flexbox, Icon, Typography } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import type { ProductsVariant } from '@typings/products';
import {
  productsFilterStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

import MyFilterInfo from './MyFilterInfo';
import FilterTabs from './FilterTabs';
import FilterTabPanels from './FilterTabPanels';
import FilterBottomOperation from './FilterBottomOperation';

interface ProductsFilterBottomSheetProps {
  variant: ProductsVariant;
}

function ProductsFilterBottomSheet({ variant }: ProductsFilterBottomSheetProps) {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const [{ open }, setProductsFilterState] = useRecoilState(
    productsFilterStateFamily(`general-${atomParam}`)
  );
  const { selectedSearchOptions } = useRecoilValue(
    selectedSearchOptionsStateFamily(`backup-${atomParam}`)
  );
  const setSelectedSearchOptionsState = useSetRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );

  const handleClose = () => {
    setProductsFilterState(({ type }) => ({
      type,
      open: false
    }));
    setSelectedSearchOptionsState(({ type }) => ({
      type,
      selectedSearchOptions
    }));
  };

  useEffect(() => {
    if (open) {
      logEvent(attrKeys.products.viewFilter);
    }
  }, [open]);

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      disableSwipeable
      customStyle={{
        height: '100%',
        maxHeight: 'calc(100% - 80px)',
        '& > div:first-of-type': {
          height: '100%'
        }
      }}
    >
      <Flexbox
        direction="vertical"
        customStyle={{
          height: '100%'
        }}
      >
        <Flexbox
          justifyContent="space-between"
          customStyle={{
            margin: '16px 20px 0 20px'
          }}
        >
          <Typography variant="h4" weight="bold">
            필터
          </Typography>
          <Icon
            name="CloseOutlined"
            size="large"
            onClick={() =>
              setProductsFilterState(({ type }) => ({
                type,
                open: false
              }))
            }
          />
        </Flexbox>
        <MyFilterInfo variant={variant} />
        <FilterTabs variant={variant} />
        <Box component="section" customStyle={{ flex: 1, overflowY: 'auto' }}>
          <FilterTabPanels variant={variant} />
        </Box>
        <FilterBottomOperation />
      </Flexbox>
    </BottomSheet>
  );
}

export default ProductsFilterBottomSheet;
