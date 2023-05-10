import { Flexbox, Icon } from '@mrcamelhub/camel-ui';

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
    </Flexbox>
  );
}

export default LoginMainContent;
