import { QueryClient, dehydrate } from 'react-query';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { Flexbox, Icon } from 'mrcamel-ui';

import Header from '@components/UI/molecules/Header';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { AnnounceDetail, AnnouncePageHead } from '@components/pages/announce';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchAnnounce } from '@api/common';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

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
        header={
          <Header
            rightIcon={
              <Flexbox
                justifyContent="center"
                alignment="center"
                onClick={handleClickClose}
                customStyle={{
                  padding: 16,
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

    Initializer.initAccessTokenByCookies(req.cookies);
    Initializer.initAccessUserInQueryClientByCookies(req.cookies, queryClient);

    await queryClient.fetchQuery(queryKeys.commons.announce(Number(query.id)), () =>
      fetchAnnounce(Number(query.id))
    );

    return {
      props: {
        dehydratedState: dehydrate(queryClient)
      }
    };
  } catch {
    return {
      notFound: true
    };
  }
}

export default Announce;
