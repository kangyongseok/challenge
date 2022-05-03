import React from 'react';

import { MainWelcome, MainProductDealAlert, MainBrandList } from '@components/pages/main';
import GeneralTemplate from '@components/templates/GeneralTemplate';

function Main() {
  return (
    <GeneralTemplate footer={<footer>footer</footer>}>
      <MainWelcome />
      <MainProductDealAlert />
      <MainBrandList />
    </GeneralTemplate>
  );
}

export default Main;
