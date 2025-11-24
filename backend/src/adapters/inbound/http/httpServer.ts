import express, { NextFunction, Request, Response } from 'express';
import { ComparisonService } from '../../../core/application/comparisonService';
import { ListBankEntriesService } from '../../../core/application/listBankEntriesService';
import { ListComplianceService } from '../../../core/application/listComplianceService';
import { ListRoutesService } from '../../../core/application/listRoutesService';
import { SetBaselineService } from '../../../core/application/setBaselineService';

export interface HttpServerDependencies {
  listRoutesService: ListRoutesService;
  setBaselineService: SetBaselineService;
  comparisonService: ComparisonService;
  listComplianceService: ListComplianceService;
  listBankEntriesService: ListBankEntriesService;
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
  listComplianceService,
  listBankEntriesService
}: HttpServerDependencies) => {
  const app = express();
  app.disable('x-powered-by');

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
    '/compliance',
    wrap(async (_req, res) => {
      const compliance = await listComplianceService.execute();
      res.json(compliance);
    })
  );

  app.get(
    '/banking',
    wrap(async (_req, res) => {
      const entries = await listBankEntriesService.execute();
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

