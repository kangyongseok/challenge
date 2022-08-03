import { useRouter } from 'next/router';

import Image from '@components/UI/atoms/Image';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

function MyPortfolioCommonBanner({ name }: { name: string }) {
  const router = useRouter();
  return (
    <Image
      disableAspectRatio
      src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/myportfolio_banner.jpg`}
      alt="나이키 운동화"
      onClick={() => {
        logEvent(attrKeys.myPortfolio.CLICK_MYPORTFOLIO_BANNER, {
          name
        });
        router.push('/myPortfolio');
      }}
    />
  );
}

export default MyPortfolioCommonBanner;
