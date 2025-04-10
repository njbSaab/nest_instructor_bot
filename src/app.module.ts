import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'; 
import { BotModule } from './bot/bot.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { ApiModule } from './api/api.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const dbConfig = {
          type: 'mysql' as const, // Явно указываем литерал "mysql"
          host: configService.get<string>('DB_HOST'),
          port: +configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          entities: [__dirname + '/**/*.entity.{js,ts}'],
          synchronize: true, // Установите false в продакшене
        };
        console.log('Database Config:', dbConfig); // Отладка
        return dbConfig;
      },
      inject: [ConfigService],
    }),
    DatabaseModule,
    BotModule,
    UsersModule,
    ApiModule,
  ],
})

export class AppModule implements OnModuleInit {
  onModuleInit() {
    console.log('[AppModule] Все модули инициализированы успешно.');
  }
}