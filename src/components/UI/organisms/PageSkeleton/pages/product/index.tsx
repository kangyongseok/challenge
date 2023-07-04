import { useRouter } from 'next/router';
import { Box, Flexbox, Skeleton, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { Divider } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import { checkAgent } from '@utils/common';

function ProductDetail() {
  const router = useRouter();
  const { redirect } = router.query;

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const isRedirectPage = typeof redirect !== 'undefined' && Boolean(redirect);

  return (
    <GeneralTemplate
      header={
        <Flexbox
          alignment="center"
          justifyContent="space-between"
          gap={8}
          customStyle={{
            padding: '0 20px',
            minHeight: 56
          }}
        >
          {checkAgent.isMobileApp() ? (
            <>
              <Flexbox>
                <Skeleton width={24} height={24} round={8} disableAspectRatio />
                <Box
                  customStyle={{
                    minWidth: 32
                  }}
                />
              </Flexbox>
              <Skeleton width={76.8} height={16} round={6} disableAspectRatio />
              <Flexbox gap={16} alignment="center">
                <Skeleton width={24} height={24} round={8} disableAspectRatio />
                <Skeleton width={24} height={24} round={8} disableAspectRatio />
              </Flexbox>
            </>
          ) : (
            <>
              <Skeleton width={76.8} height={16} round={6} disableAspectRatio />
              <Flexbox gap={16} alignment="center">
                <Skeleton width={24} height={24} round={8} disableAspectRatio />
                <Skeleton width={24} height={24} round={8} disableAspectRatio />
              </Flexbox>
            </>
          )}
        </Flexbox>
      }
      footer={
        <CtaButtonWrapper>
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
        <Skeleton width="100%" maxWidth={70} height={32} round={8} disableAspectRatio />
        <Flexbox
          justifyContent="space-between"
          customStyle={{
            marginTop: 8
          }}
        >
          <Skeleton width="100%" maxWidth={150} height={46} round={8} disableAspectRatio />
          <Flexbox>
            <Box
              customStyle={{
                height: '100%',
                paddingRight: 18,
                borderLeft: `1px solid ${common.line01}`
              }}
            />
            <Skeleton width={28} height={46} round={8} disableAspectRatio />
          </Flexbox>
        </Flexbox>
        <Skeleton
          width="100%"
          maxWidth={40}
          height={16}
          round={8}
          disableAspectRatio
          customStyle={{ marginTop: 12 }}
        />
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
  min-height: 76px;
  max-height: 76px;
`;

export default ProductDetail;
