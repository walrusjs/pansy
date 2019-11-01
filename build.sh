#!/usr/bin/env bash

cd ./website

yarn
yarn build

cd ../

cp -r -f ./website/public  ./
