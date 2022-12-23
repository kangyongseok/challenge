import { useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { fetchSearchOptions } from '@api/product';

import queryKeys from '@constants/queryKeys';

import { productsFilterProgressDoneState, searchParamsStateFamily } from '@recoil/productsFilter';

function ProductsLandingInfo() {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];
  const { keyword, notice } = router.query;

  const { searchParams: searchOptionsParams } = useRecoilValue(
    searchParamsStateFamily(`searchOptions-${atomParam}`)
  );
  const progressDone = useRecoilValue(productsFilterProgressDoneState);

  const { isFetched, data: { productTotal = 0 } = {} } = useQuery(
    queryKeys.products.searchOptions(searchOptionsParams),
    () => fetchSearchOptions(searchOptionsParams),
    {
      keepPreviousData: true,
      enabled: Object.keys(searchOptionsParams).length > 0,
      staleTime: 5 * 60 * 1000
    }
  );

  return (
    <Wrapper>
      <Typography weight="medium">대한민국 모든 중고매물 한번에 비교중!</Typography>
      <Typography variant="h3" weight="bold" brandColor="primary" customStyle={{ marginTop: 12 }}>
        {keyword || notice}
      </Typography>
      <Typography variant="h3" weight="bold">
        {isFetched && progressDone ? `전체 ${productTotal.toLocaleString()}개` : '매물 검색 중...'}
      </Typography>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 12px 20px 20px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  border-bottom: 2px solid
    ${({
      theme: {
        palette: { primary }
      }
    }) => primary.main};
`;

export default ProductsLandingInfo;
