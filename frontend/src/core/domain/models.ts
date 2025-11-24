export type Route = {
  id: number;
  routeId: string;
  year: number;
  ghgIntensity: number;
  isBaseline: boolean;
};

export type Comparison = {
  ghgIntensity: number;
  percentDiff: number;
  compliant: boolean;
};

export type ShipCompliance = {
  id: number;
  shipId: string;
  year: number;
  cbGco2eq: number;
};

export type BankEntry = {
  id: number;
  shipId: string;
  year: number;
  amountGco2eq: number;
};

