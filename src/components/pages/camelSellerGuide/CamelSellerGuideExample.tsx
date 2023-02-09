import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Alert, Box, Button, Flexbox, Icon, Image, Label, Typography, useTheme } from 'mrcamel-ui';

import { historyState } from '@recoil/common';

function CamelSellerGuideExample() {
  const router = useRouter();

  const {
    theme: {
      palette: { secondary, common }
    }
  } = useTheme();

  const { asPaths, index } = useRecoilValue(historyState);

  const handleClick = () => {
    const prevAsPath = asPaths[index - 1];

    if (prevAsPath && prevAsPath.indexOf('/camelSeller/registerConfirm') !== -1) {
      router.back();
    } else {
      router.replace('/camelSeller/registerConfirm');
    }
  };

  return (
    <Box
      component="section"
      customStyle={{
        padding: '32px 20px 20px'
      }}
    >
      <Typography variant="h3" weight="bold">
        📸 좋은사진 예시입니다. 더 잘팔려요!
      </Typography>
      <Flexbox gap={8} customStyle={{ marginTop: 20 }}>
        <Box customStyle={{ flexGrow: 1 }}>
          <Image
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/camelSeller/guide/1.png`}
            alt="예시 매물 이미지 1"
            round={8}
          />
        </Box>
        <Box customStyle={{ flexGrow: 1 }}>
          <Image
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/camelSeller/guide/2.png`}
            alt="예시 매물 이미지 2"
            round={8}
          />
        </Box>
      </Flexbox>
      <Typography
        customStyle={{
          marginTop: 12,
          textAlign: 'center'
        }}
      >
        대표사진은 전체가 잘 보이게 촬영해요.
      </Typography>
      <Flexbox gap={8} customStyle={{ marginTop: 32 }}>
        <Box customStyle={{ flexGrow: 1 }}>
          <Image
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/camelSeller/guide/3.png`}
            alt="예시 매물 이미지 3"
            round={8}
          />
        </Box>
        <Box customStyle={{ flexGrow: 1 }}>
          <Image
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/camelSeller/guide/4.png`}
            alt="예시 매물 이미지 4"
            round={8}
          />
        </Box>
      </Flexbox>
      <Typography
        customStyle={{
          marginTop: 12,
          textAlign: 'center'
        }}
      >
        놓치면 안되는 포인트는 근접촬영해주세요.
      </Typography>
      <Flexbox gap={8} customStyle={{ marginTop: 32 }}>
        <Box customStyle={{ flexGrow: 1 }}>
          <Image
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/camelSeller/guide/5.png`}
            alt="예시 매물 이미지 5"
            round={8}
          />
        </Box>
        <Box customStyle={{ flexGrow: 1 }}>
          <Image
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/camelSeller/guide/6.png`}
            alt="예시 매물 이미지 6"
            round={8}
          />
        </Box>
      </Flexbox>
      <Typography
        customStyle={{
          marginTop: 12,
          textAlign: 'center'
        }}
      >
        부속품, 하자/오염 등의 사진도 추가해주세요.
      </Typography>
      <Box
        customStyle={{
          width: '100%',
          height: 1,
          margin: '44px 0 32px',
          backgroundColor: common.line01
        }}
      />
      <Typography variant="h3" weight="bold">
        🚫 금지합니다. 이런 사진은 안돼요!
      </Typography>
      <Flexbox gap={8} customStyle={{ marginTop: 20 }}>
        <Flexbox
          direction="vertical"
          gap={12}
          customStyle={{ position: 'relative', flex: 1, textAlign: 'center' }}
        >
          <Image
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/camelSeller/guide/7.png`}
            alt="예시 매물 이미지 7"
            round={8}
            customStyle={{
              border: `2px solid ${secondary.red.light}`
            }}
          />
          <Typography>초점 흐림</Typography>
          <Label
            variant="solid"
            brandColor="red"
            size="xsmall"
            startIcon={<Icon name="OpinionFakeOutlined" />}
            text="NO"
            customStyle={{
              position: 'absolute',
              top: 8,
              left: 8
            }}
          />
        </Flexbox>
        <Flexbox
          direction="vertical"
          gap={12}
          customStyle={{ position: 'relative', flex: 1, textAlign: 'center' }}
        >
          <Image
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/camelSeller/guide/8.png`}
            alt="예시 매물 이미지 8"
            round={8}
            customStyle={{
              border: `2px solid ${secondary.red.light}`
            }}
          />
          <Typography>어두운 사진</Typography>
          <Label
            variant="solid"
            brandColor="red"
            size="xsmall"
            startIcon={<Icon name="OpinionFakeOutlined" />}
            text="NO"
            customStyle={{
              position: 'absolute',
              top: 8,
              left: 8
            }}
          />
        </Flexbox>
      </Flexbox>
      <Flexbox gap={8} customStyle={{ marginTop: 32 }}>
        <Flexbox
          direction="vertical"
          gap={12}
          customStyle={{ position: 'relative', flex: 1, textAlign: 'center' }}
        >
          <Image
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/camelSeller/guide/9.png`}
            alt="예시 매물 이미지 9"
            round={8}
            customStyle={{
              border: `2px solid ${secondary.red.light}`
            }}
          />
          <Typography>사진 위에 텍스트</Typography>
          <Label
            variant="solid"
            brandColor="red"
            size="xsmall"
            startIcon={<Icon name="OpinionFakeOutlined" />}
            text="NO"
            customStyle={{
              position: 'absolute',
              top: 8,
              left: 8
            }}
          />
        </Flexbox>
        <Flexbox
          direction="vertical"
          gap={12}
          customStyle={{ position: 'relative', flex: 1, textAlign: 'center' }}
        >
          <Image
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/camelSeller/guide/10.png`}
            alt="예시 매물 이미지 10"
            round={8}
            customStyle={{
              border: `2px solid ${secondary.red.light}`
            }}
          />
          <Typography>캡처, 스크린샷</Typography>
          <Label
            variant="solid"
            brandColor="red"
            size="xsmall"
            startIcon={<Icon name="OpinionFakeOutlined" />}
            text="NO"
            customStyle={{
              position: 'absolute',
              top: 8,
              left: 8
            }}
          />
        </Flexbox>
      </Flexbox>
      <Alert
        brandColor="gray"
        round={8}
        customStyle={{
          marginTop: 44,
          padding: 12
        }}
      >
        <Flexbox gap={4}>
          <Icon name="BangCircleFilled" width={16} height={16} color={secondary.red.light} />
          <Typography variant="body2">
            가품이나, 정책에 맞지 않는 사진의 경우 <br />
            사전 통보 없이 삭제될 수 있어요.
          </Typography>
        </Flexbox>
      </Alert>
      <Button
        variant="solid"
        brandColor="primary"
        size="xlarge"
        fullWidth
        onClick={handleClick}
        customStyle={{
          marginTop: 20
        }}
      >
        확인했어요
      </Button>
    </Box>
  );
}

export default CamelSellerGuideExample;
