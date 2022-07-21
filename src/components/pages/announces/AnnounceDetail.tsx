import { MouseEvent, useEffect } from 'react';

import { useRouter } from 'next/router';
import { Box, CtaButton, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import type { AnnounceDetail as AnnounceDetailType } from '@dto/user';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface AnnounceDetailProps {
  announceDetail: AnnounceDetailType;
}

let callLog = false;

function AnnounceDetail({ announceDetail }: AnnounceDetailProps) {
  const router = useRouter();

  useEffect(() => {
    if (!callLog) {
      const splitPathNames = window.location.pathname.split('/');
      const att = splitPathNames[splitPathNames.length - 1];

      if (att) {
        logEvent(attrKeys.userInput.VIEW_ANNOUNCE_DETAIL, {
          att
        });
      }
      callLog = true;
    }
    return () => {
      if (callLog) callLog = false;
    };
  }, []);

  const handleClickCtaButton = (event: MouseEvent<HTMLButtonElement>) => {
    const pathname = event.currentTarget.getAttribute('data-pathname');

    if (pathname) {
      router.push(pathname);
    }
  };

  const { data: accessUser } = useQueryAccessUser();

  if (announceDetail.type === 1) {
    return (
      <Box
        customStyle={{
          padding: '0 20px 16px'
        }}
      >
        <CtaButton
          key={`announce-detail-${announceDetail.id}`}
          data-pathname={announceDetail.parameter}
          onClick={handleClickCtaButton}
          brandColor="primary"
          variant="contained"
          size="large"
          fullWidth
        >
          {announceDetail.content}
        </CtaButton>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        customStyle={{
          padding: '0 20px 8px'
        }}
      >
        <Typography
          variant="h4"
          weight="bold"
          dangerouslySetInnerHTML={{
            __html: announceDetail.content.replace(/{userName}/gi, accessUser?.userName ?? '')
          }}
        />
      </Box>
      <Box
        customStyle={{
          padding: '0 20px 20px'
        }}
      >
        <Typography
          customStyle={{
            lineHeight: '18px',
            letterSpacing: '-0.2px'
          }}
          dangerouslySetInnerHTML={{
            __html: announceDetail.subContent.replace(/{userName}/gi, accessUser?.userName ?? '')
          }}
        />
      </Box>
      {announceDetail.images
        .split('|')
        .map(
          (src) =>
            src && (
              <Image key={`announce-detail-image-${src}`} src={src} alt="Announce Detail Img" />
            )
        )}
    </Box>
  );
}

const Image = styled.img`
  width: 100%;
`;

export default AnnounceDetail;
