import { ReactElement, useEffect, useRef, useState } from 'react';

import type { IconName } from '@mrcamelhub/camel-ui';
import { Backdrop, Flexbox, Icon, Tooltip, Typography } from '@mrcamelhub/camel-ui';

import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';

import { StyledDialMenu, StyledFloatingActionButton, Wrapper } from './FloatingActionButton.styles';

export interface FloatingActionButtonProps {
  iconName: IconName;
  text: string;
  bottom?: number;
  dialMenu?: ReactElement;
  tooltip?: {
    open: boolean;
    message: string | ReactElement;
  };
  onClick?: () => void;
}

function FloatingActionButton({
  iconName,
  text,
  bottom = 80,
  dialMenu,
  tooltip = {
    open: false,
    message: ''
  },
  onClick
}: FloatingActionButtonProps) {
  const triggered = useReverseScrollTrigger(true, 500);

  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (dialMenu) {
      setOpen((prevState) => !prevState);
    } else if (typeof onClick === 'function') {
      onClick();
    }
  };

  useEffect(() => {
    if (!ref.current || !isMounted) return;

    ref.current.animate(
      [
        {
          width: triggered && !open ? '121px' : '52px'
        }
      ],
      { fill: 'forwards', duration: 100 }
    );
  }, [triggered, open, isMounted]);

  useEffect(() => {
    if (!iconRef.current) return;

    if (open) {
      iconRef.current.animate(
        [
          {
            transform: 'rotate(45deg)'
          }
        ],
        { fill: 'forwards', duration: 100 }
      );
    } else {
      iconRef.current.animate(
        [
          {
            transform: 'rotate(0deg)'
          }
        ],
        { fill: 'forwards', duration: 100 }
      );
    }
  }, [open]);

  useEffect(() => {
    if (!menuRef.current) return;

    if (open) {
      menuRef.current.animate(
        [
          {
            transform: 'translate(-50%, 0)'
          }
        ],
        { fill: 'forwards', duration: 200 }
      );
    } else {
      menuRef.current.animate(
        [
          {
            transform: 'translate(-50%, 20%)'
          }
        ],
        { fill: 'forwards', duration: 200 }
      );
    }
  }, [open]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <Backdrop open={open} onClose={handleClick}>
        {dialMenu && (
          <StyledDialMenu ref={menuRef} bottom={bottom}>
            {dialMenu}
          </StyledDialMenu>
        )}
        <Wrapper bottom={bottom}>
          <StyledFloatingActionButton onClick={handleClick}>
            <Icon
              name={iconName}
              color="uiWhite"
              customStyle={{
                minWidth: 'fit-content',
                transform: 'rotate(45deg)'
              }}
            />
          </StyledFloatingActionButton>
        </Wrapper>
      </Backdrop>
      <Wrapper bottom={bottom}>
        <Tooltip open={tooltip?.open} message={tooltip?.message} spaceBetween={10}>
          <StyledFloatingActionButton ref={ref} onClick={handleClick}>
            <Flexbox ref={iconRef}>
              <Icon
                name={iconName}
                color="uiWhite"
                customStyle={{
                  minWidth: 'fit-content'
                }}
              />
            </Flexbox>
            {triggered && !open && (
              <Typography
                variant="h3"
                weight="bold"
                color="uiWhite"
                customStyle={{
                  padding: '0 2px',
                  whiteSpace: 'nowrap'
                }}
              >
                {text}
              </Typography>
            )}
          </StyledFloatingActionButton>
        </Tooltip>
      </Wrapper>
    </>
  );
}

export default FloatingActionButton;
