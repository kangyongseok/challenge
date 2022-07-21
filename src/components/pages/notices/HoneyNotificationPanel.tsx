import { Fragment, useEffect } from 'react';

import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Alert, Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import { fetchUserHoneyNoti, fetchUserNoti } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

import UserNotificationItem from './UserNotificationItem';

function HoneyNotificationPanel() {
  const { data: userHoneyNoti } = useQuery(queryKeys.users.userHoneyNoti(), () =>
    fetchUserHoneyNoti()
  );
  const { data: userNoti } = useQuery(queryKeys.users.userNoti(1), () => fetchUserNoti(1));
  const { data: accessUser } = useQueryAccessUser();

  const router = useRouter();
  const {
    theme: { palette }
  } = useTheme();

  useEffect(() => {
    logEvent(attrKeys.noti.VIEW_HONEYNOTI_LIST);
  }, []);

  if (!userHoneyNoti || !userNoti) {
    return null;
  }

  if (userHoneyNoti.content.length > 0) {
    return (
      <Box
        customStyle={{
          marginTop: 16
        }}
      >
        <Alert
          brandColor="primary-highlight"
          customStyle={{
            padding: '10px 20px',
            marginBottom: 24
          }}
          onClick={() => {
            logEvent(attrKeys.noti.CLICK_HONEYNOTI_MANAGE, {
              name: 'HONEYNOTI_LIST',
              title: 'BANNER'
            });
            router.push('/');
          }}
        >
          <Flexbox justifyContent="space-between" alignment="center">
            <Typography variant="body2">{accessUser?.userName ?? ''}님 꿀매리스트</Typography>
            <Icon name="CaretRightOutlined" size="small" />
          </Flexbox>
        </Alert>

        <Flexbox
          direction="vertical"
          gap={24}
          customStyle={{
            paddingBottom: 40
          }}
        >
          {userNoti.content?.map((notification, idx) => (
            <Fragment key={`user-honey-noti-${notification.id}`}>
              <UserNotificationItem type="honeyNoti" notification={notification} />
              {idx !== userNoti.content.length - 1 && (
                <Box
                  customStyle={{
                    borderTop: `1px solid ${palette.common.grey[90]}`
                  }}
                />
              )}
            </Fragment>
          ))}
        </Flexbox>
      </Box>
    );
  }
  return <div />;
}

export default HoneyNotificationPanel;
