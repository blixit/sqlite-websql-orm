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
    // this.user.id = 5;
    this.user.name = 'coco';
    this.manager.merge(this.user);
    // this.manager.persist(this.user);

    this.testRepository().then(async() => {
      // try {
      //   await this.manager.flush();
        console.log('FLUSHED');
      // } catch (error) {
      //   console.log('FLUSHED error', error);
      // }
    });

  }

  async testRepository() {
    this.user.name = 'alain';
    return this.userRepository.insert(this.user)
    .then(data => {
      console.log('DATA insert', data);

      this.userRepository.select({}).then(selected => {
        console.log('DATA select', selected);
        // selected[0].id = 1;
        this.userRepository.update(selected[0], {
          affectations: [ 'id=4', 'name = "yop"' ]
        }).then(updated => {
          console.log('DATA update', updated);
          console.log('SQL ', this.userRepository.getSqlService().getLastQuery());
          this.userRepository.delete(selected[0]).then((deleted) => {
            console.log('DATA delete', deleted);
          });
        })
        .catch(error => {
          console.log('Error update', error);
          console.log('SQL ', this.userRepository.getSqlService().getLastQuery());
        });
      })
      .catch(error => {
        console.log('Error select', error);
      });
    })
    .catch(error => {
      console.log('Error insert', error);
      console.log('SQL ', this.userRepository.getSqlService().getLastQuery());
    });

    // this.manager.flush().then(() => {
    //   console.log('Flushed');
    // });
  }

}
