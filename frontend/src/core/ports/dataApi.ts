import { BankEntry, Comparison, Route, ShipCompliance } from '../domain/models';

export interface DataApiPort {
  getRoutes(): Promise<Route[]>;
  getComparison(): Promise<Comparison[]>;
  getCompliance(): Promise<ShipCompliance[]>;
  getBankEntries(): Promise<BankEntry[]>;
}

