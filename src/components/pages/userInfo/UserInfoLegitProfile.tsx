import { useRouter } from 'next/router';
import { Button, Flexbox, Icon, ThemeProvider, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import UserAvatar from '@components/UI/organisms/UserAvatar';

import { logEvent } from '@library/amplitude';

import { HEADER_HEIGHT, IOS_SAFE_AREA_TOP } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

interface UserInfoLegitProfileProps {
  imageProfile: string;
  imageBackground: string;
  userId: number;
  nickName: string;
  areaName: string;
  shopDescription: string;
  curnScore: number;
  maxScore: number;
}

function UserInfoLegitProfile({
  imageProfile,
  imageBackground,
  userId,
  nickName,
  areaName,
  shopDescription,
  curnScore,
  maxScore
}: UserInfoLegitProfileProps) {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const handleClick = () => {
    router.push(`/legit/profile/${userId}`);
    logEvent(attrKeys.userInput.CLICK_LEGIT_PROFILE, {
      name: attrProperty.name.SELLER_INFO,
      att: nickName
    });
  };

  return (
    <Wrapper>
      <BackgroundImage src={imageBackground}>
        <Blur />
      </BackgroundImage>
      <Info>
        <Flexbox
          direction="vertical"
          alignment="center"
          gap={12}
          customStyle={{ flex: 1, padding: '0 20px' }}
        >
          <UserAvatar src={imageProfile} />
          <ThemeProvider theme="dark">
            <Flexbox direction="vertical" alignment="center" gap={4}>
              <Flexbox
                alignment="center"
                justifyContent="center"
                gap={4}
                customStyle={{ width: '100%' }}
              >
                <NickName variant="h3" weight="bold">
                  {nickName}
                </NickName>
                <BadgeLabel>
                  <Icon name="LegitFilled" size="small" customStyle={{ color: common.cmnW }} />
                  <Typography variant="body2" weight="medium">
                    감정사
                  </Typography>
                </BadgeLabel>
              </Flexbox>
              <Flexbox direction="vertical" gap={8}>
                {!!curnScore && !!maxScore && (
                  <Flexbox alignment="center" justifyContent="center" gap={1}>
                    {Array.from({ length: 5 }, (_, index) => {
                      return index <
                        (maxScore === 10
                          ? Math.floor(Number(curnScore) / 2)
                          : Number(curnScore)) ? (
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
          </ThemeProvider>
        </Flexbox>
        <Flexbox
          alignment="center"
          gap={8}
          customStyle={{
            marginBottom: -1,
            padding: '32px 20px 20px',
            background: common.gradation180
          }}
        >
          <Button
            size="large"
            fullWidth
            variant="outline"
            brandColor="gray"
            customStyle={{ borderColor: 'transparent' }}
            onClick={handleClick}
          >
            감정사 프로필 보기
          </Button>
        </Flexbox>
      </Info>
    </Wrapper>
  );
}

const Wrapper = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 312px;
  margin-top: calc(
    -${HEADER_HEIGHT}px - ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'}
  );
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
  background: ${({ theme: { palette } }) => palette.common.overlay40};
  backdrop-filter: blur(8px);
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  flex: 1;
  padding-top: calc(
    ${HEADER_HEIGHT}px + 20px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'}
  );
`;

const NickName = styled(Typography)`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const BadgeLabel = styled.label`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 4px 8px;
  gap: 2px;
  background-color: ${({ theme: { palette } }) => palette.common.uiWhite};
  border-radius: 12px;
`;

const Description = styled(Typography)`
  word-break: keep-all;
  overflow: hidden;
  width: 100%;
`;

export default UserInfoLegitProfile;
