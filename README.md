# Elite: Dangerous Squadron Management Companion Server
The companion server to be used on conjunction with https://github.com/IronicPickle/elite-community-website.

## Documentation
**Commands**
```
npm run dev - Runs the node dev server.
npm run prod - Runs the production build. Must have used ' npm run build ' first.
npm run clean - Cleans the node build directory ' ./build '.
npm run build - Compiles the node serve.
```
**Environment Variables (.env)**
```
PORT:string - The port the node server will run on. (8080)

MASTER_URL - The URL of the master server. (http://localhost:8080)
MASTER_TOKEN - The token used to authenticate against the master server. This must match the token specified on the master server.
PUBLIC_WEB_PORTAL_URL - The public URL of the master server. (Will use MASTER_URL if unspecified)

DISCORD_TOKEN - API token used to connect to the discord bot.
DISCORD_PREFIX - The prefix used to call commands in discord.
DISCORD_OWNER_USERIDS - IDs of users who can override permission requirements.
```
