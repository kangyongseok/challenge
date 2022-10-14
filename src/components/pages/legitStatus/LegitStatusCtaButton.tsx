import { useEffect, useState } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useMutation, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Toast, Tooltip, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import ChannelTalk from '@library/channelTalk';
import { logEvent } from '@library/amplitude';

import { postLegitsFollow } from '@api/user';
import {
  fetchProductLegit,
  postProductLegitPreConfirmEditDone,
  postProductLegitPreConfirmFail
} from '@api/productLegit';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { firstUserAnimationState } from '@recoil/legitStatus';
import { toastState } from '@recoil/common';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function LegitStatusCtaButton() {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();
  const router = useRouter();
  const isAnimation = useRecoilValue(firstUserAnimationState);
  const splitIds = String(router.query.id || '').split('-');
  const productId = Number(splitIds[splitIds.length - 1] || 0);

  const { data: accessUser } = useQueryAccessUser();
  const { data: { roles = [] } = {} } = useQueryUserInfo();
  const setToastState = useSetRecoilState(toastState);

  const [isAuthUser, setIsAuthUser] = useState<boolean | null>(null);
  const [showLegitTooltip, setShowLegitTooltip] = useState(true);
  const [openToast, setOpenToast] = useState(false);

  const { data, isSuccess, refetch } = useQuery(
    queryKeys.productLegits.legit(productId),
    () => fetchProductLegit(productId),
    {
      enabled: !!router.query.id
    }
  );

  const { mutate } = useMutation(postLegitsFollow);
  const { mutate: preConfirmFailMutate } = useMutation(postProductLegitPreConfirmFail);
  const { mutate: preConfirmEditDoneMutate } = useMutation(postProductLegitPreConfirmEditDone);

  const isButton = () => {
    if (router.query.id && router.query.firstLegit === 'true' && isAnimation) {
      return true;
    }
    return !!(router.query.id && !router.query.firstLegit);
  };

  const getLogEventTitle = () => {
    switch (data?.status) {
      case 1:
        return 'REQUESTED';
      case 10:
        return attrProperty.legitTitle.PRE_CONFIRM;
      case 11:
        return attrProperty.legitTitle.PRE_CONFIRM_FAIL;
      case 12:
        return attrProperty.legitTitle.PRE_CONFIRM_EDIT;
      case 13:
        return attrProperty.legitTitle.PRE_CONFIRM_EDIT_DONE;
      case 20:
        return attrProperty.legitTitle.AUTHENTICATING;
      case 30:
        return attrProperty.legitTitle.AUTHORIZED;
      default:
        return '';
    }
  };

  const handleClick = () => {
    if (!accessUser) {
      logEvent(attrKeys.legit.CLICK_LEGIT_TOOLTIP, {
        name: attrProperty.productName.LEGIT_PRODUCT,
        title: attrProperty.productTitle.PRE_CONFIRM,
        subTitle: 'LOGIN'
      });
      router.push({ pathname: '/login', query: { returnUrl: router.asPath } });
    } else {
      logEvent(attrKeys.legit.CLICK_LEGIT_TOOLTIP, {
        name: attrProperty.productName.LEGIT_PRODUCT,
        title: attrProperty.productTitle.PRE_CONFIRM,
        subTitle: 'GO_MYLEGIT'
      });
      mutate(
        {
          productId: data?.productId as number
        },
        {
          onSuccess() {
            setOpenToast(true);
            setShowLegitTooltip(false);
          }
        }
      );
    }
  };

  const handleClickProductDetail = () => {
    logEvent(attrKeys.legit.CLICK_LEGIT_INFO, {
      name: attrProperty.productName.LEGIT_PRODUCT,
      title: getLogEventTitle(),
      att: 'BACK_PRODUCT'
    });
    router.replace(`/products/${router.query.id}`);
  };

  const handleClickContinue = () => {
    logEvent(attrKeys.legit.SUBMIT_LEGIT_PROCESS, {
      name: attrProperty.name.PRE_CONFIRM_EDIT,
      att: '크롤링매물'
    });
    preConfirmEditDoneMutate(
      { productId },
      {
        onSuccess: () => {
          const hasLegitRole = (roles as string[]).find(
            (role) => role.indexOf('PRODUCT_LEGIT') > -1
          );

          router
            .push({
              pathname: hasLegitRole ? '/legit/admin' : '/legit',
              query: {
                tab: 'my'
              }
            })
            .then(() =>
              setToastState({
                type: 'legit',
                status: 'preConfirmEdited'
              })
            );
        }
      }
    );
  };

  useEffect(() => {
    if (accessUser && data && isSuccess) {
      setIsAuthUser(accessUser.userId === data.userId);
    }
  }, [accessUser, data, isSuccess]);

  useEffect(() => {
    if (
      (!isAuthUser && isSuccess && showLegitTooltip && !data.isFollow) ||
      !!(data?.status === 20 && isAuthUser)
    ) {
      logEvent(attrKeys.legit.VIEW_LEGIT_TOOLTIP, {
        name: attrProperty.productName.LEGIT_PRODUCT,
        title: attrProperty.productTitle.PRE_CONFIRM,
        subTitle: 'GO_MYLEGIT'
      });
    }
  }, [isAuthUser, isSuccess, showLegitTooltip, data]);

  if (!data) return null;

  return (
    <CtaButtonArea alignment="center" justifyContent="center" isButton={isButton()}>
      {(data?.status === 11 ||
        (data?.status === 12 && !data?.canModified) ||
        (data?.status === 12 && data?.canModified && !isAuthUser)) && (
        <Box customStyle={{ '& > div': { width: '100%' } }}>
          <Tooltip
            open
            message={
              <Typography weight="bold" variant="small1" customStyle={{ color: common.uiWhite }}>
                판매자에게 추가 사진을 받으셨다면, 1:1 상담 요청하세요!
              </Typography>
            }
          >
            <Flexbox gap={8}>
              <Button
                variant="outlinedGhost"
                fullWidth
                size="xlarge"
                onClick={handleClickProductDetail}
              >
                해당 매물 보기
              </Button>
              <Button
                brandColor="primary"
                variant="contained"
                fullWidth
                size="xlarge"
                onClick={() => ChannelTalk.showMessenger()}
              >
                1:1 요청하기
              </Button>
            </Flexbox>
          </Tooltip>
        </Box>
      )}
      {data?.status === 12 && data?.canModified && isAuthUser && (
        <Flexbox gap={8}>
          <Button
            variant="outlinedGhost"
            fullWidth
            size="xlarge"
            onClick={() =>
              preConfirmFailMutate(productId, {
                onSuccess: () => refetch()
              })
            }
            customStyle={{ maxWidth: 78 }}
          >
            아니요
          </Button>
          <Button
            brandColor="primary"
            variant="contained"
            fullWidth
            size="xlarge"
            onClick={handleClickContinue}
          >
            네! 사진감정 계속해주세요!
          </Button>
        </Flexbox>
      )}
      {data?.status !== 11 && data?.status !== 12 && (
        <Box customStyle={{ '& > div': { width: '100%' } }}>
          <Tooltip
            open={
              (!isAuthUser && isSuccess && showLegitTooltip && !data.isFollow) ||
              !!(data?.status === 20 && isAuthUser)
            }
            message={
              <Flexbox justifyContent="space-between" alignment="center" gap={4}>
                <Typography variant="body2" weight="bold" customStyle={{ color: common.uiWhite }}>
                  {data?.status === 20 && isAuthUser
                    ? '🔔 의견이 모두 남겨지면 앱푸시로 알려드릴게요!'
                    : '🔔 나도 감정결과를 받아보고싶다면?'}
                </Typography>
                {!(data?.status === 20 && isAuthUser) && (
                  <Typography
                    variant="body2"
                    weight="medium"
                    customStyle={{ color: primary.light }}
                    onClick={handleClick}
                  >
                    내 사진감정 추가
                  </Typography>
                )}
              </Flexbox>
            }
            placement="top"
          >
            <Button
              variant="contained"
              brandColor="primary"
              fullWidth
              size="xlarge"
              onClick={handleClickProductDetail}
            >
              해당 매물 보기
            </Button>
          </Tooltip>
        </Box>
      )}
      <Toast open={openToast} onClose={() => setOpenToast(false)}>
        내 사진감정 목록에 추가되었습니다!
      </Toast>
    </CtaButtonArea>
  );
}

const CtaButtonArea = styled(Flexbox)<{ isButton: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg03};
  display: ${({ isButton }) => (isButton ? 'block' : 'none')};
`;

export default LegitStatusCtaButton;
