import { useCallback, useState } from 'react';

import { Box, Icon, Typography } from '@mrcamelhub/camel-ui';

import { SNSShareDialog } from '@components/UI/organisms';
import { Header } from '@components/UI/molecules';

import { executedShareURl } from '@utils/common';

import type { ShareData } from '@typings/common';
import useQueryContents from '@hooks/useQueryContents';

function EventDogHoneyHeader() {
  const [open, setOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareData>();

  const { data: { title, description, url } = {} } = useQueryContents();

  const handleClickShare = useCallback(() => {
    const newShareData = {
      title: title ? `${title} | 카멜 최저가 가격비교` : '카멜 최저가 가격비교',
      description: description || '',
      image: `https://${process.env.IMAGE_DOMAIN}/assets/images/home/main-banner-event01.png`,
      url: `${
        typeof window !== 'undefined' ? window.location.origin : 'https://mrcamel.co.kr'
      }${url}`
    };

    if (
      !executedShareURl({
        url: newShareData.url,
        title: newShareData.title,
        text: newShareData.description
      })
    ) {
      setOpen(true);
      setShareData(newShareData);
    }
  }, [description, title, url]);

  return (
    <>
      <Header
        isFixed={false}
        hideHeart
        rightIcon={
          <Box onClick={handleClickShare} customStyle={{ padding: '16px 8px' }}>
            <Icon name="ShareOutlined" />
          </Box>
        }
      >
        <Typography variant="h3" weight="bold" textAlign="center">
          카멜 실시간 개꿀매🐶🍯
        </Typography>
      </Header>
      <SNSShareDialog open={open} onClose={() => setOpen(false)} shareData={shareData} />
    </>
  );
}

export default EventDogHoneyHeader;
