import { Avatar, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';

import { PRODUCT_SITE } from '@constants/product';

interface SellerInfoProfileProps {
  show: boolean;
  platformId: number;
  userName: string;
  isCamelSeller: boolean;
  curnScore: number;
  maxScore: number;
}

function SellerInfoProfile({
  show,
  platformId,
  userName,
  isCamelSeller,
  curnScore,
  maxScore
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
      <Avatar
        width={32}
        height={32}
        round="50%"
        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${platformId}.png`}
        alt="Platform Logo Img"
        customStyle={{
          border: '1px solid rgba(0, 0, 0, 0.12)'
        }}
      />
      <Typography variant="h3" weight="bold">
        {userName}
      </Typography>
      {isCamelSeller && (
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
        <Flexbox alignment="center">
          {Array.from({ length: 5 }, (_, index) => (
            <Icon
              name="StarFilled"
              width={16}
              height={16}
              customStyle={{
                color:
                  index < (maxScore === 10 ? Math.floor(Number(curnScore) / 2) : Number(curnScore))
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

export default SellerInfoProfile;
