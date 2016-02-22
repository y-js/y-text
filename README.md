
# Text Type for [Yjs](https://github.com/y-js/yjs)

Manage text-like data with this shareable list type.

## Use it!
Retrieve this with bower or npm.

##### Bower
```
bower install y-list --save
```

##### NPM
```
npm install y-list --save
```

### List Object

##### Reference
* .insert(position, string)
  * Insert a string at a position
* .delete(position, length)
  * Delete a substring. The *length* parameter is optional and defaults to 1
* .bindAce(aceEditor)
  * Bind a [Ace Editor](https://ace.c9.io/)
* .bindTextarea(editor)
  * Supports textareas, inputs, and any contenteditable element
* .bind(editor)
  * Applies a binding, if the editor is supported
  * `.bind*(editor) does not preserve the existing value of the bound editor.
* .toString()
  * Convert the internal structure to a javascript string
* .get(i)
  * Retrieve the i-th character 
* .observe(f)
  * The observer is called whenever something on this text changed. (throws insert, and delete events)
* .unobserve(f)
  * Delete an observer

# A note on intention preservation
If two users insert something at the same position concurrently, the content that was inserted by the user with the higher user-id will be to the right of the other content. In the OT world we often speak of *intention preservation*, which is very loosely defined in most cases. This type has the following notion of intention preservation: When a user inserts content *c* after a set of content *C_left*, and before a set of content *C_right*, then *C_left* will be always to the left of c, and *C_right* will be always to the right of *c*. This property will also hold when content is deleted or when a deletion is undone.

# A note on time complexities
* .insert(position, contents)
  * O(position + |contents|)
* .toString()
  * O(this.length)
* Apply an insert operation from another user
  * Yjs does not transform against operations that do not conflict with each other.
  * An operation conflicts with another operation if it intends to be inserted at the same position.
  * Overall worst case complexety: O(|conflicts|!)

## License
Yjs is licensed under the [MIT License](./LICENSE.txt).

<kevin.jahns@rwth-aachen.de>