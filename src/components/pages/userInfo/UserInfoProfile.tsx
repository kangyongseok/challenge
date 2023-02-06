import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import UserAvatar from '@components/UI/organisms/UserAvatar';

import { APP_TOP_STATUS_HEIGHT, HEADER_HEIGHT } from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

interface UserInfoProfileProps {
  imageProfile: string;
  imageBackground: string;
  nickName: string;
  areaName: string;
  shopDescription: string;
  isCertificationSeller: boolean;
  curnScore: number;
  maxScore: number;
}

function UserInfoProfile({
  imageProfile,
  imageBackground,
  nickName,
  areaName,
  shopDescription,
  isCertificationSeller,
  curnScore,
  maxScore
}: UserInfoProfileProps) {
  const {
    theme: {
      palette: { primary }
    }
  } = useTheme();

  return (
    <Box component="section">
      <ImageWrapper>
        <BackgroundImage
          src={
            imageBackground ||
            imageProfile ||
            `https://${process.env.IMAGE_DOMAIN}/assets/images/user/shop/profile-background.png`
          }
        >
          <Blur />
        </BackgroundImage>
      </ImageWrapper>
      <Info>
        <Flexbox direction="vertical" gap={12} customStyle={{ flex: 1, padding: '0 20px 36px' }}>
          <Flexbox justifyContent="center" alignment="center" customStyle={{ marginTop: -40 }}>
            <UserAvatar src={imageProfile} showBorder />
          </Flexbox>
          <Flexbox direction="vertical" alignment="center" gap={4}>
            <Flexbox
              alignment="center"
              justifyContent="center"
              gap={2}
              customStyle={{ width: '100%' }}
            >
              <NickName variant="h3" weight="bold">
                {nickName}
              </NickName>
              {isCertificationSeller && (
                <Icon name="SafeFilled" customStyle={{ color: primary.main, minWidth: 24 }} />
              )}
            </Flexbox>
            <Flexbox direction="vertical" gap={8}>
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
              {areaName.length > 0 && (
                <Flexbox alignment="center">
                  <Icon name="PinOutlined" width={16} height={16} />
                  <Typography>{areaName}</Typography>
                </Flexbox>
              )}
            </Flexbox>
          </Flexbox>
          {!!shopDescription && (
            <Description
              dangerouslySetInnerHTML={{
                __html: shopDescription.replace(/\r?\n/g, '<br />')
              }}
            />
          )}
        </Flexbox>
      </Info>
    </Box>
  );
}

const ImageWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  user-select: none;
  min-height: 160px;
  padding-top: ${isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0}px;
  margin-top: -${HEADER_HEIGHT + (isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0)}px;
`;

const BackgroundImage = styled.div<{ src: string }>`
  position: absolute;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-image: url(${({ src }) => src});
`;

const Blur = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  position: absolute;
  background: ${({ theme: { palette } }) => palette.common.overlay20};
  backdrop-filter: blur(8px);
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  user-select: none;
`;

const NickName = styled(Typography)`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Description = styled(Typography)`
  word-break: keep-all;
  overflow: hidden;
  width: 100%;
`;

export default UserInfoProfile;
