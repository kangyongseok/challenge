import { useEffect, useState } from 'react';

import { QueryClient, dehydrate, useMutation } from 'react-query';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { Button, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import Header from '@components/UI/molecules/Header';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import UserSizeInputList from '@components/pages/user/UserSizeInputList';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchUserInfo, postUserSize } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';

import type { SelectSize } from '@typings/user';

function SizeInput() {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [selectedSizes, setSelectedSize] = useState<SelectSize[]>([]);

  const { mutateAsync } = useMutation(postUserSize);

  const handleClickSave = async () => {
    const filterTop = selectedSizes
      .filter((info) => info.kind === 'tops')
      .map((info) => info.categorySizeId);
    const filterBottom = selectedSizes
      .filter((info) => info.kind === 'bottoms')
      .map((info) => info.categorySizeId);
    const filterShoes = selectedSizes
      .filter((info) => info.kind === 'shoes')
      .map((info) => info.categorySizeId);

    const resultObj = [
      {
        sizeType: 'top',
        categorySizeIds: filterTop
      },
      {
        sizeType: 'bottom',
        categorySizeIds: filterBottom
      },
      {
        sizeType: 'shoes',
        categorySizeIds: filterShoes
      }
    ];

    logEvent(attrKeys.userInput.SUBMIT_PERSONAL_INPUT, {
      name: 'SIZE',
      title: 'SAVE',
      options: [...filterTop, ...filterBottom, ...filterShoes]
    });

    const result = resultObj.map((obj) => {
      return mutateAsync(obj, {
        onSuccess: () => {
          router.back();
        }
      });
    });
    await Promise.all(result);
  };

  useEffect(() => {
    logEvent(attrKeys.userInput.VIEW_PERSONAL_INPUT, {
      name: 'SIZE'
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GeneralTemplate
      header={<Header hideTitle showRight={false} />}
      footer={
        <Footer>
          <Button
            fullWidth
            variant="solid"
            brandColor="primary"
            size="xlarge"
            onClick={handleClickSave}
            disabled={selectedSizes.length === 0}
          >
            저장
          </Button>
        </Footer>
      }
      disablePadding
    >
      <Flexbox direction="vertical" gap={32} customStyle={{ padding: '0 32px 144px 31px' }}>
        <Flexbox component="section" direction="vertical" alignment="center" gap={4}>
          <Typography variant="h2" weight="bold">
            사이즈를 알려주세요!
          </Typography>
          <Typography customStyle={{ color: common.ui60 }}>
            사이즈에 맞는 매물만 보여드릴게요
          </Typography>
        </Flexbox>
        <UserSizeInputList selectedSizes={selectedSizes} setSelectedSize={setSelectedSize} />
      </Flexbox>
    </GeneralTemplate>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const queryClient = new QueryClient();

  Initializer.initAccessTokenByCookies(getCookies({ req }));
  const accessUser = Initializer.initAccessUserInQueryClientByCookies(
    getCookies({ req }),
    queryClient
  );

  if (accessUser) {
    await queryClient.prefetchQuery(queryKeys.users.userInfo(), fetchUserInfo);
  } else {
    return {
      redirect: {
        destination: '/login?returnUrl=/user/purchaseInput&isRequiredLogin=true',
        permanent: false
      }
    };
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

const Footer = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 20px;
  background-color: ${({ theme: { palette } }) => palette.common.uiWhite};
`;

export default SizeInput;
