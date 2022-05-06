import React from 'react';
import { useTheme, Alert, Avatar, Box, Flexbox, Typography } from 'mrcamel-ui';

function MainProductDealAlert() {
  const {
    theme: { palette }
  } = useTheme();

  return (
    <Box
      component="section"
      customStyle={{
        marginTop: 24
      }}
    >
      <Alert brandColor="common-grey-light">
        <Box
          customStyle={{
            padding: '16px 24px'
          }}
        >
          <Flexbox alignment="center" justifyContent="space-between">
            <Typography weight="bold" customColor={palette.common.grey['40']}>
              카멜을 통해서 득템했어요
            </Typography>
            <Typography variant="small2" customColor={palette.common.grey['60']}>
              30분 전
            </Typography>
          </Flexbox>
          <Flexbox
            gap={6}
            alignment="center"
            customStyle={{
              marginTop: 4
            }}
          >
            <Avatar
              width={20}
              height={203}
              src="https://mrcamel.s3.ap-northeast-2.amazonaws.com/assets/images/platforms/101.png"
              alt="Platform Img"
            />
            <Typography variant="body2">73958님 상태좋은 루이비통 포쉐트 200만원</Typography>
          </Flexbox>
        </Box>
      </Alert>
    </Box>
  );
}

export default MainProductDealAlert;
