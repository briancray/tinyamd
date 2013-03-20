#tinyamd

Teeny tiny AMD loader. About 1.2k minifed and gzipped.

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
* `tinyamd.config({baseUrl: absolute path})`


###Does it work?
Heck yea. Try messing out with the files in `/tests/`

###Why use a different AMD framework?

Because you need [full config support](https://github.com/amdjs/amdjs-api/wiki/Common-Config)
