import { Component, OnInit } from '@angular/core';
import { User, UserRepository } from '../model/user';
import { Manager } from 'sqlite-websql-orm';

@Component({
  selector: 'ld-root',
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
    const d = new Date();
    const c = await this.manager.getConnection();
    const d2 = new Date();

    console.log(d2.getMilliseconds() - d.getMilliseconds() , 'manager', Manager);
    this.manager.persist(this.user);
    this.manager.persist(this.user);

    this.user.name = 'alain';
    this.userRepository.insert(this.user)
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
