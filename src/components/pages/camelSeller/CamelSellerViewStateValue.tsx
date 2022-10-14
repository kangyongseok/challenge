import { Flexbox, Typography, useTheme } from 'mrcamel-ui';

interface ViewStateValueProps {
  type: 'color' | 'size' | 'condition';
  value: string;
  setValue: () => void;
}

const valueTitleParser = (value: string) => {
  switch (value) {
    case 'color':
      return '색상';
    case 'size':
      return '사이즈';
    default:
      return '컨디션';
  }
};

function CamelSellerViewStateValue({ type, value, setValue }: ViewStateValueProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  return (
    <>
      <Flexbox alignment="center">
        <Typography customStyle={{ color: common.ui60 }} weight="medium">
          {valueTitleParser(type)}
        </Typography>
        <Typography
          variant="body2"
          customStyle={{
            textDecoration: 'underline',
            color: common.ui60,
            marginLeft: 'auto'
          }}
          onClick={setValue}
        >
          다시 선택하기
        </Typography>
      </Flexbox>
      <Typography variant="h3" weight="medium">
        {value}
      </Typography>
    </>
  );
}

export default CamelSellerViewStateValue;
