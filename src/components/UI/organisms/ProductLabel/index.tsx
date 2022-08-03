import { CustomLabel, LabelDivider } from './ProductLabel.styles';

interface ProductLabelProps {
  showDivider: boolean;
  text: string;
  isSingle: boolean;
}

function ProductLabel({ showDivider, text, isSingle }: ProductLabelProps) {
  return (
    <>
      {showDivider && <LabelDivider />}
      <CustomLabel text={text} size="xsmall" variant="ghost" isSingle={isSingle} />
    </>
  );
}

export default ProductLabel;
