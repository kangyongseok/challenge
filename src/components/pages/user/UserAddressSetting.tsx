import type { Dispatch, FocusEvent, SetStateAction } from 'react';

import type { Address } from 'react-daum-postcode';
import DaumPostcode from 'react-daum-postcode';
import { useRouter } from 'next/router';
import { Box } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import UserAddressDisplay from './UserAddressDisplay';

interface UserAddressSettingProps {
  address: string;
  recentAddresses: string[];
  setAddress: Dispatch<SetStateAction<string>>;
}

function UserAddressSetting({ address, setAddress, recentAddresses }: UserAddressSettingProps) {
  const router = useRouter();
  const searchMode = router.query.searchMode === 'true';

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
    <Box
      component="section"
      customStyle={{
        marginTop: 32
      }}
    >
      <Box
        customStyle={{
          marginTop: 24
        }}
      >
        {searchMode ? (
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
          <UserAddressDisplay
            address={address}
            setAddress={setAddress}
            recentAddresses={recentAddresses}
            onFocusSearchBar={handleFocusSearchBar}
          />
        )}
      </Box>
    </Box>
  );
}

export default UserAddressSetting;
