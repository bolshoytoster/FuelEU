export interface Route {
  id: number;
  routeId: string;
  year: number;
  ghgIntensity: number;
  isBaseline: boolean;
}

export interface ShipCompliance {
  id: number;
  shipId: string;
  year: number;
  cbGco2eq: number;
}

export interface BankEntry {
  id: number;
  shipId: string;
  year: number;
  amountGco2eq: number;
}

export interface Pool {
  id: number;
  year: number;
  createdAt: Date;
}

export interface PoolMember {
  poolId: number;
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

