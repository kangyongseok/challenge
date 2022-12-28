import { useEffect } from 'react';
import type { MouseEvent } from 'react';

import { useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Alert, Box, Button, Flexbox, Image, Typography } from 'mrcamel-ui';
import dayjs from 'dayjs';

import { logEvent } from '@library/amplitude';

import { fetchAnnounce } from '@api/common';

import queryKeys from '@constants/queryKeys';
import { filterGenders } from '@constants/productsFilter';
import attrKeys from '@constants/attrKeys';

import { selectedSearchOptionsDefault, selectedSearchOptionsState } from '@recoil/searchHelper';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

let callLog = false;

function AnnounceDetail() {
  const router = useRouter();
  const { id } = router.query;

  const setSelectedSearchOptions = useSetRecoilState(selectedSearchOptionsState);

  const { data: accessUser } = useQueryAccessUser();
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
    <Box component="section">
      <Alert
        round="16"
        customStyle={{
          padding: '12px 24px',
          margin: '8px 20px 24px'
        }}
      >
        <Typography variant="h3" weight="medium">
          {announce.title}
        </Typography>
        <Typography
          variant="body2"
          customStyle={{
            textAlign: 'right'
          }}
        >
          {dayjs(announce.datePosted).format('YYYY.M.D')}
        </Typography>
      </Alert>
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
                    __html: announceDetail.content.replace(
                      /{userName}/gi,
                      accessUser?.userName ?? ''
                    )
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
                    __html: announceDetail.subContent.replace(
                      /{userName}/gi,
                      accessUser?.userName ?? ''
                    )
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
                        src={src}
                        alt="Announce Detail Img"
                        disableAspectRatio
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
