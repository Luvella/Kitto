# Kitto
🔌 Secure, P2P messaging made in Node.js.  
I'm currently looking for feedback on how Kitto should work and what else I should add. If you would give feedback/suggestions, open an issue or talk to me on Discord: `sammy-ette#5336`
# Usage
Kitto currently isn't in a usable state yet (for anyone) but I promise it will be very soon!

## Kitto Protocol
According to [stackoverflow](https://stackoverflow.com/a/18250112/13641384), I can call Kitto a protocol.  
I want other people to be able to implement clients/servers in other languages that can receive and send messages to/from someone with the official thing (this).  
I haven't 100% decided how this will work yet, but here is the idea:  

Client connects to server (another user)  
Client sends `TRANSMISSION - START` to tell the server to acknowledge the client. If a client doesn't send this first, server closes connection.  
Client sends public key for encryption. Example: `CLIENT PUBLIC KEY - A CLIENT'S PUBLIC KEY GOES HERE.`  
Server uses clients public key to encrypt server's public key.  
Server sends their public key. `SERVER PUBLIC KEY - THE SERVER'S PUBLIC KEY`  
Client encrypts the message with servers public key.  
Client sends message to server.  
Server decrypts message with their private key.  
Finally, gracefully end the connection with a `TRANSMISSION - END`.