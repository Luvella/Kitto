<img align="left" src="https://github.com/Luvella/Kitto/blob/master/kitto.png" width=256>

🔌 Encrypted P2P messaging protocol/client and server, made in Node.js.  
I'm currently looking for feedback on how Kitto should work and what else I should add. If you would give feedback/suggestions, feel free to open an issue.

Kitto ~~should be~~ is currently usable right now. Try it out! Get a friend to use it and try sending each other messages.  

<br>
<br>
<br>
<br>

# Discord Webhook
You can setup a Discord webhook to post messages received to a channel. Just add `"webhook": "url"` to `conf.json`.

# Install
```
git clone https://github.com/Luvella/Kitto
cd Kitto
npm install
node .
```

## Kitto Protocol
I want other people to be able to implement clients/servers in other languages that can receive and send messages to/from someone with the official thing (this).  
I haven't 100% decided how this will work yet, but here is the idea:  

Client connects to server (another user).  
Client sends `TRANSMISSION - START` to tell the server to acknowledge the client. If a client doesn't send this first, server closes connection.  
Client sends public key for encryption. Example: `CLIENT PUBLIC KEY - A CLIENT'S PUBLIC KEY GOES HERE.`  
Server sends their public key. `SERVER PUBLIC KEY - THE SERVER'S PUBLIC KEY`  
Client sends encrypted message to server. `CONTENT - {}` ([An example of the JSON expected](https://github.com/juhoen/hybrid-crypto-js#encryption))  
Server decrypts message with their private key.  
Client sends `TRANSMISSION - END` to end the connection.  
Server ends the connection with a `SUCCESS - TRUE`.  
Server informs the user about a received message.

### Errors 
| Code    | Description                                          |
|---------|------------------------------------------------------|
| 1       | content is missing from transmission                 |
| 2       | transmission was sent in wrong order                 |
| 3       | unexpected type of content for specific transmission |
| 4       | socket timeout                                       |  

Example for code 3: CONTENT - PLAINTEXT when it's supposed to be [JSON](https://github.com/juhoen/hybrid-crypto-js#encryption)
