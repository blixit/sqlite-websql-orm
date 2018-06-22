import { Repository, Manager, EntityRepository } from 'sqlite-websql-orm';
import { Injectable } from '@angular/core';
import { User } from '../model/user.entity';

@Injectable()
@Repository(User)
export class UserRepository extends EntityRepository {
	constructor(public manager: Manager) {
		super(manager);
	}

}
