'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require('sanctuary-type-classes'),
    toString = _require.toString;

var type = require('sanctuary-type-identifiers');

// Names of prop used to store:
// * name of variant of a sum type
var TAG = '@@tag';
// * array of arguments used to create a value (to speed up `cata`)
var VALUES = '@@values';
// * `@@type` of it's returned results
var TYPE = '@@type';
// * `@@type` of variant constructor's returned results
var RET_TYPE = '@@ret_type';

var tagged = function tagged(typeName, fields) {
  var proto = {};
  proto.toString = tagged$toString;
  // this way we avoid named function
  var typeRep = makeConstructor(fields, proto);
  typeRep.toString = typeRepToString;
  typeRep.prototype = proto;
  typeRep.is = isType;
  typeRep[TYPE] = typeName;
  proto.constructor = typeRep;
  return typeRep;
};

var taggedSum = function taggedSum(typeName, constructors) {
  var proto = {};
  proto.cata = sum$cata;
  proto.toString = sum$toString;
  var typeRep = _defineProperty({
    toString: typeRepToString,
    prototype: proto,
    is: isType
  }, TYPE, typeName);
  proto.constructor = typeRep;
  Object.keys(constructors).forEach(function (tag) {
    var fields = constructors[tag];
    var tagProto = Object.create(proto);
    defProp(tagProto, TAG, tag);
    if (fields.length === 0) {
      typeRep[tag] = makeValue(fields, tagProto, [], 0);
      typeRep[tag].is = sum$isUnit;
      return;
    }
    typeRep[tag] = makeConstructor(fields, tagProto);
    typeRep[tag].is = sum$isVariant;
    typeRep[tag][TAG] = tag;
    typeRep[tag][RET_TYPE] = typeName;
    typeRep[tag].toString = sum$ctrToString;
  });
  return typeRep;
};

var sum$cata = function sum$cata(fs) {
  var tag = this[TAG];
  if (!fs[tag]) {
    throw new TypeError("Constructors given to cata didn't include: " + tag);
  }
  return fs[tag].apply(fs, this[VALUES]);
};

var sum$ctrToString = function sum$ctrToString() {
  return this[RET_TYPE] + '.' + this[TAG];
};

var sum$toString = function sum$toString() {
  return this.constructor[TYPE] + '.' + this[TAG] + arrToString(this[VALUES]);
};

var typeRepToString = function typeRepToString() {
  return this[TYPE];
};

var tagged$toString = function tagged$toString() {
  return '' + this.constructor[TYPE] + arrToString(this[VALUES]);
};

var sum$isVariant = function sum$isVariant(val) {
  return Boolean(val) && this[TAG] === val[TAG] && this[RET_TYPE] === type(val);
};

var sum$isUnit = function sum$isUnit(val) {
  return this === val || Boolean(val) && this[TAG] === val[TAG] && type(this) === type(val);
};

var isType = function isType(val) {
  return this[TYPE] === type(val);
};

var makeValue = function makeValue(fields, proto, values, argumentsLength) {
  if (argumentsLength !== fields.length) {
    throw new TypeError('Expected ' + fields.length + ' arguments, got ' + argumentsLength);
  }
  var obj = Object.create(proto);
  defProp(obj, VALUES, values);
  for (var idx = 0; idx < fields.length; idx++) {
    obj[fields[idx]] = values[idx];
  }
  return obj;
};

// adopted version of withValue from  https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
var defProp = function defProp(obj, prop, val) {
  var desc = defProp.desc || (defProp.desc = {
    enumerable: false,
    writable: false,
    configurable: false,
    value: null
  });
  desc.value = val;
  Object.defineProperty(obj, prop, desc);
};

// optimised version of `arr.map(toString).join(', ')`
var arrToString = function arrToString(arr) {
  if (arr.length === 0) {
    return '';
  }
  var str = '(' + toString(arr[0]);
  for (var i = 1; i < arr.length; i++) {
    str = str + ', ' + toString(arr[i]);
  }
  return str + ')';
};

var makeConstructor = function makeConstructor(fields, proto) {
  switch (fields.length) {
    case 1:
      return function (a) {
        return makeValue(fields, proto, [a], arguments.length);
      };
    case 2:
      return function (a, b) {
        return makeValue(fields, proto, [a, b], arguments.length);
      };
    case 3:
      return function (a, b, c) {
        return makeValue(fields, proto, [a, b, c], arguments.length);
      };
    case 4:
      return function (a, b, c, d) {
        return makeValue(fields, proto, [a, b, c, d], arguments.length);
      };
    case 5:
      return function (a, b, c, d, e) {
        return makeValue(fields, proto, [a, b, c, d, e], arguments.length);
      };
    case 6:
      return function (a, b, c, d, e, f) {
        return makeValue(fields, proto, [a, b, c, d, e, f], arguments.length);
      };
    case 7:
      return function (a, b, c, d, e, f, g) {
        return makeValue(fields, proto, [a, b, c, d, e, f, g], arguments.length);
      };
    case 8:
      return function (a, b, c, d, e, f, g, h) {
        return makeValue(fields, proto, [a, b, c, d, e, f, g, h], arguments.length);
      };
    case 9:
      return function (a, b, c, d, e, f, g, h, i) {
        return makeValue(fields, proto, [a, b, c, d, e, f, g, h, i], arguments.length);
      };
    case 10:
      return function (a, b, c, d, e, f, g, h, i, j) {
        return makeValue(fields, proto, [a, b, c, d, e, f, g, h, i, j], arguments.length);
      };
    default:
      return Object.defineProperty(function () {
        return makeValue(fields, proto, arguments, arguments.length);
      }, 'length', { value: fields.length });
  }
};

module.exports = {
  taggedSum: taggedSum,
  tagged: tagged
};