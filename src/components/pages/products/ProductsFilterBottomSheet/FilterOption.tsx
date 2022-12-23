import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

import { Avatar, Box, Button, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { filterImageColorNames } from '@constants/productsFilter';

interface FilterOptionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  avatarSrc?: string;
  colorName?: string;
  colorCode?: string;
  count: number;
}

function FilterOption({
  children,
  checked,
  avatarSrc,
  colorName,
  colorCode,
  count,
  ...props
}: PropsWithChildren<FilterOptionProps>) {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();

  return (
    <Button
      variant="inline"
      brandColor={checked ? 'primary' : 'black'}
      size="large"
      startIcon={
        <>
          {avatarSrc && (
            <Avatar
              width={20}
              height={20}
              src={avatarSrc}
              round="4"
              alt="Platform Logo Img"
              customStyle={{
                marginRight: 4,
                border: '1px solid rgba(0, 0, 0, 0.12)'
              }}
            />
          )}
          {!filterImageColorNames.includes(colorName || '') && colorCode && (
            <ColorSample colorName={colorName} colorCode={colorCode}>
              {checked && (
                <Icon
                  name="CheckOutlined"
                  width={16}
                  height={16}
                  color={colorName === 'white' ? 'black' : 'white'}
                  customStyle={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              )}
            </ColorSample>
          )}
          {filterImageColorNames.includes(colorName || '') && (
            <Box
              customStyle={{
                position: 'relative',
                width: 24,
                height: 24,
                marginRight: 4
              }}
            >
              <Avatar
                width="24px"
                height="24px"
                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/ico/colors/${colorName}.png`}
                alt="Color Img"
                customStyle={{
                  borderRadius: '50%'
                }}
              />
              {checked && (
                <Icon
                  name="CheckOutlined"
                  width={16}
                  height={16}
                  color={colorName === 'ivory' ? common.uiBlack : common.uiWhite}
                  customStyle={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              )}
            </Box>
          )}
        </>
      }
      endIcon={
        <Typography
          variant="h4"
          customStyle={{
            color: common.ui80
          }}
        >
          {count.toLocaleString()}
        </Typography>
      }
      {...props}
      customStyle={{
        paddingLeft: 0,
        paddingRight: 0
      }}
    >
      <Typography
        variant="h4"
        weight={checked ? 'medium' : 'regular'}
        customStyle={{
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          color: checked ? primary.light : undefined
        }}
      >
        {children}
      </Typography>
    </Button>
  );
}

export const ColorSample = styled.div<{
  colorName?: string;
  colorCode?: string;
}>`
  position: relative;
  width: 24px;
  height: 24px;
  margin-right: 4px;
  border: 1px solid transparent;

  ${({
    theme: {
      palette: { common }
    },
    colorName
  }) =>
    colorName === 'white'
      ? {
          border: `1px solid ${common.line01}`
        }
      : {}};

  border-radius: 50%;
  background-color: ${({ colorCode }) => colorCode};
`;

export default FilterOption;
