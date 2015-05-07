define(['TError'], function(TError) {
    function TEval() {
        var runtimeFrame;
        var definedFunctions = {};
        var run = true;
        var delayed = [];
        var localVariables = [];
        var currentVariables = [];
        var blockLevel = 0;
        var stack = [];
        
        
        this.setRuntimeFrame = function(frame) {
            runtimeFrame = frame;
        };
        
        this.clear = function() {
            definedFunctions = {};
            localVariables = [];
            currentVariables = [];
            delayed = [];
            stack = [];
            blockLevel = 0;
            run = true;
        };

        this.pause = function() {
            run = false;
        };
        
        this.consumeDelayed = function() {
            while (delayed.length>0 && run) {
                var execution = delayed.pop();
                execution[0].call(this, execution[1]);
            }
        };
        
        this.resume = function() {
            run = true;
            this.consumeDelayed();
        };
        
        this.stop = function() {
            run = false;
            delayed = [];
        };
        
        this.eval = function(literal, callback) {
            var result = runtimeFrame.eval(literal);
            if (run) {
                callback.call(this,result);
            } else {
                delayed.push([callback, result]);
            }
        };
        
        this.getVariable = function(identifier) {
            if (typeof (runtimeFrame[identifier]) !== 'undefined') {
                return runtimeFrame[identifier];
            }
        }
        
        this.saveVariable = function(identifier) {
            if (typeof (runtimeFrame[identifier]) !== 'undefined') {
                if (typeof localVariables[blockLevel] === 'undefined') {
                    localVariables[blockLevel] = {};
                }
                localVariables[blockLevel][identifier] = runtimeFrame[identifier];
            }
        }
        
        this.restoreVariable = function(identifier) {
            if (typeof localVariables[blockLevel] !=='undefined') {
                if (typeof localVariables[blockLevel][identifier] !== 'undefined') {
                    runtimeFrame[identifier] = localVariables[blockLevel][identifier];
                } else {
                    delete runtimeFrame[identifier];
                }
                delete localVariables[blockLevel][identifier];
            }
        }
        
        this.defaultEvalStatement = function(statement, callback) {
            this.eval(statement.raw, callback);
        };
        
        this.evalBlockStatement = function(statement, callback) {
            var i = -1;
            var evaluator = this;
            blockLevel++;
            currentVariables = [];
            function evalNextBlockItem() {
               i++;
               if (i<statement.body.length) {
                   evaluator.evalStatement(statement.body[i], evalNextBlockItem);
               } else {
                   // local variable management: erase any locally created variables
                   for (var j=0; j<currentVariables.length; j++) {
                       evaluator.restoreVariable(currentVariables[j]);
                   }
                   currentVariables = [];
                   blockLevel--;
                   callback.call(evaluator);
               }
            }
            evalNextBlockItem();
        };

        this.evalExpressionStatement = function(statement, callback) {
            this.evalExpression(statement.expression, callback, true);
        };
        
        this.evalIfStatement = function(statement, callback) {            
            var evaluator = this;
            this.evalExpression(statement.test, function(result) {
                if (result) {
                    this.evalStatement(statement.consequent, callback);                    
                } else if (statement.alternate !== null) {
                this.evalStatement(statement.alternate, callback);
                } else {
                    callback.call(evaluator);
                }
            }, true);
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
            var evaluator = this;
            this.evalExpression(statement.discriminant, function(value) {
                var i = -1;
                function testNextCase() {
                    i++;
                    if (i<statement.cases.length) {
                        var switchCase = statement.cases[i];
                        if (switchCase.test === null) {
                            evaluator.evalStatement(switchCase.consequent, testNextCase);
                        } else {
                            evaluator.evalExpression(switchCase.test, true, function(result) {
                                if (value === result) {
                                    evaluator.evalStatement(switchCase.consequent, testNextCase);
                                } else {
                                    testNextCase();
                                }
                            });
                        }
                    } else {
                        callback.call(evaluator);
                    }
                }
                testNextCase();
            }, true);
        };

        this.evalReturnStatement = function(statement, callback) {
            if (stack.length > 0) {
                // inside a function call: use function's callback instead
                var returnCallback = stack.pop();
                this.evalExpression(statement.argument, returnCallback, true);
            } else {
                // no function call: we just stop evaluation
                this.stop();
            }
        };

        this.evalThrowStatement = function(statement, callback) {
            throw "ThrowStatement Not Implemented yet";
        };
        
        this.evalTryStatement = function(statement, callback) {
            throw "TryStatement Not Implemented yet";
        };

        this.evalWhileStatement = function(statement, callback) {
            var evaluator = this;
            function loop() {
                evaluator.evalExpression(statement.test, function(test) {
                    if (test) {
                        evaluator.evalStatement(statement.body, loop);
                    } else {
                        callback.call(evaluator);
                    }
                }, true);
            }
            loop();
        };

        this.evalDoWhileStatement = function(statement, callback) {
            var evaluator = this;
            function loop() {
                evaluator.evalExpression(statement.test, function(test) {
                    if (test) {
                        evaluator.evalStatement(statement.body, loop);
                    } else {
                        callback.call(evaluator);
                    }
                }, true);
            }
            this.evalStatement(statement.body, loop);
        };

        this.evalForStatement = function(statement, callback) {
            var evaluator = this;
            function loop() {
                evaluator.evalExpression(statement.update, function() {
                    evaluator.evalExpression(statement.test, function(test) {
                        if (test) {
                            evaluator.evalStatement(statement.body, loop);
                        } else {
                            callback.call(evaluator);
                        }
                    }, true);
                }, true);
            }
            if (statement.init.type === "VariableDeclaration") {
                this.evalVariableDeclaration(statement.init, function() {
                    evaluator.evalStatement(statement.body, loop);
                });
            } else {
                this.evalExpression(statement.init, function() {
                    evaluator.evalStatement(statement.body, loop);
                }, true);
            }
        };

        this.evalForInStatement = function(statement, callback) {
            throw "For In Not Implemented yet";
        };

        this.evalDebuggerStatement = function(statement, callback) {
            this.defaultEvalStatement(statement, callback);
        };
        
        this.evalVariableDeclaration = function(declaration, callback) {
            var i = -1;
            var evaluator = this;
            function declareVariable() {
                i++;
                if (i<declaration.declarations.length) {
                    var declarator = declaration.declarations[i];
                    evaluator.evalExpression(declarator.id, function(identifier) {
                        evaluator.evalExpression(declarator.init, function(value) {
                            // local variables management: save preceeding value if any
                            evaluator.saveVariable(identifier);
                            currentVariables.push(identifier);
                            evaluator.eval(identifier+"="+value, declareVariable);
                        });
                    });
                } else {
                    callback.call(evaluator);
                }
            }
            declareVariable();
        };

        this.evalFunctionDeclaration = function(declaration, callback) {
            var evaluator = this;
            this.evalExpression(declaration.id, function(identifier) {
                definedFunctions[identifier] = {'body':declaration.body, 'params':declaration.params};
                callback.call(this);
            });
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
                    case "ParametersDeclaration":
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

        this.defaultEvalExpression = function(expression, callback) {
            callback.call(this, expression.raw);
        };
        
        this.callFunction = function(block, params, args, callback) {
            var values = [];
            var evaluator = this;
            for (var i=0; i<args.length; i++) {
                if (i< params.length) {
                    values.push({'type':'VariableDeclarator','id':params[i], 'init':args[i]});
                }
            }
            if (block.body.length>0 && block.body[0].type === 'ParametersDeclaration') {
                // reuse existing parameters declaration
                block.body[0]['declarations'] = values;
            } else {
                var parameters = {'type':'ParametersDeclaration', 'declarations':values, 'kind':'var'};
                block.body.unshift(parameters);
            }
            // Put callback in stack in case return is used
            stack.push(callback);
            this.evalBlockStatement(block, function() {
                stack.pop();
                callback.call(evaluator);
            });
        };
        
        this.evalFunctionExpression = function(expression, callback) {
            throw "Function Expression Not Implemented yet";
        };
        
        this.evalSequenceExpression = function(expression, callback) {
            var evaluator = this;
            var sequence = "";
            if (expression.expressions.length>0) {
                var i = 0;
                this.evalExpression(expression.expressions[0], function(sequence){
                    function loop() {
                        i++;
                        if (i< expression.expressions.length) {
                            this.evalExpression(expression.expressions[i], function(value) {
                                sequence += ","+value;
                                loop();
                            });
                        } else {
                            callback.call(evaluator, sequence);
                        }
                    }
                    loop();
                });
            } else {
                callback.call(this, sequence);
            }
        };
        
        this.evalUnaryExpression = function(expression, callback) {
            var evaluator = this;
            this.evalExpression(expression.argument, function(argument) {
                if (expression.prefix) {
                    callback.call(evaluator, expression.operator+argument);
                } else {
                    callback.call(evaluator, argument+expression.operator);
                }
            });
        };

        this.evalBinaryExpression = function(expression, callback) {
            var evaluator = this;
            this.evalExpression(expression.left, function(left) {
                evaluator.evalExpression(expression.right, function(right) {
                    callback.call(evaluator, left+expression.operator+right);
                });
            });
        };

        this.evalAssignementExpression = function(expression, callback) {
            var evaluator = this;
            this.evalExpression(expression.left, function(left) {
                evaluator.evalExpression(expression.right, function(right) {
                    callback.call(evaluator, left+expression.operator+right);
                });
            });
        };

        this.evalUpdateExpression = function(expression, callback) {
            var evaluator = this;
            this.evalExpression(expression.argument, function(argument) {
                if (expression.prefix) {
                    callback.call(evaluator, expression.operator+argument);
                } else {
                    callback.call(evaluator, argument+expression.operator);
                }                
            });
        };

        this.evalLogicalExpression = function(expression, callback) {
            var evaluator = this;
            this.evalExpression(expression.left, function(left) {
                evaluator.evalExpression(expression.right, function(right) {
                    callback.call(evaluator, left+expression.operator+right);
                });
            });
        };

        this.evalConditionalExpression = function(expression, callback) {
            var evaluator = this;
            this.evalExpression(expression.test, function(value) {
                if (value) {
                    evaluator.evalExpression(expression.consequent, callback);
                } else {                
                    evaluator.evalExpression(expression.alternate, callback);
                }                
            });
        };

        this.evalCallExpression = function(expression, callback) {
            var evaluator = this;
            this.evalExpression(expression.callee, function(callLiteral) {
                // Check if it is a defined function
                if (expression.callee.type === 'Identifier' && typeof definedFunctions[callLiteral] !== 'undefined') {
                    // we need to call the function with given parameters
                    evaluator.callFunction(definedFunctions[callLiteral]['body'], definedFunctions[callLiteral]['params'], expression.arguments, callback);
                    // TODO: handle case of functionexpression called
                } else {
                    if (expression.arguments.length > 0 ) {
                        var i = 0;
                        evaluator.evalExpression(expression.arguments[0], function(firstArgument) {
                            var argsString = "("+firstArgument;
                            function loop() {
                                i++;
                                if (i<expression.arguments.length) {
                                    evaluator.evalExpression(expression.arguments[i], function(argument) {
                                        argsString += ","+argument;
                                        loop();
                                    });
                                } else {
                                    argsString+=")";
                                    callback.call(evaluator, callLiteral+argsString);
                                }
                            }
                            loop();
                        });
                    } else {
                        callback.call(evaluator, callLiteral+"()");
                    }
                }
            });
        };

        this.evalNewExpression = function(expression, callback) {
            var evaluator = this;
            this.evalExpression(expression.callee, function(className) {
                if (expression.arguments.length > 0 ) {
                    var i = 0;
                    evaluator.evalExpression(expression.arguments[0], function(firstArgument) {
                        var argsString = "("+firstArgument;
                        function loop() {
                            i++;
                            if (i<expression.arguments.length) {
                                evaluator.evalExpression(expression.arguments[i], function(argument) {
                                    argsString += ","+argument;
                                    loop();
                                });
                            } else {
                                argsString+=")";
                                callback.call(evaluator, "new "+className+argsString);
                            }
                        }
                        loop();
                    });
                } else {
                    callback.call(evaluator, "new "+className+"()");
                }
            });
        };

        this.evalMemberExpression = function(expression, callback) {
            var evaluator = this;
            this.evalExpression(expression.object, function(objectName) {
                evaluator.evalExpression(expression.property, function(propertyName) {
                    callback.call(evaluator, objectName+"."+propertyName);
                });
            });
        };

        this.evalIdentifier = function(expression, callback) {
            callback.call(this, expression.name);
        };

        this.evalLiteral = function(expression, callback) {
            var value;
            if (typeof expression.value === "string") {
                value = "\""+expression.value+"\"";                
            } else {
                value = expression.value;
            }
            callback.call(this, value);
        };

        this.evalExpression = function(expression, callback, eval) {
            var evaluator = this;
            var expressionCallback = callback;
            if (expression === null) {
                callback.call(this);
            }
            if (typeof eval === "undefined") {
                eval = false;
            }
            if (eval) {
                expressionCallback = function(value) {
                    evaluator.eval(value, callback);
                };
            }
            try {
                switch (expression.type) {
                    case "FunctionExpression":
                        this.evalFunctionExpression(expression, expressionCallback);
                        break;
                    case "SequenceExpression": 
                        this.evalSequenceExpression(expression, expressionCallback);
                        break;
                    case "UnaryExpression": 
                        this.evalUnaryExpression(expression, expressionCallback);
                        break;
                    case "BinaryExpression": 
                        this.evalBinaryExpression(expression, expressionCallback);
                        break;
                    case "AssignmentExpression": 
                        this.evalAssignementExpression(expression, expressionCallback);
                        break;
                    case "UpdateExpression": 
                        this.evalUpdateExpression(expression, expressionCallback);
                        break;
                    case "LogicalExpression": 
                        this.evalLogicalExpression(expression, expressionCallback);
                        break;
                    case "ConditionalExpression": 
                        this.evalConditionalExpression(expression, expressionCallback);
                        break;
                    case "CallExpression":
                        this.evalCallExpression(expression, expressionCallback);
                        break;
                    case "NewExpression": 
                        this.evalNewExpression(expression, expressionCallback);
                        break;
                    case "MemberExpression": 
                        this.evalMemberExpression(expression, expressionCallback);
                        break;
                    case "Identifier":
                        this.evalIdentifier(expression, expressionCallback);
                        break;
                    case "Literal":
                        this.evalLiteral(expression, expressionCallback);
                        break;
                    default:
                        this.defaultEvalExpression(expression, expressionCallback);
                        break;
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


