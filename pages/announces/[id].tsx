import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Alert, Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import AnnounceDetail from '@components/pages/announces/AnnounceDetail';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';

function AnnouncePage() {
  const { data: userInfo } = useQuery(queryKeys.users.userInfo(), fetchUserInfo);
  const { query } = useRouter();

  const {
    theme: { palette }
  } = useTheme();

  const announce = userInfo?.announces.find((announceData) => String(announceData.id) === query.id);

  if (!announce) {
    return null;
  }

  return (
    <GeneralTemplate disablePadding header={<Header closeIcon="CloseOutlined" />}>
      <Box component="section">
        <Alert
          round="16"
          customStyle={{
            padding: '12px 24px',
            margin: '8px 20px 24px'
          }}
        >
          <Typography variant="h3" weight="medium" color={palette.common.grey[20]}>
            {announce.title}
          </Typography>
          <Typography
            variant="body2"
            color={palette.common.grey[20]}
            customStyle={{
              textAlign: 'right'
            }}
          >
            {dayjs(announce.datePosted).format('YYYY.M.D')}
          </Typography>
        </Alert>
        <Flexbox gap={32} direction="vertical">
          {announce.announceDetails.map((announceDetail) => (
            <AnnounceDetail
              key={`announce-detail-${announceDetail.id}`}
              announceDetail={announceDetail}
            />
          ))}
        </Flexbox>
      </Box>
    </GeneralTemplate>
  );
}

export default AnnouncePage;
