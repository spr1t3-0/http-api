// import type { Knex } from 'knex';

export interface DiscordGuildRecord {
  id: string;
  maxOnlineMembers?: number;
  isBanned: boolean;
  channelSanctuary?: string;
  channelGeneral?: string;
  channelTripsit?: string;
  channelTripsitmeta?: string;
  channelApplications?: string;
  roleNeedshelp?: String;
  roleTripsitter?: String;
  roleHelper?: String;
  roleTechhelp?: String;
  removedAt?: Date;
  createdAt: Date;
}
