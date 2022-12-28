import type { MouseEvent } from 'react';
import { useEffect, useState } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox, Image, Typography, useTheme } from 'mrcamel-ui';
import { find, uniq } from 'lodash-es';

import { StyleDetails } from '@dto/common';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';
import { fetchStyles } from '@api/common';

import queryKeys from '@constants/queryKeys';
import { SELECTED_MODEL_CARD } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { LikeStyleSelectedModelDetail } from '@typings/common';
import { openState, selectedModelCardState } from '@recoil/onboarding';
import { toastState } from '@recoil/common';

import {
  ModelCardText,
  ParentStyleCard,
  StyleCardImgWrap,
  SubModelCard,
  SubModelCheckIcon
} from './StylesCards.styles';

const BASE_URL = `https://${process.env.IMAGE_DOMAIN}/assets/images/welcome`;

function StylesCards({ themeType }: { themeType?: 'normal' }) {
  const router = useRouter();
  const {
    theme: { palette }
  } = useTheme();

  const [selectedModelCard, setSelectedModelCard] = useRecoilState(selectedModelCardState);
  const [styleCardId, setStyleCardId] = useState<number[]>([]);
  const setToastState = useSetRecoilState(toastState);
  const setOpenTooltip = useSetRecoilState(openState('likeTooltip'));

  const {
    data: { personalStyle: { styles: userStyles = [] } = {}, info } = {},
    isSuccess: userStyleLoad
  } = useQuery(queryKeys.users.userInfo(), fetchUserInfo, {
    refetchOnMount: true,
    enabled: router.pathname === '/user/likeModelInput'
  });

  const { data: { styles: stylesList = [] } = {} } = useQuery(
    queryKeys.commons.styles(),
    fetchStyles,
    {
      refetchOnMount: true
    }
  );

  const parentData = [
    {
      id: 37,
      title: '캐주얼/스트릿',
      subTitle: (
        <p>
          스트릿 브랜드나
          <br />
          캐주얼을 좋아하신다면
        </p>
      ),
      imgName: 'style_01'
    },
    {
      id: info?.value.gender === 'F' ? 39 : 38,
      title: '클래식 명품',
      subTitle: (
        <p>
          남들이 알아주는
          <br />
          유명한 명품을 찾으신다면
        </p>
      ),
      imgName: 'style_02'
    },
    {
      id: 40,
      title: '스니커즈 매니아',
      subTitle: (
        <p>
          한정판 신발에
          <br />
          영혼이 꽂히신다면
        </p>
      ),
      imgName: 'style_03'
    },
    {
      id: 41,
      title: '컨템포러리',
      subTitle: (
        <p>
          편한 데일리 아이템을
          <br />
          찾으신다면
        </p>
      ),
      imgName: 'style_04'
    }
  ];

  useEffect(() => {
    const localSelectedModelCard = LocalStorage.get(
      SELECTED_MODEL_CARD
    ) as LikeStyleSelectedModelDetail[];
    if (localSelectedModelCard) {
      setSelectedModelCard(localSelectedModelCard);
      setStyleCardId(uniq(localSelectedModelCard.map((item) => item.styleId)) as number[]);
    }
  }, [setSelectedModelCard]);

  useEffect(() => {
    const localSelectedModelCard = LocalStorage.get(
      SELECTED_MODEL_CARD
    ) as LikeStyleSelectedModelDetail[];
    if (!!stylesList.length && localSelectedModelCard?.length) {
      const selectStyle = localSelectedModelCard.map((style) => style.id);
      const styleDetails = stylesList.map((list) => list.styleDetails);
      const result: number[] = [];
      styleDetails.forEach((lists) => {
        if (lists.filter((item) => selectStyle.includes(item.id)).length) {
          result.push(
            lists.filter((item) => selectStyle.includes(item.id)).map((a) => a.styleId)[0]
          );
        }
      });
      setStyleCardId(result);
      return;
    }

    if (!!stylesList.length && userStyleLoad) {
      const userStyle = userStyles.map((style) => style.id);
      const styleDetails = stylesList.map((list) => list.styleDetails);
      const result: number[] = [];
      styleDetails.forEach((lists) => {
        if (lists.filter((item) => userStyle.includes(item.id)).length) {
          result.push(lists.filter((item) => userStyle.includes(item.id)).map((a) => a.styleId)[0]);
        }
      });
      setSelectedModelCard(userStyles);
      setStyleCardId(result);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stylesList, userStyleLoad]);

  const handleClickStyleCard = (e: MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const id = Number(target.dataset.styleId);
    if (styleCardId.includes(id)) {
      setStyleCardId(styleCardId.filter((cardId) => cardId !== id));
    } else {
      logEvent(attrKeys.welcome.SELECT_ITEM, {
        name: attrProperty.name.PERSONAL_INPUT,
        title: attrProperty.title.STYLE,
        att: find(parentData, { id })?.title
      });

      setTimeout(() => {
        window.scrollTo({
          top: target.offsetTop - 74,
          behavior: 'smooth'
        });
      }, 300);
      setStyleCardId([...styleCardId, id]);
    }
  };

  const handleClickModelCard = (detail: StyleDetails) => {
    const selectedInfo: LikeStyleSelectedModelDetail = {
      name: detail.name,
      id: detail.id,
      styleId: detail.styleId,
      categoryId: detail.category.parentId as number
    };

    if (find(selectedModelCard, { id: detail.id })) {
      setSelectedModelCard(selectedModelCard.filter((card) => card.id !== detail.id));
    } else {
      if (selectedModelCard.length > 4) {
        if (themeType === 'normal') {
          setToastState({
            type: 'mypage',
            status: 'overFiveStyle'
          });
        }
        setOpenTooltip(({ type }) => ({
          type,
          open: true
        }));
        return;
      }
      logEvent(attrKeys.welcome.SELECT_ITEM, {
        name: attrProperty.name.PERSONAL_INPUT,
        title: attrProperty.title.MODEL,
        att: detail.name
      });

      setSelectedModelCard([...selectedModelCard, selectedInfo]);
    }
  };

  return (
    <Flexbox gap={12} direction="vertical">
      {stylesList.map(({ style, styleDetails }) => (
        <>
          <ParentStyleCard
            key={`parent-style-card-${style.id}`}
            gap={20}
            data-style-id={style.id}
            onClick={handleClickStyleCard}
            isSelect={styleCardId.includes(style.id)}
            themeType={!!(themeType === 'normal')}
          >
            <Box customStyle={{ width: 125 }}>
              <Typography
                variant="h3"
                weight="bold"
                customStyle={{
                  color: styleCardId.includes(style.id)
                    ? palette.common.uiWhite
                    : palette.common.uiBlack,
                  marginBottom: 4
                }}
              >
                {find(parentData, { id: style.id })?.title}
              </Typography>
              <Typography
                variant="small1"
                customStyle={{
                  color: styleCardId.includes(style.id) ? palette.common.ui95 : palette.common.ui60
                }}
              >
                {find(parentData, { id: style.id })?.subTitle}
              </Typography>
            </Box>
            <StyleCardImgWrap>
              <Image
                src={`${BASE_URL}/${find(parentData, { id: style.id })?.imgName}.png`}
                alt="Style Card Img"
                disableAspectRatio
                disableSkeleton
              />
            </StyleCardImgWrap>
          </ParentStyleCard>
          {styleCardId.includes(style.id) && (
            <Flexbox gap={12} customStyle={{ flexWrap: 'wrap' }}>
              {styleDetails.map((detail) => (
                <SubModelCard
                  key={`sub-style-card-${detail.id}`}
                  onClick={() => handleClickModelCard(detail)}
                  alignment="center"
                  isSelected={!!find(selectedModelCard, { id: detail.id })}
                  imgUrl={detail.image}
                >
                  <ModelCardText
                    variant="h4"
                    weight="bold"
                    isSelected={
                      !!(find(selectedModelCard, { id: detail.id }) && themeType === 'normal')
                    }
                  >
                    {detail.name}
                  </ModelCardText>
                  {!!find(selectedModelCard, { id: detail.id }) && (
                    <SubModelCheckIcon name="CheckOutlined" size="small" />
                  )}
                </SubModelCard>
              ))}
            </Flexbox>
          )}
        </>
      ))}
    </Flexbox>
  );
}

export default StylesCards;
