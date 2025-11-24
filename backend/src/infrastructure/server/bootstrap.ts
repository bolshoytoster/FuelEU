import { buildHttpServer } from '../../adapters/inbound/http/httpServer';
import {
  PostgresBankEntriesRepository,
  PostgresRoutesRepository,
  PostgresShipComplianceRepository
} from '../../adapters/outbound/postgres/repositories';
import { ComparisonService } from '../../core/application/comparisonService';
import { ListBankEntriesService } from '../../core/application/listBankEntriesService';
import { ListComplianceService } from '../../core/application/listComplianceService';
import { ListRoutesService } from '../../core/application/listRoutesService';
import { SetBaselineService } from '../../core/application/setBaselineService';
import { createPostgresPool } from '../db/postgresClient';
import { serverConfig } from '../../shared/config';

export const startServer = async () => {
  const pool = createPostgresPool();

  const listRoutesService = new ListRoutesService(
    new PostgresRoutesRepository(pool)
  );

  const setBaselineService = new SetBaselineService(
    new PostgresRoutesRepository(pool)
  );

  const comparisonService = new ComparisonService(
    new PostgresRoutesRepository(pool)
  );

  const listComplianceService = new ListComplianceService(
    new PostgresShipComplianceRepository(pool)
  );

  const listBankEntriesService = new ListBankEntriesService(
    new PostgresBankEntriesRepository(pool)
  );

  const app = buildHttpServer({
    listRoutesService,
    setBaselineService,
    comparisonService,
    listComplianceService,
    listBankEntriesService
  });

  return new Promise<void>((resolve, reject) => {
    app
      .listen(serverConfig.port, serverConfig.host, () => {
        // eslint-disable-next-line no-console
        console.log(
          `HTTP server listening on http://${serverConfig.host}:${serverConfig.port}`
        );
        resolve();
      })
      .on('error', reject);
  });
};

