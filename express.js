require('dotenv').config();

// This will work with Node.js on CommonJS mode (TypeScript or not)
const { TwitterApi } = require('twitter-api-v2');

const express = require('express');
const app = express();

const fs = require('fs').promises;

app.get('/1btcnews', (req, res) => {
    // Instantiate with desired auth type (here's Bearer v2 auth)
    const client = new TwitterApi({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET
    });

    // Don't forget to specify 'offline.access' in scope list if you want to refresh your token later
    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(process.env.CALLBACK_URL, { scope: ['tweet.read', 'users.read', 'offline.access', 'tweet.write'] });

    // Redirect your user to {url}, store {state} and {codeVerifier} into a DB/Redis/memory after user redirection

    fs.writeFile(`${__dirname}/state.json`, JSON.stringify({
        state,
        codeVerifier
    }))
    .then(() => {
        //console.log(`${url}, ${codeVerifier}, ${state}`);
        res.redirect(url);
    })
    .catch((error) => {
        //console.log(`${error}`);
        res.status(403).send(error);
    });
});

app.get('/callback', (req, res) => {
  // Extract state and code from query string
  const { state, code } = req.query;
  // Get the saved codeVerifier from session
  //const { codeVerifier, state: sessionState } = req.session;

  fs.readFile(`${__dirname}/state.json`)
  .then((response) => {
    const session = JSON.parse(response);
    
    if (!session?.codeVerifier || !state || !session?.state || !code) {
        res.status(400).send('You denied the app or your session expired!');
    }
    if (state !== session?.state) {
        res.status(400).send('Stored tokens didnt match!');
    }

    // Obtain access token
    const client = new TwitterApi({ clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET });

    client.loginWithOAuth2({ code, codeVerifier: session.codeVerifier, redirectUri: process.env.CALLBACK_URL })
    .then(async ({ client: loggedClient, accessToken, refreshToken, expiresIn }) => {
        // {loggedClient} is an authenticated client in behalf of some user
        // Store {accessToken} somewhere, it will be valid until {expiresIn} is hit.
        // If you want to refresh your token later, store {refreshToken} (it is present if 'offline.access' has been given as scope)

        console.log(accessToken);

        fs.writeFile(`${__dirname}/state.json`, JSON.stringify({
            ...session,
            accessToken,
            refreshToken,
            expiresIn: Date.now()/1000+expiresIn
        }))
        .then(() => {
            res.status(200).send('Success!');
        })
        .catch((error) => {
            res.status(403).send(error);
        });
        
        // Example request
        //const { data: userObject } = await loggedClient.v2.me();
    })
    .catch(() => res.status(403).send('Invalid verifier or access tokens!'));
  })
  .catch(error => res.status(403).send(error));
});

app.listen(3000);