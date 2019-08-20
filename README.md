# php-interpreter
A PHP interpreter written by TypeScript based on PHP 7.

---

**This repository has already been migrated to [tharzen/php-interpreter](https://github.com/tharzen/php-interpreter) permanently.**

## Description
Basic architecture:
![Interpreter Architecture](https://i.imgur.com/kQoklz4.png)

This interpreter accepts PHP source code and return results after executing it.
```typescript
const php = `<?php $a = 1; echo $a; ?>`;
const interpreter = new Interpreter(php);
interpreter.run();
```

The front end is [glayzzle/php-parser](https://github.com/glayzzle/php-parser).

The back end is to evaluate PHP abstract syntax tree directly.

The evaluator uses execution stack to execute every expression and manipulates the variables in environment.

Currently there is no intermediate tier part.

### Language Specification
The PHP language specification [php-langspec](https://github.com/php/php-langspec/blob/master/spec).

### Parser
For front end parser, information can be found in [README.md](https://github.com/eou/php-parser/blob/master/README.md) and [DEV.md](https://github.com/eou/php-parser/blob/master/DEV.md).

### Memory Model 
The implementation of variable system is based on abstract model for storing variables defined in [PHP langspec - memory model](https://github.com/php/php-langspec/blob/master/spec/04-basic-concepts.md#the-memory-model).

Traditionally, an environment is linked with its outer or enclosed environment thus it could be a linked list. But the whole environments in this interpreter is constructed by a Map and we can locate each environment by its id. After the program exit one environment, we may destroy it or store it since the program may access some environments or some variables in them later.

And there is a global Heap stores all the variables and other things needed to be stored, such as function, class, interface, trait, namespace declaration in environments in case we'll use functions or create new objects of some classes defined before.

Each environment has a symbol table which contains each symbol's memory address in Heap so we can locate each symbol.

### Evaluation
Generally, the evaluator evaluates statements and expressions which will cause some side effects in environments.

For evaluating expressions, the general idea is to put a AST node into stack and then pop it, evaluate it. 

After evaluation, evaluator will push the result node into stack for next possible evaluation. The problem here is that the expression is blind to the evaluation process and next possible result node in the stack. It is necessary to design a consistent node API of stack for evaluation. And at the same time, the AST node itself can be evaluated to many information for next step.

For example, in `$a = $b;`, `$a` and `$b` are both `variable` AST node. But the memory location of `$a` and the value of `$b` are required. When the expression pushes `$a` into stack, it should tell stack what it wants is `$a`'s memory location. And then the stack will pop it, evaluate it, pushes a result node with `$a`'s memory location. Same thing goes for `$b`'s value. After the expression receives the value of `b` and the memory location of `a`, it will cause side effect in the environment: modify variable's value. During these evaluations, evaluator will access both `$a` and `$b`'s storage location but return different evaluation results.

The exception is the byref assignment: `$a = &$b`. In this situation, the evaluator only needs to return `$b`'s memory location but not its value.

And for evaluating statments, the stack will cooperate with some instruction nodes.

More details see [evaluator/README.md](https://github.com/eou/php-interpreter/tree/master/src/interpreter/evaluator/README.md).

### Development
- variable
  - scalar type `$` ✔
  - global `global` ✔
  - array `Array()` `[]` ✔
  - object
- expression
  - subscript `[]`
    - array ✔
    - string ✔
    - object
  - assignment
    - variable =
    - list-intrinsic =
    - compound-assignment-expression
    - coalesce-expression
    - `? :`
- loop
- conditional
- function
- class

## Built With
- [php-parser v3.0.0-prerelease.8](https://github.com/glayzzle/php-parser/releases/tag/3.0.0-prerelease.8)
- [TypeScript](https://www.typescriptlang.org/index.html)

## Contributing
😶[Harry](https://github.com/eou)

## License
[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
