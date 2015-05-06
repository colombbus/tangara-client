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
            this.evalExpression(statement.expression);
        };
        
        this.evalIfStatement = function(statement) {
            if (this.evalExpression(statement.test)) {
                this.evalStatement(statement.consequent);
            } else if (typeof(statement.alternate) !== false) {
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
            throw "WithStatement Not Implemented yet";            
        };
        
        this.evalSwitchStatement = function(statement) {
            var value = this.evalExpression(statement.discriminant);
            for (var i=0; i<statement.cases.length; i++) {
                var switchCase = statement.cases[i];
                if (switchCase.test === null || value == switchCase.test) {
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
            while (this.evalExpression(statement.test)) {
                this.evalStatement(statement.body);
            }
        };

        this.evalDoWhileStatement = function(statement) {
            do {
                this.evalStatement(statement.body);
            } while (this.evalExpression(statement.test));
        };

        this.evalForStatement = function(statement) {
            if (statement.init.type === "VariableDeclaration") {
                for (this.evalVariableDeclaration(statement.init);this.evalExpression(statement.test);this.evalExpression(statement.update)) {
                    this.evalStatement(statement.body);
                }                
            } else {
                for (this.evalExpression(statement.init);this.evalExpression(statement.test);this.evalExpression(statement.update)) {
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
            throw "Function Declaration Not Implemented Yet";
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
                if (typeof err !== TError) {
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
            return this.eval(expression.raw);
        };
                
        this.evalFunctionExpression = function(expression) {
            throw "Function Expression Not Implemented Yet";
        };
        
        this.evalSequenceExpression = function(expression) {
            throw "Sequence Expression Not Implemented Yet";
        };
        
        this.evalUnaryExpression = function(expression) {
            try {
                var argument = this.evalExpression(expression.argument);
                if (expression.prefix) {
                    return this.eval(expression.operator+argument);
                } else {
                    return this.eval(argument+expression.operator);
                }
            } catch (err) {
                return this.defaultEvalExpression(expression);
            }
        };

        this.evalBinaryExpression = function(expression) {
            try {
                var left = this.evalExpression(expression.left);
                var right = this.evalExpression(expression.right);
                return this.eval(left+expression.operator.right);
            } catch (err) {
                return this.defaultEvalExpression(expression);
            }
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
            return this.eval(left+expression.operator+right);
        };

        this.evalUpdateExpression = function(expression) {
            var argument = this.evalExpression(expression.argument);
            if (expression.prefix) {
                return this.eval(expression.operator+argument);
            } else {
                return this.eval(argument+expression.operator);
            }
        };

        this.evalLogicalExpression = function(expression) {
            var left,right;
            left = this.evalExpression(expression.left);
            right = this.evalExpression(expression.right); 
            return this.eval(left+expression.operator+right);
        };

        this.evalConditionalExpression = function(expression) {
            if (this.evalExpression(expression.test)) {
                return this.evalExpression(expression.consequent);
            } else {                
                return this.evalExpression(expression.alternate);
            }
        };

        this.evalCallExpression = function(expression) {
            throw "Call Expression Not Implemented yet";
        };

        this.evalNewExpression = function(expression) {
            throw "New Expression Not Implemented yet";            
        };

        this.evalMemberExpression = function(expression) {
            throw "New Expression Not Implemented yet";                        
        };

        this.evalIdentifier = function(expression) {
            return expression.name;
        };

        this.evalLiteral = function(expression) {
            return expression.value;
        };

        this.evalExpression = function(expression) {
            if (expression === null) {
                return;
            }
            try {
                switch (expression.type) {
                    case "FunctionExpression": 
                        return this.evalFunctionExpression(expression);
                        break;
                    case "SequenceExpression": 
                        return this.evalSequenceExpression(expression);
                        break;
                    case "UnaryExpression": 
                        return this.evalUnaryExpression(expression);
                        break;
                    case "BinaryExpression": 
                        return this.evalBinaryExpression(expression);
                        break;
                    case "AssignmentExpression": 
                        return this.evalAssignementExpression(expression);
                        break;
                    case "UpdateExpression": 
                        return this.evalUpdateExpression(expression);
                        break;
                    case "LogicalExpression": 
                        return this.evalLogicalExpression(expression);
                        break;
                    case "ConditionalExpression": 
                        return this.evalConditionalExpression(expression);
                        break;
                    case "CallExpression":
                        return this.evalCallExpression(expression);
                        break;
                    case "NewExpression": 
                        return this.evalNewExpression(expression);
                        break;
                    case "MemberExpression": 
                        return this.evalMemberExpression(expression);
                        break;
                    case "Identifier":
                        return this.evalIdentifier(expression);
                        break;
                    case "Literal":
                        return this.evalLiteral(expression);
                        break;
                    default:
                        return this.defaultEvalExpression(expression);
                        break;
                }
            } catch (err) {
                if (typeof err !== TError) {
                    var error = new TError(err);
                    error.setLines([statement.start,statement.end]);
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


