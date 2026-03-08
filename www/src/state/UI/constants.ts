export const APP_MOUNTED = 'UI/APP_MOUNTED';
export const HIDE_SIDE_NAV = 'UI/HIDE_SIDE_NAV';
export const HIDE_THUMBS_DIALOG = 'UI/HIDE_THUMBS_DIALOG';
export const SET_MODAL = 'UI/SET_MODAL';
export const SHOW_SIDE_NAV = 'UI/SHOW_SIDE_NAV';
export const SHOW_THUMBS_DIALOG = 'UI/SHOW_THUMBS_DIALOG';
export const TOGGLE_ACCOUNT_DROPDOWN = 'UI/TOGGLE_ACCOUNT_DROPDOWN';
export const SET_IS_AD_BLOCKED = 'UI/SET_IS_AD_BLOCKED';
export const SET_IS_LISTEN_IN_APP_VISIBLE = 'UI/SET_IS_LISTEN_IN_APP_VISIBLE';
export const HIDE_GROWL = 'UI/HIDE_GROWL';
export const SHOW_GROWL = 'UI/SHOW_GROWL';
export const SET_IS_FSP_OPEN = 'UI/SET_IS_FSP_OPEN';

export enum ConnectedModals {
  AddEmailAndPassword = 'AddEmailAndPassword',
  AddToPlaylist = 'AddToPlaylist',
  Alert = 'Alert',
  Auth = 'Auth',
  CanadaPrivacy = 'CanadaPrivacy',
  Cancel = 'Cancel',
  ChangeEmail = 'ChangeEmail',
  ChangeContactInfo = 'ChangeContactInfo',
  ChangePassword = 'ChangePassword',
  Confirm = 'Confirm',
  CreatePlaylist = 'CreatePlaylist',
  DeviceLimit = 'DeviceLimit',
  DirectToAppStore = 'DirectToAppStore',
  Downgrade = 'Downgrade',
  MobileDirect = 'MobileDirect',
  NewFavorites = 'NewFavorites',
  RemovePlaylist = 'RemovePlaylist',
  Search = 'Search',
  Share = 'Share',
  ThumbsTip = 'ThumbsTip',
  TermsAndConditions = 'TermsAndConditions',
  UnderMaintenance = 'UnderMaintenance',
  Upsell = 'Upsell',
}

export enum ConfirmContexts {
  ForcedLogout = 'ForcedLogout',
  IdleCheck = 'IdleCheck',
  ListenInApp = 'ListenInApp',
}

export enum AlertContexts {
  EmailAndPasswordAdded = 'EmailAndPasswordAdded',
  EmailChanged = 'EmailChanged',
  ContactInfoChanged = 'ContactInfoChanged',
  FamilyPlanFailure = 'FamilyPlanFailure',
  FamilyPlanSuccess = 'FamilyPlanSuccess',
  PasswordChanged = 'PasswordChanged',
  StationUnavailable = 'StationUnavailable',
}
