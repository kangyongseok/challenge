import { useRouter } from 'next/router';
import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import Image from '@components/UI/atoms/Image';

import type { UserNoti } from '@dto/user';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import { getFormattedDistanceTime } from '@utils/formats';

interface UserNotificationItemProps {
  notification: UserNoti;
  type: 'userNoti' | 'honeyNoti';
}

function UserNotificationItem({ notification, type }: UserNotificationItemProps) {
  const {
    theme: { palette }
  } = useTheme();
  const router = useRouter();

  return (
    <Flexbox
      onClick={() => {
        if (type === 'userNoti') {
          logEvent(attrKeys.noti.CLICK_BEHAVIOR, {
            id: notification.id,
            targetId: notification.targetId,
            type: notification.type,
            keyword: notification.keyword
          });
        }
        if (type === 'honeyNoti') {
          logEvent(attrKeys.noti.CLICK_PRODUCT_DETAIL, {
            name: 'HONEYNOTI_LIST',
            id: notification.id,
            targetId: notification.targetId,
            type: notification.type,
            keyword: notification.keyword
          });
        }
        if (notification.parameter) {
          router.push(notification.parameter);
        }
      }}
    >
      {type === 'honeyNoti' && (
        <Box
          customStyle={{
            marginRight: 16,
            minWidth: 48
          }}
        >
          <Image
            src={notification.image ?? ''}
            width={48}
            height={48}
            disableAspectRatio
            alt="Notification Img"
            style={{ borderRadius: '50%' }}
          />
        </Box>
      )}
      <Flexbox
        direction="vertical"
        gap={4}
        onClick={() => {
          return false;
        }}
      >
        <Typography variant="body1" dangerouslySetInnerHTML={{ __html: notification.message }} />
        <Typography variant="small2" customStyle={{ color: palette.common.grey[60] }}>
          {getFormattedDistanceTime(new Date(notification.dateCreated.replace(/-/g, '/')))}
        </Typography>
      </Flexbox>
    </Flexbox>
  );
}

export default UserNotificationItem;
