import styled from '@emotion/styled';

export const SNSIcon = styled.span<{ backgroundPosition: string }>`
  display: inline-block;
  width: 33px;
  height: 33px;
  background-image: url(${`https://${process.env.IMAGE_DOMAIN}/assets/images/ico/fullpage_ico.png`});
  background-repeat: no-repeat;
  background-size: 432px;
  background-position: ${({ backgroundPosition }) => backgroundPosition};
`;
