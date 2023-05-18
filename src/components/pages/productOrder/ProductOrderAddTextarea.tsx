import TextareaAutosize from 'react-textarea-autosize';
import { Box, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

function ProductOrderAddTextArea() {
  return (
    <Box
      component="section"
      customStyle={{
        padding: '32px 20px'
      }}
    >
      <Typography variant="h3" weight="bold">
        추가 요청사항
      </Typography>
      <Typography color="ui60" customStyle={{ marginTop: 4 }}>
        카멜이 매물에 대해 확인해야 할 내용이 있다면 알려주세요.
      </Typography>
      <Description>
        <TextareaAutosize placeholder="예시) 프린팅 까짐 없는지 확인해주세요." />
      </Description>
    </Box>
  );
}

const Description = styled.div`
  position: relative;
  width: 100%;
  margin-top: 20px;

  textarea {
    min-height: 84px;
    width: 100%;
    border: 1px solid ${({ theme: { palette } }) => palette.common.line01};
    border-radius: 8px;
    padding: 12px;
    color: ${({ theme: { palette } }) => palette.common.ui20};
    resize: none;

    ${({ theme: { typography } }) => ({
      fontSize: typography.h4.size,
      fontWeight: typography.h4.weight.regular,
      lineHeight: typography.h4.lineHeight,
      letterSpacing: typography.h4.letterSpacing
    })};

    ::placeholder {
      color: ${({
        theme: {
          palette: { common }
        }
      }) => common.ui80};
      white-space: pre-wrap;

      ${({ theme: { typography } }) => ({
        fontSize: typography.h4.size,
        fontWeight: typography.h4.weight.regular,
        lineHeight: typography.h4.lineHeight,
        letterSpacing: typography.h4.letterSpacing
      })};
    }
  }
`;

export default ProductOrderAddTextArea;
