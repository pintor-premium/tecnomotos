export abstract class ContingencyService {
  /**
   * Enters offline contingency mode for NFC-e.
   * Returns NOT_IMPLEMENTED placeholder until compliance checks are validated.
   */
  abstract enterContingency(): Promise<{ success: boolean; message: string }>;
}

export class DefaultContingencyService extends ContingencyService {
  async enterContingency(): Promise<{ success: boolean; message: string }> {
    console.log('[ContingencyService] Offline contingency entry requested.');
    return {
      success: false,
      message:
        'NOT_IMPLEMENTED: O comportamento de contingência offline não está ativo ou homologado nesta etapa.',
    };
  }
}
