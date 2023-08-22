import { Injectable } from '@nestjs/common';

@Injectable()
export class SendgridConfig {
  apiKey: string;

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY;
  }
}
