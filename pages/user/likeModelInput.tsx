import { useRecoilValue, useResetRecoilState } from 'recoil';
import { QueryClient, dehydrate, useMutation } from 'react-query';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import { Button, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import StylesCards from '@components/UI/organisms/StylesCards';
import Header from '@components/UI/molecules/Header';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import Initializer from '@library/initializer';

import { postUserStyle } from '@api/user';

import { getCookies } from '@utils/cookies';

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

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const queryClient = new QueryClient();

  Initializer.initAccessTokenByCookies(getCookies({ req }));
  const accessUser = Initializer.initAccessUserInQueryClientByCookies(
    getCookies({ req }),
    queryClient
  );

  if (!accessUser) {
    return {
      redirect: {
        destination: '/login?returnUrl=/user/likeModelInput&isRequiredLogin=true',
        permanent: false
      }
    };
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

const Footer = styled.footer`
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 20px;
  background-color: ${({ theme: { palette } }) => palette.common.uiWhite};
`;

export default LikeModelInput;
