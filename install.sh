#sudo vi ~/.ssh/authorized_keys
build=$(pwd)
cd ~
sudo yum update -y
#nvm version
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 18
#node -e "console.log('Running Node.js ' + process.version)"
cd $build
npm i
sudo yum install nginx -y
sudo yum install cronie -y
#timedatectl
#timedatectl list-timezones
#sudo timedatectl set-timezone America/New_York
sudo service crond restart
#.env

#sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/pki/nginx/server.key -out /etc/pki/nginx/server.crt

#node version
#* * * * * /home/ec2-user/.nvm/versions/node/v18.15.0/bin/node /home/ec2-user/build/index.js >> /home/ec2-user/build/index.log