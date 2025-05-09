import { SlashCommandPipe } from "@discord-nestjs/common";
import { DiscordClientProvider, EventParams, Handler, IA, InteractionEvent, Param, SubCommand } from "@discord-nestjs/core";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { ChatInputCommandInteraction, ClientEvents, GuildMemberRoleManager, TextChannel } from "discord.js";
import { isEmpty } from "rxjs";
import { BotGateway } from "src/bot/bot.gateway";
import permissionCheckReforger from "src/helpers/reforger_command_perms_check";
import * as fs from 'fs';

class ReforgerSubCommandParams {
    @Param({ description: 'Mission GUID', required: false })
    missionguid: string;
}

@SubCommand({ name: 'reforger', description: 'Starts/Restarts the reforger server.', })
export class ReforgerServerSubCommand {
    constructor(private readonly discordProvider: DiscordClientProvider) { }

    @Handler()
    onServerSelectCommand(@InteractionEvent(SlashCommandPipe) options: ReforgerSubCommandParams, @EventParams() args: ClientEvents['interactionCreate'], ): string {
        const member = args[0].member;
        const channel = args[0].channel as TextChannel;

        const permCheck = permissionCheckReforger(member)

        if (permCheck != true) {
            return permCheck
        }

        const discordClient = this.discordProvider.getClient();
        const adminChannel: TextChannel = discordClient.channels.cache.get(
            process.env.DISCORD_BOT_ADMIN_CHANNEL,
        ) as TextChannel;
        let action = "restart";
        if (args[0] instanceof ChatInputCommandInteraction) {
            action = args[0].options["_group"];
        }
        let child: ChildProcessWithoutNullStreams;

        if (options.missionguid && process.env.REFORGER_SERVER_CONFIG_FILE) {
            channel.send(member?.user?.username + ' set scenario id to ' + options.missionguid);
            const data = fs.readFileSync(process.env.REFORGER_SERVER_CONFIG_FILE, 'utf8');
            let config = JSON.parse(data);
            config.game.scenarioId = options.missionguid;
            fs.writeFileSync(process.env.REFORGER_SERVER_CONFIG_FILE, JSON.stringify(config, null, "\t"));
        }

        if (action == "restart") {
            channel.send(member?.user?.username + ' restarted reforger server');
            child = spawn('powershell.exe', [
                `${process.env.MAIN_REFORGER_SERVER_START_SCRIPT_PATH}\\start.ps1`,
            ]);
            child.stdout.on('data', async function (data) {
                try {
                    if (data) {
                        let text = '' + data;
                        if (text.length > 0 && (
                            text.includes('->') //||
                            //text.includes('(E)') ||
                            //text.includes('(W)')
                        )) {
                            await channel.send({content: text})
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            });
            child.stderr.on('data', async function (data) {
                try {
                    if (data) {
                        let text = '' + data;
                        if (text.length > 0 && (
                            text.includes('->') //||
                            //text.includes('(E)') ||
                            //text.includes('(W)')
                        )) {
                            await channel.send({content: text})
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            });
        } else if (action == "restart-nobackend") {
            channel.send(member?.user?.username + ' restarted reforger server without backend');
            child = spawn('powershell.exe', [
                `${process.env.MAIN_REFORGER_SERVER_START_SCRIPT_PATH}\\start-nobackend.ps1`,
            ]);
            child.stdout.on('data', async function (data) {
                try {
                    if (data) {
                        let text = '' + data;
                        if (text.length > 0 && (
                            text.includes('->') //||
                            //text.includes('(E)') ||
                            //text.includes('(W)')
                        )) {
                            await channel.send({content: text})
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            });
            child.stderr.on('data', async function (data) {
                try {
                    if (data) {
                        let text = '' + data;
                        if (text.length > 0 && (
                            text.includes('->') //||
                            //text.includes('(E)') ||
                            //text.includes('(W)')
                        )) {
                            await channel.send({content: text})
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            });
        } else {
            channel.send(member?.user?.username + ' stopped reforger server');
            child = spawn('powershell.exe', [`${process.env.MAIN_REFORGER_SERVER_START_SCRIPT_PATH}\\stop.ps1`,]);
            child.stdout.on('data', async function (data) {
                try {
                    if (data) {
                        let text = '' + data;
                        if (text.length > 0 && (
                            text.includes('->') //||
                            //text.includes('(E)') ||
                            //text.includes('(W)')
                        )) {
                            await channel.send({content: text})
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            });
            child.stderr.on('data', async function (data) {
                try {
                    if (data) {
                        let text = '' + data;
                        if (text.length > 0 && (
                            text.includes('->') //||
                            //text.includes('(E)') ||
                            //text.includes('(W)')
                        )) {
                            await channel.send({content: text})
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            });
        }
        child.stdin.end();
    }
}