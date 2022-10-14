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

import { fetchRecommWishes, fetchUserInfo } from '@api/user';
import { fetchProductLegit } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';

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
  if (!req.cookies.accessToken)
    return {
      redirect: {
        destination: '/legit',
        permanent: false
      }
    };

  try {
    const queryClient = new QueryClient();

    Initializer.initAccessTokenByCookies(req.cookies);
    Initializer.initAccessUserInQueryClientByCookies(req.cookies, queryClient);

    await queryClient.prefetchQuery(queryKeys.users.recommWishes(), fetchRecommWishes);
    const userInfo = await queryClient.fetchQuery(queryKeys.users.userInfo(), fetchUserInfo);

    const hasRole = userInfo.roles.some((role) => (role as string).indexOf('PRODUCT_LEGIT') >= 0);

    if (!hasRole) {
      return {
        redirect: {
          destination: '/legit',
          permanent: false
        }
      };
    }

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
  } catch (e) {
    return {
      notFound: true
    };
  }
}

export default LegitAdminRequestDetail;
