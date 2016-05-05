'use strict';

/************************************************************************
 *                                                                      *
 *                              MOG.JS                                  *
 *                                                                      *
 ************************************************************************/

module.exports = function mog(registry) {
  if(!registry) registry = {};

  function m(strings) {
    // parse input into a schema
    let s = '';
    if(typeof strings === 'string') {
      // we're being called as a function with one string input
      s = strings;
    } else {
      // we're being called as a Tag function, smoosh it together..
      let vars = Array.prototype.slice.call(arguments, 1);
      strings.forEach((str) => {
        s += str;
        if(vars.length) s += vars.shift();
      });
    }
    let schema = parse(s);

    // return main validator function
    return function mogware(reqOrObj, res, next) {
      let middleware, params = null;
      if(res && !res.__secretMog) middleware = true;
      if(res && res.__secretMog) params = res;
      if(params !== null) {
        // we are acting as a validator, do validatory things ^_^
        if(params.opt && reqOrObj == null) return;
        if(!params.opt && reqOrObj == null) {
          throw new Error(`Expected ${s}, got ${reqOrObj}`);
        }
      }
      let bits = schema.map((s) => {
        return [s, dots(reqOrObj, s.id)];
      });

      try {
        bits.forEach((bit) => {
          let s = bit[0], value = bit[1], validator = registry[s.type];
          let val;
          try {
            s.args.__secretMog = true;
            val = validator(value, s.args, s.enum);
          } catch(e) {
            throw formatError(s, e.message);
          }
          // set the validator's returned value on the object
          dots(reqOrObj, s.id, val);
        });
      } catch(err) {
        if(middleware) {
          if(res.status) {
            // if we're an express middleware
            return res.status(400).send(err);
          } else {
            // assume HTTP response
            res.writeHead(400, {
              'Content-Length': err.length,
              'Content-Type': 'text/plain' });
            return res.end(err);
          }
        } else {
          throw err;
        }
      }

      if(middleware) {
        return next();
      } else {
        return reqOrObj;
      }

    };
  };

  m.add = function add(type, validator) {
    registry[type] = validator;
  };

  // load validators
  require('./validators')(m);

  return m;
}

function formatError(s, msg) {
  let bits = s.source.trim().split('\n');
  let arrow, source = (msg || '') + '\n\n';
  for(let i=0; i < bits.length; i++) {
    arrow = '   ';
    if(i+1 == s.lineNumber) arrow = '>>>';
    source += `${i+1}. ${arrow} ${bits[i]}\n`;
  }
  return source;
}

function dots(o, path, setValue) {
  let bits, setKey, obj = {};
  obj[path.split('.')[0]] = o; // first bit always matches current object
  if(setValue) {
    bits = path.split('.');
    setKey = bits.pop();
  } else {
    bits = path.split('.');
  }
  for(let name of bits) {
    obj = obj[name];
    if(obj == null && !setValue) return obj;
  }
  if(setValue) {
    obj[setKey] = setValue;
  } else {
    return obj;
  }
}

let reg = /^\s*([\w\.]+)\s+@(\w+)\s*(\[[^\]]*\])?\s*(\{[^}]*\})?\s*(\-.*)?$/;

function parseArgs(s) {
  let args = {};
  if(!s) return args;
  let bits = s.trim().slice(1, s.length-1).split(',').map((x)=> x.trim());
  bits.forEach((b) => {
    if(!~b.indexOf(':')) {
      args[b] = true;
    } else {
      let kv = b.split(':').map((s) => s.trim());
      args[kv[0]] = isNaN(parseFloat(kv[1])) ? kv[1] : parseFloat(kv[1]);
    }
  });
  return args;
}

function parseList(s) {
  if(!s) return [];
  return s.trim().slice(1, s.length-1).split(',').map((x)=> {
    x = x.trim();
    return isNaN(parseFloat(x)) ? x : parseFloat(x);
  });
}

function parseLine(s, source, lineNumber) {
  let out = {}, bits = s.match(reg);
  out.id = bits[1];
  out.type = bits[2];
  out.enum = parseList(bits[3]);
  out.args = parseArgs(bits[4]);
  out.comment = bits[5];
  out.source = source;
  out.lineNumber = lineNumber;
  return out;
}

function parse(s) {
  let lines = s.split('\n').filter((s) => s.trim());
  let out = [];
  for(let i=0; i < lines.length; i++) {
    out.push(parseLine(lines[i], s, i+1));
  }
  return out;
}


