import { Column, Repository, AbstractEntity, Manager, EntityInterface, EntityRepository } from 'sqlite-websql-orm';
import { Injectable } from '@angular/core';

export class User extends AbstractEntity {
    @Column('INTEGER PRIMARY KEY')
    id: number;

    @Column('TEXT')
    name: string;
}

@Injectable()
@Repository(User)
export class UserRepository extends EntityRepository {
    constructor(public manager: Manager) {
        super(manager);
    }


    // /**
    //  * That function will override the default one
    //  * @param array
    //  */
    // mapArrayToObject(array: any): EntityInterface {
    //     console.log('user mapArrayToObject used');
    //     const user: User = new User();

    //     user.id = array.id;

    //     return user;
    // }

}
