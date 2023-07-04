import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import { Flexbox, Icon } from '@mrcamelhub/camel-ui';

import Header from '@components/UI/molecules/Header';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { AnnounceDetail, AnnouncePageHead } from '@components/pages/announce';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchAnnounce } from '@api/common';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';
import getAccessUserByCookies from '@utils/common/getAccessUserByCookies';

function Announce() {
  const router = useRouter();

  const handleClickClose = () => {
    logEvent(attrKeys.header.CLICK_CLOSE, {
      name: attrProperty.productName.ANNOUNCE_DETAIL
    });
    router.back();
  };

  return (
    <>
      <AnnouncePageHead />
      <GeneralTemplate
        disablePadding
        hideAppDownloadBanner
        header={
          <Header
            rightIcon={
              <Flexbox
                justifyContent="center"
                alignment="center"
                onClick={handleClickClose}
                customStyle={{
                  padding: '16px 8px',
                  maxHeight: 56,
                  cursor: 'pointer'
                }}
              >
                <Icon name="CloseOutlined" />
              </Flexbox>
            }
          />
        }
      >
        <AnnounceDetail />
      </GeneralTemplate>
    </>
  );
}

export async function getServerSideProps({ req, query }: GetServerSidePropsContext) {
  try {
    const queryClient = new QueryClient();

    Initializer.initAccessTokenByCookies(getCookies({ req }));

    await queryClient.fetchQuery(queryKeys.commons.announce(Number(query.id)), () =>
      fetchAnnounce(Number(query.id))
    );

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        accessUser: getAccessUserByCookies(getCookies({ req }))
      }
    };
  } catch {
    return {
      notFound: true
    };
  }
}

export default Announce;
