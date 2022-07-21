import { CustomStyle, Fab, Icon } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import { Wrapper } from './TopButton.styles';

interface TopButtonProps {
  show?: boolean;
  customStyle?: CustomStyle;
  name?: string;
}

function TopButton({ show = false, customStyle, name = '' }: TopButtonProps) {
  return (
    <Wrapper show={show} css={customStyle}>
      <Fab
        onClick={() => {
          logEvent('CLICK_TOP', {
            name
          });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        customStyle={{
          width: 44,
          height: 44
        }}
      >
        <Icon name="CaretUpOutlined" size="medium" />
      </Fab>
    </Wrapper>
  );
}

export default TopButton;
