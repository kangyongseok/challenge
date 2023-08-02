import { useCallback, useMemo, useState } from 'react';

import { useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Badge, Flexbox, Icon, Typography } from '@mrcamelhub/camel-ui';

import { FeatureIsMobileAppDownDialog } from '@components/UI/organisms';
import { Menu, MenuItem } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { fetchUserAccounts } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { settingsAccountData } from '@recoil/settingsAccount';
import useSession from '@hooks/useSession';

function MypageManage() {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const resetAccountDataState = useResetRecoilState(settingsAccountData);

  const { isLoggedIn } = useSession();

  const { data: userAccounts = [] } = useQuery(
    queryKeys.users.userAccounts(),
    () => fetchUserAccounts(),
    {
      enabled: isLoggedIn
    }
  );

  const handleClickBlockedUsers = useCallback(() => {
    logEvent(attrKeys.mypage.CLICK_BLOCK_LIST, { name: attrProperty.name.MY });
    router.push('/mypage/settings/blockedUsers');
  }, [router]);

  const handleClickAccount = useCallback(() => {
    logEvent(attrKeys.mypage.CLICK_PERSONAL_INPUT, {
      name: attrProperty.name.MY,
      title: attrProperty.title.ACCOUNT
    });
    resetAccountDataState();
    router.push('/mypage/settings/account');
  }, [resetAccountDataState, router]);

  const handleClickFixMessage = useCallback(() => {
    router.push('/mypage/settings/channelFixMessage');
  }, [router]);

  const settingMenu = useMemo(
    () => [
      { label: '정산계좌', isNew: false, onClick: handleClickAccount },
      { label: '차단 사용자 관리', isNew: false, onClick: handleClickBlockedUsers },
      { label: '채팅 고정 메시지 설정', isNew: false, onClick: handleClickFixMessage }
    ],
    [handleClickAccount, handleClickBlockedUsers, handleClickFixMessage]
  );

  return (
    <>
      <Menu id="mypage-manage" title="관리">
        {settingMenu.map(({ label, isNew, onClick }) => (
          <MenuItem
            key={`info-menu-${label}`}
            action={
              <Flexbox gap={4} alignment="center">
                {label === '정산계좌' && (
                  <Typography color="blue">{userAccounts[0]?.bankName}</Typography>
                )}
                <Icon name="Arrow2RightOutlined" size="small" />
              </Flexbox>
            }
            onClick={onClick}
          >
            <Flexbox alignment="center" gap={2}>
              {label}
              <Badge
                variant="solid"
                open={isNew}
                brandColor="red"
                text="N"
                size="xsmall"
                disablePositionAbsolute
                customStyle={{
                  // TODO UI 라이브러리 개선
                  width: 16,
                  height: 16,
                  fontWeight: 700,
                  padding: '2px 0',
                  justifyContent: 'center'
                }}
              />
            </Flexbox>
          </MenuItem>
        ))}
      </Menu>
      <FeatureIsMobileAppDownDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export default MypageManage;
