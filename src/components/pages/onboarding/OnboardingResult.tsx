import { useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';
import {
  BottomSheet,
  Box,
  Chip,
  Flexbox,
  Image,
  ThemeProvider,
  Typography,
  dark
} from 'mrcamel-ui';
import { sortBy } from 'lodash-es';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import styled from '@emotion/styled';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { MODEL_CATEGORY_IDS, SELECTED_STYLE_CARD_IDS } from '@constants/localStorage';
import { purchaseType } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { modelParentCategoryIdsState } from '@recoil/onboarding';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

import OnboardingPermission from './OnboardingPermission';
import OnboardingBottomCTA from './OnboardingBottomCTA';
import Firecracker from './Firecracker';

const BASE_URL = `https://${process.env.IMAGE_DOMAIN}/assets/images/onboarding`;

function OnboardingResult() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: accessUser } = useQueryAccessUser();
  const [modelParentCategoryIds, setModelParentCategoryId] = useRecoilState(
    modelParentCategoryIdsState
  );

  const { data: userInfo } = useQuery(queryKeys.users.userInfo(), fetchUserInfo, {
    refetchOnMount: true
  });

  useEffect(() => {
    logEvent(attrKeys.welcome.VIEW_PERSONAL_INPUT, {
      name: attrProperty.name.PROFILE
    });
  }, []);

  useEffect(() => {
    const getIds = LocalStorage.get(MODEL_CATEGORY_IDS) as number[];
    if (!modelParentCategoryIds.length && getIds && getIds.length) {
      setModelParentCategoryId(getIds);
    }
  }, [modelParentCategoryIds, setModelParentCategoryId]);

  const handleClickClose = () => {
    setIsOpen(false);
  };

  const userNameParse = () => {
    const styleIds = (LocalStorage.get(SELECTED_STYLE_CARD_IDS) as number[]) || [];
    if (!accessUser?.userName) {
      if (!Array.isArray(styleIds)) return '회원님';
      if (styleIds.includes(37)) return '힙쟁이';
      if (styleIds.includes(38) || styleIds.includes(39)) return '명잘알';
      if (styleIds.includes(40)) return '신발매니아';
      if (styleIds.includes(41)) return '미니멀리스트';
      return '회원님';
    }
    return accessUser?.userName;
  };

  return (
    <ThemeProvider theme="dark">
      <Firecracker />
      <Box
        customStyle={{ padding: '0 40px', background: dark.palette.common.uiWhite, height: '100%' }}
      >
        <Flexbox
          justifyContent="center"
          alignment="center"
          direction="vertical"
          customStyle={{ height: '100%' }}
          gap={12}
        >
          <Typography variant="h3" weight="bold">
            프로필이 생성되었어요!
          </Typography>
          <ProfileCard>
            <LogoBox>
              <CamelIcon />
            </LogoBox>
            <Flexbox justifyContent="center" alignment="center">
              <Image
                disableAspectRatio
                src={`${BASE_URL}/${
                  userInfo?.info.value.gender === 'F' ? 'female_face' : 'male_face'
                }.png`}
                alt="Face Img"
                width={32}
              />
            </Flexbox>
            <Typography
              variant="h3"
              weight="medium"
              customStyle={{ color: dark.palette.common.ui98, marginBottom: 12, marginTop: 10 }}
            >
              {userNameParse()}, {userInfo?.info.value.yearOfBirth}
            </Typography>
            <ElipsisArea customStyle={{ color: dark.palette.common.ui60 }}>
              👕 상의 : {userInfo?.size.value?.tops.map((top) => top.viewSize)?.join(',')}
            </ElipsisArea>
            <ElipsisArea customStyle={{ color: dark.palette.common.ui60, margin: '4px 0' }}>
              👖 하의 :{' '}
              {sortBy(userInfo?.size.value?.bottoms.map((bottom) => bottom.size))?.join(',')}
            </ElipsisArea>
            <ElipsisArea customStyle={{ color: dark.palette.common.ui60 }}>
              👟 신발 :{' '}
              {sortBy(userInfo?.size?.value?.shoes.map((shoe) => shoe.viewSize))?.join(',')}
            </ElipsisArea>

            {userInfo?.personalStyle?.purchaseTypes[0] &&
              userInfo.personalStyle.purchaseTypes[0].id && (
                <Flexbox alignment="center" justifyContent="center" gap={2}>
                  <Image
                    disableAspectRatio
                    src={`${BASE_URL}/${
                      purchaseType.filter(
                        (type) => type.value === userInfo?.personalStyle.purchaseTypes[0].id
                      )[0].icon
                    }.png`}
                    alt="PurchaseType Img"
                    width={20}
                  />
                  <Typography customStyle={{ color: dark.palette.common.ui60, marginTop: 4 }}>
                    {
                      purchaseType.filter(
                        (type) => type.value === userInfo?.personalStyle.purchaseTypes[0].id
                      )[0].subTitle
                    }
                  </Typography>
                </Flexbox>
              )}
            <DotLine />
            <Flexbox
              gap={4}
              customStyle={{ flexWrap: 'wrap', marginLeft: -20, width: 'calc(100% + 40px)' }}
              alignment="center"
              justifyContent="center"
            >
              {userInfo?.personalStyle.styles.map((item) => (
                <ModelChip weight="regular" variant="solid" key={`selected-model-${item.id}`}>
                  # {item.name}
                </ModelChip>
              ))}
            </Flexbox>
          </ProfileCard>
          <Typography
            variant="small1"
            weight="medium"
            customStyle={{ color: dark.palette.common.ui60 }}
          >
            프로필 수정은 <MypageText>마이페이지</MypageText>에서도 가능해요!
          </Typography>
        </Flexbox>
      </Box>
      <OnboardingBottomCTA
        onClick={() => {
          logEvent(attrKeys.welcome.CLICK_START, {
            name: attrProperty.name.PERSONAL_INPUT
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.personals.guideAllProducts(),
            refetchType: 'inactive'
          });
          setIsOpen(true);
        }}
      >
        카멜에서 득템하러 GO!
      </OnboardingBottomCTA>
      <BottomSheet
        open={isOpen}
        onClose={handleClickClose}
        customStyle={{ background: dark.palette.common.uiBlack }}
        disableSwipeable
      >
        <OnboardingPermission />
      </BottomSheet>
    </ThemeProvider>
  );
}

