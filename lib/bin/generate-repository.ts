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

