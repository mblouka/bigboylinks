import "dotenv/config"
import { Client, GatewayIntentBits } from "discord.js"

// url fixes
//-------------------------------------------------------------------------

/** proudly skidded from https://stackoverflow.com/a/3809435 */
const urlregex =
  /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/

const redirects = {
  "tiktok.com": "tiktxk.com",
  "www.tiktok.com": "tiktxk.com",
  "instagram.com": "www.ddinstagram.com",
  "www.instagram.com": "www.ddinstagram.com",
  "twitter.com": "vxtwitter.com",
  "www.twitter.com": "vxtwitter.com",
  "x.com": "fixvx.com",
  "www.x.com": "fixvx.com",
}

// connect
//-------------------------------------------------------------------------

if (!process.env.DISCORD_BOT_SECRET) {
  console.error("no client id or bot secret")
  process.exit(1)
}

const client = new Client({
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
  ],
})

client.on("messageCreate", async (msg) => {
  const oneUrl = msg.content.match(urlregex)
  if (oneUrl) {
    const parsedUrl = new URL(`https://${oneUrl[0]}`)
    const redirectTo = redirects[parsedUrl.host]
    if (redirectTo !== undefined) {
      parsedUrl.host = redirectTo
      await msg.reply(parsedUrl.toString())
    }
  }
  // Do nothing.
})

client.login(process.env.DISCORD_BOT_SECRET)
