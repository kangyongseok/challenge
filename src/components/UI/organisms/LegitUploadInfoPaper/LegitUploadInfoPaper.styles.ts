import styled from '@emotion/styled';

export const StyledLegitUploadInfoPaper = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: ${({ theme: { box } }) => box.round['8']};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg02};
`;

export const Divider = styled.div`
  width: 100%;
  border: 1px dashed
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
  margin: 32px 0;
`;
