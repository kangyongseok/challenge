import { Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';

function ProductOrderLabel({ setOpen }: { setOpen: (value: boolean) => void }) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  return (
    <Flexbox
      alignment="center"
      customStyle={{ background: common.ui20, height: 40, padding: '0 20px', marginTop: 6 }}
      gap={6}
    >
      <Icon name="BangCircleFilled" color="uiWhite" size="medium" />
      <Typography variant="body2" color="uiWhite">
        구매대행 요청이 대해 알아보세요!
      </Typography>
      <Typography
        variant="body2"
        color="uiWhite"
        customStyle={{ marginLeft: 'auto', textDecoration: 'underline' }}
        onClick={() => setOpen(true)}
      >
        자세히보기
      </Typography>
    </Flexbox>
  );
}

export default ProductOrderLabel;
