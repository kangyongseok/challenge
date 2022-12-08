import { Flexbox } from 'mrcamel-ui';
import styled from '@emotion/styled';

export const GenderSelect = styled(Flexbox)<{ isGender: boolean }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${({ isGender, theme: { palette } }) =>
    isGender ? palette.common.ui20 : palette.common.ui95};
`;

export const DatePicker = styled.div<{ url: string; smallHeight: boolean }>`
  background: ${({ url }) => `url(${url})`} no-repeat 50% 50%;
  background-size: 100%;
  width: 100%;
  height: 150px;
  margin-top: ${({ smallHeight }) => (smallHeight ? 30 : 52)}px;
  overflow: hidden;
  position: relative;
  /* box-shadow: 0px 1px 104px 13px rgba(0, 0, 0, 0.62) inset;
  -webkit-box-shadow: 0px 1px 104px 13px rgba(0, 0, 0, 0.62) inset;
  -moz-box-shadow: 0px 1px 104px 13px rgba(0, 0, 0, 0.62) inset; */
`;

export const CenterContents = styled.div`
  position: absolute;
  top: 50%;
  margin-top: -121px;
  left: 0;
  width: 100%;
  padding: 0 40px;
`;