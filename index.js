'use strict';
let mog = require('./mog');
let express = require('express');

let m = mog();

// Define a cat object schema that we can use down the track..
//let cat = m`
//  cat            @Object                                   - Cat is a four legged creature, you need more of these
//  cat.name       @String  { min : 3, max : 35 }            - All cats should have names, this is important
//  cat.weight     @Number  { min : 2, max : 20 }            - Cat's weight, in KGs
//  cat.breed      @String [moggy, main coon] { opt }        - the breed of your cat.
//  cat.birthdate  @Date { opt }                             - date the cat was born ^_^`;
//
//console.log( cat({cat: {name : 'mog', weight: '12'}}));   // validate object

let cat = m` 
   cat          @Object                                
   cat.fur      @String [black, white, orange, brown]  -- Cats have fur colour!
   cat.lives    @Number { min : 1, max : 9 }           -- Lives remaining` 

let validCat = cat( { fur : 'black', lives : 30 })

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


