import type { ReactElement } from 'react';

import { useRouter } from 'next/router';
import { CtaButton, Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

interface WishesNoticeProps {
  message: string | ReactElement;
  moveTo: string;
  buttonLabel: string | ReactElement;
  icon: string | ReactElement;
  onClickLog?: () => void;
}

function WishesNotice({ icon, message, moveTo, buttonLabel, onClickLog }: WishesNoticeProps) {
  const router = useRouter();
  const { hiddenTab } = router.query;

  const handleClick = () => {
    if (onClickLog) onClickLog();

    if (moveTo === '/login') {
      router.push({ pathname: '/login', query: { returnUrl: router.asPath } });
    } else {
      router.push(moveTo);
    }
  };

  return (
    <Flexbox
      direction="vertical"
      alignment="center"
      justifyContent="center"
      gap={24}
      customStyle={{
        height: `calc(100vh - ${hiddenTab === 'legit' ? '188px' : '161px'})`
      }}
    >
      <Icon>{icon}</Icon>
      <Typography variant="h4" weight="bold" customStyle={{ textAlign: 'center' }}>
        {message}
      </Typography>
      <CtaButton
        variant="contained"
        brandColor="primary"
        onClick={handleClick}
        customStyle={{
          width: 200
        }}
      >
        {buttonLabel}
      </CtaButton>
    </Flexbox>
  );
}

const Icon = styled(Flexbox)`
  justify-content: center;
  align-items: center;
  width: 52px;
  height: 52px;
  padding: 8px;
  border-radius: 20px;
  font-size: ${({ theme: { typography } }) => typography.h2.size};
  background-color: ${({ theme: { palette } }) => palette.primary.highlight};
`;

export default WishesNotice;
