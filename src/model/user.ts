import { Column, Repository } from 'sqlite-websql-orm';

export class User {
    @Column('INTEGER')
    id: number;
}

@Repository(User)
export class UserRepository {

}
