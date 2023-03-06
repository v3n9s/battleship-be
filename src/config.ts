import 'dotenv/config';
import Ajv, { JSONSchemaType } from 'ajv';

const ajv = new Ajv.default({
  allErrors: true,
  coerceTypes: true,
  useDefaults: true,
});

interface Config {
  port: number;
  jwtSecret: string;
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
    jwtSecret: {
      type: 'string',
    },
  },
  required: ['port', 'jwtSecret'],
};

const config = {
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
};

const validate = ajv.compile(configSchema);

if (!validate(config)) {
  console.error(
    ajv.errorsText(validate.errors, { dataVar: 'config', separator: '\n' }),
  );
  throw new Error('Dotenv validation error');
}

export default config as Config;
