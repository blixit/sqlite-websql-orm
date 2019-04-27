import { Observable } from 'rxjs';
import { Component, OnInit, Type } from '@angular/core';
import { Manager, Notifier, SchemaFactory, EntityInterface, AbstractEntity } from 'sqlite-websql-orm';
import { User } from './User';
import { UserRepository } from './UserRepository';
import { first } from 'rxjs/operators';

export class Test extends AbstractEntity implements EntityInterface { }

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'swo';

  constructor(
    public manager: Manager,
    public userRepository: UserRepository,
    public notifier: Notifier,
    private schema: SchemaFactory
  ) { }

  async ngOnInit() {
    // console.log('APP', this.userRepository);
    // open
    this.notifier.onSchemaReady().subscribe(async data => {
      // Do something when your schema is created
    });
    // // this.schema.generateSchema().subscribe();
    this.userRepository.findAll().subscribe(async (users: User[]) => {
      console.log(users);
      const user = users.length > 0 ? users[users.length - 1] : new User();
      user.id = user.id ? user.id + 1 : 1;
      try {
        await this.manager.persist(user).asyncFlush();
      } catch (e) {
        console.log('eeee', e);
      }
    });
  }
}
