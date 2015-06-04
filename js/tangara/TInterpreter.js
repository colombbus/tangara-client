define(['TError'], function(TError) {
    function TInterpreter() {
        var runtimeFrame;
        var definedFunctions = {};
        var running = false;
        var suspended = false;
        var localVariables = [];
        var currentVariables = [];
        var blockLevel = 0;
        var cached = [[]];
        var log;
        var stackPointer = [0]
        var executionLevel = 0;
        var callers = [];
        
        // main statements stack
        var stack = [[]];
        
        /* Initialization */
        
        this.setRuntimeFrame = function(frame) {
            runtimeFrame = frame;
        };

        this.setLog = function(element) {
            log = element;
        };

        
        /* Lifecycle management */
        
        this.clear = function() {
            definedFunctions = {};
            localVariables = [];
            currentVariables = [];
            stack = [[]];
            cached = [[]];
            blockLevel = 0;
            running = false;
            suspended = false;
            stackPointer = [0];
            executionLevel = 0;
            callers = [];
        };

        this.suspend = function() {
            suspended = true;
        };
        
        this.resume = function() {
            if (suspended) {
                suspended = false;
                this.run();
            }
        };
        
        this.stop = function() {
            stack = [[]];
        };
        
        this.start = function() {
            if (!running) {
                localVariables = [];
                currentVariables = [];
                blockLevel = 0;
                stackPointer = [0];
                executionLevel = 0;
                callers = [];                
                this.run();
            }
        };
        
        this.addStatement = function(statement) {
            stack[0].push(statement);
            if (!running) {
                this.start();
            }
        };
        
        this.addStatements = function(statements) {
            for (var i = 0; i<statements.length; i++) {
                stack[0].push(statements[i]);
            }
            if (!running) {
                this.start();
            }
        };

        this.insertStatement = function(statement) {
            statement.inserted = true;
            stack[executionLevel].unshift(statement);
            stackPointer[executionLevel]++;
        };

        this.insertStatements = function(statements) {
            for (var i=statements.length-1; i>=0; i--) {
                this.insertStatement(statements[i]);
            }
        };
        
        logCommand = function(command) {
            log.addCommand(command);
        };
        
        suspendedException = function(){};
        
        this.run = function() {
            try {
                running = true;
                while (!suspended && stack[executionLevel].length>0) {
                    var currentLevel = executionLevel;
                    stackPointer[executionLevel] = 0;
                    var statement = stack[executionLevel][0];
                    var consume = this.evalStatement(statement);
                    if (currentLevel === executionLevel) {
                        // We haven't changed execution level
                        if (consume === true) {
                            stack[executionLevel].splice(stackPointer[executionLevel], 1);
                            if (typeof statement.inserted === 'undefined') {
                                logCommand(statement.raw);
                            }
                            if (typeof statement.controls !== 'undefined') {
                                delete statement.controls;
                            }
                        } else if (consume !== false) {
                            // consume is indeed a new statement that replaces previous one
                            stack[executionLevel][stackPointer[executionLevel]] = consume;
                        }
                    }
                }
                running = false;
            } catch (err) {
                running = false;
                throw err;
            }
        };
        
        /* Variable management */
        
        getVariable = function(identifier) {
            if (typeof (runtimeFrame[identifier]) !== 'undefined') {
                return runtimeFrame[identifier];
            }
        };
        
        saveVariable = function(identifier) {
            if (typeof (runtimeFrame[identifier]) !== 'undefined') {
                if (typeof localVariables[blockLevel] === 'undefined') {
                    localVariables[blockLevel] = {};
                }
                localVariables[blockLevel][identifier] = runtimeFrame[identifier];
            }
        };
        
        restoreVariable = function(identifier) {
            if (typeof localVariables[blockLevel+1] !=='undefined') {
                if (typeof localVariables[blockLevel+1][identifier] !== 'undefined') {
                    runtimeFrame[identifier] = localVariables[blockLevel+1][identifier];
                    delete localVariables[blockLevel+1][identifier];
                } else {
                    delete runtimeFrame[identifier];
                }
            } else {
                delete runtimeFrame[identifier];                
            }
        };
        
        /* Block management */
        
        enterBlock = function() {
            blockLevel++;
            currentVariables = [];
        };
        
        leaveBlock = function() {
            // local variable management: erase any locally created variables
            blockLevel--;                       
            for (var j=0; j<currentVariables.length; j++) {
                restoreVariable(currentVariables[j]);
            }
            currentVariables = [];
        };
        
        /* Execution level management */

        raiseExecutionLevel = function(caller) {
            if (typeof caller !== 'undefined') {
                callers.push(caller);
            }
            executionLevel++;
            stack[executionLevel] = [];
            cached[executionLevel] = [];
        };
        
        lowerExecutionLevel = function(value) {
            if (executionLevel > 0) {
                stack[executionLevel] = [];
                cached[executionLevel] = [];
                executionLevel--;
                if (callers.length > executionLevel) {
                    var expression = callers.pop();
                    expression.result = value;
                    cached[executionLevel].push(expression);
                }
            }
        };
        
        /* Main Eval function */
        
        this.eval = function(literal) {
            return runtimeFrame.eval(literal);
        };
        
        /* Statements management */
        
        this.defaultEvalStatement = function(statement) {
            this.eval(statement.raw);
            return true;
        };
        
        this.evalBlockStatement = function(statement) {
            enterBlock();
            this.insertStatement({type:"ControlOperation", operation:"leaveBlock"});
            this.insertStatements(statement.body);
            return true;
        };

        this.evalExpressionStatement = function(statement) {
            this.evalExpression(statement.expression, true);
            return true;
            //this.evalExpression(statement.expression, callback, true);
        };
        
        this.evalIfStatement = function(statement) {
            var result = this.evalExpression(statement.test, true);
            if (result) {
                this.insertStatement(statement.consequent);
            } else if (statement.alternate !== null) {
                this.insertStatement(statement.alternate);
            }
            return true;
        };

        this.evalLabeledStatement = function(statement) {
            throw "LabeledStatement Not Implemented yet";
        };

        this.evalBreakStatement = function(statement) {
            throw "BreakStatement Not Implemented yet";            
        };

        this.evalContinueStatement = function(statement) {
            throw "ContinueStatement Not Implemented yet";            
        };
        
        this.evalWithStatement = function(statement) {
            throw "With statement is not supported";            
        };
        
        this.evalSwitchStatement = function(statement) {
            throw "TODO: switch";            
            /*
            
            
            
            var interpreter = this;
            this.evalExpression(statement.discriminant, function(value) {
                var i = -1;
                function testNextCase() {
                    i++;
                    if (i<statement.cases.length) {
                        var switchCase = statement.cases[i];
                        if (switchCase.test === null) {
                            interpreter.evalStatement(switchCase.consequent, testNextCase);
                        } else {
                            interpreter.evalExpression(switchCase.test, true, function(result) {
                                if (value === result) {
                                    interpreter.evalStatement(switchCase.consequent, testNextCase);
                                } else {
                                    testNextCase();
                                }
                            });
                        }
                    } else {
                        callback.call(interpreter);
                    }
                }
                testNextCase();
            }, true);*/
        };

        this.evalReturnStatement = function(statement) {
            if (executionLevel > 0) {
                var value = this.evalExpression(statement.argument);
                if (typeof value === "string") {
                    value = "\""+value+"\"";                
                }
                lowerExecutionLevel(value);
                return true;
            } else {
                // on function call: we just stop evaluation
                this.stop();
            }
        };

        this.evalThrowStatement = function(statement) {
            throw "ThrowStatement Not Implemented yet";
        };
        
        this.evalTryStatement = function(statement) {
            throw "TryStatement Not Implemented yet";
        };

        this.evalWhileStatement = function(statement) {
            var result = this.evalExpression(statement.test, true);
            if (result) {
                this.insertStatement(statement.body);
                // statement not consumed
                return false;
            } else {
                // statement consumed
                return true;
            }
        };

        this.evalDoWhileStatement = function(statement) {
            throw "TODO: dowhile";
            /*
            var interpreter = this;
            function loop() {
                interpreter.evalExpression(statement.test, function(test) {
                    if (test) {
                        interpreter.evalStatement(statement.body, loop);
                    } else {
                        callback.call(interpreter);
                    }
                }, true);
            }
            this.evalStatement(statement.body, loop);*/
        };

        this.evalForStatement = function(statement) {
            var controls = {init:false};
            if (typeof statement.controls !== 'undefined') {
                controls = statement.controls;
            }
            if (!controls.init) {
                // init has not been performed yet
                if (statement.init.type === "VariableDeclaration") {
                    this.insertStatement(statement.init);
                } else {
                    this.insertStatement({type:"ExpressionStatement", expression:statement.init});
                }
                controls.init = true;
                statement.controls = controls;
                return false;
            } else {
                var result = this.evalExpression(statement.test, true);
                if (result) {
                    this.insertStatement(statement.update);
                    this.insertStatement(statement.body);
                    // statement not consumed
                    return false;
                } else {
                    // statement consumed
                    return true;
                }
            }
        };

        this.evalForInStatement = function(statement) {
            throw "For In Not Implemented yet";
        };

        this.evalDebuggerStatement = function(statement) {
            this.defaultEvalStatement(statement);
        };
        
        this.evalVariableDeclaration = function(declaration) {
            for (var i = 0; i<declaration.declarations.length; i++) {
                var declarator = declaration.declarations[i];
                var identifier = this.evalExpression(declarator.id);
                // local variables management: save preceeding value if any
                saveVariable(identifier);
                currentVariables.push(identifier);
                var value = this.evalExpression(declarator.init);
                this.eval(identifier+"="+value);
            }
            return true;
        };

        this.evalFunctionDeclaration = function(declaration) {
            var identifier = this.evalExpression(declaration.id);
            definedFunctions[identifier] = {'body':declaration.body, 'params':declaration.params};
            return true;
        };
        
        this.evalStatement = function(statement) {
            try {
                var result;
                var currentLevel = executionLevel;
                switch (statement.type) {
                    case "BlockStatement":
                        result = this.evalBlockStatement(statement);
                        break;
                    case "ExpressionStatement":
                        result = this.evalExpressionStatement(statement);
                        break;
                    case "IfStatement": 
                        result = this.evalIfStatement(statement);
                        break;
                    case "LabeledStatement":
                        result = this.evalLabeledStatement(statement);
                        break;
                    case "BreakStatement":
                        result = this.evalBreakStatement(statement);
                        break;
                    case "ContinueStatement":
                        result = this.evalContinueStatement(statement);
                        break;
                    case "WithStatement":
                        result = this.evalWithStatement(statement);
                        break;
                    case "SwitchStatement":
                        result = this.evalSwitchStatement(statement);
                        break;
                    case "ReturnStatement":
                        result = this.evalReturnStatement(statement);
                        break;
                    case "ThrowStatement":
                        result = this.evalThrowStatement(statement);
                        break;
                    case "TryStatement":
                        result = this.evalTryStatement(statement);
                        break;
                    case "WhileStatement":
                        result = this.evalWhileStatement(statement);
                        break;
                    case "DoWhileStatement":
                        result = this.evalDoWhileStatement(statement);
                        break;
                    case "ForStatement":
                        result = this.evalForStatement(statement);
                        break;
                    case "ForInStatement":
                        result = this.evalForInStatement(statement);
                        break;
                    case "DebuggerStatement":
                        result = this.evalDebuggerStatement(statement);
                        break;
                    case "ParametersDeclaration":
                    case "VariableDeclaration":
                        result = this.evalVariableDeclaration(statement);
                        break;                    
                    case "FunctionDeclaration":
                        result = this.evalFunctionDeclaration(statement);
                        break;
                    case "ControlOperation":
                        switch (statement.operation) {
                            case "leaveBlock":
                                leaveBlock();
                                break;
                            case "leaveFunction":
                                lowerExecutionLevel(null);
                                break;
                        }
                        result = true;
                        break;
                    default:
                        result = this.defaultEvalStatement(statement);
                        break;
                }
                if (executionLevel === currentLevel) {
                    // we haven't changed execution level
                    // statement is over: remove cached values
                    while(cached[executionLevel].length>0) {
                        var expression = cached[executionLevel].pop();
                        delete expression.result;
                    }
                }
                return result;
            } catch (err) {
                if (err instanceof suspendedException) {
                    // running was stopped during statement execution: we keep statement in stack
                    return false;
                } else {
                    if (!(err instanceof TError)) {
                        var error = new TError(err);
                        error.setLines([statement.start,statement.end]);
                        error.detectError();
                        throw error;
                    } else {
                        throw err;
                    }
                }
            }
        };
        
        /* Expressions management */

        this.defaultEvalExpression = function(expression) {
            return expression.raw;
        };
        
        this.callFunction = function(block, params, args, expression) {
            var values = [];
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
            // start a new executionLevel
            raiseExecutionLevel(expression);
            // TODO: Put stack state somewhere, in case return is used;
            // callStack.push(callback);
            this.insertStatement({type:"ControlOperation", operation:"leaveFunction"});
            this.insertStatement(block);
            
            // temporary value, will be replaced by value returned by a return statement, if any
            return null;
        };
        
        this.evalFunctionExpression = function(expression, callback) {
            throw "Function Expression Not Implemented yet";
        };
        
        this.evalSequenceExpression = function(expression) {
            var sequence = "";
            for (var i=0; i<expression.expressions.length; i++) {
                sequence += this.evalExpression(expression.expressions[i]);
            }
            return sequence;
        };
        
        this.evalUnaryExpression = function(expression) {
            if (expression.prefix) {
                return expression.operator+this.evalExpression(expression.argument);
            } else {
                return this.evalExpression(expression.argument)+expression.operator;
            }
        };

        this.evalBinaryExpression = function(expression) {
            return this.evalExpression(expression.left)+expression.operator+this.evalExpression(expression.right);
        };

        this.evalAssignementExpression = function(expression) {
            return this.evalExpression(expression.left)+expression.operator+this.evalExpression(expression.right);
        };

        this.evalUpdateExpression = function(expression) {
            if (expression.prefix) {
                return expression.operator+this.evalExpression(expression.argument);
            } else {
                return this.evalExpression(expression.argument)+expression.operator;
            }
        };

        this.evalLogicalExpression = function(expression) {
            return this.evalExpression(expression.left)+expression.operator+this.evalExpression(expression.right);
        };

        this.evalConditionalExpression = function(expression) {
            var value = this.evalExpression(expression.test);
            if (value) {
                return this.evalExpression(expression.consequent);
            } else {
                return this.evalExpression(expression.alternate);
            }
        };

        this.evalCallExpression = function(expression) {
            var callLiteral = this.evalExpression(expression.callee);
            if (expression.callee.type === 'Identifier' && typeof definedFunctions[callLiteral] !== 'undefined') {
                // we need to call the function with given parameters
                return this.callFunction(definedFunctions[callLiteral]['body'], definedFunctions[callLiteral]['params'], expression.arguments, expression);
                // TODO: handle case of functionexpression called
            } else {
                var argsString = "(";
                for (var i=0; i<expression.arguments.length; i++) {
                    if (i>0) {
                        argsString += ",";
                    }
                    argsString += this.evalExpression(expression.arguments[i]);
                }
                argsString += ")";
                return callLiteral+argsString;
            }
        };

        this.evalNewExpression = function(expression) {
            var className = this.evalExpression(expression.callee);
            var argsString = "(";
            for (var i=0; i<expression.arguments.length; i++) {
                if (i>0) {
                    argsString += ",";
                }
                argsString += this.evalExpression(expression.arguments[i]);
            }
            argsString += ")";
            return "new "+className+argsString;
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
            var value;
            if (typeof expression.value === "string") {
                value = "\""+expression.value+"\"";                
            } else {
                value = expression.value;
            }
            return value;
        };

        this.evalExpression = function(expression, eval) {
            if (suspended) {
                // execution has been suspended during statement : we stop
                throw new suspendedException;
            }
            if (typeof expression.result !=='undefined'){
                // expression was already evaluated: return result
                return expression.result;
            }
            
            if (typeof eval === "undefined") {
                eval = false;
            }
            try {
                var result;
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
                        result = this.evalCallExpression(expression);
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
                // store result in case execution of current statement is interrupted
                if (eval) {
                    result = this.eval(result);
                }
                expression.result = result;
                cached[executionLevel].push(expression);
                return result;
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
    
    
    
    return TInterpreter;
});


