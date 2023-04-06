# inscribenewsbot
inscribe.news twitter bot

## Installing
```
sh install.sh
```

## Configuring
```
location /authorize {
    proxy_pass http://127.0.0.1:3000/authorize;
}

location /callback {
    proxy_pass http://127.0.0.1:3000/callback;
}
```

## Deploying
```
sh deploy.sh
```

## Running
```
pm2 start express.js
sudo service nginx restart
```