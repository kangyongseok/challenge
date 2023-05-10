import { Fragment } from 'react';

import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Box } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import LegitOpinion from '@components/UI/molecules/LegitOpinion';

import { fetchProductLegit } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function LegitResultOpinionList() {
  const router = useRouter();
  const { id } = router.query;
  const splitIds = String(id).split('-');
  const productId = Number(splitIds[splitIds.length - 1] || 0);

  const { data: accessUser } = useQueryAccessUser();

  const {
    data: { legitOpinions = [], userId, productResult: { sellerUserId = 0 } = {}, status } = {}
  } = useQuery(queryKeys.productLegits.legit(productId), () => fetchProductLegit(productId), {
    enabled: !!id
  });

  if (
    status === 20 &&
    (!accessUser || (accessUser.userId !== userId && accessUser.userId !== sellerUserId))
  )
    return null;

  return (
    <Box component="section" customStyle={{ marginTop: 48 }}>
      {legitOpinions
        .filter((legitOpinion) => legitOpinion.description)
        .map((legitOpinion, index) => (
          <Fragment key={`legit-opinion-${legitOpinion.id}`}>
            <LegitOpinion
              legitOpinion={legitOpinion}
              onClick={() => router.push(`/legit/profile/${legitOpinion.roleLegit.userId}`)}
            />
            {index !== legitOpinions.filter((lo) => lo.description).length - 1 && <Divider />}
          </Fragment>
        ))}
    </Box>
  );
}

const Divider = styled.div`
  margin: 32px 0;
  border-bottom: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui90};
`;

export default LegitResultOpinionList;
