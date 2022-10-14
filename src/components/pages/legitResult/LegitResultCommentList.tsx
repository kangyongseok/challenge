import { useState } from 'react';
import type { RefObject } from 'react';

import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Flexbox } from 'mrcamel-ui';

import { LegitResultCommentSkeleton } from '@components/UI/molecules';

import type { ProductLegitCommentsParams } from '@dto/productLegit';

import { fetchProductLegitComments } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';

import LegitResultComment from './LegitResultComment';

interface LegitResultCommentListProps {
  writerRef: RefObject<HTMLDivElement>;
}

function LegitResultCommentList({ writerRef }: LegitResultCommentListProps) {
  const router = useRouter();
  const { id } = router.query;
  const splitIds = String(id).split('-');
  const productId = Number(splitIds[splitIds.length - 1] || 0);

  const [params] = useState<ProductLegitCommentsParams>({
    productId,
    page: 0,
    size: 100
  });

  const { data: { content: comments = [] } = {}, isLoading } = useQuery(
    queryKeys.productLegits.comments(params),
    () => fetchProductLegitComments(params),
    {
      keepPreviousData: true,
      enabled: !!id
    }
  );

  if (!isLoading && !comments.length) return null;

  return (
    <Flexbox component="section" direction="vertical" gap={34} customStyle={{ marginTop: 32 }}>
      {isLoading &&
        Array.from({ length: 20 }).map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <LegitResultCommentSkeleton key={`legit-result-comment-skeleton-${index}`} />
        ))}
      {!isLoading &&
        comments.map((comment) => (
          <LegitResultComment
            key={`legit-result-comment-${comment.id}`}
            comment={comment}
            writerRef={writerRef}
          />
        ))}
    </Flexbox>
  );
}

export default LegitResultCommentList;
