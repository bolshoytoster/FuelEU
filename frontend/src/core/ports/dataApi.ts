import { BankEntry, Route, ShipCompliance } from '../domain/models';

export interface DataApiPort {
  getRoutes(): Promise<Route[]>;
  getCompliance(): Promise<ShipCompliance[]>;
  getBankEntries(): Promise<BankEntry[]>;
}

