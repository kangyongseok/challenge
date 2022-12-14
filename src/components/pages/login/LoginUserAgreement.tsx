import Link from 'next/link';
import { Flexbox, Typography, useTheme } from 'mrcamel-ui';

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
        <Link href="/terms/privacy">
          <a>개인정보보호정책</a>
        </Link>
        &nbsp;및&nbsp;
        <Link href="/terms/serviceTerms">
          <a>서비스 약관</a>
        </Link>
        에 동의하는 것을 의미합니다.
      </Typography>
    </Flexbox>
  );
}

export default LoginUserAgreement;
