import { useState } from 'react';

import { useRouter } from 'next/router';
import { BottomSheet, Box, Flexbox, Typography } from 'mrcamel-ui';

import { Header } from '@components/UI/molecules';
import { PageHead, WebpImg } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';

import { showAppDownloadBannerState } from '@recoil/common';

const BASE_URL = `https://${process.env.IMAGE_DOMAIN}/assets/images`;

const userList = [
  '영** 010-8096-5***',
  '.** 010-9482-8***',
  '구** 010-4844-5***',
  '김** 010-7293-7***',
  'DK** 010-9245-0***',
  '콩** 010-5823-3***',
  '석** 010-7919-7***',
  '정** 010-2227-6***',
  '김** 010-4558-5***',
  '박** 010-6456-1***',
  '이** 010-7775-7***',
  '이** 010-7775-7***',
  'Ja** 010-5051-0***',
  '정** 010-5249-8***',
  '원** 010-8344-8***',
  '김** 010-4628-4***',
  '동** 010-5707-2***',
  'yg** 010-4745-7***',
  '이** 010-6395-2***',
  '박** 010-8649-6***',
  '준** 010-3864-1***',
  '유** 010-9913-3***',
  '대** 010-3316-2***',
  '김** 010-3501-4***',
  '김** 010-3930-7***',
  '백** 010-2689-6***',
  '김** 010-5922-0***',
  '김** 010-5315-4***',
  '신** 010-7585-8***',
  '장** 010-4070-4***',
  '김** 010-6328-8***',
  '도** 010-4492-5***',
  '** 010-5282-2***',
  '조** 010-3778-6***',
  '조** 010-7210-4***',
  '김** 010-2420-0***',
  '이** 010-4210-7***',
  '지** 010-3746-9***',
  'ㅇ** 010-9109-8***',
  'S** 010-2108-0***',
  '** 010-8258-9***',
  '** 010-2488-2***',
  '오** 010-2572-7***',
  '아** 010-3317-2***',
  '배** 010-8304-7***',
  '송** 010-5738-5***',
  '정** 010-9380-8***',
  '김** 010-8107-9***',
  '한** 010-6554-9***',
  '변** 010-6594-1***',
  '정** 010-9298-7***',
  '이** 010-9697-9***',
  '이** 010-5618-3***',
  '신** 010-4188-7***',
  '한** 010-7125-5***',
  '병** 010-7655-9***',
  '기** 010-8502-7***',
  '석** 010-9801-2***',
  '홍** 010-3228-2***',
  '20** 010-2450-3***',
  '손** 010-7519-4***',
  '유** 010-9445-4***',
  '준** 010-7139-5***',
  '정** 010-7238-9***',
  '승** 010-2972-3***',
  '.** 010-7160-3***',
  '정** 010-8600-9***',
  'J.** 010-4736-7***',
  '방** 010-3351-8***',
  '정** 010-8770-9***',
  '김** 010-4520-6***',
  '이** 010-4821-6***',
  '** 010-4117-1***',
  '명** 010-4310-8***',
  '시** 010-6634-8***',
  '문** 010-9300-6***',
  '장** 010-5659-1***',
  '인** 010-5623-1***',
  '김** 010-8780-3***',
  '재** 010-4394-5***',
  '김** 010-6516-5***',
  '** 010-9882-9***',
  '박** 010-8535-8***',
  ':)** 010-7788-2***',
  '이** 010-5898-4***',
  '백** 010-4089-5***',
  '김** 010-4232-3***',
  '니** 010-9996-8***',
  '최** 010-5092-5***',
  '서** 010-6565-7***',
  '** 010-8234-2***',
  '유** 010-2086-4***',
  '26** 010-9806-8***',
  '태** 010-7176-5***',
  '김** 010-2395-0***',
  '규** 010-9558-5***',
  '김** 010-3993-9***',
  '이** 010-2257-9***',
  '이** 010-6550-5***',
  '김* 010-4237-7***'
];

function CamelSellerEventResult() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleClickBack = () => {
    router.back();
  };

  const handleClickWinUserList = () => {
    setOpen(true);
  };

  return (
    <>
      <PageHead
        title="🐪 카멜에서 명품을 판매해보세요."
        description="판매하기 이벤트 당첨자 발표"
        ogTitle="🐪 카멜에서 명품을 판매해보세요."
        ogDescription="판매하기 이벤트 당첨자 발표"
        ogImage={`https://${process.env.IMAGE_DOMAIN}/assets/images/seo/camel-seller.jpg`}
      />
      <GeneralTemplate
        disablePadding
        header={
          <Header
            hideTitle
            hideHeart
            showRight={false}
            isTransparent
            onClickLeft={handleClickBack}
          />
        }
      >
        <Box
          customStyle={{
            position: 'absolute',
            top: `calc(${showAppDownloadBannerState ? APP_DOWNLOAD_BANNER_HEIGHT : 0}px)`
          }}
        >
          <Box customStyle={{ position: 'relative' }}>
            <WebpImg
              src={`${BASE_URL}/events/seller_event_result01`}
              alt="판매하기 이벤트 당첨자 발표"
              style={{ width: '100%' }}
              index={0}
            />
          </Box>
          <Box customStyle={{ position: 'relative' }} onClick={handleClickWinUserList}>
            <WebpImg
              src={`${BASE_URL}/events/seller_event_result02`}
              alt="판매하기 이벤트 당첨자 발표 당첨자 확인하기"
              style={{ width: '100%' }}
              index={1}
            />
          </Box>
        </Box>
        <BottomSheet fullScreen open={open} onClose={() => setOpen(false)}>
          <Box customStyle={{ padding: 20 }}>
            <Typography variant="h2" weight="bold">
              문화상품권 당첨자
            </Typography>
            <Typography customStyle={{ marginTop: 4 }}>3월 10일 일괄 지급됩니다.</Typography>
            <Flexbox
              customStyle={{
                flexWrap: 'wrap',
                borderTop: '1px solid #DCDDE0',
                marginTop: 32,
                paddingTop: 32
              }}
              gap={12}
            >
              {userList.map((user) => (
                <Typography
                  variant="body1"
                  weight="medium"
                  customStyle={{ width: '48%' }}
                  key={user}
                >
                  {user}
                </Typography>
              ))}
            </Flexbox>
          </Box>
        </BottomSheet>
      </GeneralTemplate>
    </>
  );
}

export default CamelSellerEventResult;
