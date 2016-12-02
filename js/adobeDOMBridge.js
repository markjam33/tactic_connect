/* Copyright (c) 2015 Mark J. Myers

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var AdobeDOMBridge = (function(exports) {
	var CS_INTERFACE = new CSInterface();

	function callExtendScript(method) {
		var args = [].splice.call(arguments,1);
		var callback = undefined;

		var params = [];
		for (var idx in args) {
			var arg = args[idx];
			if (typeof(arg) == 'function') {
				callback = arg;
			} else {
				params.push( JSON.stringify(arg) );
			}
		}
		var functionArgs = params.length ? '(' + params.join(',')+')' : '()';
		var script = method + functionArgs;
		console.log(script);

		CS_INTERFACE.evalScript(script, callback);
	}

	exports.openFile = function(path, callback) {
		callExtendScript('$.ADOBE.openFile', path, callback);
	}

	exports.importFile = function(path, callback) {
		// check application to use appropriate importer
		callExtendScript('$.ADOBE.importFile', path, callback);
	}

	exports.importAEFile = function(path, type, callback) {
		console.log(type);
		callExtendScript('$.ADOBE.importAEFile', path, type, callback);
	}

	exports.applicationTestFileOpen = function(path, callback) {
		var openTypes = callExtendScript('$.ADOBE.testFileOpen', path, callback);
		return openTypes;
	}

	// Checkin functions

	exports.saveActiveDocumentToPath = function(path, opts, callback) {
		console.log(path);
		callExtendScript('$.ADOBE.saveActiveDocumentToPath', path, callback);
	}

	exports.getActiveFilename = function(callback) {
		var filename = callExtendScript('$.ADOBE.getActiveFilename', callback);
		return filename;
	}

	exports.getActiveFilePath = function(callback) {
		var fileuri = callExtendScript('$.ADOBE.getActiveFilePath', callback);
		return fileuri;
	}


	return exports;
})(AdobeDOMBridge || {});
