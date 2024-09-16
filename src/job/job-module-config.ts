import { RetryOptions } from 'pg-boss';

export class JobsModuleConfig {
  connectionString: string;
  maxNumberConnections: number;
}

export const default_retry_options: RetryOptions = {
  retryLimit: 1000,
  retryDelay: 5,
  retryBackoff: true,
};
