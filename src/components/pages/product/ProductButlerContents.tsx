import { MouseEvent, useState } from 'react';

import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Box, Flexbox, Grid, Icon, Image, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { NewProductGridCard, NewProductGridCardSkeleton } from '@components/UI/molecules';

import { fetchContentProducts } from '@api/common';

import queryKeys from '@constants/queryKeys';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';

function ProductButlerContents() {
  const router = useRouter();
  const { data: { content = [] } = {}, isLoading } = useQuery(
    queryKeys.commons.contentProducts({ id: 18 }),
    () => fetchContentProducts({ id: 18 })
  );

  const [hideAnswer, setHideAnswer] = useState<number[]>([]);

  const { id } = router.query;
  const splitId = String(id).split('-');
  const productId = Number(splitId[splitId.length - 1] || 0);

  const handleClickArcodian = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget.dataset;
    if (hideAnswer.includes(Number(target.num))) {
      setHideAnswer(hideAnswer.filter((answer) => answer !== Number(target.num)));
    } else {
      setHideAnswer((answer) => [...answer, Number(target.num)]);
    }
  };

  return (
    <>
      <Gap />
      <ButlerQnA gap={20} direction="vertical">
        <Typography weight="bold" variant="h3">
          자주묻는 질문
        </Typography>
        <Box>
          <Flexbox
            gap={10}
            alignment="flex-start"
            justifyContent="space-between"
            data-num={1}
            onClick={handleClickArcodian}
            customStyle={{ position: 'relative', zIndex: 1 }}
          >
            <Typography weight="bold">
              Q.어떻게 일주일만에 가브리엘 백팩을 이렇게 모을 수 있었나요?
            </Typography>
            <Icon name={hideAnswer.includes(1) ? 'Arrow2DownOutlined' : 'Arrow2UpOutlined'} />
          </Flexbox>
          <AnswerContent direction="vertical" gap={5} isClose={hideAnswer.includes(1)}>
            <Typography>
              - 전국 모든 플랫폼과 사이트에 중고명품 거래글이 등록되면, 카멜 Ai는 빠르고 정확하게
              분석하여 원하는 조건에 맞는 상품을 찾아냅니다.
            </Typography>
            <Typography>
              - 이 엔진을 통해 전국 각지에 있는 &lsquo;상태 좋은&rsquo; 가브리엘 백팩을 어렵지 않게
              구매할 수 있었습니다.
            </Typography>
            <Typography>
              - 또한 카멜은 그간 축적된 5,000만개의 중고명품 거래 정보를 기반으로 다양한 조건에 따른
              최적의 매입가를 판단하고 있습니다.
            </Typography>
          </AnswerContent>
        </Box>
        <Box>
          <Flexbox
            gap={10}
            alignment="flex-start"
            justifyContent="space-between"
            data-num={2}
            onClick={handleClickArcodian}
            customStyle={{ position: 'relative', zIndex: 1 }}
          >
            <Typography weight="bold">Q.다른 플랫폼들에 비해 왜 가격이 더 저렴한가요?</Typography>
            <Icon name={hideAnswer.includes(2) ? 'Arrow2DownOutlined' : 'Arrow2UpOutlined'} />
          </Flexbox>
          <AnswerContent direction="vertical" gap={5} isClose={hideAnswer.includes(2)}>
            <Typography>
              - 최대한 판매자에게 좋은 비싼 가격으로, 전국 각지의 카멜 파트너스를 통해 쉽고 빠르게
              매입하고 있습니다.
            </Typography>
            <Typography>
              - 또한 판매하기까지 발생하는 비용을 혁신적으로 감소시켜 저렴한 가격에 판매합니다.
            </Typography>
          </AnswerContent>
        </Box>
        <Box>
          <Flexbox
            gap={10}
            alignment="flex-start"
            justifyContent="space-between"
            data-num={3}
            onClick={handleClickArcodian}
            customStyle={{ position: 'relative', zIndex: 1 }}
          >
            <Typography weight="bold">Q.정품인가요? 정품이 아니면 보상은요?</Typography>
            <Icon name={hideAnswer.includes(3) ? 'Arrow2DownOutlined' : 'Arrow2UpOutlined'} />
          </Flexbox>
          <AnswerContent direction="vertical" gap={5} isClose={hideAnswer.includes(3)}>
            <Typography>
              - 카멜에서 판매하는 상품들은 카멜을 포함, 최소 3곳의 개인감정사 및 기관에서 모두
              정품으로 확인된 경우에만 판매하고 있습니다. (한국명품감정원, 고이비토감정원,
              한국동산감정원 등)
            </Typography>
            <Typography>
              - 만약 카멜에서 구매한 상품이 다른 곳에서 가품 감정을 받을 경우, 국내 8개 기관에 정품
              여부를 다시 확인합니다. 감정결과 중 가품 의견이 과반수일 경우 200% 보상하고 있습니다.
              (전국 각지의 명품 전문가의 의견을 취합합니다.)
            </Typography>
          </AnswerContent>
        </Box>
        <Box>
          <Flexbox
            gap={10}
            alignment="flex-start"
            justifyContent="space-between"
            data-num={4}
            onClick={handleClickArcodian}
            customStyle={{ position: 'relative', zIndex: 1 }}
          >
            <Typography weight="bold">
              Q.내 상품을 카멜에 판매하고 싶은데 어떻게 해야 할까요?
            </Typography>
            <Icon name={hideAnswer.includes(4) ? 'Arrow2DownOutlined' : 'Arrow2UpOutlined'} />
          </Flexbox>
          <AnswerContent direction="vertical" gap={5} isClose={hideAnswer.includes(4)}>
            <Typography>
              - 상품의 정보, 사진, 설명을(또는 판매중인 게시글) 카멜에게 전달하고, 카멜은 이를
              기반으로 좋은 매입가를 제안합니다. (현재는 &lsquo;샤넬 가브리엘 블랙 스몰
              백팩&rsquo;과 &lsquo;샤넬 클래식 미디움 블랙&rsquo; 중심으로 매입하고 있습니다.)
            </Typography>
            <Typography>
              - 이 제안이 마음에 든다면 아래 방법으로 상품을 판매하고 즉시 현금을 지급 받습니다.
              <br />
              1) 전국 각지의 카멜 파트너스 (제휴업체)에 방문하여 상품 전달 후 즉시 현금 지급
              <br />
              2) 가까운 카멜 파트너스 퀵 배송을 통해 발송 후 즉시 현금 지급
              <br />
              3) 내 집 앞으로 담당자가 방문해 상품을 수령한 뒤 즉시 현금 지급
            </Typography>
            <Typography>- 고가의 상품이라 판매자의 신원정보를 확인하고 있습니다.</Typography>
            <Typography>
              - 단 상품의 정보, 사진, 설명과 다름이 있을 경우 매입이 거절될 수 있습니다.
            </Typography>
          </AnswerContent>
        </Box>
        <Box>
          <Flexbox
            gap={10}
            alignment="flex-start"
            justifyContent="space-between"
            data-num={5}
            onClick={handleClickArcodian}
            customStyle={{ position: 'relative', zIndex: 1 }}
          >
            <Typography weight="bold">
              Q.이번 기획전에 구매하지 못했는데, 사고싶어요.
              <br />
              카멜이 도와줄 수 있나요?
            </Typography>
            <Icon name={hideAnswer.includes(5) ? 'Arrow2DownOutlined' : 'Arrow2UpOutlined'} />
          </Flexbox>
          <AnswerContent direction="vertical" gap={5} isClose={hideAnswer.includes(5)}>
            <Typography>
              - 물론 도와드리겠습니다. &lsquo;Camel Butler&rsquo; 서비스에 신청 해주시면 돼요.{' '}
              <br />
              1) 원하는 모델과 조건을 카멜에게 알려주세요. 카멜이 조건에 맞는 상품을 실시간으로
              추천해드려요. <br />
              2) 구매결정 해주시면 카멜이 대신 구매, 정품감정, 배송까지 쉽고 안전하게 진행해드려요!
            </Typography>
            <Typography>
              - 샤넬 가브리엘 백팩의 경우 매물이 희소하지만, 보통 2주 안에는 원하는 상품을 받아볼 수
              있어요.
            </Typography>
            <Typography customStyle={{ textIndent: 0, marginTop: 10 }}>
              매일 힘들게 여기저기 발품팔며 불안하게 거래하지 말고 카멜에게 요청 해주세요!
            </Typography>
          </AnswerContent>
        </Box>
      </ButlerQnA>

      <Box
        customStyle={{
          width: 'calc(100% + 40px)',
          borderTop: '8px solid #eff0f2',
          marginTop: 32,
          marginLeft: -20,
          borderBottom: '8px solid #eff0f2'
        }}
        onClick={() => router.push('/butler/demo')}
      >
        <Image
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/butler/butler_banner.png`}
          disableAspectRatio
          alt="Did you buy luxury you wanted?"
        />
      </Box>

      <Box customStyle={{ margin: '32px 0' }}>
        <Typography variant="h3" weight="bold" customStyle={{ marginBottom: 20 }}>
          보고 있는 매물과 비슷해요
        </Typography>
        <Grid container rowGap={32} columnGap={12}>
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <Grid key={`related-product-skeleton-${index}`} item xs={2}>
                  <NewProductGridCardSkeleton variant="gridB" />
                </Grid>
              ))
            : content
                .filter((item) => item.id !== productId)
                .map((product, index) => (
                  <Grid key={`related-product-${product.id}`} item xs={2}>
                    <NewProductGridCard
                      variant="gridB"
                      product={product}
                      hideLabel
                      butlerExhibition
                      attributes={{
                        name: attrProperty.name.PRODUCT_DETAIL,
                        title: attrProperty.title.LIST_RELATED,
                        source: attrProperty.source.PRODUCT_DETAIL_LIST_RELATED,
                        id: product?.id,
                        brand: product?.brand.name,
                        category: product?.category.name,
                        parentCategory: FIRST_CATEGORIES[product?.category.parentId as number],
                        site: product?.site.name,
                        price: product?.price,
                        scoreTotal: product?.scoreTotal,
                        scorePriceRate: product?.scorePriceRate,
                        index: index + 1
                      }}
                    />
                  </Grid>
                ))}
        </Grid>
      </Box>
    </>
  );
}

const ButlerQnA = styled(Flexbox)``;

const Gap = styled.div`
  height: 8px;
  background: #eff0f2;
  width: calc(100% + 40px);
  margin: 32px 0;
  margin-left: -20px;
`;

const AnswerContent = styled(Flexbox)<{ isClose: boolean }>`
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg03};
  text-indent: -10px;
  margin-top: ${({ isClose }) => (isClose ? 0 : 20)}px;
  transition: all 0.2s ease-in-out;
  opacity: ${({ isClose }) => (isClose ? 0 : 1)};
  height: ${({ isClose }) => (isClose ? 0 : 'auto')};
  padding: ${({ isClose }) => (isClose ? '0 20px' : '20px')};
  padding-left: 30px;
  div {
    height: ${({ isClose }) => (isClose ? 0 : 'auto')};
    opacity: ${({ isClose }) => (isClose ? 0 : 1)};
  }
  word-break: keep-all;
`;

export default ProductButlerContents;
