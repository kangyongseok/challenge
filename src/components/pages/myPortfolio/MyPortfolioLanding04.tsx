import { useState } from 'react';

import { Box, Flexbox, Image, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { IOS_SAFE_AREA_TOP } from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

const tabData = [
  { tab: '비싸게 팔린', img: 'new_tab_img01', num: 1 },
  { tab: '빨리 팔린', img: 'new_tab_img02', num: 2 },
  { tab: '최고 인기', img: 'new_tab_img03', num: 3 }
];

function MyPortfolioLanding04() {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();
  const [activeTab, setActiveTab] = useState(1);
  const [imgName, setImgName] = useState('tab_img01');
  return (
    <Box
      customStyle={{
        textAlign: 'center',
        marginTop: `calc(52px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'})`
      }}
    >
      <Typography weight="bold" customStyle={{ color: primary.main }}>
        테마 별 실거래가
      </Typography>
      <Typography variant="h2" weight="bold">
        제일 비싸게 팔린 건 얼마지?
      </Typography>
      <Typography customStyle={{ marginTop: 12 }}>
        제일 비싸게, 빨리 팔린 매물 정보를 알려드려요
      </Typography>
      <Box customStyle={{ marginTop: 52, padding: '0 32px' }}>
        <TabArea alignment="center" justifyContent="space-between">
          {tabData.map(({ tab, img, num }) => (
            <Tab
              key={`tab-${tab}-${num}`}
              onClick={() => {
                setActiveTab(num);
                setImgName(img);
              }}
              active={num === activeTab}
            >
              <Typography customStyle={{ color: common.ui60 }}>#{tab}</Typography>
            </Tab>
          ))}
        </TabArea>
        <TabContents>
          <Image
            width="100%"
            height="auto"
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/${imgName}.jpg`}
            alt={imgName}
            disableAspectRatio
            disableSkeleton
          />
        </TabContents>
      </Box>
    </Box>
  );
}

const TabArea = styled(Flexbox)`
  width: 100%;
  height: 41px;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui90};
  border-radius: 50px;
  padding: 4px;
`;

const Tab = styled.div<{ active?: boolean }>`
  text-align: center;
  background: ${({
    theme: {
      palette: { common }
    },
    active
  }) => (active ? common.uiWhite : 'none')};
  padding: 6px 13px;
  border-radius: 36px;
  div {
    color: ${({
      theme: {
        palette: { primary, common }
      },
      active
    }) => (active ? primary.main : common.ui60)};
  }
`;

const TabContents = styled.div`
  margin-top: 12px;
  border-radius: 20px;
  overflow: hidden;
  filter: drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.08));
`;

export default MyPortfolioLanding04;
