import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { Button, Flexbox, Icon, Image } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { PageHead } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import { getImageResizePath } from '@utils/common';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function Butler() {
  const router = useRouter();

  const [result, setResult] = useState(false);

  const { data: accessUser } = useQueryAccessUser();

  useEffect(() => {
    logEvent('VIEW_EVENT_DETAIL', {
      name: 'EVENT_DETAIL',
      title: '2304_CAMEL_BUTLER',
      source: 'PUSH'
    });
  }, []);

  return (
    <>
      <PageHead
        title="원하는 명품을 카멜이 대신 찾아드립니다 | Camel Butler"
        description="Camel Butler 서비스는, 원하는 모델과 예산을 알려주시면 카멜이 대신 사서 대신 검수 후 보내드리는 서비스 입니다"
        ogTitle="원하는 명품을 카멜이 대신 찾아드립니다 | Camel Butler"
        ogDescription="Camel Butler 서비스는, 원하는 모델과 예산을 알려주시면 카멜이 대신 사서 대신 검수 후 보내드리는 서비스 입니다"
        ogImage={`https://${process.env.IMAGE_DOMAIN}/assets/images/events/butler_img01.png`}
      />
      <Flexbox
        direction="vertical"
        alignment="center"
        justifyContent="center"
        gap={120}
        customStyle={{
          background: '#111214',
          position: 'relative',
          paddingTop: 20,
          minHeight: '100vh'
        }}
      >
        <CloseButton
          name="CloseOutlined"
          onClick={() => {
            router.replace('/');
          }}
        />
        {result ? (
          <Image
            src={getImageResizePath({
              imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/events/butler_img04.png`,
              h: 300
            })}
            alt="Camel Butler"
            disableAspectRatio
            width="100%"
            customStyle={{ flex: 1 }}
          />
        ) : (
          <>
            <Image
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/events/butler_img01.png`,
                h: 560
              })}
              alt="Camel Butler"
              disableAspectRatio
              width="100%"
            />
            <Image
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/events/butler_img02.png`,
                h: 512
              })}
              alt="what is Butler?"
              disableAspectRatio
              width="100%"
            />
            <Image
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/events/butler_img03.png`,
                h: 798
              })}
              alt="No fees!"
              disableAspectRatio
              width="100%"
            />
          </>
        )}
        <Flexbox
          customStyle={{ padding: '0 20px 50px 20px', width: '100%', marginTop: 'auto' }}
          alignment="center"
          justifyContent="center"
        >
          <Button
            fullWidth
            size="xlarge"
            customStyle={{ background: '#3D57FF' }}
            variant="solid"
            onClick={() => {
              if (result) {
                router.replace('/');
              } else {
                logEvent('CLICK_EVENT_DETAIL', {
                  name: 'BUTLER',
                  title: '2304_CAMEL_BUTLER',
                  username: accessUser?.userName,
                  phone: accessUser?.phone
                });
                setResult(true);
              }
            }}
          >
            {result ? '확인' : '버틀러 신청하기'}
          </Button>
        </Flexbox>
      </Flexbox>
    </>
  );
}

const CloseButton = styled(Icon)`
  position: absolute;
  top: 20px;
  left: 20px;
  color: white;
  z-index: 1;
`;

export default Butler;
