import { QueryClient } from 'react-query';
import { GetServerSidePropsContext } from 'next';

import { PageHead } from '@components/UI/atoms';

import Initializer from '@library/initializer';

import { fetchContentsProducts } from '@api/common';

import queryKeys from '@constants/queryKeys';

function Crazycuration() {
  const title = '약 빤 매물만 모아온 크레이지위크! | 카멜 최저가 가격비교';
  const description =
    '전국을 털어 약빤 매물만 가져왔어요. 매일 달라지는 주제로 미친 매력의 매물만 모아보세요.';

  return (
    <PageHead
      title={title}
      description={description}
      ogTitle={title}
      ogDescription={description}
      ogImage="https://mrcamel.s3.ap-northeast-2.amazonaws.com/assets/images/crazycuration/thumbnail.png"
      ogUrl={`${(typeof window !== 'undefined' && window.location.protocol) || 'https:'}//${
        (typeof window !== 'undefined' && window.location.host) || 'mrcamel.co.kr'
      }/crazycuration`}
    />
  );
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
