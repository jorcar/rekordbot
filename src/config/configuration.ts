// parseInt(process.env.PORT, 10)

export interface DatabaseConfig {
  type: 'postgres';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
}

export interface StravaConfig {
  client_id: number;
  client_secret: string;
  oauth_redirect_uri: string;
  webhook_url: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface Config {
  jwt: JwtConfig;
  database: DatabaseConfig;
  strava: StravaConfig;
}

const test: Config = {
  jwt: {
    secret: 'asd',
    expiresIn: '8d',
  },
  database: {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '',
    database: 'my_database',
    synchronize: true, // TODO: deal with this for production
  },
  strava: {
    client_id: 27973,
    client_secret: 'bfb397cb3618f6df91fa939456ce39f7864eb3ae',
    oauth_redirect_uri: 'http://localhost:3000/auth/strava/callback',
    webhook_url: 'https://ewe-engaged-nationally.ngrok-free.app/strava/webhook',
  },
};

export function toConnectionString(config: DatabaseConfig): string {
  return `postgres://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
}

export default (): Config => {
  if (process.env.NODE_ENV !== 'production') {
    return test;
  } else throw new Error('Invalid NODE_ENV');
};
