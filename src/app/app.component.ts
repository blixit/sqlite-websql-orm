import { Component, OnInit } from '@angular/core';
import { User, UserRepository } from '../model/user';
import { Manager, EntityInterface } from 'sqlite-websql-orm';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ld';
  user: User = new User();

  constructor(
    public manager: Manager,
    public userRepository: UserRepository
  ) {

  }

  async ngOnInit() {
    const c = await this.manager.getConnection();

    this.manager.persist(this.user);
    this.manager.persist(this.user);
    this.manager.flush().then((object: User) => {
      console.log('FLUSHED');
    });

    // this.testRepository().then(() => {

    // });

  }

  async testRepository() {
    this.user.name = 'alain';
    return this.userRepository.insert(this.user)
    .then(data => {
      console.log('DATA insert', data);

      this.userRepository.select({}).then(selected => {
        console.log('DATA select', selected);
        selected[0].id = 1;
        this.userRepository.update(selected[0]).then(updated => {
          console.log('DATA update', updated);
          this.userRepository.delete(selected[0]).then((deleted) => {
            console.log('DATA delete', deleted);
          });
        })
        .catch(error => {
          console.log('Error update', error);
        });
      })
      .catch(error => {
        console.log('Error select', error);
      });
    })
    .catch(error => {
      console.log('Error insert', error);
    });

    // this.manager.flush().then(() => {
    //   console.log('Flushed');
    // });
  }

}
