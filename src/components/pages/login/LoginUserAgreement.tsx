import Link from 'next/link';
import { Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';

function LoginUserAgreement() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  return (
    <Flexbox
      component="section"
      alignment="center"
      justifyContent="center"
      customStyle={{
        margin: '0 auto 20px',
        textAlign: 'center',
        '& a': {
          textDecoration: 'underline'
        }
      }}
    >
      <Typography variant="small2" weight="regular" customStyle={{ color: common.ui60 }}>
        가입/로그인은&nbsp;
        <Link href="/terms/privacy">개인정보보호정책</Link>
        &nbsp;및&nbsp;
        <Link href="/terms/serviceTerms">서비스 약관</Link>에 동의하는 것을 의미합니다.
      </Typography>
    </Flexbox>
  );
}

export default LoginUserAgreement;
