import { Module } from '@nestjs/common';
import { SendgridConfig } from './sendgrid.config';
import { SendgridService } from './sendgrid.service';


@Module({
  providers: [SendgridService, SendgridConfig],
  exports: [SendgridService],
})
export class SendgridModule {}