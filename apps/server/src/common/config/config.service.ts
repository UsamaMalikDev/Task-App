import { parse } from 'dotenv';
import * as fs from 'fs';
import * as Joi from 'joi';   // ✅ FIXED import
import { APP_ENV } from './config.types';

export interface EnvConfig {
  [key: string]: string;
}

export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor(filePath: string) {
    const config = parse(fs.readFileSync(filePath));
    this.envConfig = ConfigService.validateInput(config);
  }

  private static validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema = Joi.object({
      APP_ENV: Joi.string()
        .valid(APP_ENV.dev, APP_ENV.prod, APP_ENV.local, APP_ENV.migration)
        .default(APP_ENV.dev),

      APP_URL: Joi.string().uri({ scheme: [/https?/] }),

      WEBTOKEN_SECRET_KEY: Joi.string().required(),
      WEBTOKEN_EXPIRATION_TIME: Joi.number().default(86400000), // 24 hours in ms
      DB_URL: Joi.string().regex(/^mongodb/),
    });

    const { error, value: validatedEnvConfig } = envVarsSchema.validate(envConfig, {
      allowUnknown: true,
    });

    if (error) throw new Error(`Config validation error: ${error.message}`);

    return validatedEnvConfig;
  }

  get(key: string): string {
    return this.envConfig[key];
  }

  isEnv(env: string): boolean {
    return this.envConfig.APP_ENV === env;
  }
}
