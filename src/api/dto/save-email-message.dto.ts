// dto/save-email-message.dto.ts
export class SaveEmailMessageDto {
    email: string;
    subject: string;
    content: string;
    status?: 'pending' | 'sent' | 'failed'; // Опционально
    isSent?: boolean; // Опционально
  }