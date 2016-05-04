'use strict';

const assert = require('assert');
const mog = require('../mog');
const m = mog();

describe('MOG Core', function() {

    let cat;

  it('evaluates a plain string as a function', (done) => {
    m('cat @Object');
    done();
  });

  it('evaluates template literals as a tag function', (done) => {
    cat = m`
    cat          @Object
    cat.dob      @Date { opt }                          -- Date of birth
    cat.fur      @String [black, white, orange, brown]  -- Cats have fur colour!
    cat.lives    @Number { min : 1, max : 9, opt }      -- Lives remaining` 
    done();
  });

  it('does basic object validation', (done) => {
    let cat1 = cat({ fur : 'black', lives : 3 });
    assert.equal(cat1.fur, 'black');
    assert.equal(cat1.lives, 3);
    return done();
  });


  it('does not validate bad data', (done) => {
    assert.throws(() => {
      cat({});
    });
    return done();
  });


  it('functions as an express middleware', (done) => {

    let mockResponse = {
      status : (status) => {
        return mockResponse;
      },
      send : (s) => {
        assert(false); // explode!
      }
    };

    cat({fur : 'white'}, mockResponse, () => { done(); });

  });

  it('handles errors as an express middleware', (done) => {

    let status = null;
    let mockResponse = {
      status : (st) => {
        status = st;
        return mockResponse;
      },
      send : (s) => {
        assert(status, 400);
        done();
      }
    };

    cat({}, mockResponse, () => { assert(false); });

  });
  
 it('functions as an HTTP/Connect middleware', (done) => {

    let mockResponse = {
      writeHead : (status) => {
      },
      end : (s) => {
        assert(false); // explode!
      }
    };

    cat({fur : 'white'}, mockResponse, () => { done(); });

  });

  it('handles errors as an HTTP/Connect middleware', (done) => {

    let status = null;
    let mockResponse = {
      writeHead : (st) => {
        status = st;
      },
      end : (s) => {
        assert(status, 400);
        done();
      }
    };

    cat({}, mockResponse, () => { assert(false); });

  });


  it('can use a mog schema as a validator itself', (done) => {
    m.add('Cat', cat);

    let catCarrier = m`
      carrier.contents  @Cat
      carrier.label     @String`


    let carrier = catCarrier({label : 'Ship to Mexico!',
                              contents : { fur : 'brown' }});
    assert.equal(carrier.contents.fur, 'brown');
    done();
  });


  it('recurses, cats all the way down..', (done) => {
    // define a nestable type
    m.add('Node', m`
      node.label     @String
      node.child     @Node {opt}`);
    
    let checkNodes = m`root @Node`;

    let tree = checkNodes( { label : 'a', child : 
                              { label : 'b', child : 
                                { label : 'c' }}} );
    assert.equal(tree.child.child.label, 'c');
    done();

  });

});

describe('Validators', function() {
  // desc, validator, enum, arguments, expect success, match object
  let typeTests = [
    // Object validator
    ['matches a plain object', '@Object', '', '', true, {}],
    ['supports opt', '@Object', '', '{opt}', true, null],
    ['doesn\'t match null without opt', '@Object', '', '', false, null],
    ['doesn\'t match a string', '@Object', '', '', false, 'foo'],

    // String validator
    ['matches a string', '@String', '', '', true, 'foo'],
    ['doesn\'t match an object', '@String', '', '', false, {}],
    ['doesn\'t match a Number', '@String', '', '', false, 123],
    ['rejects length < min', '@String', '', '{min : 3}', false, 'hi'],
    ['rejects length > max', '@String', '', '{max : 3}', false, 'hi there'],
    ['matches regex', '@String', '', '{re : ^hello}', true, 'hello mog!'],
    ['fails to matche regex', '@String', '', '{re : \'^hello\'}', false, 'yo mog!'],

    // Number validator
    ['matches a number', '@Number', '', '', true, 123],
    ['matches a string with a number', '@Number', '', '', true, '123'],
    ['doesn\'t match a non numeric string', '@Number', '', '', false, 'mog'],
    ['rejects < min', '@Number', '', '{min : 3}', false, 2],
    ['rejects > max', '@Number', '', '{max : 3}', false, 22],

    //Date validator
    ['matches a date object', '@Date', '', '', true, new Date()],
    ['matches a string with a date', '@Date', '', '', true, '12/12/2013'],
    ['doesn\'t match garbage', '@Date', '', '', false, 'mog'],
    ['rejects date < min', '@Date', '', '{min : 12/12/2014}', true, '12/12/2013'],
    ['rejects date > max', '@Date', '', '{max : 12/12/2014}', false, new Date()],

    //Boolean validator
    
    //Email validator
    ['matches an email', '@Email', '', '', true, 'foo@example.com'],
    ['doesn\'t match a non email', '@Email', '', '', false, 'fooemail.com'],
    

  ];

  typeTests.forEach((test) => {
    it(`${test[1]} - ${test[0]}`, (done) => {
      let val = m`test.item ${test[1]} ${test[2]} ${test[3]}`;
      if(test[4]) {
        val({item : test[5]});
      } else {
        assert.throws(() => {
          val({item : test[5]});
        });
      }
      done();
    });
  });


});






  // Define a cat object schema that we can use down the track..
  //let cat = m`
  //  cat            @Object                                   - Cat is a four legged creature, you need more of these
  //  cat.name       @String  { min : 3, max : 35 }            - All cats should have names, this is important
  //  cat.weight     @Number  { min : 2, max : 20 }            - Cat's weight, in KGs
  //  cat.breed      @String [moggy, main coon] { opt }        - the breed of your cat.
  //  cat.birthdate  @Date { opt }                             - date the cat was born ^_^`;
  //
  //console.log( cat({cat: {name : 'mog', weight: '12'}}));   // validate object


/*

// define a custom validator type 'token' to validate our auth tokens
m.add('token', (data, params) => {
  return new Promise((res, rej) => {
    if(params.required && !data) return rej('token is required');
    let valid = validateToken(data);
    if(valid) {
      return res(data);
    } else {
      return rej('invalid token!');
    }
  });
});

// create a middleware that validates our auth tokens to use for write APIs
let auth = m`req.cookies.token @token { required } - cookie 'token' must be a valid token`;


let app = express();

// Add a new cat, this requires a valid auth token.
app.post('/cat/add', auth, m`req.body @cat {required}`, (req, res) => {
  console.log('got a cat!', req.body);
});


// get a cat, no auth required
app.get('/cat/:id', m`req.params.id @number {required}`, (req, res) => {
  return getCat(req.param.id);
});


// give some inventory to a cat
app.post('/cat/:id/inventory', m`
         req.param.id         @number {required}                  - The id of the cat to give something to.
         req.body.item        @object { required }                - The item you'd like to give to the cat.
         req.body.item.name   @string { required }                - Item's name.
         req.body.item.weight @number { max : 50, required }      - item weight in KGs.
         req.body.item.number @number { required }                - how many of this item to give.`,
         (req, res) => {
            console.log('adding', req.body.item, 'to cat #', req.param.id);
         });


app.post('/cat/:id/tags', m`
         req.param.id @number {required}                   - Id of the cat we want to tag
         req.body     @array[@string]  {required}          - requires an array of strings`,
         (req, res) => {
            addTagsToCat(req.param.id, req.body);
         });
*/


