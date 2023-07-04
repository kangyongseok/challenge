import { useEffect } from 'react';

import { useRecoilValue, useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { useMutation } from '@tanstack/react-query';
import { Button, Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import StylesCards from '@components/UI/organisms/StylesCards';
import Header from '@components/UI/molecules/Header';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { postUserStyle } from '@api/user';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';
import getAccessUserByCookies from '@utils/common/getAccessUserByCookies';

import { selectedModelCardState } from '@recoil/onboarding';

function LikeModelInput() {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const selectedModelCard = useRecoilValue(selectedModelCardState);
  const resetSelectedModelCard = useResetRecoilState(selectedModelCardState);

  const { mutate: styleMutate } = useMutation(postUserStyle);

  const handleClickNext = () => {
    logEvent(attrKeys.userInput.SUBMIT_PERSONAL_INPUT, {
      name: attrProperty.name.STYLE_MODEL,
      title: attrProperty.title.SAVE
    });
    styleMutate(
      {
        styleIds: selectedModelCard.map((model) => model.id)
      },
      {
        onSuccess: () => {
          resetSelectedModelCard();
          router.back();
        }
      }
    );
  };

  useEffect(() => {
    logEvent(attrKeys.userInput.VIEW_PERSONAL_INPUT, {
      name: attrProperty.name.STYLE_MODEL
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GeneralTemplate
      header={<Header hideTitle showRight={false} />}
      footer={
        <Footer>
          <Button
            fullWidth
            variant="solid"
            size="xlarge"
            disabled={!selectedModelCard.length}
            brandColor="primary"
            onClick={handleClickNext}
          >
            저장
          </Button>
        </Footer>
      }
      disablePadding
    >
      <Flexbox direction="vertical" gap={32} customStyle={{ flex: 1, padding: '20px 20px 144px' }}>
        <Flexbox component="section" direction="vertical" alignment="center" gap={4}>
          <Typography variant="h2" weight="bold">
            관심 모델을 선택해주세요!
          </Typography>
          <Typography customStyle={{ color: common.ui60 }}>
            펼쳐진 선택지에서 여러 개 고를 수 있어요
          </Typography>
        </Flexbox>
        <StylesCards themeType="normal" />
      </Flexbox>
    </GeneralTemplate>
  );
}

const Footer = styled.footer`
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 20px;
  background-color: ${({ theme: { palette } }) => palette.common.uiWhite};
`;

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  Initializer.initAccessTokenByCookies(getCookies({ req }));

  return {
    props: {
      accessUser: getAccessUserByCookies(getCookies({ req }))
    }
  };
}

export default LikeModelInput;
