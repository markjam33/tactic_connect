# Tactic Connect
Connect plugin for Adobe CC and Southpaw TACTIC | Workflow integrations

<strong>TACTIC Connect</strong> is an Adobe Panel SDK plugin for the Adobe CC suite of tools that provides integration with Southpaw's TACTIC | Workflow asset and production management system. Currently, the plugin has been tested using Photoshop, Illustrator, and After Effects, though it should require very little to work to add support for other tools such as Premiere or InDesign. The Connect plugin allows you to interact with digital media assets hosted in a TACTIC | Workflow system, including checkin/checkout, search, place, and open functions.

Connect requires Adobe CC 2014 or 2015 and a correctly configured TACTIC | Workflow system, and it uses several third party libraries, including the TACTIC Client API, the Adobe Panel SDK, jQuery, and handlebars.js. For more information on these libraries, including licensing and API documentation, please see their respective sites:

<a href="http://southpawtech.com">Southpaw Technology</a>

<a href="http://www.adobe.com/devnet.html">Adobe Developer Connection</a>

<a href="https://jquery.com">jQuery</a>

<a href="http://handlebarsjs.com">Handlebars.js</a>

To use the plugin, you will need to hard-code the "src" attribute in lines 24-27 of index.html to point to your own TACTIC server's respective Javascript libraries. The four libraries you will need are spt_init.js, client_api.js, environment.js, and xmlrpc.js. In a standard configuration, these generally are available at the context/spt_js/ root of your server, but check with your TACTIC administrator or Southpaw Technologies for further information. Plans are in place to move this to a configuration in the future, but for now, they must be hard-coded. Also, the plugin is currently very opinionated; if your TACTIC | Workflow installation has been customized, you may need to make some additional changes to the code. In particular, there are a number of assumptions made in the tacticintegration.js file which may not match your server's needs.

<strong>To use the plugin</strong>, you will need to download it and compile with Adobe's ZXPCmd utility. I have plans in the works to make a compiled, ready-to-use version available on Adobe Exchange, but for now, to use it on Adobe CC 2015 and newer, you will need to either run Adobe Panel SDK in development mode (see Adobe's site for details) or use the open source ZXPInstaller application available <a href="http://zxpinstaller.com">here</a>.

All original project code is licensed under the MIT license. Please review file headers for more details.

