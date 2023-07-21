/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';
import type { MouseEvent } from 'react';

import { Box, Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

function QnaList({ type }: { type?: 'operator' }) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [hideAnswer, setHideAnswer] = useState<number[]>([]);

  const handleClickArcodian = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget.dataset;
    if (hideAnswer.includes(Number(target.num))) {
      setHideAnswer(hideAnswer.filter((answer) => answer !== Number(target.num)));
    } else {
      setHideAnswer((answer) => [...answer, Number(target.num)]);
    }
  };

  return (
    <>
      <Box customStyle={{ padding: '32px 0' }}>
        <Typography
          weight="bold"
          variant="h3"
          customStyle={{ borderBottom: `2px solid ${common.ui20}`, paddingBottom: 20 }}
        >
          자주 묻는 질문
        </Typography>
      </Box>
      <Flexbox direction="vertical" gap={32} customStyle={{ marginBottom: 200 }}>
        {!type && (
          <>
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
                    <th>
                      <Typography weight="medium" variant="body2">
                        매물금액
                      </Typography>
                    </th>
                    <th>
                      <Typography weight="medium" variant="body2">
                        정산기간
                      </Typography>
                    </th>
                  </tr>
                  <tr>
                    <td>
                      <Typography variant="body2">300만원 미만</Typography>
                    </td>
                    <td>
                      <Typography variant="body2">구매확정 +1 영업일</Typography>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Typography variant="body2">300만원 이상</Typography>
                    </td>
                    <td>
                      <Typography variant="body2">거래확인 후 지급</Typography>
                    </td>
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
                  정가품이 불안한 경우라면 카멜 하단 "사진감정" 탭에서 판매자에게 받은 사진으로
                  정가품 감정을 신청해보세요. 신청자는 실시간으로 감정사의 의견을 받을 수 있습니다.
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
                    <th>
                      <Typography weight="medium" variant="body2">
                        결제수단
                      </Typography>
                    </th>
                    <th>
                      <Typography weight="medium" variant="body2">
                        환불기간
                      </Typography>
                    </th>
                  </tr>
                  <tr>
                    <td>
                      <Typography variant="body2">신용카드</Typography>
                    </td>
                    <td>
                      <Typography variant="body2">즉시 취소(각 카드사별 상이)</Typography>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Typography variant="body2">300만원 미만</Typography>
                    </td>
                    <td>
                      <Typography variant="body2">
                        17시 이전: 당일 환불
                        <br />
                        17시 이후: +1 영업일 환불
                      </Typography>
                    </td>
                  </tr>
                </Table>
              </AnswerContent>
            </Box>
          </>
        )}
        <Box
          customStyle={{
            borderBottom: hideAnswer.includes(5) ? 'none' : `1px solid ${common.line01}`,
            paddingBottom: hideAnswer.includes(5) ? 0 : 32
          }}
        >
          <Flexbox
            alignment="center"
            justifyContent="space-between"
            customStyle={{ width: '100%', position: 'relative', zIndex: 1 }}
            data-num={5}
            onClick={handleClickArcodian}
          >
            <Typography weight="medium" variant="h4">
              구매대행한 매물의 취소/반품이 가능한가요?
            </Typography>
            <Icon
              name={hideAnswer.includes(5) ? 'Arrow2UpOutlined' : 'Arrow2DownOutlined'}
              color="ui60"
            />
          </Flexbox>
          <AnswerContent isOpen={hideAnswer.includes(5)}>
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
            borderBottom: hideAnswer.includes(6) ? 'none' : `1px solid ${common.line01}`,
            paddingBottom: hideAnswer.includes(6) ? 0 : 32
          }}
        >
          <Flexbox
            alignment="center"
            justifyContent="space-between"
            customStyle={{ width: '100%', position: 'relative', zIndex: 1 }}
            data-num={6}
            onClick={handleClickArcodian}
          >
            <Typography weight="medium" variant="h4">
              구매대행 수수료를 알고싶어요.
            </Typography>
            <Icon
              name={hideAnswer.includes(6) ? 'Arrow2UpOutlined' : 'Arrow2DownOutlined'}
              color="ui60"
            />
          </Flexbox>
          <AnswerContent isOpen={hideAnswer.includes(6)}>
            <Typography customStyle={{ wordBreak: 'keep-all' }}>
              구매대행 수수료는 구매하시는 플랫폼별로 다르게 적용됩니다. 약 2~8%사이의 수수료가
              적용됩니다.
            </Typography>
          </AnswerContent>
        </Box>
        <Box
          customStyle={{
            borderBottom: hideAnswer.includes(7) ? 'none' : `1px solid ${common.line01}`,
            paddingBottom: hideAnswer.includes(7) ? 0 : 32
          }}
        >
          <Flexbox
            alignment="center"
            justifyContent="space-between"
            customStyle={{ width: '100%', position: 'relative', zIndex: 1 }}
            data-num={7}
            onClick={handleClickArcodian}
          >
            <Typography weight="medium" variant="h4">
              구매대행 상담 시간이 어떻게 되나요?
            </Typography>
            <Icon
              name={hideAnswer.includes(7) ? 'Arrow2UpOutlined' : 'Arrow2DownOutlined'}
              color="ui60"
            />
          </Flexbox>
          <AnswerContent isOpen={hideAnswer.includes(7)}>
            <Typography customStyle={{ wordBreak: 'keep-all' }}>
              평일 10시 ~ 19시까지 운영됩니다.
              <br />
              <br />
              운영시간이 아닌 때에 문의주신 내용은 잊지 않고 순차적으로 답변드릴게요.
            </Typography>
          </AnswerContent>
        </Box>
        <Box
          customStyle={{
            borderBottom: hideAnswer.includes(8) ? 'none' : `1px solid ${common.line01}`,
            paddingBottom: hideAnswer.includes(8) ? 0 : 32
          }}
        >
          <Flexbox
            alignment="center"
            justifyContent="space-between"
            customStyle={{ width: '100%', position: 'relative', zIndex: 1 }}
            data-num={8}
            onClick={handleClickArcodian}
          >
            <Typography weight="medium" variant="h4">
              당근마켓 구매대행이 가능한 지역은 어디인가요?
            </Typography>
            <Icon
              name={hideAnswer.includes(8) ? 'Arrow2UpOutlined' : 'Arrow2DownOutlined'}
              color="ui60"
            />
          </Flexbox>
          <AnswerContent isOpen={hideAnswer.includes(8)}>
            <Typography customStyle={{ wordBreak: 'keep-all' }}>
              수도권 주요지역과 광역시의 매물을 지원하고 있어요.
              <br />
              더 많은 지역이 오픈 준비중이에요.
              <br />
              <br />
              당근마켓 구매대행 가능 지역
              <br />- 서울, 인천, 판교, 대전, 광주, 대구, 부산
            </Typography>
          </AnswerContent>
        </Box>
      </Flexbox>
    </>
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

export default QnaList;
