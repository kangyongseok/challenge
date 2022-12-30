import { memo, useEffect, useMemo, useState } from 'react';

import { Line } from 'react-chartjs-2';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import {
  CategoryScale,
  Chart as ChartJS,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import styled from '@emotion/styled';

import type { Product } from '@dto/product';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/common';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

/**
 * 라운드가 들어간 사각형을 그려주는 로직
 * https://codepen.io/simon-wu/pen/ExgLEXQ
 */
const createRoundRect = ({
  ctx,
  x,
  y,
  width,
  height,
  radius,
  isIntAndLess10,
  fillStyle
}: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  isIntAndLess10: boolean;
  fillStyle: string;
}) => {
  let $radius = radius;

  if (width < 2 * radius) $radius = width / 2;

  if (height < 2 * radius) $radius = height / 2;

  ctx.beginPath();

  if (isIntAndLess10) {
    ctx.arc(x + $radius, y + 11, width, 0, 2 * Math.PI);
  } else {
    ctx.moveTo(x + $radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, $radius);
    ctx.arcTo(x + width, y + height, x, y + height, $radius);
    ctx.arcTo(x, y + height, x, y, $radius);
    ctx.arcTo(x, y, x + width, y, $radius);
  }
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
};

interface ProductAveragePriceChartProps {
  product?: Product;
}

function ProductAveragePriceChart({ product }: ProductAveragePriceChartProps) {
  const { push } = useRouter();
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();
  const [data, setData] = useState<ChartData<'line'> | null>(null);
  const [options, setOptions] = useState<ChartOptions<'line'> | null>(null);
  const chartValues = useMemo(() => {
    let averagePrices: number[] = [];
    if (product?.weekAvgPrices) {
      averagePrices = product.weekAvgPrices.filter((weekAvgPrice) => weekAvgPrice !== 0);
    }

    return averagePrices
      .map((averagePrice) => Number((averagePrice / 10000).toFixed(1)))
      .slice(0, 7)
      .reverse();
  }, [product?.weekAvgPrices]);

  const productPrice = useMemo(() => {
    const viewPrice = chartValues[6] || 0;

    if (viewPrice - Math.floor(viewPrice) > 0) {
      return Number(viewPrice.toFixed(1));
    }

    return Math.floor(viewPrice);
  }, [chartValues]);

  const isShowChart = useMemo(() => {
    if (product?.weekAvgPrices) {
      return (
        product.weekAvgPrices.slice(1).reduce((acc, v) => acc + v) > 0 &&
        product.scorePriceCount > 20
      );
    }

    if (product?.quoteTitle) {
      return product.quoteTitle.indexOf(' ') < 0;
    }

    return false;
  }, [product?.quoteTitle, product?.scorePriceCount, product?.weekAvgPrices]);

  const handleClickLowerProduct = () => {
    logEvent(attrKeys.products.CLICK_PRODUCT_LIST, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: '시세이하'
    });

    push({
      pathname: `/products/search/${product?.quoteTitle}`,
      query: {
        idFilterIds: 30
      }
    });
  };

  useEffect(() => {
    const slicedValues = chartValues.slice(3, 7);
    if (slicedValues.length > 0) {
      const suggestedMax = Number(((105 / 100) * Math.max(...slicedValues)).toFixed(1));
      const suggestedMin = Number(((95 / 100) * Math.min(...slicedValues)).toFixed(1));
      const stepSize = Number(((suggestedMax - suggestedMin) / 3).toFixed(0));
      const previousMonth = Number(dayjs().format('M')) - 1;
      const year = dayjs().format('YY년');

      setData({
        labels: [
          `${year} ${previousMonth - 3}월`,
          `${previousMonth - 2}월`,
          `${previousMonth - 1}월`,
          `${previousMonth}월`
        ],
        datasets: [
          {
            data: slicedValues,
            pointRadius: [4, 4, 4, 7],
            borderColor: common.bg02,
            pointBackgroundColor: [common.ui80, common.ui80, common.ui80, primary.light],
            pointBorderWidth: [0, 0, 0, 0]
          }
        ]
      });

      setOptions({
        responsive: true,
        layout: {
          padding: {
            top: 24,
            left: 20,
            right: 25
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            stacked: true,
            ticks: {
              autoSkip: false,
              maxRotation: 0,
              align: 'inner',
              font: {
                size: 12,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                weight: ['400', '400', '400', '700']
              },
              color: [common.ui60, common.ui60, common.ui60, common.ui20]
            },
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: false,
            stacked: true,
            suggestedMax,
            suggestedMin,
            ticks: {
              autoSkip: false,
              maxRotation: 0,
              display: false,
              stepSize
            },
            grid: {
              lineWidth: 1,
              color: common.line02,
              drawBorder: false,
              display: true
            }
          }
        },
        interaction: {
          intersect: true,
          mode: 'nearest',
          axis: 'y'
        },
        animation: {
          onComplete({ chart, chart: { ctx } }) {
            chart.getDatasetMeta(0).data.forEach((chartElement, index) => {
              createRoundRect({
                ctx,
                x: chartElement.x - String(slicedValues[index]).length * 4,
                y: chartElement.y - 34,
                width: String(slicedValues[index]).length * 8,
                height: 20,
                radius: 20,
                isIntAndLess10: Number.isInteger(slicedValues[index]) && slicedValues[index] < 10,
                fillStyle: common.uiWhite
              });
              // eslint-disable-next-line quotes
              ctx.font = "500 12px 'Camel Product Sans', 'Helvetica', 'Arial', sans-serif";
              ctx.fillStyle = common.ui60;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'bottom';
              ctx.fillText(
                slicedValues[index] ? `${String(slicedValues[index])}만원` : '',
                chartElement.x,
                chartElement.y - 18
              );
            });
          }
        },
        plugins: {
          tooltip: {
            enabled: false,
            position: 'nearest',
            borderColor: common.ui90,
            borderWidth: 1,
            backgroundColor: common.uiWhite,
            bodyColor: common.ui60
          }
        }
      });
    }
  }, [
    chartValues,
    common.bg02,
    common.line02,
    common.ui20,
    common.ui60,
    common.ui80,
    common.ui90,
    common.uiBlack,
    common.uiWhite,
    primary.highlight,
    primary.light,
    primary.main
  ]);

  if (!isShowChart) {
    return null;
  }

  return (
    <>
      <Box customStyle={{ paddingTop: 20 }} />
      <Box customStyle={{ marginBottom: 32 }}>
        <Typography
          variant="small1"
          weight="bold"
          customStyle={{ color: common.ui60, marginBottom: 4 }}
        >
          #{product?.quoteTitle}
        </Typography>
        <Flexbox gap={4} alignment="center">
          <Typography variant="h3" weight="bold">
            평균시세
          </Typography>
          <Typography variant="h3" weight="bold" customStyle={{ color: primary.light }}>
            {commaNumber(productPrice)}만원
          </Typography>
        </Flexbox>
        {data && options && <Line data={data} options={options} />}
        <Button
          fullWidth
          size="large"
          variant="solid"
          customStyle={{ marginTop: 32, background: common.ui95, color: common.ui20 }}
          onClick={handleClickLowerProduct}
        >
          시세이하 매물보기
        </Button>
        <Divider />
      </Box>
    </>
  );
}

const Divider = styled.div`
  margin-top: 32px;
  border-bottom: 8px solid ${({ theme: { palette } }) => palette.common.bg02};
  margin-left: -20px;
  width: calc(100% + 40px);
`;

export default memo(ProductAveragePriceChart);
