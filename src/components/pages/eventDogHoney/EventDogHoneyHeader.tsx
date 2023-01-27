import { useCallback } from 'react';

import { useSetRecoilState } from 'recoil';
import { Box, Icon, Typography } from 'mrcamel-ui';

import { Header } from '@components/UI/molecules';

import { executedShareURl } from '@utils/common';

import { dialogState } from '@recoil/common';
import useQueryContents from '@hooks/useQueryContents';

function EventDogHoneyHeader() {
  const setDialogState = useSetRecoilState(dialogState);

  const { data: { title, description, url } = {} } = useQueryContents();

  const handleClickShare = useCallback(() => {
    const shareData = {
      title: title ? `${title} | 카멜 최저가 가격비교` : '카멜 최저가 가격비교',
      description: description || '',
      image: `https://${process.env.IMAGE_DOMAIN}/assets/images/home/main-banner-event01.png`,
      url: `${
        typeof window !== 'undefined' ? window.location.origin : 'https://mrcamel.co.kr'
      }${url}`
    };

    if (
      !executedShareURl({
        url: shareData.url,
        title: shareData.title,
        text: shareData.description
      })
    ) {
      setDialogState({ type: 'SNSShare', shareData });
    }
  }, [description, setDialogState, title, url]);

  return (
    <Header
      isFixed={false}
      hideHeart
      rightIcon={
        <Box onClick={handleClickShare} customStyle={{ padding: '16px 8px' }}>
          <Icon name="ShareOutlined" />
        </Box>
      }
    >
      <Typography variant="h3" weight="bold" customStyle={{ textAlign: 'center' }}>
        카멜 실시간 개꿀매🐶🍯
      </Typography>
    </Header>
  );
}

export default EventDogHoneyHeader;
