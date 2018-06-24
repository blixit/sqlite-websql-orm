const fs = require('fs');
import { GenratorInterface } from './generator.interface'; 
import { EntityGenerator }  from '../Commands/entity-generator';


export class RepositoryGenerator implements GenratorInterface {

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

        const content = this.generateContent();
        const output = this.out + '/repository/' + this.entity.name.toLowerCase() + '.repository.ts';

        if( ! fs.existsSync(this.out + '/repository')) {
            fs.mkdirSync(this.out + '/repository');
        }

        fs.open(output, 'w+', (err, file) => {
            if (err) throw err;
            fs.writeFile(output, content, (err) => {
                if (err) throw err;
                console.log('Repository "' + this.entity.name + '" generated in `' + this.out + '/repository` \n');
            });
        });
    }
}