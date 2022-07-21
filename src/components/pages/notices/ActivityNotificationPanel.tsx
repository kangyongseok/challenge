import React, { useEffect, useState } from 'react';

import { useQuery } from 'react-query';
import { Alert, Box, CtaButton, Dialog, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { fetchUserNoti } from '@api/user';
import { fetchDashboard } from '@api/dashboard';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import UserNotificationItem from './UserNotificationItem';

function ActivityNotificationPanel() {
  const { data } = useQuery(queryKeys.users.userNoti(0), () => fetchUserNoti(0));
  const { data: dashboard } = useQuery(queryKeys.dashboard.all, () => fetchDashboard());
  const [showDialog, setShowDialog] = useState(false);

  const {
    theme: { palette }
  } = useTheme();

  useEffect(() => {
    logEvent(attrKeys.noti.VIEW_BEHAVIOR_LIST);
  }, []);

  if (!data) {
    return null;
  }

  return (
    <Box
      customStyle={{
        marginTop: 16
      }}
    >
      <Alert
        round="16"
        customStyle={{
          padding: '16px 24px',
          marginBottom: 24
        }}
      >
        <Flexbox justifyContent="space-between">
          <Flexbox direction="vertical">
            <Flexbox justifyContent="space-between" alignment="center">
              <Typography weight="bold" variant="h4" color={palette.common.grey['20']}>
                {dashboard?.theme.personalCount.toLocaleString() ?? 0}명
              </Typography>
              <DialogToggle
                onClick={() => {
                  setShowDialog(true);
                }}
              >
                ?
              </DialogToggle>
            </Flexbox>
            <Typography variant="body2" color={palette.common.grey['20']}>
              명품 취향을 알려줬어요!
            </Typography>
          </Flexbox>
          <Box
            customStyle={{
              height: 40,
              width: 1,
              backgroundColor: palette.common.grey['80']
            }}
          />
          <Flexbox direction="vertical">
            <Typography weight="bold" variant="h4" color={palette.common.grey['20']}>
              {dashboard?.theme.productCount.toLocaleString() ?? 0}번
            </Typography>
            <Typography variant="body2" color={palette.common.grey['20']}>
              꿀매물 득템하러 갔어요!
            </Typography>
          </Flexbox>
        </Flexbox>
      </Alert>
      <Flexbox
        direction="vertical"
        gap={18}
        customStyle={{
          paddingBottom: 40
        }}
      >
        {data.content?.map((notification, idx) => (
          <React.Fragment key={`user-noti-${notification.id}`}>
            <UserNotificationItem type="userNoti" notification={notification} />
            {idx !== data.content.length - 1 && (
              <Box
                customStyle={{
                  borderTop: `1px solid ${palette.common.grey['90']}`
                }}
              />
            )}
          </React.Fragment>
        ))}
      </Flexbox>
      <Dialog
        open={showDialog}
        onClose={() => {
          setShowDialog(false);
        }}
      >
        <Box
          customStyle={{
            padding: '8px 0'
          }}
        >
          <Typography
            variant="h3"
            weight="bold"
            customStyle={{
              padding: '8px 0'
            }}
          >
            ✍🏻맞춤형 추천이란?
          </Typography>
          <Typography
            variant="body2"
            customStyle={{
              padding: '8px 0'
            }}
          >
            •고객님이 관심을 표현한 브랜드, 많이 찾아본 상품을 기반으로 취향에 꼭 맞는 매물들을
            찾아드려요
          </Typography>
          <Typography
            variant="body2"
            customStyle={{
              padding: '8px 0'
            }}
          >
            •카멜을 더 많이 사용하실수록 더 정확한 추천을 해드릴 수 있어요!
          </Typography>
          <CtaButton
            fullWidth
            onClick={() => {
              setShowDialog(false);
            }}
          >
            확인했어요
          </CtaButton>
        </Box>
      </Dialog>
    </Box>
  );
}

const DialogToggle = styled.button`
  color: white;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 100%;
  font-size: 12px;
  background-color: ${({ theme }) => theme.palette.common.grey[80]};
`;

export default ActivityNotificationPanel;
