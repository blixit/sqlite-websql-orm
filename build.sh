#!/bin/bash

ng build sqlite-websql-orm --prod

cp -R docs ../../dist/sqlite-websql-orm
cp readme.md ../../dist/sqlite-websql-orm/readme.md
