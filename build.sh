#!/bin/bash

ng build sqlite-websql-orm --prod

cp -R projects/sqlite-websql-orm/package.json ../../dist/sqlite-websql-orm/package.json
cp readme.md dist/sqlite-websql-orm/readme.md