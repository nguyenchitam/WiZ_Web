#!/bin/bash

cd wiz-react

npm install

npm run build



cd ../WiZ_FastAPI

python3 -m venv venv

. venv/bin/activate

pip3 install -r requirements.txt