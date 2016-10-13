define("ace/mode/timba_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var TimbaHighlightRules = function() {
var keywords = "deposite|depositela|invierta|inviertala|boca|abajo|arriba|en|"+
"valor|que|menor|o|igual|mayor|tome|una|de|no|esta|vacia|la|carta|palo|palos|"+
"pila|si|sino|nada|mas|mientras|repita|tiene|cartas|"+
"un|mazo|ucp|ejecute|con|las|siguientes|definicion|programa|es|a|";


    var keywordMapper = this.createKeywordMapper({
        "keyword": keywords,
        "constant.language": "bastos|copas|espadas|oros",
    }, "identifier", true);

    this.$rules = {
        "start" : [ {
            token : "comment",
            regex : "#.*$"
        }, {
            token : keywordMapper,
            regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
        }, {
            token : "constant.numeric", 
            regex : "\\d+?\\b"
        }, {
            token : "keyword.operator",
            regex : ",|\\;|\\:|\\.|\\^"
        }, {
            token : "paren.lparen",
            regex : "[\\(]"
        }, {
            token : "paren.rparen",
            regex : "[\\)]"
        }, {
            token : "variable.language",
            regex : "[a-zA-Z0-9]+?"
        }]
    };
};

oop.inherits(TimbaHighlightRules, TextHighlightRules);

exports.TimbaHighlightRules = TimbaHighlightRules;
});

define("ace/mode/timba",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/timba_highlight_rules","ace/range"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var TimbaHighlightRules = require("./timba_highlight_rules").TimbaHighlightRules;
var Range = require("../range").Range;

var Mode = function() {
    this.HighlightRules = TimbaHighlightRules;
};
oop.inherits(Mode, TextMode);

(function() {

    this.lineCommentStart = "#";

    this.$id = "ace/mode/timba";
}).call(Mode.prototype);

exports.Mode = Mode;

});
