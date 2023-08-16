import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';

// Set config. Must place before importing ormconfig file
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

import * as ormconfig from './typeorm.config';

import {
  AppSessionOptions,
  CorsOptions,
  DatabaseOptions,
  ENV,
} from './config.model';

const COLOR_MAPPINGS = {
  Reset: '\x1b[0m',
  Bright: '\x1b[1m',
  Dim: '\x1b[2m',
  Underscore: '\x1b[4m',
  Blink: '\x1b[5m',
  Reverse: '\x1b[7m',
  Hidden: '\x1b[8m',

  FgBlack: '\x1b[30m',
  FgRed: '\x1b[31m',
  FgGreen: '\x1b[32m',
  FgYellow: '\x1b[33m',
  FgBlue: '\x1b[34m',
  FgMagenta: '\x1b[35m',
  FgCyan: '\x1b[36m',
  FgWhite: '\x1b[37m',

  BgBlack: '\x1b[40m',
  BgRed: '\x1b[41m',
  BgGreen: '\x1b[42m',
  BgYellow: '\x1b[43m',
  BgBlue: '\x1b[44m',
  BgMagenta: '\x1b[45m',
  BgCyan: '\x1b[46m',
  BgWhite: '\x1b[47m',
};

@Injectable()
export class ConfigService {
  private static envConfig: ENV = (process.env || {}) as unknown as ENV;

  /**
   * Is production mode
   */
  static get isProd(): boolean {
    return ConfigService.envConfig.NODE_ENV === 'production';
  }

  /**
   * Version
   */
  static get version(): string {
    return ConfigService.envConfig.VERSION;
  }

  /**
   * Host
   */
  static get host(): string {
    return ConfigService.envConfig.HOST;
  }

  /**
   * Port
   */
  static get port(): number {
    return ConfigService.envConfig.PORT;
  }

  /**
   * cors
   */
  static get cors(): CorsOptions {
    return {
      origin: ConfigService.envConfig.CORS_ORIGIN,
      headers: ConfigService.envConfig.CORS_HEADERS,
      methods: ConfigService.envConfig.CORS_METHODS,
      expose: ConfigService.envConfig.CORS_EXPOSE,
    };
  }

  /**
   * Bot url
   */
  static get urlDocs(): string {
    return ConfigService.envConfig.URL_DOCS;
  }

  /**
   * Base path
   */
  static get basePath(): string {
    return ConfigService.envConfig.BASE_PATH;
  }

  /**
   * Database config
   */
  static get dbOptions(): DatabaseOptions {
    return {
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'root',
      password: 'root',
      database: 'foodmanagement',
      schema: 'public',
      synchronize: true,
      logging: false,
      cache: false,
      ssl: { rejectUnauthorized: false },
    };
  }

  /**
   * App ID
   */
  static get appId(): string {
    return ConfigService.envConfig.APP_ID;
  }

  /**
   * App Session
   */
  static get appSession(): AppSessionOptions {
    return {
      secret: 'secret',
      expiresIn: 3600,
    };
  }

  static get apiKey(): string {
    return ConfigService.envConfig.CALL_API_KEY_ID;
  }
}
