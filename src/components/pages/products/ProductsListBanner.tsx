import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Flexbox, Image, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getImageResizePath } from '@utils/common';

import { productsFilterProgressDoneState, searchParamsStateFamily } from '@recoil/productsFilter';

function ProductsListBanner() {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const progressDone = useRecoilValue(productsFilterProgressDoneState);
  const [{ searchParams: baseSearchParams }] = useRecoilState(
    searchParamsStateFamily(`base-${atomParam}`)
  );

  const hasBaseSearchParams = !!Object.keys(baseSearchParams).length;

  const isLoading = !hasBaseSearchParams || !progressDone;

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const handleClick = () => {
    logEvent(attrKeys.productOrder.CLICK_CAMEL_GUIDE, {
      name: attrProperty.name.PRODUCT_LIST,
      title: attrProperty.title.OPERATOR
    });

    router.push('/guide/operator');
  };

  return (
    <Flexbox
      customStyle={{
        padding: '12px 20px',
        background: common.ui20,
        display: isLoading ? 'none' : 'flex',
        borderTop: '8px solid #EBEDF0'
      }}
      onClick={handleClick}
    >
      <Image
        src={getImageResizePath({
          imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/icon_post_box.png`,
          w: 20
        })}
        alt="카멜 구매대행 박스 이미지"
        width={20}
        height={20}
      />
      <Typography color="uiWhite" weight="medium">
        <span style={{ color: '#FFD911' }}>카멜 구매대행</span>으로 사기없이 거래하기
      </Typography>
      <Typography color="ui60" customStyle={{ textDecoration: 'underline', marginLeft: 'auto' }}>
        자세히보기
      </Typography>
    </Flexbox>
  );
}

export default ProductsListBanner;
