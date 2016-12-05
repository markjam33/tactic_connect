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

$(document).ready(function() {

	function loadLoginScreen(p) {
		var loginScreenScript = $("#login_screen").html();
		var loginScreenTemplate = Handlebars.compile(loginScreenScript);
		$("div#results").html(loginScreenTemplate(null));

		if (p != {}) {
			$("input#server").val(p.server);
			$("input#project").val(p.project);
			$("input#login").val(p.login);
		}

		$("button#login-btn").click(function() {
			prefs = {
				server: $("input#server").val(),
				project: $("input#project").val(),
				login: $("input#login").val(),
				password: $("input#password").val(),
				ticket: ''
			};
			// Connect to server
			server = new TacticServerConnection(prefs.server, prefs.project, prefs.login, prefs.ticket, prefs.password);
			if (server.isConnected) {
				prefs.password = '';
				prefs.ticket = server.get_login_ticket();
				var p = new TacticPreferences().save(prefs);
				loadSplashScreen();
			}
		});
	}

	function loadSplashScreen() {
		var splashScreenScript = $("#splash_screen").html();
		var splashScreenTemplate = Handlebars.compile(splashScreenScript);
		$("div#results").html(splashScreenTemplate(null));

		$("button#simple-search-btn").click(function() {
			if (server.get_login_ticket != "") {
				var keywords = $("input#simplesearch").val();
				var assets = new TacticKeywordAssetSearch(server, keywords);
			}
		});

		$("input#simplesearch").keypress(function(event) {
			if (event.keyCode == 13) {
				$("button#simple-search-btn").click();
			}
		});
	}

	function loadPreferences(p) {
		if ((p.ticket != '') && (typeof(p.ticket) != 'undefined')) {
			server = new TacticServerConnection(p.server, p.project, p.login, p.ticket, '');
			// load splash screen
			if (server.isConnected) {
				loadSplashScreen();
			}
		} else {
			loadLoginScreen(p);
		}
	}

	var prefs = new TacticPreferences().load(); // Define this class in tacticIntegration.js
	loadPreferences(prefs);

	$(document).on("searchResultsLoadedEvent", function(event, obj) {
		var assetTemplateScript = $("#asset_template").html();
		var assetTemplate = Handlebars.compile(assetTemplateScript);
		$("div#results").html(assetTemplate(obj.assets));
		$(document).trigger("loadAssetInformation");
	});

	$(window).scroll(function() {
		$(document).trigger("loadAssetInformation");
	});

	$(window).resize(function() {
		$(document).trigger("loadAssetInformation");
	});

	function isShowing(img) {
		var viewport = {};
		viewport.top = $(window).scrollTop();
		viewport.bottom = viewport.top + $(window).height();
		var bounds = {};
		bounds.top = img.offset().top;
		bounds.bottom = bounds.top + img.outerHeight();
		return ((bounds.top <= viewport.bottom) && (bounds.bottom >= viewport.top));
	}

	function assetButtons(asset) {
		var buttons = "";
		if (asset.openTypes.PLACE) {
			buttons += '<button id="add-'+asset.code+'" class="add-button"></button>';
		}
		if (asset.openTypes.COMP) {
			buttons += '<button id="comp-'+asset.code+'" class="comp-button"></button>';
			buttons += '<button id="layer-'+asset.code+'" class="layer-button"></button>';
		}
		if (asset.openTypes.FOOTAGE) {
			buttons += '<button id="footage-'+asset.code+'" class="footage-button"></button>';
		}
		if (asset.openTypes.PROJECT) {
			buttons += '<button id="project-'+asset.code+'" class="project-button"></button>';
		}
		if (asset.openTypes.OPEN) {
			buttons += '<button id="open-'+asset.code+'" class="open-button"></button>';
		}
		return buttons;
	}

	function clickAddButton(button_class, file) {
		if (button_class === "add") {
			AdobeDOMBridge.importFile(file);
		} else if (button_class === "comp") {
			AdobeDOMBridge.importAEFile(file, "COMP");
		} else if (button_class === "layer") {
			AdobeDOMBridge.importAEFile(file, "LAYER");
		} else if (button_class === "footage") {
			AdobeDOMBridge.importAEFile(file, "FOOTAGE");
		} else if (button_class === "project") {
			AdobeDOMBridge.importAEFile(file, "PROJECT");
		} else if (button_class === "open") {
			AdobeDOMBridge.openFile(file);
		} else if (button_class === "template") {

		}
	}

	// Handler for loading images and info
	$(document).on("loadAssetInformation", function() {
		// Load images
		$("img.thumb").not("src").each(function() {
			if (isShowing($(this))) {
				// Load assets for showing
				if (! this.src) {
					var asset_id = this.id.replace("thumb_" ,'');
					var details = new AssetDetails(server, asset_id);

					// Insert thumbnail into HTMl
					$(this).attr("src", details.icon);
					$("input#path_"+asset_id).val(details.main);
					var buttons = assetButtons(details);
					$("div#asset_"+asset_id).children("div.buttons").html(buttons);

					$("div#asset_"+asset_id).children("div.buttons").children("button").each(function() {
						var ev = $._data(this, 'events');
						var button = this;
						if (!(ev && ev.click)) {
							$(button).click(function() {
								var bc = $(this).attr("class");
								var button_class = bc.replace("-button", '');
								clickAddButton(button_class, details.main);
							});
						}
					});
				}
			}
		});

	});

	// Menu handlers

	function toggleMenu() {
		if ($("div#main-menu").is(':visible')) {
			$("div#main-menu").animate(
				{ right: -100 },
				100,
				"swing",
				function() {
					$("div#main-menu").hide();
				}
			);
		} else {
			$("div#main-menu").show().animate({right: 0}, 100, "swing", function() {
				if ($("div#dialog").is(':visible')) {
					toggleDialog();
				}
			});
		}
	}

	function toggleDialog() {
		if ($("div#dialog").is(':visible')) {
			$("div#dialog").animate(
				{right: -300},
				200,
				"swing",
				function() {
					$("div#dialog").hide();
				}
			);
		} else {
			$("div#dialog").show().animate({right: 0}, 200, "swing", function() {
				$("input#asset-name").focus();

				$("input#asset-name").keypress(function(event) {
					if (event.keyCode == 13) {
						$("select#asset-type").focus();
					}
				});

				$("input#asset-deliverable").keypress(function(e) {
					var text = $(this).val();
					var re = /^order\d+/i;
					if (e.keyCode == 13) {
						if (re.test(text)) {
							// Find order deliverables
							var deliverables = {};
							if ((text != '') && (text != null) && (text != [])) {
								deliverables = new TacticDeliverables(server, text.toUpperCase());
							}
							if ((deliverables != {}) && (deliverables != null)) {
								$("div#deliverables").toggle(function() {
									var delScript = $("#deliverable_container").html();
									var delTemp = Handlebars.compile(delScript);
									$("div#deliverables").html(delTemp(deliverables));

									$(".deliverable").click(function() {
										$("input#asset-deliverable").val(this.id);
										$("div#deliverables").hide();
										$("input#asset-deliverable").focus();
									});
								});
							}
						} else {
							$("div#deliverables").hide();
							$("input#asset-keywords").focus();
						}
					}
				});

				$("input#asset-keywords").keypress(function(event) {
					if (event.keyCode == 13) {
						$("input#asset-description").focus();
					}
				});

				$("input#asset-description").keypress(function(event) {
					if (event.keyCode == 13) {
						$("input#asset-use-restrictions").focus();
					}
				});

				$("input#asset-use-restrictions").keypress(function(event) {
					if (event.keyCode == 13) {
						$("button#create-btn").focus();
					}
				});

			});
		}
	}

	$("span#menu-button").click(function() {
		// Toggle menu visibility
		toggleMenu();
	});

	$(document).on("formLoadedEvent", function(event, obj) {
		AdobeDOMBridge.getActiveFilename(function(res) {
			$("input#asset-name").val(res);
		}.bind(this));
	});

	$("li#checkin").click(function() {
		toggleMenu();
		var assetTypes = new TacticAssetTypes(server);
		var metadataFormScript = $("#metadata_form").html();
		var metadataFormTemplate = Handlebars.compile(metadataFormScript);
		$("div#dialog").html(metadataFormTemplate(assetTypes)).trigger("formLoadedEvent");
		toggleDialog();

		$("button#cancel-btn").click(function() {
			toggleDialog();
		});

		$("button#create-btn").click(function() {
			var data = {};
			data.login = prefs.login;
			data.name = $("#asset-name").val();
			data.asset_type_code = $("#asset-type").val();
			data.keywords = $("#asset-keywords").val();
			data.description = $("#asset-description").val();
			data.use_restrictions = $("#asset-use-restrictions").val();
			asset_deliverable = $("#asset-deliverable").val();
			var asset = new TacticAsset(server, data, asset_deliverable);
			toggleMenu();
		});
	});

	$("li#version").click(function() {
		var result = new TacticAssetVersion(server);
		toggleMenu();
	});

	$("li#logout").click(function() {
		prefs.ticket = '';
		var p = new TacticPreferences();
		p.save(prefs);
		toggleMenu();
		loadPreferences(prefs);
	});

});
