import { BankEntry, ComplianceBalance, Route } from '../domain/models';

export interface RoutesRepository {
  listRoutes(): Promise<Route[]>;
  setBaseline(routeId: string): Promise<undefined>;
}

export interface BankingRepository {
  getComplianceBalance(shipId: string, year: string): Promise<ComplianceBalance | undefined>;
  bankSurplus(shipId: string, year: string): Promise<ComplianceBalance | undefined>;
  applyBankedSurplus(shipId: string, year: string): Promise<ComplianceBalance | undefined>;
}

export interface BankEntriesRepository {
  listEntries(): Promise<BankEntry[]>;
}

