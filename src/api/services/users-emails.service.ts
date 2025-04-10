// src/users-emails/users-emails.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEmailMessage } from '../../entities/user-email-message.entity';
import { User } from '../../entities/user.entity';
import { SaveEmailMessageDto } from '../dto/save-email-message.dto';

@Injectable()
export class UsersEmailsService {
  constructor(
    @InjectRepository(UserEmailMessage)
    private readonly emailMessageRepository: Repository<UserEmailMessage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async saveEmailMessages(messages: SaveEmailMessageDto[]): Promise<UserEmailMessage[]> {
    const emailMessages: UserEmailMessage[] = [];

    for (const messageData of messages) {
      const user = await this.userRepository.findOne({ where: { email: messageData.email } });
      const emailMessage = this.emailMessageRepository.create({
        email: messageData.email,
        subject: messageData.subject,
        content: messageData.content,
        status: messageData.status || 'pending',
        isSent: messageData.isSent || false,
        user: user || undefined,
      });
      await this.emailMessageRepository.save(emailMessage);
      emailMessages.push(emailMessage);
    }

    return emailMessages;
  }

  async getEmailMessages(): Promise<UserEmailMessage[]> {
    return this.emailMessageRepository.find({ relations: ['user'] });
  }
}