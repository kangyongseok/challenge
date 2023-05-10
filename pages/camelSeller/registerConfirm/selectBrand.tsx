import { useEffect, useRef } from 'react';

import { GetServerSidePropsContext } from 'next';
import { Typography } from '@mrcamelhub/camel-ui';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  CamelSellerSelectBrandHeader,
  CamelSellerSelectBrandInput,
  CamelSellerSelectBrandList
} from '@components/pages/camelSeller';

import SessionStorage from '@library/sessionStorage';
import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import { HEADER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';

import useScrollTrigger from '@hooks/useScrollTrigger';

function CamelSellerSelectBrand() {
  const inputBoxRef = useRef<HTMLDivElement>(null);
  const triggered = useScrollTrigger({
    ref: inputBoxRef,
    additionalOffsetTop: -HEADER_HEIGHT,
    delay: 0
  });

  useEffect(() => {
    const source = SessionStorage.get(sessionStorageKeys.camelSellerSelectBrandSource);
    logEvent(attrKeys.camelSeller.VIEW_PRODUCT_MODAL, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.BRAND,
      source
    });
    SessionStorage.remove(sessionStorageKeys.camelSellerSelectBrandSource);
  }, []);

  return (
    <GeneralTemplate
      header={<CamelSellerSelectBrandHeader triggered={triggered} />}
      hideAppDownloadBanner
    >
      <Typography
        variant="h2"
        weight="bold"
        customStyle={{
          padding: '20px 0 32px'
        }}
      >
        브랜드를 선택해 주세요
      </Typography>
      <CamelSellerSelectBrandInput inputBoxRef={inputBoxRef} triggered={triggered} />
      <CamelSellerSelectBrandList triggered={triggered} />
    </GeneralTemplate>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  Initializer.initAccessTokenByCookies(getCookies({ req }));
  return {
    props: {}
  };
}

export default CamelSellerSelectBrand;
