import { useCallback, useMemo, useState } from 'react';

import { useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Badge, Button, Flexbox, Icon, Typography } from '@mrcamelhub/camel-ui';

import { FeatureIsMobileAppDownDialog } from '@components/UI/organisms';
import { Menu, MenuItem } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { fetchUserAccounts } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  settingsTransferDataState,
  settingsTransferPlatformsState
} from '@recoil/settingsTransfer';
import { settingsAccountData } from '@recoil/settingsAccount';
import {
  nonMemberCertificationFormState,
  nonMemberCertificationReSendState
} from '@recoil/nonMemberCertification/atom';
import useSession from '@hooks/useSession';

function MypageManage() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [openNonMemberDialog, setOpenNonMemberDialog] = useState(false);

  const resetPlatformsState = useResetRecoilState(settingsTransferPlatformsState);
  const resetDataState = useResetRecoilState(settingsTransferDataState);
  const resetAccountDataState = useResetRecoilState(settingsAccountData);
  const resetNonMemberCertificationFormState = useResetRecoilState(nonMemberCertificationFormState);
  const resetNonMemberCertificationReSendState = useResetRecoilState(
    nonMemberCertificationReSendState
  );

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

  const handleClickTransfer = useCallback(() => {
    resetPlatformsState();
    resetDataState();
    router.push('/mypage/settings/transfer');
  }, [resetPlatformsState, resetDataState, router]);

  const handleClickAccount = useCallback(() => {
    logEvent(attrKeys.mypage.CLICK_PERSONAL_INPUT, {
      name: attrProperty.name.MY,
      title: attrProperty.title.ACCOUNT
    });
    resetAccountDataState();
    router.push('/mypage/settings/account');
  }, [resetAccountDataState, router]);

  const handleClickNonMemberOrderCheck = useCallback(() => {
    setOpenNonMemberDialog(true);
  }, []);

  const handleClickNonMemberOrderCheckConfirm = () => {
    resetNonMemberCertificationFormState();
    resetNonMemberCertificationReSendState();

    router.push('/mypage/nonMember/certification');
  };

  const settingMenu = useMemo(
    () => [
      { label: '정산계좌', isNew: false, onClick: handleClickAccount },
      { label: '차단 사용자 관리', isNew: false, onClick: handleClickBlockedUsers },
      { label: '내 상품 가져오기', isNew: false, onClick: handleClickTransfer },
      { label: '비회원 주문조회', isNew: false, onClick: handleClickNonMemberOrderCheck },
      { label: '자주 묻는 질문', isNew: false, onClick: () => router.push('/mypage/qna') }
    ],
    [
      handleClickAccount,
      handleClickBlockedUsers,
      handleClickNonMemberOrderCheck,
      handleClickTransfer,
      router
    ]
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
      <Dialog open={openNonMemberDialog} onClose={() => setOpenNonMemberDialog(false)}>
        <Typography variant="h3" weight="bold">
          로그아웃 후<br />
          비회원 주문조회를 할 수 있어요
        </Typography>
        <Typography
          variant="h4"
          customStyle={{
            marginTop: 8
          }}
        >
          현재 계정이 로그아웃됩니다.
          <br />
          주문조회 후 다시 로그인해주세요.
        </Typography>
        <Flexbox
          direction="vertical"
          gap={8}
          customStyle={{
            marginTop: 32
          }}
        >
          <Button
            variant="solid"
            brandColor="primary"
            size="large"
            fullWidth
            onClick={handleClickNonMemberOrderCheckConfirm}
          >
            비회원 주문조회
          </Button>
          <Button
            variant="ghost"
            brandColor="black"
            size="large"
            fullWidth
            onClick={() => setOpenNonMemberDialog(false)}
          >
            취소
          </Button>
        </Flexbox>
      </Dialog>
    </>
  );
}

export default MypageManage;
