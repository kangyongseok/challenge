import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import {
  QueryClient,
  dehydrate,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import {
  Box,
  Button,
  Flexbox,
  Tab,
  TabGroup,
  ThemeProvider,
  Typography,
  useTheme
} from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  LegitProfileContents,
  LegitProfileEditInfo,
  SellerProfileContents
} from '@components/pages/legit';

import LocalStorage from '@library/localStorage';
import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchBanword, fetchLegitProfile, fetchMyUserInfo, putProfile } from '@api/user';
import { fetchLegitsBrands } from '@api/model';

import queryKeys from '@constants/queryKeys';
import { ACCESS_USER } from '@constants/localStorage';
import {
  APP_DOWNLOAD_BANNER_HEIGHT,
  DEFAUT_BACKGROUND_IMAGE,
  HEADER_HEIGHT,
  IOS_SAFE_AREA_TOP
} from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';
import {
  getImagePathStaticParser,
  getImageResizePath,
  isExtendedLayoutIOSVersion
} from '@utils/common';

import { legitProfileEditState, legitProfileUpdatedProfileDataState } from '@recoil/legitProfile';
import { dialogState, showAppDownloadBannerState, toastState } from '@recoil/common';
import useScrollTrigger from '@hooks/useScrollTrigger';
import useMyProfileInfo from '@hooks/userMyProfileInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useMutationDeleteAccount from '@hooks/useMutationDeleteAccount';

