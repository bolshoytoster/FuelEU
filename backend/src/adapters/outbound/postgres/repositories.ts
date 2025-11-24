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
  year: number;
  ghg_intensity: number | string;
  is_baseline: boolean;
};

type ShipComplianceRow = {
  id: number;
  ship_id: string;
  year: number;
  cb_gco2eq: number | string;
};

type BankEntryRow = {
  id: number;
  ship_id: string;
  year: number;
  amount_gco2eq: number | string;
};

const toNumber = (value: number | string): number =>
  typeof value === 'number' ? value : Number(value);

export class PostgresRoutesRepository implements RoutesRepository {
  constructor(private readonly pool: Pool) {}

  async listRoutes(): Promise<Route[]> {
    const query = `
      SELECT id, route_id, year, ghg_intensity, is_baseline
      FROM routes
      ORDER BY year DESC, route_id ASC
    `;
    const { rows } = await this.pool.query<RouteRow>(query);
    return rows.map((row) => ({
      id: row.id,
      routeId: row.route_id,
      year: row.year,
      ghgIntensity: toNumber(row.ghg_intensity),
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
      ORDER BY year DESC, ship_id ASC
    `;
    const { rows } = await this.pool.query<ShipComplianceRow>(query);
    return rows.map((row) => ({
      id: row.id,
      shipId: row.ship_id,
      year: row.year,
      cbGco2eq: toNumber(row.cb_gco2eq)
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
      ORDER BY year DESC, ship_id ASC
    `;
    const { rows } = await this.pool.query<BankEntryRow>(query);
    return rows.map((row) => ({
      id: row.id,
      shipId: row.ship_id,
      year: row.year,
      amountGco2eq: toNumber(row.amount_gco2eq)
    }));
  }
}

