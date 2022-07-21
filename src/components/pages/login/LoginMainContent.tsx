import { Flexbox, Icon, Typography } from 'mrcamel-ui';

function LoginMainContent() {
  return (
    <Flexbox
      component="section"
      direction="vertical"
      justifyContent="center"
      alignment="center"
      customStyle={{ flex: 1 }}
    >
      <Flexbox gap={10} alignment="center">
        <Icon name="Logo_45_45" width={36} height={36} />
        <Icon name="LogoText_96_20" width={124} height={36} />
      </Flexbox>
      <Flexbox
        gap={20}
        direction="vertical"
        alignment="center"
        customStyle={{ marginTop: 32, textAlign: 'center' }}
      >
        <Typography>
          <strong>꿀매물과 가격변동 알림</strong>부터
          <br />
          <strong>내 주변, 내 사이즈 매물만 보기</strong>까지!
        </Typography>
        <Typography variant="h4">로그인하고 득템하세요 🙌</Typography>
      </Flexbox>
    </Flexbox>
  );
}

export default LoginMainContent;
