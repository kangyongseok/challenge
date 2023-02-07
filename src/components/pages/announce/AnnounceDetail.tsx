import { useEffect } from 'react';
import type { MouseEvent } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Image, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';

import { logEvent } from '@library/amplitude';

import { fetchAnnounce } from '@api/common';

import queryKeys from '@constants/queryKeys';
import { filterGenders } from '@constants/productsFilter';
import attrKeys from '@constants/attrKeys';

import { selectedSearchOptionsDefault, selectedSearchOptionsState } from '@recoil/searchHelper';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';

let callLog = false;

function AnnounceDetail() {
  const {
    theme: { palette }
  } = useTheme();
  const router = useRouter();
  const { id } = router.query;

  const setSelectedSearchOptions = useSetRecoilState(selectedSearchOptionsState);

  const { userNickName } = useQueryMyUserInfo();
  const { data: { info: { value: { gender = '' } = {} } = {} } = {} } = useQueryUserInfo();

  const { data: announce } = useQuery(
    queryKeys.commons.announce(Number(id)),
    () => fetchAnnounce(Number(id)),
    {
      enabled: !!id
    }
  );

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
                id: filterGenders[genderName].id,
                name: genderName
              }
            : selectedSearchOptionsDefault.gender
        }));
      }

      router.push(pathname);
    }
  };

  if (!announce) return null;

  return (
    <Box component="section" customStyle={{ marginTop: 20 }}>
      <Box customStyle={{ textAlign: 'center', marginBottom: 24 }}>
        <Typography variant="h3" weight="bold" customStyle={{ marginBottom: 8 }}>
          {announce.title}
        </Typography>
        <Typography variant="small1" customStyle={{ color: palette.common.ui60 }}>
          {dayjs(announce.datePosted).format('YYYY.MM.DD')}
        </Typography>
      </Box>
      <Flexbox gap={32} direction="vertical">
        {announce.announceDetails.map((announceDetail) => {
          if (announceDetail.type === 1) {
            return (
              <Box
                key={`announce-detail-${announceDetail.id}`}
                customStyle={{
                  padding: '0 20px 16px'
                }}
              >
                <Button
                  data-pathname={announceDetail.parameter}
                  onClick={handleClickCtaButton}
                  brandColor="primary"
                  variant="solid"
                  size="large"
                  fullWidth
                >
                  {announceDetail.content}
                </Button>
              </Box>
            );
          }
          return (
            <Box key={`announce-detail-${announceDetail.id}`}>
              <Box
                customStyle={{
                  padding: '0 20px 8px'
                }}
              >
                <Typography
                  variant="h4"
                  weight="bold"
                  dangerouslySetInnerHTML={{
                    __html: announceDetail.content.replace(/{userName}/gi, userNickName ?? '')
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
                    __html: announceDetail.subContent.replace(/{userName}/gi, userNickName ?? '')
                  }}
                />
              </Box>
              {announceDetail.images
                .split('|')
                .map(
                  (src) =>
                    src && (
                      <Image
                        key={`announce-detail-image-${src}`}
                        ratio="5:6"
                        src={src}
                        alt="Announce Detail Img"
                      />
                    )
                )}
            </Box>
          );
        })}
      </Flexbox>
    </Box>
  );
}

export default AnnounceDetail;
