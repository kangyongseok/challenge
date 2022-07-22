import { useRecoilState } from 'recoil';
import { Toast, Typography, useTheme } from 'mrcamel-ui';

import { productsKeywordAutoSavedToast } from '@recoil/productsKeyword';

function ProductsKeywordAutoSavedToast() {
  const {
    theme: { palette }
  } = useTheme();
  const [open, setProductsKeywordAutoSavedToast] = useRecoilState(productsKeywordAutoSavedToast);

  return (
    <Toast open={open} onClose={() => setProductsKeywordAutoSavedToast(false)}>
      <Typography
        variant="body1"
        weight="medium"
        customStyle={{
          color: palette.common.white
        }}
      >
        홈에서 바로 볼 수 있게
        <br />이 검색 목록을 저장했어요!
      </Typography>
    </Toast>
  );
}

export default ProductsKeywordAutoSavedToast;
