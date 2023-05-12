import { useMemo } from 'react';

import { PopupButton } from '@typeform/embed-react';
import { Flexbox, Image, Typography, useTheme } from '@mrcamelhub/camel-ui';

function LegitApplyBanner() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const randomBrand = useMemo(() => {
    const targetBrnads = [
      { name: '루이비통', nameEng: 'louisvuitton' },
      { name: '디올', nameEng: 'dior' },
      { name: '몽클레어', nameEng: 'moncler' },
      { name: '파라점퍼스', nameEng: 'para jumpers' },
      { name: '스톤아일랜드', nameEng: 'stoneisland' }
    ];
    const randomIndex = Math.floor(Math.random() * 4);

    return targetBrnads[randomIndex];
  }, []);

  return (
    <PopupButton id="rmVuaCLl" as="section" style={{ width: '100%', cursor: 'pointer' }}>
      <Flexbox
        justifyContent="space-between"
        customStyle={{ padding: '0 20px', backgroundColor: common.uiBlack }}
      >
        <Flexbox
          direction="vertical"
          justifyContent="center"
          gap={4}
          customStyle={{ padding: '20px 0' }}
        >
          <Typography
            variant="body1"
            weight="bold"
            color="cmnW"
            customStyle={{ whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}
          >
            {`${randomBrand.name} 잘 아신다면?`}
          </Typography>
          <Typography
            variant="body2"
            color="cmnW"
            customStyle={{ whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}
          >
            사진 감정사가 되고 혜택 받아가세요!
          </Typography>
        </Flexbox>
        <Image
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/brands/black/${randomBrand.nameEng
            .toLowerCase()
            .replace(/\s/g, '')}.jpg`}
          alt="brand-image"
          width={80}
          height={80}
          customStyle={{ mixBlendMode: 'screen' }}
        />
      </Flexbox>
    </PopupButton>
  );
}

export default LegitApplyBanner;