function LegitProfileEdit() {
  const {
    theme: { mode }
  } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { id, targetTab } = router.query;

  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const [legitProfileUpdatedProfileData, setLegitProfileUpdatedProfileDataState] = useRecoilState(
    legitProfileUpdatedProfileDataState
  );
  const [sellerEditInfo, setSellerEditInfo] = useRecoilState(legitProfileEditState);
  const setDialogState = useSetRecoilState(dialogState);
  const setToastState = useSetRecoilState(toastState);

  const { data: accessUser } = useQueryAccessUser();
  const { backgroundImage } = useMyProfileInfo();

  const { mutate: mutateWitdhdraw } = useMutationDeleteAccount();
  const { mutate: puUserProfileMuate } = useMutation(putProfile, {
    async onSuccess() {
      LocalStorage.set(ACCESS_USER, {
        ...accessUser,
        userName: sellerEditInfo.nickName,
        image: sellerEditInfo.imageProfile || accessUser?.image || ''
      });
      await queryClient.invalidateQueries(queryKeys.users.userInfo());
      await queryClient.invalidateQueries(queryKeys.users.myUserInfo());
      await queryClient.invalidateQueries({
        queryKey: queryKeys.users.infoByUserId(Number(id)),
        refetchType: 'inactive'
      });
      setToastState({ type: 'user', status: 'saved' });
      setLegitProfileUpdatedProfileDataState(false);
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

  const [tab, setTab] = useState('판매자' as string | number);
  const elementRef = useRef<null | HTMLDivElement>(null);

  const triggered = useScrollTrigger({
    ref: elementRef,
    additionalOffsetTop:
      (showAppDownloadBanner ? -APP_DOWNLOAD_BANNER_HEIGHT : 0) -
      HEADER_HEIGHT -
      (isExtendedLayoutIOSVersion()
        ? Number(
            getComputedStyle(document.documentElement).getPropertyValue('--sat').split('px')[0]
          )
        : 0),
    delay: 0
  });

  const isUpdatedProfileData = useMemo(() => {
    if (profileInfo) {
      const { name, title, targetBrandIds, image, imageBackground } = profileInfo.profile;

      if (sellerEditInfo.nickName !== name) return true;
      if (sellerEditInfo.shopDescription !== profileInfo?.shopDescription) return true;
      if ((sellerEditInfo.imageProfile || '') !== (image || '')) return true;
      if ((sellerEditInfo.imageBackground || '') !== (imageBackground || '')) return true;
      if (sellerEditInfo.legitTitle !== title) return true;
      if (JSON.stringify(sellerEditInfo.legitTargetBrandIds) !== JSON.stringify(targetBrandIds))
        return true;
      return false;
    }
    return false;
  }, [profileInfo, sellerEditInfo]);

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
      logEvent(attrKeys.userShop.SUBMIT_PROFILE, { att: 'SELLER' });
      sellerInfoSave();
    } else {
      logEvent(attrKeys.userShop.SUBMIT_PROFILE, { att: 'LEGIT_SELLER' });
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

  useEffect(() => {
    logEvent(attrKeys.legitProfile.VIEW_PROFILE_EDIT, {
      att: 'LEGIT_SELLER'
    });
  }, []);

  useEffect(() => {
    if (targetTab === 'legit') {
      setTab('감정사');
    }
  }, [targetTab]);

  useEffect(() => {
    document.body.className = `legit-${mode}`;

    return () => {
      document.body.removeAttribute('class');
    };
  }, [mode]);

  useEffect(() => {
    if (profileInfo) {
      const { name, title, targetBrandIds, subTitle, description, image, imageBackground } =
        profileInfo.profile;

      setSellerEditInfo({
        nickName: name,
        shopDescription: profileInfo.shopDescription,
        legitTitle: title,
        legitTargetBrandIds: targetBrandIds,
        legitSubTitle: subTitle,
        legitDescription: description,
        imageProfile: image,
        imageBackground: imageBackground || ''
      });
    }
  }, [profileInfo, setSellerEditInfo]);

  useEffect(() => {
    setLegitProfileUpdatedProfileDataState(isUpdatedProfileData);
  }, [isUpdatedProfileData, setLegitProfileUpdatedProfileDataState]);

  const handleClickBack = () => {
    logEvent(attrKeys.header.CLICK_BACK, {
      name: attrProperty.name.LEGIT_PROFILE_EDIT
    });
    if (legitProfileUpdatedProfileData) {
      window.history.pushState('', '', router.asPath);
    }
    router.back();
  };

  const bgImage = sellerEditInfo.imageBackground || backgroundImage || DEFAUT_BACKGROUND_IMAGE;

  return (
    <GeneralTemplate
      header={
        <ThemeProvider theme={triggered ? 'light' : 'dark'}>
          <Header
            isTransparent={!triggered}
            isFixed
            showRight={false}
            rightIcon={<Box customStyle={{ width: 56 }} />}
            onClickLeft={handleClickBack}
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
        src={getImageResizePath({ imagePath: getImagePathStaticParser(bgImage), h: 387 })}
        showAppDownloadBanner={showAppDownloadBanner}
      >
        <Blur />
      </BackgroundImage>
      <LegitProfileEditInfo />
      <ContetnsWrap ref={elementRef}>
        <TabGroup fullWidth value={tab} onChange={handleChangeValue}>
          <Tab text="판매자 프로필" value="판매자" />
          <Tab text="감정사 프로필" value="감정사" />
        </TabGroup>
        {tab === '판매자' && <SellerProfileContents />}
        {tab === '감정사' && <LegitProfileContents />}
        <WithdrawalButton variant="body2" onClick={handleClickWithdrawal}>
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
  height: calc(${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'} + 275px);
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
  background: ${({ theme: { palette } }) => palette.common.overlay40};
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
  Initializer.initAccessTokenByCookies(getCookies({ req }));

  const userId = String(id);

  try {
    if (!/^[0-9]+$/.test(userId)) {
      return {
        notFound: true
      };
    }

    const queryClient = new QueryClient();

    Initializer.initAccessTokenByCookies(getCookies({ req }));

    await queryClient.fetchQuery(queryKeys.users.legitProfile(+userId), () =>
      fetchLegitProfile(+userId)
    );
    await queryClient.prefetchQuery(queryKeys.models.legitsBrands(), () => fetchLegitsBrands());

    if (getCookies({ req }).accessToken) {
      const { roles } = await queryClient.fetchQuery(queryKeys.users.myUserInfo(), fetchMyUserInfo);

      return {
        props: {
          dehydratedState: dehydrate(queryClient),
          isLegitUser: roles.some((role) => ['PRODUCT_LEGIT_HEAD', 'PRODUCT_LEGIT'].includes(role))
        }
      };
    }

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        isLegitUser: false
      }
    };
  } catch {
    return {
      notFound: true
    };
  }
}

export default LegitProfileEdit;
