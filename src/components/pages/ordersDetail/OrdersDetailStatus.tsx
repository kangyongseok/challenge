import { Fragment, useEffect } from 'react';
import type { MouseEvent } from 'react';

import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import { Box, Button, Flexbox, Icon, Skeleton, Typography } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';
import { useTheme } from '@emotion/react';

import { logEvent } from '@library/amplitude';

import { fetchUserAccounts } from '@api/user';
import { putProductUpdateStatus } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/formats';
import getOrderType from '@utils/common/getOrderType';
import { copyToClipboard } from '@utils/common';

import { circlePulse } from '@styles/transition';

import { settingsAccountData } from '@recoil/settingsAccount';
import {
  ordersDetailOpenCancelRequestApproveDialogState,
  ordersDetailOpenCancelRequestRefuseDialogState,
  ordersDetailOpenDeliveryCompleteConfirmDialogState,
  ordersDetailOpenDeliveryStatusFrameState,
  ordersDetailOpenEmptyInvoiceNumberDialogState,
  ordersDetailOpenInvoiceNumberDialogState,
  ordersDetailOpenSalesApproveDialogState,
  ordersDetailPurchaseConfirmDialogState,
  ordersDetailSalesCancelDialogState
} from '@recoil/ordersDetail';
import useSession from '@hooks/useSession';
import useQueryOrder from '@hooks/useQueryOrder';
import useOrderStatus from '@hooks/useOrderStatus';

