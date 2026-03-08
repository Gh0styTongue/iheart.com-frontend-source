export enum GenderOptions {
  DefaultGenderValue = 'gender.default',
  Male = 'gender.male',
  Female = 'gender.female',
  Unspecified = 'gender.unspecified',
}

export const genderValues = {
  [GenderOptions.DefaultGenderValue]: '',
  [GenderOptions.Female]: 'female',
  [GenderOptions.Male]: 'male',
  [GenderOptions.Unspecified]: 'unspecified',
} as const;

export enum AuthModals {
  ForgotPassword = 'ForgotPassword',
  Login = 'Login',
  RegionNotSupported = 'RegionNotSupported',
  Signup = 'Signup',
}
