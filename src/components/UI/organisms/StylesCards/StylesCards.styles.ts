import { Flexbox, Icon, Typography, dark } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

export const ParentStyleCard = styled(Flexbox)<{ isSelect: boolean; themeType?: boolean }>`
  width: 100%;
  height: 120px;
  border-radius: 8px;
  background: ${({ isSelect, theme: { palette }, themeType }) =>
    // eslint-disable-next-line no-nested-ternary
    isSelect ? (themeType ? palette.common.ui20 : palette.common.uiBlack) : palette.common.ui95};
  padding: 30px 20px;
  position: relative;
`;

export const SubModelCard = styled(Flexbox)<{ isSelected: boolean; imgUrl: string }>`
  min-width: calc(50% - 6px);
  max-width: calc(50% - 6px);
  border-radius: 8px;
  height: 80px;
  padding-left: 20px;
  position: relative;
  overflow: hidden;
  background: ${({ imgUrl, isSelected, theme: { palette } }) =>
    isSelected ? palette.common.uiWhite : `url(${imgUrl}) no-repeat`};
  background-size: 100%;
  border: 2px solid
    ${({ theme: { palette }, isSelected }) => (isSelected ? palette.common.uiBlack : 'transparent')};
`;

export const SubModelCheckIcon = styled(Icon)`
  position: absolute;
  top: 50%;
  right: 10px;
  margin-top: -10px;
`;

export const StyleCardImgWrap = styled.div`
  width: 128px;
  margin-left: auto;
  position: relative;
  top: -35px;
  right: -15px;
`;

export const ModelCardText = styled(Typography)<{ isSelected: boolean }>`
  max-width: 70%;
  word-break: keep-all;
  white-space: pre-wrap;
  color: ${({ isSelected }) =>
    isSelected ? dark.palette.common.uiWhite : dark.palette.common.uiBlack};
`;
