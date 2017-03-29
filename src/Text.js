/* global Y, Element */
'use strict'

var diff = require('fast-diff')

function extend (Y) {
  Y.requestModules(['Array']).then(function () {
    class YText extends Y.Array.typeDefinition['class'] {
      constructor (os, _model, _content) {
        super(os, _model, _content)
        this.textfields = []
        this.aceInstances = []
        this.codeMirrorInstances = []
      }
      toString () {
        return this._content.map(function (c) {
          return c.val
        }).join('')
      }
      insert (pos, content) {
        super.insert(pos, content.split(''))
      }
      unbindAll () {
        this.unbindTextareaAll()
        this.unbindAceAll()
        this.unbindCodeMirrorAll()
      }
      unbindCodeMirror (codeMirrorInstance) {
        var i = this.codeMirrorInstances.findIndex(function (binding) {
          return binding.editor === codeMirrorInstance
        })
        if (i >= 0) {
          var binding = this.codeMirrorInstances[i]
          this.unobserve(binding.yCallback)
          binding.editor.off('changes', binding.codeMirrorCallback)
          this.codeMirrorInstances.splice(i, 1)
        }
      }
      unbindCodeMirrorAll () {
        for (let i = this.codeMirrorInstances.length - 1; i >= 0; i--) {
          this.unbindCodeMirror(this.codeMirrorInstances[i].editor)
        }
      }
      bindCodeMirror (codeMirrorInstance, options) {
        var self = this
        options = options || {}

        // this function makes sure that either the
        // codemirror event is executed, or the yjs observer is executed
        var token = true
        function mutualExcluse (f) {
          if (token) {
            token = false
            try {
              f()
            } catch (e) {
              token = true
              throw new Error(e)
            }
            token = true
          }
        }
        codeMirrorInstance.setValue(this.toString())

        function codeMirrorCallback (cm, deltas) {
          mutualExcluse(function () {
            for (var i = 0; i < deltas.length; i++) {
              var delta = deltas[i]
              var start = codeMirrorInstance.indexFromPos(delta.from)
              // apply the delete operation first
              if (delta.removed.length > 0) {
                var delLength = 0
                for (var j = 0; j < delta.removed.length; j++) {
                  delLength += delta.removed[j].length
                }
                // "enter" is also a character in our case
                delLength += delta.removed.length - 1
                self.delete(start, delLength)
              }
              // apply insert operation
              self.insert(start, delta.text.join('\n'))
            }
          })
        }
        codeMirrorInstance.on('changes', codeMirrorCallback)

        function yCallback (event) {
          mutualExcluse(function () {
            let from = codeMirrorInstance.posFromIndex(event.index)
            if (event.type === 'insert') {
              let to = from
              codeMirrorInstance.replaceRange(event.values.join(''), from, to)
            } else if (event.type === 'delete') {
              let to = codeMirrorInstance.posFromIndex(event.index + event.length)
              codeMirrorInstance.replaceRange('', from, to)
            }
          })
        }
        this.observe(yCallback)
        this.codeMirrorInstances.push({
          editor: codeMirrorInstance,
          yCallback: yCallback,
          codeMirrorCallback: codeMirrorCallback
        })
      }
      unbindAce (aceInstance) {
        var i = this.aceInstances.findIndex(function (binding) {
          return binding.editor === aceInstance
        })
        if (i >= 0) {
          var binding = this.aceInstances[i]
          this.unobserve(binding.yCallback)
          binding.editor.off('change', binding.aceCallback)
          this.aceInstances.splice(i, 1)
        }
      }
      unbindAceAll () {
        for (let i = this.aceInstances.length - 1; i >= 0; i--) {
          this.unbindAce(this.aceInstances[i].editor)
        }
      }
      bindAce (aceInstance, options) {
        var self = this
        options = options || {}

        // this function makes sure that either the
        // ace event is executed, or the yjs observer is executed
        var token = true
        function mutualExcluse (f) {
          if (token) {
            token = false
            try {
              f()
            } catch (e) {
              token = true
              throw new Error(e)
            }
            token = true
          }
        }
        aceInstance.setValue(this.toString())

        function aceCallback (delta) {
          mutualExcluse(function () {
            var start
            var length

            var aceDocument = aceInstance.getSession().getDocument()
            if (delta.action === 'insert') {
              start = aceDocument.positionToIndex(delta.start, 0)
              self.insert(start, delta.lines.join('\n'))
            } else if (delta.action === 'remove') {
              start = aceDocument.positionToIndex(delta.start, 0)
              length = delta.lines.join('\n').length
              self.delete(start, length)
            }
          })
        }
        aceInstance.on('change', aceCallback)

        aceInstance.selection.clearSelection()

        // We don't that ace is a global variable
        // see #2
        var aceClass
        if (typeof ace !== 'undefined' && options.aceClass == null) {
          aceClass = ace // eslint-disable-line
        } else {
          aceClass = options.aceClass
        }
        var aceRequire = options.aceRequire || aceClass.require
        var Range = aceRequire('ace/range').Range

        function yCallback (event) {
          var aceDocument = aceInstance.getSession().getDocument()
          mutualExcluse(function () {
            if (event.type === 'insert') {
              let start = aceDocument.indexToPosition(event.index, 0)
              aceDocument.insert(start, event.values.join(''))
            } else if (event.type === 'delete') {
              let start = aceDocument.indexToPosition(event.index, 0)
              let end = aceDocument.indexToPosition(event.index + event.length, 0)
              var range = new Range(start.row, start.column, end.row, end.column)
              aceDocument.remove(range)
            }
          })
        }
        this.observe(yCallback)
        this.aceInstances.push({
          editor: aceInstance,
          yCallback: yCallback,
          aceCallback: aceCallback
        })
      }
      bind () {
        var e = arguments[0]
        if (e instanceof Element) {
          this.bindTextarea.apply(this, arguments)
        } else if (e != null && e.session != null && e.getSession != null && e.setValue != null) {
          this.bindAce.apply(this, arguments)
        } else if (e != null && e.posFromIndex != null && e.replaceRange != null) {
          this.bindCodeMirror.apply(this, arguments)
        } else {
          console.error('Cannot bind, unsupported editor!')
        }
      }
      unbindTextarea (textarea) {
        var i = this.textfields.findIndex(function (binding) {
          return binding.editor === textarea
        })
        if (i >= 0) {
          var binding = this.textfields[i]
          this.unobserve(binding.yCallback)
          var e = binding.editor
          e.removeEventListener('input', binding.eventListener)
          this.textfields.splice(i, 1)
        }
      }
      unbindTextareaAll () {
        for (let i = this.textfields.length - 1; i >= 0; i--) {
          this.unbindTextarea(this.textfields[i].editor)
        }
      }
      bindTextarea (textfield, domRoot) {
        domRoot = domRoot || window; // eslint-disable-line
        if (domRoot.getSelection == null) {
          domRoot = window; // eslint-disable-line
        }

        // don't duplicate!
        for (var t = 0; t < this.textfields.length; t++) {
          if (this.textfields[t].editor === textfield) {
            return
          }
        }
        // this function makes sure that either the
        // textfieldt event is executed, or the yjs observer is executed
        var token = true
        function mutualExcluse (f) {
          if (token) {
            token = false
            try {
              f()
            } catch (e) {
              token = true
              throw new Error(e)
            }
            token = true
          }
        }

        var self = this
        textfield.value = this.toString()

        var createRange, writeRange, writeContent, getContent
        if (textfield.selectionStart != null && textfield.setSelectionRange != null) {
          createRange = function (fix) {
            var left = textfield.selectionStart
            var right = textfield.selectionEnd
            if (fix != null) {
              left = fix(left)
              right = fix(right)
            }
            return {
              left: left,
              right: right
            }
          }
          writeRange = function (range) {
            writeContent(self.toString())
            textfield.setSelectionRange(range.left, range.right)
          }
          writeContent = function (content) {
            textfield.value = content
          }
          getContent = function () {
            return textfield.value
          }
        } else {
          createRange = function (fix) {
            var range = {}
            var s = domRoot.getSelection()
            var clength = textfield.textContent.length
            range.left = Math.min(s.anchorOffset, clength)
            range.right = Math.min(s.focusOffset, clength)
            if (fix != null) {
              range.left = fix(range.left)
              range.right = fix(range.right)
            }
            var editedElement = s.focusNode
            if (editedElement === textfield || editedElement === textfield.childNodes[0]) {
              range.isReal = true
            } else {
              range.isReal = false
            }
            return range
          }

          writeRange = function (range) {
            writeContent(self.toString())
            var textnode = textfield.childNodes[0]
            if (range.isReal && textnode != null) {
              if (range.left < 0) {
                range.left = 0
              }
              range.right = Math.max(range.left, range.right)
              if (range.right > textnode.length) {
                range.right = textnode.length
              }
              range.left = Math.min(range.left, range.right)
              var r = document.createRange(); // eslint-disable-line
              r.setStart(textnode, range.left)
              r.setEnd(textnode, range.right)
              var s = domRoot.getSelection(); // eslint-disable-line
              s.removeAllRanges()
              s.addRange(r)
            }
          }
          writeContent = function (content) {
            textfield.innerText = content
            /*
            var contentArray = content.replace(new RegExp('\n', 'g'), ' ').split(' '); // eslint-disable-line
            textfield.innerText = ''
            for (var i = 0; i < contentArray.length; i++) {
              var c = contentArray[i]
              textfield.innerText += c
              if (i !== contentArray.length - 1) {
                textfield.innerHTML += '&nbsp;'
              }
            }
            */
          }
          getContent = function () {
            return textfield.innerText
          }
        }
        writeContent(this.toString())

        function yCallback (event) {
          mutualExcluse(() => {
            var oPos, fix
            if (event.type === 'insert') {
              oPos = event.index
              fix = function (cursor) { // eslint-disable-line
                if (cursor <= oPos) {
                  return cursor
                } else {
                  cursor += 1
                  return cursor
                }
              }
              var r = createRange(fix)
              writeRange(r)
            } else if (event.type === 'delete') {
              oPos = event.index
              fix = function (cursor) { // eslint-disable-line
                if (cursor < oPos) {
                  return cursor
                } else {
                  cursor -= 1
                  return cursor
                }
              }
              r = createRange(fix)
              writeRange(r)
            }
          })
        }
        this.observe(yCallback)

        var textfieldObserver = function textfieldObserver () {
          mutualExcluse(function () {
            var r = createRange(function (x) { return x })
            var oldContent = self.toString()
            var content = getContent()
            var diffs = diff(oldContent, content, r.left)
            var pos = 0
            for (var i = 0; i < diffs.length; i++) {
              var d = diffs[i]
              if (d[0] === 0) { // EQUAL
                pos += d[1].length
              } else if (d[0] === -1) { // DELETE
                self.delete(pos, d[1].length)
              } else { // INSERT
                self.insert(pos, d[1])
                pos += d[1].length
              }
            }
          })
        }
        textfield.addEventListener('input', textfieldObserver)
        this.textfields.push({
          editor: textfield,
          yCallback: yCallback,
          eventListener: textfieldObserver
        })
      }
      _destroy () {
        this.unbindAll()
        this.textfields = null
        this.aceInstances = null
        super._destroy()
      }
    }
    Y.extend('Text', new Y.utils.CustomTypeDefinition({
      name: 'Text',
      class: YText,
      struct: 'List',
      initType: function * YTextInitializer (os, model) {
        var _content = []
        yield* Y.Struct.List.map.call(this, model, function (op) {
          if (op.hasOwnProperty('opContent')) {
            throw new Error('Text must not contain types!')
          } else {
            op.content.forEach(function (c, i) {
              _content.push({
                id: [op.id[0], op.id[1] + i],
                val: op.content[i]
              })
            })
          }
        })
        return new YText(os, model.id, _content)
      },
      createType: function YTextCreator (os, model) {
        return new YText(os, model.id, [])
      }
    }))
  })
}

module.exports = extend
if (typeof Y !== 'undefined') {
  extend(Y)
}
