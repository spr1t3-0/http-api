import path from 'node:path';
import fs from 'node:fs/promises';
import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import mjml from 'mjml';
import createEmail from '..';

jest.mock('node:path', () => ({ join: jest.fn() }));
jest.mock('node:fs/promises', () => ({ readFile: jest.fn() }));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue(null),
  }),
}));

jest.mock('handlebars', () => ({ compile: jest.fn() }));
jest.mock('mjml', () => jest.fn().mockReturnValue({ html: 'mock html' }));

const mockPathJoin = (path.join as unknown) as jest.Mock;
const mockReadFile = (fs.readFile as unknown) as jest.Mock;
const mockCreateTransport = (nodemailer.createTransport as unknown) as jest.Mock;
const mockHandlebarsCompile = (Handlebars.compile as unknown) as jest.Mock;
const mockMjml = (mjml as unknown) as jest.Mock;

const mockHandlebarsTemplate = jest.fn();
beforeEach(() => {
  mockPathJoin.mockReturnValue('/mock/path');
  mockReadFile.mockResolvedValue('mock mjml file contents');
  mockCreateTransport.mockReturnValue({
    sendMail: jest.fn().mockResolvedValue(null),
  });
  mockHandlebarsTemplate.mockReturnValue('mock compiled handlebars template');
  mockHandlebarsCompile.mockReturnValue(mockHandlebarsTemplate);
  mockMjml.mockReturnValue({ html: 'mock html' });
});

test('Returns object of send functions', async () => expect(createEmail()).resolves.toMatchObject({
  verify: expect.any(Function),
}));
