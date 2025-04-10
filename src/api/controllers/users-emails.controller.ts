// src/users-emails/users-emails.controller.ts
import { Controller, Post, Get, Body } from '@nestjs/common';
import { UsersEmailsService } from '../services/users-emails.service';
import { UserEmailMessage } from '../../entities/user-email-message.entity';
import { SaveEmailMessageDto } from '../dto/save-email-message.dto';

@Controller('users-emails')
export class UsersEmailsController {
  constructor(private readonly usersEmailsService: UsersEmailsService) {}

  @Post('save-messages')
  async saveEmailMessages(@Body() messages: SaveEmailMessageDto[]): Promise<UserEmailMessage[]> {
    return this.usersEmailsService.saveEmailMessages(messages);
  }

  @Get('messages')
  async getEmailMessages(): Promise<UserEmailMessage[]> {
    return this.usersEmailsService.getEmailMessages();
  }
}