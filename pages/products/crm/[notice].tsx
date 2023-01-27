import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';
import { Box, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { BottomNavigation, Header } from '@components/UI/molecules';
import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ProductsFilter,
  ProductsFilterBottomSheet,
  ProductsInfiniteGrid,
  ProductsLegitFilterBottomSheet,
  ProductsOrderFilterBottomSheet,
  ProductsRelated,
  ProductsStatus,
  ProductsTopButton
} from '@components/pages/products';

import Initializer from '@library/initializer';

import {
  APP_DOWNLOAD_BANNER_HEIGHT,
  APP_TOP_STATUS_HEIGHT,
  HEADER_HEIGHT,
  locales
} from '@constants/common';
import attrProperty from '@constants/attrProperty';

import { getCookies } from '@utils/cookies';
import { isExtendedLayoutIOSVersion } from '@utils/common';

import { showAppDownloadBannerState } from '@recoil/common';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';

function CrmProducts() {
  const {
    query: { notice }
  } = useRouter();

  const { userNickName } = useQueryMyUserInfo();
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  return (
    <>
      <GeneralTemplate
        header={
          <Box
            customStyle={{ paddingTop: isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0 }}
          >
            <Header />
            {notice && (
              <NoticeWrapper showAppDownloadBanner={showAppDownloadBanner}>
                <Typography variant="h4" weight="bold">
                  {userNickName}님
                </Typography>
                <Typography variant="h4" weight="bold" brandColor="primary">
                  {notice}
                </Typography>
              </NoticeWrapper>
            )}
          </Box>
        }
        footer={<BottomNavigation disableHideOnScroll={false} />}
        disablePadding
      >
        <ProductsFilter variant="search" showDynamicFilter />
        <Gap height={8} />
        <ProductsStatus />
        <ProductsInfiniteGrid variant="search" name={attrProperty.productName.CRM} />
        <Gap height={8} />
        <ProductsRelated />
      </GeneralTemplate>
      <ProductsTopButton />
      <ProductsFilterBottomSheet variant="search" />
      <ProductsOrderFilterBottomSheet />
      <ProductsLegitFilterBottomSheet />
    </>
  );
}

export async function getServerSideProps({
  req,
  locale,
  defaultLocale = locales.ko.lng
}: GetServerSidePropsContext) {
  Initializer.initABTestIdentifierByCookie(getCookies({ req }));
  return {
    props: {
      ...(await serverSideTranslations(locale || defaultLocale))
    }
  };
}

const NoticeWrapper = styled.div<{ showAppDownloadBanner: boolean }>`
  display: flex;
  flex-direction: column;
  padding: 8px 20px 16px 20px;
  width: 100%;
  z-index: ${({ theme }) => theme.zIndex.header};
  background-color: ${({ theme }) => theme.palette.common.uiWhite};
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT + HEADER_HEIGHT : HEADER_HEIGHT}px;
`;

export default CrmProducts;
