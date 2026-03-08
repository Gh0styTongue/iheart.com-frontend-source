import COUNTRY_CODES from 'constants/countryCodes';
import getCountry from 'utils/getCountry';
import {
  APP_MOUNTED,
  ConnectedModals,
  HIDE_GROWL,
  HIDE_SIDE_NAV,
  SET_IS_AD_BLOCKED,
  SET_IS_FSP_OPEN,
  SET_IS_LISTEN_IN_APP_VISIBLE,
  SET_MODAL,
  SHOW_GROWL,
  SHOW_SIDE_NAV,
  TOGGLE_ACCOUNT_DROPDOWN,
} from './constants';
import { AuthModals } from 'components/Auth/constants';
import { getTranslateFunction } from 'state/i18n/helpers';
import { GrowlVariants } from 'components/Growls/constants';
import { moreSkipsUpsellSelector } from 'state/Entitlements/selectors';
import type { GrowlConfigMap } from 'components/Growls/types';
import type { ModalContext, ModalStateMap } from './types';
import type { Thunk } from 'state/types';

type GrowlData<T extends GrowlVariants> = GrowlConfigMap[T]['data'];

export function setIsFSPOpen(isFSPOpen: boolean) {
  return {
    type: SET_IS_FSP_OPEN,
    payload: isFSPOpen,
  };
}

export function showGrowl<T extends GrowlVariants>(
  growl: Omit<GrowlConfigMap[T], 'id'>,
) {
  return { type: SHOW_GROWL, payload: growl };
}

export function hideGrowl(growlId: string) {
  return { type: HIDE_GROWL, payload: growlId };
}

export function showNotifyGrowl(data: GrowlData<GrowlVariants.Notify>) {
  return showGrowl({
    type: GrowlVariants.Notify,
    data,
  });
}

export function showOutOfSkipsGrowl() {
  return showGrowl({
    type: GrowlVariants.OutOfSkips,
    data: null,
  });
}

export function showPlayerErrorGrowl(
  data: GrowlData<GrowlVariants.PlayerError>,
) {
  return showGrowl({
    type: GrowlVariants.PlayerError,
    data,
  });
}

export function showFavoriteChangedGrowl(
  data: GrowlData<GrowlVariants.FavoriteChanged>,
) {
  return showGrowl({
    type: GrowlVariants.FavoriteChanged,
    data,
  });
}

export function showFollowedChangedGrowl(
  data: GrowlData<GrowlVariants.FollowedChanged>,
) {
  return showGrowl({
    type: GrowlVariants.FollowedChanged,
    data,
  });
}

export function showPlaylistFollowedGrowl(
  data: GrowlData<GrowlVariants.PlaylistFollowed>,
) {
  return showGrowl({
    type: GrowlVariants.PlaylistFollowed,
    data,
  });
}

export function setIsListenInAppVisible(isVisible: boolean) {
  return { type: SET_IS_LISTEN_IN_APP_VISIBLE, payload: isVisible };
}

export function showSideNav() {
  return { type: SHOW_SIDE_NAV };
}

export function hideSideNav() {
  return { type: HIDE_SIDE_NAV };
}

export function appMounted() {
  return { type: APP_MOUNTED };
}

export function toggleAccountDropdown(showingAccountDropdown: boolean) {
  return {
    payload: showingAccountDropdown,
    type: TOGGLE_ACCOUNT_DROPDOWN,
  };
}

export function openModal<K extends ConnectedModals>(modal: ModalStateMap[K]) {
  return {
    type: SET_MODAL,
    payload: modal,
  };
}

export function closeModal() {
  return {
    type: SET_MODAL,
    payload: {
      id: null,
      context: null,
    },
  };
}

export function setIsAdBlocked(isAdBlocked: boolean) {
  return {
    type: SET_IS_AD_BLOCKED,
    payload: isAdBlocked,
  };
}

export const openRemovePlaylistModal = (
  context: ModalContext<ConnectedModals.RemovePlaylist>,
) =>
  openModal<ConnectedModals.RemovePlaylist>({
    id: ConnectedModals.RemovePlaylist,
    context,
  });

export function openThumbsTip(
  context: ModalContext<ConnectedModals.ThumbsTip>,
) {
  return openModal<ConnectedModals.ThumbsTip>({
    id: ConnectedModals.ThumbsTip,
    context,
  });
}

export function openAuthModal(context: ModalContext<ConnectedModals.Auth>) {
  return openModal<ConnectedModals.Auth>({
    id: ConnectedModals.Auth,
    context,
  });
}

export function openSignupModal(
  trackingContext?: ModalContext<ConnectedModals.Auth>['trackingContext'],
) {
  return openAuthModal({
    modal:
      getCountry() === COUNTRY_CODES.WW ?
        AuthModals.RegionNotSupported
      : AuthModals.Signup,
    trackingContext,
  });
}

export function openLoginModal(
  trackingContext?: ModalContext<ConnectedModals.Auth>['trackingContext'],
) {
  return openAuthModal({
    modal: AuthModals.Login,
    trackingContext,
  });
}

export function openForgotPasswordModal(
  trackingContext?: ModalContext<ConnectedModals.Auth>['trackingContext'],
) {
  return openAuthModal({
    modal: AuthModals.ForgotPassword,
    trackingContext,
  });
}

export function openUpsellModal(context: ModalContext<ConnectedModals.Upsell>) {
  return openModal<ConnectedModals.Upsell>({
    id: ConnectedModals.Upsell,
    context,
  });
}

export function openTermsAndConditionsModal(
  context: ModalContext<ConnectedModals.TermsAndConditions>,
) {
  return openModal<ConnectedModals.TermsAndConditions>({
    id: ConnectedModals.TermsAndConditions,
    context,
  });
}

export function showMaxSkipWarning(): Thunk<void> {
  return (dispatch, getState) => {
    const state = getState();
    if (!moreSkipsUpsellSelector(state)) {
      dispatch(showOutOfSkipsGrowl());
    }
  };
}

export function showPlaybackNetworkErrorGrowl(): Thunk<void> {
  return (dispatch, getState) => {
    const translate = getTranslateFunction(getState());
    dispatch(
      showNotifyGrowl({
        title: translate(
          'There was an issue playing the audio, please check your connection and try again.',
        ),
        sticky: true,
      }),
    );
  };
}

export function showNetworkErrorGrowl(): Thunk<void> {
  return (dispatch, getState) => {
    const translate = getTranslateFunction(getState());
    dispatch(
      showNotifyGrowl({
        title: translate(
          'There was a connection problem. Please reconnect and try again.',
        ),
        sticky: true,
      }),
    );
  };
}
