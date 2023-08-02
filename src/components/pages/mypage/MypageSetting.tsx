import { useCallback, useState } from 'react';

import { useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, Icon, Typography } from '@mrcamelhub/camel-ui';

import { FeatureIsMobileAppDownDialog } from '@components/UI/organisms';
import { Menu, MenuItem } from '@components/UI/molecules';

import { checkAgent } from '@utils/common';

import {
  nonMemberCertificationFormState,
  nonMemberCertificationReSendState
} from '@recoil/nonMemberCertification/atom';

function MypageSetting() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [openNonMemberDialog, setOpenNonMemberDialog] = useState(false);

  const resetNonMemberCertificationFormState = useResetRecoilState(nonMemberCertificationFormState);
  const resetNonMemberCertificationReSendState = useResetRecoilState(
    nonMemberCertificationReSendState
  );

  const handleClickAlarmSetting = useCallback(() => {
    if (!checkAgent.isMobileApp()) {
      setOpen(true);
      return;
    }

    if (checkAgent.isAndroidApp() && window.webview && window.webview.callAuthPush) {
      window.webview.callAuthPush();
    }

    if (
      checkAgent.isIOSApp() &&
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.callAuthPush &&
      window.webkit.messageHandlers.callAuthPush.postMessage
    ) {
      window.webkit.messageHandlers.callAuthPush.postMessage(0);
    }

    window.getAuthPush = (result: string) => {
      router.push(`/mypage/settings/alarm?setting=${result}`);
    };
  }, [router]);

  const handleClickNonMemberOrderCheckConfirm = () => {
    resetNonMemberCertificationFormState();
    resetNonMemberCertificationReSendState();

    router.push('/mypage/nonMember/certification');
  };

  return (
    <>
      <Menu id="mypage-setting" title="알림">
        <MenuItem
          action={<Icon name="Arrow2RightOutlined" size="small" />}
          onClick={handleClickAlarmSetting}
        >
          알림 설정
        </MenuItem>
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

export default MypageSetting;
