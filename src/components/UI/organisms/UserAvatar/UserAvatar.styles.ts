import styled from '@emotion/styled';

import { Image } from '@components/UI/atoms';

export const UserImage = styled(Image)<{ isActive: boolean }>`
  border-radius: 50%;
  object-fit: cover;
  ${({ theme: { palette }, isActive }) =>
    isActive && { border: `2px solid ${palette.primary.light}` }};
`;

export const Status = styled.div`
  position: absolute;
  display: inline-flex;
  justify-content: center;
  width: 100%;
  transform: translateY(-50%);
`;
