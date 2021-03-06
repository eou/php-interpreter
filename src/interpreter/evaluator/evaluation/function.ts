/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The file for user-defined function declaration evaluation (not built-in functions)
 * @see
 * https://github.com/php/php-langspec/blob/master/spec/13-functions.md
 * https://www.php.net/manual/en/functions.user-defined.php
 * https://www.php.net/manual/en/language.references.return.php
 */

import { Node as ASTNode } from "../../php-parser/src/ast/node";
import { Evaluator, IStkNode, StkNodeKind, stkPop } from "../evaluator";
import { IFunction, IParameter } from "../memory";

/**
 * @example
 * An unconditionally defined function is a function whose definition is at the top level of a script.
 * A conditionally defined function is a function whose definition occurs inside a compound statement.
 * Until the outer function is called at least once, its inner function does not exist.
 * Even if the outer function is called, if its runtime logic bypasses the definition of the inner function, that inner function still does not exist.
 * function ucf1() { ... }
 * function ucf2() { function cf2() { ... } }
 * cf2(); // Error; call to non-existent function
 * ucf2(); // now cf2 exists
 * cf2(); // so we can call it
 *
 * function-definition:
 * function-definition-header   compound-statement
 * function-definition-header:
 * function   &_opt   name   (   parameter-declaration-list_opt   )   return-type_opt
 */
export const evaluateFunction = function(this: Evaluator) {
    const functionNode: ASTNode = stkPop(this.stk, StkNodeKind.ast, "function");

    // evaluate functions to IFunction abstract model, a temporary object
    const functionObj: IFunction = {
        args: [],
        body: null,
        byref: false,
        name: "",
        st: new Map(),
        type: "",
    };

    functionObj.type = functionNode.data.kind;
    functionObj.name = functionNode.data.name.name;
    functionNode.data.arguments.forEach((parameterNode: ASTNode) => {
        // parameters can be passed by reference
        // https://www.php.net/manual/en/language.references.pass.php
        const parameter: IParameter = {
            byref: parameterNode.byref,
            name: parameterNode.name.name,
            nullable: parameterNode.nullable,
            type: parameterNode.type,
            value: parameterNode.value,
            variadic: parameterNode.variadic,
        };
        functionObj.args.push(parameter);
        console.log(parameter);
    });
    functionObj.body = functionNode.data.body;   // could be a block Node
    functionObj.byref = functionNode.data.byref; // if return a reference or not

    // save it to global environment because all funtions in php are global
    this.heap.ram.set(this.heap.ptr++, functionObj);
    this.env[0].st._function.set(functionObj.name, this.heap.ptr - 1);
};
