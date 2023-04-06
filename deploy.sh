mv ~/build/state.json ~/
mv ~/build/ids.json ~/
sudo rm -r ~/build
unzip ~/build.zip
cp ~/.env ~/build/
mv ~/ids.json ~/build/
mv ~/state.json ~/build/
cd ~/build
npm i
touch ~/build/index.log
pm2 reload all