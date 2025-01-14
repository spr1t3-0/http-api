// The TypeScript definitions below are automatically generated.
// Do not touch them, or risk, your modifications being lost.

export enum BridgeStatus {
  Pending = 'PENDING',
  Active = 'ACTIVE',
  Paused = 'PAUSED',
}

export enum CountingType {
  Normal = 'NORMAL',
  Hardcore = 'HARDCORE',
  Token = 'TOKEN',
}

export enum DrugCategoryType {
  Common = 'COMMON',
  Psychoactive = 'PSYCHOACTIVE',
  Chemical = 'CHEMICAL',
}

export enum DrugMassUnit {
  Mg = 'MG',
  Ml = 'ML',
  G = 'µG',
  G = 'G',
  Oz = 'OZ',
  Floz = 'FLOZ',
}

export enum DrugNameType {
  Brand = 'BRAND',
  Common = 'COMMON',
  Substitutive = 'SUBSTITUTIVE',
  Systematic = 'SYSTEMATIC',
}

export enum DrugRoa {
  Oral = 'ORAL',
  Insufflated = 'INSUFFLATED',
  Inhaled = 'INHALED',
  Topical = 'TOPICAL',
  Sublingual = 'SUBLINGUAL',
  Buccal = 'BUCCAL',
  Rectal = 'RECTAL',
  Intramuscular = 'INTRAMUSCULAR',
  Intravenous = 'INTRAVENOUS',
  Subcutanious = 'SUBCUTANIOUS',
  Transdermal = 'TRANSDERMAL',
}

export enum ExperienceCategory {
  Total = 'TOTAL',
  General = 'GENERAL',
  Tripsitter = 'TRIPSITTER',
  Developer = 'DEVELOPER',
  Team = 'TEAM',
  Ignored = 'IGNORED',
}

export enum ExperienceType {
  Text = 'TEXT',
  Voice = 'VOICE',
}

export enum ReactionRoleType {
  Color = 'COLOR',
  PremiumColor = 'PREMIUM_COLOR',
  Mindset = 'MINDSET',
  Pronoun = 'PRONOUN',
  Notification = 'NOTIFICATION',
  Custom = 'CUSTOM',
}

export enum TicketStatus {
  Open = 'OPEN',
  Owned = 'OWNED',
  Blocked = 'BLOCKED',
  Paused = 'PAUSED',
  Closed = 'CLOSED',
  Resolved = 'RESOLVED',
  Archived = 'ARCHIVED',
  Deleted = 'DELETED',
}

export enum TicketType {
  Appeal = 'APPEAL',
  Tripsit = 'TRIPSIT',
  Tech = 'TECH',
  Feedback = 'FEEDBACK',
}

export enum UserActionType {
  Note = 'NOTE',
  Warning = 'WARNING',
  FullBan = 'FULL_BAN',
  TicketBan = 'TICKET_BAN',
  DiscordBotBan = 'DISCORD_BOT_BAN',
  BanEvasion = 'BAN_EVASION',
  Underban = 'UNDERBAN',
  Timeout = 'TIMEOUT',
  Report = 'REPORT',
  Kick = 'KICK',
  HelperBan = 'HELPER_BAN',
  ContributorBan = 'CONTRIBUTOR_BAN',
}

export enum Table {
  Bridges = 'bridges',
  Counting = 'counting',
  DiscordGuilds = 'discord_guilds',
  DrugArticles = 'drug_articles',
  DrugCategories = 'drug_categories',
  DrugCategoryDrugs = 'drug_category_drugs',
  DrugNames = 'drug_names',
  DrugVariantRoas = 'drug_variant_roas',
  DrugVariants = 'drug_variants',
  Drugs = 'drugs',
  KnexMigrations = 'knex_migrations',
  KnexMigrationsLock = 'knex_migrations_lock',
  Personas = 'personas',
  ReactionRoles = 'reaction_roles',
  RpgInventory = 'rpg_inventory',
  Rss = 'rss',
  UserActions = 'user_actions',
  UserDrugDoses = 'user_drug_doses',
  UserExperience = 'user_experience',
  UserReminders = 'user_reminders',
  UserTickets = 'user_tickets',
  Users = 'users',
}

export type Bridges = {
  id: string;
  internal_channel: string;
  status: BridgeStatus;
  external_channel: string;
};

export type Counting = {
  id: string;
  guild_id: string;
  channel_id: string;
  type: CountingType;
  current_number: number;
  current_stakeholders: string | null;
  current_number_message_id: string;
  current_number_message_date: Date;
  current_number_message_author: string;
  last_number: number | null;
  last_number_message_id: string | null;
  last_number_message_date: Date | null;
  last_number_message_author: string | null;
  last_number_broken_by: string | null;
  last_number_broken_date: Date | null;
  record_number: number;
  record_number_message_id: string | null;
  record_number_message_date: Date | null;
  record_number_message_author: string | null;
  record_number_broken_by: string | null;
  record_number_broken_date: Date | null;
};

export type DiscordGuilds = {
  id: string;
  is_banned: boolean;
  last_drama_at: Date | null;
  drama_reason: string | null;
  max_online_members: number | null;
  channel_sanctuary: string | null;
  channel_general: string | null;
  channel_tripsit: string | null;
  channel_tripsitmeta: string | null;
  channel_applications: string | null;
  role_needshelp: string | null;
  role_tripsitter: string | null;
  role_helper: string | null;
  role_techhelp: string | null;
  removed_at: Date | null;
  joined_at: Date;
  created_at: Date;
  partner: boolean;
  supporter: boolean;
  premium_role_ids: string | null;
};

