import { useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import dayjs from 'dayjs';
import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { Button, Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { Header, TextInput } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  AppointmentCancelDialog,
  AppointmentMakeSuccessDialog,
  AppointmentSelectNotiTimeBottomSheet
} from '@components/pages/appointment';

import type { PostAppointmentData } from '@dto/channel';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { putProductUpdateStatus } from '@api/product';
import { deleteAppointment, fetchChannel, postAppointment, putAppointment } from '@api/channel';

import { channelUserType } from '@constants/user';
import queryKeys from '@constants/queryKeys';
import { productStatus } from '@constants/channel';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';
import {
  getAppointmentDataFormat,
  getAppointmentTimeFormat,
  getNotiTimeText
} from '@utils/channel';

function Appointment() {
  const {
    theme: {
      palette: { common },
      typography
    }
  } = useTheme();

  const router = useRouter();

  const queryClient = new QueryClient();

  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const channelId = useMemo(() => Number(router.query.id || ''), [router.query.id]);

  const {
    isLoading,
    data: { channel, channelAppointments, channelUser, product } = {},
    refetch
  } = useQuery(queryKeys.channels.channel(channelId), () => fetchChannel(channelId), {
    enabled: !!channelId
  });

  const { mutate: mutateUpdateProductStatus, isLoading: isLoadingUpdateProductStatus } =
    useMutation(putProductUpdateStatus);
  const { mutate: mutateCreateAppointment, isLoading: isLoadingCreateAppointment } =
    useMutation(postAppointment);
  const { mutate: mutateUpdateAppointment, isLoading: isLoadingUpdateAppointment } =
    useMutation(putAppointment);
  const { mutate: mutateDeleteAppointment, isLoading: isLoadingDeleteAppointment } =
    useMutation(deleteAppointment);

  const [openAppointmentSelectNotiTimeBottomSheet, setOpenAppointmentSelectNotiTimeBottomSheet] =
    useState(false);
  const [params, setParams] = useState<PostAppointmentData>({
    channelId,
    dateAppointment: dayjs()
      .set('hour', dayjs().get('hour') + 1)
      .format('YYYYMMDDHHmmss'),
    place: '',
    notiTime: 30
  });

  const isSeller =
    typeof channelUser?.type === 'number' &&
    channelUserType[channelUser.type as keyof typeof channelUserType] === channelUserType[1];
  const appointment = channelAppointments?.find(
    ({ isDeleted, type }) => !isDeleted && type !== 'DELETE'
  );

  const handleClickDone = async () => {
    if (
      isLoading ||
      isLoadingUpdateProductStatus ||
      isLoadingCreateAppointment ||
      isLoadingUpdateAppointment ||
      isLoadingDeleteAppointment ||
      params.dateAppointment.length < 14
    )
      return;

    logEvent(attrKeys.channel.SUBMIT_APPOINTMENT, { att: appointment ? 'EDIT' : 'NEW' });

    if (appointment) {
      if (
        appointment?.dateAppointment === params.dateAppointment &&
        appointment?.place === params.place &&
        appointment?.notiTime === params.notiTime
      ) {
        router.back();
        return;
      }

      await mutateUpdateAppointment(params, {
        onSuccess() {
          router.back();
        }
      });
    } else {
      await mutateCreateAppointment(params, {
        onSuccess() {
          refetch();

          if (
            isSeller &&
            product &&
            productStatus[product.status as keyof typeof productStatus] !== productStatus[4]
          ) {
            logEvent(attrKeys.channel.VIEW_APPOINTMENT_POPUP, {
              title: attrProperty.title.RESERVED
            });
            setOpen(true);
          } else {
            router.back();
          }
        }
      });
    }
  };

  const handleClickCancel = () => {
    if (isLoadingDeleteAppointment) return;

    logEvent(attrKeys.channel.CLICK_APPOINTMENT_CANCEL);
    logEvent(attrKeys.channel.VIEW_APPOINTMENT_POPUP, {
      title: attrProperty.title.APPOINTMENT_CANCEL
    });

    setOpenDialog(true);
  };

  const handleClick = () => {
    if (isLoadingUpdateProductStatus || !channel?.productId) return;

    logEvent(attrKeys.channel.CLICK_APPOINTMENT_POPUP, {
      title: attrProperty.title.RESERVED,
      att: 'YES'
    });

    mutateUpdateProductStatus(
      { productId: channel.productId, status: 4, channelId: channel.id },
      {
        async onSuccess() {
          await queryClient.invalidateQueries(
            queryKeys.products.product({ productId: channel.productId })
          );
          await queryClient.invalidateQueries(queryKeys.channels.channel(channelId));
        },
        onSettled() {
          router.back();
        }
      }
    );
  };

  const handleCLickCancel = () => {
    logEvent(attrKeys.channel.CLICK_APPOINTMENT_POPUP, {
      title: attrProperty.title.APPOINTMENT_CANCEL,
      att: 'YES'
    });
    mutateDeleteAppointment(channelId, {
      onSuccess() {
        queryClient.invalidateQueries(queryKeys.channels.channel(channelId));
      },
      onSettled() {
        router.back();
      }
    });
  };

  useEffect(() => {
    if (!channelId) router.push({ pathname: '/channels', query: { type: 0 } });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const findAppointment = channelAppointments?.find(
      ({ isDeleted, type }) => !isDeleted && type !== 'DELETE'
    );

    logEvent(attrKeys.channel.VIEW_APPOINTMENT, { att: findAppointment ? 'EDIT' : 'NEW' });

    if (findAppointment) {
      setParams((prevState) => ({
        ...prevState,
        dateAppointment: findAppointment.dateAppointment.replace(/-|:|\s/g, ''),
        place: findAppointment.place,
        notiTime: findAppointment.notiTime
      }));
    }
  }, [channelAppointments]);

  return (
    <>
      <GeneralTemplate
        header={
          <Header
            onClickLeft={() => router.back()}
            showRight={false}
            customStyle={{ '& > div > div': { borderBottom: `1px solid ${common.line01}` } }}
          >
            <Typography variant="h3" weight="bold">
              직거래 약속
            </Typography>
          </Header>
        }
      >
        <Flexbox
          component="section"
          direction="vertical"
          gap={20}
          customStyle={{ marginTop: 32, flex: 1 }}
        >
          <Flexbox direction="vertical" gap={8}>
            <Typography variant="body1" weight="medium" customStyle={{ color: common.ui60 }}>
              약속 시간
            </Typography>
            <Flexbox gap={8}>
              <TextInput
                type="date"
                variant="outline"
                startAdornment={<Icon name="DateOutlined" size="medium" />}
                customStyle={{ height: 44, padding: 12, columnGap: 12 }}
                min={dayjs().format('YYYY-MM-DD')}
                inputStyle={{
                  width: '100%',
                  minHeight: 22,
                  fontSize: typography.h4.size,
                  lineHeight: typography.h4.lineHeight,
                  textAlign: 'start',
                  color: common.uiWhite,
                  whiteSpace: 'nowrap',
                  height: '100%',
                  '::before': {
                    content: `"${dayjs(params.dateAppointment).format('YYYY.MM.DD')}"`,
                    color: common.ui20
                  }
                }}
                disabled={isLoading}
                value={getAppointmentDataFormat(params.dateAppointment.substring(0, 8))}
                onChange={(e) =>
                  setParams((prevState) => ({
                    ...prevState,
                    dateAppointment: `${e.target.value.replace(
                      /-/g,
                      ''
                    )}${prevState.dateAppointment.substring(8)}`.padEnd(14, '0')
                  }))
                }
              />
              <TextInput
                type="time"
                variant="outline"
                startAdornment={<Icon name="TimeOutlined" size="medium" />}
                customStyle={{ height: 44, padding: 12, columnGap: 12 }}
                inputStyle={{
                  width: '100%',
                  minHeight: 22,
                  fontSize: typography.h4.size,
                  lineHeight: typography.h4.lineHeight,
                  textAlign: 'start',
                  color: common.uiWhite,
                  whiteSpace: 'nowrap',
                  height: '100%',
                  '::before': {
                    content: `"${dayjs(params.dateAppointment).format('A hh:mm')}"`,
                    color: common.ui20
                  }
                }}
                disabled={isLoading}
                value={getAppointmentTimeFormat(params.dateAppointment.substring(8, 14))}
                onChange={(e) =>
                  setParams((prevState) => ({
                    ...prevState,
                    dateAppointment: `${
                      prevState.dateAppointment.substring(0, 8) + e.target.value.replace(/:/g, '')
                    }`.padEnd(14, '0')
                  }))
                }
              />
            </Flexbox>
          </Flexbox>
          <Flexbox direction="vertical" gap={8}>
            <Typography variant="body1" weight="medium" customStyle={{ color: common.ui60 }}>
              장소
            </Typography>
            <TextInput
              variant="outline"
              placeholder="장소를 입력해주세요 (e.g. 서울역 12번 출구)"
              customStyle={{ height: 44, padding: 12 }}
              inputStyle={{
                width: '100%',
                fontSize: typography.h4.size,
                lineHeight: typography.h4.lineHeight
              }}
              disabled={isLoading}
              value={params.place}
              onChange={(e) =>
                setParams((prevState) => ({
                  ...prevState,
                  place: prevState.place.length > 0 ? e.target.value : e.target.value.trim()
                }))
              }
            />
          </Flexbox>
          <Flexbox direction="vertical" gap={8}>
            <Typography variant="body1" weight="medium" customStyle={{ color: common.ui60 }}>
              약속 알림
            </Typography>
            <TextInput
              onClick={() => setOpenAppointmentSelectNotiTimeBottomSheet(true)}
              readOnly
              value={getNotiTimeText(params.notiTime)}
              variant="outline"
              startAdornment={<Icon name="NotiOutlined" size="medium" />}
              endAdornment={
                <Icon
                  name="DropdownFilled"
                  viewBox="0 0 12 24"
                  width="10px"
                  height="20px"
                  customStyle={{ color: common.ui60 }}
                />
              }
              customStyle={{
                padding: 12,
                columnGap: 12,
                height: 44,
                cursor: 'pointer'
              }}
              inputStyle={{
                width: '100%',
                fontSize: typography.h4.size,
                lineHeight: typography.h4.lineHeight,
                cursor: 'pointer'
              }}
              disabled={isLoading}
            />
          </Flexbox>
          {!!appointment && (
            <Flexbox component="section" customStyle={{ marginTop: 12 }}>
              <Button
                variant="ghost"
                size="medium"
                brandColor="black"
                disabled={isLoadingDeleteAppointment}
                onClick={handleClickCancel}
              >
                약속 취소하기
              </Button>
            </Flexbox>
          )}
        </Flexbox>
        <Flexbox component="section" customStyle={{ marginBottom: 20 }}>
          <Button
            size="xlarge"
            variant="solid"
            brandColor="primary"
            fullWidth
            onClick={handleClickDone}
            disabled={
              isLoading ||
              isLoadingUpdateProductStatus ||
              isLoadingCreateAppointment ||
              isLoadingUpdateAppointment ||
              isLoadingDeleteAppointment ||
              params.dateAppointment.length < 14
            }
          >
            완료
          </Button>
        </Flexbox>
      </GeneralTemplate>
      <AppointmentMakeSuccessDialog
        open={open}
        onClose={() => setOpen(false)}
        onClick={handleClick}
      />
      <AppointmentCancelDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onClick={handleCLickCancel}
      />
      <AppointmentSelectNotiTimeBottomSheet
        open={openAppointmentSelectNotiTimeBottomSheet}
        onClose={() => setOpenAppointmentSelectNotiTimeBottomSheet(false)}
        setParams={setParams}
      />
    </>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  Initializer.initAccessTokenByCookies(getCookies({ req }));

  return {
    props: {}
  };
}

export default Appointment;
