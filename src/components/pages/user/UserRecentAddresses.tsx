import type { MouseEvent } from 'react';
import { Dispatch, SetStateAction } from 'react';

import { Button, Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';

interface UserRecentAddressesProps {
  recentAddresses: string[];
  setAddress: Dispatch<SetStateAction<string>>;
}

function UserRecentAddresses({ recentAddresses, setAddress }: UserRecentAddressesProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const handleClickUpdateToRecentAddress = async (event: MouseEvent<HTMLButtonElement>) => {
    const { address: nextAddress } = event.currentTarget.dataset;
    setAddress(nextAddress as string);
  };

  return (
    <Flexbox component="section" direction="vertical" gap={8}>
      <Typography variant="h4" weight="bold" customStyle={{ color: common.ui80 }}>
        최근 설정한 내 위치
      </Typography>
      {recentAddresses.slice(0, 5).map((address) => (
        <Flexbox
          key={`recent-address-${encodeURIComponent(address)}`}
          alignment="center"
          justifyContent="space-between"
          customStyle={{ padding: '2px 0' }}
        >
          <Typography variant="h4">{address}</Typography>
          <Button
            variant="ghost"
            brandColor="black"
            size="small"
            data-address={address}
            onClick={handleClickUpdateToRecentAddress}
          >
            선택
          </Button>
        </Flexbox>
      ))}
    </Flexbox>
  );
}

export default UserRecentAddresses;
