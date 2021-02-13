# Community Web Server: Companion
Used in conjunction with https://github.com/IronicPickle/community-server-master/.<br/>
The companion server interfaces with discord, via a discord bot, funneling data and updates to the master server.

*Note: Both servers must be hosted simultaneously and must have each other's address configured.*

## Documentation
**Commands**
```
npm run dev - Runs the server in developer mode.
npm run prod - Runs the server in production mode.
npm run stop - Stops the production server.
npm run restart - Restarts the production server.
npm run clean - Cleans the node build directory ' ./build '.
npm run build - Compiles and builds the application.
```

*Note: There are two config files, but you only need to pay attention to backend.json.*

**Backend Config (backend.json)**
```
port: number - The port the web server will listen on. (8081)

master:
  url: string - The URL of the master server. (http://localhost:8080)
  token: string - A unique authorisation token used to authenticate against the master server. This should match the token configured on the master server.
  publicUrl: string - The public URL of the master server. If this isn't configured, master.url will be used instead.

discord:
  token: string - A discord client token generated via the discord developer portal.
  prefix: string - A prefix used to call commands on discord. (!)
  ownerIds: string[] - An array of user IDs who will override permission requirements. ([])
```
