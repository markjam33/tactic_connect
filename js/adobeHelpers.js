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

// This file contains a few helpers to test Adobe context parameters
var AdobeHelpers = (function(exports) {
	var CS_INTERFACE = new CSInterface();

	var id = CS_INTERFACE.getApplicationID();
	exports.appID = id;

	var extre = /\.([\w|\d]+)$/;

	var PS_OPEN_EXTENSIONS = [
		"PSD", "PDD", "PSB",
		"AI",
		"DCS",
		"EPS", "EPSF", "PS",
		"RAW", "CRW", "NEF", "RAF", "ORF", "MRW", "DCR", "MOS", "PEF", "SRF", "X3F", "CR2", "ERF",
		"DNG",
		"BMP",
		"CIN",
		"DCM",
		"GIF",
		"IFF",
		"JPG", "JPEG", "JPE", "JIF", "JFIF", "JFI",
		"PSB",
		"EXR",
		"PDF",
		"PIC", "PICT",
		"PXR",
		"PNG",
		"PBM",
		"HDR",
		"TIF", "TIFF",
		"WBMP"
	];

	var IL_OPEN_EXTENSIONS = [
		"AI", "AIT", "IDEA", "DRAW", "LINE",
		"PDF",
		"SKET",
		"DWG",
		"DXF",
		"BMP",
		"CGM",
		"CDR",
		"EPS", "EPSF", "PS",
		"EMF",
		"GIF",
		"JPG", "JPE", "JPEG",
		"JPF", "JPX", "JP2", "J2K", "J2C", "JPC",
		"PIC", "PICT",
		"RTF",
		"DOC", "DOCX",
		"PCX",
		"PNG", "PNS",
		"PSD", "PDD",
		"PXR",
		"SVG", "SVGZ",
		"TIF", "TIFF",
		"TGA", "VDA", "ICB", "VST",
		"TXT",
		"WMF"
	];

	var IL_PLACE_EXTENSIONS = IL_OPEN_EXTENSIONS;

	var AE_OPEN_EXTENSIONS = ["AEP","AET"];

	var AE_PROJECT_EXTENSIONS = [
		"AEP", "AET",
		"AAF",
		"AEPX",
		"PPJ",
		"PPROJ"
	];

	var AE_COMP_EXTENSIONS = [
		"PSD",
		"C4D",
		"AI"
	];

	var AE_FOOTAGE_EXTENSIONS = [
		"AAC", "M4A",
		"ASND",
		"AIF", "AIFF",
		"MP3", "MPEG", "MPG", "MPA", "MPE", "MPV", "MOD", "M2P", "M2V", "M2P", "M2A", "M2T",
		"WAV",
		"AI", "EPS", "PS",
		"PDF",
		"PSD",
		"BMP", "RLE", "DIB",
		"TIF", "TIFF","CRW", "NEF", "RAF", "ORF", "MRW", "DCR", "MOS", "RAW", "PEF", "SRF", "DNG", "X3F", "CR2", "ERF",
		"CIN", "DPX",
		"GIF",
		"RLA", "RPF",
		"IMG", "EI",
		"IFF", "TDI",
		"JPG", "JPE", "JPEG",
		"MA",
		"EXR",
		"PCX",
		"PCT",
		"PXR",
		"PNG",
		"HDR", "RGBE", "XYZE",
		"SGI", "BW", "RGB",
		"PIC",
		"TGA", "VDA", "ICB", "VST",
		"3GP", "3G2", "AMC",
		"SWF",
		"XFL",
		"F4V",
		"M2TS",
		"DV",
		"FLM",
		"M4V", "MP4",
		"MXF",
		"OMF",
		"MOV",
		"AVI",
		"WMV", "WMA"
	];

	var AE_TEMPLATE_EXTENSIONS = [
		"AET"
	];

	exports.fileOpenTypes = function(path) {
		var types = {};
		if (extre.test(path) == true) {
			var extension = extre.exec(path)[1].toUpperCase();
			if (exports.appID == "AEFT") {
				if (AE_OPEN_EXTENSIONS.indexOf(extension) != -1) {
					types.OPEN = true;
				}
				if (AE_PROJECT_EXTENSIONS.indexOf(extension) != -1) {
					types.PROJECT = true;
				}
				if (AE_COMP_EXTENSIONS.indexOf(extension) != -1) {
					types.COMP = true;
				}
				if (AE_FOOTAGE_EXTENSIONS.indexOf(extension) != -1) {
					types.FOOTAGE = true;
				}
				if (AE_TEMPLATE_EXTENSIONS.indexOf(extension) != -1) {
					types.TEMPLATE = true;
				}
			} else if (exports.appID == "ILST") {
				if (IL_OPEN_EXTENSIONS.indexOf(extension) != -1) {
					types.OPEN = true;
				}
				if (IL_PLACE_EXTENSIONS.indexOf(extension) != -1) {
					types.PLACE = true;
				}
			} else if (exports.appID == "PHXS") {
				if (PS_OPEN_EXTENSIONS.indexOf(extension) != -1) {
					types.OPEN = true;
				}
			}
		}
		return types;
	}

	return exports;
})(AdobeHelpers || {});
