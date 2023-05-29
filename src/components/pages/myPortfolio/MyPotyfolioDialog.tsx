import { useEffect } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Box, Button, Flexbox, Icon, Typography } from '@mrcamelhub/camel-ui';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import { setCookie } from '@utils/common';

import { SuccessDialogState } from '@recoil/myPortfolio';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';

function MyPotyfolioDialog() {
  const router = useRouter();
  const isOpen = useRecoilValue(SuccessDialogState);
  const { userNickName } = useQueryMyUserInfo();

  useEffect(() => {
    if (isOpen) {
      logEvent(attrKeys.myPortfolio.VIEW_RESERVATION_COMPLETE_DIALOG);
    }
  }, [isOpen]);
  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        //
      }}
    >
      <Flexbox direction="vertical" alignment="center" justifyContent="center">
        <Icon name="LogoText_96_20" height={10} customStyle={{ marginBottom: 10 }} />
        <GradationText />
        <Box customStyle={{ marginTop: 12, textAlign: 'center' }}>
          <Typography>{`${userNickName}님, 사전예약이 완료되었어요!`}</Typography>
          <Typography>오픈되면 카카오톡으로 알려드릴게요.</Typography>
        </Box>
        <Button
          fullWidth
          brandColor="primary"
          variant="solid"
          customStyle={{ marginTop: 32 }}
          onClick={() => {
            setCookie('myPortfolioReserve', 'done', 1);
            LocalStorage.remove('preReserve');
            router.replace('/');
          }}
        >
          홈으로 이동
        </Button>
      </Flexbox>
    </Dialog>
  );
}

function GradationText() {
  return (
    <svg
      width="137"
      height="15"
      viewBox="0 0 137 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.3027 0.992188H11.6816L7.95508 7.17969L4.22852 0.992188H0.607422V14H3.98242V6.03711L7.48047 11.75H8.42969L11.9277 6.03711V14H15.3027V0.992188ZM24.4895 9.16602L29.2883 0.992188H25.5793L22.8195 6.37109L20.0598 0.992188H16.3332L21.1145 9.16602V14H24.4895V9.16602ZM40.1383 0.992188H35.0934V14H38.4684V10.0977H40.1383C43.3199 10.0977 45.4117 8.62109 45.4117 5.63281C45.4117 2.78516 43.566 0.992188 40.1383 0.992188ZM38.4684 7.25V3.96289H40.1383C41.3512 3.96289 42.0016 4.64844 42.0016 5.63281C42.0016 6.59961 41.3512 7.25 40.1383 7.25H38.4684ZM52.9813 0.763672C49.1316 0.763672 46.2313 3.68164 46.2313 7.49609C46.2313 11.3281 49.1316 14.2461 52.9813 14.2461C56.8309 14.2461 59.7488 11.3281 59.7488 7.49609C59.7488 3.68164 56.8309 0.763672 52.9813 0.763672ZM49.6063 7.49609C49.6063 5.50977 51.0477 4.05078 52.9813 4.05078C54.9324 4.05078 56.3738 5.50977 56.3738 7.49609C56.3738 9.48242 54.9324 10.9414 52.9813 10.9414C51.0477 10.9414 49.6063 9.48242 49.6063 7.49609ZM66.3164 9.60547L68.6719 14H72.3633L69.4277 8.9375C70.7285 8.30469 71.502 7.10938 71.502 5.42188C71.502 2.5918 69.6387 0.992188 66.2285 0.992188H61.2188V14H64.5938V9.62305H65.8242C66 9.62305 66.1582 9.62305 66.3164 9.60547ZM64.5938 6.88086V3.96289H66.2285C67.4766 3.96289 68.0918 4.50781 68.0918 5.42188C68.0918 6.37109 67.4766 6.88086 66.2285 6.88086H64.5938ZM82.3234 4.10352V0.992188H72.6379V4.10352H75.7844V14H79.1594V4.10352H82.3234ZM87.1332 3.96289H92.4066V0.992188H83.7758V14H87.1332V9.3418H91.8617V6.59961H87.1332V3.96289ZM100.152 0.763672C96.3023 0.763672 93.402 3.68164 93.402 7.49609C93.402 11.3281 96.3023 14.2461 100.152 14.2461C104.002 14.2461 106.92 11.3281 106.92 7.49609C106.92 3.68164 104.002 0.763672 100.152 0.763672ZM96.777 7.49609C96.777 5.50977 98.2184 4.05078 100.152 4.05078C102.103 4.05078 103.545 5.50977 103.545 7.49609C103.545 9.48242 102.103 10.9414 100.152 10.9414C98.2184 10.9414 96.777 9.48242 96.777 7.49609ZM116.915 10.8887H111.764V0.992188H108.389V14H116.915V10.8887ZM121.707 0.992188H118.332V14H121.707V0.992188ZM129.909 0.763672C126.06 0.763672 123.159 3.68164 123.159 7.49609C123.159 11.3281 126.06 14.2461 129.909 14.2461C133.759 14.2461 136.677 11.3281 136.677 7.49609C136.677 3.68164 133.759 0.763672 129.909 0.763672ZM126.534 7.49609C126.534 5.50977 127.976 4.05078 129.909 4.05078C131.861 4.05078 133.302 5.50977 133.302 7.49609C133.302 9.48242 131.861 10.9414 129.909 10.9414C127.976 10.9414 126.534 9.48242 126.534 7.49609Z"
        fill="url(#paint0_linear_873_13052)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_873_13052"
          x1="-0.5"
          y1="7.5"
          x2="137.5"
          y2="7.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1833FF" />
          <stop offset="1" stopColor="#5800E5" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default MyPotyfolioDialog;
