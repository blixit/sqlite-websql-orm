const EntityGenerator = require('../Commands/entity-generator').EntityGenerator; 
const RepositoryGenerator = require('../Commands/repository-generator').RepositoryGenerator; 

class SwoCommand {

    private defaultPath = process.cwd();

    private entity = {
        name: '',
        path: this.defaultPath + '/src/app/model',
    }

    private out = this.defaultPath + '/src/app';
    private action: Function = this.run;

    constructor(){
        let cpt = 0;
        let classNamePattern = /^([a-zA-Z])([a-zA-Z0-9_]{0,})/;

        process.argv.forEach( (val, index, array) => {
            if(index < 2) return;
        
            switch(val){
                case '-e': 
                    if(array[++index]){
                        if ( ! array[index].match(classNamePattern)) {
                            throw new Error('The class name should follow the pattern : ' + classNamePattern);
                        }

                        this.entity.name = array[index];
                    } else {
                        throw new Error('Entity name is required after option \''+val+'\' ')
                    }

                    break;
                case '-h': 
                    this.action = this.help;
                    break;
                case '-s': 
                    if(array[++index]){
                        this.entity.path = array[index];
                    } else {
                        throw new Error('Path required after option \''+val+'\' ')
                    }
                    break;
                case '-o':
                    if(array[++index]){
                        this.out = array[index];
                    } else {
                        throw new Error('Path required after option \''+val+'\' ')
                    }
                    break;
                default: 
                    return;
            }

            cpt++;
        });

        if(cpt === 0){
            this.action = this.help;            
        }

        this.action();
    }

    run(){

        if(this.entity.name.length === 0){
            throw new Error('Entity name is required');
        }

        const entityGenerator = new EntityGenerator(this.entity, this.out);
        entityGenerator.generate();

        const generator = new RepositoryGenerator(this.entity, this.out);
        generator.generate();
    }

    help(){
        var pjson = require('../../package.json');

        const usage = ""+
        "swo version: " + pjson.version + "\n"+
        "swo <option> value [, <option> value ...]\n\n"+
        "The options list: \n"+
        "-e:\t(required) set the class name\n"+
        "-h:\t(optional) display this help\n"+
        "-o:\t(optional) set custom output directory for repositories and entities if -s is not provided\n"+
        "-s:\t(optional) set custom directory for entities\n";

        console.log(usage);
    }
}

new SwoCommand();