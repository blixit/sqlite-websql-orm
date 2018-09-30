# Known isues

## Critical dependency: the request of a dependency is an expression

```
WARNING in /var/www/html/node_modules/@angular/core/esm5/core.js
6558:15-36 Critical dependency: the request of a dependency is an expression
```

if you meet this kind of issue, try this solution. For instance, add the @angular and rxjs paths if they are causing the issue. 

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": { 
    // ...
    "paths": { 
      "@angular/*": ["../../node_modules/@angular/*"],
      "rxjs/*": ["../../node_modules/rxjs/*"]
    },
    // ...
  },
```