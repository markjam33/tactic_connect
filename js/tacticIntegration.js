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

function TacticPreferences() {
	// Get User folder path
	var PREF_PATH = window.__adobe_cep__.getSystemPath(SystemPath.USER_DATA);
	PREF_PATH = PREF_PATH.replace(/file:\/\//g, '');
	PREF_PATH = PREF_PATH.replace(/Application%20Support/g, "Preferences/tactprefs.json");

	this.load = function() {
		var prefs = {};
		var result = window.cep.fs.readFile(PREF_PATH);
		if (result.err === 0) {
			prefs = JSON.parse(result.data);
		}
		return prefs;
	}

	this.save = function(obj) {
		var data = JSON.stringify(obj);
		var result = window.cep.fs.writeFile(PREF_PATH, data);
		if (result.err === 0) {
			return true;
		} else {
			return false;
		}
	}
}

function TacticServerConnection (server, project, username, ticket, password) {
	var tacticServer = new TacticServerStub();
	tacticServer.isConnected = false;
	tacticServer.set_server(server);
	tacticServer.set_project(project);
	if ((ticket == '') || (typeof(ticket) === 'undefined')) {
		ticket = tacticServer.get_ticket(username, password);
	}
	tacticServer.login = username;
	tacticServer.set_ticket(ticket);
	if (tacticServer.get_login_ticket != "") {
		tacticServer.isConnected = true;
	}
	return tacticServer;
}

function TacticKeywordAssetSearch (server, searchterm) {
	// Build TACTIC expression -- Default is empty search, which returns assets modified within the last week.
	var asset_expr = "@SOBJECT(workflow/asset['modified_date','>',$7_DAY_AGO])";
	if ((searchterm != '') && (searchterm != null) && ((typeof searchterm) != "undefined")) {
		// Test if matches order number pattern
		var re = /^ORDER\d+$/;
		var asset_re = /^ASSET\d+$/;
		if (re.test(searchterm) == true) {
			asset_expr = "@SOBJECT(workflow/order['code','EQ','"+searchterm+"'].workflow/deliverable.workflow/asset_in_deliverable.workflow/asset)";
		} else if (asset_re.test(searchterm) == true) {
			asset_expr = "@SOBJECT(workflow/asset['code','EQ','"+searchterm+"'])";
		} else {
			var sp = /,\s+/;
			if (sp.test(searchterm) == true) {
				var term = searchterm.replace(sp, "|");
				asset_expr = "@SOBJECT(workflow/asset['name','EQI','"+term+"']['keywords','EQI','"+term+"'])";
			} else {
				asset_expr = "@SOBJECT(workflow/asset['begin']['keywords','EQI','"+searchterm+"']['name','EQI','"+searchterm+"']['or'])";
			}
		}
	}
	var assets = [];
	if (server.isConnected == true) {
		assets = server.eval(asset_expr);
		// Pull thumbs and filenames and combine with assets
		if (assets != []) {
			$(document).trigger("searchResultsLoadedEvent", {assets: assets});
		}
	} else {
		// No joy -- throw an error
	}
	return assets;
}

function AssetDetails (server, asset) {
	var snapshot_expr = "@SOBJECT(sthpw/snapshot['search_code','"+asset+"'])";
	var snapshots = server.eval(snapshot_expr);

	// Find the primary and icon snapshots, if they exist.
	var main_ss, icon_ss;
	for (var ss in snapshots) {
		if (snapshots[ss].is_current) {
			if (snapshots[ss].process == 'publish') {
				main_ss = snapshots[ss];
			} else if (snapshots[ss].process == 'icon') {
				icon_ss = snapshots[ss];
			}
		}
	}
	console.log([main_ss, icon_ss]);
	var details = new Object();
	details.code = asset;
	details.main = server.get_path_from_snapshot(main_ss.code);
	details.openTypes = AdobeHelpers.fileOpenTypes(details.main);
	details.code = asset;
	var icon_path;
	if (icon_path === undefined ) {
		icon_path = server.get_path_from_snapshot(main_ss.code, {file_type: 'icon', mode: 'web'});
	} else {
		icon_path = server.get_path_from_snapshot(icon_ss.code, {file_type: 'icon', mode: 'web'});
	}
	details.icon = "http://"+server.server_name+icon_path;
	console.log(details);
	return details;
}

// Checkin prototypes

function TacticAssetTypes (server) {
	var asset_type_expr = "@SOBJECT(workflow/asset_type['@ORDER_BY','name'])";

	var assetTypes = [];
	if (server.get_login_ticket != "") {
		assetTypes = server.eval(asset_type_expr);
	}
	return assetTypes;
}

function TacticDeliverables (server, searchterm) {
	// If empty search, show all open orders
	var re = /^ORDER\d+$/;
	var deliverables_expr = "@SOBJECT(workflow/order['begin']['name','EQI','"+searchterm+"']['keywords','EQI','"+searchterm+"']['description','EQI','"+searchterm+"']['or'].workflow/deliverable)";
	if (re.test(searchterm) == true) {
		deliverables_expr = "@SOBJECT(workflow/order['code','"+searchterm+"'].workflow/deliverable)";
	}
	var deliverables = [];
	if (server.isConnected == true) {
		deliverables = server.eval(deliverables_expr);
		console.log(deliverables);
		for (var deliverable in deliverables) {
			if (deliverables[deliverable].category_code != "") {
				var cexpr = "@SOBJECT(workflow/category['code','"+deliverables[deliverable].category_code+"'])";
				var category = server.eval(cexpr)[0];
				deliverables[deliverable].category = category.name;
			}
		}
	}
	return deliverables;
}

function TacticAsset(server, data, deliverable_code) {
	data.status = "Verified";
	// Strip asset_deliverable out of data
	var asset = server.insert("workflow/asset", data);
	var snapshot = server.create_snapshot(asset.__search_key__, "publish/"+data.name);
	var path = server.get_preallocated_path(snapshot.code, {file_type: "main", file_name: data.name});
	var opts = "";
	AdobeDOMBridge.saveActiveDocumentToPath(path, opts, function() {
		server.add_file(snapshot.code, path, {file_type: "main", mode: "preallocate"});
	}.bind(this));

	if ((deliverable_code != null) && (deliverable_code != "")) {
		// Verify deliverable exists
		var deliverable = server.eval("@SOBJECT(workflow/deliverable['code','"+deliverable_code+"'])");
		if (deliverable != []) {
			var ad_data = {
				asset_code: asset.code,
				deliverable_code: deliverable_code
			}
			server.insert("workflow/asset_in_deliverable", ad_data);
		}
	}

	return asset;
}

function TacticAssetVersion(server) {
	// Get and parse
	var result = false;
	AdobeDOMBridge.getActiveFilePath(function(res) {
		if (res != "") {
			// search path for ASSETXXXXX string
			var re = /\/(ASSET\d+)\//;
			var code = res.match(re);
			if ((code != []) && (code != null)) {
				code = code[1];
				if ((code != null) && (code != [])) {
					var assets = server.eval("@SOBJECT(workflow/asset['code','"+code+"'])");
					if (assets != []) {
						var asset = assets[0];
						var snapshot = server.create_snapshot(asset.__search_key__, "publish/"+asset.name);
						var path = server.get_preallocated_path(snapshot.code, {file_type: "main", file_name: asset.name});
						var opts = "";

						AdobeDOMBridge.saveActiveDocumentToPath(path, opts, function() {
							server.add_file(snapshot.code, path, {file_type: "main", mode: "preallocate"});
							result = true;
						}.bind(this));
					}
				}
			}
		}
	});
	return result;
}
