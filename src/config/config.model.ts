export interface DatabaseOptions {
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string | Uint8Array;
  synchronize: boolean;
  schema: string;
  logging: boolean;
  cache: boolean;
  ssl: { rejectUnauthorized: boolean };
}

export interface CorsOptions {
  origin: string | string[];
  headers: string | string[];
  methods: string | string[];
  expose: string | string[];
}

export interface AppSessionOptions {
  secret: string;
  expiresIn: number;
}

export interface ENV {
  // Common
  VERSION: string;
  HOST: string;
  PORT: number;
  NODE_ENV: string;
  APP_ID: string;

  // Security
  APP_SESSION_EXPIRES_IN: number;

  // Database
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_SCHEMA: string;
  DB_SSL: boolean;

  // TYPEORM
  TYPEORM_CONNECTION: string;
  TYPEORM_HOST: string;
  TYPEORM_PORT: number;
  TYPEORM_USERNAME: string;
  TYPEORM_PASSWORD: string;
  TYPEORM_DATABASE: string;
  TYPEORM_SYNCHRONIZE: boolean;
  TYPEORM_LOGGING: boolean;
  TYPEORM_CACHE: boolean;
  TYPEORM_SCHEMA: string;
  TYPEORM_ENTITIES: string;
  TYPEORM_SUBSCRIBERS: string;
  TYPEORM_MIGRATIONS: string;
  TYPEORM_ENTITIES_DIR: string;
  TYPEORM_MIGRATIONS_DIR: string;
  TYPEORM_SUBSCRIBERS_DIR: string;

  // CORS
  CORS_ORIGIN: string;
  CORS_HEADERS: string;
  CORS_METHODS: string;
  CORS_EXPOSE: string;

  // Urls
  BASE_PATH: string;
  URL_DOCS: string;

  // Logger
  LOG_LEVEL: string;
  LOG_SERVICE_NAME: string;
  LOG_APPENDERS: any;
  LOG_PATH: string;

  // Call
  CALL_API_KEY_ID: string;
  CALL_API_KEY_SECRET: string;
  CALL_CLIENT_TOKEN_LIFETIME: string;
  CALL_INTERNAL_NUMBERS: string;
}
