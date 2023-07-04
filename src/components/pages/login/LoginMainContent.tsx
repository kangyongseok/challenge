import { Flexbox, Icon, Typography } from '@mrcamelhub/camel-ui';

import type { LoginMode } from '@typings/common';

interface LoginMainContentProps {
  mode?: LoginMode;
}

function LoginMainContent({ mode = 'normal' }: LoginMainContentProps) {
  return (
    <Flexbox
      component="section"
      direction="vertical"
      justifyContent="center"
      alignment="center"
      customStyle={{ flex: 1, padding: '20px 0' }}
    >
      <Flexbox gap={10} alignment="center">
        <Icon name="Logo_45_45" width={36} height={36} />
        <Icon name="LogoText_96_20" width={124} height={36} />
      </Flexbox>
      {mode === 'nonMemberInMyPage' && (
        <Typography
          variant="h4"
          textAlign="center"
          customStyle={{
            marginTop: 20
          }}
        >
          전국 중고명품을 한 번에 모아보고,
          <br />
          원하는 매물만 빠르게 거래해보세요.
        </Typography>
      )}
    </Flexbox>
  );
}

export default LoginMainContent;
