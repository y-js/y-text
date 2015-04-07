
# Text Type for [Yjs](https://github.com/y-js/yjs)

Manage text/string objects with this shareable type. This type supports insert and delete operations. Furthermore, you can bind the text to textareas, input objects, and contentEditable HTML tags.

## Use it!
Retrieve this with bower or npm.

##### Bower
```
bower install y-text --save
```

and include the js library.

```
<script src="./bower_components/y-text/y-text.js"></script>
```

##### NPM
```
npm install y-text --save
```
and put it on the `Y` object.

```
Y.Text = require("y-text");
```


### Text Object

##### Reference
* Create
```
var ytext = new Y.Text()
```
* .insert(position, string)
  * Insert a string at a position
* .delete(position, length)
  * Delete a substring. The *length* parameter is optional and defaults to 1
* .val()
  * Retrieve all content as a String Object
* .val(position)
  * Retrieve a character from a position
* .observe(f)
  * The observer is called whenever something on this text object changed. (throws insert, and delete events)
* .unobserve(f)
  * Delete an observer
* .bind(element)
  * Bind the textarea to a *textarea*, *input* element, or *contentEditable* HTML Element


# A note on intention preservation
If two users insert something at the same position concurrently, the content that was inserted by the user with the higher user-id will be to the right of the other content. In the OT world we often speak of *intention preservation*, which is very loosely defined in most cases. This type has the following notion of intention preservation: When a user inserts content *c* after a set of content *C_left*, and before a set of content *C_right*, then *C_left* will be always to the left of c, and *C_right* will be always to the right of *c*. This property will also hold when content is deleted or when a deletion is undone.

# A note on time complexities
* .insert(position, string)
  * O(position+|string|)
* .delete(position, length)
  * O(position)
* .val()
  * O(|ytext|)
* .val(position)
  * O(position|)
* Apply a delete operation from another user
  * O(1)
* Apply an insert operation from another user
  * Yjs does not transform against operations that do not conflict with each other.
  * An operation conflicts with another operation if it intends to be inserted at the same position.
  * Overall worst case complexety: O(|conflicts|!)


# Issues
* Support undo
* Create a polymer element

## License
Yjs is licensed under the [MIT License](./LICENSE.txt).

<kevin.jahns@rwth-aachen.de>