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
  "twitter.com": "fxtwitter.com",
  "www.twitter.com": "fxtwitter.com",
  "x.com": "fxtwitter.com",
  "www.x.com": "fxtwitter.com",
  "reddit.com": "rxddit.com",
  "www.reddit.com": "rxddit.com",
  "pixiv.net": "phixiv.net",
  "www.pixiv.net": "phixiv.net",
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

async function shouldFixLink(url) {
  const twitterMatches = ["twitter.com", "x.com"]
  if (twitterMatches.find((h) => url.host === h || `www.${url.host}` === h)) {
    const prevHostName = url.host
    url.host = "api.vxtwitter.com"

    // Assuming json here.
    const tweet = await (await fetch(url.toString())).json()
    if (tweet.media_extended && tweet.media_extended.length > 0) {
      for (const media of tweet.media_extended) {
        if (media.type === "video" || media.type === "animated_gif") {
          url.host = prevHostName
          return true
        }
      }
    }

    // Is image or text, no need.
    return false
  }

  return true
}

client.on("messageCreate", async (msg) => {
  if (msg.content.includes("-preserve")) {
    return
  }

  const oneUrl = msg.content.match(urlregex)
  if (oneUrl) {
    console.log(`Processing "${oneUrl[0]}"`)

    try {
      const parsedUrl = new URL(`https://${oneUrl[0]}`)
      if (await shouldFixLink(parsedUrl)) {
        const redirectTo = redirects[parsedUrl.host]
        if (redirectTo !== undefined) {
          parsedUrl.host = redirectTo
          await msg.suppressEmbeds(true)
          await msg.reply(parsedUrl.toString())
          console.log(`Redirected to "${parsedUrl.toString()}"`)
        }
      } else {
        console.log(`No redirection needed for "${oneUrl[0]}"`)
      }
    } catch (e) {
      console.log(`Error processing "${oneUrl[0]}: ${e.message}"`)
    }
  }
})

client.login(process.env.DISCORD_BOT_SECRET)
