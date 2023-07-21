import { useEffect } from 'react';

import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Flexbox,
  Icon,
  Image,
  Label,
  Typography,
  useTheme
} from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getImageResizePath } from '@utils/common';

function LegitFree() {
  const {
    theme: { zIndex }
  } = useTheme();

  const router = useRouter();

  useEffect(() => {
    logEvent(attrKeys.events.VIEW_EVENT_DETAIL, {
      att: 'OPERATOR_FEE_LEGIT'
    });
  }, []);

  return (
    <GeneralTemplate
      customStyle={{ height: 'fit-content' }}
      header={
        <Header
          rightIcon={<Box customStyle={{ width: 72 }} />}
          leftIcon={
            <Icon
              name="CloseOutlined"
              customStyle={{ marginLeft: 16 }}
              onClick={() => router.push('/')}
            />
          }
        >
          <Typography weight="bold" variant="h3">
            무료 정품검수 이벤트
          </Typography>
        </Header>
      }
      footer={
        <Flexbox
          direction="vertical"
          alignment="center"
          justifyContent="center"
          customStyle={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            zIndex: zIndex.button + 1
          }}
        >
          <Box customStyle={{ padding: '0 20px 20px 20px', width: '100%' }}>
            <Button
              fullWidth
              variant="solid"
              brandColor="primary"
              size="xlarge"
              onClick={() => {
                logEvent(attrKeys.products.CLICK_PRODUCT_LIST, {
                  name: attrProperty.name.EVENT_DETAIL,
                  att: 'OPERATOR_FEE_LEGIT'
                });

                router.push({
                  pathname: '/products',
                  query: {
                    minPrice: 200000
                  }
                });
              }}
            >
              구매대행 가능한 매물보기
            </Button>
          </Box>
        </Flexbox>
      }
    >
      <Flexbox direction="vertical" gap={52} customStyle={{ marginBottom: 100 }}>
        <Box customStyle={{ marginLeft: -20, width: 'calc(100% + 40px)' }}>
          <Image
            src={getImageResizePath({
              imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/guide/operator_legit_free01.png`,
              w: 350
            })}
            alt="카멜 구매대행으로 구매하면 정품검수 무료"
            disableAspectRatio
          />
        </Box>
        <Flexbox direction="vertical" alignment="center" gap={12}>
          <Label
            text={
              <Typography weight="medium" color="uiWhite">
                이벤트 내용
              </Typography>
            }
            variant="solid"
            brandColor="black"
            round={36}
            customStyle={{ padding: '4px 8px', height: 28 }}
          />
          <Box customStyle={{ textAlign: 'center', marginBottom: 8 }}>
            <Typography weight="bold" variant="h2">
              카멜 구매대행 대상 매물 구매하고
              <br />
              무료로 정품검수 받아보세요.
            </Typography>
            <Typography variant="h3" color="ui60" customStyle={{ marginTop: 4 }}>
              일부 브랜드 제외 (나이키)
            </Typography>
          </Box>
          <Image
            src={getImageResizePath({
              imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/guide/operator_legit_free02-1.png`,
              w: 350
            })}
            alt="카멜 구매대행 대상 매물 구매하고 무료로 정품 검수 받아보세요"
            disableAspectRatio
          />
        </Flexbox>
        <Flexbox direction="vertical" alignment="center" gap={12}>
          <Label
            text={
              <Typography weight="medium" color="uiWhite">
                이벤트 기간
              </Typography>
            }
            variant="solid"
            brandColor="black"
            round={36}
            customStyle={{ padding: '4px 8px', height: 28 }}
          />
          <Box customStyle={{ textAlign: 'center', marginBottom: 8 }}>
            <Typography weight="bold" variant="h2">
              7월 31일(월)까지
            </Typography>
            <Typography variant="h3" color="ui60" customStyle={{ marginTop: 4 }}>
              호응에 따라 연장되거나
              <br />
              조기종료 될 수 있어요
            </Typography>
          </Box>
        </Flexbox>
        <Flexbox direction="vertical" alignment="center" gap={12}>
          <Label
            text={
              <Typography weight="medium" color="uiWhite">
                혜택
              </Typography>
            }
            variant="solid"
            brandColor="black"
            round={36}
            customStyle={{ padding: '4px 8px', height: 28 }}
          />
          <Box customStyle={{ textAlign: 'center', marginBottom: 8 }}>
            <Typography weight="bold" variant="h2">
              정품검수 무료
            </Typography>
            <Typography variant="h3" color="ui60" customStyle={{ marginTop: 4 }}>
              혹시라도 가품으로 판명되면,
              <br />
              취소 및 전액 환불해드려요
            </Typography>
          </Box>
          <Image
            src={getImageResizePath({
              imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/guide/operator_legit_free03.png`,
              w: 350
            })}
            alt="모든 플랫폼, 전국 매물을 구매문의부터 직거래 대행까지 정품검수로 사기없이 안전결제"
            disableAspectRatio
          />
        </Flexbox>
        <Box customStyle={{ borderTop: '1px solid #DCDDE0', paddingTop: 52 }}>
          <Typography weight="bold">안내사항</Typography>
          <InfoList>
            <li>
              <Typography variant="h4" color="ui60">
                본 이벤트는 카멜 구매대행 한정으로 진행됩니다.
              </Typography>
            </li>
            <li>
              <Typography variant="h4" color="ui60">
                정품검수 가능한 브랜드 및 모델 대상입니다.
              </Typography>
            </li>
            <li>
              <Typography variant="h4" color="ui60">
                정품검수 후 가품으로 판정되는 경우 거래액의 100%를 보상해드립니다.
              </Typography>
            </li>
            <li>
              <Typography variant="h4" color="ui60">
                가품 판명을 통한 전액 환불을 원할 시, 물품은 수취 직후 개봉 영상 촬영 등을 통해 동일
                물품 여부를 확인할 수 있어야 합니다.
              </Typography>
            </li>
            <li>
              <Typography variant="h4" color="ui60">
                가품 판명의 기준은 한국명품감정원, 한국정품감정원, 한국동산감정원, 라올스,
                고이비토감정원의 의견에 한하며, 구체적인 확인 절차가 있을 수 있습니다.
              </Typography>
            </li>
            <li>
              <Typography variant="h4" color="ui60">
                부정한 방법으로 이벤트에 참여한 경우 결제가 취소되거나 계정이 정지될 수 있습니다.
              </Typography>
            </li>
            <li>
              <Typography variant="h4" color="ui60">
                내부 의사결정 및 상황에 따라 사전 공지 없이 종료되거나 연장될 수 있습니다.
              </Typography>
            </li>
          </InfoList>
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
    word-break: keep-all;
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

export default LegitFree;
