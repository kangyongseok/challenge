import type { MouseEvent } from 'react';

import { Button, Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

interface RecentAddressesProps {
  recentAddresses: string[];
  onClickButton: (e: MouseEvent<HTMLButtonElement>) => void;
}

function RecentAddresses({ recentAddresses, onClickButton }: RecentAddressesProps) {
  return (
    <RecentPlaceLists>
      <Typography variant="h4" weight="bold">
        최근 설정한 내 위치
      </Typography>
      <Flexbox
        direction="vertical"
        gap={8}
        customStyle={{
          paddingTop: 13
        }}
      >
        {recentAddresses.map((address) => (
          <Flexbox
            key={`recent-address-${encodeURIComponent(address)}`}
            justifyContent="space-between"
          >
            <Typography variant="body1">{address}</Typography>
            <Button
              variant="ghost"
              brandColor="black"
              size="small"
              data-address={address}
              onClick={onClickButton}
            >
              선택
            </Button>
          </Flexbox>
        ))}
      </Flexbox>
    </RecentPlaceLists>
  );
}

const RecentPlaceLists = styled.div`
  border-top: ${({ theme: { palette } }) => palette.common.grey['90']};
  margin: 40px 0 92px 0;
  padding-top: 32px;
`;

export default RecentAddresses;
