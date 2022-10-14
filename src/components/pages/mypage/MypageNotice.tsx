import { useMemo } from 'react';

import { useRouter } from 'next/router';
import { Alert, Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import type { Announce } from '@dto/user';

import { logEvent } from '@library/amplitude';

import { PRODUCT_SELLER } from '@constants/camelSeller';
import attrKeys from '@constants/attrKeys';

import useQueryUserInfo from '@hooks/useQueryUserInfo';

interface NoticeProps {
  data?: Announce[];
}

function MypageNotice({ data }: NoticeProps) {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: { roles = [] } = {} } = useQueryUserInfo();

  const hasProductCreateRole = useMemo(
    () => roles.some((role) => role === PRODUCT_SELLER),
    [roles]
  );

  const handleClick = (id: number) => {
    logEvent(attrKeys.mypage.CLICK_ANNOUNCE_DETAIL, {
      name: 'MY',
      att: id
    });

    router.push(`/announces/${id}`);
  };
  return (
    <>
      {!hasProductCreateRole && <Divider />}
      <Box
        customStyle={{
          // padding: hasProductCreateRole ? '52px 0 24px 0' : '20px 0 24px 0',
          padding: '20px 0 24px 0',
          borderBottom: `1px solid ${common.ui90}`
        }}
      >
        <Typography
          variant="h4"
          weight="bold"
          customStyle={{ color: common.ui20, marginBottom: 16 }}
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
                <Typography variant="small2" customStyle={{ color: common.ui60 }}>
                  {notice.datePosted.split(' ')[0]}
                </Typography>
                <Icon
                  customStyle={{ marginLeft: 9, color: common.ui60 }}
                  name="CaretRightOutlined"
                  size="small"
                />
              </Flexbox>
            </Alert>
          ))}
        </Flexbox>
      </Box>
    </>
  );
}

const Divider = styled.hr`
  width: calc(100% + 40px);
  height: 7px;
  margin: 0 -20px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui90};
`;

export default MypageNotice;
