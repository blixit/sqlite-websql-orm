import { ManagerInterface } from './Manager.interface';
import { Configuration, ConfigurationInterface } from '../Configuration';

export class Manager implements ManagerInterface {

    protected configuration: ConfigurationInterface;

    fake() {}

    connect() {
        //
    }

    setConfiguration(configuration: ConfigurationInterface): ManagerInterface {
      this.configuration = configuration;

      return this;
    }

    getConfiguration(): ConfigurationInterface {
      return this.configuration;
    }
}
