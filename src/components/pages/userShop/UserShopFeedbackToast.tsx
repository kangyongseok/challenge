import { useEffect } from 'react';

import { useRecoilState } from 'recoil';
import { Toast, Typography } from 'mrcamel-ui';

import { userShopOpenStateFamily } from '@recoil/userShop';

function UserShopFeedbackToast() {
  const [{ open: openUpdatePostedFeedback }, setOpenUpdatePostedFeedbackState] = useRecoilState(
    userShopOpenStateFamily('updatePostedFeedback')
  );
  const [{ open: openReservingFeedback }, setOpenReservingFeedbackState] = useRecoilState(
    userShopOpenStateFamily('reservingFeedback')
  );
  const [{ open: openSaleFeedback }, setOpenSaleFeedbackState] = useRecoilState(
    userShopOpenStateFamily('saleFeedback')
  );
  const [{ open: openDeleteFeedback }, setOpenDeleteFeedbackState] = useRecoilState(
    userShopOpenStateFamily('deleteFeedback')
  );
  const [{ open: openSoldOutFeedback }, setOpenSoldOutFeedbackState] = useRecoilState(
    userShopOpenStateFamily('soldOutFeedback')
  );

  useEffect(() => {
    return () => {
      setOpenUpdatePostedFeedbackState(({ type }) => ({
        type,
        open: false
      }));
      setOpenReservingFeedbackState(({ type }) => ({
        type,
        open: false
      }));
      setOpenSaleFeedbackState(({ type }) => ({
        type,
        open: false
      }));
      setOpenDeleteFeedbackState(({ type }) => ({
        type,
        open: false
      }));
      setOpenSoldOutFeedbackState(({ type }) => ({
        type,
        open: false
      }));
    };
  }, [
    setOpenDeleteFeedbackState,
    setOpenReservingFeedbackState,
    setOpenSaleFeedbackState,
    setOpenSoldOutFeedbackState,
    setOpenUpdatePostedFeedbackState
  ]);

  return (
    <>
      <Toast
        open={openUpdatePostedFeedback}
        onClose={() =>
          setOpenUpdatePostedFeedbackState(({ type }) => ({
            type,
            open: false
          }))
        }
      >
        <Typography weight="medium">끌어올리기가 완료되었어요. 👍</Typography>
      </Toast>
      <Toast
        open={openReservingFeedback}
        onClose={() =>
          setOpenReservingFeedbackState(({ type }) => ({
            type,
            open: false
          }))
        }
      >
        <Typography weight="medium">예약중으로 변경되었어요.</Typography>
      </Toast>
      <Toast
        open={openSaleFeedback}
        onClose={() =>
          setOpenSaleFeedbackState(({ type }) => ({
            type,
            open: false
          }))
        }
      >
        <Typography weight="medium">판매중으로 변경되었어요.</Typography>
      </Toast>
      <Toast
        open={openDeleteFeedback}
        onClose={() =>
          setOpenDeleteFeedbackState(({ type }) => ({
            type,
            open: false
          }))
        }
      >
        <Typography weight="medium">상품이 삭제되었어요.</Typography>
      </Toast>
      <Toast
        open={openSoldOutFeedback}
        onClose={() =>
          setOpenSoldOutFeedbackState(({ type }) => ({
            type,
            open: false
          }))
        }
      >
        <Typography weight="medium">판매완료 처리되었어요!</Typography>
      </Toast>
    </>
  );
}

export default UserShopFeedbackToast;
