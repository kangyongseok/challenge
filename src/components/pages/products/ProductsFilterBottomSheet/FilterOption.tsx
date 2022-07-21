import { HTMLAttributes, PropsWithChildren } from 'react';

import { Avatar, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

interface FilterOptionsProps extends HTMLAttributes<HTMLDivElement> {
  checked: boolean;
  avatarSrc?: string;
  colorCode?: string;
  colorImageInfo?: { size: number; position: number[] };
  count: number;
}

function FilterOption({
  children,
  checked,
  avatarSrc,
  colorCode,
  colorImageInfo,
  count,
  ...props
}: PropsWithChildren<FilterOptionsProps>) {
  const {
    theme: {
      palette: { primary, common },
      box: { shadow }
    }
  } = useTheme();

  return (
    <StyledFilterOption {...props}>
      <Icon name="CheckOutlined" size="small" color={checked ? primary.main : common.grey['80']} />
      {avatarSrc && (
        <Avatar
          width={20}
          height={20}
          src={avatarSrc}
          customStyle={{
            border: checked ? `1px solid ${primary.main}` : undefined,
            // TODO: Avatar 컴포넌트 스펙으로 추가
            boxShadow: shadow.platformLogo
          }}
          round="4"
          alt="Platform Logo Img"
        />
      )}
      {!colorImageInfo && colorCode && <ColorSample colorCode={colorCode} />}
      {colorImageInfo && <ColorImageSample colorImageInfo={colorImageInfo} />}
      <Typography
        weight="medium"
        customStyle={{
          color: checked ? primary.main : common.grey['20']
        }}
      >
        {children}
      </Typography>
      <Typography
        variant="small2"
        customStyle={{
          color: common.grey['60']
        }}
      >
        {count.toLocaleString()}
      </Typography>
    </StyledFilterOption>
  );
}

const StyledFilterOption = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  cursor: pointer;
`;

const ColorSample = styled.div<{
  colorCode: string;
}>`
  width: 20px;
  height: 20px;
  border: 1px solid ${({ theme: { palette } }) => palette.common.grey['90']};
  border-radius: 50%;
  background-color: ${({ colorCode }) => colorCode};
`;

const ColorImageSample = styled.div<{
  colorImageInfo: { size: number; position: number[] };
}>`
  width: 20px;
  height: 20px;
  border: 1px solid ${({ theme: { palette } }) => palette.common.grey['90']};
  border-radius: 50%;
  background-size: ${({ colorImageInfo: { size } }) => size}px;
  background-image: url('https://${process.env
    .IMAGE_DOMAIN}/assets/images/ico/filter_color_ico.png');
  background-position: ${({ colorImageInfo: { position } }) => `${position[0]}px ${position[1]}px`};
`;

export default FilterOption;
