import { Box, CheckboxGroup, Flexbox, Image, Typography, useTheme } from '@mrcamelhub/camel-ui';

function CamelSellerGuideCheckList() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  return (
    <Box
      component="section"
      customStyle={{
        position: 'relative',
        marginTop: -56,
        backgroundColor: common.bg02
      }}
    >
      <Image
        width={135}
        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/camelSeller/guide/title-model.png`}
        alt="Title Model Img"
        disableAspectRatio
        disableSkeleton
        customStyle={{
          position: 'absolute',
          top: 5,
          right: 0,
          zIndex: 10
        }}
      />
      <Box
        customStyle={{
          position: 'relative',
          maxWidth: 'fit-content',
          margin: '100px 20px 0'
        }}
      >
        <Typography variant="h1" weight="bold">
          더 빨리 팔리는
        </Typography>
        <Typography
          variant="h1"
          weight="bold"
          customStyle={{
            position: 'relative',
            maxWidth: 'fit-content'
          }}
        >
          사진 등록 가이드
          <Box
            customStyle={{
              position: 'absolute',
              top: -27,
              right: -27
            }}
          >
            <Star1 />
          </Box>
          <Box
            customStyle={{
              position: 'absolute',
              top: -10,
              right: -44
            }}
          >
            <Star2 />
          </Box>
        </Typography>
        <Image
          width={234}
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/camelSeller/guide/line1.png`}
          alt="Line Img"
          disableAspectRatio
          disableSkeleton
          customStyle={{
            position: 'absolute',
            left: 0,
            bottom: -6
          }}
        />
        <Image
          width={214}
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/camelSeller/guide/line2.png`}
          alt="Line Img"
          disableAspectRatio
          disableSkeleton
          customStyle={{
            position: 'absolute',
            left: 0,
            bottom: -10
          }}
        />
      </Box>
      <Flexbox
        direction="vertical"
        gap={16}
        customStyle={{
          padding: '32px 20px 32px'
        }}
      >
        <Typography variant="h4" weight="bold">
          🍯 TIP
        </Typography>
        <Flexbox direction="vertical" gap={8}>
          <CheckboxGroup
            text="사진을 3장 이상 등록해주세요!"
            checked
            customStyle={{
              // TODO UI 라이브러리 수정
              '& > div': {
                backgroundColor: 'transparent'
              }
            }}
          />
          <CheckboxGroup
            text="밝은 곳에서 깔끔한 배경으로 촬영해주세요!"
            checked
            customStyle={{
              '& > div': {
                backgroundColor: 'transparent'
              }
            }}
          />
          <CheckboxGroup
            text="선명한 사진을 위해 카메라 렌즈를 닦아주세요."
            checked
            customStyle={{
              '& > div': {
                backgroundColor: 'transparent'
              }
            }}
          />
        </Flexbox>
      </Flexbox>
    </Box>
  );
}

function Star1() {
  return (
    <svg width="27" height="32" viewBox="0 0 27 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 18.2825C9.42608 18.2825 12.5 7.37681 13.1087 2C13.7174 5.44927 16.7913 12.3478 24.2174 12.3478C16.7913 12.3478 13.7174 24.1159 13.1087 30C12.5 26.1449 9.42608 18.2825 2 18.2825Z"
        fill="#FFD911"
        stroke="#425BFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Star2() {
  return (
    <svg width="22" height="26" viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2.24259 12.4673C7.71135 14.01 12.3015 6.40164 13.8967 2.46213C13.6092 5.19693 14.4013 11.0522 19.87 12.5949C14.4013 11.0522 9.62723 19.3127 7.92379 23.6358C8.29789 20.5941 7.71135 14.01 2.24259 12.4673Z"
        fill="#FFD911"
        stroke="#425BFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default CamelSellerGuideCheckList;
