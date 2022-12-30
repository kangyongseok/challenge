import { useRouter } from 'next/router';
import { Typography } from 'mrcamel-ui';

import { MyShopAppDownloadDialog } from '@components/UI/organisms';
import { CamelSellerFloatingButton, Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  UserShopProductDeleteConfirmDialog,
  UserShopProductList,
  UserShopProductManageBottomSheet,
  UserShopTabs
} from '@components/pages/userShop';

function UserShop() {
  const router = useRouter();
  return (
    <>
      <GeneralTemplate
        header={
          <Header onClickLeft={() => router.replace('/mypage')}>
            <Typography variant="h3" weight="bold" customStyle={{ textAlign: 'center' }}>
              내 상점
            </Typography>
          </Header>
        }
      >
        <UserShopTabs />
        <UserShopProductList />
      </GeneralTemplate>
      <UserShopProductManageBottomSheet />
      <UserShopProductDeleteConfirmDialog />
      <MyShopAppDownloadDialog />
      <CamelSellerFloatingButton source="MYSHOP" />
    </>
  );
}

export default UserShop;
