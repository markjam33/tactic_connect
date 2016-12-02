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

if(typeof($)=='undefined') {
	$={};
}

var arrayContainsItem = function(array, str) {
	for (var a in array) {
		if (str == array[a]) {
			return true;
		}
	}
	return false;
}

$.ADOBE = (function(exports) {

	exports.openFile = function(path) {
		// Open project file
		var file = new File(path);
		app.open(file);
	}

	exports.importAEFile = function(path, type) {
		return false;
	}

	if (app.name == "Adobe Illustrator") {

		exports.importFile = function(path) {
			if (app.documents.length > 0) {
				var file = new File(path);
				var newItem = app.activeDocument.placedItems.add();
				newItem.file = file;
				return true;
			} else {
				return false;
			}
		}

		exports.saveActiveDocumentToPath = function(p, options) {
			if (app.documents.length > 0) {
				var file = new File(p);
				var opt = new IllustratorSaveOptions();
				opt.compatibility = Compatibility.ILLUSTRATOR17;
				var doc = app.activeDocument;
				doc.saveAs(file, opt);
			}
		}

		exports.getActiveFilename = function() {
			var filename = "";
			if ((app.activeDocument.name != null) && (app.activeDocument.name != undefined)) {
				filename = app.activeDocument.name;
			}
			return filename;
		}

		exports.getActiveFilePath = function() {
			var fileuri = "";
			if (app.activeDocument.fullName != null) {
				fileuri = app.activeDocument.fullName;
			}
			return fileuri;
		}

	} else if (app.name == "Adobe Photoshop") {

		exports.importFile = function(path) {
			return exports.openFile(path);
		}

		exports.saveActiveDocumentToPath = function(p, options) {
			if (app.documents.length > 0) {
				var file = new File(p);
				var opts = new PhotoshopSaveOptions();
				opts.alphaChannels = true;
				opts.layers = true;
				var doc = app.activeDocument;
				doc.saveAs(file);
			}
		}

		exports.getActiveFilename = function() {
			var filename = "";
			if (app.documents.length > 0) {
				filename = app.activeDocument.name;
			}
			return filename;
		}

		exports.getActiveFilePath = function() {
			var fileuri = "";
			if (app.documents.length > 0) {
				fileuri = app.activeDocument.fullName;
			}
			return fileuri;
		}

	} else {
		var importTypes = {
			"COMP":ImportAsType.COMP,
			"LAYER":ImportAsType.COMP_CROPPED_LAYERS,
			"FOOTAGE":ImportAsType.FOOTAGE,
			"PROJECT": ImportAsType.PROJECT};

		exports.importAEFile = function(path, type) {
			var fileImport = new ImportOptions();
			fileImport.file = new File(path);
			// Test if file can be imported as desired type
			if (fileImport.canImportAs(importTypes[type])) {
				fileImport.importAs = importTypes[type];
			} else {
				if (fileImport.canImportAs(ImportAsType.FOOTAGE)) {
					fileImport.importAs = ImportAsType.FOOTAGE;
				} else {
					alert('File "'+path+'" cannot be imported');
				}
			}
			app.project.importFile(fileImport);
		}

		exports.saveActiveDocumentToPath = function(path) {
			var file = new File(path);
			app.project.save(file);
		}

		exports.getActiveFilename = function() {
			var filename = "";
			if (app.project.file != null) {
				filename = app.project.file.name;
			}
			return filename;
		}

		exports.getActiveFilePath = function() {
			var fileuri = "";
			if (app.project.file != null) {
				fileuri = app.project.file.fullName;
			}
			return fileuri;
		}
	}

	return exports;
})($.ADOBE || {});
