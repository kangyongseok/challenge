import { useRouter } from 'next/router';
import { Flexbox, Icon } from 'mrcamel-ui';

import { Menu, MenuItem } from '@components/UI/molecules';
import { Badge } from '@components/UI/atoms';

import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function MypageLegitInfo() {
  const router = useRouter();
  const { data: accessUser } = useQueryAccessUser();
  const { data: myUserInfo } = useQueryMyUserInfo();

  const infoMenu = [
    {
      label: '내 감정사 프로필',
      url: `/legit/profile/${accessUser?.userId}`
    },
    {
      label: '나에게 들어온 신청 건 모아보기',
      url: '/legit/admin?tab=request',
      newLegit: myUserInfo ? myUserInfo.notProcessedLegitCount > 0 : 0
    }
  ];

  return (
    <Menu title="감정사">
      {infoMenu.map(({ label, url, newLegit }) => (
        <MenuItem
          key={`info-menu-${label}`}
          action={
            <Flexbox gap={4} alignment="center" customStyle={{ marginLeft: 'auto' }}>
              {/* <Typography customStyle={{ color: secondary.blue.main }}>{data}</Typography> */}
              <Icon name="Arrow2RightOutlined" size="small" />
            </Flexbox>
          }
          onClick={() => router.push(url)}
        >
          <Flexbox alignment="center" gap={7}>
            {label}
            {newLegit && (
              <Badge
                text="N"
                open
                width={18}
                height={18}
                brandColor="red"
                customStyle={{ position: 'initial' }}
              />
            )}
          </Flexbox>
        </MenuItem>
      ))}
    </Menu>
  );
}

export default MypageLegitInfo;
