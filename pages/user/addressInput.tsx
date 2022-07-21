import { useEffect, useState } from 'react';

import { useMutation, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, CtaButton, Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { UserAddressSetting } from '@components/pages/user';

import { logEvent } from '@library/amplitude';

import { fetchUserInfo, postArea } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

function AddressInput() {
  const [address, setAddress] = useState('');

  const isSubmittable = address !== '';
  const { isLoading, mutate } = useMutation(postArea);
  const [recentAddresses, setRecentAddresses] = useState<string[]>([]);
  const { data: userInfo, refetch } = useQuery(queryKeys.users.userInfo(), fetchUserInfo);

  const router = useRouter();
  const searchMode = router.query.searchMode === 'true';

  useEffect(() => {
    logEvent(attrKeys.userInput.VIEW_PERSONAL_INPUT, { name: 'ADDRESS' });
  }, []);

  useEffect(() => {
    if (userInfo && userInfo.area.values.length) {
      setAddress(userInfo.area.values.filter((area) => area.isActive)[0].areaName);

      setRecentAddresses(
        userInfo.area.values
          .filter((area) => !area.isActive)
          .map((area) => area.areaName)
          .reverse()
      );
    }
  }, [userInfo]);

  const handleClickSave = () => {
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

  return (
    <GeneralTemplate
      header={<Header type="onlyBack" />}
      footer={
        <Footer isSearchMode={searchMode}>
          <CtaButton
            fullWidth
            variant="contained"
            size="large"
            disabled={!isSubmittable || isLoading || searchMode}
            brandColor="primary"
            onClick={handleClickSave}
          >
            {!isSubmittable || isLoading ? '저장' : '저장할게요!'}
          </CtaButton>
        </Footer>
      }
    >
      <Box
        component="section"
        customStyle={{
          marginTop: 32
        }}
      >
        <Flexbox
          customStyle={{
            textAlign: 'center'
          }}
          direction="vertical"
          gap={6}
        >
          <Typography variant="h3" weight="bold" brandColor="black">
            위치를 알려주세요.
          </Typography>
          <Typography weight="regular">
            당근마켓 포함 내 주변 매물을 보시려면
            <br />
            위치정보가 필요해요.
          </Typography>
        </Flexbox>
        <UserAddressSetting
          address={address}
          setAddress={setAddress}
          recentAddresses={recentAddresses}
        />
      </Box>
    </GeneralTemplate>
  );
}

const Footer = styled.footer<{ isSearchMode: boolean }>`
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 20px 20px 24px;
  background-color: white;
  display: ${({ isSearchMode }) => (isSearchMode ? 'none' : 'block')};
`;

export default AddressInput;
