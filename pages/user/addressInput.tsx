import { useCallback, useEffect, useState } from 'react';

import { QueryClient, dehydrate, useMutation } from 'react-query';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import { Button, Flexbox, Switch, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import Header from '@components/UI/molecules/Header';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { UserAddressSetting, UserRecentAddresses } from '@components/pages/user';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { postArea } from '@api/user';

import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';

import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';

function AddressInput() {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: myUserInfo, refetch } = useQueryMyUserInfo();
  const { isLoading: isLoadingMutatePostArea, mutate } = useMutation(postArea);

  const [recentAddresses, setRecentAddresses] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [publicAddressOnShop, setPublicAddressOnShop] = useState(false);

  const isSearchMode = router.query.searchMode === 'true';
  const isSubmittable = address !== '';

  useEffect(() => {
    if (publicAddressOnShop !== myUserInfo?.info.value.isAreaOpen) {
      setPublicAddressOnShop(!!myUserInfo?.info.value.isAreaOpen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myUserInfo?.info.value.isAreaOpen]);

  const handleClickSave = () => {
    if (isLoadingMutatePostArea) return;

    if (isSubmittable) {
      mutate(
        { name: address },
        {
          onSuccess: () => {
            refetch();
            logEvent(attrKeys.userInput.SUBMIT_PERSONAL_INPUT, { name: 'ADDRESS', title: 'INPUT' });
            router.back();
          }
        }
      );
    }
  };

  const handleChangeSwitch = useCallback(() => {
    if (isLoadingMutatePostArea) return;

    mutate(
      { isAreaOpen: !publicAddressOnShop },
      {
        onSuccess: () => {
          refetch();
          setPublicAddressOnShop(!publicAddressOnShop);
        }
      }
    );
  }, [isLoadingMutatePostArea, mutate, publicAddressOnShop, refetch]);

  useEffect(() => {
    logEvent(attrKeys.userInput.VIEW_PERSONAL_INPUT, { name: 'ADDRESS' });
  }, []);

  useEffect(() => {
    if (myUserInfo?.area.values.length) {
      setAddress(myUserInfo.area.values.filter((area) => area.isActive)[0].areaName);
      setRecentAddresses(
        myUserInfo.area.values
          .filter((area) => !area.isActive)
          .map((area) => area.areaName)
          .reverse()
      );
    }
  }, [myUserInfo]);

  return (
    <GeneralTemplate
      header={<Header showRight={false} hideTitle />}
      footer={
        <Footer isSearchMode={isSearchMode}>
          <Button
            fullWidth
            variant="solid"
            size="xlarge"
            disabled={!isSubmittable || isLoadingMutatePostArea || isSearchMode}
            brandColor="primary"
            onClick={handleClickSave}
          >
            저장
          </Button>
        </Footer>
      }
      disablePadding
    >
      <Flexbox direction="vertical" gap={32} customStyle={{ flex: 1, padding: '20px 20px 144px' }}>
        <Flexbox component="section" direction="vertical" alignment="center" gap={4}>
          <Typography variant="h2" weight="bold" brandColor="black">
            위치를 알려주세요
          </Typography>
          <Typography variant="body1" customStyle={{ color: common.ui60 }}>
            당근마켓 포함, 주변매물만 볼 수 있어요.
          </Typography>
        </Flexbox>
        <UserAddressSetting isSearchMode={isSearchMode} address={address} setAddress={setAddress} />
        {!isSearchMode && (
          <>
            {recentAddresses.length > 0 && (
              <UserRecentAddresses recentAddresses={recentAddresses} setAddress={setAddress} />
            )}
            {address.length > 0 && (
              <PublicAddressOnShopBanner>
                <Typography variant="h4" weight="medium">
                  거래지역 상점에 공개
                </Typography>
                <Switch checked={publicAddressOnShop} onChange={handleChangeSwitch} />
              </PublicAddressOnShopBanner>
            )}
          </>
        )}
      </Flexbox>
    </GeneralTemplate>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const queryClient = new QueryClient();

  Initializer.initAccessTokenByCookies(getCookies({ req }));
  const accessUser = Initializer.initAccessUserInQueryClientByCookies(
    getCookies({ req }),
    queryClient
  );

  if (!accessUser) {
    return {
      redirect: {
        destination: '/login?returnUrl=/user/addressInput&isRequiredLogin=true',
        permanent: false
      }
    };
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

const Footer = styled.footer<{ isSearchMode: boolean }>`
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 20px;
  background-color: ${({ theme: { palette } }) => palette.common.uiWhite};
  display: ${({ isSearchMode }) => (isSearchMode ? 'none' : 'block')};
`;

const PublicAddressOnShopBanner = styled.section`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: ${({ theme: { palette } }) => palette.common.bg03};
  border-radius: 8px;
`;

export default AddressInput;
