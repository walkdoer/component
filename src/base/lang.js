/**
 * 辅助类
 */
define(function(require, exports, module) {
    var _ = {},
        class2type = {},
        toString = class2type.toString,
        slice = Array.prototype.slice,
        nativeKeys = Object.keys,
        isArray = Array.isArray ||
            function(object) {
                return object instanceof Array;
        };

    function type(obj) {
        return obj == null ? String(obj) :
            class2type[toString.call(obj)] || "object";
    }

    function isFunction(value) {
        return type(value) == "function";
    }

    function isWindow(obj) {
        return obj != null && obj == obj.window;
    }

    function isObject(obj) {
        return type(obj) == "object";
    }

    function isPlainObject(obj) {
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
    }

    function extend(target, source, deep) {
        for (var key in source) {
            if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
                    target[key] = {};
                }
                if (isArray(source[key]) && !isArray(target[key])) {
                    target[key] = [];
                }
                extend(target[key], source[key], deep);
            } else if (source[key] !== undefined) {
                target[key] = source[key];
            }
        }
    }

    _.isEmpty = function(obj) {
        if (obj == null) {
            return true;
        }
        if (isArray(obj) || _.isString(obj)) {
            return obj.length === 0;
        }
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    };
    _.keys = function(obj) {
        if (!isObject(obj)) {
            return [];
        }
        if (nativeKeys) {
            return nativeKeys(obj);
        }
        var keys = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    };

    _.extend = function(target) {
        var deep, args = slice.call(arguments, 1);
        if (typeof target == 'boolean') {
            deep = target;
            target = args.shift();
        }
        args.forEach(function(arg) {
            extend(target, arg, deep);
        });
        return target;
    };

    _.isString = function(obj) {
        return toString.call(obj) == '[object String]';
    };
    _.isFunction = isFunction;
    return _;
});
