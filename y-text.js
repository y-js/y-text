(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global Y */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function extend(Y) {
  Y.requestModules(['Array']).then(function () {
    var YText = (function (_Y$Array$class) {
      _inherits(YText, _Y$Array$class);

      function YText(os, _model, idArray, valArray) {
        _classCallCheck(this, YText);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(YText).call(this, os, _model, idArray, valArray));

        _this.textfields = [];
        return _this;
      }

      _createClass(YText, [{
        key: 'toString',
        value: function toString() {
          return this.valArray.join('');
        }
      }, {
        key: 'insert',
        value: function insert(pos, content) {
          _get(Object.getPrototypeOf(YText.prototype), 'insert', this).call(this, pos, content.split(''));
        }
      }, {
        key: 'bind',
        value: function bind(textfield, domRoot) {
          domRoot = domRoot || window; // eslint-disable-line
          if (domRoot.getSelection == null) {
            domRoot = window; // eslint-disable-line
          }

          // don't duplicate!
          for (var t in this.textfields) {
            if (this.textfields[t] === textfield) {
              return;
            }
          }
          var creatorToken = false;

          var word = this;
          textfield.value = this.toString();
          this.textfields.push(textfield);
          var createRange, writeRange, writeContent;
          if (textfield.selectionStart != null && textfield.setSelectionRange != null) {
            createRange = function (fix) {
              var left = textfield.selectionStart;
              var right = textfield.selectionEnd;
              if (fix != null) {
                left = fix(left);
                right = fix(right);
              }
              return {
                left: left,
                right: right
              };
            };
            writeRange = function (range) {
              writeContent(word.toString());
              textfield.setSelectionRange(range.left, range.right);
            };
            writeContent = function (content) {
              textfield.value = content;
            };
          } else {
            createRange = function (fix) {
              var range = {};
              var s = domRoot.getSelection();
              var clength = textfield.textContent.length;
              range.left = Math.min(s.anchorOffset, clength);
              range.right = Math.min(s.focusOffset, clength);
              if (fix != null) {
                range.left = fix(range.left);
                range.right = fix(range.right);
              }
              var editedElement = s.focusNode;
              if (editedElement === textfield || editedElement === textfield.childNodes[0]) {
                range.isReal = true;
              } else {
                range.isReal = false;
              }
              return range;
            };

            writeRange = function (range) {
              writeContent(word.toString());
              var textnode = textfield.childNodes[0];
              if (range.isReal && textnode != null) {
                if (range.left < 0) {
                  range.left = 0;
                }
                range.right = Math.max(range.left, range.right);
                if (range.right > textnode.length) {
                  range.right = textnode.length;
                }
                range.left = Math.min(range.left, range.right);
                var r = document.createRange(); // eslint-disable-line
                r.setStart(textnode, range.left);
                r.setEnd(textnode, range.right);
                var s = window.getSelection(); // eslint-disable-line
                s.removeAllRanges();
                s.addRange(r);
              }
            };
            writeContent = function (content) {
              var contentArray = content.replace(new RegExp('\n', 'g'), ' ').split(' '); // eslint-disable-line
              textfield.innerText = '';
              for (var i in contentArray) {
                var c = contentArray[i];
                textfield.innerText += c;
                if (i !== contentArray.length - 1) {
                  textfield.innerHTML += '&nbsp;';
                }
              }
            };
          }
          writeContent(this.toString());

          this.observe(function (events) {
            for (var e in events) {
              var event = events[e];
              if (!creatorToken) {
                var oPos, fix;
                if (event.type === 'insert') {
                  oPos = event.index;
                  fix = function (cursor) {
                    // eslint-disable-line
                    if (cursor <= oPos) {
                      return cursor;
                    } else {
                      cursor += 1;
                      return cursor;
                    }
                  };
                  var r = createRange(fix);
                  writeRange(r);
                } else if (event.type === 'delete') {
                  oPos = event.index;
                  fix = function (cursor) {
                    // eslint-disable-line
                    if (cursor < oPos) {
                      return cursor;
                    } else {
                      cursor -= 1;
                      return cursor;
                    }
                  };
                  r = createRange(fix);
                  writeRange(r);
                }
              }
            }
          });
          // consume all text-insert changes.
          textfield.onkeypress = function (event) {
            if (word.is_deleted) {
              // if word is deleted, do not do anything ever again
              textfield.onkeypress = null;
              return true;
            }
            creatorToken = true;
            var char;
            if (event.keyCode === 13) {
              char = '\n';
            } else if (event.key != null) {
              if (event.charCode === 32) {
                char = ' ';
              } else {
                char = event.key;
              }
            } else {
              char = window.String.fromCharCode(event.keyCode); // eslint-disable-line
            }
            if (char.length > 1) {
              return true;
            } else if (char.length > 0) {
              var r = createRange();
              var pos = Math.min(r.left, r.right, word.length);
              var diff = Math.abs(r.right - r.left);
              word.delete(pos, diff);
              word.insert(pos, char);
              r.left = pos + char.length;
              r.right = r.left;
              writeRange(r);
            }
            event.preventDefault();
            creatorToken = false;
            return false;
          };
          textfield.onpaste = function (event) {
            if (word.is_deleted) {
              // if word is deleted, do not do anything ever again
              textfield.onpaste = null;
              return true;
            }
            event.preventDefault();
          };
          textfield.oncut = function (event) {
            if (word.is_deleted) {
              // if word is deleted, do not do anything ever again
              textfield.oncut = null;
              return true;
            }
            event.preventDefault();
          };
          //
          // consume deletes. Note that
          //   chrome: won't consume deletions on keypress event.
          //   keyCode is deprecated. BUT: I don't see another way.
          //     since event.key is not implemented in the current version of chrome.
          //     Every browser supports keyCode. Let's stick with it for now..
          //
          textfield.onkeydown = function (event) {
            creatorToken = true;
            if (word.is_deleted) {
              // if word is deleted, do not do anything ever again
              textfield.onkeydown = null;
              return true;
            }
            var r = createRange();
            var pos = Math.min(r.left, r.right, word.toString().length);
            var diff = Math.abs(r.left - r.right);
            if (event.keyCode != null && event.keyCode === 8) {
              // Backspace
              if (diff > 0) {
                word.delete(pos, diff);
                r.left = pos;
                r.right = pos;
                writeRange(r);
              } else {
                if (event.ctrlKey != null && event.ctrlKey) {
                  var val = word.toString();
                  var newPos = pos;
                  var delLength = 0;
                  if (pos > 0) {
                    newPos--;
                    delLength++;
                  }
                  while (newPos > 0 && val[newPos] !== ' ' && val[newPos] !== '\n') {
                    newPos--;
                    delLength++;
                  }
                  word.delete(newPos, pos - newPos);
                  r.left = newPos;
                  r.right = newPos;
                  writeRange(r);
                } else {
                  if (pos > 0) {
                    word.delete(pos - 1, 1);
                    r.left = pos - 1;
                    r.right = pos - 1;
                    writeRange(r);
                  }
                }
              }
              event.preventDefault();
              creatorToken = false;
              return false;
            } else if (event.keyCode != null && event.keyCode === 46) {
              // Delete
              if (diff > 0) {
                word.delete(pos, diff);
                r.left = pos;
                r.right = pos;
                writeRange(r);
              } else {
                word.delete(pos, 1);
                r.left = pos;
                r.right = pos;
                writeRange(r);
              }
              event.preventDefault();
              creatorToken = false;
              return false;
            } else {
              creatorToken = false;
              return true;
            }
          };
        }
      }]);

      return YText;
    })(Y.Array['class']);

    Y.extend('Text', new Y.utils.CustomType({
      class: YText,
      createType: regeneratorRuntime.mark(function YTextCreator() {
        var modelid, model;
        return regeneratorRuntime.wrap(function YTextCreator$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                modelid = this.store.getNextOpId();
                model = {
                  start: null,
                  end: null,
                  struct: 'List',
                  type: 'Text',
                  id: modelid
                };
                return _context.delegateYield(this.applyCreatedOperations([model]), 't0', 3);

              case 3:
                return _context.abrupt('return', modelid);

              case 4:
              case 'end':
                return _context.stop();
            }
          }
        }, YTextCreator, this);
      }),
      initType: regeneratorRuntime.mark(function YTextInitializer(os, model) {
        var valArray, idArray;
        return regeneratorRuntime.wrap(function YTextInitializer$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                valArray = [];
                return _context2.delegateYield(Y.Struct.List.map.call(this, model, function (c) {
                  valArray.push(c.content);
                  return JSON.stringify(c.id);
                }), 't0', 2);

              case 2:
                idArray = _context2.t0;
                return _context2.abrupt('return', new YText(os, model.id, idArray, valArray));

              case 4:
              case 'end':
                return _context2.stop();
            }
          }
        }, YTextInitializer, this);
      })
    }));
  });
}

module.exports = extend;
if (typeof Y !== 'undefined') {
  extend(Y);
}

},{}]},{},[1])

