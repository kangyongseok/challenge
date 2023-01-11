import { useMemo } from 'react';

import { useRouter } from 'next/router';
import { Flexbox, Icon } from 'mrcamel-ui';

import { Menu, MenuItem } from '@components/UI/molecules';
import { Badge } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function MypageLegitInfo() {
  const router = useRouter();
  const { data: accessUser } = useQueryAccessUser();
  const { data: myUserInfo } = useQueryMyUserInfo();

  const infoMenu = useMemo(
    () => [
      {
        label: '내 감정사 프로필',
        onClick: () => {
          logEvent(attrKeys.mypage.CLICK_LEGIT_PROFILE, {
            name: attrProperty.name.MY
          });
          router.push(`/legit/profile/${accessUser?.userId}`);
        }
      },
      {
        label: '나에게 들어온 신청 건 모아보기',
        onClick: () => {
          logEvent(attrKeys.mypage.CLICK_LEGIT_MAIN, {
            name: attrProperty.name.MY,
            att: 'LEGIT'
          });
          router.push('/legit/admin?tab=request');
        },
        newLegit: myUserInfo ? myUserInfo.notProcessedLegitCount > 0 : 0
      }
    ],
    [accessUser?.userId, myUserInfo, router]
  );

  return (
    <Menu title="감정사">
      {infoMenu.map(({ label, onClick, newLegit }) => (
        <MenuItem
          key={`info-menu-${label}`}
          action={
            <Flexbox gap={4} alignment="center" customStyle={{ marginLeft: 'auto' }}>
              {/* <Typography customStyle={{ color: secondary.blue.main }}>{data}</Typography> */}
              <Icon name="Arrow2RightOutlined" size="small" />
            </Flexbox>
          }
          onClick={onClick}
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
