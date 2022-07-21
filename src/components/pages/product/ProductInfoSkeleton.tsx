import { Flexbox } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Divider } from '@components/UI/molecules';

import { pulse } from '@styles/transition';

function ProductInfoSkeleton() {
  return (
    <>
      <LoadingTitle />
      <LoadingPrice />
      <Flexbox justifyContent="space-between">
        <LoadingMeta />
        <LoadingMeta />
      </Flexbox>
      <Divider />
      <LoadingDescription />
      <LastDivider />
    </>
  );
}

const BaseSkeleton = styled.div`
  background-color: ${({ theme }) => theme.palette.common.grey['90']};
  animation: ${pulse} 800ms linear 0s infinite alternate;
`;

const LoadingTitle = styled(BaseSkeleton)`
  margin-top: 24px;
  height: 24px;
  width: 60%;
`;

const LoadingPrice = styled(BaseSkeleton)`
  margin-top: 4px;
  height: 27px;
  width: 20%;
`;

const LoadingMeta = styled(BaseSkeleton)`
  margin-top: 8px;
  height: 15px;
  width: 35%;
`;

const LoadingDescription = styled(BaseSkeleton)`
  margin: 24px 0;
  height: 200px;
`;

const LastDivider = styled(Divider)`
  margin-top: 0;
  margin-bottom: 32px;
`;

export default ProductInfoSkeleton;
