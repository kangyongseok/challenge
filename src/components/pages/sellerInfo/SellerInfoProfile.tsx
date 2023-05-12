import { Avatar, Flexbox, Icon, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { PRODUCT_SITE } from '@constants/product';

interface SellerInfoProfileProps {
  show: boolean;
  platformId: number;
  platformImage: string;
  userName: string;
  curnScore: string | null | undefined;
  maxScore: number;
}

function SellerInfoProfile({
  show,
  platformId,
  platformImage,
  userName,
  curnScore,
  maxScore
}: SellerInfoProfileProps) {
  return (
    <Wrapper show={show}>
      <Avatar
        width={32}
        height={32}
        round="50%"
        src={platformImage}
        alt="Platform Logo Img"
        customStyle={{ border: '1px solid rgba(0, 0, 0, 0.12)' }}
      />
      <Flexbox direction="vertical" alignment="center" gap={8} customStyle={{ width: '100%' }}>
        <Typography
          variant="h3"
          weight="bold"
          customStyle={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {userName}
        </Typography>
        {platformId === PRODUCT_SITE.DAANGN.id ? (
          <Typography variant="h4" weight="bold">
            {curnScore}
          </Typography>
        ) : (
          <Flexbox alignment="center" justifyContent="center" gap={1}>
            {Array.from({ length: 5 }, (_, index) => {
              return index <
                (maxScore === 10 ? Math.floor(Number(curnScore) / 2) : Number(curnScore)) ? (
                <Icon name="StarFilled" width={16} height={16} color="#FFD911" />
              ) : (
                <Icon name="StarOutlined" width={16} height={16} color="#FFD911" />
              );
            })}
          </Flexbox>
        )}
      </Flexbox>
    </Wrapper>
  );
}

const Wrapper = styled.section<{ show: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: -10px 20px 20px;
  z-index: ${({ show, theme: { zIndex } }) => show && zIndex.header};
  visibility: ${({ show }) => (show ? 'visible' : 'hidden')};
`;

export default SellerInfoProfile;
