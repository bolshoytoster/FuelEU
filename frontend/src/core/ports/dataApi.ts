import { BankRecord, Comparison, Route, ShipCompliance } from '../domain/models';

export interface DataApiPort {
  getRoutes(): Promise<Route[]>;
  setBaseline(id: string): Promise<undefined>;
  getComparison(): Promise<Comparison[]>;
  getCompliance(): Promise<ShipCompliance[]>;
  getBankRecord(shipId: string, year: string): Promise<BankRecord | undefined>;
}