function OrdersDetailStatus() {
  const router = useRouter();
  const { id } = router.query;

  const {
    palette: { secondary, common },
    typography: { body2 }
  } = useTheme();

  const setOpenSalesApproveDialogState = useSetRecoilState(ordersDetailOpenSalesApproveDialogState);
  const setOpenInvoiceNumberDialogState = useSetRecoilState(
    ordersDetailOpenInvoiceNumberDialogState
  );
  const setPurchaseConfirmDialogState = useSetRecoilState(ordersDetailPurchaseConfirmDialogState);
  const setOpenCancelRequestApproveDialogState = useSetRecoilState(
    ordersDetailOpenCancelRequestApproveDialogState
  );
  const setSalesCancelDialogState = useSetRecoilState(ordersDetailSalesCancelDialogState);
  const setOpenEmptyInvoiceNumberDialogState = useSetRecoilState(
    ordersDetailOpenEmptyInvoiceNumberDialogState
  );
  const setOpenCancelRequestRefuseDialogState = useSetRecoilState(
    ordersDetailOpenCancelRequestRefuseDialogState
  );
  const setOpenDeliveryStatusFrameState = useSetRecoilState(
    ordersDetailOpenDeliveryStatusFrameState
  );
  const setOpenDeliveryCompleteConfirmDialog = useSetRecoilState(
    ordersDetailOpenDeliveryCompleteConfirmDialogState
  );
  const resetAccountDataState = useResetRecoilState(settingsAccountData);

  const toastStack = useToastStack();
  const { isLoggedInWithSMS } = useSession();
  const {
    data,
    data: { id: orderId, channelId, hold, type, reviewFormInfo, additionalInfo } = {}
  } = useQueryOrder({ id: Number(id) });
  const orderStatus = useOrderStatus({ order: data });

  const { data: userAccounts = [] } = useQuery(
    queryKeys.users.userAccounts(),
    () => fetchUserAccounts(),
    {
      enabled: isLoggedInWithSMS
    }
  );

  const { mutate, isLoading } = useMutation(putProductUpdateStatus);

  const handleClick = () => {
    if (!data?.orderPayments[0]?.data) return;

    copyToClipboard(data?.orderPayments[0]?.data);
    toastStack({
      children: '계좌번호가 복사되었어요!'
    });
  };

  const handleClickSettingAccount = () => {
    resetAccountDataState();

    router.push('/mypage/settings/account');
  };

  const handleClickReviewWrite = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    const { productId, targetUserName, targetUserId, isTargetUserSeller } = reviewFormInfo || {};

    logEvent(attrKeys.mypage.CLICK_REVIEW_SEND, {
      name: attrProperty.name.ORDER_LIST,
      productId,
      orderId,
      channelId,
      att: isTargetUserSeller ? 'BUYER' : 'SELLER'
    });

    if (isTargetUserSeller) {
      router.push({
        pathname: '/user/reviews/form',
        query: {
          productId,
          targetUserName: targetUserName || `회원${targetUserId}`,
          targetUserId,
          isTargetUserSeller,
          orderId,
          channelId
        }
      });
    } else {
      mutate(
        {
          productId: Number(productId),
          status: 1,
          soldType: 1,
          targetUserId: Number(targetUserId)
        },
        {
          onSuccess() {
            router.push({
              pathname: '/user/reviews/form',
              query: {
                productId,
                targetUserName: targetUserName || `회원${targetUserId}`,
                targetUserId,
                isTargetUserSeller,
                orderId,
                channelId
              }
            });
          }
        }
      );
    }
  };

  useEffect(() => {
    if (typeof type !== 'number' || !orderStatus.name) return;

    logEvent(attrKeys.orderDetail.VIEW_ORDER_DETAIL, {
      name: attrProperty.name.ORDER_DETAIL,
      orderId,
      productId: additionalInfo?.product?.id,
      type: getOrderType(type),
      att: orderStatus.overlayText
    });
  }, [type, orderStatus, orderId, additionalInfo]);

  return (
    <Box
      component="section"
      customStyle={{
        padding: '32px 20px'
      }}
    >
      {orderStatus.transactionMethod === '카멜 구매대행' && (
        <Typography
          variant="h4"
          weight="bold"
          color="primary-light"
          customStyle={{
            marginBottom: 4
          }}
        >
          카멜 구매대행
        </Typography>
      )}
      {!orderStatus.displayText && (
        <Flexbox direction="vertical" gap={12}>
          <Skeleton width={85} height={32} round={8} disableAspectRatio />
          <Skeleton width="100%" height={40} round={8} disableAspectRatio />
        </Flexbox>
      )}
      <Typography variant="h2" weight="bold">
        {orderStatus.displayText}
      </Typography>
      {orderStatus.description && (
        <Typography
          variant="h4"
          customStyle={{
            marginTop: 12,
            '& > .mt-8': {
              marginTop: 8
            },
            '& > .ui60': {
              color: common.ui60
            },
            '& > .b2': {
              fontSize: body2.size,
              lineHeight: body2.lineHeight,
              letterSpacing: body2.letterSpacing
            },
            '& > span': {
              color: secondary.red.light
            }
          }}
          dangerouslySetInnerHTML={{
            __html: orderStatus.description
          }}
        />
      )}
      {orderStatus.isSeller &&
        orderStatus.name === '정산대기' &&
        orderStatus.transactionMethod !== '카멜 구매대행' && (
          <Typography
            variant="h4"
            customStyle={{
              marginTop: 12
            }}
          >
            판매한 물건이 구매확정되었어요.
            {userAccounts.length === 0 && (
              <>
                <br />
                정산 받을 계좌를 입력해주세요.
              </>
            )}
          </Typography>
        )}
      {!orderStatus.isSeller && orderStatus.name === '환불대기' && !orderStatus.isExpired && (
        <Typography
          variant="h4"
          customStyle={{
            marginTop: 12
          }}
        >
          거래가 취소되었어요.{userAccounts.length === 0 ? ' 환불 받을 계좌를 입력해주세요.' : ''}
        </Typography>
      )}
      {orderStatus.name === '결제진행' && orderStatus.paymentMethod === '무통장입금' && (
        <Flexbox
          direction="vertical"
          alignment="center"
          gap={8}
          customStyle={{
            marginTop: 32,
            padding: 20,
            border: `1px solid ${common.line01}`,
            borderRadius: 8,
            boxShadow: '0px 1px 4px 0px rgba(0, 0, 0, 0.08)'
          }}
        >
          <Typography variant="h4">
            {data?.orderPayments[0]?.agencyName} {data?.orderPayments[0]?.data}
          </Typography>
          <Typography variant="h3" weight="bold" color="red-light">
            {commaNumber(data?.totalPrice || 0)}원
          </Typography>
          <Button
            variant="ghost"
            brandColor="black"
            size="large"
            fullWidth
            onClick={handleClick}
            customStyle={{
              marginTop: 12
            }}
          >
            계좌번호 복사
          </Button>
        </Flexbox>
      )}
      {!orderStatus.isSeller &&
        orderStatus.name === '배송진행' &&
        orderStatus.otherDeliveryMethod && (
          <Flexbox
            gap={8}
            customStyle={{
              marginTop: 12
            }}
          >
            <Flexbox
              direction="vertical"
              gap={8}
              customStyle={{
                width: '100%',
                padding: 12,
                borderRadius: 7,
                backgroundColor: common.bg02
              }}
            >
              <Typography variant="body2" color="ui60">
                배송방법
              </Typography>
              <Typography variant="h4">{orderStatus.otherDeliveryMethod}</Typography>
            </Flexbox>
          </Flexbox>
        )}
      {orderStatus.stepperValues.length > 0 && (
        <Flexbox
          alignment="center"
          justifyContent="space-between"
          gap={8}
          customStyle={{
            padding: '34px 30px',
            minHeight: 24
          }}
        >
          {orderStatus.stepperValues.map(({ name, text, subText }, index) => {
            if (name === 'active') {
              return (
                <Fragment key={`order-status-stepper-${name}-${text}`}>
                  <ActiveDotWrapper>
                    <ActiveDot text={text} subText={subText} />
                  </ActiveDotWrapper>
                  {index !== (orderStatus.stepperValues.length || 0) - 1 && (
                    <Box
                      customStyle={{
                        flex: 1,
                        height: 1,
                        backgroundColor: common.line01
                      }}
                    />
                  )}
                </Fragment>
              );
            }

            if (name === 'complete' || name === 'completeWithActive') {
              return (
                <Fragment key={`order-status-stepper-${name}-${text}`}>
                  <CompleteDot
                    text={text}
                    subText={subText}
                    isActive={name === 'completeWithActive'}
                  >
                    <Icon name="CheckCircleFilled" color="primary-light" />
                  </CompleteDot>
                  {index !== (orderStatus?.stepperValues?.length || 0) - 1 && (
                    <Box
                      customStyle={{
                        flex: 1,
                        height: 1,
                        backgroundColor: common.line01
                      }}
                    />
                  )}
                </Fragment>
              );
            }

            return (
              <Fragment key={`order-status-stepper-${name}-${text}`}>
                <Dot text={text} subText={subText} />
                {index !== (orderStatus?.stepperValues?.length || 0) - 1 && (
                  <Box
                    customStyle={{
                      flex: 1,
                      height: 1,
                      backgroundColor: common.line01
                    }}
                  />
                )}
              </Fragment>
            );
          })}
        </Flexbox>
      )}
      {orderStatus.isSeller && orderStatus.name === '결제완료' && (
        <Flexbox
          gap={8}
          customStyle={{
            marginTop: 32
          }}
        >
          <Button
            variant="ghost"
            brandColor="black"
            size="xlarge"
            fullWidth
            onClick={() =>
              setSalesCancelDialogState({
                open: true,
                variant: 'refuse'
              })
            }
          >
            거절
          </Button>
          <Button
            variant="solid"
            brandColor="black"
            size="xlarge"
            fullWidth
            onClick={() => setOpenSalesApproveDialogState(true)}
          >
            판매승인
          </Button>
        </Flexbox>
      )}
      {orderStatus.isSeller && ['배송대기', '구매대행중'].includes(orderStatus.name) && (
        <Flexbox
          direction="vertical"
          gap={16}
          customStyle={{
            marginTop: 32
          }}
        >
          <Button
            variant="solid"
            brandColor="black"
            size="xlarge"
            fullWidth
            onClick={() => setOpenInvoiceNumberDialogState(true)}
          >
            송장번호 입력
          </Button>
          <Button
            variant="inline"
            brandColor="black"
            fullWidth
            onClick={() => setOpenEmptyInvoiceNumberDialogState(true)}
            customStyle={{
              fontWeight: 400,
              textDecoration: 'underline'
            }}
          >
            송장번호가 없나요?
          </Button>
        </Flexbox>
      )}
      {orderStatus.isSeller &&
        ['배송진행', '배송완료'].includes(orderStatus.name) &&
        !orderStatus.otherDeliveryMethod && (
          <Button
            variant="ghost"
            brandColor="black"
            size="xlarge"
            fullWidth
            onClick={() => setOpenDeliveryStatusFrameState(true)}
            customStyle={{
              marginTop: 32
            }}
          >
            배송조회
          </Button>
        )}
      {orderStatus.isSeller &&
        orderStatus.transactionMethod === '카멜 구매대행' &&
        orderStatus.name === '배송진행' &&
        orderStatus.otherDeliveryMethod && (
          <Button
            variant="solid"
            brandColor="black"
            size="xlarge"
            fullWidth
            onClick={() => setOpenDeliveryCompleteConfirmDialog(true)}
            customStyle={{
              marginTop: 32
            }}
          >
            배송완료
          </Button>
        )}
      {!orderStatus.isSeller &&
        orderStatus.name === '배송진행' &&
        !orderStatus.otherDeliveryMethod &&
        orderStatus.transactionMethod !== '카멜 구매대행' && (
          <Flexbox
            gap={8}
            customStyle={{
              marginTop: 32
            }}
          >
            <Button
              variant="ghost"
              brandColor="black"
              size="xlarge"
              fullWidth
              onClick={() => setOpenDeliveryStatusFrameState(true)}
            >
              배송조회
            </Button>
            <Button
              variant="solid"
              brandColor="black"
              size="xlarge"
              fullWidth
              onClick={() =>
                setPurchaseConfirmDialogState({
                  open: true,
                  variant: 'delivery'
                })
              }
            >
              구매확정
            </Button>
          </Flexbox>
        )}
      {!orderStatus.isSeller &&
        orderStatus.name === '배송진행' &&
        orderStatus.otherDeliveryMethod &&
        orderStatus.transactionMethod !== '카멜 구매대행' && (
          <Button
            variant="solid"
            brandColor="black"
            size="xlarge"
            fullWidth
            onClick={() =>
              setPurchaseConfirmDialogState({
                open: true,
                variant: 'delivery'
              })
            }
            customStyle={{
              marginTop: 32
            }}
          >
            구매확정
          </Button>
        )}
      {!orderStatus.isSeller &&
        orderStatus.name === '배송진행' &&
        !orderStatus.otherDeliveryMethod &&
        orderStatus.transactionMethod === '카멜 구매대행' && (
          <Button
            variant="ghost"
            brandColor="black"
            size="xlarge"
            fullWidth
            onClick={() => setOpenDeliveryStatusFrameState(true)}
            customStyle={{
              marginTop: 32
            }}
          >
            배송조회
          </Button>
        )}
      {!orderStatus.isSeller && orderStatus.name === '거래대기' && (
        <Button
          variant="solid"
          brandColor="black"
          size="xlarge"
          fullWidth
          onClick={() =>
            setPurchaseConfirmDialogState({
              open: true,
              variant: 'direct'
            })
          }
          customStyle={{
            marginTop: 32
          }}
        >
          구매확정
        </Button>
      )}
      {!orderStatus.isSeller &&
        orderStatus.name === '배송완료' &&
        orderStatus.transactionMethod !== '카멜 구매대행' && (
          <Button
            variant="solid"
            brandColor="black"
            size="xlarge"
            fullWidth
            onClick={() =>
              setPurchaseConfirmDialogState({
                open: true,
                variant: orderStatus.transactionMethod === '직거래' ? 'direct' : 'delivery'
              })
            }
            customStyle={{
              marginTop: 32
            }}
          >
            구매확정
          </Button>
        )}
      {orderStatus.isSeller &&
        ['배송준비 중 취소 요청', '거래준비 중 취소 요청'].includes(orderStatus.name) &&
        hold && (
          <Flexbox
            gap={8}
            customStyle={{
              marginTop: 32
            }}
          >
            <Button
              variant="ghost"
              brandColor="black"
              size="xlarge"
              fullWidth
              onClick={() => setOpenCancelRequestRefuseDialogState(true)}
            >
              거절
            </Button>
            <Button
              variant="solid"
              brandColor="black"
              size="xlarge"
              fullWidth
              onClick={() => setOpenCancelRequestApproveDialogState(true)}
            >
              취소 승인
            </Button>
          </Flexbox>
        )}
      {!orderStatus.isSeller &&
        ['정산대기', '정산진행', '정산완료'].includes(orderStatus.name) &&
        !orderStatus.hasReview && (
          <Button
            variant={orderStatus.transactionMethod === '카멜 구매대행' ? 'ghost' : 'solid'}
            brandColor="black"
            size="xlarge"
            fullWidth
            onClick={handleClickReviewWrite}
            disabled={isLoading}
            customStyle={{
              marginTop: 32
            }}
          >
            후기 작성하기
          </Button>
        )}
      {orderStatus.isSeller && orderStatus.name === '정산대기' && userAccounts.length === 0 && (
        <Button
          variant="solid"
          brandColor="black"
          size="xlarge"
          fullWidth
          onClick={handleClickSettingAccount}
          customStyle={{
            marginTop: 32
          }}
        >
          본인인증 및 정산계좌 입력
        </Button>
      )}
      {!orderStatus.isSeller &&
        orderStatus.name === '환불대기' &&
        !orderStatus.isExpired &&
        !orderStatus.hasReview &&
        userAccounts.length === 0 && (
          <Button
            variant="solid"
            brandColor="black"
            size="xlarge"
            fullWidth
            onClick={handleClickSettingAccount}
            customStyle={{
              marginTop: 32
            }}
          >
            본인인증 및 환불계좌 입력
          </Button>
        )}
      {orderStatus.isSeller &&
        orderStatus.transactionMethod !== '카멜 구매대행' &&
        ['정산진행', '정산완료'].includes(orderStatus.name) &&
        !orderStatus.hasReview && (
          <Button
            variant="ghost"
            brandColor="black"
            size="xlarge"
            fullWidth
            onClick={handleClickReviewWrite}
            disabled={isLoading}
            customStyle={{
              marginTop: 32
            }}
          >
            후기 작성하기
          </Button>
        )}
    </Box>
  );
}

