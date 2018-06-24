const fs = require('fs');
import { GenratorInterface } from './generator.interface'; 


export class EntityGenerator implements GenratorInterface {

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

        if( ! fs.existsSync(this.out + '/model')) {
            fs.mkdirSync(this.out + '/model');
        }

        fs.open(output, 'w+', (err, file) => {
            if (err) throw err;
            fs.writeFile(output, content, (err) => {
                if (err) throw err;
                console.log('Entity "' +this.entity.name + '" generated in `' + this.out + '/model` \n');                
            });
        });

    }
}