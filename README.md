# Elite: Dangerous Squadron Management Companion Server
Used in conjunction with https://github.com/IronicPickle/elite-community-master/ to create an interactive squadron management system for Elite: Dangerous.<br/>
The companion server interfaces with discord, via a discord bot, funneling data and updates to the master server.

*Note: Both servers must be hosted simultaneously and must have each other's address configured.*

## Documentation
**Commands**
```
npm run dev - Runs the server in developer mode.
npm run prod - Runs the server using a build.
npm run clean - Cleans the node build directory ' ./build '.
npm run build - Compiles and builds the application.
```

*Note: There are two config files, but you only need to pay attention to backend.json.*

**Backend Config (backend.json)**
```
port: number - The port the web server will listen on. (8081)

master.url: string - The URL of the master server. (http://localhost:8080)
master.token: string - A unique authorisation token used to authenticate against the master server. This should match the token configured on the master server.
master.publicUrl: string - The public URL of the master server. If this isn't configured, master.url will be used instead.

discord.token: string - A discord client token generated via the discord developer portal.
discord.prefix: string - A prefix used to call commands on discord. (!)
discord.ownerIds: string[] - An array of user IDs who will override permission requirements.
```
