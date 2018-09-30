import { Type as SWOType } from './Type';
import { SchemaError } from '../Errors';

/**
 * @dynamic
 */
export class SQLInjector {

    static getInjectedValue(value: string, sqlType: string): any {

        if (value === null || value === undefined) {
            return 'NULL';
        }

        if (sqlType.includes(SWOType.INTEGER)) {
            return value;
        } else if (sqlType.includes(SWOType.REAL)) {
            return value;
        } else if (sqlType.includes(SWOType.TEXT)) {
            return '"' + value + '"';
        } else if (sqlType.includes(SWOType.BLOB)) {
            return '"' + value + '"';
        } else {
            const message = 'The type % is not currently supported. Supported types: #1, #2, #3, #4'
            .replace('%', sqlType)
            .replace('#1', SWOType.INTEGER)
            .replace('#2', SWOType.REAL)
            .replace('#3', SWOType.TEXT)
            .replace('#4', SWOType.BLOB);
            throw new SchemaError(message);
        }
    }

    static setAffectation(key: string, value: any, sqltype: string): string {
        return key + ' = ' + SQLInjector.getInjectedValue(value, sqltype);
    }
}
