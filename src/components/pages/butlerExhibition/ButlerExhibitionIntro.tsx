import { Box, Image, Typography } from '@mrcamelhub/camel-ui';

function ButlerExhibitionIntro() {
  return (
    <Box
      component="section"
      customStyle={{
        padding: '46px 20px 53px',
        backgroundImage: `url(https://${process.env.IMAGE_DOMAIN}/assets/images/butler/butler-crinkled-paper-texture.png)`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Image
        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/butler/intro-typo.png`}
        alt="Intro Typo Img"
        disableAspectRatio
      />
      <Typography
        variant="h4"
        customStyle={{
          marginTop: 10,
          '& > span': {
            fontWeight: 700
          }
        }}
      >
        구하기 힘든 상태좋은 샤넬 가브리엘 백팩 <br />
        <span>카멜이 다 구매했습니다.</span>
      </Typography>
      <Image
        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/butler/best-item-in-the-world.png`}
        alt="Best Item Img"
        disableAspectRatio
        customStyle={{
          marginTop: 38
        }}
      />
    </Box>
  );
}

export default ButlerExhibitionIntro;
