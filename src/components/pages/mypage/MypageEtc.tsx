import { useState } from 'react';

import { useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, Icon, Label, Typography } from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

import { Menu, MenuItem } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  nonMemberCertificationFormState,
  nonMemberCertificationReSendState
} from '@recoil/nonMemberCertification/atom';

function MypageEtc() {
  const router = useRouter();

  const {
    palette: { secondary }
  } = useTheme();

  const [openNonMemberDialog, setOpenNonMemberDialog] = useState(false);

  const resetNonMemberCertificationFormState = useResetRecoilState(nonMemberCertificationFormState);
  const resetNonMemberCertificationReSendState = useResetRecoilState(
    nonMemberCertificationReSendState
  );

  const handleClick = () => {
    router.push('/announces');
  };

  const handleClickMyPortfolio = () => {
    logEvent(attrKeys.mypage.CLICK_MYPORTFOLIO, {
      name: attrProperty.name.MY
    });

    router.push('/myPortfolio');
  };

  const handleClickNonMemberOrderCheck = () => {
    setOpenNonMemberDialog(true);
  };

  const handleClickNonMemberOrderCheckConfirm = () => {
    resetNonMemberCertificationFormState();
    resetNonMemberCertificationReSendState();

    router.push('/mypage/nonMember/certification');
  };

  return (
    <>
      <Menu
        id="mypage-etc"
        title="기타"
        customStyle={{
          padding: '32px 20px 52px'
        }}
      >
        <MenuItem action={<Icon name="Arrow2RightOutlined" size="small" />} onClick={handleClick}>
          <Flexbox gap={4} alignment="center">
            공지사항
            <Label
              variant="solid"
              size="xsmall"
              brandColor="red"
              text="NEW"
              round={9}
              customStyle={{
                backgroundColor: secondary.red.light
              }}
            />
          </Flexbox>
        </MenuItem>
        <MenuItem
          action={<Icon name="Arrow2RightOutlined" size="small" />}
          onClick={handleClickMyPortfolio}
        >
          <Flexbox gap={4} alignment="center">
            마이 포트폴리오
            <Label
              variant="solid"
              size="xsmall"
              brandColor="red"
              text="오픈알림"
              round={9}
              customStyle={{
                backgroundColor: secondary.red.light
              }}
            />
          </Flexbox>
        </MenuItem>
        <MenuItem
          action={<Icon name="Arrow2RightOutlined" size="small" />}
          onClick={handleClickNonMemberOrderCheck}
        >
          비회원 주문조회
        </MenuItem>
        <MenuItem
          action={<Icon name="Arrow2RightOutlined" size="small" />}
          onClick={() => router.push('/mypage/qna')}
        >
          자주 묻는 질문
        </MenuItem>
      </Menu>
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

export default MypageEtc;
