import { Button, Flexbox, Image, Typography } from '@mrcamelhub/camel-ui';

import { Empty } from '@components/UI/atoms';

import { getImageResizePath } from '@utils/common';

import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';

interface MypageAlarmSettingOffProps {
  onClick: () => void;
}

function MypageAlarmSettingOff({ onClick }: MypageAlarmSettingOffProps) {
  const { userNickName } = useQueryMyUserInfo();

  return (
    <Empty>
      <Image
        src={getImageResizePath({
          imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/off_alarm.png`,
          w: 52
        })}
        alt="empty img"
        width={52}
        height={52}
        disableAspectRatio
        disableSkeleton
      />
      <Flexbox direction="vertical" alignment="center" justifyContent="center" gap={8}>
        <Typography variant="h3" weight="bold" textAlign="center" color="ui60">
          알림이 꺼져있어요
        </Typography>
        <Typography variant="h4" textAlign="center" color="ui60">
          설정에서 알림을 켜고
          <br />
          {userNickName}님을 위한 소식을 받아보세요!
        </Typography>
      </Flexbox>
      <Button variant="solid" brandColor="black" size="large" onClick={onClick}>
        알림 켜기
      </Button>
    </Empty>
  );
}

export default MypageAlarmSettingOff;
