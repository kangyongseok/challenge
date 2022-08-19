import { useRouter } from 'next/router';
import { Box, CtaButton, Flexbox, Icon, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

function LegitResultBottomCtaButton() {
  const router = useRouter();
  const { id } = router.query;
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  return (
    <Box customStyle={{ minHeight: 89 }}>
      <CtaButtonWrapper gap={8}>
        <CtaButton
          startIcon={<Icon name="ShareOutlined" />}
          size="large"
          iconOnly
          customStyle={{
            borderColor: common.grey['95']
          }}
        />
        <CtaButton
          fullWidth
          variant="contained"
          brandColor="black"
          size="large"
          onClick={() => router.push(`/products/${id}`)}
        >
          해당 매물로 돌아가기
        </CtaButton>
      </CtaButtonWrapper>
    </Box>
  );
}

const CtaButtonWrapper = styled(Flexbox)`
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 20px;
  border-top: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.grey['90']};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.white};
`;

export default LegitResultBottomCtaButton;
