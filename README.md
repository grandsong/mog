
![Mog Logo](https://raw.githubusercontent.com/pomke/fickle/master/mog.svg)

## MOG: Modern Object Grammar

Mog is a method for describing and asserting the state of an object.

```javascript

m` cat          @Object                                -- Cat is an object
   cat.fur      @String [black, white, orange, brown]  -- Cats have fur colour!
   cat.lives    @Number { min : 1, max : 9 }           -- Lives remaining` 
```

mog returns a validator function which also operates as a middleware for 
conneect / express apps. 

```javascript

app.put('/cat/:id', m`
  params.id         @Number                                -- Cat's ID
  body.cat          @Object                                -- Cat is an object
  body.cat.fur      @String [black, white, orange, brown]  -- Cats have fur colour!
  body.cat.lives    @Number { min : 1, max : 9 }           -- Lives remaining`,
  (req, res) => {
    // Access req.body.cat with impunity, knowing that it must be valid  
    console.log(req.body.cat.fur);
  });
```
