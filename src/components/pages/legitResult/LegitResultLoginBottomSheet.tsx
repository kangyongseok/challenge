import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/router';
import {
  BottomSheet,
  Box,
  Flexbox,
  Icon,
  Image,
  Tooltip,
  Typography,
  light,
  useTheme
} from 'mrcamel-ui';
import styled from '@emotion/styled';

import { checkAgent, handleClickAppDownload } from '@utils/common';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function LegitResultLoginBottomSheet() {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const [open, setOpen] = useState(false);

  const bottomSheetOpenTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const { data: accessUser } = useQueryAccessUser();

  useEffect(() => {
    if (!checkAgent.isMobileApp() && !accessUser) {
      bottomSheetOpenTimerRef.current = setTimeout(() => {
        setOpen(true);
      }, 8000);
    }

    return () => {
      if (bottomSheetOpenTimerRef.current) {
        clearTimeout(bottomSheetOpenTimerRef.current);
      }
    };
  }, [accessUser]);

  return (
    <BottomSheet open={open} onClose={() => setOpen(false)} disableSwipeable>
      <Box customStyle={{ padding: '48px 25px 12px', '& > div': { width: '100%' } }}>
        <Flexbox gap={8} alignment="center" justifyContent="center">
          <Icon name="Logo_45_45" width={35} height={35} />
          <Icon name="LogoText_96_20" width={106} height={30} />
        </Flexbox>
        <Typography textAlign="center" customStyle={{ margin: '24px 0 66px' }}>
          로그인하면
          <br />
          <strong>사진감정 결과를 실시간</strong>으로 알려드리고
          <br />
          내 사진감정 목록에서
          <br />
          다시 찾아볼 수 있어요 🙌
        </Typography>
        <Tooltip
          open
          message={
            <Typography variant="body2" weight="bold" color="uiWhite">
              ⚡ 3초만에 빠른 로그인
            </Typography>
          }
          customStyle={{
            height: 'fit-content'
          }}
        >
          <KakaoLoginButton
            onClick={() =>
              router.push({
                pathname: '/login',
                query: { openLogin: 'kakao', returnUrl: router.asPath }
              })
            }
          >
            <Image
              width={20}
              height={20}
              disableAspectRatio
              src={`https://${process.env.IMAGE_DOMAIN}/assets/img/login-kakao-icon.png`}
              alt="Kakao Logo Img"
            />
            <Typography variant="h4" weight="medium" color={light.palette.common.ui20}>
              카카오톡으로 계속하기
            </Typography>
          </KakaoLoginButton>
        </Tooltip>
      </Box>
      <Box customStyle={{ padding: 20, backgroundColor: common.ui95 }}>
        <Flexbox
          gap={4}
          alignment="center"
          justifyContent="center"
          customStyle={{ padding: 12 }}
          onClick={() => handleClickAppDownload({})}
        >
          <Icon name="Logo_45_45" width={20} height={20} color="primary" />
          <Typography
            variant="h4"
            weight="medium"
            customStyle={{
              textDecoration: 'underline'
            }}
          >
            카멜 앱 다운로드
          </Typography>
        </Flexbox>
      </Box>
    </BottomSheet>
  );
}

const KakaoLoginButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 48px;
  border-radius: ${({ theme: { box } }) => box.round['8']};
  background-color: #fee500;
`;

export default LegitResultLoginBottomSheet;
