import { ShipCompliance } from '../domain/models';
import { ShipComplianceRepository } from '../ports/repositories';

export class ListComplianceService {
  constructor(
    private readonly complianceRepository: ShipComplianceRepository
  ) {}

  async execute(): Promise<ShipCompliance[]> {
    return this.complianceRepository.listCompliance();
  }
}

