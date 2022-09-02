import { QueryClient } from 'react-query';
import { GetServerSidePropsContext } from 'next';

import Initializer from '@library/initializer';

import { fetchContentsProducts } from '@api/common';

import queryKeys from '@constants/queryKeys';

function Crazycuration() {
  return <div />;
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const queryClient = new QueryClient();

  Initializer.initAccessTokenByCookies(req.cookies);
  Initializer.initAccessUserInQueryClientByCookies(req.cookies, queryClient);

  const { contents: { url } = {} } = await queryClient.fetchQuery(
    queryKeys.common.contentsProducts(0),
    () => fetchContentsProducts(0)
  );

  if (url) {
    return {
      redirect: {
        permanent: false,
        destination: encodeURI(url)
      }
    };
  }

  return {
    props: {}
  };
}

export default Crazycuration;
