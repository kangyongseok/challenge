import { useEffect } from 'react';

import { Box } from 'mrcamel-ui';

import Header from '@components/UI/molecules/Header';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ProductLegitAlarmGuideDialog,
  ProductLegitProcessBottomSheet,
  ProductLegitProcessCTAButton,
  ProductLegitProcessContents,
  ProductLegitProcessFailContents,
  ProductLegitProcessVisualProcess,
  ProductLegitSummaryCard
} from '@components/pages/product';

import ChannelTalk from '@library/channelTalk';

function Legit() {
  useEffect(() => {
    ChannelTalk.moveChannelButtonPosition(-30);

    return () => {
      ChannelTalk.resetChannelButtonPosition();
    };
  }, []);

  return (
    <GeneralTemplate header={<Header />} footer={<ProductLegitProcessCTAButton />}>
      <ProductLegitSummaryCard />
      <ProductLegitProcessVisualProcess />
      <ProductLegitProcessContents />
      <ProductLegitProcessFailContents />
      <Box customStyle={{ height: 89 }} />
      <ProductLegitProcessBottomSheet />
      <ProductLegitAlarmGuideDialog />
    </GeneralTemplate>
  );
}

export default Legit;
