# PhishDetect Extension

This is a browser extension that complements the PhishDetect service.
The extension creates context menus on links and pages that allow to either send
a URL or directly the HTML content of the opened page to a PhishDetect backend
in order to be scanned for phishing.

Additionally, through the use of gmail.js, it modifies links contained emails'
bodies in order to display a dialog prompt that offers the user the possibility
of scanning the links with PhishDetect.


## Build

First install node.js and npm:

    $ sudo apt-get install nodejs npm

Then we can run the build command, which will pull dependencies and compile a
single JavaScript file:

    $ make build

Finally, we can create the package that we can use for distribution:

    $ make package


## Technologies used:

- JQuery
- Gmail.js
- Vex.js
- Vex Dialog
- Tailwind CSS
