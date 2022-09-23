#!/usr/bin/env sh

# abort on errors
set -e

# build
yarn build

# navigate into the build output directory
cd dist

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

git init
git add --all -- :!soundfonts/*
git commit -m 'deploy'

git push -f git@github.com:threedalpeng/jazz.git main:gh-pages

cd -