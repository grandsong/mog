
![Mog Logo](https://raw.githubusercontent.com/pomke/mog/master/doc/mog.png)

## MOG: Modern Object Grammar

Mog is a simple DSL for describing and asserting the state of an object.

### The story of Mog.

Remember when we all wrote XML? then someone said 'Hey this is _verbose and 
silly_, lets come up with something simpler, easier to read and easier to 
write' and so JSON was invented, and we were all glad.

However we lost something useful: validation. So we wrote a lot of manual 
type-checking in our APIs, we asserted that values existed and that they were good
and wholesome, because we didn't want our servers to explode. 

But writing lots of type-checking logic is tiresome, so we invented 
[schemas for JSON] (http://json-schema.org) to get the job done for us, 
but just like XML, JSON schemas were _verbose and silly_. 
They were also overkill when we just wanted to stop our API servers exploding 
from some dud input.

And so Mog was invented as a simple way to describe our expectations about 
some data. It looks a bit like _java/js/py/??-Doc_ format, and that's because 
schemas should be read like documentation, so we based it on a documentation 
format we're probably already familiar with :)

So what does a Mog schema look like?

```
dot.path @validator [optional, enum] {optional : 'arguments'}  -- optional comments!
```

- The dot path locates the element we're looking to validate.
- the @validator selects a validator to use (we can add our own custom ones pretty easily!) 
- Optionally we can provide an enum of allowed values.
- Some validators take arguments that alter how validation works.
- Comments are a great way of telling other devs your intentions :)


Lets see how it works with some real world examples:

## how?

### basics

```javascript
import mog from 'mog'

const m = mog()

let cat = m` 
   cat          @Object                                
   cat.fur      @String [black, white, orange, brown]  -- Cats have fur colour!
   cat.lives    @Number { min : 1, max : 9 }           -- Lives remaining` 

let validCat = cat( { fur : 'black', lives : 3 })
```

### errors

Mog will attempt to fix input if possible, for instance a @Number will accept 
a string containing a number, ie: '1.2' vs 1.2. Mog follows the mandate: Be
liberal in what you accept, and strict in what you hand out.

If however the object fails to validate against the Mog schema, an error will 
be thrown.

```javascript
let validCat = cat( { fur : 'black', lives : 30 })
```
```
/Users/pomke/code/mog/mog.js:37
          throw err;
          ^
Number must be less than 9, got 30

1.        cat          @Object
2.        cat.fur      @String [black, white, orange, brown]  -- Cats have fur colour!
3. >>>    cat.lives    @Number { min : 1, max : 9 }           -- Lives remaining
```

### middleware

Mog returns a validator function which also operates as a middleware for 
connect / express apps: 

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

## Creating your own validators

It's super easy to create your own validators. Your mog instance has an _add_
method that takes a validator name, and a function which takes the object to 
be validated, params then enums. It should either throw with an error, or 
return the validated (or coerced) value.

Here's an example validator that only accepts Odd numbers.

```javascript

m.add('OddNumber', (data, params, enums) => {
  if(params.opt && data == null) return // handle the opt param
  let parsed = parseFloat(data)
  if(parsed % 2) {
    return parsed
  } else {
    throw new Error(`Expected an odd number, got an even one!`)
  }
})
```

Now you can use this just like any built-in validator with @OddNumber.

[You can find the built-in validators here.](https://github.com/pomke/mog/blob/master/validators.js)

## ![Mog Laughing](https://raw.githubusercontent.com/pomke/mog/master/doc/lol.png) Let's kick this up a notch

BOOM! ok, this is where we let you in on a little secret, a mog schema IS 
a validator in it's own right.  What does that mean? It means that you can 
pass a mog schema to m.add with a name, then you can use that to validate 
things in other schemas! Here's an example:

Given a validator that validates a cat:

```javascript
let cat = m`
    cat          @Object
    cat.name     @String                                -- What is my name? 
    cat.dob      @Date { opt }                          -- Date of birth
    cat.fur      @String [black, white, orange, brown]  -- Cats have fur colour!
    cat.lives    @Number { min : 1, max : 9, opt }      -- Lives remaining` 
```

We can then register that as a validator called @Cat:

```javascript
m.add('Cat', cat);
```

Now let's make a cat carrier that contains a cat:

```javascript
let catCarrier = m`
  carrier.label     @String         -- Label on the cat carrier
  carrier.contents  @Cat { opt }    -- Carrier contains an optional Cat`
```

Which works as you'd expect:

```javascript
let catInCarrier = catCarrier(
  {label : 'Ship to Mexico!',
   contents : { name : 'Neko', fur : 'brown' }})
```

## ![Mog Love](https://raw.githubusercontent.com/pomke/mog/master/doc/love.png) It's cats all the way down! 

Imagine you want to model a bubushka doll, you know those little wooden dolls
which have a copy of themselves inside? Mog allows you to reference a mog schema
validator from within itself:

```javascript
// register a validator that references it's self. Note that it should 
// be optional, or the final child node will be invalid. 
m.add('Bubushka', m`
      bub.name     @String
      bub.child    @Bubushka {opt}`);
    
// now we can use this as normal
let checkBubas = m`top @Bubushka`;

checkBubas( { name : 'Adel', child : { 
                name : 'Betty', child : { 
                  name : 'Claire', child : { 
                    name : 'Bruce'} } } } );
```

Sadly, Bruce was unable to continue the Bubushka line. 
 


