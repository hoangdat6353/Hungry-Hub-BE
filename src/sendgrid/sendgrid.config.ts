import { Injectable } from '@nestjs/common';

@Injectable()
export class SendgridConfig {
  apiKey: string;

  constructor() {
    this.apiKey = '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';
  }
}