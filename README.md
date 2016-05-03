
![Mog Logo](https://raw.githubusercontent.com/pomke/mog/master/mog.png)

## MOG: Modern Object Grammar

Mog is a simple DSL for describing and asserting the state of an object.

### why?

Remember when we all wrote XML? then someone said 'Hey this is _verbose and 
silly_, lets come up with something simpler, easier to read and easier to 
write' and so JSON was invented, and we were all glad.

However we lost something useful: validation. So we write a lot of manual 
type-checking in our APIs, we assert that values exist and that they are good
and wholesome, because we don't want our servers to explode. 

But writing lots of type-checking logic is tiresome, so we invented 
![schemas for JSON] (http://json-schema.org), but guess what!? Just like 
XML, JSON schemas are _verbose and silly_, and probably overkill when you
just want to stop your API server exploding from some dud input (and pssst, 
secretly we all just validate objects anyway, not even JSON). 

And so Mog was invented as a simple way to describe our expectations about 
some data. It looks a bit like java/js/py/??-Doc format, and that's because 
schemas should be like documentation, easily readable, so we based it on a
documentation format you're probably already familiar with :)

So what does a Mog schema look like?

```
dot.path @validator [optional, enum] {optional : 'arguments'}  -- optional comments!
```

Lets see how it works with some real world examples:

## how?

```javascript
import m from 'mog'

let cat = m` 
   cat          @Object                                -- Cat is an object
   cat.fur      @String [black, white, orange, brown]  -- Cats have fur colour!
   cat.lives    @Number { min : 1, max : 9 }           -- Lives remaining` 

let validCat = cat( { fur : 'black', lives : 3 })
```

mog returns a validator function which also operates as a middleware for 
conneect / express apps: 

```javascript

app.put('/cat/:id', m`
  req.params.id     @Number                                -- Cat's ID
  req.body          @Object                                -- Cat is an object
  req.body.fur      @String [black, white, orange, brown]  -- Cats have fur colour!
  req.body.lives    @Number { min : 1, max : 9 }           -- Lives remaining`,
  (req, res) => {
    // Access req.body.cat with impunity, knowing that it must be valid  
    console.log(req.body.fur)
  })
```
