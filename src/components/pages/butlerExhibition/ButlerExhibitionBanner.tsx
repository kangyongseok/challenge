import { useRouter } from 'next/router';
import { Box, Image } from '@mrcamelhub/camel-ui';

function ButlerExhibitionBanner() {
  const router = useRouter();

  return (
    <Box
      component="section"
      onClick={() => router.push('/butler/demo')}
      customStyle={{
        marginTop: 84
      }}
    >
      <Image
        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/butler/butler_banner.png`}
        alt="Butler Banner Img"
        disableAspectRatio
      />
    </Box>
  );
}

export default ButlerExhibitionBanner;
