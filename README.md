#tinyamd

Teeny tiny AMD implementation. About 1.2k minifed and gzipped.

###Why use tinyamd?

Because you like things that come in small packages.

###What does it support?

* Named modules
* Anonymous modules
* `baseUrl` config
* `data-main="module"` attribute for autoloading
* Browsers: Chrome, Firefox, Safari, Opera, IE8+

###define()

* `define(name, [dependencies], object or function)`
* `define(name, object or function)`
* `define([dependencies], object or function)`
* `define(object or function)`

###require()
* `require([modules], callback)`
* `require(module, callback)`

###tinyamd.inject()
* `inject(javascript file, callback)`

###tinyamd.config()
* `tinyamd.config({baseUrl: relative path})`


###Does it work?
Heck yea. Try messing out with the files in `/tests/`

###Why use a different AMD framework?

Because you need to more than basic AMD support or you&rsquo; running AMD outside of the browser.
