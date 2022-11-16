// import type { Knex } from 'knex';

export interface DiscordGuildRecord {
  id: string;
  maxOnlineMembers?: number;
  isBanned: boolean;
  channelSanctuary?: string;
  channelGeneral?: string;
  channelTripsit?: string;
  channelTripsitMeta?: string;
  channelApplications?: string;
  roleNeedsHelp?: String;
  roleTripsitter?: String;
  roleHelper?: String;
  roleTechHelp?: String;
  removedAt?: Date;
  createdAt: Date;
}

export interface DiscordGuildDramaRecord {
  id: string;
  reportedBy: string;
  description: string;
  createdAt: Date;
}

// export default function createDiscordDb(knex: Knex) {
//   return {};
// }
