import { Avatar, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { PRODUCT_SITE } from '@constants/product';

interface SellerInfoProfileProps {
  show: boolean;
  platformId: number;
  userName: string;
  isCertificationSeller: boolean;
  curnScore: number;
  maxScore: number;
  profileImage?: string | null;
}

function SellerInfoProfile({
  show,
  platformId,
  userName,
  isCertificationSeller,
  curnScore,
  maxScore,
  profileImage
}: SellerInfoProfileProps) {
  const {
    theme: {
      zIndex,
      palette: { primary, common }
    }
  } = useTheme();

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
      {profileImage ? (
        <Avatar
          width={52}
          height={52}
          round="50%"
          src={profileImage}
          alt="Platform Logo Img"
          customStyle={{
            border: '1px solid rgba(0, 0, 0, 0.12)'
          }}
        />
      ) : (
        <IconBox justifyContent="center" alignment="center">
          <Icon name="UserFilled" customStyle={{ color: common.ui80 }} />
        </IconBox>
      )}
      <Typography variant="h3" weight="bold">
        {userName}
      </Typography>
      {isCertificationSeller && (
        <Flexbox alignment="center" gap={4}>
          <Icon name="SafeFilled" size="small" customStyle={{ color: primary.main }} />
          <Typography variant="body2" weight="bold" customStyle={{ color: primary.main }}>
            카멜인증판매자
          </Typography>
        </Flexbox>
      )}
      {platformId === PRODUCT_SITE.DAANGN.id ? (
        <Typography variant="h4" weight="bold">
          {curnScore}
        </Typography>
      ) : (
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

const IconBox = styled(Flexbox)`
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg02};
  width: 40px;
  height: 40px;
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line02};
  border-radius: 50%;
  overflow: hidden;
`;

export default SellerInfoProfile;
