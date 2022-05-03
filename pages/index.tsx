import React from 'react';
import { dehydrate, QueryClient, useQuery } from 'react-query';

import { MainWelcome, MainProductDealAlert, MainBrandList } from '@components/pages/main';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import { BRANDS } from '@constants/react-query/brand';
import { fetchBrands } from '@api/brand';

function Main() {
  const {
    data: { brands = [] }
  } = useQuery(BRANDS.brands, fetchBrands);

  return (
    <GeneralTemplate footer={<footer>footer</footer>}>
      <MainWelcome />
      <MainProductDealAlert />
      <MainBrandList brands={brands} />
    </GeneralTemplate>
  );
}

export async function getServerSideProps() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(BRANDS.brands, fetchBrands);

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient)))
    }
  };
}

export default Main;
