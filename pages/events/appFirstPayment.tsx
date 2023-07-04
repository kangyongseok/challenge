import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Image, Typography } from '@mrcamelhub/camel-ui';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import { checkAgent, getImageResizePath, handleClickAppDownload } from '@utils/common';

function AppFirstPayment() {
  const router = useRouter();

  const handleClick = () => {
    if (checkAgent.isMobileApp()) {
      router.push({
        pathname: '/products/camel/새로 올라왔어요!',
        query: {
          order: 'postedAllDesc'
        }
      });
    } else {
      handleClickAppDownload({
        name: 'APP_FIRST_PAYMENT_EVENT'
      });
    }
  };

  return (
    <GeneralTemplate
      header={
        <Header showRight={false}>
          <Typography variant="h3" weight="bold">
            앱 첫 결제 이벤트
          </Typography>
        </Header>
      }
      footer={
        <Box
          customStyle={{
            width: '100%',
            minHeight: 92
          }}
        >
          <Button
            variant="solid"
            brandColor="primary"
            size="xlarge"
            fullWidth
            onClick={handleClick}
            customStyle={{
              position: 'fixed',
              left: 0,
              bottom: 0,
              margin: 20,
              width: 'calc(100% - 40px)'
            }}
          >
            {checkAgent.isMobileApp() ? '매물구경하기' : '앱 다운로드 하기'}
          </Button>
        </Box>
      }
      disablePadding
    >
      <Image
        src={getImageResizePath({
          imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/events/app-first-payment-event-main.png`,
          w: 390
        })}
        alt="App First Event Main Img"
        disableAspectRatio
      />
      <Flexbox
        direction="vertical"
        gap={52}
        customStyle={{
          padding: '73px 32px 53px'
        }}
      >
        <Flexbox direction="vertical" gap={4}>
          <Typography weight="bold" color="ui60">
            이벤트 내용
          </Typography>
          <Typography
            customStyle={{
              '& > span': {
                fontWeight: 700
              }
            }}
          >
            <span>APP 설치 및 가입 후</span>, 첫 결제 시 자동으로 할인 적용
          </Typography>
        </Flexbox>
        <Flexbox direction="vertical" gap={4}>
          <Typography weight="bold" color="ui60">
            혜택
          </Typography>
          <Typography
            customStyle={{
              '& > span': {
                fontWeight: 700
              }
            }}
          >
            거래금액의 <span>3% 자동 할인 적용</span>
            <br />
            (최대 300,000원 한도)
          </Typography>
          <Image
            src={getImageResizePath({
              imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/events/app-first-payment-event-benefit.png`,
              w: 390
            })}
            alt="App First Payment Event Benefit Img"
            disableAspectRatio
            customStyle={{
              marginTop: 16
            }}
          />
        </Flexbox>
        <Flexbox direction="vertical" gap={4}>
          <Typography weight="bold" color="ui60">
            걱정마세요!
          </Typography>
          <Typography
            customStyle={{
              '& > span': {
                fontWeight: 700
              }
            }}
          >
            결제가 <span>판매자에 의해 취소</span>된 경우, 본 이벤트가 자동으로 다시 적용됩니다.
          </Typography>
        </Flexbox>
      </Flexbox>
    </GeneralTemplate>
  );
}

export default AppFirstPayment;
