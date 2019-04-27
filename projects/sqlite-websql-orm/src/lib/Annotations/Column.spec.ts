import { async } from '@angular/core/testing';
import { Column } from './Column';
import { Type } from '../Schema/Type';
import { EntityStore, ColumnAnnotationInfo } from '../Store/EntityStore.service';

describe('Annotation Column', () => {

    class A {
        @Column(Type.PKEY, 'id')
        field;
    }

    const constantes = {
        expectedPropertyKey: 'field',
        expectedFieldname: 'id'
    };

    beforeEach(async(() => {
    }));

    afterEach(async(() => {
    }));

    it('should check the annotation workout', async(async () => {
        const schema: ColumnAnnotationInfo[] = EntityStore.getTableSchema(A.name);
        expect(schema).not.toBeNull();
        expect(schema).not.toBeUndefined();

        let annotationFound = false;
        let item;
        for (item in schema) {
            if (item && schema[item].propertyKey === constantes.expectedPropertyKey) {
                annotationFound = true;
                break;
            }
        }
        expect(annotationFound).toBe(true);
        expect(schema[item].type).toBe(Type.PKEY);
        expect(schema[item].name).toBe(constantes.expectedFieldname);
    }));

});
