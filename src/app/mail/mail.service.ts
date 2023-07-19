import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import emailConfig from '@src/config/config/email.config';
import Mail = require('nodemailer/lib/mailer');
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Mail;
  constructor(
    @Inject(emailConfig.KEY)
    private readonly config: ConfigType<typeof emailConfig>,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.id,
        pass: config.pw,
      },
    });
  }

  public async sendMail(to: string, subject: string, html: string) {
    try {
      this.transporter.sendMail({
        to,
        subject,
        html,
      });
      return true;
    } catch (err) {
      return false;
    }
  }
}
