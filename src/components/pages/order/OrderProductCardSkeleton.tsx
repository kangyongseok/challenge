import { Flexbox, Skeleton } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

function OrderProductCardSkeleton() {
  return (
    <CardWrap>
      <Flexbox gap={16} alignment="center">
        <Skeleton disableAspectRatio width={60} height={72} round={8} />
        <Flexbox direction="vertical" gap={2}>
          <Skeleton disableAspectRatio width={68} height={16} round={4} />
          <Skeleton disableAspectRatio width={68} height={16} round={4} />
          <Skeleton disableAspectRatio width={68} height={24} round={4} />
        </Flexbox>
      </Flexbox>
      <Skeleton disableAspectRatio customStyle={{ marginTop: 20 }} height={44} round={8} />
    </CardWrap>
  );
}

const CardWrap = styled.div`
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
  border-radius: 8px;
  padding: 20px;
`;

export default OrderProductCardSkeleton;
