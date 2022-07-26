import { memo } from 'react';

import Link from 'next/link';
import { Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';

interface ProductTitleProps {
  title: string;
  description: string;
  isSafe?: boolean;
  showAllButtonHref?: string;
  onClickShowAllButton?: () => void;
}

function ProductTitle({
  title,
  description,
  isSafe = false,
  showAllButtonHref,
  onClickShowAllButton
}: ProductTitleProps) {
  const {
    theme: { palette }
  } = useTheme();

  return (
    <>
      <Flexbox alignment="center" justifyContent="space-between">
        <Flexbox>
          {isSafe && <Icon name="SafeFilled" color={palette.primary.main} />}
          <Typography variant="h4" weight="bold">
            {title}
          </Typography>
        </Flexbox>
        {showAllButtonHref && (
          <Link href={showAllButtonHref}>
            <a onClick={onClickShowAllButton}>
              <Flexbox alignment="center">
                <Typography variant="body2" weight="bold">
                  전체보기
                </Typography>
                <Icon name="CaretRightOutlined" size="small" />
              </Flexbox>
            </a>
          </Link>
        )}
      </Flexbox>
      <Typography variant="body2" color={palette.common.grey['40']} customStyle={{ marginTop: 4 }}>
        {description}
      </Typography>
    </>
  );
}

export default memo(ProductTitle);
