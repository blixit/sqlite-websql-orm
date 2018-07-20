import { Injectable } from '@angular/core';

import { Manager } from '../Manager/Manager.service';
import { EntityStore } from '../Store/EntityStore.service';
import { RepositoryStore } from '../Store/RepositoryStore.service';
import { SQLFactory } from './SQL.service';

@Injectable()
export class SchemaFactory {

    constructor(
        protected manager: Manager,
        protected sqlFactory: SQLFactory
    ) { }

    generateSchema(repositories: Array<any> = []): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let db: any;

            try {
                db = await this.manager.connect();
            } catch (e) {
                reject(e);
                return;
            }

            const promises: Promise<any>[] = [];

            repositories.forEach((repository) => {

                const classToken = RepositoryStore.getClassToken(repository.name);
                const schema = EntityStore.columnAnnotations[classToken.name];

                const createTableSql: string = this.sqlFactory.getCreateTableSql({
                    tableName: classToken.name,
                    schema: schema,
                    erase: false
                });

                promises.push(db.executeSql(createTableSql, []));

            });

            Promise.all(promises).then(values => {
                resolve(db);
            }).catch(errors => {
                reject(errors);
            });
        });
    }
}
