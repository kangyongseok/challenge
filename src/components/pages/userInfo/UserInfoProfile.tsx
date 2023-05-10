import { useState } from 'react';

import { Box, Flexbox, Icon, Image, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import UserAvatar from '@components/UI/organisms/UserAvatar';
import { CamelAuthLabel } from '@components/UI/atoms';

import { DEFAUT_BACKGROUND_IMAGE, HEADER_HEIGHT, IOS_SAFE_AREA_TOP } from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import UserInfoStar from './UserInfoStar';
import UserInfoConnectTime from './UserInfoConnectTime';

interface UserInfoProfileProps {
  imageProfile: string;
  imageBackground: string;
  nickName: string;
  areaName: string;
  shopDescription: string;
  isCertificationSeller: boolean;
  curnScore: number;
  maxScore: number;
  dateActivated: string;
}

function UserInfoProfile({
  imageProfile,
  imageBackground,
  nickName,
  areaName,
  shopDescription,
  isCertificationSeller,
  curnScore,
  maxScore,
  dateActivated
}: UserInfoProfileProps) {
  const [loadFail, setLoadFail] = useState(false);

  return (
    <Box component="section">
      <ImageWrapper>
        {!loadFail ? (
          <>
            <BackgroundImage
              src={imageBackground || imageProfile}
              alt="BackgroundImg"
              disableAspectRatio
              disableOnBackground={false}
              onError={() => setLoadFail(true)}
            />
            <Blur />
          </>
        ) : (
          <>
            <BackgroundImage
              src={DEFAUT_BACKGROUND_IMAGE}
              alt="BackgroundImg"
              disableAspectRatio
              disableOnBackground={false}
            />
            <Blur />
          </>
        )}
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
              {isCertificationSeller && <CamelAuthLabel />}
            </Flexbox>
            <Flexbox direction="vertical" gap={8}>
              <Flexbox alignment="center" gap={6}>
                {dateActivated && <UserInfoConnectTime dateActivated={dateActivated} />}
                {areaName.length > 0 && (
                  <Flexbox alignment="center">
                    <Icon name="PinOutlined" width={16} height={16} />
                    <Typography variant="body2">{areaName}</Typography>
                  </Flexbox>
                )}
              </Flexbox>
              {!!curnScore && !!maxScore && (
                <UserInfoStar curnScore={curnScore} maxScore={maxScore} />
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
  min-height: calc(${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'} + 160px);
  margin-top: calc(
    -${HEADER_HEIGHT}px - ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'}
  );
`;

const BackgroundImage = styled(Image)`
  position: absolute;
  width: 100%;
  min-height: calc(${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'} + 160px);
`;

const Blur = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  background: ${({ theme: { palette } }) => palette.common.overlay20};
  backdrop-filter: blur(8px);
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
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
