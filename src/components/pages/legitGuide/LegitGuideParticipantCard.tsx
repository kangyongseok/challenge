import { Avatar, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

interface LegitGuideParticipantCardProps {
  avatarSrc: string;
  description: string;
  subDescription: string;
  legitCount: number;
  size?: 'large' | 'medium' | 'small';
  hideShadow?: boolean;
  customStyle?: CustomStyle;
}

function LegitGuideParticipantCard({
  avatarSrc,
  description,
  subDescription,
  legitCount,
  size = 'medium',
  hideShadow,
  customStyle
}: LegitGuideParticipantCardProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  if (size === 'large') {
    return (
      <StyledLegitGuideParticipantCard
        gap={8}
        alignment="flex-start"
        size={size}
        hideShadow={hideShadow}
        css={customStyle}
      >
        <Avatar width={24} height={24} src={avatarSrc} alt="Avatar Img" />
        <Flexbox direction="vertical" gap={2}>
          <Typography variant="small1">
            {subDescription}
            <br />
            <strong>{description}</strong>
          </Typography>
          <Typography variant="small2" customStyle={{ color: common.grey['60'] }}>
            명품감정횟수 총 {legitCount}회
          </Typography>
        </Flexbox>
      </StyledLegitGuideParticipantCard>
    );
  }

  if (size === 'small') {
    return (
      <StyledLegitGuideParticipantCard
        gap={5}
        alignment="flex-start"
        size={size}
        hideShadow={hideShadow}
        css={customStyle}
      >
        <Avatar width={16} height={16} src={avatarSrc} alt="Avatar Img" />
        <Flexbox direction="vertical" gap={1}>
          <Typography variant="small2" weight="medium">
            {subDescription}
            <br />
            <strong>{description}</strong>
          </Typography>
          <Typography variant="small2" customStyle={{ color: common.grey['60'] }}>
            명품감정횟수 총 {legitCount}회
          </Typography>
        </Flexbox>
      </StyledLegitGuideParticipantCard>
    );
  }

  return (
    <StyledLegitGuideParticipantCard
      gap={8}
      alignment="flex-start"
      size={size}
      hideShadow={hideShadow}
      css={customStyle}
    >
      <Avatar width={24} height={24} src={avatarSrc} alt="Avatar Img" />
      <Flexbox direction="vertical" gap={2}>
        <Typography variant="small1">
          {subDescription}
          <br />
          <strong>{description}</strong>
        </Typography>
        <Typography variant="small2" customStyle={{ color: common.grey['60'] }}>
          명품감정횟수 총 {legitCount}회
        </Typography>
      </Flexbox>
    </StyledLegitGuideParticipantCard>
  );
}

const StyledLegitGuideParticipantCard = styled(Flexbox)<{
  size: 'large' | 'medium' | 'small';
  hideShadow?: boolean;
}>`
  width: fit-content;
  white-space: nowrap;
  border-radius: 14px;

  ${({ size }): CSSObject => {
    switch (size) {
      case 'small':
        return {
          padding: '6px 8px 5px'
        };
      default:
        return {
          padding: 10
        };
    }
  }};

  ${({
    theme: {
      palette: { common }
    },
    hideShadow
  }) =>
    hideShadow
      ? ''
      : {
          border: `1px solid ${common.grey['98']}`,
          boxShadow: '0 13px 10px -2px rgba(0, 0, 0, 0.06)'
        }};

  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.white};
`;

export default LegitGuideParticipantCard;
