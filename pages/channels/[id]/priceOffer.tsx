import { useEffect } from 'react';

import { useRouter } from 'next/router';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ChannelPriceOfferForm,
  ChannelPriceOfferHeader,
  ChannelPriceOfferProductInfo
} from '@components/pages/channelPriceOffer';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import attrKeys from '@constants/attrKeys';

import useViewportUnitsTrick from '@hooks/useViewportUnitsTrick';

function ChannelPriceOffer() {
  const router = useRouter();
  const { att = 'BUYER' } = router.query;

  useViewportUnitsTrick();

  useEffect(() => {
    const { source } =
      SessionStorage.get<{ source?: string }>(
        sessionStorageKeys.productDetailOfferEventProperties
      ) || {};

    logEvent(attrKeys.channel.VIEW_PRODUCT_OFFER, {
      source,
      att
    });
  }, [att]);

  return (
    <GeneralTemplate header={<ChannelPriceOfferHeader />} disablePadding hideAppDownloadBanner>
      <ChannelPriceOfferProductInfo />
      <ChannelPriceOfferForm />
    </GeneralTemplate>
  );
}

export default ChannelPriceOffer;
