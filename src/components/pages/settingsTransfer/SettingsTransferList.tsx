import { useRecoilValue } from 'recoil';
import { Avatar, Box, Chip, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';

import { fetchTransfers } from '@api/user';

import queryKeys from '@constants/queryKeys';

import { settingsTransferPlatformsState } from '@recoil/settingsTransfer';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function SettingsTransferList() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const platforms = useRecoilValue(settingsTransferPlatformsState);

  const { data: accessUser } = useQueryAccessUser();

  const { data: { userTransfers = [] } = {} } = useQuery(
    queryKeys.users.transfers(),
    () => fetchTransfers(),
    {
      refetchOnMount: true,
      enabled: !!accessUser
    }
  );

  return (
    <Box
      component="section"
      customStyle={{
        marginTop: 52
      }}
    >
      {userTransfers.length > 0 && (
        <Typography
          weight="bold"
          customStyle={{
            color: common.ui80
          }}
        >
          신청 플랫폼
        </Typography>
      )}
      <Flexbox
        direction="vertical"
        gap={12}
        customStyle={{
          marginTop: 12
        }}
      >
        {userTransfers.map(({ id, siteId, url, status, description }) => (
          <Flexbox
            key={`user-transfer-platform-${id}`}
            alignment="center"
            justifyContent="space-between"
            gap={12}
            customStyle={{
              padding: '14px 12px',
              borderRadius: 8,
              backgroundColor: common.bg03
            }}
          >
            <Flexbox
              direction="vertical"
              gap={2}
              customStyle={{
                overflow: 'hidden'
              }}
            >
              <Flexbox gap={4}>
                <Avatar
                  width={20}
                  height={20}
                  src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${siteId}.png`}
                  alt="플랫폼 아이콘"
                  round={4}
                />
                <Typography weight="medium">
                  {(platforms.find(({ id: platformId }) => platformId === siteId) || {}).name}
                </Typography>
              </Flexbox>
              <Typography
                variant="body3"
                noWrap
                customStyle={{
                  color: common.ui60
                }}
              >
                {url}
              </Typography>
              {description && status === 2 && (
                <Typography
                  variant="body3"
                  customStyle={{
                    color: common.ui60
                  }}
                >
                  {description}
                </Typography>
              )}
            </Flexbox>
            {status === 0 && (
              <Chip
                variant="ghost"
                brandColor="primary"
                size="small"
                isRound={false}
                customStyle={{
                  whiteSpace: 'nowrap'
                }}
              >
                등록중
              </Chip>
            )}
            {status === 1 && (
              <Chip
                variant="solid"
                brandColor="black"
                size="small"
                isRound={false}
                customStyle={{
                  whiteSpace: 'nowrap'
                }}
              >
                완료
              </Chip>
            )}
            {status === 2 && (
              <Chip
                variant="ghost"
                brandColor="red"
                size="small"
                isRound={false}
                customStyle={{
                  whiteSpace: 'nowrap',
                  background: '#FFE5E8'
                }}
              >
                실패
              </Chip>
            )}
          </Flexbox>
        ))}
      </Flexbox>
    </Box>
  );
}

export default SettingsTransferList;
