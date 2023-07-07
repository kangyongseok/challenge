/* eslint-disable react/no-unescaped-entities */
import { useEffect, useRef, useState } from 'react';
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

import attrKeys from '@constants/attrKeys';

import { getImageResizePath } from '@utils/common';

function PurchasingInfo() {
  const {
    theme: {
      palette: { common },
      zIndex
    }
  } = useTheme();

  const step2Ref = useRef(null);

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
    if (router.query.step === '2') {
      setTimeout(() => {
        const { offsetTop } = step2Ref.current as unknown as HTMLElement;
        window.scrollTo({
          top: offsetTop - 100,
          behavior: 'smooth'
        });
      }, 300);
    }
  }, [router.query.step]);

  useEffect(() => {
    logEvent(attrKeys.productOrder.VIEW_CAMEL_GUIDE);
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
        <Flexbox direction="vertical" gap={12} customStyle={{ marginBottom: 52 }}>
          <Box>
            <Image
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/product-order/operator_fee_info01.png`,
                w: 350
              })}
              alt="믿고 거래하는 카멜 중고거래"
              disableAspectRatio
            />
          </Box>
          <Box>
            <Image
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/product-order/operator_fee_info02.png`,
                w: 350
              })}
              alt="카멜 안전결제란?"
              disableAspectRatio
            />
          </Box>
          <Box ref={step2Ref}>
            <Image
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/product-order/operator_fee_info03.png`,
                w: 350
              })}
              alt="전국 중고명품, 카멜이 대신 거래해드려요"
              disableAspectRatio
            />
          </Box>
          <Box>
            <Image
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/product-order/operator_fee_info04.png`,
                w: 350
              })}
              alt="카멜 인증판매자와 안심하고 거래하세요"
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
                판매한 매물의 정산금은 언제 입금 되나요?
              </Typography>
              <Icon
                name={hideAnswer.includes(1) ? 'Arrow2UpOutlined' : 'Arrow2DownOutlined'}
                color="ui60"
              />
            </Flexbox>
            <AnswerContent isOpen={hideAnswer.includes(1)}>
              <Typography customStyle={{ wordBreak: 'keep-all' }}>
                구매자가 구매확정을 한 이후에 정산됩니다.
                <br />
                <br />
                만약 구매자가 구매확정을 하지 않았다면 배송완료 기준 7일 후 정산됩니다. <br />
                <br />
                자세한 내용은 아래 표를 확인해주세요.
              </Typography>
              <Table>
                <tr>
                  <th>매물금액</th>
                  <th>정산기간</th>
                </tr>
                <tr>
                  <td>300만원 미만</td>
                  <td>구매확정 +1 영업일</td>
                </tr>
                <tr>
                  <td>300만원 이상</td>
                  <td>거래확인 후 지급</td>
                </tr>
              </Table>
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
                정품이 아닐 경우, 보상을 받을 수 있나요?
              </Typography>
              <Icon
                name={hideAnswer.includes(2) ? 'Arrow2UpOutlined' : 'Arrow2DownOutlined'}
                color="ui60"
              />
            </Flexbox>
            <AnswerContent isOpen={hideAnswer.includes(2)}>
              <Typography customStyle={{ wordBreak: 'keep-all' }}>
                정품이 아닐 경우, 해당 판매자와 협의해야 하는 부분이며 카멜은 통신판매중개자로서
                상품 정보 및 거래에 대해 관여하지 않습니다.
                <br />
                <br />
                다만, 카멜인증 매물일 경우 정품 보장을 하고 있으며, 정품이 아닐 경우 환불
                가능합니다.
                <br />
                <br />
                정가품이 불안한 경우라면 카멜 하단 "사진감정" 탭에서 판매자에게 받은 사진으로 정가품
                감정을 신청해보세요. 신청자는 실시간으로 감정사의 의견을 받을 수 있습니다.
                <br />
                <br />
                추후, 실물감정 및 검수 이후 더욱 마음 놓고 구매하실 수 있는 서비스도 오픈할
                예정입니다.
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
                거래를 취소하려면 어떻게 하나요?
              </Typography>
              <Icon
                name={hideAnswer.includes(3) ? 'Arrow2UpOutlined' : 'Arrow2DownOutlined'}
                color="ui60"
              />
            </Flexbox>
            <AnswerContent isOpen={hideAnswer.includes(3)}>
              <Typography customStyle={{ wordBreak: 'keep-all' }}>
                지금은 1:1 문의를 통해 문의해주시면, 처리해 드리고 있습니다.
                <br />
                <br />
                추후 거래내역 또는 해당매물과 관련된 채팅창에서 처리할 수 있습니다.
              </Typography>
            </AnswerContent>
          </Box>
          <Box
            customStyle={{
              borderBottom: hideAnswer.includes(4) ? 'none' : `1px solid ${common.line01}`,
              paddingBottom: hideAnswer.includes(4) ? 0 : 32
            }}
          >
            <Flexbox
              alignment="center"
              justifyContent="space-between"
              customStyle={{ width: '100%', position: 'relative', zIndex: 1 }}
              data-num={4}
              onClick={handleClickArcodian}
            >
              <Typography weight="medium" variant="h4">
                거래를 취소했어요. 환불은 언제 되나요?
              </Typography>
              <Icon
                name={hideAnswer.includes(4) ? 'Arrow2UpOutlined' : 'Arrow2DownOutlined'}
                color="ui60"
              />
            </Flexbox>
            <AnswerContent isOpen={hideAnswer.includes(4)}>
              <Typography customStyle={{ wordBreak: 'keep-all' }}>
                결제수단별로 환불일이 다르게 적용됩니다.
                <br />
                <br />
                자세한 내용은 아래 표를 확인해주세요.
              </Typography>
              <Table>
                <tr>
                  <th>결제수단</th>
                  <th>환불기간</th>
                </tr>
                <tr>
                  <td>신용카드</td>
                  <td>즉시 취소(각 카드사별 상이)</td>
                </tr>
                <tr>
                  <td>300만원 미만</td>
                  <td>
                    17시 이전: 당일 환불
                    <br />
                    17시 이후: +1 영업일 환불
                  </td>
                </tr>
              </Table>
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

const Table = styled.table`
  text-align: left;
  width: 100%;
  margin-top: 21px;
  tr {
    border-top: 1px solid
      ${({
        theme: {
          palette: { common }
        }
      }) => common.line01};
  }
  th,
  td {
    padding: 9px 0;
    font-size: 12px;
    vertical-align: top;
    color: white;
  }
  th:first-of-type,
  td:first-of-type {
    border-right: 1px solid
      ${({
        theme: {
          palette: { common }
        }
      }) => common.line01};
  }
  th:last-child,
  td:last-child {
    padding-left: 8px;
  }
`;

export default PurchasingInfo;
