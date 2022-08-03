import { MouseEvent, useEffect } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, CtaButton, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import type { AnnounceDetail as AnnounceDetailType } from '@dto/user';

import { logEvent } from '@library/amplitude';

import { filterGenders } from '@constants/productsFilter';
import attrKeys from '@constants/attrKeys';

import { selectedSearchOptionsDefault, selectedSearchOptionsState } from '@recoil/searchHelper';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface AnnounceDetailProps {
  announceDetail: AnnounceDetailType;
}

let callLog = false;

function AnnounceDetail({ announceDetail }: AnnounceDetailProps) {
  const router = useRouter();
  const { data: accessUser } = useQueryAccessUser();
  const { data: { info: { value: { gender = '' } = {} } = {} } = {} } = useQueryUserInfo();
  const setSelectedSearchOptions = useSetRecoilState(selectedSearchOptionsState);

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
      if (pathname.includes('/searchHelper')) {
        const genderName = gender === 'F' ? 'female' : 'male';

        setSelectedSearchOptions((currVal) => ({
          ...currVal,
          pathname: router.asPath,
          gender: gender
            ? {
                id: filterGenders[genderName as keyof typeof filterGenders].id,
                name: genderName
              }
            : selectedSearchOptionsDefault.gender
        }));
      }

      router.push(pathname);
    }
  };

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
