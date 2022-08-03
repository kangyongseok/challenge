import { Box } from 'mrcamel-ui';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ProductLegitProcessBottomSheet,
  ProductLegitProcessCTAButton,
  ProductLegitProcessContents,
  ProductLegitProcessFailContents,
  ProductLegitProcessVisualProcess,
  ProductLegitSummaryCard
} from '@components/pages/product';

function Legit() {
  return (
    <GeneralTemplate header={<Header />} footer={<ProductLegitProcessCTAButton />}>
      <ProductLegitSummaryCard />
      <ProductLegitProcessVisualProcess />
      <ProductLegitProcessContents />
      <ProductLegitProcessFailContents />
      <Box customStyle={{ height: 89 }} />
      <ProductLegitProcessBottomSheet />
    </GeneralTemplate>
  );
}

export default Legit;
