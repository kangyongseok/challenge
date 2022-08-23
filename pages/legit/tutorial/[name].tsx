import { useEffect } from 'react';

import { useRouter } from 'next/router';
import { useTheme } from 'mrcamel-ui';

import GeneralTemplate from '@components/templates/GeneralTemplate';

import ChannelTalk from '@library/channelTalk';

function LegitTutorial() {
  const router = useRouter();
  const { name } = router.query;
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  useEffect(() => {
    ChannelTalk.hideChannelButton();
  }, []);

  return (
    <GeneralTemplate
      disablePadding
      hideAppDownloadBanner
      customStyle={{
        backgroundColor: common.black
      }}
    >
      {name === 'gucciShoes' && (
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/Szmmy0auNj4"
          title="카멜 정품감정 | 구찌 라이톤 띠로고 스니커즈"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
      {name === 'gucci' && (
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/pmc5joa2SJY"
          title="카멜 정품감정 | 구찌 마틀라세"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
      {name === 'dior' && (
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/Dj0t8emZLXw"
          title="카멜 정품감정 | 디올 오블리크 새들백"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </GeneralTemplate>
  );
}

export default LegitTutorial;
