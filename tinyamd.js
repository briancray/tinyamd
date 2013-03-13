(function (global) {
"use strict";

var obj = {};
var obj_tostring = obj.toString;
var doc = document;
var el_head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;
var module_scripts = el_head.getElementsByClassName('required-module');

var exports = {};
var module = {};

var define = function (id, dependencies, factory) {
    var id_path_split, id_path, id_name, ready, module_script, arg_count = arguments.length;

    if (typeof id === 'string' && exports[id].status === 2) {
        return;
    }
    else if (arg_count <= 2) {
        module_script = module_scripts[module_scripts.length - 1].src;
        module_script = module_script.slice(module_script.indexOf(amd.path) + amd.path.length, -amd.extension.length);
        if (arg_count === 1) {
            factory = id;
            id = module_script;
            dependencies = ['require', 'exports', 'module'];
        }
        else {
            if (obj_tostring.call(id) === '[object Array]') {
                factory = dependencies;
                dependencies = id;
                id = module_script;
            }
            else {
                factory = dependencies;
                dependencies = ['require', 'exports', 'module'];
            }
        }
    }

    ready = function () {
        var handlers = exports[id].handlers;
        var module = exports[id] = typeof factory === 'function' ? factory.apply(null, arguments) : factory;
        module.status = 2;
        handlers && handlers.forEach(function (handler) {
            handler && handler(module);
        });
    };
    id_path_split = id.lastIndexOf('/'),
    id_path = (id_path_split !== -1 ? id.slice(0, id_path_split) : '').split('/'),
    id_name = id.slice(id_path_split + 1);

    dependencies.forEach(function (dependency) {
        var absolute_path = '';
        if (dependency.indexOf('/') === -1) {
            absolute_path = dependency;
        }
        else if (dependency.indexOf('..') === 0) {
            absolute_path = id_path.slice(0, -1).join('/') + dependency.slice(2);
        }
        else if (dependency.indexOf('.') === 0) {
            absolute_path = id_path.join('/') + dependency.slice(1);
        }
    });

    require(dependencies, ready);
};

var amd = define.amd = {
    path: 'modules/',
    extension: '.js'
};

var require = function (module, callback) {
    var loaded, loaded_modules, script;

    if (obj_tostring.call(module) === '[object Array]') {
        loaded = 0;
        loaded_modules = [];
        module.filter(function (m) {
            return m && typeof m === 'string';
        }).forEach(function (m, i) {
            m && typeof m === 'string' && require(m, function (def) {
                loaded_modules[i] = def;
                ++loaded === module.length && callback.apply(null, loaded_modules);
            });
        });
        return;
    }
    else if (!module || typeof module !== 'string') {
        return;
    }
    else {
        module = module.toLowerCase();
        if (module === 'require' || module === 'exports' || module === 'module') {
            callback(global[module]);
            return;
        }
    }
     
    if (exports[module]) {
        switch (exports[module].status) {
            case 1:
                callback && exports[module].handlers.push(callback);
                break;
            case 2:
                callback && callback(exports[module]);
        }
    }
    else {
        exports[module] = {
            status: 1,
            handlers: [callback]
        };
    }

    script = doc.createElement('script');
    script.onload = script.onreadystatechange = function () {
        if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
            script.onload = script.onreadystatechange = null;
            el_head.removeChild(script);
        }
    };
    script.type = 'text/javascript';
    script.async = true;
    script.className = 'required-module';
    script.src = amd.path + module + amd.extension;
    el_head.appendChild(script);
};

global.define = define;
global.require = require;
global.exports = exports;
global.module = module;

})(this);
