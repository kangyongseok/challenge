import { GetServerSidePropsContext } from 'next';
import { QueryClient } from '@tanstack/react-query';

import Initializer from '@library/initializer';

import { fetchContentsProducts } from '@api/common';

import queryKeys from '@constants/queryKeys';

import { getCookies } from '@utils/cookies';

function Crazycuration() {
  return <div />;
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const queryClient = new QueryClient();

  Initializer.initAccessTokenByCookies(getCookies({ req }));

  try {
    const { contents: { url } = {} } = await queryClient.fetchQuery(
      queryKeys.commons.contentsProducts(0),
      () => fetchContentsProducts(0)
    );

    return {
      redirect: {
        permanent: false,
        destination: encodeURI(url || '/crazycuration/미친-매력의-급처-매물-2209')
      }
    };
  } catch {
    return {
      redirect: {
        permanent: false,
        destination: encodeURI('/crazycuration/미친-매력의-급처-매물-2209')
      }
    };
  }
}

export default Crazycuration;
