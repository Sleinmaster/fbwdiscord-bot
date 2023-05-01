import { ChatInputCommandInteraction, Colors, Message, SlashCommandStringOption } from 'discord.js';
import moment from 'moment';
import { CommandCategory } from '../../constants';
import { ApplicationCommandDefinition, CommandDefinition, replyWithEmbed } from '../../lib/command';
import { makeEmbed, makeLines } from '../../lib/embed';

const simbriefEmded = (flightplan) => makeEmbed({
    title: 'SimBrief Data',
    description: makeLines([
        `**Generated at**: ${moment(flightplan.params.time_generated * 1000).format('DD.MM.YYYY, HH:mm:ss')}`,
        `**AirFrame**: ${flightplan.aircraft.name} ${flightplan.aircraft.internal_id}`,
        `**Origin**: ${flightplan.origin.icao_code}`,
        `**Destination**: ${flightplan.destination.icao_code}`,
        `**Route**: ${flightplan.general.route}`,
    ]),

});

const simbriefIdMismatchEmbed = (enteredId, flightplanId) => makeEmbed({
    title: 'SimBrief Data',
    description: makeLines([
        `Entered userId ${enteredId} and returned userId ${flightplanId} don't match. The userId might be used as username by someone else.`,
    ]),
});

const errorEmbed = (errorMessage) => makeEmbed({
    title: 'SimBrief Error',
    description: makeLines(['SimBrief data could not be read.', errorMessage]),
    color: Colors.Red,
});

export const simbriefdata: ApplicationCommandDefinition = {
    name: 'simbriefdata',
    description: 'Provides infos to the most recent SimBrief flightplan',
    category: CommandCategory.UTILS,
    options: [
        new SlashCommandStringOption().setName('SimBriefId').setDescription('Simbrief userId or username'),
    ],
    executor: async (msg) => {
        let simbriefId;
        if (msg instanceof Message) {
            const splitUp = msg.content.split(' ').slice(1);
            [simbriefId] = splitUp;
        } else {
            const interaction = msg as ChatInputCommandInteraction;
            simbriefId = interaction.options.getString('simbriefId');
        }

        const flightplan = await fetch(`https://www.simbrief.com/api/xml.fetcher.php?json=1&userid=${simbriefId}&username=${simbriefId}`).then((res) => res.json());

        if (flightplan.fetch.status !== 'Success') {
            msg.reply({ embeds: [errorEmbed(flightplan.fetch.status)] });
            return Promise.resolve();
        }

        if (!simbriefId.match(/\D/) && simbriefId !== flightplan.params.user_id) {
            replyWithEmbed(msg, simbriefIdMismatchEmbed(simbriefId, flightplan.params.user_id));
        }
        replyWithEmbed(msg, simbriefEmded(flightplan));

        return Promise.resolve();
    },

};
