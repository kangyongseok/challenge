import { useState } from 'react';

import Image from 'next/image';
import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { NEXT_IMAGE_BLUR_URL } from '@constants/common';

interface UserInfoProfileProps {
  show: boolean;
  userName: string;
  userImage: string;
  curnScore: number;
  maxScore: number;
}

function UserInfoProfile({ show, userName, userImage, curnScore, maxScore }: UserInfoProfileProps) {
  const {
    theme: {
      zIndex,
      palette: { common }
    }
  } = useTheme();
  const [imageRendered, setImageRendered] = useState(false);

  const handleLoadComplete = () => {
    setImageRendered(true);
  };

  return (
    <Flexbox
      component="section"
      direction="vertical"
      alignment="center"
      gap={12}
      customStyle={{
        margin: '-16px 20px 20px',
        zIndex: show ? zIndex.header : 0,
        visibility: show ? 'visible' : 'hidden'
      }}
    >
      {userImage && (
        <Box
          customStyle={{
            position: 'relative',
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: common.bg02,
            overflow: 'hidden'
          }}
        >
          <Image
            alt="User Avatar Img"
            src={userImage}
            onLoadingComplete={handleLoadComplete}
            placeholder="blur"
            blurDataURL={NEXT_IMAGE_BLUR_URL}
            layout="fill"
            objectFit="cover"
            style={{ borderRadius: '50%' }}
          />
        </Box>
      )}
      {!imageRendered && !userImage && (
        <UserAvatar>
          <Icon name="UserFilled" width={24} height={24} customStyle={{ color: common.ui80 }} />
        </UserAvatar>
      )}
      <Typography variant="h3" weight="bold">
        {userName}
      </Typography>
      {!!curnScore && !!maxScore && (
        <Flexbox alignment="center" justifyContent="center" gap={1}>
          {Array.from({ length: 5 }, (_, index) => {
            return index <
              (maxScore === 10 ? Math.floor(Number(curnScore) / 2) : Number(curnScore)) ? (
              <Icon
                name="StarFilled"
                width={16}
                height={16}
                customStyle={{
                  color: '#FFD911'
                }}
              />
            ) : (
              <Icon
                name="StarOutlined"
                width={16}
                height={16}
                customStyle={{
                  color: '#FFD911'
                }}
              />
            );
          })}
        </Flexbox>
      )}
    </Flexbox>
  );
}

export const UserAvatar = styled.div`
  background-color: ${({ theme: { palette } }) => palette.common.bg02};
  border-radius: 50%;
  min-width: 52px;
  width: 52px;
  height: 52px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default UserInfoProfile;
