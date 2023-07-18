import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Flexbox,
  Icon,
  Image,
  ThemeProvider,
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

function Operaytor() {
  const {
    theme: {
      palette: { common },
      zIndex
    }
  } = useTheme();

  const router = useRouter();

  const [hideAnswer, setHideAnswer] = useState<number[]>([]);

  const handleClickArcodian = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget.dataset;
    if (hideAnswer.includes(Number(target.num))) {
      setHideAnswer(hideAnswer.filter((answer) => answer !== Number(target.num)));
    } else {
      setHideAnswer((answer) => [...answer, Number(target.num)]);
    }
  };

  useEffect(() => {
    logEvent(attrKeys.guide.VIEW_CAMEL_GUIDE, {
      title: attrProperty.title.OPERATOR
    });
  }, []);

  return (
    <ThemeProvider theme="dark">
      <GeneralTemplate
        customStyle={{ height: 'fit-content' }}
        header={
          <Header
            hideTitle
            rightIcon={<div />}
            leftIcon={
              <Icon
                name="CloseOutlined"
                customStyle={{ marginLeft: 16 }}
                onClick={() => router.back()}
              />
            }
          />
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
            <Box
              customStyle={{
                background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, #000 100%)',
                height: 32,
                width: '100%',
                marginBottom: -5
              }}
            />
            <Box customStyle={{ padding: '0 20px 20px 20px', width: '100%', background: 'black' }}>
              <Button
                fullWidth
                variant="solid"
                brandColor="primary"
                size="xlarge"
                onClick={() => router.back()}
              >
                계속 거래하기
              </Button>
            </Box>
          </Flexbox>
        }
      >
        <Flexbox direction="vertical" gap={30} customStyle={{ marginBottom: 52 }}>
          <Box>
            <Image
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/guide/operator_guide01.png`,
                w: 350
              })}
              alt="예시 채팅 이미지"
              disableAspectRatio
            />
          </Box>
          <Box>
            <Image
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/guide/operator_guide02.png`,
                w: 350
              })}
              alt="전국 중고명품 대신 거래해드려요!"
              disableAspectRatio
            />
          </Box>
          <Box>
            <Image
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/guide/operator_guide03.png`,
                w: 350
              })}
              alt="모든 플랫폼, 전국 매물을 구매문의부터 직거래 대행까지 정품검수로 사기없이 안전결제"
              disableAspectRatio
            />
          </Box>
          <Box>
            <Image
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/guide/operator_guide04.png`,
                w: 350
              })}
              alt="카멜 구매대행 어떻게 진행되나요?"
              disableAspectRatio
            />
          </Box>
        </Flexbox>
        <Box customStyle={{ paddingBottom: 32 }}>
          <Typography
            weight="bold"
            variant="h3"
            customStyle={{ borderBottom: `2px solid ${common.uiWhite}`, paddingBottom: 20 }}
          >
            자주 묻는 질문
          </Typography>
        </Box>
        <Flexbox direction="vertical" gap={32} customStyle={{ marginBottom: 200 }}>
          <Box
            customStyle={{
              borderBottom: hideAnswer.includes(1) ? 'none' : `1px solid ${common.line01}`,
              paddingBottom: hideAnswer.includes(1) ? 0 : 32
            }}
          >
            <Flexbox
              alignment="center"
              justifyContent="space-between"
              customStyle={{ width: '100%', position: 'relative', zIndex: 1 }}
              data-num={1}
              onClick={handleClickArcodian}
            >
              <Typography weight="medium" variant="h4">
                구매대행한 매물의 취소/반품이 가능한가요?
              </Typography>
              <Icon
                name={hideAnswer.includes(1) ? 'Arrow2UpOutlined' : 'Arrow2DownOutlined'}
                color="ui60"
              />
            </Flexbox>
            <AnswerContent isOpen={hideAnswer.includes(1)}>
              <Typography customStyle={{ wordBreak: 'keep-all' }}>
                구매대행 (카멜이 판매자에게 매물을 구매) 이 시작되기 전에는 취소가 가능해요.
                <br />
                <br />
                하지만 구매대행이 시작된 이후에는 개인간 거래로 전자상거래법(제17조)에 따른
                청약철회(환불, 교환) 규정이 적용되지 않아 반품 또는 취소가 불가능해요.
                <br />
                <br />
                결제 전 꼼꼼히 확인 후 결제해주세요.
              </Typography>
            </AnswerContent>
          </Box>
          <Box
            customStyle={{
              borderBottom: hideAnswer.includes(2) ? 'none' : `1px solid ${common.line01}`,
              paddingBottom: hideAnswer.includes(2) ? 0 : 32
            }}
          >
            <Flexbox
              alignment="center"
              justifyContent="space-between"
              customStyle={{ width: '100%', position: 'relative', zIndex: 1 }}
              data-num={2}
              onClick={handleClickArcodian}
            >
              <Typography weight="medium" variant="h4">
                구매대행 수수료를 알고싶어요.
              </Typography>
              <Icon
                name={hideAnswer.includes(2) ? 'Arrow2UpOutlined' : 'Arrow2DownOutlined'}
                color="ui60"
              />
            </Flexbox>
            <AnswerContent isOpen={hideAnswer.includes(2)}>
              <Typography customStyle={{ wordBreak: 'keep-all' }}>
                구매대행 수수료는 구매하시는 플랫폼별로 다르게 적용됩니다. 약 2~8%사이의 수수료가
                적용됩니다.
              </Typography>
            </AnswerContent>
          </Box>
          <Box
            customStyle={{
              borderBottom: hideAnswer.includes(3) ? 'none' : `1px solid ${common.line01}`,
              paddingBottom: hideAnswer.includes(3) ? 0 : 32
            }}
          >
            <Flexbox
              alignment="center"
              justifyContent="space-between"
              customStyle={{ width: '100%', position: 'relative', zIndex: 1 }}
              data-num={3}
              onClick={handleClickArcodian}
            >
              <Typography weight="medium" variant="h4">
                구매대행 상담 시간이 어떻게 되나요?
              </Typography>
              <Icon
                name={hideAnswer.includes(3) ? 'Arrow2UpOutlined' : 'Arrow2DownOutlined'}
                color="ui60"
              />
            </Flexbox>
            <AnswerContent isOpen={hideAnswer.includes(3)}>
              <Typography customStyle={{ wordBreak: 'keep-all' }}>
                평일 10시 ~ 19시까지 운영됩니다.
                <br />
                <br />
                운영시간이 아닌 때에 문의주신 내용은 잊지 않고 순차적으로 답변드릴게요.
              </Typography>
            </AnswerContent>
          </Box>
        </Flexbox>
      </GeneralTemplate>
    </ThemeProvider>
  );
}

const AnswerContent = styled.div<{ isOpen: boolean }>`
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui95};
  margin-top: ${({ isOpen }) => (isOpen ? 32 : 0)}px;
  transition: all 0.2s ease-in-out;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  height: ${({ isOpen }) => (isOpen ? 'auto' : 0)};
  padding: ${({ isOpen }) => (isOpen ? '20px' : '0 20px')};
  div {
    height: ${({ isOpen }) => (isOpen ? 'auto' : 0)};
    opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  }
  word-break: keep-all;
`;

export default Operaytor;
