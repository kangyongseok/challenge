import { useRouter } from 'next/router';
import { Alert, Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';

import type { Announce } from '@dto/user';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

interface NoticeProps {
  data?: Announce[];
}

function MypageNotice({ data }: NoticeProps) {
  const router = useRouter();
  const {
    theme: { palette }
  } = useTheme();

  const handleClick = (id: number) => {
    logEvent(attrKeys.mypage.CLICK_ANNOUNCE_DETAIL, {
      name: 'MY',
      att: id
    });

    router.push(`/announces/${id}`);
  };

  return (
    <Box
      customStyle={{
        padding: '32px 0 24px 0',
        borderBottom: `1px solid ${palette.common.grey['90']}`
      }}
    >
      <Typography
        variant="h4"
        weight="bold"
        customStyle={{ color: palette.common.grey['20'], marginBottom: 16 }}
      >
        공지사항
      </Typography>
      <Flexbox gap={8} direction="vertical">
        {data?.map((notice) => (
          <Alert
            key={`mypage-notice-${notice.id}`}
            brandColor="primary-bgLight"
            onClick={() => handleClick(notice.id)}
          >
            <Flexbox alignment="center" customStyle={{ height: 42, padding: '0 20px' }}>
              <Typography variant="small1" weight="medium" customStyle={{ marginRight: 'auto' }}>
                {notice.title}
              </Typography>
              <Typography variant="small2" customStyle={{ color: palette.common.grey['60'] }}>
                {notice.datePosted.split(' ')[0]}
              </Typography>
              <Icon
                customStyle={{ marginLeft: 9, color: palette.common.grey['40'] }}
                name="CaretRightOutlined"
                size="small"
              />
            </Flexbox>
          </Alert>
        ))}
      </Flexbox>
    </Box>
  );
}

export default MypageNotice;
