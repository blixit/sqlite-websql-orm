import { async } from '@angular/core/testing';
import { Column } from './Column';
import { Type } from '../Schema/Type';
import { EntityStore, ColumnAnnotationInfo } from '../Store/EntityStore.service';
import { Join, JoinOptionsInterface } from './Join';

describe('Annotation Join', () => {

    class A {
        @Join({
            class: 'Profession',
            field: 'id',
            getter: 'getProfession'
        })
        @Column(Type.PKEY, 'id')
        field;
    }

    const constantes = {
        expectedClass: 'Profession',
        expectedFieldname: 'id',
        expectedGetter: 'getProfession'
    };

    beforeEach(async(() => {
    }));

    afterEach(async(() => {
    }));

    it('should check the annotation workout', async(async () => {
        const joinOptions: JoinOptionsInterface[] = EntityStore.getJointureAnnotations(A.name);
        expect(joinOptions).not.toBeNull();
        expect(joinOptions).not.toBeUndefined();

        let annotationFound = false;
        let item;
        for (item in joinOptions) {
            if (item && joinOptions[item].field === constantes.expectedFieldname) {
                annotationFound = true;
                break;
            }
        }
        expect(annotationFound).toBe(true);
        expect(joinOptions[item].class).toBe(constantes.expectedClass);
        expect(joinOptions[item].getter).toBe(constantes.expectedGetter);
    }));

});
