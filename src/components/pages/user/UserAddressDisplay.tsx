import type { Dispatch, FocusEvent, MouseEvent, SetStateAction } from 'react';

import { Box, Flexbox, Icon, Typography } from 'mrcamel-ui';

import SearchBar from '@components/UI/molecules/SearchBar';

import RecentAddresses from './RecentAddresses';

interface UserAddressDisplayProps {
  address: string;
  recentAddresses: string[];
  setAddress: Dispatch<SetStateAction<string>>;
  onFocusSearchBar: (event: FocusEvent<HTMLInputElement>) => void;
}

function UserAddressDisplay({
  address,
  setAddress,
  recentAddresses,
  onFocusSearchBar
}: UserAddressDisplayProps) {
  const handleClickUpdateToRecentAddress = async (event: MouseEvent<HTMLButtonElement>) => {
    const { address: nextAddress } = event.currentTarget.dataset;
    setAddress(nextAddress as string);
  };

  return (
    <Box key="SearchBar">
      <SearchBar
        fullWidth
        startIcon={<Icon name="SearchOutlined" color="primary" />}
        placeholder="예) 카멜구 혹은 카멜동12-3"
        customStyle={{
          width: '100%'
        }}
        onFocus={onFocusSearchBar}
      />
      <Flexbox
        justifyContent="center"
        customStyle={{ marginTop: recentAddresses.length > 0 ? 40 : 130 }}
      >
        {address === '' ? (
          <Typography variant="h2" weight="bold" customStyle={{ textAlign: 'center' }}>
            📍
            <br />
            아직 설정하신
            <br />
            위치가 없어요.
          </Typography>
        ) : (
          <Flexbox gap={16} direction="vertical">
            <Box>
              {address.split(' ').map((districtName) => (
                <Typography
                  variant="h2"
                  weight="bold"
                  customStyle={{ textAlign: 'center' }}
                  key={`address-district-${districtName}`}
                >
                  {districtName} <br />
                </Typography>
              ))}
            </Box>
            <Typography variant="body1" customStyle={{ textAlign: 'center' }}>
              검색하신 주소로 설정된 위치입니다.
            </Typography>
          </Flexbox>
        )}
      </Flexbox>
      {recentAddresses.length > 0 && (
        <RecentAddresses
          recentAddresses={recentAddresses}
          onClickButton={handleClickUpdateToRecentAddress}
        />
      )}
    </Box>
  );
}

export default UserAddressDisplay;
