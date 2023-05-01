import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { simbriefdata } from '../commands/utils/simbriefdata';

export async function registerApplicationCommands() {
    const slashCommands = [];
    const slashCommandBuilder = new SlashCommandBuilder().setName(Array.isArray(simbriefdata.name) ? simbriefdata.name[0] : simbriefdata.name).setDescription(simbriefdata.description);
    slashCommands.push(slashCommandBuilder.toJSON());
    const rest = new REST().setToken(process.env.BOT_SECRET);
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: slashCommands });
}
