#!/bin/bash

rm -rf dist/

ng build sqlite-websql-orm --prod

cp -R projects/sqlite-websql-orm/package.json dist/sqlite-websql-orm/package.json
cp README.md dist/sqlite-websql-orm/README.md