import { Injectable } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';
import { SendgridConfig } from './sendgrid.config';

@Injectable()
export class SendgridService {
  constructor(private readonly sendgridConfig: SendgridConfig) {
    SendGrid.setApiKey(this.sendgridConfig.apiKey);
  }

  async sendMail(mail: SendGrid.MailDataRequired) {

    const transport = await SendGrid.send(mail);
    // avoid this on production. use log instead :)
    console.log(`E-Mail sent to ${mail.to}`);
    return transport;
  }
}
