import { QueryClient, dehydrate } from 'react-query';
import type { GetServerSidePropsContext } from 'next';

import Header from '@components/UI/molecules/Header';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  LegitAdminRequestCtaButton,
  LegitAdminRequestInfo,
  LegitAdminRequestOpinion,
  LegitAdminRequestOpinionWriter
} from '@components/pages/legitAdminRequest';

import Initializer from '@library/initializer';

import { fetchProductLegit } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';

import { getCookies } from '@utils/cookies';
import { getProductDetailUrl } from '@utils/common';

function LegitAdminRequestDetail() {
  return (
    <GeneralTemplate header={<Header />} footer={<LegitAdminRequestCtaButton />}>
      <LegitAdminRequestInfo />
      <LegitAdminRequestOpinion />
      <LegitAdminRequestOpinionWriter />
    </GeneralTemplate>
  );
}

export async function getServerSideProps({ req, query }: GetServerSidePropsContext) {
  try {
    const queryClient = new QueryClient();

    Initializer.initAccessTokenByCookies(getCookies({ req }));
    Initializer.initAccessUserInQueryClientByCookies(getCookies({ req }), queryClient);

    const { id = 0 } = query;

    const data = await queryClient.fetchQuery(queryKeys.productLegits.legit(Number(id)), () =>
      fetchProductLegit(Number(id))
    );

    if (data.status === 30) {
      return {
        redirect: {
          destination: encodeURI(
            `/legit${getProductDetailUrl({
              type: 'productResult',
              product: data.productResult
            }).replace('/products', '')}/result`
          ),
          permanent: false
        }
      };
    }

    return {
      props: {
        dehydratedState: dehydrate(queryClient)
      }
    };
  } catch {
    return {
      notFound: true
    };
  }
}

export default LegitAdminRequestDetail;
