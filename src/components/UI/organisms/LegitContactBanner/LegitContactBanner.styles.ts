import { Flexbox } from 'mrcamel-ui';
import styled from '@emotion/styled';

export const StyledLegitContactBanner = styled(Flexbox)<{ isDark: boolean; isFixed: boolean }>`
  padding: 17px 0 16px 20px;
  text-overflow: ellipsis;
  background-color: ${({
    isDark,
    theme: {
      palette: { common }
    }
  }) => (isDark ? common.cmnB : common.ui90)};
  cursor: pointer;
  height: 72px;
  z-index: ${({ theme }) => theme.zIndex.bottomNav};

  ${({ isFixed }) =>
    isFixed && {
      position: 'fixed',
      bottom: 0,
      width: '100%'
    }};
`;

export const InfoBox = styled.div`
  flex: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;

  > div {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`;

export const ImageBox = styled.div`
  height: 36px;
  & > div {
    transform: translateY(-50%);
  }
`;
