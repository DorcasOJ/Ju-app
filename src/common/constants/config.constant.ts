import { encodePassword } from 'src/utils/bcrypt';
export const configConstant = {
  database: {
    host: 'DB_HOST',
    port: 'DB_PORT',
    username: 'DB_USERNAME',
    password: 'DB_PASSWORD',
    name: 'DB_NAME',
  },
  httpModule: {
    timeout: 'HTTP_TIMEOUT',
    maxRedirects: 'HTTP_MAX_REDIRECTS',
  },
  profileUrl: {
    baseUrl: 'CORE_SERVICE_BASE_URL',
  },
};
