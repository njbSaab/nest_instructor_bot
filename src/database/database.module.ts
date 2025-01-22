import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuTable } from '../entities/menu-tables.entity';
import { MenuButton } from '../entities/menu-button.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MenuTable, MenuButton, User]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}