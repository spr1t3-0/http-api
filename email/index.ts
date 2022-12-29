import path from 'node:path';
import fs from 'node:fs/promises';
import nodemailer, { SentMessageInfo } from 'nodemailer';
import Handlebars from 'handlebars';
import mjml from 'mjml';
import {
  EMAIL_FROM,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
} from '../env';

const TEMPLATE_PATH = path.join(__dirname, 'templates');
const INCLUDES_PATH = path.join(__dirname, 'includes');

const TEMPLATE_NAMES: Array<keyof Emails> = [
  'verify',
];

type SendEmail<ViewData> = (viewData: ViewData) => Promise<SentMessageInfo>;
export interface Emails {
  verify: SendEmail<{ verifyUrl: string }>;
}

export default async function createEmail(): Promise<Emails> {
  const transport = nodemailer.createTransport({
    secure: true,
    host: SMTP_HOST,
    port: SMTP_PORT,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });

  async function compileTemplate<ViewData>(templateName: string) {
    const templatePath = path.join(TEMPLATE_PATH, `${templateName}.mjml.hbs`);
    const contents = await fs.readFile(templatePath, 'utf-8');
    const template = Handlebars.compile<ViewData>(contents);

    return async (to: string, viewData: ViewData) => transport.sendMail({
      to,
      from: EMAIL_FROM,
      html: mjml(template(viewData), { filePath: INCLUDES_PATH }).html,
    });
  }

  return Object.fromEntries(await Promise.all(TEMPLATE_NAMES
    .map(name => compileTemplate(name)
      .then(send => [name, send]))));
}
