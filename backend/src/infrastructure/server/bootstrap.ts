import { buildHttpServer } from '../../adapters/inbound/http/httpServer';
import {
  PostgresBankEntriesRepository,
  PostgresBankingRepository,
  PostgresRoutesRepository,
} from '../../adapters/outbound/postgres/repositories';
import { ApplyBankedSurplusService } from '../../core/application/applyBankedSurplusService';
import { BankSurplusService } from '../../core/application/bankSurplusService';
import { ComparisonService } from '../../core/application/comparisonService';
import { GetComplianceBalanceService } from '../../core/application/getComplianceBalanceService';
import { ListBankEntriesService } from '../../core/application/listBankEntriesService';
import { ListRoutesService } from '../../core/application/listRoutesService';
import { SetBaselineService } from '../../core/application/setBaselineService';
import { createPostgresPool } from '../db/postgresClient';
import { serverConfig } from '../../shared/config';

export const startServer = async () => {
  const pool = createPostgresPool();

  const routesRepository = new PostgresRoutesRepository(pool);
  const bankingRepository = new PostgresBankingRepository(pool);

  const listRoutesService = new ListRoutesService(routesRepository);

  const setBaselineService = new SetBaselineService(routesRepository);

  const comparisonService = new ComparisonService(routesRepository);

  const getComplianceBalanceService = new GetComplianceBalanceService(
    bankingRepository
  );

  const bankSurplusService = new BankSurplusService(
    bankingRepository
  );

  const applyBankedSurplusService = new ApplyBankedSurplusService(
    bankingRepository
  );

  const listBankEntriesService = new ListBankEntriesService(
    new PostgresBankEntriesRepository(pool)
  );

  const app = buildHttpServer({
    listRoutesService,
    setBaselineService,
    comparisonService,
    getComplianceBalanceService,
    listBankEntriesService,
    bankSurplusService,
    applyBankedSurplusService
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

