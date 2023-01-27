import { Box, Flexbox, Image, Typography } from 'mrcamel-ui';

import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';

function MypageAlarmSettingOff() {
  const { userNickName } = useQueryMyUserInfo();

  return (
    <Flexbox
      direction="vertical"
      justifyContent="center"
      alignment="center"
      customStyle={{ height: '100%' }}
    >
      <Flexbox justifyContent="center" alignment="center">
        <Image
          alt="알림 활성화 유도 이미지"
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/my/noti_active.png`}
          disableAspectRatio
          customStyle={{ maxWidth: 250 }}
        />
      </Flexbox>
      <Box customStyle={{ textAlign: 'center' }}>
        <Typography variant="h2" weight="bold" customStyle={{ marginBottom: 8 }}>
          알림이 꺼져있어요😥
        </Typography>
        <Typography>설정에서 알림을 켜주시고</Typography>
        <Typography>{userNickName}님을 위한 소식을 받아보세요!</Typography>
      </Box>
    </Flexbox>
  );
}

export default MypageAlarmSettingOff;
