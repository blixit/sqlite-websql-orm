import { Injectable } from '@angular/core';

import { Manager            } from '../Manager/Manager.service';
import { EntityStore        } from '../Store/EntityStore.service';
import { RepositoryStore    } from '../Store/RepositoryStore.service';
import { SQLFactory         } from './SQL.service';
import { ErrorUtils, SchemaError } from '../Errors';

@Injectable()
export class SchemaFactory {

    constructor(
        protected manager: Manager,
        protected sqlFactory: SQLFactory
    ) { }

    /**
     * Generates the database using declared repositories
     */
    generateSchema(): Promise<any> {

        const repositories: Array<any> = RepositoryStore.getSchemaSources();

        return new Promise(async (resolve, reject) => {
            let connectionHandler: any;

            try {
                await this.manager.getConnection();
                connectionHandler = this.manager.getConnector().connection;
                console.log('YO', connectionHandler);
            } catch (e) {
                throw new SchemaError(ErrorUtils.getMessage(e, 'Schema factory was not able to get the connection handler'));
            }

            const promises: Promise<any>[] = [];

            repositories.forEach((repository) => {

                const classToken = RepositoryStore.getClassToken(repository.name);
                const schema = EntityStore.getTableSchema(classToken.name);

                const createTableSql: string = this.sqlFactory.getCreateTableSql({
                    tableName: classToken.name,
                    schema: schema,
                    erase: this.manager.getConfiguration().options.erase
                });

                promises.push(connectionHandler.executeSql(createTableSql, []));
            });

            Promise.all(promises).then(values => {
                resolve(connectionHandler);
            }).catch(errors => {
                reject(errors);
            });
        });
    }
}
