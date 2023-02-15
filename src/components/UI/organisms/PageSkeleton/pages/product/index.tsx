import { useRouter } from 'next/router';
import { Box, Flexbox, Skeleton } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Divider, ProductDetailHeader } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

function ProductDetail() {
  const router = useRouter();
  const { redirect } = router.query;

  const isRedirectPage = typeof redirect !== 'undefined' && Boolean(redirect);

  return (
    <GeneralTemplate
      header={<ProductDetailHeader hideRightIcon />}
      footer={
        <CtaButtonWrapper>
          <Skeleton width={48} height={44} round={8} disableAspectRatio />
          <Skeleton width="100%" height={52} round={8} disableAspectRatio />
        </CtaButtonWrapper>
      }
      hideAppDownloadBanner={isRedirectPage}
    >
      <Box
        customStyle={{
          margin: '0 -20px'
        }}
      >
        <Skeleton />
      </Box>
      <Box customStyle={{ marginTop: 20 }}>
        <Skeleton width="100%" maxWidth={150} height={20} round={8} disableAspectRatio />
        <Skeleton
          width="100%"
          maxWidth={70}
          height={32}
          round={8}
          disableAspectRatio
          customStyle={{ marginTop: 4 }}
        />
        <Flexbox
          alignment="center"
          justifyContent="space-between"
          gap={6}
          customStyle={{ marginTop: 12 }}
        >
          <Skeleton width="100%" maxWidth={40} height={12} round={8} disableAspectRatio />
          <Skeleton width="100%" maxWidth={30} height={12} round={8} disableAspectRatio />
        </Flexbox>
      </Box>
      <Divider
        css={{
          margin: '24px 0'
        }}
      />
      <Flexbox direction="vertical" gap={4}>
        <Skeleton width="100%" height={18} maxWidth={120} round={8} disableAspectRatio />
        <Skeleton width="100%" height={18} maxWidth={70} round={8} disableAspectRatio />
        <Skeleton width="100%" height={18} maxWidth={100} round={8} disableAspectRatio />
      </Flexbox>
      <Box customStyle={{ margin: '0 -20px' }}>
        <Skeleton width="100%" height={80} customStyle={{ marginTop: 20 }} />
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
