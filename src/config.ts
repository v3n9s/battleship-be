import 'dotenv/config';
import Ajv, { JSONSchemaType } from 'ajv';

const ajv = new Ajv({ allErrors: true, coerceTypes: true, useDefaults: true });

interface Config {
  port: number;
}

const configSchema: JSONSchemaType<Config> = {
  type: 'object',
  properties: {
    port: {
      type: 'number',
      minimum: 1024,
      maximum: 65535,
      default: 3000,
    },
  },
  required: ['port'],
};

const config = {
  port: process.env.PORT,
};

const validate = ajv.compile(configSchema);

if (!validate(config)) {
  console.error(
    ajv.errorsText(validate.errors, { dataVar: 'config', separator: '\n' }),
  );
  throw new Error('Dotenv validation error');
}

export default config as Config;
