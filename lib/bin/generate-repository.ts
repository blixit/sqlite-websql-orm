const fs = require('fs');

let defaultPath = process.cwd();

let entity = {
    name: '',
    path: defaultPath + '/app/model',
}

let out = defaultPath + '/app';

process.argv.forEach(function (val, index, array) {
    if(index < 2) return;

    if(index === 2) {
        entity.name = val;
    }

    switch(val){
        case '-s': 
            if(array[++index]){
                entity.path = array[index];
            } else {
                throw new Error('Path required after option \''+val+'\' ')
            }
            break;
        case '-o':
            if(array[++index]){
                out = array[index];
                console.log('OUT', out)
            } else {
                throw new Error('Path required after option \''+val+'\' ')
            }
            break;
    }
});

if(entity.name.length === 0){
    throw new Error('Entity name is required');
}

interface GenratorInterface {
    generateContent(): string;
    generate();        
}

class EntityGenerator implements GenratorInterface {

    constructor(private entity: any, private out: string){

    }

    generateContent(): string {
        return ""+
        "import { Column, AbstractEntity } from 'sqlite-websql-orm';\n\n"+
        "export class " + this.entity.name + " extends AbstractEntity {\n\n"+ 
        "}\n";
    }

    generate() {
        const content = this.generateContent();
        const output = this.out + '/model/' + this.entity.name.toLowerCase() + '.entity.ts';

        if( ! fs.existsSync(out + '/model')) {
            fs.mkdirSync(out + '/model');
        }

        fs.open(output, 'w+', function (err, file) {
            if (err) throw err;
            fs.writeFile(output, content, function (err) {
                if (err) throw err;
                console.log('Entity "' + entity.name + '" generated in `' + out + '/model` \n');                
            });
        });

    }
}

class RepositoryGenerator implements GenratorInterface {

    constructor(private entity: any, private out: string){

    }

    generateContent(): string {
        return ""+
        "import { Repository, Manager, EntityRepository } from 'sqlite-websql-orm';\n"+
        "import { Injectable } from '@angular/core';\n"+
        "import { " + this.entity.name + " } from '../model/" + this.entity.name.toLowerCase() + ".entity';\n"+
        "\n"+
        "@Injectable()\n"+
        "@Repository(" + this.entity.name + ")\n"+
        "export class " + this.entity.name + "Repository extends EntityRepository {\n"+
        "\tconstructor(public manager: Manager) {\n"+
        "\t\tsuper(manager);\n"+
        "\t}\n"+
        "\n"+
        "}\n";
    }

    generate(){
        const entityGenerator = new EntityGenerator(this.entity, this.out);
        entityGenerator.generate();

        const content = this.generateContent();
        const output = this.out + '/repository/' + this.entity.name.toLowerCase() + '.repository.ts';

        if( ! fs.existsSync(out + '/repository')) {
            fs.mkdirSync(out + '/repository');
        }

        fs.open(output, 'w+', function (err, file) {
            if (err) throw err;
            fs.writeFile(output, content, function (err) {
                if (err) throw err;
                console.log('Repository "' + entity.name + '" generated in `' + out + '/repository` \n');
            });
        });
    }
}

const generator = new RepositoryGenerator(entity, out);
generator.generate();