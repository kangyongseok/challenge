import type { Dispatch, FocusEvent, SetStateAction } from 'react';

import type { Address } from 'react-daum-postcode';
import DaumPostcode from 'react-daum-postcode';
import { useRouter } from 'next/router';
import { Box, Icon, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import SearchBar from '@components/UI/molecules/SearchBar';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

interface UserAddressSettingProps {
  isSearchMode: boolean;
  address: string;
  setAddress: Dispatch<SetStateAction<string>>;
}

function UserAddressSetting({ isSearchMode, address, setAddress }: UserAddressSettingProps) {
  const router = useRouter();

  const handleFocusSearchBar = (e: FocusEvent<HTMLInputElement>) => {
    e.preventDefault();

    logEvent(attrKeys.userInput.CLICK_PERSONAL_INPUT, { name: 'ADDRESS', title: 'SEARCH' });

    router.push('/user/addressInput?searchMode=true');
  };

  const handleComplete = (response: Address) => {
    const nextAddress = `${response.sido} ${response.sigungu} ${response.bname}`;

    logEvent(attrKeys.userInput.SELECT_ITEM, {
      name: 'ADDRESS',
      title: 'SEARCH',
      att: nextAddress
    });

    setAddress(nextAddress);
    router.back();
  };

  return (
    <Box component="section">
      {isSearchMode ? (
        <Box customStyle={{ height: 470 }} key="UserAddressSearch">
          <DaumPostcode
            onComplete={handleComplete}
            theme={{ bgColor: '#ffffff' }}
            hideMapBtn
            submitMode={false}
            shorthand={false}
            maxSuggestItems={5}
            style={{ height: '100%' }}
          />
        </Box>
      ) : (
        <>
          <SearchBar
            fullWidth
            placeholder="카멜구 혹은 카멜동12-3"
            onFocus={handleFocusSearchBar}
            startAdornment={
              <Icon name="SearchOutlined" color="black" customStyle={{ width: 20, height: 20 }} />
            }
            customStyle={{
              '& > div': { padding: 0, zIndex: 0 },
              '& > div > div': { height: 48, gap: 8 }
            }}
          />
          {address === '' ? (
            <Typography
              variant="h1"
              weight="bold"
              customStyle={{ padding: '84px 0', textAlign: 'center' }}
            >
              📍
              <br />
              아직 설정하신
              <br />
              위치가 없어요.
            </Typography>
          ) : (
            <Address variant="h1" weight="bold">
              {address
                .split(' ')
                .map((districtName) => districtName)
                .join('\n')}
            </Address>
          )}
        </>
      )}
    </Box>
  );
}

const Address = styled(Typography)`
  padding: 52px 0 84px;
  white-space: pre-wrap;
  word-break: break-all;
  text-align: center;
`;

export default UserAddressSetting;
