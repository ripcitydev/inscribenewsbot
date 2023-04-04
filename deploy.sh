mv ~/build/state.json ~/
#mv ~/build/ids.json ~/
sudo rm -r ~/build
unzip ~/build.zip
cp ~/.env ~/build/
cp ~/ids.json ~/build/
mv ~/state.json ~/build/
#mv ~/ids.json ~/build/
cd ~/build
npm i
#cd ~
touch ~/build/index.log
pm2 reload all