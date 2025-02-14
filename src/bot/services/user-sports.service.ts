import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSports } from '../../entities/users-sport.entity';

// user-sports.service.ts
@Injectable()
export class UserSportsService {
    constructor(
        @InjectRepository(UserSports)
        private readonly userSportsRepo: Repository<UserSports>,
      ) {}

  // "Найти или создать" запись для userId
   public async findOrCreate(userId: number): Promise<UserSports> {
    let userSports = await this.userSportsRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!userSports) {
      userSports = this.userSportsRepo.create({ user: { id: userId } });
      userSports = await this.userSportsRepo.save(userSports);
    }
    return userSports;
  }
  async getSubscriptions(userId: number): Promise<{ football: boolean, basketball: boolean, box: boolean, ufc: boolean }> {
    const userSports = await this.findOrCreate(userId);
    return {
      football: userSports.football,
      basketball: userSports.basketball,
      box: userSports.box,
      ufc: userSports.ufc,
    };
  }
  async updateUserSport(userId: number, categoryId: number, isYes: boolean) {
    const userSports = await this.findOrCreate(userId);

    switch (categoryId) {
      case 1: // football
        userSports.football = isYes;
        break;
      case 2: // basketball
        userSports.basketball = isYes;
        break;
      case 3: // box
        userSports.box = isYes;
        break;
      case 4: // ufc
        userSports.ufc = isYes;
        break;
      default:
        console.log(`Неизвестный categoryId=${categoryId}, пропускаем`);
    }

    await this.userSportsRepo.save(userSports);
  }
}
