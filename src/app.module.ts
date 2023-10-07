import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import entities from './typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AppDataSource } from 'ormconfig';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (ConfigService: ConfigService) => ({
    //     type: 'postgres',
    //     host: ConfigService.get('DB_HOST'),
    //     port: +ConfigService.get<number>('DB_PORT'),
    //     username: ConfigService.get('DB_USERNAME'),
    //     password: ConfigService.get('DB_PASSWORD'),
    //     database: ConfigService.get('DB_NAME'),
    //     entities: entities,
    //     synchronize: true,
    //   }),
    //   inject: [ConfigService],
    // }),
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
