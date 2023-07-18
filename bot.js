import express from 'express';
import { REST } from '@discordjs/rest';
import { WebSocketManager } from '@discordjs/ws';
import { Routes } from 'discord-api-types/v10';
import { GatewayDispatchEvents, GatewayIntentBits, InteractionType, MessageFlags, Client } from '@discordjs/core';
import dotenv from 'dotenv';
import { spoiler } from 'discord.js';

dotenv.config();
const token = process.env.DISCORD_BOT_TOKEN

// Create REST and WebSocket managers directly
const rest = new REST({ version: '10' }).setToken(token);

const gateway = new WebSocketManager({
    token: token,
    intents: GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent,
    rest,
});


// Create a client to emit relevant events.
const client = new Client({ rest, gateway });

// Listen for interactions
// Each event contains an `api` prop along with the event data that allows you to interface with the Discord REST API
client.on(GatewayDispatchEvents.InteractionCreate, async ({ data: interaction, api }) => {
    if (interaction.type !== InteractionType.ApplicationCommand || interaction.data.name !== 'ping') {
        return;
    }

    await api.interactions.reply(interaction.id, interaction.token, { content: 'Pong!', flags: MessageFlags.Ephemeral });
});


client.on(GatewayDispatchEvents.MessageCreate, async ({ data: message, api }) => {
    // Ignore messages that aren't from a guild
    // or are from a bot
    if (!message.guild_id || message.author.bot) {
        return;
    }

    let options = ["work", "please", "yo"]
    // Check if the message contains the word "hello"
    if (message.content && options.some(keyword => message.content.includes(keyword))) {
        // Reply to the message
        await client.rest.post(
            Routes.channelMessages(message.channel_id),
            {
                body: {"content":"nah"},
                headers: {
                    "Content-Type":"application/json"
                },
                files: null
            }
        )
    }
});


// Listen for the ready event
client.once(GatewayDispatchEvents.Ready, () => console.log('Ready!'));

// Start the WebSocket connection.
gateway.connect();

const app = express();

app.get('/', (req, res) => {
    res.send("bot running")
})

app.listen(3000, () => {
    console.log("server running on port 3000")
})
