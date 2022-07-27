import { useEffect, useState } from 'react';

import { useMutation, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, CtaButton, Flexbox, Toast, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { UserCategoryCollapse } from '@components/pages/user';

import type { SubParentCategory } from '@dto/category';

import { logEvent } from '@library/amplitude';

import { fetchUserInfo, postStyle } from '@api/user';
import { fetchParentCategories } from '@api/category';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

export interface CategoryState {
  parentCategoryIds: number[];
  subParentCategoryIds: number[];
  selectAllCategoryIds: number[];
}

function CategoryInput() {
  const router = useRouter();
  const { data: userInfo } = useQuery(queryKeys.users.userInfo(), fetchUserInfo);
  const [categoryState, setCategoryState] = useState<CategoryState>({
    parentCategoryIds: [],
    subParentCategoryIds: [],
    selectAllCategoryIds: []
  });
  const { data: parentCategories } = useQuery(
    queryKeys.categories.parentCategories(),
    fetchParentCategories
  );

  const [open, setOpen] = useState<boolean>(false);

  const isSubmittable =
    categoryState.parentCategoryIds.length > 0 && categoryState.subParentCategoryIds.length > 0;
  const { isLoading, mutate } = useMutation(
    () => {
      if (isSubmittable) {
        return postStyle({
          parentCategoryIds: Array.from(categoryState.parentCategoryIds),
          subParentCategoryIds: Array.from(categoryState.subParentCategoryIds)
        });
      }
      return Promise.reject();
    },
    {
      onSuccess: () => router.back()
    }
  );

  useEffect(() => {
    logEvent(attrKeys.userInput.VIEW_PERSONAL_INPUT, {
      name: 'CATEGORY'
    });
  }, []);

  useEffect(() => {
    if (userInfo) {
      const subParentIds = userInfo.personalStyle.subParentCategories.map((item) => item.id);
      const parentId = new Set(
        userInfo.personalStyle.subParentCategories.map((item) => item.parentId)
      );
      setCategoryState({
        parentCategoryIds: Array.from(parentId),
        subParentCategoryIds: subParentIds,
        selectAllCategoryIds: categoryState.selectAllCategoryIds
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);

  const handleSave = () => {
    const result: SubParentCategory[] = [];
    parentCategories?.forEach((info) => {
      const filterData = info.subParentCategories.filter((item) =>
        categoryState.subParentCategoryIds.includes(item.id)
      );
      if (filterData.length > 0) {
        result.push(...filterData);
      }
    });
    logEvent(attrKeys.userInput.SUBMIT_PERSONAL_INPUT, {
      name: 'CATEGORY',
      att: result.map((item) => item.name).join(', ')
    });

    mutate();
  };

  return (
    <GeneralTemplate
      header={<Header type="onlyBack" />}
      footer={
        <Footer>
          <CtaButton
            fullWidth
            variant="contained"
            size="large"
            disabled={!isSubmittable || isLoading}
            brandColor="primary"
            onClick={handleSave}
          >
            저장
          </CtaButton>
        </Footer>
      }
    >
      <Box
        component="section"
        customStyle={{
          marginTop: 32,
          paddingBottom: 80,
          position: 'relative'
        }}
      >
        <TitleContents direction="vertical" gap={6}>
          <Typography variant="h3" weight="bold" brandColor="black">
            어떤 걸 찾으세요?
          </Typography>
          <Typography weight="regular">고른 건 홈에서 모아볼 수 있어요.</Typography>
          <Typography weight="regular" color="gray60">
            최대 9개 선택할 수 있어요.
          </Typography>
        </TitleContents>
        <Flexbox
          customStyle={{
            marginTop: '80px'
          }}
          alignment="center"
          direction="vertical"
          gap={24}
        >
          <UserCategoryCollapse
            categoryState={categoryState}
            setCategoryState={setCategoryState}
            showToast={() => {
              setOpen(true);
              setTimeout(() => {
                setOpen(false);
              }, 2500);
            }}
          />
        </Flexbox>
      </Box>
      <Toast open={open} bottom="74px" onClose={() => setOpen(false)}>
        <Typography
          customStyle={{
            color: 'white'
          }}
        >
          최대 9개만 선택할 수 있어요.
        </Typography>
      </Toast>
    </GeneralTemplate>
  );
}

const TitleContents = styled(Flexbox)`
  text-align: center;
  position: fixed;
  padding: 72px 0 30px 0;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 5;
  background: white;
`;

const Footer = styled.footer`
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 20px 20px 24px;
  background-color: white;
`;

export default CategoryInput;
