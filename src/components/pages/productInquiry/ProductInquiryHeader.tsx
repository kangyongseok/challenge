import { useRouter } from 'next/router';
import { Box, Icon } from '@mrcamelhub/camel-ui';

import { AppDownloadBanner } from '@components/UI/organisms';
import { Header } from '@components/UI/molecules';

import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';

import { checkAgent } from '@utils/common';

function ProductInquiryHeader() {
  const router = useRouter();

  return (
    <>
      {!checkAgent.isMobileApp() && (
        <Box
          customStyle={{
            minHeight: APP_DOWNLOAD_BANNER_HEIGHT
          }}
        >
          <AppDownloadBanner description="앱에서는 판매자와 바로 채팅할 수 있어요!" />
        </Box>
      )}
      <Header
        leftIcon={
          <Box
            onClick={() => router.back()}
            customStyle={{
              padding: 16
            }}
          >
            <Icon name="Arrow1BackOutlined" />
          </Box>
        }
        hideTitle
        showRight={false}
        isTransparent
      />
    </>
  );
}

export default ProductInquiryHeader;
