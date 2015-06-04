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
        var stackPointer = [0];
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
                run();
            }
        };
        
        this.stop = function() {
            stop();
        };
        
        stop = function() {
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
                run();
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

        insertStatement = function(statement) {
            statement.inserted = true;
            stack[executionLevel].unshift(statement);
            stackPointer[executionLevel]++;
        };

        insertStatements = function(statements) {
            for (var i=statements.length-1; i>=0; i--) {
                insertStatement(statements[i]);
            }
        };
        
        logCommand = function(command) {
            log.addCommand(command);
        };
        
        suspendedException = function(){};
        
        run = function() {
            try {
                running = true;
                while (!suspended && stack[executionLevel].length>0) {
                    var currentLevel = executionLevel;
                    stackPointer[executionLevel] = 0;
                    var statement = stack[executionLevel][0];
                    var consume = evalStatement(statement);
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
        
        defaultEval = function(literal) {
            return runtimeFrame.eval(literal);
        };
        
        /* Statements management */
        
        defaultEvalStatement = function(statement) {
            defaultEval(statement.raw);
            return true;
        };
        
        evalBlockStatement = function(statement) {
            enterBlock();
            insertStatement({type:"ControlOperation", operation:"leaveBlock"});
            insertStatements(statement.body);
            return true;
        };

        evalExpressionStatement = function(statement) {
            evalExpression(statement.expression, true);
            return true;
        };
        
        evalIfStatement = function(statement) {
            var result = evalExpression(statement.test, true);
            if (result) {
                insertStatement(statement.consequent);
            } else if (statement.alternate !== null) {
                insertStatement(statement.alternate);
            }
            return true;
        };

        evalLabeledStatement = function(statement) {
            throw "LabeledStatement Not Implemented yet";
        };

        evalBreakStatement = function(statement) {
            throw "BreakStatement Not Implemented yet";            
        };

        evalContinueStatement = function(statement) {
            throw "ContinueStatement Not Implemented yet";            
        };
        
        evalWithStatement = function(statement) {
            throw "With statement is not supported";            
        };
        
        evalSwitchStatement = function(statement) {
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

        evalReturnStatement = function(statement) {
            if (executionLevel > 0) {
                var value = evalExpression(statement.argument);
                if (typeof value === "string") {
                    value = "\""+value+"\"";                
                }
                lowerExecutionLevel(value);
                return true;
            } else {
                // on function call: we just stop evaluation
                stop();
            }
        };

        evalThrowStatement = function(statement) {
            throw "ThrowStatement Not Implemented yet";
        };
        
        evalTryStatement = function(statement) {
            throw "TryStatement Not Implemented yet";
        };

        evalWhileStatement = function(statement) {
            var result = evalExpression(statement.test, true);
            if (result) {
                insertStatement(statement.body);
                // statement not consumed
                return false;
            } else {
                // statement consumed
                return true;
            }
        };

        evalDoWhileStatement = function(statement) {
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

        evalForStatement = function(statement) {
            var controls = {init:false};
            if (typeof statement.controls !== 'undefined') {
                controls = statement.controls;
            }
            if (!controls.init) {
                // init has not been performed yet
                if (statement.init.type === "VariableDeclaration") {
                    insertStatement(statement.init);
                } else {
                    insertStatement({type:"ExpressionStatement", expression:statement.init});
                }
                controls.init = true;
                statement.controls = controls;
                return false;
            } else {
                var result = evalExpression(statement.test, true);
                if (result) {
                    insertStatement(statement.update);
                    insertStatement(statement.body);
                    // statement not consumed
                    return false;
                } else {
                    // statement consumed
                    return true;
                }
            }
        };

        evalForInStatement = function(statement) {
            throw "For In Not Implemented yet";
        };

        evalDebuggerStatement = function(statement) {
            defaultEvalStatement(statement);
        };
        
        evalVariableDeclaration = function(declaration) {
            for (var i = 0; i<declaration.declarations.length; i++) {
                var declarator = declaration.declarations[i];
                var identifier = evalExpression(declarator.id);
                // local variables management: save preceeding value if any
                saveVariable(identifier);
                currentVariables.push(identifier);
                var value = evalExpression(declarator.init);
                defaultEval(identifier+"="+value);
            }
            return true;
        };

        evalFunctionDeclaration = function(declaration) {
            var identifier = evalExpression(declaration.id);
            definedFunctions[identifier] = {'body':declaration.body, 'params':declaration.params};
            return true;
        };
        
        evalStatement = function(statement) {
            try {
                var result;
                var currentLevel = executionLevel;
                switch (statement.type) {
                    case "BlockStatement":
                        result = evalBlockStatement(statement);
                        break;
                    case "ExpressionStatement":
                        result = evalExpressionStatement(statement);
                        break;
                    case "IfStatement": 
                        result = evalIfStatement(statement);
                        break;
                    case "LabeledStatement":
                        result = evalLabeledStatement(statement);
                        break;
                    case "BreakStatement":
                        result = evalBreakStatement(statement);
                        break;
                    case "ContinueStatement":
                        result = evalContinueStatement(statement);
                        break;
                    case "WithStatement":
                        result = evalWithStatement(statement);
                        break;
                    case "SwitchStatement":
                        result = evalSwitchStatement(statement);
                        break;
                    case "ReturnStatement":
                        result = evalReturnStatement(statement);
                        break;
                    case "ThrowStatement":
                        result = evalThrowStatement(statement);
                        break;
                    case "TryStatement":
                        result = evalTryStatement(statement);
                        break;
                    case "WhileStatement":
                        result = evalWhileStatement(statement);
                        break;
                    case "DoWhileStatement":
                        result = evalDoWhileStatement(statement);
                        break;
                    case "ForStatement":
                        result = evalForStatement(statement);
                        break;
                    case "ForInStatement":
                        result = evalForInStatement(statement);
                        break;
                    case "DebuggerStatement":
                        result = evalDebuggerStatement(statement);
                        break;
                    case "ParametersDeclaration":
                    case "VariableDeclaration":
                        result = evalVariableDeclaration(statement);
                        break;                    
                    case "FunctionDeclaration":
                        result = evalFunctionDeclaration(statement);
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
                        result = defaultEvalStatement(statement);
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

        defaultEvalExpression = function(expression) {
            return expression.raw;
        };
        
        callFunction = function(block, params, args, expression) {
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
            insertStatement({type:"ControlOperation", operation:"leaveFunction"});
            insertStatement(block);
            
            // temporary value, will be replaced by value returned by a return statement, if any
            return null;
        };
        
        evalFunctionExpression = function(expression, callback) {
            throw "Function Expression Not Implemented yet";
        };
        
        evalSequenceExpression = function(expression) {
            var sequence = "";
            for (var i=0; i<expression.expressions.length; i++) {
                sequence += evalExpression(expression.expressions[i]);
            }
            return sequence;
        };
        
        evalUnaryExpression = function(expression) {
            if (expression.prefix) {
                return expression.operator+evalExpression(expression.argument);
            } else {
                return evalExpression(expression.argument)+expression.operator;
            }
        };

        evalBinaryExpression = function(expression) {
            return evalExpression(expression.left)+expression.operator+evalExpression(expression.right);
        };

        evalAssignementExpression = function(expression) {
            return evalExpression(expression.left)+expression.operator+evalExpression(expression.right);
        };

        evalUpdateExpression = function(expression) {
            if (expression.prefix) {
                return expression.operator+evalExpression(expression.argument);
            } else {
                return evalExpression(expression.argument)+expression.operator;
            }
        };

        evalLogicalExpression = function(expression) {
            return evalExpression(expression.left)+expression.operator+evalExpression(expression.right);
        };

        evalConditionalExpression = function(expression) {
            var value = evalExpression(expression.test);
            if (value) {
                return evalExpression(expression.consequent);
            } else {
                return evalExpression(expression.alternate);
            }
        };

        evalCallExpression = function(expression) {
            var callLiteral = evalExpression(expression.callee);
            if (expression.callee.type === 'Identifier' && typeof definedFunctions[callLiteral] !== 'undefined') {
                // we need to call the function with given parameters
                return callFunction(definedFunctions[callLiteral]['body'], definedFunctions[callLiteral]['params'], expression.arguments, expression);
                // TODO: handle case of functionexpression called
            } else {
                var argsString = "(";
                for (var i=0; i<expression.arguments.length; i++) {
                    if (i>0) {
                        argsString += ",";
                    }
                    argsString += evalExpression(expression.arguments[i]);
                }
                argsString += ")";
                return callLiteral+argsString;
            }
        };

        evalNewExpression = function(expression) {
            var className = evalExpression(expression.callee);
            var argsString = "(";
            for (var i=0; i<expression.arguments.length; i++) {
                if (i>0) {
                    argsString += ",";
                }
                argsString += evalExpression(expression.arguments[i]);
            }
            argsString += ")";
            return "new "+className+argsString;
        };

        evalMemberExpression = function(expression) {
            var objectName = evalExpression(expression.object);
            var propertyName = evalExpression(expression.property);
            return objectName+"."+propertyName;
        };

        evalIdentifier = function(expression) {
            return expression.name;
        };

        evalLiteral = function(expression) {
            var value;
            if (typeof expression.value === "string") {
                value = "\""+expression.value+"\"";                
            } else {
                value = expression.value;
            }
            return value;
        };

        evalExpression = function(expression, eval) {
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
                        result = evalFunctionExpression(expression);
                        break;
                    case "SequenceExpression":
                        result = evalSequenceExpression(expression);
                        break;
                    case "UnaryExpression":
                        result = evalUnaryExpression(expression);
                        break;
                    case "BinaryExpression":
                        result = evalBinaryExpression(expression);
                        break;
                    case "AssignmentExpression":
                        result = evalAssignementExpression(expression);
                        break;
                    case "UpdateExpression":
                        result = evalUpdateExpression(expression);
                        break;
                    case "LogicalExpression":
                        result = evalLogicalExpression(expression);
                        break;
                    case "ConditionalExpression": 
                        result = evalConditionalExpression(expression);
                        break;
                    case "CallExpression":
                        result = evalCallExpression(expression);
                        break;
                    case "NewExpression": 
                        result = evalNewExpression(expression);
                        break;
                    case "MemberExpression": 
                        result = evalMemberExpression(expression);
                        break;
                    case "Identifier":
                        result = evalIdentifier(expression);
                        break;
                    case "Literal":
                        result = evalLiteral(expression);
                        break;
                    default:
                        result = defaultEvalExpression(expression);
                        break;
                }
                // store result in case execution of current statement is interrupted
                if (eval) {
                    result = defaultEval(result);
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


