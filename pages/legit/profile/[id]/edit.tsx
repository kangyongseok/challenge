import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { QueryClient, dehydrate, useMutation, useQuery, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import {
  Box,
  Button,
  Flexbox,
  Tab,
  TabGroup,
  ThemeProvider,
  Typography,
  useTheme
} from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  LegitProfileContents,
  LegitProfileEditInfo,
  SellerProfileContents
} from '@components/pages/legit';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchBanword, fetchLegitProfile, fetchMyUserInfo, putProfile } from '@api/user';
import { fetchLegitsBrands } from '@api/model';

import queryKeys from '@constants/queryKeys';
import {
  APP_DOWNLOAD_BANNER_HEIGHT,
  APP_TOP_STATUS_HEIGHT,
  BASIC_BACKGROUND_IMG,
  HEADER_HEIGHT
} from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import { legitProfileEditState } from '@recoil/legitProfile';
import { dialogState, showAppDownloadBannerState, toastState } from '@recoil/common';
import useScrollTrigger from '@hooks/useScrollTrigger';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';
import useMutationDeleteAccount from '@hooks/useMutationDeleteAccount';

function LegitProfileEdit() {
  const {
    theme: { mode }
  } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id, targetTab } = router.query;
  const elementRef = useRef<null | HTMLDivElement>(null);
  const [tab, setTab] = useState('판매자' as string | number);
  const { mutate: mutateWitdhdraw } = useMutationDeleteAccount();
  const setDialogState = useSetRecoilState(dialogState);
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const [sellerEditInfo, setSellerEditInfo] = useRecoilState(legitProfileEditState);
  const setToastState = useSetRecoilState(toastState);
  const { data: myUserInfo } = useQueryMyUserInfo();
  const { mutate: puUserProfileMuate } = useMutation(putProfile, {
    async onSuccess() {
      await queryClient.invalidateQueries(queryKeys.users.userInfo());
      await queryClient.invalidateQueries(queryKeys.users.myUserInfo());
      await queryClient.invalidateQueries(queryKeys.users.infoByUserId(Number(id)), {
        refetchInactive: true
      });
      setToastState({ type: 'user', status: 'saved' });
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.back();
    }
  });
  const { mutate: getBanwordMutate } = useMutation(fetchBanword, {
    onSuccess(props) {
      if (props.invalidReasons) {
        props.invalidReasons.forEach((reasons) => {
          switch (reasons.type) {
            case 'ADMIN':
              setToastState({ type: 'user', status: 'invalidAdminWord' });
              break;
            case 'DUPLICATE':
              setToastState({ type: 'user', status: 'duplicatedNickName' });
              break;
            default:
              setToastState({ type: 'user', status: 'invalidBanWord' });
          }
          switch (reasons.param) {
            case 'NICKNAME':
              setSellerEditInfo({ ...sellerEditInfo, nickName: reasons.result });
              break;
            case 'SHOPDESCRIPTION':
              setSellerEditInfo({ ...sellerEditInfo, shopDescription: reasons.result });
              break;
            default:
              setSellerEditInfo({ ...sellerEditInfo, legitTitle: reasons.result });
          }
        });
      } else {
        puUserProfileMuate(sellerEditInfo);
      }
    }
  });

  const { data: profileInfo } = useQuery(
    queryKeys.users.legitProfile(Number(id)),
    () => fetchLegitProfile(Number(id)),
    {
      enabled: !!id
    }
  );

  useEffect(() => {
    if (targetTab === 'legit') {
      setTab('감정사');
    }
  }, [targetTab]);

  const triggered = useScrollTrigger({
    ref: elementRef,
    additionalOffsetTop:
      (showAppDownloadBanner ? -APP_DOWNLOAD_BANNER_HEIGHT : 0) +
      (isExtendedLayoutIOSVersion() ? -APP_TOP_STATUS_HEIGHT : 0) +
      -HEADER_HEIGHT,
    delay: 0
  });

  useEffect(() => {
    document.body.className = `legit-${mode}`;

    return () => {
      document.body.removeAttribute('class');
    };
  }, [mode]);

  const isUpdatedProfileData = useMemo(() => {
    if (profileInfo) {
      const { name, urlShop, title, targetBrandIds, image, imageBackground } = profileInfo.profile;

      if (sellerEditInfo.nickName !== name) return true;
      if (sellerEditInfo.shopDescription !== profileInfo?.shopDescription) return true;
      if ((sellerEditInfo.imageProfile || '') !== (image || '')) return true;
      if ((sellerEditInfo.imageBackground || '') !== (imageBackground || '')) return true;
      if (sellerEditInfo.legitTitle !== title) return true;
      if (JSON.stringify(sellerEditInfo.legitTargetBrandIds) !== JSON.stringify(targetBrandIds))
        return true;
      if (sellerEditInfo.legitUrlShop !== urlShop) return true;
      return false;
    }
    return false;
  }, [profileInfo, sellerEditInfo]);

  const handleRouteChangeStart = useCallback(() => {
    if (isUpdatedProfileData) {
      window.history.pushState('', '', `/${router.locale}${router.asPath}`);
      setDialogState({
        type: 'leaveEditProfile',
        secondButtonAction() {
          router.events.off('routeChangeStart', handleRouteChangeStart);
          router.back();
        },
        customStyleTitle: { minWidth: 270 }
      });

      // eslint-disable-next-line no-throw-literal
      throw '프로필 수정 뒤로가기 방지';
    } else {
      router.back();
    }
  }, [isUpdatedProfileData, router, setDialogState]);

  useEffect(() => {
    if (isUpdatedProfileData) {
      router.events.on('routeChangeStart', handleRouteChangeStart);
    }

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdatedProfileData]);

  useEffect(() => {
    if (profileInfo) {
      const {
        name,
        urlShop,
        title,
        targetBrandIds,
        subTitle,
        description,
        image,
        imageBackground
      } = profileInfo.profile;

      setSellerEditInfo({
        nickName: name,
        shopDescription: profileInfo.shopDescription,
        legitTitle: title,
        legitUrlShop: urlShop || '',
        legitTargetBrandIds: targetBrandIds,
        legitSubTitle: subTitle,
        legitDescription: description,
        imageProfile: image,
        imageBackground: imageBackground || ''
      });
    }
  }, [profileInfo, setSellerEditInfo]);

  const handleChangeValue = (newValue: string | number) => {
    setTab(newValue);
  };

  const sellerInfoSave = () => {
    getBanwordMutate({
      nickName: sellerEditInfo.nickName,
      shopDescription: sellerEditInfo.shopDescription
    });
  };

  const legitInfoSave = () => {
    getBanwordMutate({
      nickName: sellerEditInfo.nickName,
      legitTitle: sellerEditInfo.legitTitle
    });
  };

  const handleClickSave = () => {
    if (tab === '판매자') {
      sellerInfoSave();
    } else {
      legitInfoSave();
    }
  };

  const handleClickWithdrawal = useCallback(() => {
    setDialogState({
      type: 'deleteAccount',
      content: (
        <Typography
          weight="medium"
          customStyle={{ textAlign: 'center', padding: '12px 0', minWidth: 270 }}
        >
          지금까지 쌓아놓은 검색 이력과 찜 리스트,
          <br />
          맞춤 추천을 위한 정보가 모두 삭제됩니다.
          <br />
          그래도 회원탈퇴 하시겠어요?
        </Typography>
      ),
      firstButtonAction() {
        logEvent(attrKeys.mypage.SELECT_WITHDRAW, {
          att: 'YES'
        });
        mutateWitdhdraw();
      },
      secondButtonAction() {
        logEvent(attrKeys.mypage.SELECT_WITHDRAW, {
          att: 'NO'
        });
      }
    });
  }, [mutateWitdhdraw, setDialogState]);

  // const handleClickBack = () => {
  //   if (isUpdatedProfileData) {
  //     setDialogState({
  //       type: 'leaveEditProfile',
  //       secondButtonAction() {
  //         router.back();
  //       },
  //       customStyleTitle: { minWidth: 270 }
  //     });
  //   } else {
  //     router.back();
  //   }
  // };

  return (
    <GeneralTemplate
      header={
        <ThemeProvider theme={triggered ? 'light' : 'dark'}>
          <Header
            isTransparent={!triggered}
            isFixed
            showRight={false}
            rightIcon={<Box customStyle={{ width: 56 }} />}
            // onClickLeft={handleClickBack}
          >
            <Typography variant="h3" weight="bold">
              프로필수정
            </Typography>
          </Header>
        </ThemeProvider>
      }
      footer={
        <SaveBtnWrap justifyContent="center" alignment="center">
          <Button
            variant="solid"
            fullWidth
            size="xlarge"
            brandColor="primary"
            onClick={handleClickSave}
          >
            저장
          </Button>
        </SaveBtnWrap>
      }
    >
      <BackgroundImage
        src={sellerEditInfo.imageBackground || myUserInfo?.info.value.image || BASIC_BACKGROUND_IMG}
        showAppDownloadBanner={showAppDownloadBanner}
      >
        <Blur />
      </BackgroundImage>
      <LegitProfileEditInfo snsImage={myUserInfo?.info.value.image} />
      <ContetnsWrap ref={elementRef}>
        <TabGroup fullWidth value={tab} onChange={handleChangeValue}>
          <Tab text="판매자 프로필" value="판매자" />
          <Tab text="감정사 프로필" value="감정사" />
        </TabGroup>
        {tab === '판매자' && <SellerProfileContents />}
        {tab === '감정사' && <LegitProfileContents />}
        <WithdrawalButton variant="small1" onClick={handleClickWithdrawal}>
          회원탈퇴
        </WithdrawalButton>
        <Box customStyle={{ paddingBottom: 120 }} />
      </ContetnsWrap>
    </GeneralTemplate>
  );
}

