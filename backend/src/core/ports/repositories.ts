import { BankEntry, Route, ShipCompliance } from '../domain/models';

export interface RoutesRepository {
  listRoutes(): Promise<Route[]>;
}

export interface ShipComplianceRepository {
  listCompliance(): Promise<ShipCompliance[]>;
}

export interface BankEntriesRepository {
  listEntries(): Promise<BankEntry[]>;
}

