import React, { ButtonHTMLAttributes, memo } from 'react';
import Image from 'next/image';
import styled from '@emotion/styled';

import { Typography } from 'mrcamel-ui';

interface SocialLoginButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'kakao';
  onClick: () => void;
}

function SocialLoginButton({ variant = 'kakao', onClick, ...props }: SocialLoginButtonProps) {
  if (variant === 'kakao') {
    return (
      <KakaoLogin onClick={onClick} {...props}>
        <Image
          width={20}
          height={20}
          src={`https://${process.env.IMAGE_DOMAIN}/assets/img/login-kakao-icon.png`}
          alt="Kakao Logo Img"
        />
        <Typography variant="body1" weight="medium" customColor="#000000">
          카카오톡으로 계속하기
        </Typography>
      </KakaoLogin>
    );
  }

  return (
    <KakaoLogin onClick={onClick} {...props}>
      <Image
        width={20}
        height={20}
        src={`https://${process.env.IMAGE_DOMAIN}/assets/img/login-kakao-icon.png`}
        alt="Kakao Logo Img"
      />
      <Typography variant="body1" weight="medium" customColor="#000000">
        카카오톡으로 계속하기
      </Typography>
    </KakaoLogin>
  );
}

const KakaoLogin = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 54px;
  background-color: #fee500;
  border-radius: 8px;
`;

export default memo(SocialLoginButton);
