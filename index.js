require('dotenv').config();

const fs = require('fs').promises;

// This will work with Node.js on CommonJS mode (TypeScript or not)
const { TwitterApi } = require('twitter-api-v2');

const axios = require('axios');

axios.get('https://inscribe.news/api/data/ord-news')
  .then((news) => {
    // handle success
    //console.log(response);

    let ids = {};

    let adds = [];
    
    fs.readFile(`${__dirname}/ids.json`)
    .then((response) => {
        ids = JSON.parse(response);
    })
    .catch((error) => {
        console.log(error);
    })
    .finally(() => {
        for (let k=0; k<news.data.keys.length; k++) {
            if (!ids[news.data.keys[k].metadata.id]) {
                adds.push(news.data.keys[k].metadata.id);
            }
        }

        if (adds.length) {
            fs.readFile(`${__dirname}/state.json`)
            .then(async (response) => {
                const session = JSON.parse(response);
                
                let client;
                
                if (session.expiresIn > Math.round(Date.now()/1000)) {
                    client = new TwitterApi(session.accessToken);
                }
                else {
                    // Instantiate with desired auth type (here's Bearer v2 auth)
                    client = new TwitterApi({
                        clientId: process.env.CLIENT_ID,
                        clientSecret: process.env.CLIENT_SECRET
                    });
                
                    // Obtain the {refreshToken} from your DB/store
                    const { client: refreshedClient, accessToken, expiresIn, refreshToken: newRefreshToken } = await client.refreshOAuth2Token(session.refreshToken);
                    
                    client = refreshedClient;
                    
                    // Store refreshed {accessToken} and {newRefreshToken} to replace the old ones
                    fs.writeFile(`${__dirname}/state.json`, JSON.stringify({
                        ...session,
                        accessToken,
                        refreshToken: newRefreshToken,
                        expiresIn: Math.round(Date.now()/1000)+expiresIn
                    }))
                    .then(() => {
                        console.log('Refresh!');
                    })
                    .catch((error) => {
                        console.log(error);
                    });
                }
            
                adds = [...new Set(adds)];
                
                for (let a=0; a<adds.length; a++) {
                    try {
                        const data = await axios.get(`https://inscribe.news/api/data/${adds[a]}`);
                        let title = data.data.title;

                        await client.v2.tweet(`${title}\nhttps://inscribe.news/view-news?id=${adds[a]}\n@1btcnews #Bitcoin`);

                        // todo implement wait time
                        
                        console.log(`Tweet: ${title}`);
                        
                        ids[adds[a]] = true;
                    }
                    catch (error) {
                        //data = adds[a];
                        console.log(error);
                    }
                    
                    //console.log(data);
                }

                // // todo implement synchronously
                // Promise.allSettled(tweets)
                // .then((results) => {
                //     for (let r=0; r<results.length; r++) {
                //         if (results[r].status === 'fulfilled') {
                //             ids[adds[r]] = true;
                //         }
                //     }
                // })
                // .catch((error) => {
                //     console.log(error);
                // })
                // .finally(() => {
                    fs.writeFile(`${__dirname}/ids.json`, JSON.stringify(ids))
                    .then(() => {
                        //console.log('Success!');
                    })
                    .catch((error) => {
                        console.log(error);
                    });
                // });
            })
            .catch((error) => {
                console.log(error);
            });
        }
    });
  })
  .catch((error) => {
    // handle error
    console.log(error);
  });