'use strict';

const isemail = require('isemail');

module.exports = function(m) {

  m.add('Object', (data, params) => {
    if(params.opt && data === null) return;
    if(!params.opt && data === null) throw new Error('missing value, expected object');
    if(typeof data != 'object') throw new Error('must be an object');
    return data;
  });

  m.add('String', (data, params, enums) => {
    if(params.opt && data == null) return;

    if(typeof data !== 'string') {
      throw new Error('wrong value, required string, got ' + typeof data);
    }
    if(params.min && data.length < params.min) {
      throw new Error(`string must be less than ${params.min} chars long, got ${data.length}`);
    }
    if(params.max && data.length > params.max) {
      throw new Error(`string must be greater than ${params.max} chars long, got ${data.length}`);
    }

    if(params.re && !new RegExp(params.re).test(data)) {
      throw new Error(`string did not match regex ${params.re}`);
    }

    return data;
  });

  m.add('Number', (data, params) => {
    if(params.opt && data == null) return;
    let parsed = parseFloat(data);
    let _isnan = isNaN(parsed);
    if(_isnan) {
      throw new Error('wrong value, required a Number, got ' + data);
    }
    if(params.min && parsed < params.min) {
      throw new Error(`Number must be greater than ${params.min}, got ${parsed}`);
    }
    if(params.max && parsed > params.max) {
      throw new Error(`Number must be less than ${params.max}, got ${parsed}`);
    }
    return parsed;
  });

  m.add('Date', (data, params) => {
    if(params.opt && data == null) return data;

    let d = new Date(data);

    if(isNaN(d.getTime())) {
      throw new Error(`Got ${typeof data}, required Date or Date compatible string`);
    }

    if(params.min && d.getTime() < new Date(params.min).getTime()) {
      throw new Error(`Got date ${data}, expected greater than ${params.min}`);
    }

    if(params.max && d.getTime() > new Date(params.max).getTime()) {
      throw new Error(`Got date ${data}, expected less than ${params.max}`);
    }
    return d;
  });

  m.add('Email', (data, params) => {
    if(params.opt && data == null) return;

    if(typeof data !== 'string') {
      throw new Error('wrong value, required email string, got ' + typeof data);
    }
 
    if(!isemail.validate(data)) {
      throw new Error("required email, got:" + data);
    }

    if(params.lower) {
      return data.toLowerCase();
    }
    return data;
  });
};
