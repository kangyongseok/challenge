import { Box, Flexbox } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Divider, ProductDetailHeader } from '@components/UI/molecules';
import Skeleton from '@components/UI/atoms/Skeleton';
import GeneralTemplate from '@components/templates/GeneralTemplate';

function ProductDetail() {
  return (
    <GeneralTemplate
      header={<ProductDetailHeader />}
      footer={
        <CtaButtonWrapper>
          <Skeleton
            width="48px"
            height="44px"
            disableAspectRatio
            customStyle={{ borderRadius: 8 }}
          />
          <Skeleton
            width="100%"
            height="44px"
            disableAspectRatio
            customStyle={{ borderRadius: 8 }}
          />
        </CtaButtonWrapper>
      }
    >
      <Box customStyle={{ margin: '0 -20px' }}>
        <Skeleton />
      </Box>
      <Box customStyle={{ marginTop: 20 }}>
        <Flexbox alignment="center" gap={6}>
          <Skeleton
            width="45px"
            height="18px"
            disableAspectRatio
            customStyle={{ borderRadius: 4 }}
          />
          <Skeleton
            width="45px"
            height="18px"
            disableAspectRatio
            customStyle={{ borderRadius: 4 }}
          />
        </Flexbox>
        <Skeleton
          width="100%"
          maxWidth="150px"
          height="20px"
          disableAspectRatio
          customStyle={{ marginTop: 8, borderRadius: 8 }}
        />
        <Skeleton
          width="100%"
          maxWidth="50px"
          height="24px"
          disableAspectRatio
          customStyle={{ marginTop: 4, borderRadius: 8 }}
        />
        <Flexbox
          alignment="center"
          justifyContent="space-between"
          gap={6}
          customStyle={{ marginTop: 8 }}
        >
          <Skeleton
            width="100%"
            maxWidth="40px"
            height="12px"
            disableAspectRatio
            customStyle={{ borderRadius: 8 }}
          />
          <Skeleton
            width="100%"
            maxWidth="30px"
            height="12px"
            disableAspectRatio
            customStyle={{ borderRadius: 8 }}
          />
        </Flexbox>
      </Box>
      <Divider
        css={{
          margin: '24px 0'
        }}
      />
      <Flexbox direction="vertical" gap={4}>
        <Skeleton
          width="100%"
          height="18px"
          maxWidth="120px"
          disableAspectRatio
          customStyle={{ borderRadius: 8 }}
        />
        <Skeleton
          width="100%"
          height="18px"
          maxWidth="70px"
          disableAspectRatio
          customStyle={{ borderRadius: 8 }}
        />
        <Skeleton
          width="100%"
          height="18px"
          maxWidth="100px"
          disableAspectRatio
          customStyle={{ borderRadius: 8 }}
        />
      </Flexbox>
      <Box customStyle={{ margin: '0 -20px' }}>
        <Skeleton width="100%" height="80px" customStyle={{ marginTop: 20 }} />
      </Box>
    </GeneralTemplate>
  );
}

const CtaButtonWrapper = styled.div`
  position: fixed;
  bottom: 0;
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  width: 100%;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  padding: 12px 20px;
  z-index: ${({ theme: { zIndex } }) => zIndex.button};
`;

export default ProductDetail;
