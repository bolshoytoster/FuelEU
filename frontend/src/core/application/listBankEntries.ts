import { BankEntry } from '../domain/models';
import { DataApiPort } from '../ports/dataApi';

export class ListBankEntriesUseCase {
  constructor(private readonly api: DataApiPort) {}

  execute(): Promise<BankEntry[]> {
    return this.api.getBankEntries();
  }
}

