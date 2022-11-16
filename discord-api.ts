import { REST } from '@discordjs/rest';
import { Routes, APIUser } from 'discord-api-types/v10';
import { DISCORD_API_TOKEN } from './env';

export default function createDiscordApi() {
  const client = new REST({ version: '10' }).setToken(DISCORD_API_TOKEN);

  return {
    client,

    async getUser(userId: string) {
      const user = await client.get(Routes.user(userId)) as APIUser;
      return {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatarUrl: user.avatar,
      };
    },
  };
}

export type DiscordApi = ReturnType<typeof createDiscordApi>;
