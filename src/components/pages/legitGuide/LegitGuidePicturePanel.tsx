import { Flexbox, Typography, useTheme } from 'mrcamel-ui';

function LegitGuidePicturePanel() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  return (
    <Flexbox
      component="section"
      direction="vertical"
      alignment="center"
      customStyle={{ marginTop: 51, padding: '0 40px' }}
    >
      <Typography variant="h3" weight="bold">
        판매자 사진 그대로 감정신청 할 수 있어요!
      </Typography>
      <Typography customStyle={{ marginTop: 8, textAlign: 'center', color: common.ui60 }}>
        궁금한 매물의 상세화면에서 바로 신청 가능!
        <br />
        구매가 고민 될 때 바로 신청해보세요.
      </Typography>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 0,
          marginTop: 30,
          paddingBottom: 'calc(176.21145374449338% + 41px)'
        }}
      >
        {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
        <iframe
          src="https://demo.arcade.software/N4WZXK3ySdIOK6c6eX7Y?embed"
          frameBorder="0"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        />
      </div>
      <Typography
        variant="h3"
        weight="bold"
        customStyle={{ margin: '53px 0 56px', textAlign: 'center' }}
      >
        감정신청이 가장 많은 “구찌지갑”
        <br />
        사진감정 신청해 볼까요?
      </Typography>
    </Flexbox>
  );
}

export default LegitGuidePicturePanel;
