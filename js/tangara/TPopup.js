define(['jquery','ace/autocomplete/popup', 'ace/keyboard/hash_handler', 'TUtils'], function($, ace_popup, ace_hash_handler, TUtils) {

    function TPopup(parentNode) {
        var parent = parentNode;
        var AcePopup = ace_popup.AcePopup;
        var AceHashHandler = ace_hash_handler.HashHandler;

        var editor;
        var popup;
        var activated = false;
        var base = null;
        var keyboardHandler = new AceHashHandler();
        var methods;
        var methodNames;
        
        var commands = {
            "Up": function(editor) { goTo("up"); },
            "Down": function(editor) { goTo("down"); },
            "Ctrl-Up|Ctrl-Home": function(editor) { goTo("start"); },
            "Ctrl-Down|Ctrl-End": function(editor) { goTo("end"); },

            "Esc": function(editor) { detach(); },
            "Space": function(editor) { detach(); editor.insert(" ");},
            "Return": function(editor) { insertValue(); },
            "Shift-Return": function(editor) { insertValue(); },
            "Tab": function(editor) { insertValue(); },

            "PageUp": function(editor) { popup.gotoPageUp(); },
            "PageDown": function(editor) { popup.gotoPageDown(); }
        };
        
        
        keyboardHandler.bindKeys(commands);

        this.setEditor = function(value) {
            editor = value;
            popup = new AcePopup(parent);
        };

        function bindHandlers() {
            popup.on("click", function(e) {
                insertValue();
                e.stop();
            });
            editor.keyBinding.addKeyboardHandler(keyboardHandler);
            editor.on("changeSelection", changeListener);
            editor.on("blur", blurListener);
            editor.on("mousedown", mousedownListener);
            editor.on("mousewheel", mousewheelListener);
        }
        
        this.show = function() {
            activated = true;

            popup.setFontSize(editor.getFontSize());
            var renderer = editor.renderer;
            var lineHeight = renderer.layerConfig.lineHeight;
            base = editor.getCursorPosition();
            var pos = renderer.$cursorLayer.getPixelPosition(base, true);            
            pos.left -= popup.getTextLeftOffset();
            var rect = editor.container.getBoundingClientRect();
            pos.top += rect.top - renderer.layerConfig.offset;
            pos.left += rect.left;
            pos.left += renderer.$gutterLayer.gutterWidth;
            popup.selection.clearSelection();
            bindHandlers();
            popup.setData(methodNames);
            popup.show(pos, lineHeight);
        };
        
        this.hide = function() {
            if (activated)
                detach();
        };
        
        
        this.setMethods = function(values) {
            methods = values;
            methodNames = Object.keys(values);
            methodNames = TUtils.sortArray(methodNames);
            popup.setData(methodNames);
        };
        
        detach = function() {
            editor.keyBinding.removeKeyboardHandler(keyboardHandler);
            editor.off("changeSelection", changeListener);
            editor.off("blur", blurListener);
            editor.off("mousedown", mousedownListener);
            editor.off("mousewheel", mousewheelListener);

            popup.hide();

            activated = false;
            base = null;
        };
        
        insertValue = function() {
            var data = popup.getData(popup.getRow());
            if (data) {
                editor.getSession().insert(base,methods[data]);
            }
            detach();
        };
        
        // Handlers
        changeListener = function(e) {
            var cursor = editor.selection.lead;
            if (cursor.row !== base.row || cursor.column < base.column) {
                detach();
            }
        };
        
        blurListener = function() {
            if (document.activeElement != editor.textInput.getElement())
                detach();
        };

        mousedownListener = function(e) {
            detach();
        };

        mousewheelListener = function(e) {
            detach();
        };

        goTo = function(where) {
            var row = popup.getRow();
            var max = popup.session.getLength() - 1;

            switch(where) {
                case "up": row = row < 0 ? max : row - 1; break;
                case "down": row = row >= max ? -1 : row + 1; break;
                case "start": row = 0; break;
                case "end": row = max; break;
            }

            popup.setRow(row);
        };
        
    }
    
    return TPopup;
});



