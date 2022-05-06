import React from 'react';
import { dehydrate, QueryClient } from 'react-query';

import { MainWelcome, MainProductDealAlert, MainBrandList } from '@components/pages/main';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import queryKeys from '@constants/queryKeys';
import { fetchBrands } from '@api/brand';

function Main() {
  return (
    <GeneralTemplate footer={<footer>footer</footer>}>
      <MainWelcome />
      <MainProductDealAlert />
      <MainBrandList />
    </GeneralTemplate>
  );
}

export async function getServerSideProps() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(queryKeys.brands.brands, fetchBrands);

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

export default Main;
