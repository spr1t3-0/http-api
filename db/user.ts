import type { Knex } from 'knex';

export interface UserRecord {
  id: string;
  email?: string;
  username?: string;
  passwordHash?: string;
  discordId?: string;
  ircId?: string;
  matrixId?: string;
  timezone: string;
  birthday: Date;
  karmaGiven: number;
  karmaReceived: number;
  sparklePoints: number;
  discordBotBan: boolean;
  ticketBan: boolean;
  lastSeen: Date;
  joinedAt: Date;
}

export type UserTicketType = 'APPEAL' | 'TRIPSIT' | 'TECH' | 'FEEDBACK';
export type UserTicketStatus = 'OPEN' | 'CLOSED' | 'BLOCKED' | 'PAUSED';

export interface UserTicketRecord {
  id: string;
  userId: string;
  type: UserTicketType;
  status: UserTicketStatus;
  description?: string;
  threadId: string;
  firstMessageId: string;
  closedAt?: Date;
  createdAt: Date;
}

export type UserActionType = 'NOTE'
| 'WARNING'
| 'FULL_BAN'
| 'TICKET_BAN'
| 'DISCORD_BOT_BAN'
| 'BAN_EVASION'
| 'UNDERBAN'
| 'TIMEOUT'
| 'REPORT'
| 'KICK';

export interface UserActionRecord {
  id: string;
  userId: string;
  type: UserActionType;
  banEvasionRelatedUser: string | null;
  description: string;
  internalNote: string | null;
  expiresAt: Date | null;
  repealedBy: string | null;
  repealedAt: Date | null;
  createdBy: string;
  createdAt: Date;
}

export default function createUserDb(knex: Knex) {
  return {
    getById(id: string) {
      return knex<UserRecord>('users')
        .where('id', id)
        .first();
    },
  };
}
