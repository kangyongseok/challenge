import { useState } from 'react';

import { Avatar, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

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
      {imageRendered ? (
        <Avatar width={52} height={52} src={userImage} alt="User Avatar Img" round="50%" />
      ) : (
        <UserAvatar>
          <Icon name="UserFilled" width={24} height={24} customStyle={{ color: common.ui80 }} />
        </UserAvatar>
      )}
      <HiddenImageLoader src={userImage} onLoad={() => setImageRendered(true)} />
      <Typography variant="h3" weight="bold">
        {userName}
      </Typography>
      {!!curnScore && !!maxScore && (
        <Flexbox alignment="center">
          {Array.from({ length: 5 }, (_, index) => (
            <Icon
              key={`rating-star-${index}`}
              name="StarFilled"
              width={16}
              height={16}
              customStyle={{
                color:
                  index < (maxScore === 10 ? Math.floor(curnScore / 2) : curnScore)
                    ? '#FEB700'
                    : common.bg02
              }}
            />
          ))}
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

const HiddenImageLoader = styled.img`
  display: none;
`;

export default UserInfoProfile;
