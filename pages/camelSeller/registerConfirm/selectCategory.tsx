import { useEffect } from 'react';

import { GetServerSidePropsContext } from 'next';
import { Typography } from '@mrcamelhub/camel-ui';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { CamelSellerSelectCategoryGrid } from '@components/pages/camelSeller';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';

function CamelSellerSelectCategory() {
  useEffect(() => {
    logEvent(attrKeys.camelSeller.VIEW_PRODUCT_MODAL, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.PRODUCT_PARENT
    });
  }, []);

  return (
    <GeneralTemplate header={<Header hideTitle showRight={false} />} hideAppDownloadBanner>
      <Typography
        variant="h2"
        weight="bold"
        customStyle={{
          margin: '20px 0 32px'
        }}
      >
        카테고리를 선택해 주세요
      </Typography>
      <CamelSellerSelectCategoryGrid />
    </GeneralTemplate>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  Initializer.initAccessTokenByCookies(getCookies({ req }));

  return {
    props: {}
  };
}

export default CamelSellerSelectCategory;
