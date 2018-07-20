import { Component, OnInit } from '@angular/core';
import { Configuration, ConfigurationInterface } from 'projects/sqlite-websql-orm/src/lib/Configuration';
import { RepositoryStore } from 'projects/sqlite-websql-orm/src/lib/Store/RepositoryStore.service';
import { User, UserRepository } from '../model/user';

@Component({
  selector: 'ld-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ld';
  user: User = new User();
  userRepository: UserRepository = new UserRepository();

  ngOnInit() {
    this.testConfiguration({
      name: '',
      location: '',
      options: {
        adapter: ''
      }
    });
  }

  testConfiguration(c: ConfigurationInterface) {
    Configuration.merge(c);
    console.log('Configuration', c);

    console.log('RepositoryStore repos', RepositoryStore.store);
    console.log('RepositoryStore sources', RepositoryStore.mapNamesConstructors);
  }

}
