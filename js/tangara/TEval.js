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

        
        this.eval = function(literal) {
            return runtimeFrame.eval(literal);
        };
        
        this.defaultEvalStatement = function(statement) {
            this.eval(statement.raw);
        };
        
        this.evalBlockStatement = function(statement) {
            for (var i = 0; i<statement.body.length ; i++) {
                this.evalStatement(statement.body[i]);
            }
        };

        this.evalExpressionStatement = function(statement) {
            this.evalExpression(statement.expression, true);
        };
        
        this.evalIfStatement = function(statement) {
            if (this.evalExpression(statement.test, true)) {
                this.evalStatement(statement.consequent);
            } else if (statement.alternate !== null) {
                this.evalStatement(statement.alternate);
            }
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
            var value = this.evalExpression(statement.discriminant, true);
            for (var i=0; i<statement.cases.length; i++) {
                var switchCase = statement.cases[i];
                if (switchCase.test === null || value == this.evalExpression(switchCase.test, true)) {
                    this.evalStatement(switchCase.consequent);
                }
            }
        };

        this.evalReturnStatement = function(statement) {
            throw "ReturnStatement Not Implemented yet";
        };

        this.evalThrowStatement = function(statement) {
            throw "ThrowStatement Not Implemented yet";
        };
        
        this.evalTryStatement = function(statement) {
            throw "TryStatement Not Implemented yet";
        };

        this.evalWhileStatement = function(statement) {
            while (this.evalExpression(statement.test, true)) {
                this.evalStatement(statement.body);
            }
        };

        this.evalDoWhileStatement = function(statement) {
            do {
                this.evalStatement(statement.body);
            } while (this.evalExpression(statement.test, true));
        };

        this.evalForStatement = function(statement) {
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

        this.evalForInStatement = function(statement) {
            /*if (statement.left.type === "VariableDeclaration") {
                for (this.evalVariableDeclaration(statement.left) in this.evalExpression(statement.right)) {
                    
                }
            }*/
            throw "For In Not Implemented yet";
            
        };

        this.evalDebuggerStatement = function(statement) {
            this.defaultEvalStatement(statement);
        };
        
        this.evalVariableDeclaration = function(declaration) {
            for (var i=0; i<declaration.declarations.length; i++) {
                var declarator = declaration.declarations[i];
                var value = this.evalExpression(declarator.init);
                this.eval(declarator.id+"="+value);
            }
        };

        this.evalFunctionDeclaration = function(declaration) {
            var identifier = this.evalExpression(declaration.id);
            definedFunctions[identifier] = {'body':declaration.body, 'params':declaration.params};
            // TODO: do we need to eval function decalaration into RuntimeFrame?
        };
        
        this.evalStatement = function(statement) {
            try {
                switch (statement.type) {
                    case "BlockStatement":
                        this.evalBlockStatement(statement);
                        break;
                    case "ExpressionStatement":
                        this.evalExpressionStatement(statement);
                        break;
                    case "IfStatement": 
                        this.evalIfStatement(statement);
                        break;
                    case "LabeledStatement":
                        this.evalLabeledStatement(statement);
                        break;
                    case "BreakStatement":
                        this.evalBreakStatement(statement);
                        break;
                    case "ContinueStatement":
                        this.evalContinueStatement(statement);
                        break;
                    case "WithStatement":
                        this.evalWithStatement(statement);
                        break;
                    case "SwitchStatement":
                        this.evalSwitchStatement(statement);
                        break;
                    case "ReturnStatement":
                        this.evalReturnStatement(statement);
                        break;
                    case "ThrowStatement":
                        this.evalThrowStatement(statement);
                        break;
                    case "TryStatement":
                        this.evalTryStatement(statement);
                        break;
                    case "WhileStatement":
                        this.evalWhileStatement(statement);
                        break;
                    case "DoWhileStatement":
                        this.evalDoWhileStatement(statement);
                        break;
                    case "ForStatement":
                        this.evalForStatement(statement);
                        break;
                    case "ForInStatement":
                        this.evalForInStatement(statement);
                        break;
                    case "DebuggerStatement":
                        this.evalDebuggerStatement(statement);
                        break;
                    case "VariableDeclaration":
                        this.evalVariableDeclaration(statement);
                        break;                    
                    case "FunctionDeclaration":
                        this.evalFunctionDeclaration(statement);
                        break;                    
                    default:
                        this.defaultEvalStatement(statement);
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

        this.evalExpression = function(expression, eval) {
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
                    return this.eval(result);
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


