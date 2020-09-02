// .remove()
// https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/remove()/remove().md
(function(a){a.forEach(function(c){if(c.hasOwnProperty("remove")){return}Object.defineProperty(c,"remove",{configurable:true,enumerable:true,writable:true,value:function b(){if(this.parentNode!==null){this.parentNode.removeChild(this)}}})})})([Element.prototype,CharacterData.prototype,DocumentType.prototype]);

// Object.assign
// https://gist.github.com/spiralx/68cf40d7010d829340cb#file-object-assign-js
if (!Object.assign) { Object.defineProperty(Object, "assign", { enumerable: false, configurable: true, writable: true, value: function (g) { if (g === undefined || g === null) { throw new TypeError("Cannot convert first argument to object") } var j = Object(g); for (var a = 1; a < arguments.length; a++) { var d = arguments[a]; if (d === undefined || d === null) { continue } d = Object(d); var b = Object.keys(Object(d)); for (var c = 0, f = b.length; c < f; c++) { var h = b[c]; var e = Object.getOwnPropertyDescriptor(d, h); if (e !== undefined && e.enumerable) { j[h] = d[h] } } } return j } }) };

// Array.from
// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/from
if(!Array.from){Array.from=(function(){var d=Object.prototype.toString;var e=function(g){return typeof g==="function"||d.call(g)==="[object Function]"};var c=function(h){var g=Number(h);if(isNaN(g)){return 0}if(g===0||!isFinite(g)){return g}return(g>0?1:-1)*Math.floor(Math.abs(g))};var b=Math.pow(2,53)-1;var a=function(h){var g=c(h);return Math.min(Math.max(g,0),b)};return function f(p){var g=this;var o=Object(p);if(p==null){throw new TypeError("Array.from requires an array-like object - not null or undefined")}var m=arguments.length>1?arguments[1]:void undefined;var i;if(typeof m!=="undefined"){if(!e(m)){throw new TypeError("Array.from: when provided, the second argument must be a function")}if(arguments.length>2){i=arguments[2]}}var n=a(o.length);var h=e(g)?Object(new g(n)):new Array(n);var j=0;var l;while(j<n){l=o[j];if(m){h[j]=typeof i==="undefined"?m(l,j):m.call(i,l,j)}else{h[j]=l}j+=1}h.length=n;return h}}())};

// Array.prototype.find
// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) { Object.defineProperty(Array.prototype, "find", { value: function (b) { if (this == null) { throw TypeError('"this" is null or not defined') } var f = Object(this); var a = f.length >>> 0; if (typeof b !== "function") { throw TypeError("predicate must be a function") } var c = arguments[1]; var d = 0; while (d < a) { var e = f[d]; if (b.call(c, e, d, f)) { return e } d++ } return undefined }, configurable: true, writable: true }) };

// import "es6-promise/auto"

// import cssVars from "css-vars-ponyfill"
// cssVars()

// require("formdata-polyfill")
import 'formdata-polyfill'
