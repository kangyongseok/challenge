import type { GetServerSidePropsContext } from 'next';

function View() {
  return <div>리다이렉트 페이지 이동중...</div>;
}

export async function getServerSideProps({ query }: GetServerSidePropsContext) {
  // crm 시 앱에서 간헐적 리다이렉트 실패로 page notfound 오류 방어 코드
  let result = `/${query.view}?`;
  const excludeViewKeys = Object.keys(query).filter((queryKey) => queryKey !== 'view');

  result += excludeViewKeys.map((key) => `${key}=${query[key]}`).join('&');
  return {
    redirect: {
      destination: encodeURI(result),
      permanent: false
    }
  };
}

export default View;