const Dot = styled.div<{ text: string; subText?: string }>`
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui60};

  &::before {
    content: '${({ text }) => text}';
    position: absolute;
    top: 24px;
    right: 50%;
    transform: translateX(50%);
    white-space: nowrap;

    ${({
      theme: {
        palette: { common },
        typography: { body2 }
      }
    }): CSSObject => ({
      fontSize: body2.size,
      lineHeight: body2.lineHeight,
      letterSpacing: body2.letterSpacing,
      color: common.ui60
    })}
  }

  ${({
    theme: {
      palette: { common },
      typography: { body3 }
    },
    subText
  }): CSSObject =>
    subText
      ? {
          '&::after': {
            content: `'${subText}'`,
            position: 'absolute',
            top: 40,
            right: '50%',
            transform: 'translateX(50%)',
            whiteSpace: 'nowrap',
            fontSize: body3.size,
            lineHeight: body3.lineHeight,
            letterSpacing: body3.letterSpacing,
            color: common.ui60
          }
        }
      : {}}
`;

const ActiveDotWrapper = styled.div`
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    background-color: ${({
      theme: {
        palette: { primary }
      }
    }) => primary.light};
    z-index: 2;
  }
  &::after {
    content: '';
    position: absolute;
    width: 48px;
    height: 48px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: ${circlePulse} 1.25s ease infinite;
    border-radius: 50%;
    z-index: 1;
    background-color: ${({
      theme: {
        palette: { primary }
      }
    }) => primary.highlight};
  }
`;

