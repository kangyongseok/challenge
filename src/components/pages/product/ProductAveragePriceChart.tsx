import { memo, useEffect, useMemo, useState } from 'react';

import { Line } from 'react-chartjs-2';
import { Box, Typography, useTheme } from 'mrcamel-ui';
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

import { commaNumber } from '@utils/common';

import { pulse } from '@styles/transition';

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
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();
  const [data, setData] = useState<ChartData<'line'> | null>(null);
  const [options, setOptions] = useState<ChartOptions<'line'> | null>(null);
  const chartValues = useMemo(() => {
    let averagePrices: number[] = [];

    if (product?.weekAvgPrices && product?.scorePriceAvg) {
      averagePrices = [product.scorePriceAvg]
        .concat(product.weekAvgPrices)
        .filter((weekAvgPrice) => weekAvgPrice !== 0);
    }

    return averagePrices
      .map((averagePrice) => Number((averagePrice / 10000).toFixed(1)))
      .slice(0, 7)
      .reverse();
  }, [product?.scorePriceAvg, product?.weekAvgPrices]);
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

  useEffect(() => {
    const slicedValues = chartValues.slice(3, 7);

    if (slicedValues.length > 0) {
      const suggestedMax = Number(((105 / 100) * Math.max(...slicedValues)).toFixed(1));
      const suggestedMin = Number(((95 / 100) * Math.min(...slicedValues)).toFixed(1));
      const stepSize = Number(((suggestedMax - suggestedMin) / 3).toFixed(0));
      const previousMonth = Number(dayjs().format('M')) - 1;

      setData({
        labels: [
          `${previousMonth - 2}월`,
          `${previousMonth - 1}월`,
          `${previousMonth}월`,
          '평균시세'
        ],
        datasets: [
          {
            data: slicedValues,
            pointRadius: [4, 4, 4, 7],
            borderColor: [common.ui90, common.ui90, common.ui90, primary.highlight],
            pointBackgroundColor: [common.ui60, common.ui60, common.ui60, primary.main],
            pointBorderWidth: [0, 0, 0, 5]
          }
        ]
      });
      setOptions({
        responsive: true,
        layout: {
          padding: {
            top: 24
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
                size: 14,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                weight: ['400', '400', '400', '500']
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
              color: common.ui90,
              drawBorder: false,
              borderDash: [5, 5],
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
              ctx.font = "normal 10px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
              ctx.fillStyle = common.uiBlack;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'bottom';
              ctx.fillText(String(slicedValues[index]), chartElement.x, chartElement.y - 18);
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
    common.ui20,
    common.ui60,
    common.ui80,
    common.ui90,
    common.uiBlack,
    common.uiWhite,
    primary.highlight,
    primary.main
  ]);

  if (!isShowChart) {
    return null;
  }

  return (
    <Box customStyle={{ marginTop: 32 }}>
      <Typography variant="h4" weight="bold">
        평균시세
      </Typography>
      {!product ? (
        <LabelSkeleton />
      ) : (
        <>
          <Label isShowChart={isShowChart}>
            {isShowChart ? (
              <>
                <Typography variant="body1" weight="medium">
                  {product.quoteTitle}
                </Typography>
                <Typography variant="body1" weight="medium">
                  {commaNumber(productPrice)}만원
                </Typography>
              </>
            ) : (
              <Typography variant="body1" weight="medium">
                데이터가 부족해요
              </Typography>
            )}
          </Label>
          {isShowChart && data && options && <Line data={data} options={options} />}
        </>
      )}
      <Divider />
    </Box>
  );
}

const LabelSkeleton = styled.div`
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui90};
  animation: ${pulse} 800ms linear 0s infinite alternate;
  margin-top: 16px;
  height: 128px;
`;

const Label = styled.div<{ isShowChart: boolean }>`
  margin-top: 16px;
  padding: 12px 16px;
  display: ${({ isShowChart }) => (isShowChart ? 'grid' : 'inline-block')};
  grid-template-columns: 1fr auto;
  grid-gap: 8px;
  justify-content: space-between;
  align-items: center;
  background-color: ${({
    theme: {
      palette: { primary }
    }
  }) => primary.bgLight};
  border-radius: ${({ theme }) => theme.box.round['8']};
`;

const Divider = styled.hr`
  margin-top: 32px;
  border-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui90};
`;

export default memo(ProductAveragePriceChart);