export type DrugArticles = {
  id: string;
  drug_id: string;
  url: string;
  title: string;
  description: string | null;
  published_at: Date | null;
  last_modified_by: string;
  last_modified_at: Date;
  posted_by: string;
  created_at: Date;
};

export type DrugCategories = {
  id: string;
  name: string;
  type: DrugCategoryType;
  created_at: Date;
};

export type DrugCategoryDrugs = {
  drug_id: string;
  drug_category_id: string;
};

export type DrugNames = {
  id: string;
  drug_id: string;
  name: string;
  is_default: boolean;
  type: DrugNameType;
};

export type DrugVariantRoas = {
  id: string;
  drug_variant_id: string;
  route: DrugRoa;
  dose_threshold: number | null;
  dose_light: number | null;
  dose_common: number | null;
  dose_strong: number | null;
  dose_heavy: number | null;
  dose_warning: string | null;
  duration_total_min: number | null;
  duration_total_max: number | null;
  duration_onset_min: number | null;
  duration_onset_max: number | null;
  duration_comeup_min: number | null;
  duration_comeup_max: number | null;
  duration_peak_min: number | null;
  duration_peak_max: number | null;
  duration_offset_min: number | null;
  duration_offset_max: number | null;
  duration_after_effects_min: number | null;
  duration_after_effects_max: number | null;
};

export type DrugVariants = {
  id: string;
  drug_id: string;
  name: string | null;
  description: string | null;
  default: boolean;
  last_updated_by: string;
  updated_at: Date;
  created_at: Date;
};

export type Drugs = {
  id: string;
  summary: string | null;
  psychonaut_wiki_url: string | null;
  errowid_experiences_url: string | null;
  last_updated_by: string;
  updated_at: Date;
  created_at: Date;
};

export type KnexMigrations = {
  id: number;
  name: string | null;
  batch: number | null;
  migration_time: Date | null;
};

export type KnexMigrationsLock = {
  index: number;
  is_locked: number | null;
};

export type Personas = {
  id: string;
  user_id: string;
  name: string;
  class: string;
  species: string;
  guild: string;
  tokens: number;
  trip_token_multiplier: number;
  last_quest: Date | null;
  last_dungeon: Date | null;
  last_raid: Date | null;
  created_at: Date;
};

export type ReactionRoles = {
  id: string;
  guild_id: string;
  channel_id: string;
  message_id: string | null;
  reaction_id: string | null;
  role_id: string;
  created_at: Date;
  type: ReactionRoleType;
  name: string;
};

export type RpgInventory = {
  id: string;
  persona_id: string;
  label: string;
  value: string;
  description: string;
  quantity: number;
  weight: number;
  cost: number;
  equipped: boolean;
  consumable: boolean;
  effect: string;
  effect_value: string;
  emoji: string;
  created_at: Date;
};

export type Rss = {
  id: string;
  guild_id: string;
  url: string;
  last_post_id: string;
  destination: string;
};

export type UserActions = {
  id: string;
  user_id: string;
  type: UserActionType;
  ban_evasion_related_user: string | null;
  description: string | null;
  internal_note: string;
  expires_at: Date | null;
  repealed_by: string | null;
  repealed_at: Date | null;
  created_by: string;
  created_at: Date;
};

export type UserDrugDoses = {
  id: string;
  user_id: string;
  drug_id: string;
  route: DrugRoa;
  dose: number;
  units: DrugMassUnit;
  created_at: Date;
};

export type UserExperience = {
  id: string;
  user_id: string;
  category: ExperienceCategory;
  level: number;
  level_points: number;
  total_points: number;
  last_message_at: Date;
  last_message_channel: string;
  created_at: Date;
  type: ExperienceType;
};

export type UserReminders = {
  id: string;
  user_id: string;
  reminder_text: string | null;
  trigger_at: Date;
  created_at: Date;
};

export type UserTickets = {
  id: string;
  user_id: string;
  description: string;
  thread_id: string;
  meta_thread_id: string | null;
  first_message_id: string;
  type: TicketType;
  status: TicketStatus;
  closed_by: string | null;
  closed_at: Date | null;
  reopened_by: string | null;
  reopened_at: Date | null;
  archived_at: Date;
  deleted_at: Date;
  created_at: Date;
};

export type Users = {
  id: string;
  email: string | null;
  username: string | null;
  password_hash: string | null;
  discord_id: string | null;
  irc_id: string | null;
  matrix_id: string | null;
  timezone: string | null;
  birthday: Date | null;
  roles: string | null;
  mindset_role: string | null;
  mindset_role_expires_at: Date | null;
  karma_given: number;
  karma_received: number;
  sparkle_points: number;
  move_points: number;
  empathy_points: number;
  discord_bot_ban: boolean;
  ticket_ban: boolean;
  last_seen_at: Date;
  last_seen_in: string | null;
  joined_at: Date;
  removed_at: Date | null;
  mod_thread_id: string | null;
  helper_role_ban: boolean;
  contributor_role_ban: boolean;
  lastfm_username: string | null;
  partner: boolean | null;
  supporter: boolean | null;
};
