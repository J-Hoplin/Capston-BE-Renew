import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from '@nestjs/config';
import emailConfig from '@src/config/config/email.config';

@Module({
  imports: [ConfigModule.forFeature(emailConfig)],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