const ActiveDot = styled.div<{ text: string; subText?: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background-color: ${({
    theme: {
      palette: { primary }
    }
  }) => primary.light};

  &::before {
    content: '${({ text }) => text}';
    position: absolute;
    top: 26px;
    right: 50%;
    transform: translateX(50%);
    white-space: nowrap;

    ${({
      theme: {
        palette: { primary },
        typography: { body2 }
      }
    }): CSSObject => ({
      fontSize: body2.size,
      fontWeight: body2.weight.bold,
      lineHeight: body2.lineHeight,
      letterSpacing: body2.letterSpacing,
      color: primary.light
    })}
  }

  ${({
    theme: {
      palette: { common },
      typography: { body3 }
    },
    subText
  }): CSSObject =>
    subText
      ? {
          '&::after': {
            content: `'${subText}'`,
            position: 'absolute',
            top: 42,
            right: '50%',
            transform: 'translateX(50%)',
            whiteSpace: 'nowrap',
            fontSize: body3.size,
            lineHeight: body3.lineHeight,
            letterSpacing: body3.letterSpacing,
            color: common.ui60
          }
        }
      : {}}
`;

const CompleteDot = styled.div<{ text: string; subText?: string; isActive?: boolean }>`
  position: relative;
  display: flex;
  width: 24px;
  height: 24px;
  border-radius: 50%;

  &::before {
    content: '${({ text }) => text}';
    position: absolute;
    top: 32px;
    right: 50%;
    transform: translateX(50%);
    white-space: nowrap;

    ${({
      theme: {
        palette: { primary, common },
        typography: { body2 }
      },
      isActive
    }): CSSObject => ({
      fontSize: body2.size,
      fontWeight: isActive ? body2.weight.bold : body2.weight.regular,
      lineHeight: body2.lineHeight,
      letterSpacing: body2.letterSpacing,
      color: isActive ? primary.light : common.ui60
    })}
  }

  ${({
    theme: {
      palette: { common },
      typography: { body3 }
    },
    subText
  }): CSSObject =>
    subText
      ? {
          '&::after': {
            content: `'${subText}'`,
            position: 'absolute',
            top: 48,
            right: '50%',
            transform: 'translateX(50%)',
            whiteSpace: 'nowrap',
            fontSize: body3.size,
            lineHeight: body3.lineHeight,
            letterSpacing: body3.letterSpacing,
            color: common.ui60
          }
        }
      : {}}
`;

export default OrdersDetailStatus;
