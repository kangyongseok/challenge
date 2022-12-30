import { useRecoilValue, useResetRecoilState } from 'recoil';
import { useMutation } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { StylesCards } from '@components/UI/organisms';
import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import { postUserStyle } from '@api/user';

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
    >
      <Box customStyle={{ marginBottom: 32, textAlign: 'center' }}>
        <Typography variant="h3" weight="bold" customStyle={{ marginBottom: 8 }}>
          관심 모델을 선택해주세요!
        </Typography>
        <Typography customStyle={{ color: common.ui60 }}>
          펼쳐진 선택지에서 여러 개 고를 수 있어요
        </Typography>
      </Box>
      <StylesCards themeType="normal" />
      <Box customStyle={{ height: 100 }} />
    </GeneralTemplate>
  );
}

const Footer = styled.footer`
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 20px;
  background-color: white;
`;

export default LikeModelInput;