const ProfileCard = styled.div`
  background: ${dark.palette.common.uiBlack};
  border-radius: 20px;
  padding: 32px;
  width: 100%;
  text-align: center;
  position: relative;
`;

const DotLine = styled.div`
  width: calc(100% + 40px);
  border-bottom: 2px dotted #dcdde0;
  margin: 32px 0;
  margin-left: -20px;
`;

const ModelChip = styled(Chip)`
  background: ${dark.palette.common.ui20};
  color: ${dark.palette.common.ui98};
  width: fit-content;
`;

const LogoBox = styled.div`
  width: 36px;
  height: 47px;
  background: #2937ff;
  padding-top: 5px;
  position: absolute;
  top: 0;
  left: 26px;
  overflow: hidden;
  &::after {
    content: '';
    position: absolute;
    background: white;
    width: 30px;
    height: 90px;
    bottom: -50px;
    right: -10px;
    transform: rotate(70deg);
  }
`;

const ElipsisArea = styled(Typography)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  text-align: center;
`;

const MypageText = styled.span`
  color: ${dark.palette.common.uiBlack};
  border-bottom: 1px solid ${dark.palette.common.uiBlack};
`;

function CamelIcon() {
  return (
    <svg width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0.756104 11.752L3.8121 3.35198C4.00094 2.83322 4.38811 2.41071 4.88846 2.17742C5.38881 1.94412 5.96134 1.91915 6.4801 2.10798C6.99887 2.29681 7.42137 2.68399 7.65466 3.18434C7.88796 3.68469 7.91294 4.25721 7.7241 4.77598L5.2001 11.752H0.756104ZM11.1561 11.752H6.7121L9.7681 3.35198C9.95694 2.83322 10.3441 2.41071 10.8445 2.17742C11.3448 1.94412 11.9173 1.91915 12.4361 2.10798C12.9549 2.29681 13.3774 2.68399 13.6107 3.18434C13.844 3.68469 13.8689 4.25721 13.6801 4.77598L11.1561 11.752ZM21.6801 4.34798L19.6001 4.88398L17.0961 11.752H12.6641L16.4361 1.39598L20.6441 0.315979C21.1788 0.178597 21.7461 0.259241 22.2213 0.54017C22.6966 0.8211 23.0407 1.2793 23.1781 1.81398C23.3155 2.34866 23.2348 2.91601 22.9539 3.39122C22.673 3.86644 22.2148 4.2106 21.6801 4.34798Z"
        fill="white"
      />
    </svg>
  );
}

export default OnboardingResult;
