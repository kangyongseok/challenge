import { GetServerSidePropsContext } from 'next';

import BottomNavigation from '@components/UI/molecules/BottomNavigation';
import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ProductsCategoryTags,
  ProductsDynamicFilter,
  ProductsFilter,
  ProductsFilterBottomSheet,
  ProductsFilterHistory,
  ProductsHeader,
  ProductsInfiniteGrid,
  ProductsListBanner,
  ProductsOrderFilterBottomSheet,
  ProductsRelated,
  ProductsStatus,
  ProductsTopButton
} from '@components/pages/products';

import { convertSearchParamsByQuery } from '@utils/products';
import { getCookies } from '@utils/cookies';
import getAccessUserByCookies from '@utils/common/getAccessUserByCookies';

function CamelProducts() {
  return (
    <>
      <GeneralTemplate
        header={<ProductsHeader variant="camel" />}
        footer={<BottomNavigation disableHideOnScroll={false} />}
        disablePadding
      >
        <ProductsCategoryTags variant="camel" />
        <ProductsDynamicFilter />
        <ProductsListBanner />
        <Gap height={8} />
        <ProductsFilter variant="camel" />
        <ProductsFilterHistory variant="camel" />
        <ProductsStatus variant="camel" />
        <ProductsInfiniteGrid variant="camel" />
        <Gap height={8} />
        <ProductsRelated />
      </GeneralTemplate>
      <ProductsTopButton />
      <ProductsFilterBottomSheet variant="camel" />
      <ProductsOrderFilterBottomSheet />
    </>
  );
}

export async function getServerSideProps({ query, req, res }: GetServerSidePropsContext) {
  const params = convertSearchParamsByQuery(query, {
    variant: 'camel'
  });
  const accessUser = getAccessUserByCookies(getCookies({ req }));

  const isGoBack = req.cookies.isGoBack ? JSON.parse(req.cookies.isGoBack) : false;

  if (isGoBack) {
    res.setHeader('Set-Cookie', 'isGoBack=false;path=/');

    return {
      props: {
        params,
        accessUser
      }
    };
  }

  return {
    props: {
      params,
      accessUser
    }
  };
}

export default CamelProducts;
