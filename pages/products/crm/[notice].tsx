import { useRouter } from 'next/router';
import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import { BottomNavigation, Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ProductsFilter,
  ProductsFilterBottomSheet,
  ProductsInfiniteGrid,
  ProductsKeywordDialog,
  ProductsMapFilterBottomSheet,
  ProductsRelated,
  ProductsSortFilterBottomSheet,
  ProductsStatus,
  ProductsTopButton
} from '@components/pages/products';

import attrProperty from '@constants/attrProperty';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function CrmProducts() {
  const {
    query: { notice }
  } = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();

  return (
    <>
      <GeneralTemplate
        header={<Header isFixed disableProductsKeywordClickInterceptor={false} />}
        footer={
          <BottomNavigation
            disableHideOnScroll={false}
            disableProductsKeywordClickInterceptor={false}
          />
        }
        disablePadding
      >
        {notice && (
          <>
            <Flexbox direction="vertical" customStyle={{ padding: '8px 20px 16px 20px' }}>
              <Typography variant="h4" weight="bold">
                {`${(accessUser || {}).userName || '회원'}님`}
              </Typography>
              <Typography variant="h4" weight="bold" brandColor="primary">
                {notice}
              </Typography>
            </Flexbox>
            <Box
              customStyle={{
                width: '100%',
                height: 8,
                backgroundColor: common.grey['90']
              }}
            />
          </>
        )}
        <ProductsFilter
          variant="search"
          customStyle={{
            top: 56
          }}
        />
        <ProductsStatus />
        <ProductsInfiniteGrid variant="search" name={attrProperty.productName.CRM} />
        <ProductsRelated />
      </GeneralTemplate>
      <ProductsTopButton />
      <ProductsFilterBottomSheet variant="search" />
      <ProductsMapFilterBottomSheet />
      <ProductsSortFilterBottomSheet />
      <ProductsKeywordDialog />
    </>
  );
}

export default CrmProducts;
