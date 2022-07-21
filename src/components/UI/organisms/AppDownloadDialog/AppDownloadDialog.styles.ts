import styled from '@emotion/styled';

export const FeatureBox = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 2fr;
  grid-row-gap: 11px;
  text-align: center;
  margin-top: 12px;
  padding: 15px 0;
  border-radius: ${({
    theme: {
      box: { round }
    }
  }) => round['8']};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.grey['98']};

  & > div {
    margin: auto;
  }
`;
