import { useRouter } from 'next/router';
import { Button, Flexbox, Typography, useTheme } from 'mrcamel-ui';

function ProductDeletedCard() {
  const rotuer = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  return (
    <Flexbox
      direction="vertical"
      justifyContent="center"
      alignment="center"
      customStyle={{
        background: common.bg02,
        marginLeft: -20,
        width: 'calc(100% + 40px)',
        height: 160
      }}
    >
      <Typography weight="medium" variant="h4">
        삭제된 매물이에요
      </Typography>
      <Typography variant="small1" customStyle={{ marginTop: 4 }}>
        다른 매물을 검색해보세요.
      </Typography>
      <Button
        variant="solid"
        customStyle={{ marginTop: 20, background: common.uiWhite, color: common.ui20 }}
        onClick={() => rotuer.back()}
      >
        돌아가기
      </Button>
    </Flexbox>
  );
}

export default ProductDeletedCard;
