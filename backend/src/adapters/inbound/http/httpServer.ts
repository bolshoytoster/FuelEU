import express, { NextFunction, Request, Response } from 'express';
import { ApplyBankedSurplusService } from '../../../core/application/applyBankedSurplusService';
import { BankSurplusService } from '../../../core/application/bankSurplusService';
import { ComparisonService } from '../../../core/application/comparisonService';
import { GetComplianceBalanceService } from '../../../core/application/getComplianceBalanceService';
import { ListBankEntriesService } from '../../../core/application/listBankEntriesService';
import { ListBankHistoryService } from '../../../core/application/listBankHistoryService';
import { ListRoutesService } from '../../../core/application/listRoutesService';
import { SetBaselineService } from '../../../core/application/setBaselineService';

export interface HttpServerDependencies {
  listRoutesService: ListRoutesService;
  setBaselineService: SetBaselineService;
  comparisonService: ComparisonService;
  getComplianceBalanceService: GetComplianceBalanceService;
  listBankEntriesService: ListBankEntriesService;
  bankSurplusService: BankSurplusService;
  applyBankedSurplusService: ApplyBankedSurplusService;
  listBankHistoryService: ListBankHistoryService;
}

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

const wrap =
  (handler: AsyncHandler) => (req: Request, res: Response, next: NextFunction) =>
    handler(req, res, next).catch(next);

export const buildHttpServer = ({
  listRoutesService,
  setBaselineService,
  comparisonService,
  getComplianceBalanceService,
  listBankEntriesService,
  bankSurplusService,
  applyBankedSurplusService,
  listBankHistoryService
}: HttpServerDependencies) => {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());

  app.get(
    '/routes',
    wrap(async (_req, res) => {
      const routes = await listRoutesService.execute();
      res.json(routes);
    })
  );

  app.post(
    '/routes/:routeId/baseline',
    wrap(async (req, res) => {
      await setBaselineService.execute(req.params.routeId);
      res.sendStatus(200);
    })
  );

  app.get(
    '/routes/comparison',
    wrap(async (_req, res) => {
      const routes = await comparisonService.execute();
      res.json(routes);
    })
  );

  app.get(
    '/compliance/cb',
    wrap(async (req, res) => {
      if (typeof req.query.shipId == 'string' && typeof req.query.year == 'string') {
        const compliance = await getComplianceBalanceService.execute(
          req.query.shipId,
          req.query.year
        );
        res.json(compliance);
      } else
        res.sendStatus(400);
    })
  );

  app.get(
    '/banking',
    wrap(async (_req, res) => {
      const entries = await listBankEntriesService.execute();
      res.json(entries);
    })
  );

  app.post(
    '/banking/bank',
    wrap(async (req, res) => {
      const { shipId, year } = req.body ?? {};
      if (typeof shipId !== 'string' || typeof year !== 'string') {
        res.sendStatus(400);
        return;
      }

      const result = await bankSurplusService.execute(shipId, year);
      if (!result) {
        res.sendStatus(404);
        return;
      }

      res.json(result);
    })
  );

  app.post(
    '/banking/apply',
    wrap(async (req, res) => {
      const { shipId, year } = req.body ?? {};
      if (typeof shipId !== 'string' || typeof year !== 'string') {
        res.sendStatus(400);
        return;
      }

      const result = await applyBankedSurplusService.execute(shipId, year);
      if (!result) {
        res.sendStatus(404);
        return;
      }

      res.json(result);
    })
  );

  app.get(
    '/banking/history',
    wrap(async (req, res) => {
      if (typeof req.query.shipId !== 'string') {
        res.sendStatus(400);
        return;
      }

      const entries = await listBankHistoryService.execute(req.query.shipId);
      res.json(entries);
    })
  );

  app.use(
    (
      err: Error,
      _req: Request,
      res: Response,
      _next: NextFunction
    ) => {
      // eslint-disable-next-line no-console
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  );

  return app;
};

