import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Flexbox, Image, Typography, useTheme } from 'mrcamel-ui';

import { fetchProductLegit } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';

import { commaNumber } from '@utils/common';

function LegitResultIntro() {
  const router = useRouter();
  const { id } = router.query;
  const splitIds = String(id).split('-');
  const productId = Number(splitIds[splitIds.length - 1] || 0);

  const {
    data: {
      cntTargetOpinions = 0,
      productResult: {
        brand = { name: '', nameEng: '' },
        category = { name: '' },
        postType = 0
      } = {}
    } = {}
  } = useQuery(queryKeys.productLegits.legit(productId), () => fetchProductLegit(productId), {
    enabled: !!id
  });

  const {
    theme: {
      palette: { secondary }
    }
  } = useTheme();

  if (postType !== 2) return null;

  return (
    <Flexbox
      component="section"
      direction="vertical"
      alignment="center"
      customStyle={{ marginTop: -28 }}
    >
      <Image
        width={96}
        height={95}
        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/brands/transparent/${brand.nameEng
          .toLowerCase()
          .replace(/ /g, '')}.png`}
        alt="Brand Logo Img"
        disableAspectRatio
      />
      <Typography
        variant="h3"
        weight="medium"
        customStyle={{ textAlign: 'center', '& strong': { color: secondary.blue.main } }}
      >
        {commaNumber(cntTargetOpinions)}명의 감정 전문가들이
        <br />
        {`${brand.name} ${category.name.replace(/\(P\)/g, '')}을(를)`}
        <br />
        <strong>감정중</strong>입니다.
      </Typography>
    </Flexbox>
  );
}

export default LegitResultIntro;
