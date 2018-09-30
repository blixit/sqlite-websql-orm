#!/bin/bash

echo "Removing old dist ..."
rm -rf dist/

echo "Building ..."
ng build sqlite-websql-orm --prod

echo "Copying readme ..."
cp -R projects/sqlite-websql-orm/package.json dist/sqlite-websql-orm/package.json
cp README.md dist/sqlite-websql-orm/README.md