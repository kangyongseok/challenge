import { Button, Flexbox, Icon, Image, Typography } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { IOS_SAFE_AREA_TOP } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent, handleClickAppDownload, isExtendedLayoutIOSVersion } from '@utils/common';

import useQueryUserInfo from '@hooks/useQueryUserInfo';

function MyPortfolioLanding07({
  isAnimation,
  onClick
}: {
  isAnimation: boolean;
  onClick: () => void;
}) {
  const { data: userInfo } = useQueryUserInfo();

  return (
    <Flexbox direction="vertical" customStyle={{ height: '100%' }}>
      <Flexbox
        direction="vertical"
        alignment="center"
        customStyle={{ marginTop: isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : 0 }}
      >
        <Icon name="LogoText_96_20" height={10} customStyle={{ marginBottom: 15 }} />
        <GradationTitle />
        <Typography weight="medium" variant="h3" customStyle={{ marginTop: 20 }}>
          지금 사전예약하고
        </Typography>
        <Typography weight="medium" variant="h3">
          내 명품의 가치를 가장 먼저 알아보세요!
        </Typography>
        <GradationCtaButton size="large" fullWidth variant="solid" onClick={onClick}>
          <Icon name="AlarmFilled" />
          오픈 알림받기
        </GradationCtaButton>
        {!checkAgent.isMobileApp() && (
          <AppDownloadCtaButton
            size="large"
            fullWidth
            variant="solid"
            onClick={() => {
              logEvent(attrKeys.myPortfolio.CLICK_APPDOWNLOAD, {
                name: attrProperty.productName.MYPORTFOLIO,
                title: attrProperty.productTitle.STEP09
              });
              handleClickAppDownload({});
            }}
          >
            앱 다운로드
          </AppDownloadCtaButton>
        )}
      </Flexbox>
      <SlideupFrame justifyContent="center" isAnimation={isAnimation}>
        {userInfo?.info?.value?.gender === 'F' ? (
          <>
            <Image
              width={152}
              height="auto"
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/frame_left_img09_F.png`}
              alt="frame_left_img09"
              disableAspectRatio
              disableSkeleton
            />
            <Image
              width={162}
              height="auto"
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/frame_right_img09_F.png`}
              alt="frame_right_img09"
              disableAspectRatio
              disableSkeleton
            />
          </>
        ) : (
          <>
            <Image
              width={152}
              height="auto"
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/frame_left_img09_M.png`}
              alt="frame_left_img09"
              disableAspectRatio
              disableSkeleton
            />
            <Image
              width={162}
              height="auto"
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/frame_right_img09_M.png`}
              alt="frame_right_img09"
              disableAspectRatio
              disableSkeleton
            />
          </>
        )}
      </SlideupFrame>
    </Flexbox>
  );
}

const GradationCtaButton = styled(Button)`
  width: 271px;
  background: linear-gradient(90deg, #1833ff 0%, #5800e5 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border-radius: 50px;
  margin-top: 32px;
`;

const AppDownloadCtaButton = styled(Button)`
  width: 271px;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui95};
  border-radius: 50px;
  margin-top: 8px;
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui20};
`;

const SlideupFrame = styled(Flexbox)<{ isAnimation: boolean }>`
  position: relative;
  bottom: -70px;
  margin-top: auto;
  img:first-of-type {
    position: relative;
    top: 80px;
  }
  ${({ isAnimation }): CSSObject => (isAnimation ? { animation: 'slideup 1s forwards' } : {})}
  @keyframes slideup {
    0% {
      transform: translate(0, 450px);
    }
    100% {
      transform: translate(0, 0);
    }
  }
`;

function GradationTitle() {
  return (
    <svg
      width="214"
      height="22"
      viewBox="0 0 214 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.582 0.765625H17.9492L12.1523 10.3906L6.35547 0.765625H0.722656V21H5.97266V8.61328L11.4141 17.5H12.8906L18.332 8.61328V21H23.582V0.765625ZM37.9836 13.4805L45.4484 0.765625H39.6789L35.3859 9.13281L31.093 0.765625H25.2961L32.7336 13.4805V21H37.9836V13.4805ZM62.5484 0.765625H54.7008V21H59.9508V14.9297H62.5484C67.4977 14.9297 70.7516 12.6328 70.7516 7.98438C70.7516 3.55469 67.8805 0.765625 62.5484 0.765625ZM59.9508 10.5V5.38672H62.5484C64.4352 5.38672 65.4469 6.45312 65.4469 7.98438C65.4469 9.48828 64.4352 10.5 62.5484 10.5H59.9508ZM82.6375 0.410156C76.6492 0.410156 72.1375 4.94922 72.1375 10.8828C72.1375 16.8438 76.6492 21.3828 82.6375 21.3828C88.6258 21.3828 93.1648 16.8438 93.1648 10.8828C93.1648 4.94922 88.6258 0.410156 82.6375 0.410156ZM77.3875 10.8828C77.3875 7.79297 79.6297 5.52344 82.6375 5.52344C85.6727 5.52344 87.9148 7.79297 87.9148 10.8828C87.9148 13.9727 85.6727 16.2422 82.6375 16.2422C79.6297 16.2422 77.3875 13.9727 77.3875 10.8828ZM103.492 14.1641L107.156 21H112.898L108.332 13.125C110.355 12.1406 111.559 10.2812 111.559 7.65625C111.559 3.25391 108.66 0.765625 103.355 0.765625H95.5625V21H100.812V14.1914H102.727C103 14.1914 103.246 14.1914 103.492 14.1641ZM100.812 9.92578V5.38672H103.355C105.297 5.38672 106.254 6.23438 106.254 7.65625C106.254 9.13281 105.297 9.92578 103.355 9.92578H100.812ZM128.503 5.60547V0.765625H113.437V5.60547H118.331V21H123.581V5.60547H128.503ZM136.096 5.38672H144.299V0.765625H130.873V21H136.096V13.7539H143.452V9.48828H136.096V5.38672ZM156.459 0.410156C150.47 0.410156 145.959 4.94922 145.959 10.8828C145.959 16.8438 150.47 21.3828 156.459 21.3828C162.447 21.3828 166.986 16.8438 166.986 10.8828C166.986 4.94922 162.447 0.410156 156.459 0.410156ZM151.209 10.8828C151.209 7.79297 153.451 5.52344 156.459 5.52344C159.494 5.52344 161.736 7.79297 161.736 10.8828C161.736 13.9727 159.494 16.2422 156.459 16.2422C153.451 16.2422 151.209 13.9727 151.209 10.8828ZM182.645 16.1602H174.634V0.765625H169.384V21H182.645V16.1602ZM190.211 0.765625H184.961V21H190.211V0.765625ZM203.081 0.410156C197.093 0.410156 192.581 4.94922 192.581 10.8828C192.581 16.8438 197.093 21.3828 203.081 21.3828C209.07 21.3828 213.609 16.8438 213.609 10.8828C213.609 4.94922 209.07 0.410156 203.081 0.410156ZM197.831 10.8828C197.831 7.79297 200.073 5.52344 203.081 5.52344C206.116 5.52344 208.359 7.79297 208.359 10.8828C208.359 13.9727 206.116 16.2422 203.081 16.2422C200.073 16.2422 197.831 13.9727 197.831 10.8828Z"
        fill="url(#paint0_linear_687_36803)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_687_36803"
          x1="-1"
          y1="11"
          x2="215"
          y2="11"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1833FF" />
          <stop offset="1" stopColor="#5800E5" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default MyPortfolioLanding07;