const BackgroundImage = styled.div<{ src: string; showAppDownloadBanner: boolean }>`
  position: absolute;
  top: ${({ showAppDownloadBanner }) => (showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0)}px;
  left: 0;
  width: 100%;
  height: 275px;
  background: url(${({ src }) => src}) no-repeat center;
  background-size: cover;
`;

const Blur = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  position: absolute;
  background: ${({ theme: { palette } }) => palette.common.overlay20};
  backdrop-filter: blur(8px);
`;

const ContetnsWrap = styled.div`
  margin-left: -20px;
  width: calc(100% + 40px);
  height: fit-content;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  margin-top: 10px;
`;

const WithdrawalButton = styled(Typography)`
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui60};
  text-decoration: underline;
  text-align: center;
`;

const SaveBtnWrap = styled(Flexbox)`
  padding: 0 20px 30px;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: ${({ theme: { zIndex } }) => zIndex.button};
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
`;

export async function getServerSideProps({ req, query: { id } }: GetServerSidePropsContext) {
  const userId = String(id);

  if (/^[0-9]+$/.test(userId)) {
    const queryClient = new QueryClient();

    Initializer.initAccessTokenByCookies(req.cookies);
    Initializer.initAccessUserInQueryClientByCookies(req.cookies, queryClient);

    // TODO 의도치 않은 redirect 발생, 임시 비활성화 처리 후 추후 보완
    // if (isEdit && +userId !== accessUser?.userId) {
    //   return {
    //     redirect: {
    //       destination: `/legit/profile/${id}`,
    //       permanent: false
    //     }
    //   };
    // }

    try {
      const legitProfile = await queryClient.fetchQuery(queryKeys.users.legitProfile(+userId), () =>
        fetchLegitProfile(+userId)
      );
      await queryClient.prefetchQuery(queryKeys.models.legitsBrands(), () => fetchLegitsBrands());

      if (legitProfile) {
        if (req.cookies.accessToken) {
          const { roles } = await queryClient.fetchQuery(
            queryKeys.users.myUserInfo(),
            fetchMyUserInfo
          );

          return {
            props: {
              dehydratedState: dehydrate(queryClient),
              isLegitUser: roles.some((role) =>
                ['PRODUCT_LEGIT_HEAD', 'PRODUCT_LEGIT'].includes(role)
              )
            }
          };
        }

        return {
          props: {
            dehydratedState: dehydrate(queryClient),
            isLegitUser: false
          }
        };
      }
    } catch {
      //
    }
  }

  return {
    redirect: {
      destination: '/legit',
      permanent: false
    }
  };
}

export default LegitProfileEdit;
