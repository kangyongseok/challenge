import { useRouter } from 'next/router';
import { Box, Button, Chip, Flexbox, Image, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

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
          <Typography
            variant="h3"
            weight="bold"
            textAlign="center"
            noWrap
            customStyle={{
              wordBreak: 'keep-all'
            }}
          >
            안전결제수수료 무료 이벤트
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
        <Flexbox direction="vertical" gap={12} alignment="center">
          <Chip variant="solid" brandColor="black">
            <Typography
              weight="bold"
              color="uiWhite"
              customStyle={{ textAlign: 'center', width: '100%' }}
            >
              이벤트 내용
            </Typography>
          </Chip>
          <Typography weight="bold" variant="h2" customStyle={{ textAlign: 'center' }}>
            APP 설치 및 가입 후,
            <br />
            결제 시 자동으로 할인 적용
          </Typography>
        </Flexbox>
        <Flexbox direction="vertical" gap={12} alignment="center">
          <Chip variant="solid" brandColor="black">
            <Typography
              weight="bold"
              textAlign="center"
              color="uiWhite"
              customStyle={{ width: '100%' }}
            >
              이벤트 기간
            </Typography>
          </Chip>
          <Typography weight="bold" variant="h2" textAlign="center">
            7월 31일(월)까지
          </Typography>
        </Flexbox>
        <Flexbox direction="vertical" gap={12} alignment="center">
          <Chip variant="solid" brandColor="black">
            <Typography
              weight="bold"
              color="uiWhite"
              customStyle={{ textAlign: 'center', width: '100%' }}
            >
              혜택
            </Typography>
          </Chip>
          <Typography weight="bold" variant="h2" customStyle={{ textAlign: 'center' }}>
            안전결제수수료 무료
          </Typography>
          <Image
            src={getImageResizePath({
              imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/events/app-first-payment-event-benefit-2.png`,
              w: 390
            })}
            alt="App First Event Main Img"
            disableAspectRatio
            customStyle={{
              marginTop: 20
            }}
          />
        </Flexbox>
        <Box customStyle={{ borderTop: '1px solid #DCDDE0', paddingTop: 52 }}>
          <Typography weight="bold">안내사항</Typography>
          <InfoList>
            <li>
              <Typography variant="h4" color="ui60">
                결제가 판매자에 의해 취소된 경우, 본 이벤트가 자동으로 다시 적용됩니다.
              </Typography>
            </li>
            <li>
              <Typography variant="h4" color="ui60">
                부정한 방법으로 이벤트에 참여한 경우 결제가 취소되거나 계정이 정지될 수 있습니다.
              </Typography>
            </li>
            <li>
              <Typography variant="h4" color="ui60">
                내부 의사결정 및 상황에 따라 사전 공지 없이 종료될 수 있습니다. 늦지 않게
                참여해보세요!
              </Typography>
            </li>
          </InfoList>
          <Typography />
        </Box>
      </Flexbox>
    </GeneralTemplate>
  );
}

const InfoList = styled.ul`
  /* text-indent: -1px; */
  margin-top: 12px;
  margin-left: 15px;
  li {
    padding-left: 5px;
    position: relative;
    margin-bottom: 5px;
  }
  li:before {
    content: '';
    display: block;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #7b7d85;
    position: absolute;
    left: -10px;
    top: 7px;
  }
`;

export default AppFirstPayment;
