export enum PIIBlockingType {
  CCPA = 'CCPA',
  GDPR = 'GDPR',
  PPIPS = 'PPIPS',
}

export type AccountType =
  | 'IHR'
  | 'FACEBOOK'
  | 'IHR_FACEBOOK'
  | 'GOOGLE_PLUS'
  | 'AMAZON'
  | 'TWITTER'
  | 'ANONYMOUS'
  | 'MICROSOFT'
  | 'GOOGLE'
  | 'GIGYA'
  | 'APPLE'
  | null;

export type State = Readonly<{
  accountType?: AccountType;
  billingHistory: [any] | null;
  birthDate?: string | null;
  birthYear?: number | null;
  email?: string | null;
  emailOptOut?: boolean | null;
  error?: any;
  facebookId?: string | null;
  favorites?: {
    [a: string]: any;
  } | null;
  firstError?: any;
  gender?: string | null;
  googlePlusId?: string | null;
  iheartId?: string | null;
  invoices?: Array<any>;
  isUnderAge?: boolean;
  marketName?: string | null;
  name?: string | null;
  piiBlockingTypes: Array<PIIBlockingType>;
  preferences: {
    [a: string]: any;
  };
  profileReceived: boolean;
  roaming?: boolean | null;
  shareProfile?: any;
  timeZone?: string;
  zipCode?: string | null;
  alexaIOSLinkSuccessful?: boolean;
}>;

type Pricing = {
  currency: string;
  taxInCents: number;
  totalInCents: number;
  discountInCents: number;
  subtotalInCents: number;
};

type Adjustments = {
  description: string;
  endDate: number;
  pricing: Pricing;
  startDate: number;
};

export type Invoice = Readonly<{
  adjustments: [Adjustments];
  dueDate: number;
  id: number;
  pricing: Pricing;
  state: string;
  uuid: string;
}>;
