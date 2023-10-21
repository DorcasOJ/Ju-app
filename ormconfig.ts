import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';

ConfigModule.forRoot();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.Db_HOST,
  port: +process.env.Db_PORT,
  username: process.env.Db_USERNAME,
  password: process.env.Db_PASSWORD,
  database: process.env.Db_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: ['dist/src/database/migration/*js'],
  synchronize: false,
});
