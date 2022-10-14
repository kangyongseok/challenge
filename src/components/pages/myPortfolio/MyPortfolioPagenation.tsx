import { Flexbox, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

function MyPortfolioPagenation({
  currentSection,
  totalPageNum
}: {
  currentSection: number;
  totalPageNum: number;
}) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const pagenationBg = (i: number) => {
    if (currentSection === i + 1) {
      return common.ui60;
    }
    if (currentSection > 0) {
      return common.ui90;
    }
    return common.ui20;
  };

  return (
    <StyledPagenationWrap direction="vertical" gap={8}>
      {Array.from({ length: totalPageNum - 1 }, (_, i) => i + 1).map((value, i) => (
        <Pagenation key={`pagenation-${value}`} bg={pagenationBg(i)} />
      ))}
    </StyledPagenationWrap>
  );
}

const StyledPagenationWrap = styled(Flexbox)`
  position: absolute;
  top: calc(50% - 50px);
  right: 12px;
`;

const Pagenation = styled.div<{ bg: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ bg }) => bg};
`;

export default MyPortfolioPagenation;
