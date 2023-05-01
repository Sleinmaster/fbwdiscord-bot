import { ApplicationCommandOptionType, REST, Routes, SlashCommandBuilder, SlashCommandStringOption } from 'discord.js';
import { slashCommands } from '../commands';
import { ApplicationCommandDefinition } from './command';

export async function registerApplicationCommands() {
    const commands = [];
    for (const commandBase of slashCommands) {
        const command = commandBase as ApplicationCommandDefinition;
        const slashCommandBuilder = new SlashCommandBuilder()
            .setName(Array.isArray(command.name) ? command.name[0] : command.name)
            .setDescription(command.description);
        for (const commandOption of command.options) {
            if (commandOption.type === ApplicationCommandOptionType.String) {
                slashCommandBuilder.addStringOption(commandOption as SlashCommandStringOption);
            }
        }
        commands.push(slashCommandBuilder.toJSON());
    }
    const rest = new REST().setToken(process.env.BOT_SECRET);
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
}
