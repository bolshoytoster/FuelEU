import { Pool } from 'pg';
import { BankEntry, Route, ShipCompliance } from '../../../core/domain/models';
import {
  BankEntriesRepository,
  RoutesRepository,
  ShipComplianceRepository
} from '../../../core/ports/repositories';

type RouteRow = {
  id: number;
  route_id: string;
  // TODO: would these two be better as enums?
  vessel_type: string;
  fuel_type: string;
  year: number;
  ghg_intensity: number;
  fuel_consumption: number;
  distance: number;
  total_emissions: number;
  is_baseline: boolean;
};

type ShipComplianceRow = {
  id: number;
  ship_id: string;
  year: number;
  cb_gco2eq: number;
};

type BankEntryRow = {
  id: number;
  ship_id: string;
  year: number;
  amount_gco2eq: number;
};

export class PostgresRoutesRepository implements RoutesRepository {
  constructor(private readonly pool: Pool) {}

  async listRoutes(): Promise<Route[]> {
    const { rows } = await this.pool.query<RouteRow>(`SELECT * FROM routes`);
    return rows.map((row) => ({
      id: row.id,
      routeId: row.route_id,
      vesselType: row.vessel_type,
      fuelType: row.fuel_type,
      year: row.year,
      ghgIntensity: row.ghg_intensity,
      fuelConsumption: row.fuel_consumption,
      distance: row.distance,
      totalEmissions: row.total_emissions,
      isBaseline: row.is_baseline
    }));
  }
}

export class PostgresShipComplianceRepository
  implements ShipComplianceRepository
{
  constructor(private readonly pool: Pool) {}

  async listCompliance(): Promise<ShipCompliance[]> {
    const query = `
      SELECT id, ship_id, year, cb_gco2eq
      FROM ship_compliance
    `;
    const { rows } = await this.pool.query<ShipComplianceRow>(query);
    return rows.map((row) => ({
      id: row.id,
      shipId: row.ship_id,
      year: row.year,
      cbGco2eq: row.cb_gco2eq
    }));
  }
}

export class PostgresBankEntriesRepository
  implements BankEntriesRepository
{
  constructor(private readonly pool: Pool) {}

  async listEntries(): Promise<BankEntry[]> {
    const query = `
      SELECT id, ship_id, year, amount_gco2eq
      FROM bank_entries
    `;
    const { rows } = await this.pool.query<BankEntryRow>(query);
    return rows.map((row) => ({
      id: row.id,
      shipId: row.ship_id,
      year: row.year,
      amountGco2eq: row.amount_gco2eq
    }));
  }
}

