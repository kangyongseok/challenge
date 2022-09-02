import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Alert, Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import AnnounceDetail from '@components/pages/announces/AnnounceDetail';

import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function AnnouncePage() {
  const {
    theme: { palette }
  } = useTheme();
  const { query, back } = useRouter();
  const { data: userInfo } = useQuery(queryKeys.users.userInfo(), fetchUserInfo);

  const announce = userInfo?.announces.find((announceData) => String(announceData.id) === query.id);

  const handleClickClose = () => {
    logEvent(attrKeys.header.CLICK_CLOSE, {
      name: attrProperty.productName.ANNOUNCE_DETAIL
    });
    back();
  };

  if (!announce) {
    return null;
  }

  return (
    <GeneralTemplate
      disablePadding
      header={
        <Header
          rightIcon={
            <Flexbox
              justifyContent="center"
              alignment="center"
              onClick={handleClickClose}
              customStyle={{
                padding: 16,
                maxHeight: 56,
                cursor: 'pointer'
              }}
            >
              <Icon name="CloseOutlined" />
            </Flexbox>
          }
        />
      }
    >
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
