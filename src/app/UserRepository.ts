import { EntityRepository, Manager, Repository } from 'sqlite-websql-orm';
import { Injectable } from '@angular/core';
import { User } from './User';

@Injectable({
  providedIn: 'root'
})
@Repository(User)
export class UserRepository extends EntityRepository {
  constructor(public manager: Manager) {
    super(manager);
    console.log('USER REPOSITORY');
  }
}
