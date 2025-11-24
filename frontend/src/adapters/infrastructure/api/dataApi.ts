import { apiConfig } from '@shared/config';
import { BankEntry, Comparison, Route, ShipCompliance } from '@core/domain/models';
import { DataApiPort } from '@core/ports/dataApi';

const httpGet = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${apiConfig.baseUrl}${path}`);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Request to ${path} failed with status ${response.status} (${body})`
    );
  }

  return (await response.json()) as T;
};

export const createDataApi = (): DataApiPort => ({
  getRoutes: () => httpGet<Route[]>('/routes'),
  getComparison: () => httpGet<Comparison[]>('/routes/comparison'),
  getCompliance: () => httpGet<ShipCompliance[]>('/compliance'),
  getBankEntries: () => httpGet<BankEntry[]>('/banking')
});

