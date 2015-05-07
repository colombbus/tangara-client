define(['TError'], function(TError) {
    function TEval() {
        var runtimeFrame;
        var definedFunctions = {};
        
        this.setRuntimeFrame = function(frame) {
            runtimeFrame = frame;
        };
        
        this.clear = function() {
            definedFunctions = {};
        };

        
        this.eval = function(literal, callback) {
            var result = runtimeFrame.eval(literal);
            if (runtimeFrame.ready()) {
                callback(result);
            } else {
                runtimeFrame.whenReady(callback, result);
            }
        };
        
        this.defaultEvalStatement = function(statement, callback) {
            this.eval(statement.raw, callback);
        };
        
        this.evalBlockStatement = function(statement, callback) {
            var i = -1;
            var evaluator = this;
            
            function evalNextBlockItem() {
               i++;
               if (i<statement.body.length) {
                   evaluator.evalStatement(statement.body[i], evalNextBlockItem);
               } else {
                   callback();
               }
            }
            evalNextBlockItem();
            //TODO: erase local variables
        };

        this.evalExpressionStatement = function(statement, callback) {
            this.evalExpression(statement.expression, true);
        };
        
        this.evalIfStatement = function(statement, callback) {            
            this.evalExpression(statement.test, true, function(result) {
                if (result) {
                    this.evalStatement(statement.consequent, callback);                    
                } else if (statement.alternate !== null) {
                this.evalStatement(statement.alternate, callback);
                } else {
                    callback();
                }
            });
        };

        this.evalLabeledStatement = function(statement, callback) {
            throw "LabeledStatement Not Implemented yet";
        };

        this.evalBreakStatement = function(statement, callback) {
            throw "BreakStatement Not Implemented yet";            
        };

        this.evalContinueStatement = function(statement, callback) {
            throw "ContinueStatement Not Implemented yet";            
        };
        
        this.evalWithStatement = function(statement, callback) {
            throw "With statement is not supported";            
        };
        
        this.evalSwitchStatement = function(statement, callback) {
            this.evalExpression(statement.discriminant, true, function(value) {
                var i = -1;
                function testNextCase() {
                    i++;
                    if (i<statement.cases.length) {
                        var switchCase = statement.cases[i];
                        if (switchCase.test === null) {
                            this.evalStatement(switchCase.consequent, testNextCase);
                        } else {
                            this.evalExpression(switchCase.test, true, function(result) {
                                if (value === result) {
                                    this.evalStatement(switchCase.consequent, testNextCase);
                                } else {
                                    testNextCase();
                                }
                            });
                        }
                    } else {
                        callback();
                    }
                }
                testNextCase();
            });
            
            
            var value = this.evalExpression(statement.discriminant, true);
        };

        this.evalReturnStatement = function(statement, callback) {
            throw "ReturnStatement Not Implemented yet";
        };

        this.evalThrowStatement = function(statement, callback) {
            throw "ThrowStatement Not Implemented yet";
        };
        
        this.evalTryStatement = function(statement, callback) {
            throw "TryStatement Not Implemented yet";
        };

        this.evalWhileStatement = function(statement, callback) {
            while (this.evalExpression(statement.test, true)) {
                this.evalStatement(statement.body);
            }
        };

        this.evalDoWhileStatement = function(statement, callback) {
            do {
                this.evalStatement(statement.body);
            } while (this.evalExpression(statement.test, true));
        };

        this.evalForStatement = function(statement, callback) {
            if (statement.init.type === "VariableDeclaration") {
                for (this.evalVariableDeclaration(statement.init);this.evalExpression(statement.test, true);this.evalExpression(statement.update, true)) {
                    this.evalStatement(statement.body);
                }                
            } else {
                for (this.evalExpression(statement.init, true);this.evalExpression(statement.test, true);this.evalExpression(statement.update, true)) {
                    this.evalStatement(statement.body);
                }
            }
        };

        this.evalForInStatement = function(statement, callback) {
            /*if (statement.left.type === "VariableDeclaration") {
                for (this.evalVariableDeclaration(statement.left) in this.evalExpression(statement.right)) {
                    
                }
            }*/
            throw "For In Not Implemented yet";
            
        };

        this.evalDebuggerStatement = function(statement, callback) {
            this.defaultEvalStatement(statement, callback);
        };
        
        this.evalVariableDeclaration = function(declaration, callback) {
            for (var i=0; i<declaration.declarations.length; i++) {
                var declarator = declaration.declarations[i];
                var value = this.evalExpression(declarator.init);
                this.eval(declarator.id+"="+value);
            }
        };

        this.evalFunctionDeclaration = function(declaration, callback) {
            var identifier = this.evalExpression(declaration.id);
            definedFunctions[identifier] = {'body':declaration.body, 'params':declaration.params};
            callback();
            // TODO: do we need to eval function decalaration into RuntimeFrame?
        };
        
        this.evalStatement = function(statement, callback) {
            try {
                switch (statement.type) {
                    case "BlockStatement":
                        this.evalBlockStatement(statement, callback);
                        break;
                    case "ExpressionStatement":
                        this.evalExpressionStatement(statement, callback);
                        break;
                    case "IfStatement": 
                        this.evalIfStatement(statement, callback);
                        break;
                    case "LabeledStatement":
                        this.evalLabeledStatement(statement, callback);
                        break;
                    case "BreakStatement":
                        this.evalBreakStatement(statement, callback);
                        break;
                    case "ContinueStatement":
                        this.evalContinueStatement(statement, callback);
                        break;
                    case "WithStatement":
                        this.evalWithStatement(statement, callback);
                        break;
                    case "SwitchStatement":
                        this.evalSwitchStatement(statement, callback);
                        break;
                    case "ReturnStatement":
                        this.evalReturnStatement(statement, callback);
                        break;
                    case "ThrowStatement":
                        this.evalThrowStatement(statement, callback);
                        break;
                    case "TryStatement":
                        this.evalTryStatement(statement, callback);
                        break;
                    case "WhileStatement":
                        this.evalWhileStatement(statement, callback);
                        break;
                    case "DoWhileStatement":
                        this.evalDoWhileStatement(statement, callback);
                        break;
                    case "ForStatement":
                        this.evalForStatement(statement, callback);
                        break;
                    case "ForInStatement":
                        this.evalForInStatement(statement, callback);
                        break;
                    case "DebuggerStatement":
                        this.evalDebuggerStatement(statement, callback);
                        break;
                    case "VariableDeclaration":
                        this.evalVariableDeclaration(statement, callback);
                        break;                    
                    case "FunctionDeclaration":
                        this.evalFunctionDeclaration(statement, callback);
                        break;                    
                    default:
                        this.defaultEvalStatement(statement, callback);
                        break;
                }
            } catch (err) {
                if (!(err instanceof TError)) {
                    var error = new TError(err);
                    error.setLines([statement.start,statement.end]);
                    error.detectError();
                    throw error;
                } else {
                    throw err;
                }
            }
        };

        this.defaultEvalExpression = function(expression) {
            return expression.raw;
        };
                
        this.evalFunctionExpression = function(expression) {
            
            throw "Function Expression Not Implemented Yet";
        };
        
        this.evalSequenceExpression = function(expression) {
            var sequence = "";
            if (expression.expressions.length>0) {
                sequence = this.evalExpression(expression.expressions[0]);
                for (var i=1; i< expression.expressions.length; i++) {
                    sequence += ","+this.evalExpression(expression.expressions[i]);
                }
            }
            return sequence;
        };
        
        this.evalUnaryExpression = function(expression) {
            try {
                var argument = this.evalExpression(expression.argument);
                if (expression.prefix) {
                    return expression.operator+argument;
                } else {
                    return argument+expression.operator;
                }
            } catch (err) {
                return this.defaultEvalExpression(expression);
            }
        };

        this.evalBinaryExpression = function(expression) {
            var left = this.evalExpression(expression.left);
            var right = this.evalExpression(expression.right);
            return left+expression.operator+right;
        };

        this.evalAssignementExpression = function(expression) {
            var left, right;
            if (expression.left.type === 'Identifier') {
                left = this.evalIdentifier(expression.left);
            } else {
                // left is expression
                left = this.evalExpression(expression.left);
            }
            right = this.evalExpression(expression.right);
            return left+expression.operator+right;
        };

        this.evalUpdateExpression = function(expression) {
            var argument = this.evalExpression(expression.argument);
            if (expression.prefix) {
                return expression.operator+argument;
            } else {
                return argument+expression.operator;
            }
        };

        this.evalLogicalExpression = function(expression) {
            var left,right;
            left = this.evalExpression(expression.left);
            right = this.evalExpression(expression.right); 
            return left+expression.operator+right;
        };

        this.evalConditionalExpression = function(expression) {
            if (this.evalExpression(expression.test)) {
                return this.evalExpression(expression.consequent);
            } else {                
                return this.evalExpression(expression.alternate);
            }
        };

        this.evalCallExpression = function(expression) {
            var callLiteral = this.evalExpression(expression.callee);
            // Check if it is a defined function
            if (expression.callee.type === 'identifier' && typeof definedFunctions[callLiteral] !== 'undefined') {
                // we need to call the function with given parameters
                // Todo: do we have to do it even if eval is set to false?
                var functionExpression = {'type':'FunctionExpression', 'id':callLiteral, 'params':definedFunctions[callLiteral]['params'], 'body':definedFunctions[callLiteral]['body']};
                return this.evalExpression(functionExpression, true);
            } else {
                if (expression.arguments.length > 0 ) {
                    arguments = "("+this.evalExpression(expression.arguments[0]);
                    for (var i=1; i<expression.arguments.length; i++) {
                        arguments += ","+this.evalExpression(expression.arguments[i]);
                    }
                    arguments += ")";
                } else {
                    arguments = "()";
                }
            }
            return callLiteral+arguments;
        };

        this.evalNewExpression = function(expression) {
            var className = this.evalExpression(expression.callee);
            var arguments;
            if (expression.arguments.length > 0 ) {
                arguments = "("+this.evalExpression(expression.arguments[0]);
                for (var i=1; i<expression.arguments.length; i++) {
                    arguments += ","+this.evalExpression(expression.arguments[i]);
                }
                arguments += ")";
            } else {
                arguments = "()";
            }
            return "new "+className+arguments;
        };

        this.evalMemberExpression = function(expression) {
            var objectName = this.evalExpression(expression.object);
            var propertyName = this.evalExpression(expression.property);
            return objectName+"."+propertyName;
        };

        this.evalIdentifier = function(expression) {
            return expression.name;
        };

        this.evalLiteral = function(expression) {
            if (typeof expression.value === "string") {
                return "\""+expression.value+"\"";                
            }
            return expression.value;
        };

        this.evalExpression = function(expression, eval, callback) {
            var result;
            if (expression === null) {
                return;
            }
            if (typeof eval === "undefined") {
                eval = false;
            }
            try {
                switch (expression.type) {
                    case "FunctionExpression": 
                        result = this.evalFunctionExpression(expression);
                        break;
                    case "SequenceExpression": 
                        result = this.evalSequenceExpression(expression);
                        break;
                    case "UnaryExpression": 
                        result = this.evalUnaryExpression(expression);
                        break;
                    case "BinaryExpression": 
                        result = this.evalBinaryExpression(expression);
                        break;
                    case "AssignmentExpression": 
                        result = this.evalAssignementExpression(expression);
                        break;
                    case "UpdateExpression": 
                        result = this.evalUpdateExpression(expression);
                        break;
                    case "LogicalExpression": 
                        result = this.evalLogicalExpression(expression);
                        break;
                    case "ConditionalExpression": 
                        result = this.evalConditionalExpression(expression);
                        break;
                    case "CallExpression":
                        result = this.evalCallExpression(expression, eval);
                        break;
                    case "NewExpression": 
                        result = this.evalNewExpression(expression);
                        break;
                    case "MemberExpression": 
                        result = this.evalMemberExpression(expression);
                        break;
                    case "Identifier":
                        result = this.evalIdentifier(expression);
                        break;
                    case "Literal":
                        result = this.evalLiteral(expression);
                        break;
                    default:
                        result = this.defaultEvalExpression(expression);
                        break;
                }
                if (eval) {
                    return this.eval(result, callback);
                } else {
                    return result;
                }
            } catch (err) {
                if (!(err instanceof TError)) {
                    var error = new TError(err);
                    error.setLines([expression.start,expression.end]);
                    error.detectError();
                    throw error;
                } else {
                    throw err;
                }
            }
        };

    }
    
    
    
    return TEval;
});


