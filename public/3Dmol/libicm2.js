var Module = typeof Module !== "undefined" ? Module : {};
var moduleOverrides = {};
var key;
for (key in Module) {
    if (Module.hasOwnProperty(key)) {
        moduleOverrides[key] = Module[key]
    }
}
Module["arguments"] = [];
Module["thisProgram"] = "./this.program";
Module["quit"] = function (status, toThrow) {
    throw toThrow
};
Module["preRun"] = [];
Module["postRun"] = [];
var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
ENVIRONMENT_IS_WEB = typeof window === "object";
ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
ENVIRONMENT_IS_NODE = typeof process === "object" && typeof require === "function" && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (Module["ENVIRONMENT"]) {
    throw new Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -s ENVIRONMENT=web or -s ENVIRONMENT=node)")
}
var scriptDirectory = "";

function locateFile(path) {
    if (Module["locateFile"]) {
        return Module["locateFile"](path, scriptDirectory)
    } else {
        return scriptDirectory + path
    }
}

if (ENVIRONMENT_IS_NODE) {
    scriptDirectory = __dirname + "/";
    var nodeFS;
    var nodePath;
    Module["read"] = function shell_read(filename, binary) {
        var ret;
        if (!nodeFS) nodeFS = require("fs");
        if (!nodePath) nodePath = require("path");
        filename = nodePath["normalize"](filename);
        ret = nodeFS["readFileSync"](filename);
        return binary ? ret : ret.toString()
    };
    Module["readBinary"] = function readBinary(filename) {
        var ret = Module["read"](filename, true);
        if (!ret.buffer) {
            ret = new Uint8Array(ret)
        }
        assert(ret.buffer);
        return ret
    };
    if (process["argv"].length > 1) {
        Module["thisProgram"] = process["argv"][1].replace(/\\/g, "/")
    }
    Module["arguments"] = process["argv"].slice(2);
    if (typeof module !== "undefined") {
        module["exports"] = Module
    }
    process["on"]("uncaughtException", function (ex) {
        if (!(ex instanceof ExitStatus)) {
            throw ex
        }
    });
    process["on"]("unhandledRejection", abort);
    Module["quit"] = function (status) {
        process["exit"](status)
    };
    Module["inspect"] = function () {
        return "[Emscripten Module object]"
    }
} else if (ENVIRONMENT_IS_SHELL) {
    if (typeof read != "undefined") {
        Module["read"] = function shell_read(f) {
            return read(f)
        }
    }
    Module["readBinary"] = function readBinary(f) {
        var data;
        if (typeof readbuffer === "function") {
            return new Uint8Array(readbuffer(f))
        }
        data = read(f, "binary");
        assert(typeof data === "object");
        return data
    };
    if (typeof scriptArgs != "undefined") {
        Module["arguments"] = scriptArgs
    } else if (typeof arguments != "undefined") {
        Module["arguments"] = arguments
    }
    if (typeof quit === "function") {
        Module["quit"] = function (status) {
            quit(status)
        }
    }
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href
    } else if (document.currentScript) {
        scriptDirectory = document.currentScript.src
    }
    if (scriptDirectory.indexOf("blob:") !== 0) {
        scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf("/") + 1)
    } else {
        scriptDirectory = ""
    }
    Module["read"] = function shell_read(url) {
        var xhr = new XMLHttpRequest;
        xhr.open("GET", url, false);
        xhr.send(null);
        return xhr.responseText
    };
    if (ENVIRONMENT_IS_WORKER) {
        Module["readBinary"] = function readBinary(url) {
            var xhr = new XMLHttpRequest;
            xhr.open("GET", url, false);
            xhr.responseType = "arraybuffer";
            xhr.send(null);
            return new Uint8Array(xhr.response)
        }
    }
    Module["readAsync"] = function readAsync(url, onload, onerror) {
        var xhr = new XMLHttpRequest;
        xhr.open("GET", url, true);
        xhr.responseType = "arraybuffer";
        xhr.onload = function xhr_onload() {
            if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                onload(xhr.response);
                return
            }
            onerror()
        };
        xhr.onerror = onerror;
        xhr.send(null)
    };
    Module["setWindowTitle"] = function (title) {
        document.title = title
    }
} else {
    throw new Error("environment detection error")
}
var out = Module["print"] || (typeof console !== "undefined" ? console.log.bind(console) : typeof print !== "undefined" ? print : null);
var err = Module["printErr"] || (typeof printErr !== "undefined" ? printErr : typeof console !== "undefined" && console.warn.bind(console) || out);
for (key in moduleOverrides) {
    if (moduleOverrides.hasOwnProperty(key)) {
        Module[key] = moduleOverrides[key]
    }
}
moduleOverrides = undefined;
assert(typeof Module["memoryInitializerPrefixURL"] === "undefined", "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");
assert(typeof Module["pthreadMainPrefixURL"] === "undefined", "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");
assert(typeof Module["cdInitializerPrefixURL"] === "undefined", "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");
assert(typeof Module["filePackagePrefixURL"] === "undefined", "Module.filePackagePrefixURL option was removed, use Module.locateFile instead");
var STACK_ALIGN = 16;
stackSave = stackRestore = stackAlloc = function () {
    abort("cannot use the stack before compiled code is ready to run, and has provided stack access")
};

function dynamicAlloc(size) {
    assert(DYNAMICTOP_PTR);
    var ret = HEAP32[DYNAMICTOP_PTR >> 2];
    var end = ret + size + 15 & -16;
    if (end <= _emscripten_get_heap_size()) {
        HEAP32[DYNAMICTOP_PTR >> 2] = end
    } else {
        var success = _emscripten_resize_heap(end);
        if (!success) return 0
    }
    return ret
}

function getNativeTypeSize(type) {
    switch (type) {
        case"i1":
        case"i8":
            return 1;
        case"i16":
            return 2;
        case"i32":
            return 4;
        case"i64":
            return 8;
        case"float":
            return 4;
        case"double":
            return 8;
        default: {
            if (type[type.length - 1] === "*") {
                return 4
            } else if (type[0] === "i") {
                var bits = parseInt(type.substr(1));
                assert(bits % 8 === 0, "getNativeTypeSize invalid bits " + bits + ", type " + type);
                return bits / 8
            } else {
                return 0
            }
        }
    }
}

function warnOnce(text) {
    if (!warnOnce.shown) warnOnce.shown = {};
    if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        err(text)
    }
}

var asm2wasmImports = {
    "f64-rem": function (x, y) {
        return x % y
    }, "debugger": function () {
        debugger
    }
};
var jsCallStartIndex = 1;
var functionPointers = new Array(0);
var funcWrappers = {};

function getFuncWrapper(func, sig) {
    if (!func) return;
    assert(sig);
    if (!funcWrappers[sig]) {
        funcWrappers[sig] = {}
    }
    var sigCache = funcWrappers[sig];
    if (!sigCache[func]) {
        if (sig.length === 1) {
            sigCache[func] = function dynCall_wrapper() {
                return dynCall(sig, func)
            }
        } else if (sig.length === 2) {
            sigCache[func] = function dynCall_wrapper(arg) {
                return dynCall(sig, func, [arg])
            }
        } else {
            sigCache[func] = function dynCall_wrapper() {
                return dynCall(sig, func, Array.prototype.slice.call(arguments))
            }
        }
    }
    return sigCache[func]
}

function makeBigInt(low, high, unsigned) {
    return unsigned ? +(low >>> 0) + +(high >>> 0) * 4294967296 : +(low >>> 0) + +(high | 0) * 4294967296
}

function dynCall(sig, ptr, args) {
    if (args && args.length) {
        assert(args.length == sig.length - 1);
        assert("dynCall_" + sig in Module, "bad function pointer type - no table for sig '" + sig + "'");
        return Module["dynCall_" + sig].apply(null, [ptr].concat(args))
    } else {
        assert(sig.length == 1);
        assert("dynCall_" + sig in Module, "bad function pointer type - no table for sig '" + sig + "'");
        return Module["dynCall_" + sig].call(null, ptr)
    }
}

var tempRet0 = 0;
var setTempRet0 = function (value) {
    tempRet0 = value
};
var getTempRet0 = function () {
    return tempRet0
};
if (typeof WebAssembly !== "object") {
    abort("No WebAssembly support found. Build with -s WASM=0 to target JavaScript instead.")
}
var wasmMemory;
var wasmTable;
var ABORT = false;
var EXITSTATUS = 0;

function assert(condition, text) {
    if (!condition) {
        abort("Assertion failed: " + text)
    }
}

function getCFunc(ident) {
    var func = Module["_" + ident];
    assert(func, "Cannot call unknown function " + ident + ", make sure it is exported");
    return func
}

function ccall(ident, returnType, argTypes, args, opts) {
    var toC = {
        "string": function (str) {
            var ret = 0;
            if (str !== null && str !== undefined && str !== 0) {
                var len = (str.length << 2) + 1;
                ret = stackAlloc(len);
                stringToUTF8(str, ret, len)
            }
            return ret
        }, "array": function (arr) {
            var ret = stackAlloc(arr.length);
            writeArrayToMemory(arr, ret);
            return ret
        }
    };

    function convertReturnValue(ret) {
        if (returnType === "string") return UTF8ToString(ret);
        if (returnType === "boolean") return Boolean(ret);
        return ret
    }

    var func = getCFunc(ident);
    var cArgs = [];
    var stack = 0;
    assert(returnType !== "array", 'Return type should not be "array".');
    if (args) {
        for (var i = 0; i < args.length; i++) {
            var converter = toC[argTypes[i]];
            if (converter) {
                if (stack === 0) stack = stackSave();
                cArgs[i] = converter(args[i])
            } else {
                cArgs[i] = args[i]
            }
        }
    }
    var ret = func.apply(null, cArgs);
    ret = convertReturnValue(ret);
    if (stack !== 0) stackRestore(stack);
    return ret
}

function setValue(ptr, value, type, noSafe) {
    type = type || "i8";
    if (type.charAt(type.length - 1) === "*") type = "i32";
    switch (type) {
        case"i1":
            HEAP8[ptr >> 0] = value;
            break;
        case"i8":
            HEAP8[ptr >> 0] = value;
            break;
        case"i16":
            HEAP16[ptr >> 1] = value;
            break;
        case"i32":
            HEAP32[ptr >> 2] = value;
            break;
        case"i64":
            tempI64 = [value >>> 0, (tempDouble = value, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[ptr >> 2] = tempI64[0], HEAP32[ptr + 4 >> 2] = tempI64[1];
            break;
        case"float":
            HEAPF32[ptr >> 2] = value;
            break;
        case"double":
            HEAPF64[ptr >> 3] = value;
            break;
        default:
            abort("invalid type for setValue: " + type)
    }
}

var ALLOC_NORMAL = 0;
var ALLOC_NONE = 3;

function allocate(slab, types, allocator, ptr) {
    var zeroinit, size;
    if (typeof slab === "number") {
        zeroinit = true;
        size = slab
    } else {
        zeroinit = false;
        size = slab.length
    }
    var singleType = typeof types === "string" ? types : null;
    var ret;
    if (allocator == ALLOC_NONE) {
        ret = ptr
    } else {
        ret = [_malloc, stackAlloc, dynamicAlloc][allocator](Math.max(size, singleType ? 1 : types.length))
    }
    if (zeroinit) {
        var stop;
        ptr = ret;
        assert((ret & 3) == 0);
        stop = ret + (size & ~3);
        for (; ptr < stop; ptr += 4) {
            HEAP32[ptr >> 2] = 0
        }
        stop = ret + size;
        while (ptr < stop) {
            HEAP8[ptr++ >> 0] = 0
        }
        return ret
    }
    if (singleType === "i8") {
        if (slab.subarray || slab.slice) {
            HEAPU8.set(slab, ret)
        } else {
            HEAPU8.set(new Uint8Array(slab), ret)
        }
        return ret
    }
    var i = 0, type, typeSize, previousType;
    while (i < size) {
        var curr = slab[i];
        type = singleType || types[i];
        if (type === 0) {
            i++;
            continue
        }
        assert(type, "Must know what type to store in allocate!");
        if (type == "i64") type = "i32";
        setValue(ret + i, curr, type);
        if (previousType !== type) {
            typeSize = getNativeTypeSize(type);
            previousType = type
        }
        i += typeSize
    }
    return ret
}

function getMemory(size) {
    if (!runtimeInitialized) return dynamicAlloc(size);
    return _malloc(size)
}

var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;

function UTF8ArrayToString(u8Array, idx, maxBytesToRead) {
    var endIdx = idx + maxBytesToRead;
    var endPtr = idx;
    while (u8Array[endPtr] && !(endPtr >= endIdx)) ++endPtr;
    if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
        return UTF8Decoder.decode(u8Array.subarray(idx, endPtr))
    } else {
        var str = "";
        while (idx < endPtr) {
            var u0 = u8Array[idx++];
            if (!(u0 & 128)) {
                str += String.fromCharCode(u0);
                continue
            }
            var u1 = u8Array[idx++] & 63;
            if ((u0 & 224) == 192) {
                str += String.fromCharCode((u0 & 31) << 6 | u1);
                continue
            }
            var u2 = u8Array[idx++] & 63;
            if ((u0 & 240) == 224) {
                u0 = (u0 & 15) << 12 | u1 << 6 | u2
            } else {
                if ((u0 & 248) != 240) warnOnce("Invalid UTF-8 leading byte 0x" + u0.toString(16) + " encountered when deserializing a UTF-8 string on the asm.js/wasm heap to a JS string!");
                u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | u8Array[idx++] & 63
            }
            if (u0 < 65536) {
                str += String.fromCharCode(u0)
            } else {
                var ch = u0 - 65536;
                str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
            }
        }
    }
    return str
}

function UTF8ToString(ptr, maxBytesToRead) {
    return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : ""
}

function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
    if (!(maxBytesToWrite > 0)) return 0;
    var startIdx = outIdx;
    var endIdx = outIdx + maxBytesToWrite - 1;
    for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) {
            var u1 = str.charCodeAt(++i);
            u = 65536 + ((u & 1023) << 10) | u1 & 1023
        }
        if (u <= 127) {
            if (outIdx >= endIdx) break;
            outU8Array[outIdx++] = u
        } else if (u <= 2047) {
            if (outIdx + 1 >= endIdx) break;
            outU8Array[outIdx++] = 192 | u >> 6;
            outU8Array[outIdx++] = 128 | u & 63
        } else if (u <= 65535) {
            if (outIdx + 2 >= endIdx) break;
            outU8Array[outIdx++] = 224 | u >> 12;
            outU8Array[outIdx++] = 128 | u >> 6 & 63;
            outU8Array[outIdx++] = 128 | u & 63
        } else {
            if (outIdx + 3 >= endIdx) break;
            if (u >= 2097152) warnOnce("Invalid Unicode code point 0x" + u.toString(16) + " encountered when serializing a JS string to an UTF-8 string on the asm.js/wasm heap! (Valid unicode code points should be in range 0-0x1FFFFF).");
            outU8Array[outIdx++] = 240 | u >> 18;
            outU8Array[outIdx++] = 128 | u >> 12 & 63;
            outU8Array[outIdx++] = 128 | u >> 6 & 63;
            outU8Array[outIdx++] = 128 | u & 63
        }
    }
    outU8Array[outIdx] = 0;
    return outIdx - startIdx
}

function stringToUTF8(str, outPtr, maxBytesToWrite) {
    assert(typeof maxBytesToWrite == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
    return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite)
}

function lengthBytesUTF8(str) {
    var len = 0;
    for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
        if (u <= 127) ++len; else if (u <= 2047) len += 2; else if (u <= 65535) len += 3; else len += 4
    }
    return len
}

var UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : undefined;

function allocateUTF8(str) {
    var size = lengthBytesUTF8(str) + 1;
    var ret = _malloc(size);
    if (ret) stringToUTF8Array(str, HEAP8, ret, size);
    return ret
}

function allocateUTF8OnStack(str) {
    var size = lengthBytesUTF8(str) + 1;
    var ret = stackAlloc(size);
    stringToUTF8Array(str, HEAP8, ret, size);
    return ret
}

function writeArrayToMemory(array, buffer) {
    assert(array.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)");
    HEAP8.set(array, buffer)
}

function writeAsciiToMemory(str, buffer, dontAddNull) {
    for (var i = 0; i < str.length; ++i) {
        assert(str.charCodeAt(i) === str.charCodeAt(i) & 255);
        HEAP8[buffer++ >> 0] = str.charCodeAt(i)
    }
    if (!dontAddNull) HEAP8[buffer >> 0] = 0
}

function demangle(func) {
    warnOnce("warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling");
    return func
}

function demangleAll(text) {
    var regex = /__Z[\w\d_]+/g;
    return text.replace(regex, function (x) {
        var y = demangle(x);
        return x === y ? x : y + " [" + x + "]"
    })
}

function jsStackTrace() {
    var err = new Error;
    if (!err.stack) {
        try {
            throw new Error(0)
        } catch (e) {
            err = e
        }
        if (!err.stack) {
            return "(no stack trace available)"
        }
    }
    return err.stack.toString()
}

function stackTrace() {
    var js = jsStackTrace();
    if (Module["extraStackTrace"]) js += "\n" + Module["extraStackTrace"]();
    return demangleAll(js)
}

var WASM_PAGE_SIZE = 65536;

function alignUp(x, multiple) {
    if (x % multiple > 0) {
        x += multiple - x % multiple
    }
    return x
}

var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

function updateGlobalBuffer(buf) {
    Module["buffer"] = buffer = buf
}

function updateGlobalBufferViews() {
    Module["HEAP8"] = HEAP8 = new Int8Array(buffer);
    Module["HEAP16"] = HEAP16 = new Int16Array(buffer);
    Module["HEAP32"] = HEAP32 = new Int32Array(buffer);
    Module["HEAPU8"] = HEAPU8 = new Uint8Array(buffer);
    Module["HEAPU16"] = HEAPU16 = new Uint16Array(buffer);
    Module["HEAPU32"] = HEAPU32 = new Uint32Array(buffer);
    Module["HEAPF32"] = HEAPF32 = new Float32Array(buffer);
    Module["HEAPF64"] = HEAPF64 = new Float64Array(buffer)
}

var STACK_BASE = 3485088, STACK_MAX = 8727968, DYNAMIC_BASE = 8727968, DYNAMICTOP_PTR = 3484832;
assert(STACK_BASE % 16 === 0, "stack must start aligned");
assert(DYNAMIC_BASE % 16 === 0, "heap must start aligned");
var TOTAL_STACK = 5242880;
if (Module["TOTAL_STACK"]) assert(TOTAL_STACK === Module["TOTAL_STACK"], "the stack size can no longer be determined at runtime");
var TOTAL_MEMORY = Module["TOTAL_MEMORY"] || 16777216;
if (TOTAL_MEMORY < TOTAL_STACK) err("TOTAL_MEMORY should be larger than TOTAL_STACK, was " + TOTAL_MEMORY + "! (TOTAL_STACK=" + TOTAL_STACK + ")");
assert(typeof Int32Array !== "undefined" && typeof Float64Array !== "undefined" && Int32Array.prototype.subarray !== undefined && Int32Array.prototype.set !== undefined, "JS engine does not provide full typed array support");
if (Module["buffer"]) {
    buffer = Module["buffer"];
    assert(buffer.byteLength === TOTAL_MEMORY, "provided buffer should be " + TOTAL_MEMORY + " bytes, but it is " + buffer.byteLength)
} else {
    if (typeof WebAssembly === "object" && typeof WebAssembly.Memory === "function") {
        assert(TOTAL_MEMORY % WASM_PAGE_SIZE === 0);
        wasmMemory = new WebAssembly.Memory({"initial": TOTAL_MEMORY / WASM_PAGE_SIZE});
        buffer = wasmMemory.buffer
    } else {
        buffer = new ArrayBuffer(TOTAL_MEMORY)
    }
    assert(buffer.byteLength === TOTAL_MEMORY);
    Module["buffer"] = buffer
}
updateGlobalBufferViews();
HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;

function writeStackCookie() {
    assert((STACK_MAX & 3) == 0);
    HEAPU32[(STACK_MAX >> 2) - 1] = 34821223;
    HEAPU32[(STACK_MAX >> 2) - 2] = 2310721022
}

function checkStackCookie() {
    if (HEAPU32[(STACK_MAX >> 2) - 1] != 34821223 || HEAPU32[(STACK_MAX >> 2) - 2] != 2310721022) {
        abort("Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x02135467, but received 0x" + HEAPU32[(STACK_MAX >> 2) - 2].toString(16) + " " + HEAPU32[(STACK_MAX >> 2) - 1].toString(16))
    }
    if (HEAP32[0] !== 1668509029) throw"Runtime error: The application has corrupted its heap memory area (address zero)!"
}

function abortStackOverflow(allocSize) {
    abort("Stack overflow! Attempted to allocate " + allocSize + " bytes on the stack, but stack has only " + (STACK_MAX - stackSave() + allocSize) + " bytes available!")
}

HEAP32[0] = 1668509029;
HEAP16[1] = 25459;
if (HEAPU8[2] !== 115 || HEAPU8[3] !== 99) throw"Runtime error: expected the system to be little-endian!";

function callRuntimeCallbacks(callbacks) {
    while (callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback == "function") {
            callback();
            continue
        }
        var func = callback.func;
        if (typeof func === "number") {
            if (callback.arg === undefined) {
                Module["dynCall_v"](func)
            } else {
                Module["dynCall_vi"](func, callback.arg)
            }
        } else {
            func(callback.arg === undefined ? null : callback.arg)
        }
    }
}

var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATMAIN__ = [];
var __ATEXIT__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;
var runtimeExited = false;

function preRun() {
    if (Module["preRun"]) {
        if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
        while (Module["preRun"].length) {
            addOnPreRun(Module["preRun"].shift())
        }
    }
    callRuntimeCallbacks(__ATPRERUN__)
}

function ensureInitRuntime() {
    checkStackCookie();
    if (runtimeInitialized) return;
    runtimeInitialized = true;
    if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
    TTY.init();
    SOCKFS.root = FS.mount(SOCKFS, {}, null);
    callRuntimeCallbacks(__ATINIT__)
}

function preMain() {
    checkStackCookie();
    FS.ignorePermissions = false;
    callRuntimeCallbacks(__ATMAIN__)
}

function exitRuntime() {
    checkStackCookie();
    callRuntimeCallbacks(__ATEXIT__);
    FS.quit();
    TTY.shutdown();
    runtimeExited = true
}

function postRun() {
    checkStackCookie();
    if (Module["postRun"]) {
        if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
        while (Module["postRun"].length) {
            addOnPostRun(Module["postRun"].shift())
        }
    }
    callRuntimeCallbacks(__ATPOSTRUN__)
}

function addOnPreRun(cb) {
    __ATPRERUN__.unshift(cb)
}

function addOnPostRun(cb) {
    __ATPOSTRUN__.unshift(cb)
}

function unSign(value, bits, ignore) {
    if (value >= 0) {
        return value
    }
    return bits <= 32 ? 2 * Math.abs(1 << bits - 1) + value : Math.pow(2, bits) + value
}

function reSign(value, bits, ignore) {
    if (value <= 0) {
        return value
    }
    var half = bits <= 32 ? Math.abs(1 << bits - 1) : Math.pow(2, bits - 1);
    if (value >= half && (bits <= 32 || value > half)) {
        value = -2 * half + value
    }
    return value
}

assert(Math.imul, "This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
assert(Math.fround, "This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
assert(Math.clz32, "This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
assert(Math.trunc, "This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
var Math_abs = Math.abs;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_min = Math.min;
var Math_trunc = Math.trunc;
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;
var runDependencyTracking = {};

function getUniqueRunDependency(id) {
    var orig = id;
    while (1) {
        if (!runDependencyTracking[id]) return id;
        id = orig + Math.random()
    }
    return id
}

function addRunDependency(id) {
    runDependencies++;
    if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies)
    }
    if (id) {
        assert(!runDependencyTracking[id]);
        runDependencyTracking[id] = 1;
        if (runDependencyWatcher === null && typeof setInterval !== "undefined") {
            runDependencyWatcher = setInterval(function () {
                if (ABORT) {
                    clearInterval(runDependencyWatcher);
                    runDependencyWatcher = null;
                    return
                }
                var shown = false;
                for (var dep in runDependencyTracking) {
                    if (!shown) {
                        shown = true;
                        err("still waiting on run dependencies:")
                    }
                    err("dependency: " + dep)
                }
                if (shown) {
                    err("(end of list)")
                }
            }, 1e4)
        }
    } else {
        err("warning: run dependency added without ID")
    }
}

function removeRunDependency(id) {
    runDependencies--;
    if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies)
    }
    if (id) {
        assert(runDependencyTracking[id]);
        delete runDependencyTracking[id]
    } else {
        err("warning: run dependency removed without ID")
    }
    if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
            clearInterval(runDependencyWatcher);
            runDependencyWatcher = null
        }
        if (dependenciesFulfilled) {
            var callback = dependenciesFulfilled;
            dependenciesFulfilled = null;
            callback()
        }
    }
}

Module["preloadedImages"] = {};
Module["preloadedAudios"] = {};
var dataURIPrefix = "data:application/octet-stream;base64,";

function isDataURI(filename) {
    return String.prototype.startsWith ? filename.startsWith(dataURIPrefix) : filename.indexOf(dataURIPrefix) === 0
}

var wasmBinaryFile = "libicm2.wasm";
if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile)
}

function getBinary() {
    try {
        if (Module["wasmBinary"]) {
            return new Uint8Array(Module["wasmBinary"])
        }
        if (Module["readBinary"]) {
            return Module["readBinary"](wasmBinaryFile)
        } else {
            throw"both async and sync fetching of the wasm failed"
        }
    } catch (err) {
        abort(err)
    }
}

function getBinaryPromise() {
    if (!Module["wasmBinary"] && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && typeof fetch === "function") {
        return fetch(wasmBinaryFile, {credentials: "same-origin"}).then(function (response) {
            if (!response["ok"]) {
                throw"failed to load wasm binary file at '" + wasmBinaryFile + "'"
            }
            return response["arrayBuffer"]()
        }).catch(function () {
            return getBinary()
        })
    }
    return new Promise(function (resolve, reject) {
        resolve(getBinary())
    })
}

function createWasm(env) {
    var info = {
        "env": env,
        "global": {"NaN": NaN, Infinity: Infinity},
        "global.Math": Math,
        "asm2wasm": asm2wasmImports
    };

    function receiveInstance(instance, module) {
        var exports = instance.exports;
        Module["asm"] = exports;
        removeRunDependency("wasm-instantiate")
    }

    addRunDependency("wasm-instantiate");
    if (Module["instantiateWasm"]) {
        try {
            return Module["instantiateWasm"](info, receiveInstance)
        } catch (e) {
            err("Module.instantiateWasm callback failed with error: " + e);
            return false
        }
    }
    var trueModule = Module;

    function receiveInstantiatedSource(output) {
        assert(Module === trueModule, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
        trueModule = null;
        receiveInstance(output["instance"])
    }

    function instantiateArrayBuffer(receiver) {
        getBinaryPromise().then(function (binary) {
            return WebAssembly.instantiate(binary, info)
        }).then(receiver, function (reason) {
            err("failed to asynchronously prepare wasm: " + reason);
            abort(reason)
        })
    }

    if (!Module["wasmBinary"] && typeof WebAssembly.instantiateStreaming === "function" && !isDataURI(wasmBinaryFile) && typeof fetch === "function") {
        WebAssembly.instantiateStreaming(fetch(wasmBinaryFile, {credentials: "same-origin"}), info).then(receiveInstantiatedSource, function (reason) {
            err("wasm streaming compile failed: " + reason);
            err("falling back to ArrayBuffer instantiation");
            instantiateArrayBuffer(receiveInstantiatedSource)
        })
    } else {
        instantiateArrayBuffer(receiveInstantiatedSource)
    }
    return {}
}

Module["asm"] = function (global, env, providedBuffer) {
    env["memory"] = wasmMemory;
    env["table"] = wasmTable = new WebAssembly.Table({"initial": 4199, "maximum": 4199, "element": "anyfunc"});
    env["__memory_base"] = 1024;
    env["__table_base"] = 0;
    var exports = createWasm(env);
    assert(exports, "binaryen setup failed (no wasm support?)");
    return exports
};
var ASM_CONSTS = [function () {
    Module.chem = new Module.Chemical("");
    Module.react = new Module.Reaction("");
    if (typeof onLoadChemlib == "function") onLoadChemlib();
    if (typeof onLoadActiveIcm == "function") onLoadActiveIcm()
}];

function _emscripten_asm_const_i(code) {
    return ASM_CONSTS[code]()
}

__ATINIT__.push({
    func: function () {
        globalCtors()
    }
});
var tempDoublePtr = 3485072;
assert(tempDoublePtr % 8 == 0);

function __Z11Utf8ToUtf16iPKh() {
    err("missing function: _Z11Utf8ToUtf16iPKh");
    abort(-1)
}

function __Z11readGrobKMLbP9S_VAGROB_RK9BeeString() {
    err("missing function: _Z11readGrobKMLbP9S_VAGROB_RK9BeeString");
    abort(-1)
}

function __Z13readGrob3DXMLbP9S_VAGROB_RK9BeeString() {
    err("missing function: _Z13readGrob3DXMLbP9S_VAGROB_RK9BeeString");
    abort(-1)
}

function __Z14readHeaderJpegP8_IO_FILERK9BeeStringPiS4_S4_PjPS1_S6_() {
    err("missing function: _Z14readHeaderJpegP8_IO_FILERK9BeeStringPiS4_S4_PjPS1_S6_");
    abort(-1)
}

function __Z17Utf16ToLatin1HtmliPKtbb() {
    err("missing function: _Z17Utf16ToLatin1HtmliPKtbb");
    abort(-1)
}

function __Z18readGrobColladaDaebP9S_VAGROB_RK9BeeString() {
    err("missing function: _Z18readGrobColladaDaebP9S_VAGROB_RK9BeeString");
    abort(-1)
}

function __Z18readGrobColladaKmzbP9S_VAGROB_RK9BeeString() {
    err("missing function: _Z18readGrobColladaKmzbP9S_VAGROB_RK9BeeString");
    abort(-1)
}

function __Z19graphAdjacencyListsiiPi() {
    err("missing function: _Z19graphAdjacencyListsiiPi");
    abort(-1)
}

function __ZN12BeeZipFindex9makeIndexEP8_IO_FILEPFiPKcxE() {
    err("missing function: _ZN12BeeZipFindex9makeIndexEP8_IO_FILEPFiPKcxE");
    abort(-1)
}

function __ZN12BeeZipFindexC1Ev() {
    err("missing function: _ZN12BeeZipFindexC1Ev");
    abort(-1)
}

function __ZN12BeeZipFindexD1Ev() {
    err("missing function: _ZN12BeeZipFindexD1Ev");
    abort(-1)
}

function __ZN12TableEssence10readHeaderEP8_IO_FILE() {
    err("missing function: _ZN12TableEssence10readHeaderEP8_IO_FILE");
    abort(-1)
}

function __ZN15IcmTableEssence6getIDBERK9BeeStringP8_IO_FILE() {
    err("missing function: _ZN15IcmTableEssence6getIDBERK9BeeStringP8_IO_FILE");
    abort(-1)
}

function __ZN17IcmPluginInstance16onTorsionRotDoneEP5S_AT_() {
    err("missing function: _ZN17IcmPluginInstance16onTorsionRotDoneEP5S_AT_");
    abort(-1)
}

function __ZN17IcmPluginInstance16onTorsionRotInitEP5S_AT_() {
    err("missing function: _ZN17IcmPluginInstance16onTorsionRotInitEP5S_AT_");
    abort(-1)
}

function __ZN17IcmPluginInstance18onTorsionRotUpdateEP5S_AT_() {
    err("missing function: _ZN17IcmPluginInstance18onTorsionRotUpdateEP5S_AT_");
    abort(-1)
}

function __ZN18IcmPluginInterface13atomPopupMenuEP5S_AT_ii() {
    err("missing function: _ZN18IcmPluginInterface13atomPopupMenuEP5S_AT_ii");
    abort(-1)
}

function __ZN7QPlot2D19showAxisContextMenuE8AxisTypeRK6WPoint() {
    err("missing function: _ZN7QPlot2D19showAxisContextMenuE8AxisTypeRK6WPoint");
    abort(-1)
}

function __ZN9BeeFindex10buildIndexE13BeeFileFormatP8_IO_FILEPFiPKcxEi() {
    err("missing function: _ZN9BeeFindex10buildIndexE13BeeFileFormatP8_IO_FILEPFiPKcxEi");
    abort(-1)
}

function __ZN9BeeFindex10readRecordEv() {
    err("missing function: _ZN9BeeFindex10readRecordEv");
    abort(-1)
}

function __ZN9BeeFindex13buildCsvIndexEP8_IO_FILEcPFiPKcxEi() {
    err("missing function: _ZN9BeeFindex13buildCsvIndexEP8_IO_FILEcPFiPKcxEi");
    abort(-1)
}

function __ZN9BeeFindex16makePatternIndexEP8_IO_FILERK9BeeStringS4_PFiPKcxEiS4_() {
    err("missing function: _ZN9BeeFindex16makePatternIndexEP8_IO_FILERK9BeeStringS4_PFiPKcxEiS4_");
    abort(-1)
}

function __ZN9BeeFindex5beginEi() {
    err("missing function: _ZN9BeeFindex5beginEi");
    abort(-1)
}

function __ZN9XmlReader16getStructuredXmlERK9BeeStringb() {
    err("missing function: _ZN9XmlReader16getStructuredXmlERK9BeeStringb");
    abort(-1)
}

function ___assert_fail(condition, filename, line, func) {
    abort("Assertion failed: " + UTF8ToString(condition) + ", at: " + [filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function"])
}

var ENV = {};

function ___buildEnvironment(environ) {
    var MAX_ENV_VALUES = 64;
    var TOTAL_ENV_SIZE = 1024;
    var poolPtr;
    var envPtr;
    if (!___buildEnvironment.called) {
        ___buildEnvironment.called = true;
        ENV["USER"] = ENV["LOGNAME"] = "web_user";
        ENV["PATH"] = "/";
        ENV["PWD"] = "/";
        ENV["HOME"] = "/home/web_user";
        ENV["LANG"] = "C.UTF-8";
        ENV["_"] = Module["thisProgram"];
        poolPtr = getMemory(TOTAL_ENV_SIZE);
        envPtr = getMemory(MAX_ENV_VALUES * 4);
        HEAP32[envPtr >> 2] = poolPtr;
        HEAP32[environ >> 2] = envPtr
    } else {
        envPtr = HEAP32[environ >> 2];
        poolPtr = HEAP32[envPtr >> 2]
    }
    var strings = [];
    var totalSize = 0;
    for (var key in ENV) {
        if (typeof ENV[key] === "string") {
            var line = key + "=" + ENV[key];
            strings.push(line);
            totalSize += line.length
        }
    }
    if (totalSize > TOTAL_ENV_SIZE) {
        throw new Error("Environment size exceeded TOTAL_ENV_SIZE!")
    }
    var ptrSize = 4;
    for (var i = 0; i < strings.length; i++) {
        var line = strings[i];
        writeAsciiToMemory(line, poolPtr);
        HEAP32[envPtr + i * ptrSize >> 2] = poolPtr;
        poolPtr += line.length + 1
    }
    HEAP32[envPtr + strings.length * ptrSize >> 2] = 0
}

function _emscripten_get_now() {
    abort()
}

function _emscripten_get_now_is_monotonic() {
    return 0 || ENVIRONMENT_IS_NODE || typeof dateNow !== "undefined" || (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && self["performance"] && self["performance"]["now"]
}

function ___setErrNo(value) {
    if (Module["___errno_location"]) HEAP32[Module["___errno_location"]() >> 2] = value; else err("failed to set errno from JS");
    return value
}

function _clock_gettime(clk_id, tp) {
    var now;
    if (clk_id === 0) {
        now = Date.now()
    } else if (clk_id === 1 && _emscripten_get_now_is_monotonic()) {
        now = _emscripten_get_now()
    } else {
        ___setErrNo(22);
        return -1
    }
    HEAP32[tp >> 2] = now / 1e3 | 0;
    HEAP32[tp + 4 >> 2] = now % 1e3 * 1e3 * 1e3 | 0;
    return 0
}

function ___clock_gettime(a0, a1) {
    return _clock_gettime(a0, a1)
}

function ___cxa_allocate_exception(size) {
    return _malloc(size)
}

function _atexit(func, arg) {
    __ATEXIT__.unshift({func: func, arg: arg})
}

function ___cxa_atexit() {
    return _atexit.apply(null, arguments)
}

function __ZSt18uncaught_exceptionv() {
    return !!__ZSt18uncaught_exceptionv.uncaught_exception
}

function ___cxa_free_exception(ptr) {
    try {
        return _free(ptr)
    } catch (e) {
        err("exception during cxa_free_exception: " + e)
    }
}

var EXCEPTIONS = {
    last: 0, caught: [], infos: {}, deAdjust: function (adjusted) {
        if (!adjusted || EXCEPTIONS.infos[adjusted]) return adjusted;
        for (var key in EXCEPTIONS.infos) {
            var ptr = +key;
            var adj = EXCEPTIONS.infos[ptr].adjusted;
            var len = adj.length;
            for (var i = 0; i < len; i++) {
                if (adj[i] === adjusted) {
                    return ptr
                }
            }
        }
        return adjusted
    }, addRef: function (ptr) {
        if (!ptr) return;
        var info = EXCEPTIONS.infos[ptr];
        info.refcount++
    }, decRef: function (ptr) {
        if (!ptr) return;
        var info = EXCEPTIONS.infos[ptr];
        assert(info.refcount > 0);
        info.refcount--;
        if (info.refcount === 0 && !info.rethrown) {
            if (info.destructor) {
                Module["dynCall_vi"](info.destructor, ptr)
            }
            delete EXCEPTIONS.infos[ptr];
            ___cxa_free_exception(ptr)
        }
    }, clearRef: function (ptr) {
        if (!ptr) return;
        var info = EXCEPTIONS.infos[ptr];
        info.refcount = 0
    }
};

function ___cxa_begin_catch(ptr) {
    var info = EXCEPTIONS.infos[ptr];
    if (info && !info.caught) {
        info.caught = true;
        __ZSt18uncaught_exceptionv.uncaught_exception--
    }
    if (info) info.rethrown = false;
    EXCEPTIONS.caught.push(ptr);
    EXCEPTIONS.addRef(EXCEPTIONS.deAdjust(ptr));
    return ptr
}

function ___cxa_pure_virtual() {
    ABORT = true;
    throw"Pure virtual function called!"
}

function ___resumeException(ptr) {
    if (!EXCEPTIONS.last) {
        EXCEPTIONS.last = ptr
    }
    throw ptr
}

function ___cxa_find_matching_catch() {
    var thrown = EXCEPTIONS.last;
    if (!thrown) {
        return (setTempRet0(0), 0) | 0
    }
    var info = EXCEPTIONS.infos[thrown];
    var throwntype = info.type;
    if (!throwntype) {
        return (setTempRet0(0), thrown) | 0
    }
    var typeArray = Array.prototype.slice.call(arguments);
    var pointer = Module["___cxa_is_pointer_type"](throwntype);
    if (!___cxa_find_matching_catch.buffer) ___cxa_find_matching_catch.buffer = _malloc(4);
    HEAP32[___cxa_find_matching_catch.buffer >> 2] = thrown;
    thrown = ___cxa_find_matching_catch.buffer;
    for (var i = 0; i < typeArray.length; i++) {
        if (typeArray[i] && Module["___cxa_can_catch"](typeArray[i], throwntype, thrown)) {
            thrown = HEAP32[thrown >> 2];
            info.adjusted.push(thrown);
            return (setTempRet0(typeArray[i]), thrown) | 0
        }
    }
    thrown = HEAP32[thrown >> 2];
    return (setTempRet0(throwntype), thrown) | 0
}

function ___cxa_throw(ptr, type, destructor) {
    EXCEPTIONS.infos[ptr] = {
        ptr: ptr,
        adjusted: [ptr],
        type: type,
        destructor: destructor,
        refcount: 0,
        caught: false,
        rethrown: false
    };
    EXCEPTIONS.last = ptr;
    if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1
    } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++
    }
    throw ptr
}

function ___gxx_personality_v0() {
}

function ___lock() {
}

function ___map_file(pathname, size) {
    ___setErrNo(1);
    return -1
}

var PATH = {
    splitPath: function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1)
    }, normalizeArray: function (parts, allowAboveRoot) {
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
            var last = parts[i];
            if (last === ".") {
                parts.splice(i, 1)
            } else if (last === "..") {
                parts.splice(i, 1);
                up++
            } else if (up) {
                parts.splice(i, 1);
                up--
            }
        }
        if (allowAboveRoot) {
            for (; up; up--) {
                parts.unshift("..")
            }
        }
        return parts
    }, normalize: function (path) {
        var isAbsolute = path.charAt(0) === "/", trailingSlash = path.substr(-1) === "/";
        path = PATH.normalizeArray(path.split("/").filter(function (p) {
            return !!p
        }), !isAbsolute).join("/");
        if (!path && !isAbsolute) {
            path = "."
        }
        if (path && trailingSlash) {
            path += "/"
        }
        return (isAbsolute ? "/" : "") + path
    }, dirname: function (path) {
        var result = PATH.splitPath(path), root = result[0], dir = result[1];
        if (!root && !dir) {
            return "."
        }
        if (dir) {
            dir = dir.substr(0, dir.length - 1)
        }
        return root + dir
    }, basename: function (path) {
        if (path === "/") return "/";
        var lastSlash = path.lastIndexOf("/");
        if (lastSlash === -1) return path;
        return path.substr(lastSlash + 1)
    }, extname: function (path) {
        return PATH.splitPath(path)[3]
    }, join: function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join("/"))
    }, join2: function (l, r) {
        return PATH.normalize(l + "/" + r)
    }, resolve: function () {
        var resolvedPath = "", resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            var path = i >= 0 ? arguments[i] : FS.cwd();
            if (typeof path !== "string") {
                throw new TypeError("Arguments to path.resolve must be strings")
            } else if (!path) {
                return ""
            }
            resolvedPath = path + "/" + resolvedPath;
            resolvedAbsolute = path.charAt(0) === "/"
        }
        resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(function (p) {
            return !!p
        }), !resolvedAbsolute).join("/");
        return (resolvedAbsolute ? "/" : "") + resolvedPath || "."
    }, relative: function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);

        function trim(arr) {
            var start = 0;
            for (; start < arr.length; start++) {
                if (arr[start] !== "") break
            }
            var end = arr.length - 1;
            for (; end >= 0; end--) {
                if (arr[end] !== "") break
            }
            if (start > end) return [];
            return arr.slice(start, end - start + 1)
        }

        var fromParts = trim(from.split("/"));
        var toParts = trim(to.split("/"));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
            if (fromParts[i] !== toParts[i]) {
                samePartsLength = i;
                break
            }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
            outputParts.push("..")
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join("/")
    }
};
var TTY = {
    ttys: [], init: function () {
    }, shutdown: function () {
    }, register: function (dev, ops) {
        TTY.ttys[dev] = {input: [], output: [], ops: ops};
        FS.registerDevice(dev, TTY.stream_ops)
    }, stream_ops: {
        open: function (stream) {
            var tty = TTY.ttys[stream.node.rdev];
            if (!tty) {
                throw new FS.ErrnoError(ERRNO_CODES.ENODEV)
            }
            stream.tty = tty;
            stream.seekable = false
        }, close: function (stream) {
            stream.tty.ops.flush(stream.tty)
        }, flush: function (stream) {
            stream.tty.ops.flush(stream.tty)
        }, read: function (stream, buffer, offset, length, pos) {
            if (!stream.tty || !stream.tty.ops.get_char) {
                throw new FS.ErrnoError(ERRNO_CODES.ENXIO)
            }
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
                var result;
                try {
                    result = stream.tty.ops.get_char(stream.tty)
                } catch (e) {
                    throw new FS.ErrnoError(ERRNO_CODES.EIO)
                }
                if (result === undefined && bytesRead === 0) {
                    throw new FS.ErrnoError(ERRNO_CODES.EAGAIN)
                }
                if (result === null || result === undefined) break;
                bytesRead++;
                buffer[offset + i] = result
            }
            if (bytesRead) {
                stream.node.timestamp = Date.now()
            }
            return bytesRead
        }, write: function (stream, buffer, offset, length, pos) {
            if (!stream.tty || !stream.tty.ops.put_char) {
                throw new FS.ErrnoError(ERRNO_CODES.ENXIO)
            }
            try {
                for (var i = 0; i < length; i++) {
                    stream.tty.ops.put_char(stream.tty, buffer[offset + i])
                }
            } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO)
            }
            if (length) {
                stream.node.timestamp = Date.now()
            }
            return i
        }
    }, default_tty_ops: {
        get_char: function (tty) {
            if (!tty.input.length) {
                var result = null;
                if (ENVIRONMENT_IS_NODE) {
                    var BUFSIZE = 256;
                    var buf = new Buffer(BUFSIZE);
                    var bytesRead = 0;
                    var isPosixPlatform = process.platform != "win32";
                    var fd = process.stdin.fd;
                    if (isPosixPlatform) {
                        var usingDevice = false;
                        try {
                            fd = fs.openSync("/dev/stdin", "r");
                            usingDevice = true
                        } catch (e) {
                        }
                    }
                    try {
                        bytesRead = fs.readSync(fd, buf, 0, BUFSIZE, null)
                    } catch (e) {
                        if (e.toString().indexOf("EOF") != -1) bytesRead = 0; else throw e
                    }
                    if (usingDevice) {
                        fs.closeSync(fd)
                    }
                    if (bytesRead > 0) {
                        result = buf.slice(0, bytesRead).toString("utf-8")
                    } else {
                        result = null
                    }
                } else if (typeof window != "undefined" && typeof window.prompt == "function") {
                    result = window.prompt("Input: ");
                    if (result !== null) {
                        result += "\n"
                    }
                } else if (typeof readline == "function") {
                    result = readline();
                    if (result !== null) {
                        result += "\n"
                    }
                }
                if (!result) {
                    return null
                }
                tty.input = intArrayFromString(result, true)
            }
            return tty.input.shift()
        }, put_char: function (tty, val) {
            if (val === null || val === 10) {
                out(UTF8ArrayToString(tty.output, 0));
                tty.output = []
            } else {
                if (val != 0) tty.output.push(val)
            }
        }, flush: function (tty) {
            if (tty.output && tty.output.length > 0) {
                out(UTF8ArrayToString(tty.output, 0));
                tty.output = []
            }
        }
    }, default_tty1_ops: {
        put_char: function (tty, val) {
            if (val === null || val === 10) {
                err(UTF8ArrayToString(tty.output, 0));
                tty.output = []
            } else {
                if (val != 0) tty.output.push(val)
            }
        }, flush: function (tty) {
            if (tty.output && tty.output.length > 0) {
                err(UTF8ArrayToString(tty.output, 0));
                tty.output = []
            }
        }
    }
};
var MEMFS = {
    ops_table: null, mount: function (mount) {
        return MEMFS.createNode(null, "/", 16384 | 511, 0)
    }, createNode: function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM)
        }
        if (!MEMFS.ops_table) {
            MEMFS.ops_table = {
                dir: {
                    node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr,
                        lookup: MEMFS.node_ops.lookup,
                        mknod: MEMFS.node_ops.mknod,
                        rename: MEMFS.node_ops.rename,
                        unlink: MEMFS.node_ops.unlink,
                        rmdir: MEMFS.node_ops.rmdir,
                        readdir: MEMFS.node_ops.readdir,
                        symlink: MEMFS.node_ops.symlink
                    }, stream: {llseek: MEMFS.stream_ops.llseek}
                },
                file: {
                    node: {getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr},
                    stream: {
                        llseek: MEMFS.stream_ops.llseek,
                        read: MEMFS.stream_ops.read,
                        write: MEMFS.stream_ops.write,
                        allocate: MEMFS.stream_ops.allocate,
                        mmap: MEMFS.stream_ops.mmap,
                        msync: MEMFS.stream_ops.msync
                    }
                },
                link: {
                    node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr,
                        readlink: MEMFS.node_ops.readlink
                    }, stream: {}
                },
                chrdev: {
                    node: {getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr},
                    stream: FS.chrdev_stream_ops
                }
            }
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
            node.node_ops = MEMFS.ops_table.dir.node;
            node.stream_ops = MEMFS.ops_table.dir.stream;
            node.contents = {}
        } else if (FS.isFile(node.mode)) {
            node.node_ops = MEMFS.ops_table.file.node;
            node.stream_ops = MEMFS.ops_table.file.stream;
            node.usedBytes = 0;
            node.contents = null
        } else if (FS.isLink(node.mode)) {
            node.node_ops = MEMFS.ops_table.link.node;
            node.stream_ops = MEMFS.ops_table.link.stream
        } else if (FS.isChrdev(node.mode)) {
            node.node_ops = MEMFS.ops_table.chrdev.node;
            node.stream_ops = MEMFS.ops_table.chrdev.stream
        }
        node.timestamp = Date.now();
        if (parent) {
            parent.contents[name] = node
        }
        return node
    }, getFileDataAsRegularArray: function (node) {
        if (node.contents && node.contents.subarray) {
            var arr = [];
            for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
            return arr
        }
        return node.contents
    }, getFileDataAsTypedArray: function (node) {
        if (!node.contents) return new Uint8Array;
        if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
        return new Uint8Array(node.contents)
    }, expandFileStorage: function (node, newCapacity) {
        var prevCapacity = node.contents ? node.contents.length : 0;
        if (prevCapacity >= newCapacity) return;
        var CAPACITY_DOUBLING_MAX = 1024 * 1024;
        newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) | 0);
        if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
        var oldContents = node.contents;
        node.contents = new Uint8Array(newCapacity);
        if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
        return
    }, resizeFileStorage: function (node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
            node.contents = null;
            node.usedBytes = 0;
            return
        }
        if (!node.contents || node.contents.subarray) {
            var oldContents = node.contents;
            node.contents = new Uint8Array(new ArrayBuffer(newSize));
            if (oldContents) {
                node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)))
            }
            node.usedBytes = newSize;
            return
        }
        if (!node.contents) node.contents = [];
        if (node.contents.length > newSize) node.contents.length = newSize; else while (node.contents.length < newSize) node.contents.push(0);
        node.usedBytes = newSize
    }, node_ops: {
        getattr: function (node) {
            var attr = {};
            attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
            attr.ino = node.id;
            attr.mode = node.mode;
            attr.nlink = 1;
            attr.uid = 0;
            attr.gid = 0;
            attr.rdev = node.rdev;
            if (FS.isDir(node.mode)) {
                attr.size = 4096
            } else if (FS.isFile(node.mode)) {
                attr.size = node.usedBytes
            } else if (FS.isLink(node.mode)) {
                attr.size = node.link.length
            } else {
                attr.size = 0
            }
            attr.atime = new Date(node.timestamp);
            attr.mtime = new Date(node.timestamp);
            attr.ctime = new Date(node.timestamp);
            attr.blksize = 4096;
            attr.blocks = Math.ceil(attr.size / attr.blksize);
            return attr
        }, setattr: function (node, attr) {
            if (attr.mode !== undefined) {
                node.mode = attr.mode
            }
            if (attr.timestamp !== undefined) {
                node.timestamp = attr.timestamp
            }
            if (attr.size !== undefined) {
                MEMFS.resizeFileStorage(node, attr.size)
            }
        }, lookup: function (parent, name) {
            throw FS.genericErrors[ERRNO_CODES.ENOENT]
        }, mknod: function (parent, name, mode, dev) {
            return MEMFS.createNode(parent, name, mode, dev)
        }, rename: function (old_node, new_dir, new_name) {
            if (FS.isDir(old_node.mode)) {
                var new_node;
                try {
                    new_node = FS.lookupNode(new_dir, new_name)
                } catch (e) {
                }
                if (new_node) {
                    for (var i in new_node.contents) {
                        throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)
                    }
                }
            }
            delete old_node.parent.contents[old_node.name];
            old_node.name = new_name;
            new_dir.contents[new_name] = old_node;
            old_node.parent = new_dir
        }, unlink: function (parent, name) {
            delete parent.contents[name]
        }, rmdir: function (parent, name) {
            var node = FS.lookupNode(parent, name);
            for (var i in node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)
            }
            delete parent.contents[name]
        }, readdir: function (node) {
            var entries = [".", ".."];
            for (var key in node.contents) {
                if (!node.contents.hasOwnProperty(key)) {
                    continue
                }
                entries.push(key)
            }
            return entries
        }, symlink: function (parent, newname, oldpath) {
            var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
            node.link = oldpath;
            return node
        }, readlink: function (node) {
            if (!FS.isLink(node.mode)) {
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
            }
            return node.link
        }
    }, stream_ops: {
        read: function (stream, buffer, offset, length, position) {
            var contents = stream.node.contents;
            if (position >= stream.node.usedBytes) return 0;
            var size = Math.min(stream.node.usedBytes - position, length);
            assert(size >= 0);
            if (size > 8 && contents.subarray) {
                buffer.set(contents.subarray(position, position + size), offset)
            } else {
                for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i]
            }
            return size
        }, write: function (stream, buffer, offset, length, position, canOwn) {
            if (canOwn) {
                warnOnce("file packager has copied file data into memory, but in memory growth we are forced to copy it again (see --no-heap-copy)")
            }
            canOwn = false;
            if (!length) return 0;
            var node = stream.node;
            node.timestamp = Date.now();
            if (buffer.subarray && (!node.contents || node.contents.subarray)) {
                if (canOwn) {
                    assert(position === 0, "canOwn must imply no weird position inside the file");
                    node.contents = buffer.subarray(offset, offset + length);
                    node.usedBytes = length;
                    return length
                } else if (node.usedBytes === 0 && position === 0) {
                    node.contents = new Uint8Array(buffer.subarray(offset, offset + length));
                    node.usedBytes = length;
                    return length
                } else if (position + length <= node.usedBytes) {
                    node.contents.set(buffer.subarray(offset, offset + length), position);
                    return length
                }
            }
            MEMFS.expandFileStorage(node, position + length);
            if (node.contents.subarray && buffer.subarray) node.contents.set(buffer.subarray(offset, offset + length), position); else {
                for (var i = 0; i < length; i++) {
                    node.contents[position + i] = buffer[offset + i]
                }
            }
            node.usedBytes = Math.max(node.usedBytes, position + length);
            return length
        }, llseek: function (stream, offset, whence) {
            var position = offset;
            if (whence === 1) {
                position += stream.position
            } else if (whence === 2) {
                if (FS.isFile(stream.node.mode)) {
                    position += stream.node.usedBytes
                }
            }
            if (position < 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
            }
            return position
        }, allocate: function (stream, offset, length) {
            MEMFS.expandFileStorage(stream.node, offset + length);
            stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length)
        }, mmap: function (stream, buffer, offset, length, position, prot, flags) {
            if (!FS.isFile(stream.node.mode)) {
                throw new FS.ErrnoError(ERRNO_CODES.ENODEV)
            }
            var ptr;
            var allocated;
            var contents = stream.node.contents;
            if (!(flags & 2) && (contents.buffer === buffer || contents.buffer === buffer.buffer)) {
                allocated = false;
                ptr = contents.byteOffset
            } else {
                if (position > 0 || position + length < stream.node.usedBytes) {
                    if (contents.subarray) {
                        contents = contents.subarray(position, position + length)
                    } else {
                        contents = Array.prototype.slice.call(contents, position, position + length)
                    }
                }
                allocated = true;
                ptr = _malloc(length);
                if (!ptr) {
                    throw new FS.ErrnoError(ERRNO_CODES.ENOMEM)
                }
                buffer.set(contents, ptr)
            }
            return {ptr: ptr, allocated: allocated}
        }, msync: function (stream, buffer, offset, length, mmapFlags) {
            if (!FS.isFile(stream.node.mode)) {
                throw new FS.ErrnoError(ERRNO_CODES.ENODEV)
            }
            if (mmapFlags & 2) {
                return 0
            }
            var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
            return 0
        }
    }
};
var IDBFS = {
    dbs: {}, indexedDB: function () {
        if (typeof indexedDB !== "undefined") return indexedDB;
        var ret = null;
        if (typeof window === "object") ret = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        assert(ret, "IDBFS used, but indexedDB not supported");
        return ret
    }, DB_VERSION: 21, DB_STORE_NAME: "FILE_DATA", mount: function (mount) {
        return MEMFS.mount.apply(null, arguments)
    }, syncfs: function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function (err, local) {
            if (err) return callback(err);
            IDBFS.getRemoteSet(mount, function (err, remote) {
                if (err) return callback(err);
                var src = populate ? remote : local;
                var dst = populate ? local : remote;
                IDBFS.reconcile(src, dst, callback)
            })
        })
    }, getDB: function (name, callback) {
        var db = IDBFS.dbs[name];
        if (db) {
            return callback(null, db)
        }
        var req;
        try {
            req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION)
        } catch (e) {
            return callback(e)
        }
        if (!req) {
            return callback("Unable to connect to IndexedDB")
        }
        req.onupgradeneeded = function (e) {
            var db = e.target.result;
            var transaction = e.target.transaction;
            var fileStore;
            if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
                fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME)
            } else {
                fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME)
            }
            if (!fileStore.indexNames.contains("timestamp")) {
                fileStore.createIndex("timestamp", "timestamp", {unique: false})
            }
        };
        req.onsuccess = function () {
            db = req.result;
            IDBFS.dbs[name] = db;
            callback(null, db)
        };
        req.onerror = function (e) {
            callback(this.error);
            e.preventDefault()
        }
    }, getLocalSet: function (mount, callback) {
        var entries = {};

        function isRealDir(p) {
            return p !== "." && p !== ".."
        }

        function toAbsolute(root) {
            return function (p) {
                return PATH.join2(root, p)
            }
        }

        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
        while (check.length) {
            var path = check.pop();
            var stat;
            try {
                stat = FS.stat(path)
            } catch (e) {
                return callback(e)
            }
            if (FS.isDir(stat.mode)) {
                check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)))
            }
            entries[path] = {timestamp: stat.mtime}
        }
        return callback(null, {type: "local", entries: entries})
    }, getRemoteSet: function (mount, callback) {
        var entries = {};
        IDBFS.getDB(mount.mountpoint, function (err, db) {
            if (err) return callback(err);
            try {
                var transaction = db.transaction([IDBFS.DB_STORE_NAME], "readonly");
                transaction.onerror = function (e) {
                    callback(this.error);
                    e.preventDefault()
                };
                var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
                var index = store.index("timestamp");
                index.openKeyCursor().onsuccess = function (event) {
                    var cursor = event.target.result;
                    if (!cursor) {
                        return callback(null, {type: "remote", db: db, entries: entries})
                    }
                    entries[cursor.primaryKey] = {timestamp: cursor.key};
                    cursor.continue()
                }
            } catch (e) {
                return callback(e)
            }
        })
    }, loadLocalEntry: function (path, callback) {
        var stat, node;
        try {
            var lookup = FS.lookupPath(path);
            node = lookup.node;
            stat = FS.stat(path)
        } catch (e) {
            return callback(e)
        }
        if (FS.isDir(stat.mode)) {
            return callback(null, {timestamp: stat.mtime, mode: stat.mode})
        } else if (FS.isFile(stat.mode)) {
            node.contents = MEMFS.getFileDataAsTypedArray(node);
            return callback(null, {timestamp: stat.mtime, mode: stat.mode, contents: node.contents})
        } else {
            return callback(new Error("node type not supported"))
        }
    }, storeLocalEntry: function (path, entry, callback) {
        try {
            if (FS.isDir(entry.mode)) {
                FS.mkdir(path, entry.mode)
            } else if (FS.isFile(entry.mode)) {
                FS.writeFile(path, entry.contents, {canOwn: true})
            } else {
                return callback(new Error("node type not supported"))
            }
            FS.chmod(path, entry.mode);
            FS.utime(path, entry.timestamp, entry.timestamp)
        } catch (e) {
            return callback(e)
        }
        callback(null)
    }, removeLocalEntry: function (path, callback) {
        try {
            var lookup = FS.lookupPath(path);
            var stat = FS.stat(path);
            if (FS.isDir(stat.mode)) {
                FS.rmdir(path)
            } else if (FS.isFile(stat.mode)) {
                FS.unlink(path)
            }
        } catch (e) {
            return callback(e)
        }
        callback(null)
    }, loadRemoteEntry: function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function (event) {
            callback(null, event.target.result)
        };
        req.onerror = function (e) {
            callback(this.error);
            e.preventDefault()
        }
    }, storeRemoteEntry: function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function () {
            callback(null)
        };
        req.onerror = function (e) {
            callback(this.error);
            e.preventDefault()
        }
    }, removeRemoteEntry: function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function () {
            callback(null)
        };
        req.onerror = function (e) {
            callback(this.error);
            e.preventDefault()
        }
    }, reconcile: function (src, dst, callback) {
        var total = 0;
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
            var e = src.entries[key];
            var e2 = dst.entries[key];
            if (!e2 || e.timestamp > e2.timestamp) {
                create.push(key);
                total++
            }
        });
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
            var e = dst.entries[key];
            var e2 = src.entries[key];
            if (!e2) {
                remove.push(key);
                total++
            }
        });
        if (!total) {
            return callback(null)
        }
        var errored = false;
        var completed = 0;
        var db = src.type === "remote" ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], "readwrite");
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);

        function done(err) {
            if (err) {
                if (!done.errored) {
                    done.errored = true;
                    return callback(err)
                }
                return
            }
            if (++completed >= total) {
                return callback(null)
            }
        }

        transaction.onerror = function (e) {
            done(this.error);
            e.preventDefault()
        };
        create.sort().forEach(function (path) {
            if (dst.type === "local") {
                IDBFS.loadRemoteEntry(store, path, function (err, entry) {
                    if (err) return done(err);
                    IDBFS.storeLocalEntry(path, entry, done)
                })
            } else {
                IDBFS.loadLocalEntry(path, function (err, entry) {
                    if (err) return done(err);
                    IDBFS.storeRemoteEntry(store, path, entry, done)
                })
            }
        });
        remove.sort().reverse().forEach(function (path) {
            if (dst.type === "local") {
                IDBFS.removeLocalEntry(path, done)
            } else {
                IDBFS.removeRemoteEntry(store, path, done)
            }
        })
    }
};
var NODEFS = {
    isWindows: false, staticInit: function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
        var flags = process["binding"]("constants");
        if (flags["fs"]) {
            flags = flags["fs"]
        }
        NODEFS.flagsForNodeMap = {
            1024: flags["O_APPEND"],
            64: flags["O_CREAT"],
            128: flags["O_EXCL"],
            0: flags["O_RDONLY"],
            2: flags["O_RDWR"],
            4096: flags["O_SYNC"],
            512: flags["O_TRUNC"],
            1: flags["O_WRONLY"]
        }
    }, bufferFrom: function (arrayBuffer) {
        return Buffer.alloc ? Buffer.from(arrayBuffer) : new Buffer(arrayBuffer)
    }, mount: function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, "/", NODEFS.getMode(mount.opts.root), 0)
    }, createNode: function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node
    }, getMode: function (path) {
        var stat;
        try {
            stat = fs.lstatSync(path);
            if (NODEFS.isWindows) {
                stat.mode = stat.mode | (stat.mode & 292) >> 2
            }
        } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
        return stat.mode
    }, realPath: function (node) {
        var parts = [];
        while (node.parent !== node) {
            parts.push(node.name);
            node = node.parent
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts)
    }, flagsForNode: function (flags) {
        flags &= ~2097152;
        flags &= ~2048;
        flags &= ~32768;
        flags &= ~524288;
        var newFlags = 0;
        for (var k in NODEFS.flagsForNodeMap) {
            if (flags & k) {
                newFlags |= NODEFS.flagsForNodeMap[k];
                flags ^= k
            }
        }
        if (!flags) {
            return newFlags
        } else {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
        }
    }, node_ops: {
        getattr: function (node) {
            var path = NODEFS.realPath(node);
            var stat;
            try {
                stat = fs.lstatSync(path)
            } catch (e) {
                if (!e.code) throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
            if (NODEFS.isWindows && !stat.blksize) {
                stat.blksize = 4096
            }
            if (NODEFS.isWindows && !stat.blocks) {
                stat.blocks = (stat.size + stat.blksize - 1) / stat.blksize | 0
            }
            return {
                dev: stat.dev,
                ino: stat.ino,
                mode: stat.mode,
                nlink: stat.nlink,
                uid: stat.uid,
                gid: stat.gid,
                rdev: stat.rdev,
                size: stat.size,
                atime: stat.atime,
                mtime: stat.mtime,
                ctime: stat.ctime,
                blksize: stat.blksize,
                blocks: stat.blocks
            }
        }, setattr: function (node, attr) {
            var path = NODEFS.realPath(node);
            try {
                if (attr.mode !== undefined) {
                    fs.chmodSync(path, attr.mode);
                    node.mode = attr.mode
                }
                if (attr.timestamp !== undefined) {
                    var date = new Date(attr.timestamp);
                    fs.utimesSync(path, date, date)
                }
                if (attr.size !== undefined) {
                    fs.truncateSync(path, attr.size)
                }
            } catch (e) {
                if (!e.code) throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        }, lookup: function (parent, name) {
            var path = PATH.join2(NODEFS.realPath(parent), name);
            var mode = NODEFS.getMode(path);
            return NODEFS.createNode(parent, name, mode)
        }, mknod: function (parent, name, mode, dev) {
            var node = NODEFS.createNode(parent, name, mode, dev);
            var path = NODEFS.realPath(node);
            try {
                if (FS.isDir(node.mode)) {
                    fs.mkdirSync(path, node.mode)
                } else {
                    fs.writeFileSync(path, "", {mode: node.mode})
                }
            } catch (e) {
                if (!e.code) throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
            return node
        }, rename: function (oldNode, newDir, newName) {
            var oldPath = NODEFS.realPath(oldNode);
            var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
            try {
                fs.renameSync(oldPath, newPath)
            } catch (e) {
                if (!e.code) throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        }, unlink: function (parent, name) {
            var path = PATH.join2(NODEFS.realPath(parent), name);
            try {
                fs.unlinkSync(path)
            } catch (e) {
                if (!e.code) throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        }, rmdir: function (parent, name) {
            var path = PATH.join2(NODEFS.realPath(parent), name);
            try {
                fs.rmdirSync(path)
            } catch (e) {
                if (!e.code) throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        }, readdir: function (node) {
            var path = NODEFS.realPath(node);
            try {
                return fs.readdirSync(path)
            } catch (e) {
                if (!e.code) throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        }, symlink: function (parent, newName, oldPath) {
            var newPath = PATH.join2(NODEFS.realPath(parent), newName);
            try {
                fs.symlinkSync(oldPath, newPath)
            } catch (e) {
                if (!e.code) throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        }, readlink: function (node) {
            var path = NODEFS.realPath(node);
            try {
                path = fs.readlinkSync(path);
                path = NODEJS_PATH.relative(NODEJS_PATH.resolve(node.mount.opts.root), path);
                return path
            } catch (e) {
                if (!e.code) throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        }
    }, stream_ops: {
        open: function (stream) {
            var path = NODEFS.realPath(stream.node);
            try {
                if (FS.isFile(stream.node.mode)) {
                    stream.nfd = fs.openSync(path, NODEFS.flagsForNode(stream.flags))
                }
            } catch (e) {
                if (!e.code) throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        }, close: function (stream) {
            try {
                if (FS.isFile(stream.node.mode) && stream.nfd) {
                    fs.closeSync(stream.nfd)
                }
            } catch (e) {
                if (!e.code) throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        }, read: function (stream, buffer, offset, length, position) {
            if (length === 0) return 0;
            try {
                return fs.readSync(stream.nfd, NODEFS.bufferFrom(buffer.buffer), offset, length, position)
            } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        }, write: function (stream, buffer, offset, length, position) {
            try {
                return fs.writeSync(stream.nfd, NODEFS.bufferFrom(buffer.buffer), offset, length, position)
            } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        }, llseek: function (stream, offset, whence) {
            var position = offset;
            if (whence === 1) {
                position += stream.position
            } else if (whence === 2) {
                if (FS.isFile(stream.node.mode)) {
                    try {
                        var stat = fs.fstatSync(stream.nfd);
                        position += stat.size
                    } catch (e) {
                        throw new FS.ErrnoError(ERRNO_CODES[e.code])
                    }
                }
            }
            if (position < 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
            }
            return position
        }
    }
};
var WORKERFS = {
    DIR_MODE: 16895, FILE_MODE: 33279, reader: null, mount: function (mount) {
        assert(ENVIRONMENT_IS_WORKER);
        if (!WORKERFS.reader) WORKERFS.reader = new FileReaderSync;
        var root = WORKERFS.createNode(null, "/", WORKERFS.DIR_MODE, 0);
        var createdParents = {};

        function ensureParent(path) {
            var parts = path.split("/");
            var parent = root;
            for (var i = 0; i < parts.length - 1; i++) {
                var curr = parts.slice(0, i + 1).join("/");
                if (!createdParents[curr]) {
                    createdParents[curr] = WORKERFS.createNode(parent, parts[i], WORKERFS.DIR_MODE, 0)
                }
                parent = createdParents[curr]
            }
            return parent
        }

        function base(path) {
            var parts = path.split("/");
            return parts[parts.length - 1]
        }

        Array.prototype.forEach.call(mount.opts["files"] || [], function (file) {
            WORKERFS.createNode(ensureParent(file.name), base(file.name), WORKERFS.FILE_MODE, 0, file, file.lastModifiedDate)
        });
        (mount.opts["blobs"] || []).forEach(function (obj) {
            WORKERFS.createNode(ensureParent(obj["name"]), base(obj["name"]), WORKERFS.FILE_MODE, 0, obj["data"])
        });
        (mount.opts["packages"] || []).forEach(function (pack) {
            pack["metadata"].files.forEach(function (file) {
                var name = file.filename.substr(1);
                WORKERFS.createNode(ensureParent(name), base(name), WORKERFS.FILE_MODE, 0, pack["blob"].slice(file.start, file.end))
            })
        });
        return root
    }, createNode: function (parent, name, mode, dev, contents, mtime) {
        var node = FS.createNode(parent, name, mode);
        node.mode = mode;
        node.node_ops = WORKERFS.node_ops;
        node.stream_ops = WORKERFS.stream_ops;
        node.timestamp = (mtime || new Date).getTime();
        assert(WORKERFS.FILE_MODE !== WORKERFS.DIR_MODE);
        if (mode === WORKERFS.FILE_MODE) {
            node.size = contents.size;
            node.contents = contents
        } else {
            node.size = 4096;
            node.contents = {}
        }
        if (parent) {
            parent.contents[name] = node
        }
        return node
    }, node_ops: {
        getattr: function (node) {
            return {
                dev: 1,
                ino: undefined,
                mode: node.mode,
                nlink: 1,
                uid: 0,
                gid: 0,
                rdev: undefined,
                size: node.size,
                atime: new Date(node.timestamp),
                mtime: new Date(node.timestamp),
                ctime: new Date(node.timestamp),
                blksize: 4096,
                blocks: Math.ceil(node.size / 4096)
            }
        }, setattr: function (node, attr) {
            if (attr.mode !== undefined) {
                node.mode = attr.mode
            }
            if (attr.timestamp !== undefined) {
                node.timestamp = attr.timestamp
            }
        }, lookup: function (parent, name) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
        }, mknod: function (parent, name, mode, dev) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM)
        }, rename: function (oldNode, newDir, newName) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM)
        }, unlink: function (parent, name) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM)
        }, rmdir: function (parent, name) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM)
        }, readdir: function (node) {
            var entries = [".", ".."];
            for (var key in node.contents) {
                if (!node.contents.hasOwnProperty(key)) {
                    continue
                }
                entries.push(key)
            }
            return entries
        }, symlink: function (parent, newName, oldPath) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM)
        }, readlink: function (node) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM)
        }
    }, stream_ops: {
        read: function (stream, buffer, offset, length, position) {
            if (position >= stream.node.size) return 0;
            var chunk = stream.node.contents.slice(position, position + length);
            var ab = WORKERFS.reader.readAsArrayBuffer(chunk);
            buffer.set(new Uint8Array(ab), offset);
            return chunk.size
        }, write: function (stream, buffer, offset, length, position) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO)
        }, llseek: function (stream, offset, whence) {
            var position = offset;
            if (whence === 1) {
                position += stream.position
            } else if (whence === 2) {
                if (FS.isFile(stream.node.mode)) {
                    position += stream.node.size
                }
            }
            if (position < 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
            }
            return position
        }
    }
};
var ERRNO_MESSAGES = {
    0: "Success",
    1: "Not super-user",
    2: "No such file or directory",
    3: "No such process",
    4: "Interrupted system call",
    5: "I/O error",
    6: "No such device or address",
    7: "Arg list too long",
    8: "Exec format error",
    9: "Bad file number",
    10: "No children",
    11: "No more processes",
    12: "Not enough core",
    13: "Permission denied",
    14: "Bad address",
    15: "Block device required",
    16: "Mount device busy",
    17: "File exists",
    18: "Cross-device link",
    19: "No such device",
    20: "Not a directory",
    21: "Is a directory",
    22: "Invalid argument",
    23: "Too many open files in system",
    24: "Too many open files",
    25: "Not a typewriter",
    26: "Text file busy",
    27: "File too large",
    28: "No space left on device",
    29: "Illegal seek",
    30: "Read only file system",
    31: "Too many links",
    32: "Broken pipe",
    33: "Math arg out of domain of func",
    34: "Math result not representable",
    35: "File locking deadlock error",
    36: "File or path name too long",
    37: "No record locks available",
    38: "Function not implemented",
    39: "Directory not empty",
    40: "Too many symbolic links",
    42: "No message of desired type",
    43: "Identifier removed",
    44: "Channel number out of range",
    45: "Level 2 not synchronized",
    46: "Level 3 halted",
    47: "Level 3 reset",
    48: "Link number out of range",
    49: "Protocol driver not attached",
    50: "No CSI structure available",
    51: "Level 2 halted",
    52: "Invalid exchange",
    53: "Invalid request descriptor",
    54: "Exchange full",
    55: "No anode",
    56: "Invalid request code",
    57: "Invalid slot",
    59: "Bad font file fmt",
    60: "Device not a stream",
    61: "No data (for no delay io)",
    62: "Timer expired",
    63: "Out of streams resources",
    64: "Machine is not on the network",
    65: "Package not installed",
    66: "The object is remote",
    67: "The link has been severed",
    68: "Advertise error",
    69: "Srmount error",
    70: "Communication error on send",
    71: "Protocol error",
    72: "Multihop attempted",
    73: "Cross mount point (not really error)",
    74: "Trying to read unreadable message",
    75: "Value too large for defined data type",
    76: "Given log. name not unique",
    77: "f.d. invalid for this operation",
    78: "Remote address changed",
    79: "Can   access a needed shared lib",
    80: "Accessing a corrupted shared lib",
    81: ".lib section in a.out corrupted",
    82: "Attempting to link in too many libs",
    83: "Attempting to exec a shared library",
    84: "Illegal byte sequence",
    86: "Streams pipe error",
    87: "Too many users",
    88: "Socket operation on non-socket",
    89: "Destination address required",
    90: "Message too long",
    91: "Protocol wrong type for socket",
    92: "Protocol not available",
    93: "Unknown protocol",
    94: "Socket type not supported",
    95: "Not supported",
    96: "Protocol family not supported",
    97: "Address family not supported by protocol family",
    98: "Address already in use",
    99: "Address not available",
    100: "Network interface is not configured",
    101: "Network is unreachable",
    102: "Connection reset by network",
    103: "Connection aborted",
    104: "Connection reset by peer",
    105: "No buffer space available",
    106: "Socket is already connected",
    107: "Socket is not connected",
    108: "Can't send after socket shutdown",
    109: "Too many references",
    110: "Connection timed out",
    111: "Connection refused",
    112: "Host is down",
    113: "Host is unreachable",
    114: "Socket already connected",
    115: "Connection already in progress",
    116: "Stale file handle",
    122: "Quota exceeded",
    123: "No medium (in tape drive)",
    125: "Operation canceled",
    130: "Previous owner died",
    131: "State not recoverable"
};
var ERRNO_CODES = {
    EPERM: 1,
    ENOENT: 2,
    ESRCH: 3,
    EINTR: 4,
    EIO: 5,
    ENXIO: 6,
    E2BIG: 7,
    ENOEXEC: 8,
    EBADF: 9,
    ECHILD: 10,
    EAGAIN: 11,
    EWOULDBLOCK: 11,
    ENOMEM: 12,
    EACCES: 13,
    EFAULT: 14,
    ENOTBLK: 15,
    EBUSY: 16,
    EEXIST: 17,
    EXDEV: 18,
    ENODEV: 19,
    ENOTDIR: 20,
    EISDIR: 21,
    EINVAL: 22,
    ENFILE: 23,
    EMFILE: 24,
    ENOTTY: 25,
    ETXTBSY: 26,
    EFBIG: 27,
    ENOSPC: 28,
    ESPIPE: 29,
    EROFS: 30,
    EMLINK: 31,
    EPIPE: 32,
    EDOM: 33,
    ERANGE: 34,
    ENOMSG: 42,
    EIDRM: 43,
    ECHRNG: 44,
    EL2NSYNC: 45,
    EL3HLT: 46,
    EL3RST: 47,
    ELNRNG: 48,
    EUNATCH: 49,
    ENOCSI: 50,
    EL2HLT: 51,
    EDEADLK: 35,
    ENOLCK: 37,
    EBADE: 52,
    EBADR: 53,
    EXFULL: 54,
    ENOANO: 55,
    EBADRQC: 56,
    EBADSLT: 57,
    EDEADLOCK: 35,
    EBFONT: 59,
    ENOSTR: 60,
    ENODATA: 61,
    ETIME: 62,
    ENOSR: 63,
    ENONET: 64,
    ENOPKG: 65,
    EREMOTE: 66,
    ENOLINK: 67,
    EADV: 68,
    ESRMNT: 69,
    ECOMM: 70,
    EPROTO: 71,
    EMULTIHOP: 72,
    EDOTDOT: 73,
    EBADMSG: 74,
    ENOTUNIQ: 76,
    EBADFD: 77,
    EREMCHG: 78,
    ELIBACC: 79,
    ELIBBAD: 80,
    ELIBSCN: 81,
    ELIBMAX: 82,
    ELIBEXEC: 83,
    ENOSYS: 38,
    ENOTEMPTY: 39,
    ENAMETOOLONG: 36,
    ELOOP: 40,
    EOPNOTSUPP: 95,
    EPFNOSUPPORT: 96,
    ECONNRESET: 104,
    ENOBUFS: 105,
    EAFNOSUPPORT: 97,
    EPROTOTYPE: 91,
    ENOTSOCK: 88,
    ENOPROTOOPT: 92,
    ESHUTDOWN: 108,
    ECONNREFUSED: 111,
    EADDRINUSE: 98,
    ECONNABORTED: 103,
    ENETUNREACH: 101,
    ENETDOWN: 100,
    ETIMEDOUT: 110,
    EHOSTDOWN: 112,
    EHOSTUNREACH: 113,
    EINPROGRESS: 115,
    EALREADY: 114,
    EDESTADDRREQ: 89,
    EMSGSIZE: 90,
    EPROTONOSUPPORT: 93,
    ESOCKTNOSUPPORT: 94,
    EADDRNOTAVAIL: 99,
    ENETRESET: 102,
    EISCONN: 106,
    ENOTCONN: 107,
    ETOOMANYREFS: 109,
    EUSERS: 87,
    EDQUOT: 122,
    ESTALE: 116,
    ENOTSUP: 95,
    ENOMEDIUM: 123,
    EILSEQ: 84,
    EOVERFLOW: 75,
    ECANCELED: 125,
    ENOTRECOVERABLE: 131,
    EOWNERDEAD: 130,
    ESTRPIPE: 86
};
var FS = {
    root: null,
    mounts: [],
    devices: {},
    streams: [],
    nextInode: 1,
    nameTable: null,
    currentPath: "/",
    initialized: false,
    ignorePermissions: true,
    trackingDelegate: {},
    tracking: {openFlags: {READ: 1, WRITE: 2}},
    ErrnoError: null,
    genericErrors: {},
    filesystems: null,
    syncFSRequests: 0,
    handleFSError: function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + " : " + stackTrace();
        return ___setErrNo(e.errno)
    },
    lookupPath: function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
        if (!path) return {path: "", node: null};
        var defaults = {follow_mount: true, recurse_count: 0};
        for (var key in defaults) {
            if (opts[key] === undefined) {
                opts[key] = defaults[key]
            }
        }
        if (opts.recurse_count > 8) {
            throw new FS.ErrnoError(40)
        }
        var parts = PATH.normalizeArray(path.split("/").filter(function (p) {
            return !!p
        }), false);
        var current = FS.root;
        var current_path = "/";
        for (var i = 0; i < parts.length; i++) {
            var islast = i === parts.length - 1;
            if (islast && opts.parent) {
                break
            }
            current = FS.lookupNode(current, parts[i]);
            current_path = PATH.join2(current_path, parts[i]);
            if (FS.isMountpoint(current)) {
                if (!islast || islast && opts.follow_mount) {
                    current = current.mounted.root
                }
            }
            if (!islast || opts.follow) {
                var count = 0;
                while (FS.isLink(current.mode)) {
                    var link = FS.readlink(current_path);
                    current_path = PATH.resolve(PATH.dirname(current_path), link);
                    var lookup = FS.lookupPath(current_path, {recurse_count: opts.recurse_count});
                    current = lookup.node;
                    if (count++ > 40) {
                        throw new FS.ErrnoError(40)
                    }
                }
            }
        }
        return {path: current_path, node: current}
    },
    getPath: function (node) {
        var path;
        while (true) {
            if (FS.isRoot(node)) {
                var mount = node.mount.mountpoint;
                if (!path) return mount;
                return mount[mount.length - 1] !== "/" ? mount + "/" + path : mount + path
            }
            path = path ? node.name + "/" + path : node.name;
            node = node.parent
        }
    },
    hashName: function (parentid, name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
            hash = (hash << 5) - hash + name.charCodeAt(i) | 0
        }
        return (parentid + hash >>> 0) % FS.nameTable.length
    },
    hashAddNode: function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node
    },
    hashRemoveNode: function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
            FS.nameTable[hash] = node.name_next
        } else {
            var current = FS.nameTable[hash];
            while (current) {
                if (current.name_next === node) {
                    current.name_next = node.name_next;
                    break
                }
                current = current.name_next
            }
        }
    },
    lookupNode: function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
            throw new FS.ErrnoError(err, parent)
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
            var nodeName = node.name;
            if (node.parent.id === parent.id && nodeName === name) {
                return node
            }
        }
        return FS.lookup(parent, name)
    },
    createNode: function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
            FS.FSNode = function (parent, name, mode, rdev) {
                if (!parent) {
                    parent = this
                }
                this.parent = parent;
                this.mount = parent.mount;
                this.mounted = null;
                this.id = FS.nextInode++;
                this.name = name;
                this.mode = mode;
                this.node_ops = {};
                this.stream_ops = {};
                this.rdev = rdev
            };
            FS.FSNode.prototype = {};
            var readMode = 292 | 73;
            var writeMode = 146;
            Object.defineProperties(FS.FSNode.prototype, {
                read: {
                    get: function () {
                        return (this.mode & readMode) === readMode
                    }, set: function (val) {
                        val ? this.mode |= readMode : this.mode &= ~readMode
                    }
                }, write: {
                    get: function () {
                        return (this.mode & writeMode) === writeMode
                    }, set: function (val) {
                        val ? this.mode |= writeMode : this.mode &= ~writeMode
                    }
                }, isFolder: {
                    get: function () {
                        return FS.isDir(this.mode)
                    }
                }, isDevice: {
                    get: function () {
                        return FS.isChrdev(this.mode)
                    }
                }
            })
        }
        var node = new FS.FSNode(parent, name, mode, rdev);
        FS.hashAddNode(node);
        return node
    },
    destroyNode: function (node) {
        FS.hashRemoveNode(node)
    },
    isRoot: function (node) {
        return node === node.parent
    },
    isMountpoint: function (node) {
        return !!node.mounted
    },
    isFile: function (mode) {
        return (mode & 61440) === 32768
    },
    isDir: function (mode) {
        return (mode & 61440) === 16384
    },
    isLink: function (mode) {
        return (mode & 61440) === 40960
    },
    isChrdev: function (mode) {
        return (mode & 61440) === 8192
    },
    isBlkdev: function (mode) {
        return (mode & 61440) === 24576
    },
    isFIFO: function (mode) {
        return (mode & 61440) === 4096
    },
    isSocket: function (mode) {
        return (mode & 49152) === 49152
    },
    flagModes: {
        "r": 0,
        "rs": 1052672,
        "r+": 2,
        "w": 577,
        "wx": 705,
        "xw": 705,
        "w+": 578,
        "wx+": 706,
        "xw+": 706,
        "a": 1089,
        "ax": 1217,
        "xa": 1217,
        "a+": 1090,
        "ax+": 1218,
        "xa+": 1218
    },
    modeStringToFlags: function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === "undefined") {
            throw new Error("Unknown file open mode: " + str)
        }
        return flags
    },
    flagsToPermissionString: function (flag) {
        var perms = ["r", "w", "rw"][flag & 3];
        if (flag & 512) {
            perms += "w"
        }
        return perms
    },
    nodePermissions: function (node, perms) {
        if (FS.ignorePermissions) {
            return 0
        }
        if (perms.indexOf("r") !== -1 && !(node.mode & 292)) {
            return 13
        } else if (perms.indexOf("w") !== -1 && !(node.mode & 146)) {
            return 13
        } else if (perms.indexOf("x") !== -1 && !(node.mode & 73)) {
            return 13
        }
        return 0
    },
    mayLookup: function (dir) {
        var err = FS.nodePermissions(dir, "x");
        if (err) return err;
        if (!dir.node_ops.lookup) return 13;
        return 0
    },
    mayCreate: function (dir, name) {
        try {
            var node = FS.lookupNode(dir, name);
            return 17
        } catch (e) {
        }
        return FS.nodePermissions(dir, "wx")
    },
    mayDelete: function (dir, name, isdir) {
        var node;
        try {
            node = FS.lookupNode(dir, name)
        } catch (e) {
            return e.errno
        }
        var err = FS.nodePermissions(dir, "wx");
        if (err) {
            return err
        }
        if (isdir) {
            if (!FS.isDir(node.mode)) {
                return 20
            }
            if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
                return 16
            }
        } else {
            if (FS.isDir(node.mode)) {
                return 21
            }
        }
        return 0
    },
    mayOpen: function (node, flags) {
        if (!node) {
            return 2
        }
        if (FS.isLink(node.mode)) {
            return 40
        } else if (FS.isDir(node.mode)) {
            if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
                return 21
            }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags))
    },
    MAX_OPEN_FDS: 4096,
    nextfd: function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
            if (!FS.streams[fd]) {
                return fd
            }
        }
        throw new FS.ErrnoError(24)
    },
    getStream: function (fd) {
        return FS.streams[fd]
    },
    createStream: function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
            FS.FSStream = function () {
            };
            FS.FSStream.prototype = {};
            Object.defineProperties(FS.FSStream.prototype, {
                object: {
                    get: function () {
                        return this.node
                    }, set: function (val) {
                        this.node = val
                    }
                }, isRead: {
                    get: function () {
                        return (this.flags & 2097155) !== 1
                    }
                }, isWrite: {
                    get: function () {
                        return (this.flags & 2097155) !== 0
                    }
                }, isAppend: {
                    get: function () {
                        return this.flags & 1024
                    }
                }
            })
        }
        var newStream = new FS.FSStream;
        for (var p in stream) {
            newStream[p] = stream[p]
        }
        stream = newStream;
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream
    },
    closeStream: function (fd) {
        FS.streams[fd] = null
    },
    chrdev_stream_ops: {
        open: function (stream) {
            var device = FS.getDevice(stream.node.rdev);
            stream.stream_ops = device.stream_ops;
            if (stream.stream_ops.open) {
                stream.stream_ops.open(stream)
            }
        }, llseek: function () {
            throw new FS.ErrnoError(29)
        }
    },
    major: function (dev) {
        return dev >> 8
    },
    minor: function (dev) {
        return dev & 255
    },
    makedev: function (ma, mi) {
        return ma << 8 | mi
    },
    registerDevice: function (dev, ops) {
        FS.devices[dev] = {stream_ops: ops}
    },
    getDevice: function (dev) {
        return FS.devices[dev]
    },
    getMounts: function (mount) {
        var mounts = [];
        var check = [mount];
        while (check.length) {
            var m = check.pop();
            mounts.push(m);
            check.push.apply(check, m.mounts)
        }
        return mounts
    },
    syncfs: function (populate, callback) {
        if (typeof populate === "function") {
            callback = populate;
            populate = false
        }
        FS.syncFSRequests++;
        if (FS.syncFSRequests > 1) {
            console.log("warning: " + FS.syncFSRequests + " FS.syncfs operations in flight at once, probably just doing extra work")
        }
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;

        function doCallback(err) {
            assert(FS.syncFSRequests > 0);
            FS.syncFSRequests--;
            return callback(err)
        }

        function done(err) {
            if (err) {
                if (!done.errored) {
                    done.errored = true;
                    return doCallback(err)
                }
                return
            }
            if (++completed >= mounts.length) {
                doCallback(null)
            }
        }

        mounts.forEach(function (mount) {
            if (!mount.type.syncfs) {
                return done(null)
            }
            mount.type.syncfs(mount, populate, done)
        })
    },
    mount: function (type, opts, mountpoint) {
        var root = mountpoint === "/";
        var pseudo = !mountpoint;
        var node;
        if (root && FS.root) {
            throw new FS.ErrnoError(16)
        } else if (!root && !pseudo) {
            var lookup = FS.lookupPath(mountpoint, {follow_mount: false});
            mountpoint = lookup.path;
            node = lookup.node;
            if (FS.isMountpoint(node)) {
                throw new FS.ErrnoError(16)
            }
            if (!FS.isDir(node.mode)) {
                throw new FS.ErrnoError(20)
            }
        }
        var mount = {type: type, opts: opts, mountpoint: mountpoint, mounts: []};
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
        if (root) {
            FS.root = mountRoot
        } else if (node) {
            node.mounted = mount;
            if (node.mount) {
                node.mount.mounts.push(mount)
            }
        }
        return mountRoot
    },
    unmount: function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, {follow_mount: false});
        if (!FS.isMountpoint(lookup.node)) {
            throw new FS.ErrnoError(22)
        }
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
        Object.keys(FS.nameTable).forEach(function (hash) {
            var current = FS.nameTable[hash];
            while (current) {
                var next = current.name_next;
                if (mounts.indexOf(current.mount) !== -1) {
                    FS.destroyNode(current)
                }
                current = next
            }
        });
        node.mounted = null;
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1)
    },
    lookup: function (parent, name) {
        return parent.node_ops.lookup(parent, name)
    },
    mknod: function (path, mode, dev) {
        var lookup = FS.lookupPath(path, {parent: true});
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name || name === "." || name === "..") {
            throw new FS.ErrnoError(22)
        }
        var err = FS.mayCreate(parent, name);
        if (err) {
            throw new FS.ErrnoError(err)
        }
        if (!parent.node_ops.mknod) {
            throw new FS.ErrnoError(1)
        }
        return parent.node_ops.mknod(parent, name, mode, dev)
    },
    create: function (path, mode) {
        mode = mode !== undefined ? mode : 438;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0)
    },
    mkdir: function (path, mode) {
        mode = mode !== undefined ? mode : 511;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0)
    },
    mkdirTree: function (path, mode) {
        var dirs = path.split("/");
        var d = "";
        for (var i = 0; i < dirs.length; ++i) {
            if (!dirs[i]) continue;
            d += "/" + dirs[i];
            try {
                FS.mkdir(d, mode)
            } catch (e) {
                if (e.errno != 17) throw e
            }
        }
    },
    mkdev: function (path, mode, dev) {
        if (typeof dev === "undefined") {
            dev = mode;
            mode = 438
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev)
    },
    symlink: function (oldpath, newpath) {
        if (!PATH.resolve(oldpath)) {
            throw new FS.ErrnoError(2)
        }
        var lookup = FS.lookupPath(newpath, {parent: true});
        var parent = lookup.node;
        if (!parent) {
            throw new FS.ErrnoError(2)
        }
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
            throw new FS.ErrnoError(err)
        }
        if (!parent.node_ops.symlink) {
            throw new FS.ErrnoError(1)
        }
        return parent.node_ops.symlink(parent, newname, oldpath)
    },
    rename: function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        var lookup, old_dir, new_dir;
        try {
            lookup = FS.lookupPath(old_path, {parent: true});
            old_dir = lookup.node;
            lookup = FS.lookupPath(new_path, {parent: true});
            new_dir = lookup.node
        } catch (e) {
            throw new FS.ErrnoError(16)
        }
        if (!old_dir || !new_dir) throw new FS.ErrnoError(2);
        if (old_dir.mount !== new_dir.mount) {
            throw new FS.ErrnoError(18)
        }
        var old_node = FS.lookupNode(old_dir, old_name);
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== ".") {
            throw new FS.ErrnoError(22)
        }
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== ".") {
            throw new FS.ErrnoError(39)
        }
        var new_node;
        try {
            new_node = FS.lookupNode(new_dir, new_name)
        } catch (e) {
        }
        if (old_node === new_node) {
            return
        }
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
            throw new FS.ErrnoError(err)
        }
        err = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
        if (err) {
            throw new FS.ErrnoError(err)
        }
        if (!old_dir.node_ops.rename) {
            throw new FS.ErrnoError(1)
        }
        if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
            throw new FS.ErrnoError(16)
        }
        if (new_dir !== old_dir) {
            err = FS.nodePermissions(old_dir, "w");
            if (err) {
                throw new FS.ErrnoError(err)
            }
        }
        try {
            if (FS.trackingDelegate["willMovePath"]) {
                FS.trackingDelegate["willMovePath"](old_path, new_path)
            }
        } catch (e) {
            console.log("FS.trackingDelegate['willMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message)
        }
        FS.hashRemoveNode(old_node);
        try {
            old_dir.node_ops.rename(old_node, new_dir, new_name)
        } catch (e) {
            throw e
        } finally {
            FS.hashAddNode(old_node)
        }
        try {
            if (FS.trackingDelegate["onMovePath"]) FS.trackingDelegate["onMovePath"](old_path, new_path)
        } catch (e) {
            console.log("FS.trackingDelegate['onMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message)
        }
    },
    rmdir: function (path) {
        var lookup = FS.lookupPath(path, {parent: true});
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
            throw new FS.ErrnoError(err)
        }
        if (!parent.node_ops.rmdir) {
            throw new FS.ErrnoError(1)
        }
        if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(16)
        }
        try {
            if (FS.trackingDelegate["willDeletePath"]) {
                FS.trackingDelegate["willDeletePath"](path)
            }
        } catch (e) {
            console.log("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message)
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
        try {
            if (FS.trackingDelegate["onDeletePath"]) FS.trackingDelegate["onDeletePath"](path)
        } catch (e) {
            console.log("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message)
        }
    },
    readdir: function (path) {
        var lookup = FS.lookupPath(path, {follow: true});
        var node = lookup.node;
        if (!node.node_ops.readdir) {
            throw new FS.ErrnoError(20)
        }
        return node.node_ops.readdir(node)
    },
    unlink: function (path) {
        var lookup = FS.lookupPath(path, {parent: true});
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
            throw new FS.ErrnoError(err)
        }
        if (!parent.node_ops.unlink) {
            throw new FS.ErrnoError(1)
        }
        if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(16)
        }
        try {
            if (FS.trackingDelegate["willDeletePath"]) {
                FS.trackingDelegate["willDeletePath"](path)
            }
        } catch (e) {
            console.log("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message)
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
        try {
            if (FS.trackingDelegate["onDeletePath"]) FS.trackingDelegate["onDeletePath"](path)
        } catch (e) {
            console.log("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message)
        }
    },
    readlink: function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
            throw new FS.ErrnoError(2)
        }
        if (!link.node_ops.readlink) {
            throw new FS.ErrnoError(22)
        }
        return PATH.resolve(FS.getPath(link.parent), link.node_ops.readlink(link))
    },
    stat: function (path, dontFollow) {
        var lookup = FS.lookupPath(path, {follow: !dontFollow});
        var node = lookup.node;
        if (!node) {
            throw new FS.ErrnoError(2)
        }
        if (!node.node_ops.getattr) {
            throw new FS.ErrnoError(1)
        }
        return node.node_ops.getattr(node)
    },
    lstat: function (path) {
        return FS.stat(path, true)
    },
    chmod: function (path, mode, dontFollow) {
        var node;
        if (typeof path === "string") {
            var lookup = FS.lookupPath(path, {follow: !dontFollow});
            node = lookup.node
        } else {
            node = path
        }
        if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(1)
        }
        node.node_ops.setattr(node, {mode: mode & 4095 | node.mode & ~4095, timestamp: Date.now()})
    },
    lchmod: function (path, mode) {
        FS.chmod(path, mode, true)
    },
    fchmod: function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
            throw new FS.ErrnoError(9)
        }
        FS.chmod(stream.node, mode)
    },
    chown: function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === "string") {
            var lookup = FS.lookupPath(path, {follow: !dontFollow});
            node = lookup.node
        } else {
            node = path
        }
        if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(1)
        }
        node.node_ops.setattr(node, {timestamp: Date.now()})
    },
    lchown: function (path, uid, gid) {
        FS.chown(path, uid, gid, true)
    },
    fchown: function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
            throw new FS.ErrnoError(9)
        }
        FS.chown(stream.node, uid, gid)
    },
    truncate: function (path, len) {
        if (len < 0) {
            throw new FS.ErrnoError(22)
        }
        var node;
        if (typeof path === "string") {
            var lookup = FS.lookupPath(path, {follow: true});
            node = lookup.node
        } else {
            node = path
        }
        if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(1)
        }
        if (FS.isDir(node.mode)) {
            throw new FS.ErrnoError(21)
        }
        if (!FS.isFile(node.mode)) {
            throw new FS.ErrnoError(22)
        }
        var err = FS.nodePermissions(node, "w");
        if (err) {
            throw new FS.ErrnoError(err)
        }
        node.node_ops.setattr(node, {size: len, timestamp: Date.now()})
    },
    ftruncate: function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
            throw new FS.ErrnoError(9)
        }
        if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(22)
        }
        FS.truncate(stream.node, len)
    },
    utime: function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, {follow: true});
        var node = lookup.node;
        node.node_ops.setattr(node, {timestamp: Math.max(atime, mtime)})
    },
    open: function (path, flags, mode, fd_start, fd_end) {
        if (path === "") {
            throw new FS.ErrnoError(2)
        }
        flags = typeof flags === "string" ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === "undefined" ? 438 : mode;
        if (flags & 64) {
            mode = mode & 4095 | 32768
        } else {
            mode = 0
        }
        var node;
        if (typeof path === "object") {
            node = path
        } else {
            path = PATH.normalize(path);
            try {
                var lookup = FS.lookupPath(path, {follow: !(flags & 131072)});
                node = lookup.node
            } catch (e) {
            }
        }
        var created = false;
        if (flags & 64) {
            if (node) {
                if (flags & 128) {
                    throw new FS.ErrnoError(17)
                }
            } else {
                node = FS.mknod(path, mode, 0);
                created = true
            }
        }
        if (!node) {
            throw new FS.ErrnoError(2)
        }
        if (FS.isChrdev(node.mode)) {
            flags &= ~512
        }
        if (flags & 65536 && !FS.isDir(node.mode)) {
            throw new FS.ErrnoError(20)
        }
        if (!created) {
            var err = FS.mayOpen(node, flags);
            if (err) {
                throw new FS.ErrnoError(err)
            }
        }
        if (flags & 512) {
            FS.truncate(node, 0)
        }
        flags &= ~(128 | 512);
        var stream = FS.createStream({
            node: node,
            path: FS.getPath(node),
            flags: flags,
            seekable: true,
            position: 0,
            stream_ops: node.stream_ops,
            ungotten: [],
            error: false
        }, fd_start, fd_end);
        if (stream.stream_ops.open) {
            stream.stream_ops.open(stream)
        }
        if (Module["logReadFiles"] && !(flags & 1)) {
            if (!FS.readFiles) FS.readFiles = {};
            if (!(path in FS.readFiles)) {
                FS.readFiles[path] = 1;
                console.log("FS.trackingDelegate error on read file: " + path)
            }
        }
        try {
            if (FS.trackingDelegate["onOpenFile"]) {
                var trackingFlags = 0;
                if ((flags & 2097155) !== 1) {
                    trackingFlags |= FS.tracking.openFlags.READ
                }
                if ((flags & 2097155) !== 0) {
                    trackingFlags |= FS.tracking.openFlags.WRITE
                }
                FS.trackingDelegate["onOpenFile"](path, trackingFlags)
            }
        } catch (e) {
            console.log("FS.trackingDelegate['onOpenFile']('" + path + "', flags) threw an exception: " + e.message)
        }
        return stream
    },
    close: function (stream) {
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(9)
        }
        if (stream.getdents) stream.getdents = null;
        try {
            if (stream.stream_ops.close) {
                stream.stream_ops.close(stream)
            }
        } catch (e) {
            throw e
        } finally {
            FS.closeStream(stream.fd)
        }
        stream.fd = null
    },
    isClosed: function (stream) {
        return stream.fd === null
    },
    llseek: function (stream, offset, whence) {
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(9)
        }
        if (!stream.seekable || !stream.stream_ops.llseek) {
            throw new FS.ErrnoError(29)
        }
        if (whence != 0 && whence != 1 && whence != 2) {
            throw new FS.ErrnoError(22)
        }
        stream.position = stream.stream_ops.llseek(stream, offset, whence);
        stream.ungotten = [];
        return stream.position
    },
    read: function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
            throw new FS.ErrnoError(22)
        }
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(9)
        }
        if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(9)
        }
        if (FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(21)
        }
        if (!stream.stream_ops.read) {
            throw new FS.ErrnoError(22)
        }
        var seeking = typeof position !== "undefined";
        if (!seeking) {
            position = stream.position
        } else if (!stream.seekable) {
            throw new FS.ErrnoError(29)
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead
    },
    write: function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
            throw new FS.ErrnoError(22)
        }
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(9)
        }
        if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(9)
        }
        if (FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(21)
        }
        if (!stream.stream_ops.write) {
            throw new FS.ErrnoError(22)
        }
        if (stream.flags & 1024) {
            FS.llseek(stream, 0, 2)
        }
        var seeking = typeof position !== "undefined";
        if (!seeking) {
            position = stream.position
        } else if (!stream.seekable) {
            throw new FS.ErrnoError(29)
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        try {
            if (stream.path && FS.trackingDelegate["onWriteToFile"]) FS.trackingDelegate["onWriteToFile"](stream.path)
        } catch (e) {
            console.log("FS.trackingDelegate['onWriteToFile']('" + stream.path + "') threw an exception: " + e.message)
        }
        return bytesWritten
    },
    allocate: function (stream, offset, length) {
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(9)
        }
        if (offset < 0 || length <= 0) {
            throw new FS.ErrnoError(22)
        }
        if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(9)
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(19)
        }
        if (!stream.stream_ops.allocate) {
            throw new FS.ErrnoError(95)
        }
        stream.stream_ops.allocate(stream, offset, length)
    },
    mmap: function (stream, buffer, offset, length, position, prot, flags) {
        if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(13)
        }
        if (!stream.stream_ops.mmap) {
            throw new FS.ErrnoError(19)
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags)
    },
    msync: function (stream, buffer, offset, length, mmapFlags) {
        if (!stream || !stream.stream_ops.msync) {
            return 0
        }
        return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags)
    },
    munmap: function (stream) {
        return 0
    },
    ioctl: function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
            throw new FS.ErrnoError(25)
        }
        return stream.stream_ops.ioctl(stream, cmd, arg)
    },
    readFile: function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || "r";
        opts.encoding = opts.encoding || "binary";
        if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
            throw new Error('Invalid encoding type "' + opts.encoding + '"')
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === "utf8") {
            ret = UTF8ArrayToString(buf, 0)
        } else if (opts.encoding === "binary") {
            ret = buf
        }
        FS.close(stream);
        return ret
    },
    writeFile: function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || "w";
        var stream = FS.open(path, opts.flags, opts.mode);
        if (typeof data === "string") {
            var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
            var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
            FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn)
        } else if (ArrayBuffer.isView(data)) {
            FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn)
        } else {
            throw new Error("Unsupported data type")
        }
        FS.close(stream)
    },
    cwd: function () {
        return FS.currentPath
    },
    chdir: function (path) {
        var lookup = FS.lookupPath(path, {follow: true});
        if (lookup.node === null) {
            throw new FS.ErrnoError(2)
        }
        if (!FS.isDir(lookup.node.mode)) {
            throw new FS.ErrnoError(20)
        }
        var err = FS.nodePermissions(lookup.node, "x");
        if (err) {
            throw new FS.ErrnoError(err)
        }
        FS.currentPath = lookup.path
    },
    createDefaultDirectories: function () {
        FS.mkdir("/tmp");
        FS.mkdir("/home");
        FS.mkdir("/home/web_user")
    },
    createDefaultDevices: function () {
        FS.mkdir("/dev");
        FS.registerDevice(FS.makedev(1, 3), {
            read: function () {
                return 0
            }, write: function (stream, buffer, offset, length, pos) {
                return length
            }
        });
        FS.mkdev("/dev/null", FS.makedev(1, 3));
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev("/dev/tty", FS.makedev(5, 0));
        FS.mkdev("/dev/tty1", FS.makedev(6, 0));
        var random_device;
        if (typeof crypto === "object" && typeof crypto["getRandomValues"] === "function") {
            var randomBuffer = new Uint8Array(1);
            random_device = function () {
                crypto.getRandomValues(randomBuffer);
                return randomBuffer[0]
            }
        } else if (ENVIRONMENT_IS_NODE) {
            try {
                var crypto_module = require("crypto");
                random_device = function () {
                    return crypto_module["randomBytes"](1)[0]
                }
            } catch (e) {
                random_device = function () {
                    return Math.random() * 256 | 0
                }
            }
        } else {
            random_device = function () {
                abort("random_device")
            }
        }
        FS.createDevice("/dev", "random", random_device);
        FS.createDevice("/dev", "urandom", random_device);
        FS.mkdir("/dev/shm");
        FS.mkdir("/dev/shm/tmp")
    },
    createSpecialDirectories: function () {
        FS.mkdir("/proc");
        FS.mkdir("/proc/self");
        FS.mkdir("/proc/self/fd");
        FS.mount({
            mount: function () {
                var node = FS.createNode("/proc/self", "fd", 16384 | 511, 73);
                node.node_ops = {
                    lookup: function (parent, name) {
                        var fd = +name;
                        var stream = FS.getStream(fd);
                        if (!stream) throw new FS.ErrnoError(9);
                        var ret = {
                            parent: null, mount: {mountpoint: "fake"}, node_ops: {
                                readlink: function () {
                                    return stream.path
                                }
                            }
                        };
                        ret.parent = ret;
                        return ret
                    }
                };
                return node
            }
        }, {}, "/proc/self/fd")
    },
    createStandardStreams: function () {
        if (Module["stdin"]) {
            FS.createDevice("/dev", "stdin", Module["stdin"])
        } else {
            FS.symlink("/dev/tty", "/dev/stdin")
        }
        if (Module["stdout"]) {
            FS.createDevice("/dev", "stdout", null, Module["stdout"])
        } else {
            FS.symlink("/dev/tty", "/dev/stdout")
        }
        if (Module["stderr"]) {
            FS.createDevice("/dev", "stderr", null, Module["stderr"])
        } else {
            FS.symlink("/dev/tty1", "/dev/stderr")
        }
        var stdin = FS.open("/dev/stdin", "r");
        var stdout = FS.open("/dev/stdout", "w");
        var stderr = FS.open("/dev/stderr", "w");
        assert(stdin.fd === 0, "invalid handle for stdin (" + stdin.fd + ")");
        assert(stdout.fd === 1, "invalid handle for stdout (" + stdout.fd + ")");
        assert(stderr.fd === 2, "invalid handle for stderr (" + stderr.fd + ")")
    },
    ensureErrnoError: function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno, node) {
            this.node = node;
            this.setErrno = function (errno) {
                this.errno = errno;
                for (var key in ERRNO_CODES) {
                    if (ERRNO_CODES[key] === errno) {
                        this.code = key;
                        break
                    }
                }
            };
            this.setErrno(errno);
            this.message = ERRNO_MESSAGES[errno];
            if (this.stack) Object.defineProperty(this, "stack", {value: (new Error).stack, writable: true});
            if (this.stack) this.stack = demangleAll(this.stack)
        };
        FS.ErrnoError.prototype = new Error;
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        [2].forEach(function (code) {
            FS.genericErrors[code] = new FS.ErrnoError(code);
            FS.genericErrors[code].stack = "<generic error, no stack>"
        })
    },
    staticInit: function () {
        FS.ensureErrnoError();
        FS.nameTable = new Array(4096);
        FS.mount(MEMFS, {}, "/");
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
        FS.filesystems = {"MEMFS": MEMFS, "IDBFS": IDBFS, "NODEFS": NODEFS, "WORKERFS": WORKERFS}
    },
    init: function (input, output, error) {
        assert(!FS.init.initialized, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");
        FS.init.initialized = true;
        FS.ensureErrnoError();
        Module["stdin"] = input || Module["stdin"];
        Module["stdout"] = output || Module["stdout"];
        Module["stderr"] = error || Module["stderr"];
        FS.createStandardStreams()
    },
    quit: function () {
        FS.init.initialized = false;
        var fflush = Module["_fflush"];
        if (fflush) fflush(0);
        for (var i = 0; i < FS.streams.length; i++) {
            var stream = FS.streams[i];
            if (!stream) {
                continue
            }
            FS.close(stream)
        }
    },
    getMode: function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode
    },
    joinPath: function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == "/") path = path.substr(1);
        return path
    },
    absolutePath: function (relative, base) {
        return PATH.resolve(base, relative)
    },
    standardizePath: function (path) {
        return PATH.normalize(path)
    },
    findObject: function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
            return ret.object
        } else {
            ___setErrNo(ret.error);
            return null
        }
    },
    analyzePath: function (path, dontResolveLastLink) {
        try {
            var lookup = FS.lookupPath(path, {follow: !dontResolveLastLink});
            path = lookup.path
        } catch (e) {
        }
        var ret = {
            isRoot: false,
            exists: false,
            error: 0,
            name: null,
            path: null,
            object: null,
            parentExists: false,
            parentPath: null,
            parentObject: null
        };
        try {
            var lookup = FS.lookupPath(path, {parent: true});
            ret.parentExists = true;
            ret.parentPath = lookup.path;
            ret.parentObject = lookup.node;
            ret.name = PATH.basename(path);
            lookup = FS.lookupPath(path, {follow: !dontResolveLastLink});
            ret.exists = true;
            ret.path = lookup.path;
            ret.object = lookup.node;
            ret.name = lookup.node.name;
            ret.isRoot = lookup.path === "/"
        } catch (e) {
            ret.error = e.errno
        }
        return ret
    },
    createFolder: function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode)
    },
    createPath: function (parent, path, canRead, canWrite) {
        parent = typeof parent === "string" ? parent : FS.getPath(parent);
        var parts = path.split("/").reverse();
        while (parts.length) {
            var part = parts.pop();
            if (!part) continue;
            var current = PATH.join2(parent, part);
            try {
                FS.mkdir(current)
            } catch (e) {
            }
            parent = current
        }
        return current
    },
    createFile: function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode)
    },
    createDataFile: function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
            if (typeof data === "string") {
                var arr = new Array(data.length);
                for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
                data = arr
            }
            FS.chmod(node, mode | 146);
            var stream = FS.open(node, "w");
            FS.write(stream, data, 0, data.length, 0, canOwn);
            FS.close(stream);
            FS.chmod(node, mode)
        }
        return node
    },
    createDevice: function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        FS.registerDevice(dev, {
            open: function (stream) {
                stream.seekable = false
            }, close: function (stream) {
                if (output && output.buffer && output.buffer.length) {
                    output(10)
                }
            }, read: function (stream, buffer, offset, length, pos) {
                var bytesRead = 0;
                for (var i = 0; i < length; i++) {
                    var result;
                    try {
                        result = input()
                    } catch (e) {
                        throw new FS.ErrnoError(5)
                    }
                    if (result === undefined && bytesRead === 0) {
                        throw new FS.ErrnoError(11)
                    }
                    if (result === null || result === undefined) break;
                    bytesRead++;
                    buffer[offset + i] = result
                }
                if (bytesRead) {
                    stream.node.timestamp = Date.now()
                }
                return bytesRead
            }, write: function (stream, buffer, offset, length, pos) {
                for (var i = 0; i < length; i++) {
                    try {
                        output(buffer[offset + i])
                    } catch (e) {
                        throw new FS.ErrnoError(5)
                    }
                }
                if (length) {
                    stream.node.timestamp = Date.now()
                }
                return i
            }
        });
        return FS.mkdev(path, mode, dev)
    },
    createLink: function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path)
    },
    forceLoadFile: function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== "undefined") {
            throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.")
        } else if (Module["read"]) {
            try {
                obj.contents = intArrayFromString(Module["read"](obj.url), true);
                obj.usedBytes = obj.contents.length
            } catch (e) {
                success = false
            }
        } else {
            throw new Error("Cannot load without read() or XMLHttpRequest.")
        }
        if (!success) ___setErrNo(5);
        return success
    },
    createLazyFile: function (parent, name, url, canRead, canWrite) {
        function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []
        }

        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length - 1 || idx < 0) {
                return undefined
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = idx / this.chunkSize | 0;
            return this.getter(chunkNum)[chunkOffset]
        };
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter
        };
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
            var xhr = new XMLHttpRequest;
            xhr.open("HEAD", url, false);
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            var datalength = Number(xhr.getResponseHeader("Content-length"));
            var header;
            var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
            var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
            var chunkSize = 1024 * 1024;
            if (!hasByteServing) chunkSize = datalength;
            var doXHR = function (from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
                var xhr = new XMLHttpRequest;
                xhr.open("GET", url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                if (typeof Uint8Array != "undefined") xhr.responseType = "arraybuffer";
                if (xhr.overrideMimeType) {
                    xhr.overrideMimeType("text/plain; charset=x-user-defined")
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                    return new Uint8Array(xhr.response || [])
                } else {
                    return intArrayFromString(xhr.responseText || "", true)
                }
            };
            var lazyArray = this;
            lazyArray.setDataGetter(function (chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum + 1) * chunkSize - 1;
                end = Math.min(end, datalength - 1);
                if (typeof lazyArray.chunks[chunkNum] === "undefined") {
                    lazyArray.chunks[chunkNum] = doXHR(start, end)
                }
                if (typeof lazyArray.chunks[chunkNum] === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum]
            });
            if (usesGzip || !datalength) {
                chunkSize = datalength = 1;
                datalength = this.getter(0).length;
                chunkSize = datalength;
                console.log("LazyFiles on gzip forces download of the whole file when length is accessed")
            }
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true
        };
        if (typeof XMLHttpRequest !== "undefined") {
            if (!ENVIRONMENT_IS_WORKER) throw"Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
            var lazyArray = new LazyUint8Array;
            Object.defineProperties(lazyArray, {
                length: {
                    get: function () {
                        if (!this.lengthKnown) {
                            this.cacheLength()
                        }
                        return this._length
                    }
                }, chunkSize: {
                    get: function () {
                        if (!this.lengthKnown) {
                            this.cacheLength()
                        }
                        return this._chunkSize
                    }
                }
            });
            var properties = {isDevice: false, contents: lazyArray}
        } else {
            var properties = {isDevice: false, url: url}
        }
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        if (properties.contents) {
            node.contents = properties.contents
        } else if (properties.url) {
            node.contents = null;
            node.url = properties.url
        }
        Object.defineProperties(node, {
            usedBytes: {
                get: function () {
                    return this.contents.length
                }
            }
        });
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function (key) {
            var fn = node.stream_ops[key];
            stream_ops[key] = function forceLoadLazyFile() {
                if (!FS.forceLoadFile(node)) {
                    throw new FS.ErrnoError(5)
                }
                return fn.apply(null, arguments)
            }
        });
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
            if (!FS.forceLoadFile(node)) {
                throw new FS.ErrnoError(5)
            }
            var contents = stream.node.contents;
            if (position >= contents.length) return 0;
            var size = Math.min(contents.length - position, length);
            assert(size >= 0);
            if (contents.slice) {
                for (var i = 0; i < size; i++) {
                    buffer[offset + i] = contents[position + i]
                }
            } else {
                for (var i = 0; i < size; i++) {
                    buffer[offset + i] = contents.get(position + i)
                }
            }
            return size
        };
        node.stream_ops = stream_ops;
        return node
    },
    createPreloadedFile: function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
        Browser.init();
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        var dep = getUniqueRunDependency("cp " + fullname);

        function processData(byteArray) {
            function finish(byteArray) {
                if (preFinish) preFinish();
                if (!dontCreateFile) {
                    FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn)
                }
                if (onload) onload();
                removeRunDependency(dep)
            }

            var handled = false;
            Module["preloadPlugins"].forEach(function (plugin) {
                if (handled) return;
                if (plugin["canHandle"](fullname)) {
                    plugin["handle"](byteArray, fullname, finish, function () {
                        if (onerror) onerror();
                        removeRunDependency(dep)
                    });
                    handled = true
                }
            });
            if (!handled) finish(byteArray)
        }

        addRunDependency(dep);
        if (typeof url == "string") {
            Browser.asyncLoad(url, function (byteArray) {
                processData(byteArray)
            }, onerror)
        } else {
            processData(url)
        }
    },
    indexedDB: function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
    },
    DB_NAME: function () {
        return "EM_FS_" + window.location.pathname
    },
    DB_VERSION: 20,
    DB_STORE_NAME: "FILE_DATA",
    saveFilesToDB: function (paths, onload, onerror) {
        onload = onload || function () {
        };
        onerror = onerror || function () {
        };
        var indexedDB = FS.indexedDB();
        try {
            var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION)
        } catch (e) {
            return onerror(e)
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
            console.log("creating db");
            var db = openRequest.result;
            db.createObjectStore(FS.DB_STORE_NAME)
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
            var db = openRequest.result;
            var transaction = db.transaction([FS.DB_STORE_NAME], "readwrite");
            var files = transaction.objectStore(FS.DB_STORE_NAME);
            var ok = 0, fail = 0, total = paths.length;

            function finish() {
                if (fail == 0) onload(); else onerror()
            }

            paths.forEach(function (path) {
                var putRequest = files.put(FS.analyzePath(path).object.contents, path);
                putRequest.onsuccess = function putRequest_onsuccess() {
                    ok++;
                    if (ok + fail == total) finish()
                };
                putRequest.onerror = function putRequest_onerror() {
                    fail++;
                    if (ok + fail == total) finish()
                }
            });
            transaction.onerror = onerror
        };
        openRequest.onerror = onerror
    },
    loadFilesFromDB: function (paths, onload, onerror) {
        onload = onload || function () {
        };
        onerror = onerror || function () {
        };
        var indexedDB = FS.indexedDB();
        try {
            var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION)
        } catch (e) {
            return onerror(e)
        }
        openRequest.onupgradeneeded = onerror;
        openRequest.onsuccess = function openRequest_onsuccess() {
            var db = openRequest.result;
            try {
                var transaction = db.transaction([FS.DB_STORE_NAME], "readonly")
            } catch (e) {
                onerror(e);
                return
            }
            var files = transaction.objectStore(FS.DB_STORE_NAME);
            var ok = 0, fail = 0, total = paths.length;

            function finish() {
                if (fail == 0) onload(); else onerror()
            }

            paths.forEach(function (path) {
                var getRequest = files.get(path);
                getRequest.onsuccess = function getRequest_onsuccess() {
                    if (FS.analyzePath(path).exists) {
                        FS.unlink(path)
                    }
                    FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
                    ok++;
                    if (ok + fail == total) finish()
                };
                getRequest.onerror = function getRequest_onerror() {
                    fail++;
                    if (ok + fail == total) finish()
                }
            });
            transaction.onerror = onerror
        };
        openRequest.onerror = onerror
    }
};
var SYSCALLS = {
    DEFAULT_POLLMASK: 5, mappings: {}, umask: 511, calculateAt: function (dirfd, path) {
        if (path[0] !== "/") {
            var dir;
            if (dirfd === -100) {
                dir = FS.cwd()
            } else {
                var dirstream = FS.getStream(dirfd);
                if (!dirstream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
                dir = dirstream.path
            }
            path = PATH.join2(dir, path)
        }
        return path
    }, doStat: function (func, path, buf) {
        try {
            var stat = func(path)
        } catch (e) {
            if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
                return -ERRNO_CODES.ENOTDIR
            }
            throw e
        }
        HEAP32[buf >> 2] = stat.dev;
        HEAP32[buf + 4 >> 2] = 0;
        HEAP32[buf + 8 >> 2] = stat.ino;
        HEAP32[buf + 12 >> 2] = stat.mode;
        HEAP32[buf + 16 >> 2] = stat.nlink;
        HEAP32[buf + 20 >> 2] = stat.uid;
        HEAP32[buf + 24 >> 2] = stat.gid;
        HEAP32[buf + 28 >> 2] = stat.rdev;
        HEAP32[buf + 32 >> 2] = 0;
        HEAP32[buf + 36 >> 2] = stat.size;
        HEAP32[buf + 40 >> 2] = 4096;
        HEAP32[buf + 44 >> 2] = stat.blocks;
        HEAP32[buf + 48 >> 2] = stat.atime.getTime() / 1e3 | 0;
        HEAP32[buf + 52 >> 2] = 0;
        HEAP32[buf + 56 >> 2] = stat.mtime.getTime() / 1e3 | 0;
        HEAP32[buf + 60 >> 2] = 0;
        HEAP32[buf + 64 >> 2] = stat.ctime.getTime() / 1e3 | 0;
        HEAP32[buf + 68 >> 2] = 0;
        HEAP32[buf + 72 >> 2] = stat.ino;
        return 0
    }, doMsync: function (addr, stream, len, flags) {
        var buffer = new Uint8Array(HEAPU8.subarray(addr, addr + len));
        FS.msync(stream, buffer, 0, len, flags)
    }, doMkdir: function (path, mode) {
        path = PATH.normalize(path);
        if (path[path.length - 1] === "/") path = path.substr(0, path.length - 1);
        FS.mkdir(path, mode, 0);
        return 0
    }, doMknod: function (path, mode, dev) {
        switch (mode & 61440) {
            case 32768:
            case 8192:
            case 24576:
            case 4096:
            case 49152:
                break;
            default:
                return -ERRNO_CODES.EINVAL
        }
        FS.mknod(path, mode, dev);
        return 0
    }, doReadlink: function (path, buf, bufsize) {
        if (bufsize <= 0) return -ERRNO_CODES.EINVAL;
        var ret = FS.readlink(path);
        var len = Math.min(bufsize, lengthBytesUTF8(ret));
        var endChar = HEAP8[buf + len];
        stringToUTF8(ret, buf, bufsize + 1);
        HEAP8[buf + len] = endChar;
        return len
    }, doAccess: function (path, amode) {
        if (amode & ~7) {
            return -ERRNO_CODES.EINVAL
        }
        var node;
        var lookup = FS.lookupPath(path, {follow: true});
        node = lookup.node;
        var perms = "";
        if (amode & 4) perms += "r";
        if (amode & 2) perms += "w";
        if (amode & 1) perms += "x";
        if (perms && FS.nodePermissions(node, perms)) {
            return -ERRNO_CODES.EACCES
        }
        return 0
    }, doDup: function (path, flags, suggestFD) {
        var suggest = FS.getStream(suggestFD);
        if (suggest) FS.close(suggest);
        return FS.open(path, flags, 0, suggestFD, suggestFD).fd
    }, doReadv: function (stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
            var ptr = HEAP32[iov + i * 8 >> 2];
            var len = HEAP32[iov + (i * 8 + 4) >> 2];
            var curr = FS.read(stream, HEAP8, ptr, len, offset);
            if (curr < 0) return -1;
            ret += curr;
            if (curr < len) break
        }
        return ret
    }, doWritev: function (stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
            var ptr = HEAP32[iov + i * 8 >> 2];
            var len = HEAP32[iov + (i * 8 + 4) >> 2];
            var curr = FS.write(stream, HEAP8, ptr, len, offset);
            if (curr < 0) return -1;
            ret += curr
        }
        return ret
    }, varargs: 0, get: function (varargs) {
        SYSCALLS.varargs += 4;
        var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
        return ret
    }, getStr: function () {
        var ret = UTF8ToString(SYSCALLS.get());
        return ret
    }, getStreamFromFD: function () {
        var stream = FS.getStream(SYSCALLS.get());
        if (!stream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        return stream
    }, getSocketFromFD: function () {
        var socket = SOCKFS.getSocket(SYSCALLS.get());
        if (!socket) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        return socket
    }, getSocketAddress: function (allowNull) {
        var addrp = SYSCALLS.get(), addrlen = SYSCALLS.get();
        if (allowNull && addrp === 0) return null;
        var info = __read_sockaddr(addrp, addrlen);
        if (info.errno) throw new FS.ErrnoError(info.errno);
        info.addr = DNS.lookup_addr(info.addr) || info.addr;
        return info
    }, get64: function () {
        var low = SYSCALLS.get(), high = SYSCALLS.get();
        if (low >= 0) assert(high === 0); else assert(high === -1);
        return low
    }, getZero: function () {
        assert(SYSCALLS.get() === 0)
    }
};

function ___syscall10(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var path = SYSCALLS.getStr();
        FS.unlink(path);
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

var SOCKFS = {
    mount: function (mount) {
        Module["websocket"] = Module["websocket"] && "object" === typeof Module["websocket"] ? Module["websocket"] : {};
        Module["websocket"]._callbacks = {};
        Module["websocket"]["on"] = function (event, callback) {
            if ("function" === typeof callback) {
                this._callbacks[event] = callback
            }
            return this
        };
        Module["websocket"].emit = function (event, param) {
            if ("function" === typeof this._callbacks[event]) {
                this._callbacks[event].call(this, param)
            }
        };
        return FS.createNode(null, "/", 16384 | 511, 0)
    }, createSocket: function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
            assert(streaming == (protocol == 6))
        }
        var sock = {
            family: family,
            type: type,
            protocol: protocol,
            server: null,
            error: null,
            peers: {},
            pending: [],
            recv_queue: [],
            sock_ops: SOCKFS.websocket_sock_ops
        };
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
        var stream = FS.createStream({
            path: name,
            node: node,
            flags: FS.modeStringToFlags("r+"),
            seekable: false,
            stream_ops: SOCKFS.stream_ops
        });
        sock.stream = stream;
        return sock
    }, getSocket: function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
            return null
        }
        return stream.node.sock
    }, stream_ops: {
        poll: function (stream) {
            var sock = stream.node.sock;
            return sock.sock_ops.poll(sock)
        }, ioctl: function (stream, request, varargs) {
            var sock = stream.node.sock;
            return sock.sock_ops.ioctl(sock, request, varargs)
        }, read: function (stream, buffer, offset, length, position) {
            var sock = stream.node.sock;
            var msg = sock.sock_ops.recvmsg(sock, length);
            if (!msg) {
                return 0
            }
            buffer.set(msg.buffer, offset);
            return msg.buffer.length
        }, write: function (stream, buffer, offset, length, position) {
            var sock = stream.node.sock;
            return sock.sock_ops.sendmsg(sock, buffer, offset, length)
        }, close: function (stream) {
            var sock = stream.node.sock;
            sock.sock_ops.close(sock)
        }
    }, nextname: function () {
        if (!SOCKFS.nextname.current) {
            SOCKFS.nextname.current = 0
        }
        return "socket[" + SOCKFS.nextname.current++ + "]"
    }, websocket_sock_ops: {
        createPeer: function (sock, addr, port) {
            var ws;
            if (typeof addr === "object") {
                ws = addr;
                addr = null;
                port = null
            }
            if (ws) {
                if (ws._socket) {
                    addr = ws._socket.remoteAddress;
                    port = ws._socket.remotePort
                } else {
                    var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
                    if (!result) {
                        throw new Error("WebSocket URL must be in the format ws(s)://address:port")
                    }
                    addr = result[1];
                    port = parseInt(result[2], 10)
                }
            } else {
                try {
                    var runtimeConfig = Module["websocket"] && "object" === typeof Module["websocket"];
                    var url = "ws:#".replace("#", "//");
                    if (runtimeConfig) {
                        if ("string" === typeof Module["websocket"]["url"]) {
                            url = Module["websocket"]["url"]
                        }
                    }
                    if (url === "ws://" || url === "wss://") {
                        var parts = addr.split("/");
                        url = url + parts[0] + ":" + port + "/" + parts.slice(1).join("/")
                    }
                    var subProtocols = "binary";
                    if (runtimeConfig) {
                        if ("string" === typeof Module["websocket"]["subprotocol"]) {
                            subProtocols = Module["websocket"]["subprotocol"]
                        }
                    }
                    subProtocols = subProtocols.replace(/^ +| +$/g, "").split(/ *, */);
                    var opts = ENVIRONMENT_IS_NODE ? {"protocol": subProtocols.toString()} : subProtocols;
                    if (runtimeConfig && null === Module["websocket"]["subprotocol"]) {
                        subProtocols = "null";
                        opts = undefined
                    }
                    var WebSocketConstructor;
                    if (ENVIRONMENT_IS_NODE) {
                        WebSocketConstructor = require("ws")
                    } else if (ENVIRONMENT_IS_WEB) {
                        WebSocketConstructor = window["WebSocket"]
                    } else {
                        WebSocketConstructor = WebSocket
                    }
                    ws = new WebSocketConstructor(url, opts);
                    ws.binaryType = "arraybuffer"
                } catch (e) {
                    throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH)
                }
            }
            var peer = {addr: addr, port: port, socket: ws, dgram_send_queue: []};
            SOCKFS.websocket_sock_ops.addPeer(sock, peer);
            SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
            if (sock.type === 2 && typeof sock.sport !== "undefined") {
                peer.dgram_send_queue.push(new Uint8Array([255, 255, 255, 255, "p".charCodeAt(0), "o".charCodeAt(0), "r".charCodeAt(0), "t".charCodeAt(0), (sock.sport & 65280) >> 8, sock.sport & 255]))
            }
            return peer
        }, getPeer: function (sock, addr, port) {
            return sock.peers[addr + ":" + port]
        }, addPeer: function (sock, peer) {
            sock.peers[peer.addr + ":" + peer.port] = peer
        }, removePeer: function (sock, peer) {
            delete sock.peers[peer.addr + ":" + peer.port]
        }, handlePeerEvents: function (sock, peer) {
            var first = true;
            var handleOpen = function () {
                Module["websocket"].emit("open", sock.stream.fd);
                try {
                    var queued = peer.dgram_send_queue.shift();
                    while (queued) {
                        peer.socket.send(queued);
                        queued = peer.dgram_send_queue.shift()
                    }
                } catch (e) {
                    peer.socket.close()
                }
            };

            function handleMessage(data) {
                assert(typeof data !== "string" && data.byteLength !== undefined);
                if (data.byteLength == 0) {
                    return
                }
                data = new Uint8Array(data);
                var wasfirst = first;
                first = false;
                if (wasfirst && data.length === 10 && data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 && data[4] === "p".charCodeAt(0) && data[5] === "o".charCodeAt(0) && data[6] === "r".charCodeAt(0) && data[7] === "t".charCodeAt(0)) {
                    var newport = data[8] << 8 | data[9];
                    SOCKFS.websocket_sock_ops.removePeer(sock, peer);
                    peer.port = newport;
                    SOCKFS.websocket_sock_ops.addPeer(sock, peer);
                    return
                }
                sock.recv_queue.push({addr: peer.addr, port: peer.port, data: data});
                Module["websocket"].emit("message", sock.stream.fd)
            }

            if (ENVIRONMENT_IS_NODE) {
                peer.socket.on("open", handleOpen);
                peer.socket.on("message", function (data, flags) {
                    if (!flags.binary) {
                        return
                    }
                    handleMessage(new Uint8Array(data).buffer)
                });
                peer.socket.on("close", function () {
                    Module["websocket"].emit("close", sock.stream.fd)
                });
                peer.socket.on("error", function (error) {
                    sock.error = ERRNO_CODES.ECONNREFUSED;
                    Module["websocket"].emit("error", [sock.stream.fd, sock.error, "ECONNREFUSED: Connection refused"])
                })
            } else {
                peer.socket.onopen = handleOpen;
                peer.socket.onclose = function () {
                    Module["websocket"].emit("close", sock.stream.fd)
                };
                peer.socket.onmessage = function peer_socket_onmessage(event) {
                    handleMessage(event.data)
                };
                peer.socket.onerror = function (error) {
                    sock.error = ERRNO_CODES.ECONNREFUSED;
                    Module["websocket"].emit("error", [sock.stream.fd, sock.error, "ECONNREFUSED: Connection refused"])
                }
            }
        }, poll: function (sock) {
            if (sock.type === 1 && sock.server) {
                return sock.pending.length ? 64 | 1 : 0
            }
            var mask = 0;
            var dest = sock.type === 1 ? SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) : null;
            if (sock.recv_queue.length || !dest || dest && dest.socket.readyState === dest.socket.CLOSING || dest && dest.socket.readyState === dest.socket.CLOSED) {
                mask |= 64 | 1
            }
            if (!dest || dest && dest.socket.readyState === dest.socket.OPEN) {
                mask |= 4
            }
            if (dest && dest.socket.readyState === dest.socket.CLOSING || dest && dest.socket.readyState === dest.socket.CLOSED) {
                mask |= 16
            }
            return mask
        }, ioctl: function (sock, request, arg) {
            switch (request) {
                case 21531:
                    var bytes = 0;
                    if (sock.recv_queue.length) {
                        bytes = sock.recv_queue[0].data.length
                    }
                    HEAP32[arg >> 2] = bytes;
                    return 0;
                default:
                    return ERRNO_CODES.EINVAL
            }
        }, close: function (sock) {
            if (sock.server) {
                try {
                    sock.server.close()
                } catch (e) {
                }
                sock.server = null
            }
            var peers = Object.keys(sock.peers);
            for (var i = 0; i < peers.length; i++) {
                var peer = sock.peers[peers[i]];
                try {
                    peer.socket.close()
                } catch (e) {
                }
                SOCKFS.websocket_sock_ops.removePeer(sock, peer)
            }
            return 0
        }, bind: function (sock, addr, port) {
            if (typeof sock.saddr !== "undefined" || typeof sock.sport !== "undefined") {
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
            }
            sock.saddr = addr;
            sock.sport = port;
            if (sock.type === 2) {
                if (sock.server) {
                    sock.server.close();
                    sock.server = null
                }
                try {
                    sock.sock_ops.listen(sock, 0)
                } catch (e) {
                    if (!(e instanceof FS.ErrnoError)) throw e;
                    if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e
                }
            }
        }, connect: function (sock, addr, port) {
            if (sock.server) {
                throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP)
            }
            if (typeof sock.daddr !== "undefined" && typeof sock.dport !== "undefined") {
                var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
                if (dest) {
                    if (dest.socket.readyState === dest.socket.CONNECTING) {
                        throw new FS.ErrnoError(ERRNO_CODES.EALREADY)
                    } else {
                        throw new FS.ErrnoError(ERRNO_CODES.EISCONN)
                    }
                }
            }
            var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
            sock.daddr = peer.addr;
            sock.dport = peer.port;
            throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS)
        }, listen: function (sock, backlog) {
            if (!ENVIRONMENT_IS_NODE) {
                throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP)
            }
            if (sock.server) {
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
            }
            var WebSocketServer = require("ws").Server;
            var host = sock.saddr;
            sock.server = new WebSocketServer({host: host, port: sock.sport});
            Module["websocket"].emit("listen", sock.stream.fd);
            sock.server.on("connection", function (ws) {
                if (sock.type === 1) {
                    var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
                    var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
                    newsock.daddr = peer.addr;
                    newsock.dport = peer.port;
                    sock.pending.push(newsock);
                    Module["websocket"].emit("connection", newsock.stream.fd)
                } else {
                    SOCKFS.websocket_sock_ops.createPeer(sock, ws);
                    Module["websocket"].emit("connection", sock.stream.fd)
                }
            });
            sock.server.on("closed", function () {
                Module["websocket"].emit("close", sock.stream.fd);
                sock.server = null
            });
            sock.server.on("error", function (error) {
                sock.error = ERRNO_CODES.EHOSTUNREACH;
                Module["websocket"].emit("error", [sock.stream.fd, sock.error, "EHOSTUNREACH: Host is unreachable"])
            })
        }, accept: function (listensock) {
            if (!listensock.server) {
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
            }
            var newsock = listensock.pending.shift();
            newsock.stream.flags = listensock.stream.flags;
            return newsock
        }, getname: function (sock, peer) {
            var addr, port;
            if (peer) {
                if (sock.daddr === undefined || sock.dport === undefined) {
                    throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN)
                }
                addr = sock.daddr;
                port = sock.dport
            } else {
                addr = sock.saddr || 0;
                port = sock.sport || 0
            }
            return {addr: addr, port: port}
        }, sendmsg: function (sock, buffer, offset, length, addr, port) {
            if (sock.type === 2) {
                if (addr === undefined || port === undefined) {
                    addr = sock.daddr;
                    port = sock.dport
                }
                if (addr === undefined || port === undefined) {
                    throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ)
                }
            } else {
                addr = sock.daddr;
                port = sock.dport
            }
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
            if (sock.type === 1) {
                if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                    throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN)
                } else if (dest.socket.readyState === dest.socket.CONNECTING) {
                    throw new FS.ErrnoError(ERRNO_CODES.EAGAIN)
                }
            }
            if (ArrayBuffer.isView(buffer)) {
                offset += buffer.byteOffset;
                buffer = buffer.buffer
            }
            var data;
            data = buffer.slice(offset, offset + length);
            if (sock.type === 2) {
                if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
                    if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                        dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port)
                    }
                    dest.dgram_send_queue.push(data);
                    return length
                }
            }
            try {
                dest.socket.send(data);
                return length
            } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
            }
        }, recvmsg: function (sock, length) {
            if (sock.type === 1 && sock.server) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN)
            }
            var queued = sock.recv_queue.shift();
            if (!queued) {
                if (sock.type === 1) {
                    var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
                    if (!dest) {
                        throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN)
                    } else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                        return null
                    } else {
                        throw new FS.ErrnoError(ERRNO_CODES.EAGAIN)
                    }
                } else {
                    throw new FS.ErrnoError(ERRNO_CODES.EAGAIN)
                }
            }
            var queuedLength = queued.data.byteLength || queued.data.length;
            var queuedOffset = queued.data.byteOffset || 0;
            var queuedBuffer = queued.data.buffer || queued.data;
            var bytesRead = Math.min(length, queuedLength);
            var res = {
                buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
                addr: queued.addr,
                port: queued.port
            };
            if (sock.type === 1 && bytesRead < queuedLength) {
                var bytesRemaining = queuedLength - bytesRead;
                queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
                sock.recv_queue.unshift(queued)
            }
            return res
        }
    }
};

function __inet_pton4_raw(str) {
    var b = str.split(".");
    for (var i = 0; i < 4; i++) {
        var tmp = Number(b[i]);
        if (isNaN(tmp)) return null;
        b[i] = tmp
    }
    return (b[0] | b[1] << 8 | b[2] << 16 | b[3] << 24) >>> 0
}

function __inet_pton6_raw(str) {
    var words;
    var w, offset, z;
    var valid6regx = /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i;
    var parts = [];
    if (!valid6regx.test(str)) {
        return null
    }
    if (str === "::") {
        return [0, 0, 0, 0, 0, 0, 0, 0]
    }
    if (str.indexOf("::") === 0) {
        str = str.replace("::", "Z:")
    } else {
        str = str.replace("::", ":Z:")
    }
    if (str.indexOf(".") > 0) {
        str = str.replace(new RegExp("[.]", "g"), ":");
        words = str.split(":");
        words[words.length - 4] = parseInt(words[words.length - 4]) + parseInt(words[words.length - 3]) * 256;
        words[words.length - 3] = parseInt(words[words.length - 2]) + parseInt(words[words.length - 1]) * 256;
        words = words.slice(0, words.length - 2)
    } else {
        words = str.split(":")
    }
    offset = 0;
    z = 0;
    for (w = 0; w < words.length; w++) {
        if (typeof words[w] === "string") {
            if (words[w] === "Z") {
                for (z = 0; z < 8 - words.length + 1; z++) {
                    parts[w + z] = 0
                }
                offset = z - 1
            } else {
                parts[w + offset] = _htons(parseInt(words[w], 16))
            }
        } else {
            parts[w + offset] = words[w]
        }
    }
    return [parts[1] << 16 | parts[0], parts[3] << 16 | parts[2], parts[5] << 16 | parts[4], parts[7] << 16 | parts[6]]
}

var DNS = {
    address_map: {id: 1, addrs: {}, names: {}}, lookup_name: function (name) {
        var res = __inet_pton4_raw(name);
        if (res !== null) {
            return name
        }
        res = __inet_pton6_raw(name);
        if (res !== null) {
            return name
        }
        var addr;
        if (DNS.address_map.addrs[name]) {
            addr = DNS.address_map.addrs[name]
        } else {
            var id = DNS.address_map.id++;
            assert(id < 65535, "exceeded max address mappings of 65535");
            addr = "172.29." + (id & 255) + "." + (id & 65280);
            DNS.address_map.names[addr] = name;
            DNS.address_map.addrs[name] = addr
        }
        return addr
    }, lookup_addr: function (addr) {
        if (DNS.address_map.names[addr]) {
            return DNS.address_map.names[addr]
        }
        return null
    }
};

function __inet_ntop4_raw(addr) {
    return (addr & 255) + "." + (addr >> 8 & 255) + "." + (addr >> 16 & 255) + "." + (addr >> 24 & 255)
}

function __inet_ntop6_raw(ints) {
    var str = "";
    var word = 0;
    var longest = 0;
    var lastzero = 0;
    var zstart = 0;
    var len = 0;
    var i = 0;
    var parts = [ints[0] & 65535, ints[0] >> 16, ints[1] & 65535, ints[1] >> 16, ints[2] & 65535, ints[2] >> 16, ints[3] & 65535, ints[3] >> 16];
    var hasipv4 = true;
    var v4part = "";
    for (i = 0; i < 5; i++) {
        if (parts[i] !== 0) {
            hasipv4 = false;
            break
        }
    }
    if (hasipv4) {
        v4part = __inet_ntop4_raw(parts[6] | parts[7] << 16);
        if (parts[5] === -1) {
            str = "::ffff:";
            str += v4part;
            return str
        }
        if (parts[5] === 0) {
            str = "::";
            if (v4part === "0.0.0.0") v4part = "";
            if (v4part === "0.0.0.1") v4part = "1";
            str += v4part;
            return str
        }
    }
    for (word = 0; word < 8; word++) {
        if (parts[word] === 0) {
            if (word - lastzero > 1) {
                len = 0
            }
            lastzero = word;
            len++
        }
        if (len > longest) {
            longest = len;
            zstart = word - longest + 1
        }
    }
    for (word = 0; word < 8; word++) {
        if (longest > 1) {
            if (parts[word] === 0 && word >= zstart && word < zstart + longest) {
                if (word === zstart) {
                    str += ":";
                    if (zstart === 0) str += ":"
                }
                continue
            }
        }
        str += Number(_ntohs(parts[word] & 65535)).toString(16);
        str += word < 7 ? ":" : ""
    }
    return str
}

function __read_sockaddr(sa, salen) {
    var family = HEAP16[sa >> 1];
    var port = _ntohs(HEAP16[sa + 2 >> 1]);
    var addr;
    switch (family) {
        case 2:
            if (salen !== 16) {
                return {errno: 22}
            }
            addr = HEAP32[sa + 4 >> 2];
            addr = __inet_ntop4_raw(addr);
            break;
        case 10:
            if (salen !== 28) {
                return {errno: 22}
            }
            addr = [HEAP32[sa + 8 >> 2], HEAP32[sa + 12 >> 2], HEAP32[sa + 16 >> 2], HEAP32[sa + 20 >> 2]];
            addr = __inet_ntop6_raw(addr);
            break;
        default:
            return {errno: 97}
    }
    return {family: family, addr: addr, port: port}
}

function __write_sockaddr(sa, family, addr, port) {
    switch (family) {
        case 2:
            addr = __inet_pton4_raw(addr);
            HEAP16[sa >> 1] = family;
            HEAP32[sa + 4 >> 2] = addr;
            HEAP16[sa + 2 >> 1] = _htons(port);
            break;
        case 10:
            addr = __inet_pton6_raw(addr);
            HEAP32[sa >> 2] = family;
            HEAP32[sa + 8 >> 2] = addr[0];
            HEAP32[sa + 12 >> 2] = addr[1];
            HEAP32[sa + 16 >> 2] = addr[2];
            HEAP32[sa + 20 >> 2] = addr[3];
            HEAP16[sa + 2 >> 1] = _htons(port);
            HEAP32[sa + 4 >> 2] = 0;
            HEAP32[sa + 24 >> 2] = 0;
            break;
        default:
            return {errno: 97}
    }
    return {}
}

function ___syscall102(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var call = SYSCALLS.get(), socketvararg = SYSCALLS.get();
        SYSCALLS.varargs = socketvararg;
        switch (call) {
            case 1: {
                var domain = SYSCALLS.get(), type = SYSCALLS.get(), protocol = SYSCALLS.get();
                var sock = SOCKFS.createSocket(domain, type, protocol);
                assert(sock.stream.fd < 64);
                return sock.stream.fd
            }
            case 2: {
                var sock = SYSCALLS.getSocketFromFD(), info = SYSCALLS.getSocketAddress();
                sock.sock_ops.bind(sock, info.addr, info.port);
                return 0
            }
            case 3: {
                var sock = SYSCALLS.getSocketFromFD(), info = SYSCALLS.getSocketAddress();
                sock.sock_ops.connect(sock, info.addr, info.port);
                return 0
            }
            case 4: {
                var sock = SYSCALLS.getSocketFromFD(), backlog = SYSCALLS.get();
                sock.sock_ops.listen(sock, backlog);
                return 0
            }
            case 5: {
                var sock = SYSCALLS.getSocketFromFD(), addr = SYSCALLS.get(), addrlen = SYSCALLS.get();
                var newsock = sock.sock_ops.accept(sock);
                if (addr) {
                    var res = __write_sockaddr(addr, newsock.family, DNS.lookup_name(newsock.daddr), newsock.dport);
                    assert(!res.errno)
                }
                return newsock.stream.fd
            }
            case 6: {
                var sock = SYSCALLS.getSocketFromFD(), addr = SYSCALLS.get(), addrlen = SYSCALLS.get();
                var res = __write_sockaddr(addr, sock.family, DNS.lookup_name(sock.saddr || "0.0.0.0"), sock.sport);
                assert(!res.errno);
                return 0
            }
            case 7: {
                var sock = SYSCALLS.getSocketFromFD(), addr = SYSCALLS.get(), addrlen = SYSCALLS.get();
                if (!sock.daddr) {
                    return -ERRNO_CODES.ENOTCONN
                }
                var res = __write_sockaddr(addr, sock.family, DNS.lookup_name(sock.daddr), sock.dport);
                assert(!res.errno);
                return 0
            }
            case 11: {
                var sock = SYSCALLS.getSocketFromFD(), message = SYSCALLS.get(), length = SYSCALLS.get(),
                    flags = SYSCALLS.get(), dest = SYSCALLS.getSocketAddress(true);
                if (!dest) {
                    return FS.write(sock.stream, HEAP8, message, length)
                } else {
                    return sock.sock_ops.sendmsg(sock, HEAP8, message, length, dest.addr, dest.port)
                }
            }
            case 12: {
                var sock = SYSCALLS.getSocketFromFD(), buf = SYSCALLS.get(), len = SYSCALLS.get(),
                    flags = SYSCALLS.get(), addr = SYSCALLS.get(), addrlen = SYSCALLS.get();
                var msg = sock.sock_ops.recvmsg(sock, len);
                if (!msg) return 0;
                if (addr) {
                    var res = __write_sockaddr(addr, sock.family, DNS.lookup_name(msg.addr), msg.port);
                    assert(!res.errno)
                }
                HEAPU8.set(msg.buffer, buf);
                return msg.buffer.byteLength
            }
            case 14: {
                return -ERRNO_CODES.ENOPROTOOPT
            }
            case 15: {
                var sock = SYSCALLS.getSocketFromFD(), level = SYSCALLS.get(), optname = SYSCALLS.get(),
                    optval = SYSCALLS.get(), optlen = SYSCALLS.get();
                if (level === 1) {
                    if (optname === 4) {
                        HEAP32[optval >> 2] = sock.error;
                        HEAP32[optlen >> 2] = 4;
                        sock.error = null;
                        return 0
                    }
                }
                return -ERRNO_CODES.ENOPROTOOPT
            }
            case 16: {
                var sock = SYSCALLS.getSocketFromFD(), message = SYSCALLS.get(), flags = SYSCALLS.get();
                var iov = HEAP32[message + 8 >> 2];
                var num = HEAP32[message + 12 >> 2];
                var addr, port;
                var name = HEAP32[message >> 2];
                var namelen = HEAP32[message + 4 >> 2];
                if (name) {
                    var info = __read_sockaddr(name, namelen);
                    if (info.errno) return -info.errno;
                    port = info.port;
                    addr = DNS.lookup_addr(info.addr) || info.addr
                }
                var total = 0;
                for (var i = 0; i < num; i++) {
                    total += HEAP32[iov + (8 * i + 4) >> 2]
                }
                var view = new Uint8Array(total);
                var offset = 0;
                for (var i = 0; i < num; i++) {
                    var iovbase = HEAP32[iov + (8 * i + 0) >> 2];
                    var iovlen = HEAP32[iov + (8 * i + 4) >> 2];
                    for (var j = 0; j < iovlen; j++) {
                        view[offset++] = HEAP8[iovbase + j >> 0]
                    }
                }
                return sock.sock_ops.sendmsg(sock, view, 0, total, addr, port)
            }
            case 17: {
                var sock = SYSCALLS.getSocketFromFD(), message = SYSCALLS.get(), flags = SYSCALLS.get();
                var iov = HEAP32[message + 8 >> 2];
                var num = HEAP32[message + 12 >> 2];
                var total = 0;
                for (var i = 0; i < num; i++) {
                    total += HEAP32[iov + (8 * i + 4) >> 2]
                }
                var msg = sock.sock_ops.recvmsg(sock, total);
                if (!msg) return 0;
                var name = HEAP32[message >> 2];
                if (name) {
                    var res = __write_sockaddr(name, sock.family, DNS.lookup_name(msg.addr), msg.port);
                    assert(!res.errno)
                }
                var bytesRead = 0;
                var bytesRemaining = msg.buffer.byteLength;
                for (var i = 0; bytesRemaining > 0 && i < num; i++) {
                    var iovbase = HEAP32[iov + (8 * i + 0) >> 2];
                    var iovlen = HEAP32[iov + (8 * i + 4) >> 2];
                    if (!iovlen) {
                        continue
                    }
                    var length = Math.min(iovlen, bytesRemaining);
                    var buf = msg.buffer.subarray(bytesRead, bytesRead + length);
                    HEAPU8.set(buf, iovbase + bytesRead);
                    bytesRead += length;
                    bytesRemaining -= length
                }
                return bytesRead
            }
            default:
                abort("unsupported socketcall syscall " + call)
        }
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall114(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        abort("cannot wait on child processes")
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall12(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var path = SYSCALLS.getStr();
        FS.chdir(path);
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall140(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD(), offset_high = SYSCALLS.get(), offset_low = SYSCALLS.get(),
            result = SYSCALLS.get(), whence = SYSCALLS.get();
        var offset = offset_low;
        FS.llseek(stream, offset, whence);
        HEAP32[result >> 2] = stream.position;
        if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall142(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var nfds = SYSCALLS.get(), readfds = SYSCALLS.get(), writefds = SYSCALLS.get(), exceptfds = SYSCALLS.get(),
            timeout = SYSCALLS.get();
        assert(nfds <= 64, "nfds must be less than or equal to 64");
        assert(!exceptfds, "exceptfds not supported");
        var total = 0;
        var srcReadLow = readfds ? HEAP32[readfds >> 2] : 0, srcReadHigh = readfds ? HEAP32[readfds + 4 >> 2] : 0;
        var srcWriteLow = writefds ? HEAP32[writefds >> 2] : 0, srcWriteHigh = writefds ? HEAP32[writefds + 4 >> 2] : 0;
        var srcExceptLow = exceptfds ? HEAP32[exceptfds >> 2] : 0,
            srcExceptHigh = exceptfds ? HEAP32[exceptfds + 4 >> 2] : 0;
        var dstReadLow = 0, dstReadHigh = 0;
        var dstWriteLow = 0, dstWriteHigh = 0;
        var dstExceptLow = 0, dstExceptHigh = 0;
        var allLow = (readfds ? HEAP32[readfds >> 2] : 0) | (writefds ? HEAP32[writefds >> 2] : 0) | (exceptfds ? HEAP32[exceptfds >> 2] : 0);
        var allHigh = (readfds ? HEAP32[readfds + 4 >> 2] : 0) | (writefds ? HEAP32[writefds + 4 >> 2] : 0) | (exceptfds ? HEAP32[exceptfds + 4 >> 2] : 0);

        function check(fd, low, high, val) {
            return fd < 32 ? low & val : high & val
        }

        for (var fd = 0; fd < nfds; fd++) {
            var mask = 1 << fd % 32;
            if (!check(fd, allLow, allHigh, mask)) {
                continue
            }
            var stream = FS.getStream(fd);
            if (!stream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
            var flags = SYSCALLS.DEFAULT_POLLMASK;
            if (stream.stream_ops.poll) {
                flags = stream.stream_ops.poll(stream)
            }
            if (flags & 1 && check(fd, srcReadLow, srcReadHigh, mask)) {
                fd < 32 ? dstReadLow = dstReadLow | mask : dstReadHigh = dstReadHigh | mask;
                total++
            }
            if (flags & 4 && check(fd, srcWriteLow, srcWriteHigh, mask)) {
                fd < 32 ? dstWriteLow = dstWriteLow | mask : dstWriteHigh = dstWriteHigh | mask;
                total++
            }
            if (flags & 2 && check(fd, srcExceptLow, srcExceptHigh, mask)) {
                fd < 32 ? dstExceptLow = dstExceptLow | mask : dstExceptHigh = dstExceptHigh | mask;
                total++
            }
        }
        if (readfds) {
            HEAP32[readfds >> 2] = dstReadLow;
            HEAP32[readfds + 4 >> 2] = dstReadHigh
        }
        if (writefds) {
            HEAP32[writefds >> 2] = dstWriteLow;
            HEAP32[writefds + 4 >> 2] = dstWriteHigh
        }
        if (exceptfds) {
            HEAP32[exceptfds >> 2] = dstExceptLow;
            HEAP32[exceptfds + 4 >> 2] = dstExceptHigh
        }
        return total
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall145(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get();
        return SYSCALLS.doReadv(stream, iov, iovcnt)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall146(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get();
        return SYSCALLS.doWritev(stream, iov, iovcnt)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall183(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var buf = SYSCALLS.get(), size = SYSCALLS.get();
        if (size === 0) return -ERRNO_CODES.EINVAL;
        var cwd = FS.cwd();
        var cwdLengthInBytes = lengthBytesUTF8(cwd);
        if (size < cwdLengthInBytes + 1) return -ERRNO_CODES.ERANGE;
        stringToUTF8(cwd, buf, size);
        return buf
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall195(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var path = SYSCALLS.getStr(), buf = SYSCALLS.get();
        return SYSCALLS.doStat(FS.stat, path, buf)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall197(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD(), buf = SYSCALLS.get();
        return SYSCALLS.doStat(FS.stat, stream.path, buf)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall202(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall199(a0, a1) {
    return ___syscall202(a0, a1)
}

var PROCINFO = {ppid: 1, pid: 42, sid: 42, pgid: 42};

function ___syscall20(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        return PROCINFO.pid
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall200(a0, a1) {
    return ___syscall202(a0, a1)
}

function ___syscall220(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD(), dirp = SYSCALLS.get(), count = SYSCALLS.get();
        if (!stream.getdents) {
            stream.getdents = FS.readdir(stream.path)
        }
        var pos = 0;
        while (stream.getdents.length > 0 && pos + 268 <= count) {
            var id;
            var type;
            var name = stream.getdents.pop();
            if (name[0] === ".") {
                id = 1;
                type = 4
            } else {
                var child = FS.lookupNode(stream.node, name);
                id = child.id;
                type = FS.isChrdev(child.mode) ? 2 : FS.isDir(child.mode) ? 4 : FS.isLink(child.mode) ? 10 : 8
            }
            HEAP32[dirp + pos >> 2] = id;
            HEAP32[dirp + pos + 4 >> 2] = stream.position;
            HEAP16[dirp + pos + 8 >> 1] = 268;
            HEAP8[dirp + pos + 10 >> 0] = type;
            stringToUTF8(name, dirp + pos + 11, 256);
            pos += 268
        }
        return pos
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall221(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD(), cmd = SYSCALLS.get();
        switch (cmd) {
            case 0: {
                var arg = SYSCALLS.get();
                if (arg < 0) {
                    return -ERRNO_CODES.EINVAL
                }
                var newStream;
                newStream = FS.open(stream.path, stream.flags, 0, arg);
                return newStream.fd
            }
            case 1:
            case 2:
                return 0;
            case 3:
                return stream.flags;
            case 4: {
                var arg = SYSCALLS.get();
                stream.flags |= arg;
                return 0
            }
            case 12: {
                var arg = SYSCALLS.get();
                var offset = 0;
                HEAP16[arg + offset >> 1] = 2;
                return 0
            }
            case 13:
            case 14:
                return 0;
            case 16:
            case 8:
                return -ERRNO_CODES.EINVAL;
            case 9:
                ___setErrNo(ERRNO_CODES.EINVAL);
                return -1;
            default: {
                return -ERRNO_CODES.EINVAL
            }
        }
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall3(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD(), buf = SYSCALLS.get(), count = SYSCALLS.get();
        return FS.read(stream, HEAP8, buf, count)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall33(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var path = SYSCALLS.getStr(), amode = SYSCALLS.get();
        return SYSCALLS.doAccess(path, amode)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall330(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var old = SYSCALLS.getStreamFromFD(), suggestFD = SYSCALLS.get(), flags = SYSCALLS.get();
        assert(!flags);
        if (old.fd === suggestFD) return -ERRNO_CODES.EINVAL;
        return SYSCALLS.doDup(old.path, old.flags, suggestFD)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall38(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var old_path = SYSCALLS.getStr(), new_path = SYSCALLS.getStr();
        FS.rename(old_path, new_path);
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall39(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var path = SYSCALLS.getStr(), mode = SYSCALLS.get();
        return SYSCALLS.doMkdir(path, mode)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall4(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD(), buf = SYSCALLS.get(), count = SYSCALLS.get();
        return FS.write(stream, HEAP8, buf, count)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall40(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var path = SYSCALLS.getStr();
        FS.rmdir(path);
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall5(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var pathname = SYSCALLS.getStr(), flags = SYSCALLS.get(), mode = SYSCALLS.get();
        var stream = FS.open(pathname, flags, mode);
        return stream.fd
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall54(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD(), op = SYSCALLS.get();
        switch (op) {
            case 21509:
            case 21505: {
                if (!stream.tty) return -ERRNO_CODES.ENOTTY;
                return 0
            }
            case 21510:
            case 21511:
            case 21512:
            case 21506:
            case 21507:
            case 21508: {
                if (!stream.tty) return -ERRNO_CODES.ENOTTY;
                return 0
            }
            case 21519: {
                if (!stream.tty) return -ERRNO_CODES.ENOTTY;
                var argp = SYSCALLS.get();
                HEAP32[argp >> 2] = 0;
                return 0
            }
            case 21520: {
                if (!stream.tty) return -ERRNO_CODES.ENOTTY;
                return -ERRNO_CODES.EINVAL
            }
            case 21531: {
                var argp = SYSCALLS.get();
                return FS.ioctl(stream, op, argp)
            }
            case 21523: {
                if (!stream.tty) return -ERRNO_CODES.ENOTTY;
                return 0
            }
            case 21524: {
                if (!stream.tty) return -ERRNO_CODES.ENOTTY;
                return 0
            }
            default:
                abort("bad ioctl syscall " + op)
        }
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall6(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD();
        FS.close(stream);
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall60(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var mask = SYSCALLS.get();
        var old = SYSCALLS.umask;
        SYSCALLS.umask = mask;
        return old
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall63(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var old = SYSCALLS.getStreamFromFD(), suggestFD = SYSCALLS.get();
        if (old.fd === suggestFD) return suggestFD;
        return SYSCALLS.doDup(old.path, old.flags, suggestFD)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall91(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var addr = SYSCALLS.get(), len = SYSCALLS.get();
        var info = SYSCALLS.mappings[addr];
        if (!info) return 0;
        if (len === info.len) {
            var stream = FS.getStream(info.fd);
            SYSCALLS.doMsync(addr, stream, len, info.flags);
            FS.munmap(stream);
            SYSCALLS.mappings[addr] = null;
            if (info.allocated) {
                _free(info.malloc)
            }
        }
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___unlock() {
}

function getShiftFromSize(size) {
    switch (size) {
        case 1:
            return 0;
        case 2:
            return 1;
        case 4:
            return 2;
        case 8:
            return 3;
        default:
            throw new TypeError("Unknown type size: " + size)
    }
}

function embind_init_charCodes() {
    var codes = new Array(256);
    for (var i = 0; i < 256; ++i) {
        codes[i] = String.fromCharCode(i)
    }
    embind_charCodes = codes
}

var embind_charCodes = undefined;

function readLatin1String(ptr) {
    var ret = "";
    var c = ptr;
    while (HEAPU8[c]) {
        ret += embind_charCodes[HEAPU8[c++]]
    }
    return ret
}

var awaitingDependencies = {};
var registeredTypes = {};
var typeDependencies = {};
var char_0 = 48;
var char_9 = 57;

function makeLegalFunctionName(name) {
    if (undefined === name) {
        return "_unknown"
    }
    name = name.replace(/[^a-zA-Z0-9_]/g, "$");
    var f = name.charCodeAt(0);
    if (f >= char_0 && f <= char_9) {
        return "_" + name
    } else {
        return name
    }
}

function createNamedFunction(name, body) {
    name = makeLegalFunctionName(name);
    return new Function("body", "return function " + name + "() {\n" + '    "use strict";' + "    return body.apply(this, arguments);\n" + "};\n")(body)
}

function extendError(baseErrorType, errorName) {
    var errorClass = createNamedFunction(errorName, function (message) {
        this.name = errorName;
        this.message = message;
        var stack = new Error(message).stack;
        if (stack !== undefined) {
            this.stack = this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "")
        }
    });
    errorClass.prototype = Object.create(baseErrorType.prototype);
    errorClass.prototype.constructor = errorClass;
    errorClass.prototype.toString = function () {
        if (this.message === undefined) {
            return this.name
        } else {
            return this.name + ": " + this.message
        }
    };
    return errorClass
}

var BindingError = undefined;

function throwBindingError(message) {
    throw new BindingError(message)
}

var InternalError = undefined;

function throwInternalError(message) {
    throw new InternalError(message)
}

function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
    myTypes.forEach(function (type) {
        typeDependencies[type] = dependentTypes
    });

    function onComplete(typeConverters) {
        var myTypeConverters = getTypeConverters(typeConverters);
        if (myTypeConverters.length !== myTypes.length) {
            throwInternalError("Mismatched type converter count")
        }
        for (var i = 0; i < myTypes.length; ++i) {
            registerType(myTypes[i], myTypeConverters[i])
        }
    }

    var typeConverters = new Array(dependentTypes.length);
    var unregisteredTypes = [];
    var registered = 0;
    dependentTypes.forEach(function (dt, i) {
        if (registeredTypes.hasOwnProperty(dt)) {
            typeConverters[i] = registeredTypes[dt]
        } else {
            unregisteredTypes.push(dt);
            if (!awaitingDependencies.hasOwnProperty(dt)) {
                awaitingDependencies[dt] = []
            }
            awaitingDependencies[dt].push(function () {
                typeConverters[i] = registeredTypes[dt];
                ++registered;
                if (registered === unregisteredTypes.length) {
                    onComplete(typeConverters)
                }
            })
        }
    });
    if (0 === unregisteredTypes.length) {
        onComplete(typeConverters)
    }
}

function registerType(rawType, registeredInstance, options) {
    options = options || {};
    if (!("argPackAdvance" in registeredInstance)) {
        throw new TypeError("registerType registeredInstance requires argPackAdvance")
    }
    var name = registeredInstance.name;
    if (!rawType) {
        throwBindingError('type "' + name + '" must have a positive integer typeid pointer')
    }
    if (registeredTypes.hasOwnProperty(rawType)) {
        if (options.ignoreDuplicateRegistrations) {
            return
        } else {
            throwBindingError("Cannot register type '" + name + "' twice")
        }
    }
    registeredTypes[rawType] = registeredInstance;
    delete typeDependencies[rawType];
    if (awaitingDependencies.hasOwnProperty(rawType)) {
        var callbacks = awaitingDependencies[rawType];
        delete awaitingDependencies[rawType];
        callbacks.forEach(function (cb) {
            cb()
        })
    }
}

function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
    var shift = getShiftFromSize(size);
    name = readLatin1String(name);
    registerType(rawType, {
        name: name, "fromWireType": function (wt) {
            return !!wt
        }, "toWireType": function (destructors, o) {
            return o ? trueValue : falseValue
        }, "argPackAdvance": 8, "readValueFromPointer": function (pointer) {
            var heap;
            if (size === 1) {
                heap = HEAP8
            } else if (size === 2) {
                heap = HEAP16
            } else if (size === 4) {
                heap = HEAP32
            } else {
                throw new TypeError("Unknown boolean type size: " + name)
            }
            return this["fromWireType"](heap[pointer >> shift])
        }, destructorFunction: null
    })
}

function ClassHandle_isAliasOf(other) {
    if (!(this instanceof ClassHandle)) {
        return false
    }
    if (!(other instanceof ClassHandle)) {
        return false
    }
    var leftClass = this.$$.ptrType.registeredClass;
    var left = this.$$.ptr;
    var rightClass = other.$$.ptrType.registeredClass;
    var right = other.$$.ptr;
    while (leftClass.baseClass) {
        left = leftClass.upcast(left);
        leftClass = leftClass.baseClass
    }
    while (rightClass.baseClass) {
        right = rightClass.upcast(right);
        rightClass = rightClass.baseClass
    }
    return leftClass === rightClass && left === right
}

function shallowCopyInternalPointer(o) {
    return {
        count: o.count,
        deleteScheduled: o.deleteScheduled,
        preservePointerOnDelete: o.preservePointerOnDelete,
        ptr: o.ptr,
        ptrType: o.ptrType,
        smartPtr: o.smartPtr,
        smartPtrType: o.smartPtrType
    }
}

function throwInstanceAlreadyDeleted(obj) {
    function getInstanceTypeName(handle) {
        return handle.$$.ptrType.registeredClass.name
    }

    throwBindingError(getInstanceTypeName(obj) + " instance already deleted")
}

function ClassHandle_clone() {
    if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this)
    }
    if (this.$$.preservePointerOnDelete) {
        this.$$.count.value += 1;
        return this
    } else {
        var clone = Object.create(Object.getPrototypeOf(this), {$$: {value: shallowCopyInternalPointer(this.$$)}});
        clone.$$.count.value += 1;
        clone.$$.deleteScheduled = false;
        return clone
    }
}

function runDestructor(handle) {
    var $$ = handle.$$;
    if ($$.smartPtr) {
        $$.smartPtrType.rawDestructor($$.smartPtr)
    } else {
        $$.ptrType.registeredClass.rawDestructor($$.ptr)
    }
}

function ClassHandle_delete() {
    if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this)
    }
    if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
        throwBindingError("Object already scheduled for deletion")
    }
    this.$$.count.value -= 1;
    var toDelete = 0 === this.$$.count.value;
    if (toDelete) {
        runDestructor(this)
    }
    if (!this.$$.preservePointerOnDelete) {
        this.$$.smartPtr = undefined;
        this.$$.ptr = undefined
    }
}

function ClassHandle_isDeleted() {
    return !this.$$.ptr
}

var delayFunction = undefined;
var deletionQueue = [];

function flushPendingDeletes() {
    while (deletionQueue.length) {
        var obj = deletionQueue.pop();
        obj.$$.deleteScheduled = false;
        obj["delete"]()
    }
}

function ClassHandle_deleteLater() {
    if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this)
    }
    if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
        throwBindingError("Object already scheduled for deletion")
    }
    deletionQueue.push(this);
    if (deletionQueue.length === 1 && delayFunction) {
        delayFunction(flushPendingDeletes)
    }
    this.$$.deleteScheduled = true;
    return this
}

function init_ClassHandle() {
    ClassHandle.prototype["isAliasOf"] = ClassHandle_isAliasOf;
    ClassHandle.prototype["clone"] = ClassHandle_clone;
    ClassHandle.prototype["delete"] = ClassHandle_delete;
    ClassHandle.prototype["isDeleted"] = ClassHandle_isDeleted;
    ClassHandle.prototype["deleteLater"] = ClassHandle_deleteLater
}

function ClassHandle() {
}

var registeredPointers = {};

function ensureOverloadTable(proto, methodName, humanName) {
    if (undefined === proto[methodName].overloadTable) {
        var prevFunc = proto[methodName];
        proto[methodName] = function () {
            if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
                throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!")
            }
            return proto[methodName].overloadTable[arguments.length].apply(this, arguments)
        };
        proto[methodName].overloadTable = [];
        proto[methodName].overloadTable[prevFunc.argCount] = prevFunc
    }
}

function exposePublicSymbol(name, value, numArguments) {
    if (Module.hasOwnProperty(name)) {
        if (undefined === numArguments || undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments]) {
            throwBindingError("Cannot register public name '" + name + "' twice")
        }
        ensureOverloadTable(Module, name, name);
        if (Module.hasOwnProperty(numArguments)) {
            throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!")
        }
        Module[name].overloadTable[numArguments] = value
    } else {
        Module[name] = value;
        if (undefined !== numArguments) {
            Module[name].numArguments = numArguments
        }
    }
}

function RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast) {
    this.name = name;
    this.constructor = constructor;
    this.instancePrototype = instancePrototype;
    this.rawDestructor = rawDestructor;
    this.baseClass = baseClass;
    this.getActualType = getActualType;
    this.upcast = upcast;
    this.downcast = downcast;
    this.pureVirtualFunctions = []
}

function upcastPointer(ptr, ptrClass, desiredClass) {
    while (ptrClass !== desiredClass) {
        if (!ptrClass.upcast) {
            throwBindingError("Expected null or instance of " + desiredClass.name + ", got an instance of " + ptrClass.name)
        }
        ptr = ptrClass.upcast(ptr);
        ptrClass = ptrClass.baseClass
    }
    return ptr
}

function constNoSmartPtrRawPointerToWireType(destructors, handle) {
    if (handle === null) {
        if (this.isReference) {
            throwBindingError("null is not a valid " + this.name)
        }
        return 0
    }
    if (!handle.$$) {
        throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name)
    }
    if (!handle.$$.ptr) {
        throwBindingError("Cannot pass deleted object as a pointer of type " + this.name)
    }
    var handleClass = handle.$$.ptrType.registeredClass;
    var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
    return ptr
}

function genericPointerToWireType(destructors, handle) {
    var ptr;
    if (handle === null) {
        if (this.isReference) {
            throwBindingError("null is not a valid " + this.name)
        }
        if (this.isSmartPointer) {
            ptr = this.rawConstructor();
            if (destructors !== null) {
                destructors.push(this.rawDestructor, ptr)
            }
            return ptr
        } else {
            return 0
        }
    }
    if (!handle.$$) {
        throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name)
    }
    if (!handle.$$.ptr) {
        throwBindingError("Cannot pass deleted object as a pointer of type " + this.name)
    }
    if (!this.isConst && handle.$$.ptrType.isConst) {
        throwBindingError("Cannot convert argument of type " + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + " to parameter type " + this.name)
    }
    var handleClass = handle.$$.ptrType.registeredClass;
    ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
    if (this.isSmartPointer) {
        if (undefined === handle.$$.smartPtr) {
            throwBindingError("Passing raw pointer to smart pointer is illegal")
        }
        switch (this.sharingPolicy) {
            case 0:
                if (handle.$$.smartPtrType === this) {
                    ptr = handle.$$.smartPtr
                } else {
                    throwBindingError("Cannot convert argument of type " + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + " to parameter type " + this.name)
                }
                break;
            case 1:
                ptr = handle.$$.smartPtr;
                break;
            case 2:
                if (handle.$$.smartPtrType === this) {
                    ptr = handle.$$.smartPtr
                } else {
                    var clonedHandle = handle["clone"]();
                    ptr = this.rawShare(ptr, __emval_register(function () {
                        clonedHandle["delete"]()
                    }));
                    if (destructors !== null) {
                        destructors.push(this.rawDestructor, ptr)
                    }
                }
                break;
            default:
                throwBindingError("Unsupporting sharing policy")
        }
    }
    return ptr
}

function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
    if (handle === null) {
        if (this.isReference) {
            throwBindingError("null is not a valid " + this.name)
        }
        return 0
    }
    if (!handle.$$) {
        throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name)
    }
    if (!handle.$$.ptr) {
        throwBindingError("Cannot pass deleted object as a pointer of type " + this.name)
    }
    if (handle.$$.ptrType.isConst) {
        throwBindingError("Cannot convert argument of type " + handle.$$.ptrType.name + " to parameter type " + this.name)
    }
    var handleClass = handle.$$.ptrType.registeredClass;
    var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
    return ptr
}

function simpleReadValueFromPointer(pointer) {
    return this["fromWireType"](HEAPU32[pointer >> 2])
}

function RegisteredPointer_getPointee(ptr) {
    if (this.rawGetPointee) {
        ptr = this.rawGetPointee(ptr)
    }
    return ptr
}

function RegisteredPointer_destructor(ptr) {
    if (this.rawDestructor) {
        this.rawDestructor(ptr)
    }
}

function RegisteredPointer_deleteObject(handle) {
    if (handle !== null) {
        handle["delete"]()
    }
}

function downcastPointer(ptr, ptrClass, desiredClass) {
    if (ptrClass === desiredClass) {
        return ptr
    }
    if (undefined === desiredClass.baseClass) {
        return null
    }
    var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);
    if (rv === null) {
        return null
    }
    return desiredClass.downcast(rv)
}

function getInheritedInstanceCount() {
    return Object.keys(registeredInstances).length
}

function getLiveInheritedInstances() {
    var rv = [];
    for (var k in registeredInstances) {
        if (registeredInstances.hasOwnProperty(k)) {
            rv.push(registeredInstances[k])
        }
    }
    return rv
}

function setDelayFunction(fn) {
    delayFunction = fn;
    if (deletionQueue.length && delayFunction) {
        delayFunction(flushPendingDeletes)
    }
}

function init_embind() {
    Module["getInheritedInstanceCount"] = getInheritedInstanceCount;
    Module["getLiveInheritedInstances"] = getLiveInheritedInstances;
    Module["flushPendingDeletes"] = flushPendingDeletes;
    Module["setDelayFunction"] = setDelayFunction
}

var registeredInstances = {};

function getBasestPointer(class_, ptr) {
    if (ptr === undefined) {
        throwBindingError("ptr should not be undefined")
    }
    while (class_.baseClass) {
        ptr = class_.upcast(ptr);
        class_ = class_.baseClass
    }
    return ptr
}

function getInheritedInstance(class_, ptr) {
    ptr = getBasestPointer(class_, ptr);
    return registeredInstances[ptr]
}

function makeClassHandle(prototype, record) {
    if (!record.ptrType || !record.ptr) {
        throwInternalError("makeClassHandle requires ptr and ptrType")
    }
    var hasSmartPtrType = !!record.smartPtrType;
    var hasSmartPtr = !!record.smartPtr;
    if (hasSmartPtrType !== hasSmartPtr) {
        throwInternalError("Both smartPtrType and smartPtr must be specified")
    }
    record.count = {value: 1};
    return Object.create(prototype, {$$: {value: record}})
}

function RegisteredPointer_fromWireType(ptr) {
    var rawPointer = this.getPointee(ptr);
    if (!rawPointer) {
        this.destructor(ptr);
        return null
    }
    var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);
    if (undefined !== registeredInstance) {
        if (0 === registeredInstance.$$.count.value) {
            registeredInstance.$$.ptr = rawPointer;
            registeredInstance.$$.smartPtr = ptr;
            return registeredInstance["clone"]()
        } else {
            var rv = registeredInstance["clone"]();
            this.destructor(ptr);
            return rv
        }
    }

    function makeDefaultHandle() {
        if (this.isSmartPointer) {
            return makeClassHandle(this.registeredClass.instancePrototype, {
                ptrType: this.pointeeType,
                ptr: rawPointer,
                smartPtrType: this,
                smartPtr: ptr
            })
        } else {
            return makeClassHandle(this.registeredClass.instancePrototype, {ptrType: this, ptr: ptr})
        }
    }

    var actualType = this.registeredClass.getActualType(rawPointer);
    var registeredPointerRecord = registeredPointers[actualType];
    if (!registeredPointerRecord) {
        return makeDefaultHandle.call(this)
    }
    var toType;
    if (this.isConst) {
        toType = registeredPointerRecord.constPointerType
    } else {
        toType = registeredPointerRecord.pointerType
    }
    var dp = downcastPointer(rawPointer, this.registeredClass, toType.registeredClass);
    if (dp === null) {
        return makeDefaultHandle.call(this)
    }
    if (this.isSmartPointer) {
        return makeClassHandle(toType.registeredClass.instancePrototype, {
            ptrType: toType,
            ptr: dp,
            smartPtrType: this,
            smartPtr: ptr
        })
    } else {
        return makeClassHandle(toType.registeredClass.instancePrototype, {ptrType: toType, ptr: dp})
    }
}

function init_RegisteredPointer() {
    RegisteredPointer.prototype.getPointee = RegisteredPointer_getPointee;
    RegisteredPointer.prototype.destructor = RegisteredPointer_destructor;
    RegisteredPointer.prototype["argPackAdvance"] = 8;
    RegisteredPointer.prototype["readValueFromPointer"] = simpleReadValueFromPointer;
    RegisteredPointer.prototype["deleteObject"] = RegisteredPointer_deleteObject;
    RegisteredPointer.prototype["fromWireType"] = RegisteredPointer_fromWireType
}

function RegisteredPointer(name, registeredClass, isReference, isConst, isSmartPointer, pointeeType, sharingPolicy, rawGetPointee, rawConstructor, rawShare, rawDestructor) {
    this.name = name;
    this.registeredClass = registeredClass;
    this.isReference = isReference;
    this.isConst = isConst;
    this.isSmartPointer = isSmartPointer;
    this.pointeeType = pointeeType;
    this.sharingPolicy = sharingPolicy;
    this.rawGetPointee = rawGetPointee;
    this.rawConstructor = rawConstructor;
    this.rawShare = rawShare;
    this.rawDestructor = rawDestructor;
    if (!isSmartPointer && registeredClass.baseClass === undefined) {
        if (isConst) {
            this["toWireType"] = constNoSmartPtrRawPointerToWireType;
            this.destructorFunction = null
        } else {
            this["toWireType"] = nonConstNoSmartPtrRawPointerToWireType;
            this.destructorFunction = null
        }
    } else {
        this["toWireType"] = genericPointerToWireType
    }
}

function replacePublicSymbol(name, value, numArguments) {
    if (!Module.hasOwnProperty(name)) {
        throwInternalError("Replacing nonexistant public symbol")
    }
    if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
        Module[name].overloadTable[numArguments] = value
    } else {
        Module[name] = value;
        Module[name].argCount = numArguments
    }
}

function embind__requireFunction(signature, rawFunction) {
    signature = readLatin1String(signature);

    function makeDynCaller(dynCall) {
        var args = [];
        for (var i = 1; i < signature.length; ++i) {
            args.push("a" + i)
        }
        var name = "dynCall_" + signature + "_" + rawFunction;
        var body = "return function " + name + "(" + args.join(", ") + ") {\n";
        body += "    return dynCall(rawFunction" + (args.length ? ", " : "") + args.join(", ") + ");\n";
        body += "};\n";
        return new Function("dynCall", "rawFunction", body)(dynCall, rawFunction)
    }

    var fp;
    if (Module["FUNCTION_TABLE_" + signature] !== undefined) {
        fp = Module["FUNCTION_TABLE_" + signature][rawFunction]
    } else if (typeof FUNCTION_TABLE !== "undefined") {
        fp = FUNCTION_TABLE[rawFunction]
    } else {
        var dc = Module["dynCall_" + signature];
        if (dc === undefined) {
            dc = Module["dynCall_" + signature.replace(/f/g, "d")];
            if (dc === undefined) {
                throwBindingError("No dynCall invoker for signature: " + signature)
            }
        }
        fp = makeDynCaller(dc)
    }
    if (typeof fp !== "function") {
        throwBindingError("unknown function pointer with signature " + signature + ": " + rawFunction)
    }
    return fp
}

var UnboundTypeError = undefined;

function getTypeName(type) {
    var ptr = ___getTypeName(type);
    var rv = readLatin1String(ptr);
    _free(ptr);
    return rv
}

function throwUnboundTypeError(message, types) {
    var unboundTypes = [];
    var seen = {};

    function visit(type) {
        if (seen[type]) {
            return
        }
        if (registeredTypes[type]) {
            return
        }
        if (typeDependencies[type]) {
            typeDependencies[type].forEach(visit);
            return
        }
        unboundTypes.push(type);
        seen[type] = true
    }

    types.forEach(visit);
    throw new UnboundTypeError(message + ": " + unboundTypes.map(getTypeName).join([", "]))
}

function __embind_register_class(rawType, rawPointerType, rawConstPointerType, baseClassRawType, getActualTypeSignature, getActualType, upcastSignature, upcast, downcastSignature, downcast, name, destructorSignature, rawDestructor) {
    name = readLatin1String(name);
    getActualType = embind__requireFunction(getActualTypeSignature, getActualType);
    if (upcast) {
        upcast = embind__requireFunction(upcastSignature, upcast)
    }
    if (downcast) {
        downcast = embind__requireFunction(downcastSignature, downcast)
    }
    rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
    var legalFunctionName = makeLegalFunctionName(name);
    exposePublicSymbol(legalFunctionName, function () {
        throwUnboundTypeError("Cannot construct " + name + " due to unbound types", [baseClassRawType])
    });
    whenDependentTypesAreResolved([rawType, rawPointerType, rawConstPointerType], baseClassRawType ? [baseClassRawType] : [], function (base) {
        base = base[0];
        var baseClass;
        var basePrototype;
        if (baseClassRawType) {
            baseClass = base.registeredClass;
            basePrototype = baseClass.instancePrototype
        } else {
            basePrototype = ClassHandle.prototype
        }
        var constructor = createNamedFunction(legalFunctionName, function () {
            if (Object.getPrototypeOf(this) !== instancePrototype) {
                throw new BindingError("Use 'new' to construct " + name)
            }
            if (undefined === registeredClass.constructor_body) {
                throw new BindingError(name + " has no accessible constructor")
            }
            var body = registeredClass.constructor_body[arguments.length];
            if (undefined === body) {
                throw new BindingError("Tried to invoke ctor of " + name + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(registeredClass.constructor_body).toString() + ") parameters instead!")
            }
            return body.apply(this, arguments)
        });
        var instancePrototype = Object.create(basePrototype, {constructor: {value: constructor}});
        constructor.prototype = instancePrototype;
        var registeredClass = new RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast);
        var referenceConverter = new RegisteredPointer(name, registeredClass, true, false, false);
        var pointerConverter = new RegisteredPointer(name + "*", registeredClass, false, false, false);
        var constPointerConverter = new RegisteredPointer(name + " const*", registeredClass, false, true, false);
        registeredPointers[rawType] = {pointerType: pointerConverter, constPointerType: constPointerConverter};
        replacePublicSymbol(legalFunctionName, constructor);
        return [referenceConverter, pointerConverter, constPointerConverter]
    })
}

function new_(constructor, argumentList) {
    if (!(constructor instanceof Function)) {
        throw new TypeError("new_ called with constructor type " + typeof constructor + " which is not a function")
    }
    var dummy = createNamedFunction(constructor.name || "unknownFunctionName", function () {
    });
    dummy.prototype = constructor.prototype;
    var obj = new dummy;
    var r = constructor.apply(obj, argumentList);
    return r instanceof Object ? r : obj
}

function runDestructors(destructors) {
    while (destructors.length) {
        var ptr = destructors.pop();
        var del = destructors.pop();
        del(ptr)
    }
}

function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
    var argCount = argTypes.length;
    if (argCount < 2) {
        throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!")
    }
    var isClassMethodFunc = argTypes[1] !== null && classType !== null;
    var needsDestructorStack = false;
    for (var i = 1; i < argTypes.length; ++i) {
        if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) {
            needsDestructorStack = true;
            break
        }
    }
    var returns = argTypes[0].name !== "void";
    var argsList = "";
    var argsListWired = "";
    for (var i = 0; i < argCount - 2; ++i) {
        argsList += (i !== 0 ? ", " : "") + "arg" + i;
        argsListWired += (i !== 0 ? ", " : "") + "arg" + i + "Wired"
    }
    var invokerFnBody = "return function " + makeLegalFunctionName(humanName) + "(" + argsList + ") {\n" + "if (arguments.length !== " + (argCount - 2) + ") {\n" + "throwBindingError('function " + humanName + " called with ' + arguments.length + ' arguments, expected " + (argCount - 2) + " args!');\n" + "}\n";
    if (needsDestructorStack) {
        invokerFnBody += "var destructors = [];\n"
    }
    var dtorStack = needsDestructorStack ? "destructors" : "null";
    var args1 = ["throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam"];
    var args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
    if (isClassMethodFunc) {
        invokerFnBody += "var thisWired = classParam.toWireType(" + dtorStack + ", this);\n"
    }
    for (var i = 0; i < argCount - 2; ++i) {
        invokerFnBody += "var arg" + i + "Wired = argType" + i + ".toWireType(" + dtorStack + ", arg" + i + "); // " + argTypes[i + 2].name + "\n";
        args1.push("argType" + i);
        args2.push(argTypes[i + 2])
    }
    if (isClassMethodFunc) {
        argsListWired = "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired
    }
    invokerFnBody += (returns ? "var rv = " : "") + "invoker(fn" + (argsListWired.length > 0 ? ", " : "") + argsListWired + ");\n";
    if (needsDestructorStack) {
        invokerFnBody += "runDestructors(destructors);\n"
    } else {
        for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
            var paramName = i === 1 ? "thisWired" : "arg" + (i - 2) + "Wired";
            if (argTypes[i].destructorFunction !== null) {
                invokerFnBody += paramName + "_dtor(" + paramName + "); // " + argTypes[i].name + "\n";
                args1.push(paramName + "_dtor");
                args2.push(argTypes[i].destructorFunction)
            }
        }
    }
    if (returns) {
        invokerFnBody += "var ret = retType.fromWireType(rv);\n" + "return ret;\n"
    } else {
    }
    invokerFnBody += "}\n";
    args1.push(invokerFnBody);
    var invokerFunction = new_(Function, args1).apply(null, args2);
    return invokerFunction
}

function heap32VectorToArray(count, firstElement) {
    var array = [];
    for (var i = 0; i < count; i++) {
        array.push(HEAP32[(firstElement >> 2) + i])
    }
    return array
}

function __embind_register_class_class_function(rawClassType, methodName, argCount, rawArgTypesAddr, invokerSignature, rawInvoker, fn) {
    var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    methodName = readLatin1String(methodName);
    rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
    whenDependentTypesAreResolved([], [rawClassType], function (classType) {
        classType = classType[0];
        var humanName = classType.name + "." + methodName;

        function unboundTypesHandler() {
            throwUnboundTypeError("Cannot call " + humanName + " due to unbound types", rawArgTypes)
        }

        var proto = classType.registeredClass.constructor;
        if (undefined === proto[methodName]) {
            unboundTypesHandler.argCount = argCount - 1;
            proto[methodName] = unboundTypesHandler
        } else {
            ensureOverloadTable(proto, methodName, humanName);
            proto[methodName].overloadTable[argCount - 1] = unboundTypesHandler
        }
        whenDependentTypesAreResolved([], rawArgTypes, function (argTypes) {
            var invokerArgsArray = [argTypes[0], null].concat(argTypes.slice(1));
            var func = craftInvokerFunction(humanName, invokerArgsArray, null, rawInvoker, fn);
            if (undefined === proto[methodName].overloadTable) {
                func.argCount = argCount - 1;
                proto[methodName] = func
            } else {
                proto[methodName].overloadTable[argCount - 1] = func
            }
            return []
        });
        return []
    })
}

function __embind_register_class_constructor(rawClassType, argCount, rawArgTypesAddr, invokerSignature, invoker, rawConstructor) {
    var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    invoker = embind__requireFunction(invokerSignature, invoker);
    whenDependentTypesAreResolved([], [rawClassType], function (classType) {
        classType = classType[0];
        var humanName = "constructor " + classType.name;
        if (undefined === classType.registeredClass.constructor_body) {
            classType.registeredClass.constructor_body = []
        }
        if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
            throw new BindingError("Cannot register multiple constructors with identical number of parameters (" + (argCount - 1) + ") for class '" + classType.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!")
        }
        classType.registeredClass.constructor_body[argCount - 1] = function unboundTypeHandler() {
            throwUnboundTypeError("Cannot construct " + classType.name + " due to unbound types", rawArgTypes)
        };
        whenDependentTypesAreResolved([], rawArgTypes, function (argTypes) {
            classType.registeredClass.constructor_body[argCount - 1] = function constructor_body() {
                if (arguments.length !== argCount - 1) {
                    throwBindingError(humanName + " called with " + arguments.length + " arguments, expected " + (argCount - 1))
                }
                var destructors = [];
                var args = new Array(argCount);
                args[0] = rawConstructor;
                for (var i = 1; i < argCount; ++i) {
                    args[i] = argTypes[i]["toWireType"](destructors, arguments[i - 1])
                }
                var ptr = invoker.apply(null, args);
                runDestructors(destructors);
                return argTypes[0]["fromWireType"](ptr)
            };
            return []
        });
        return []
    })
}

function __embind_register_class_function(rawClassType, methodName, argCount, rawArgTypesAddr, invokerSignature, rawInvoker, context, isPureVirtual) {
    var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    methodName = readLatin1String(methodName);
    rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
    whenDependentTypesAreResolved([], [rawClassType], function (classType) {
        classType = classType[0];
        var humanName = classType.name + "." + methodName;
        if (isPureVirtual) {
            classType.registeredClass.pureVirtualFunctions.push(methodName)
        }

        function unboundTypesHandler() {
            throwUnboundTypeError("Cannot call " + humanName + " due to unbound types", rawArgTypes)
        }

        var proto = classType.registeredClass.instancePrototype;
        var method = proto[methodName];
        if (undefined === method || undefined === method.overloadTable && method.className !== classType.name && method.argCount === argCount - 2) {
            unboundTypesHandler.argCount = argCount - 2;
            unboundTypesHandler.className = classType.name;
            proto[methodName] = unboundTypesHandler
        } else {
            ensureOverloadTable(proto, methodName, humanName);
            proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler
        }
        whenDependentTypesAreResolved([], rawArgTypes, function (argTypes) {
            var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context);
            if (undefined === proto[methodName].overloadTable) {
                memberFunction.argCount = argCount - 2;
                proto[methodName] = memberFunction
            } else {
                proto[methodName].overloadTable[argCount - 2] = memberFunction
            }
            return []
        });
        return []
    })
}

function validateThis(this_, classType, humanName) {
    if (!(this_ instanceof Object)) {
        throwBindingError(humanName + ' with invalid "this": ' + this_)
    }
    if (!(this_ instanceof classType.registeredClass.constructor)) {
        throwBindingError(humanName + ' incompatible with "this" of type ' + this_.constructor.name)
    }
    if (!this_.$$.ptr) {
        throwBindingError("cannot call emscripten binding method " + humanName + " on deleted object")
    }
    return upcastPointer(this_.$$.ptr, this_.$$.ptrType.registeredClass, classType.registeredClass)
}

function __embind_register_class_property(classType, fieldName, getterReturnType, getterSignature, getter, getterContext, setterArgumentType, setterSignature, setter, setterContext) {
    fieldName = readLatin1String(fieldName);
    getter = embind__requireFunction(getterSignature, getter);
    whenDependentTypesAreResolved([], [classType], function (classType) {
        classType = classType[0];
        var humanName = classType.name + "." + fieldName;
        var desc = {
            get: function () {
                throwUnboundTypeError("Cannot access " + humanName + " due to unbound types", [getterReturnType, setterArgumentType])
            }, enumerable: true, configurable: true
        };
        if (setter) {
            desc.set = function () {
                throwUnboundTypeError("Cannot access " + humanName + " due to unbound types", [getterReturnType, setterArgumentType])
            }
        } else {
            desc.set = function (v) {
                throwBindingError(humanName + " is a read-only property")
            }
        }
        Object.defineProperty(classType.registeredClass.instancePrototype, fieldName, desc);
        whenDependentTypesAreResolved([], setter ? [getterReturnType, setterArgumentType] : [getterReturnType], function (types) {
            var getterReturnType = types[0];
            var desc = {
                get: function () {
                    var ptr = validateThis(this, classType, humanName + " getter");
                    return getterReturnType["fromWireType"](getter(getterContext, ptr))
                }, enumerable: true
            };
            if (setter) {
                setter = embind__requireFunction(setterSignature, setter);
                var setterArgumentType = types[1];
                desc.set = function (v) {
                    var ptr = validateThis(this, classType, humanName + " setter");
                    var destructors = [];
                    setter(setterContext, ptr, setterArgumentType["toWireType"](destructors, v));
                    runDestructors(destructors)
                }
            }
            Object.defineProperty(classType.registeredClass.instancePrototype, fieldName, desc);
            return []
        });
        return []
    })
}

var emval_free_list = [];
var emval_handle_array = [{}, {value: undefined}, {value: null}, {value: true}, {value: false}];

function __emval_decref(handle) {
    if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
        emval_handle_array[handle] = undefined;
        emval_free_list.push(handle)
    }
}

function count_emval_handles() {
    var count = 0;
    for (var i = 5; i < emval_handle_array.length; ++i) {
        if (emval_handle_array[i] !== undefined) {
            ++count
        }
    }
    return count
}

function get_first_emval() {
    for (var i = 5; i < emval_handle_array.length; ++i) {
        if (emval_handle_array[i] !== undefined) {
            return emval_handle_array[i]
        }
    }
    return null
}

function init_emval() {
    Module["count_emval_handles"] = count_emval_handles;
    Module["get_first_emval"] = get_first_emval
}

function __emval_register(value) {
    switch (value) {
        case undefined: {
            return 1
        }
        case null: {
            return 2
        }
        case true: {
            return 3
        }
        case false: {
            return 4
        }
        default: {
            var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
            emval_handle_array[handle] = {refcount: 1, value: value};
            return handle
        }
    }
}

function __embind_register_emval(rawType, name) {
    name = readLatin1String(name);
    registerType(rawType, {
        name: name, "fromWireType": function (handle) {
            var rv = emval_handle_array[handle].value;
            __emval_decref(handle);
            return rv
        }, "toWireType": function (destructors, value) {
            return __emval_register(value)
        }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: null
    })
}

function _embind_repr(v) {
    if (v === null) {
        return "null"
    }
    var t = typeof v;
    if (t === "object" || t === "array" || t === "function") {
        return v.toString()
    } else {
        return "" + v
    }
}

function floatReadValueFromPointer(name, shift) {
    switch (shift) {
        case 2:
            return function (pointer) {
                return this["fromWireType"](HEAPF32[pointer >> 2])
            };
        case 3:
            return function (pointer) {
                return this["fromWireType"](HEAPF64[pointer >> 3])
            };
        default:
            throw new TypeError("Unknown float type: " + name)
    }
}

function __embind_register_float(rawType, name, size) {
    var shift = getShiftFromSize(size);
    name = readLatin1String(name);
    registerType(rawType, {
        name: name, "fromWireType": function (value) {
            return value
        }, "toWireType": function (destructors, value) {
            if (typeof value !== "number" && typeof value !== "boolean") {
                throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name)
            }
            return value
        }, "argPackAdvance": 8, "readValueFromPointer": floatReadValueFromPointer(name, shift), destructorFunction: null
    })
}

function integerReadValueFromPointer(name, shift, signed) {
    switch (shift) {
        case 0:
            return signed ? function readS8FromPointer(pointer) {
                return HEAP8[pointer]
            } : function readU8FromPointer(pointer) {
                return HEAPU8[pointer]
            };
        case 1:
            return signed ? function readS16FromPointer(pointer) {
                return HEAP16[pointer >> 1]
            } : function readU16FromPointer(pointer) {
                return HEAPU16[pointer >> 1]
            };
        case 2:
            return signed ? function readS32FromPointer(pointer) {
                return HEAP32[pointer >> 2]
            } : function readU32FromPointer(pointer) {
                return HEAPU32[pointer >> 2]
            };
        default:
            throw new TypeError("Unknown integer type: " + name)
    }
}

function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
    name = readLatin1String(name);
    if (maxRange === -1) {
        maxRange = 4294967295
    }
    var shift = getShiftFromSize(size);
    var fromWireType = function (value) {
        return value
    };
    if (minRange === 0) {
        var bitshift = 32 - 8 * size;
        fromWireType = function (value) {
            return value << bitshift >>> bitshift
        }
    }
    var isUnsignedType = name.indexOf("unsigned") != -1;
    registerType(primitiveType, {
        name: name,
        "fromWireType": fromWireType,
        "toWireType": function (destructors, value) {
            if (typeof value !== "number" && typeof value !== "boolean") {
                throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name)
            }
            if (value < minRange || value > maxRange) {
                throw new TypeError('Passing a number "' + _embind_repr(value) + '" from JS side to C/C++ side to an argument of type "' + name + '", which is outside the valid range [' + minRange + ", " + maxRange + "]!")
            }
            return isUnsignedType ? value >>> 0 : value | 0
        },
        "argPackAdvance": 8,
        "readValueFromPointer": integerReadValueFromPointer(name, shift, minRange !== 0),
        destructorFunction: null
    })
}

function __embind_register_memory_view(rawType, dataTypeIndex, name) {
    var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
    var TA = typeMapping[dataTypeIndex];

    function decodeMemoryView(handle) {
        handle = handle >> 2;
        var heap = HEAPU32;
        var size = heap[handle];
        var data = heap[handle + 1];
        return new TA(heap["buffer"], data, size)
    }

    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        "fromWireType": decodeMemoryView,
        "argPackAdvance": 8,
        "readValueFromPointer": decodeMemoryView
    }, {ignoreDuplicateRegistrations: true})
}

function __embind_register_std_string(rawType, name) {
    name = readLatin1String(name);
    var stdStringIsUTF8 = name === "std::string";
    registerType(rawType, {
        name: name, "fromWireType": function (value) {
            var length = HEAPU32[value >> 2];
            var str;
            if (stdStringIsUTF8) {
                var endChar = HEAPU8[value + 4 + length];
                var endCharSwap = 0;
                if (endChar != 0) {
                    endCharSwap = endChar;
                    HEAPU8[value + 4 + length] = 0
                }
                var decodeStartPtr = value + 4;
                for (var i = 0; i <= length; ++i) {
                    var currentBytePtr = value + 4 + i;
                    if (HEAPU8[currentBytePtr] == 0) {
                        var stringSegment = UTF8ToString(decodeStartPtr);
                        if (str === undefined) str = stringSegment; else {
                            str += String.fromCharCode(0);
                            str += stringSegment
                        }
                        decodeStartPtr = currentBytePtr + 1
                    }
                }
                if (endCharSwap != 0) HEAPU8[value + 4 + length] = endCharSwap
            } else {
                var a = new Array(length);
                for (var i = 0; i < length; ++i) {
                    a[i] = String.fromCharCode(HEAPU8[value + 4 + i])
                }
                str = a.join("")
            }
            _free(value);
            return str
        }, "toWireType": function (destructors, value) {
            if (value instanceof ArrayBuffer) {
                value = new Uint8Array(value)
            }
            var getLength;
            var valueIsOfTypeString = typeof value === "string";
            if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
                throwBindingError("Cannot pass non-string to std::string")
            }
            if (stdStringIsUTF8 && valueIsOfTypeString) {
                getLength = function () {
                    return lengthBytesUTF8(value)
                }
            } else {
                getLength = function () {
                    return value.length
                }
            }
            var length = getLength();
            var ptr = _malloc(4 + length + 1);
            HEAPU32[ptr >> 2] = length;
            if (stdStringIsUTF8 && valueIsOfTypeString) {
                stringToUTF8(value, ptr + 4, length + 1)
            } else {
                if (valueIsOfTypeString) {
                    for (var i = 0; i < length; ++i) {
                        var charCode = value.charCodeAt(i);
                        if (charCode > 255) {
                            _free(ptr);
                            throwBindingError("String has UTF-16 code units that do not fit in 8 bits")
                        }
                        HEAPU8[ptr + 4 + i] = charCode
                    }
                } else {
                    for (var i = 0; i < length; ++i) {
                        HEAPU8[ptr + 4 + i] = value[i]
                    }
                }
            }
            if (destructors !== null) {
                destructors.push(_free, ptr)
            }
            return ptr
        }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: function (ptr) {
            _free(ptr)
        }
    })
}

function __embind_register_std_wstring(rawType, charSize, name) {
    name = readLatin1String(name);
    var getHeap, shift;
    if (charSize === 2) {
        getHeap = function () {
            return HEAPU16
        };
        shift = 1
    } else if (charSize === 4) {
        getHeap = function () {
            return HEAPU32
        };
        shift = 2
    }
    registerType(rawType, {
        name: name, "fromWireType": function (value) {
            var HEAP = getHeap();
            var length = HEAPU32[value >> 2];
            var a = new Array(length);
            var start = value + 4 >> shift;
            for (var i = 0; i < length; ++i) {
                a[i] = String.fromCharCode(HEAP[start + i])
            }
            _free(value);
            return a.join("")
        }, "toWireType": function (destructors, value) {
            var HEAP = getHeap();
            var length = value.length;
            var ptr = _malloc(4 + length * charSize);
            HEAPU32[ptr >> 2] = length;
            var start = ptr + 4 >> shift;
            for (var i = 0; i < length; ++i) {
                HEAP[start + i] = value.charCodeAt(i)
            }
            if (destructors !== null) {
                destructors.push(_free, ptr)
            }
            return ptr
        }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: function (ptr) {
            _free(ptr)
        }
    })
}

function __embind_register_void(rawType, name) {
    name = readLatin1String(name);
    registerType(rawType, {
        isVoid: true, name: name, "argPackAdvance": 0, "fromWireType": function () {
            return undefined
        }, "toWireType": function (destructors, o) {
            return undefined
        }
    })
}

function requireHandle(handle) {
    if (!handle) {
        throwBindingError("Cannot use deleted val. handle = " + handle)
    }
    return emval_handle_array[handle].value
}

function requireRegisteredType(rawType, humanName) {
    var impl = registeredTypes[rawType];
    if (undefined === impl) {
        throwBindingError(humanName + " has unknown type " + getTypeName(rawType))
    }
    return impl
}

function __emval_as(handle, returnType, destructorsRef) {
    handle = requireHandle(handle);
    returnType = requireRegisteredType(returnType, "emval::as");
    var destructors = [];
    var rd = __emval_register(destructors);
    HEAP32[destructorsRef >> 2] = rd;
    return returnType["toWireType"](destructors, handle)
}

function __emval_lookupTypes(argCount, argTypes, argWireTypes) {
    var a = new Array(argCount);
    for (var i = 0; i < argCount; ++i) {
        a[i] = requireRegisteredType(HEAP32[(argTypes >> 2) + i], "parameter " + i)
    }
    return a
}

function __emval_call(handle, argCount, argTypes, argv) {
    handle = requireHandle(handle);
    var types = __emval_lookupTypes(argCount, argTypes);
    var args = new Array(argCount);
    for (var i = 0; i < argCount; ++i) {
        var type = types[i];
        args[i] = type["readValueFromPointer"](argv);
        argv += type["argPackAdvance"]
    }
    var rv = handle.apply(undefined, args);
    return __emval_register(rv)
}

function __emval_allocateDestructors(destructorsRef) {
    var destructors = [];
    HEAP32[destructorsRef >> 2] = __emval_register(destructors);
    return destructors
}

var emval_symbols = {};

function getStringOrSymbol(address) {
    var symbol = emval_symbols[address];
    if (symbol === undefined) {
        return readLatin1String(address)
    } else {
        return symbol
    }
}

var emval_methodCallers = [];

function __emval_call_method(caller, handle, methodName, destructorsRef, args) {
    caller = emval_methodCallers[caller];
    handle = requireHandle(handle);
    methodName = getStringOrSymbol(methodName);
    return caller(handle, methodName, __emval_allocateDestructors(destructorsRef), args)
}

function __emval_call_void_method(caller, handle, methodName, args) {
    caller = emval_methodCallers[caller];
    handle = requireHandle(handle);
    methodName = getStringOrSymbol(methodName);
    caller(handle, methodName, null, args)
}

function __emval_equals(first, second) {
    first = requireHandle(first);
    second = requireHandle(second);
    return first == second
}

function emval_get_global() {
    return function () {
        return Function
    }()("return this")()
}

function __emval_get_global(name) {
    if (name === 0) {
        return __emval_register(emval_get_global())
    } else {
        name = getStringOrSymbol(name);
        return __emval_register(emval_get_global()[name])
    }
}

function __emval_addMethodCaller(caller) {
    var id = emval_methodCallers.length;
    emval_methodCallers.push(caller);
    return id
}

function __emval_get_method_caller(argCount, argTypes) {
    var types = __emval_lookupTypes(argCount, argTypes);
    var retType = types[0];
    var signatureName = retType.name + "_$" + types.slice(1).map(function (t) {
        return t.name
    }).join("_") + "$";
    var params = ["retType"];
    var args = [retType];
    var argsList = "";
    for (var i = 0; i < argCount - 1; ++i) {
        argsList += (i !== 0 ? ", " : "") + "arg" + i;
        params.push("argType" + i);
        args.push(types[1 + i])
    }
    var functionName = makeLegalFunctionName("methodCaller_" + signatureName);
    var functionBody = "return function " + functionName + "(handle, name, destructors, args) {\n";
    var offset = 0;
    for (var i = 0; i < argCount - 1; ++i) {
        functionBody += "    var arg" + i + " = argType" + i + ".readValueFromPointer(args" + (offset ? "+" + offset : "") + ");\n";
        offset += types[i + 1]["argPackAdvance"]
    }
    functionBody += "    var rv = handle[name](" + argsList + ");\n";
    for (var i = 0; i < argCount - 1; ++i) {
        if (types[i + 1]["deleteObject"]) {
            functionBody += "    argType" + i + ".deleteObject(arg" + i + ");\n"
        }
    }
    if (!retType.isVoid) {
        functionBody += "    return retType.toWireType(destructors, rv);\n"
    }
    functionBody += "};\n";
    params.push(functionBody);
    var invokerFunction = new_(Function, params).apply(null, args);
    return __emval_addMethodCaller(invokerFunction)
}

function __emval_get_module_property(name) {
    name = getStringOrSymbol(name);
    return __emval_register(Module[name])
}

function __emval_get_property(handle, key) {
    handle = requireHandle(handle);
    key = requireHandle(key);
    return __emval_register(handle[key])
}

function __emval_incref(handle) {
    if (handle > 4) {
        emval_handle_array[handle].refcount += 1
    }
}

function __emval_new_array() {
    return __emval_register([])
}

function __emval_new_cstring(v) {
    return __emval_register(getStringOrSymbol(v))
}

function __emval_new_object() {
    return __emval_register({})
}

function __emval_run_destructors(handle) {
    var destructors = emval_handle_array[handle].value;
    runDestructors(destructors);
    __emval_decref(handle)
}

function __emval_set_property(handle, key, value) {
    handle = requireHandle(handle);
    key = requireHandle(key);
    value = requireHandle(value);
    handle[key] = value
}

function __emval_take_value(type, argv) {
    type = requireRegisteredType(type, "_emval_take_value");
    var v = type["readValueFromPointer"](argv);
    return __emval_register(v)
}

function __emval_typeof(handle) {
    handle = requireHandle(handle);
    return __emval_register(typeof handle)
}

function _abort() {
    Module["abort"]()
}

var ___tm_formatted = 3484992;

function _tzset() {
    if (_tzset.called) return;
    _tzset.called = true;
    HEAP32[__get_timezone() >> 2] = (new Date).getTimezoneOffset() * 60;
    var winter = new Date(2e3, 0, 1);
    var summer = new Date(2e3, 6, 1);
    HEAP32[__get_daylight() >> 2] = Number(winter.getTimezoneOffset() != summer.getTimezoneOffset());

    function extractZone(date) {
        var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
        return match ? match[1] : "GMT"
    }

    var winterName = extractZone(winter);
    var summerName = extractZone(summer);
    var winterNamePtr = allocate(intArrayFromString(winterName), "i8", ALLOC_NORMAL);
    var summerNamePtr = allocate(intArrayFromString(summerName), "i8", ALLOC_NORMAL);
    if (summer.getTimezoneOffset() < winter.getTimezoneOffset()) {
        HEAP32[__get_tzname() >> 2] = winterNamePtr;
        HEAP32[__get_tzname() + 4 >> 2] = summerNamePtr
    } else {
        HEAP32[__get_tzname() >> 2] = summerNamePtr;
        HEAP32[__get_tzname() + 4 >> 2] = winterNamePtr
    }
}

function _mktime(tmPtr) {
    _tzset();
    var date = new Date(HEAP32[tmPtr + 20 >> 2] + 1900, HEAP32[tmPtr + 16 >> 2], HEAP32[tmPtr + 12 >> 2], HEAP32[tmPtr + 8 >> 2], HEAP32[tmPtr + 4 >> 2], HEAP32[tmPtr >> 2], 0);
    var dst = HEAP32[tmPtr + 32 >> 2];
    var guessedOffset = date.getTimezoneOffset();
    var start = new Date(date.getFullYear(), 0, 1);
    var summerOffset = new Date(2e3, 6, 1).getTimezoneOffset();
    var winterOffset = start.getTimezoneOffset();
    var dstOffset = Math.min(winterOffset, summerOffset);
    if (dst < 0) {
        HEAP32[tmPtr + 32 >> 2] = Number(summerOffset != winterOffset && dstOffset == guessedOffset)
    } else if (dst > 0 != (dstOffset == guessedOffset)) {
        var nonDstOffset = Math.max(winterOffset, summerOffset);
        var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
        date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4)
    }
    HEAP32[tmPtr + 24 >> 2] = date.getDay();
    var yday = (date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24) | 0;
    HEAP32[tmPtr + 28 >> 2] = yday;
    return date.getTime() / 1e3 | 0
}

function _asctime_r(tmPtr, buf) {
    var date = {
        tm_sec: HEAP32[tmPtr >> 2],
        tm_min: HEAP32[tmPtr + 4 >> 2],
        tm_hour: HEAP32[tmPtr + 8 >> 2],
        tm_mday: HEAP32[tmPtr + 12 >> 2],
        tm_mon: HEAP32[tmPtr + 16 >> 2],
        tm_year: HEAP32[tmPtr + 20 >> 2],
        tm_wday: HEAP32[tmPtr + 24 >> 2]
    };
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var s = days[date.tm_wday] + " " + months[date.tm_mon] + (date.tm_mday < 10 ? "  " : " ") + date.tm_mday + (date.tm_hour < 10 ? " 0" : " ") + date.tm_hour + (date.tm_min < 10 ? ":0" : ":") + date.tm_min + (date.tm_sec < 10 ? ":0" : ":") + date.tm_sec + " " + (1900 + date.tm_year) + "\n";
    stringToUTF8(s, buf, 26);
    return buf
}

function _asctime(tmPtr) {
    return _asctime_r(tmPtr, ___tm_formatted)
}

function _calc_bbfreq() {
    err("missing function: calc_bbfreq");
    abort(-1)
}

function _calc_mfapty() {
    err("missing function: calc_mfapty");
    abort(-1)
}

function _clProfileStats() {
    err("missing function: clProfileStats");
    abort(-1)
}

function _clock() {
    if (_clock.start === undefined) _clock.start = Date.now();
    return (Date.now() - _clock.start) * (1e6 / 1e3) | 0
}

var ___tm_current = 3484928;
var ___tm_timezone = (stringToUTF8("GMT", 3484976, 4), 3484976);

function _localtime_r(time, tmPtr) {
    _tzset();
    var date = new Date(HEAP32[time >> 2] * 1e3);
    HEAP32[tmPtr >> 2] = date.getSeconds();
    HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
    HEAP32[tmPtr + 8 >> 2] = date.getHours();
    HEAP32[tmPtr + 12 >> 2] = date.getDate();
    HEAP32[tmPtr + 16 >> 2] = date.getMonth();
    HEAP32[tmPtr + 20 >> 2] = date.getFullYear() - 1900;
    HEAP32[tmPtr + 24 >> 2] = date.getDay();
    var start = new Date(date.getFullYear(), 0, 1);
    var yday = (date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24) | 0;
    HEAP32[tmPtr + 28 >> 2] = yday;
    HEAP32[tmPtr + 36 >> 2] = -(date.getTimezoneOffset() * 60);
    var summerOffset = new Date(2e3, 6, 1).getTimezoneOffset();
    var winterOffset = start.getTimezoneOffset();
    var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
    HEAP32[tmPtr + 32 >> 2] = dst;
    var zonePtr = HEAP32[__get_tzname() + (dst ? 4 : 0) >> 2];
    HEAP32[tmPtr + 40 >> 2] = zonePtr;
    return tmPtr
}

function _ctime_r(time, buf) {
    var stack = stackSave();
    var rv = _asctime_r(_localtime_r(time, stackAlloc(44)), buf);
    stackRestore(stack);
    return rv
}

function _ctime(timer) {
    return _ctime_r(timer, ___tm_current)
}

function _emscripten_set_main_loop_timing(mode, value) {
    Browser.mainLoop.timingMode = mode;
    Browser.mainLoop.timingValue = value;
    if (!Browser.mainLoop.func) {
        console.error("emscripten_set_main_loop_timing: Cannot set timing mode for main loop since a main loop does not exist! Call emscripten_set_main_loop first to set one up.");
        return 1
    }
    if (mode == 0) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
            var timeUntilNextTick = Math.max(0, Browser.mainLoop.tickStartTime + value - _emscripten_get_now()) | 0;
            setTimeout(Browser.mainLoop.runner, timeUntilNextTick)
        };
        Browser.mainLoop.method = "timeout"
    } else if (mode == 1) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
            Browser.requestAnimationFrame(Browser.mainLoop.runner)
        };
        Browser.mainLoop.method = "rAF"
    } else if (mode == 2) {
        if (typeof setImmediate === "undefined") {
            var setImmediates = [];
            var emscriptenMainLoopMessageId = "setimmediate";
            var Browser_setImmediate_messageHandler = function (event) {
                if (event.data === emscriptenMainLoopMessageId || event.data.target === emscriptenMainLoopMessageId) {
                    event.stopPropagation();
                    setImmediates.shift()()
                }
            };
            addEventListener("message", Browser_setImmediate_messageHandler, true);
            setImmediate = function Browser_emulated_setImmediate(func) {
                setImmediates.push(func);
                if (ENVIRONMENT_IS_WORKER) {
                    if (Module["setImmediates"] === undefined) Module["setImmediates"] = [];
                    Module["setImmediates"].push(func);
                    postMessage({target: emscriptenMainLoopMessageId})
                } else postMessage(emscriptenMainLoopMessageId, "*")
            }
        }
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
            setImmediate(Browser.mainLoop.runner)
        };
        Browser.mainLoop.method = "immediate"
    }
    return 0
}

function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop, arg, noSetTiming) {
    Module["noExitRuntime"] = true;
    assert(!Browser.mainLoop.func, "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");
    Browser.mainLoop.func = func;
    Browser.mainLoop.arg = arg;
    var browserIterationFunc;
    if (typeof arg !== "undefined") {
        browserIterationFunc = function () {
            Module["dynCall_vi"](func, arg)
        }
    } else {
        browserIterationFunc = function () {
            Module["dynCall_v"](func)
        }
    }
    var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
    Browser.mainLoop.runner = function Browser_mainLoop_runner() {
        if (ABORT) return;
        if (Browser.mainLoop.queue.length > 0) {
            var start = Date.now();
            var blocker = Browser.mainLoop.queue.shift();
            blocker.func(blocker.arg);
            if (Browser.mainLoop.remainingBlockers) {
                var remaining = Browser.mainLoop.remainingBlockers;
                var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
                if (blocker.counted) {
                    Browser.mainLoop.remainingBlockers = next
                } else {
                    next = next + .5;
                    Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9
                }
            }
            console.log('main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + " ms");
            Browser.mainLoop.updateStatus();
            if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
            setTimeout(Browser.mainLoop.runner, 0);
            return
        }
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
        Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
        if (Browser.mainLoop.timingMode == 1 && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
            Browser.mainLoop.scheduler();
            return
        } else if (Browser.mainLoop.timingMode == 0) {
            Browser.mainLoop.tickStartTime = _emscripten_get_now()
        }
        GL.newRenderingFrameStarted();
        if (Browser.mainLoop.method === "timeout" && Module.ctx) {
            err("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!");
            Browser.mainLoop.method = ""
        }
        Browser.mainLoop.runIter(browserIterationFunc);
        checkStackCookie();
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
        if (typeof SDL === "object" && SDL.audio && SDL.audio.queueNewAudioData) SDL.audio.queueNewAudioData();
        Browser.mainLoop.scheduler()
    };
    if (!noSetTiming) {
        if (fps && fps > 0) _emscripten_set_main_loop_timing(0, 1e3 / fps); else _emscripten_set_main_loop_timing(1, 1);
        Browser.mainLoop.scheduler()
    }
    if (simulateInfiniteLoop) {
        throw"SimulateInfiniteLoop"
    }
}

var Browser = {
    mainLoop: {
        scheduler: null,
        method: "",
        currentlyRunningMainloop: 0,
        func: null,
        arg: 0,
        timingMode: 0,
        timingValue: 0,
        currentFrameNumber: 0,
        queue: [],
        pause: function () {
            Browser.mainLoop.scheduler = null;
            Browser.mainLoop.currentlyRunningMainloop++
        },
        resume: function () {
            Browser.mainLoop.currentlyRunningMainloop++;
            var timingMode = Browser.mainLoop.timingMode;
            var timingValue = Browser.mainLoop.timingValue;
            var func = Browser.mainLoop.func;
            Browser.mainLoop.func = null;
            _emscripten_set_main_loop(func, 0, false, Browser.mainLoop.arg, true);
            _emscripten_set_main_loop_timing(timingMode, timingValue);
            Browser.mainLoop.scheduler()
        },
        updateStatus: function () {
            if (Module["setStatus"]) {
                var message = Module["statusMessage"] || "Please wait...";
                var remaining = Browser.mainLoop.remainingBlockers;
                var expected = Browser.mainLoop.expectedBlockers;
                if (remaining) {
                    if (remaining < expected) {
                        Module["setStatus"](message + " (" + (expected - remaining) + "/" + expected + ")")
                    } else {
                        Module["setStatus"](message)
                    }
                } else {
                    Module["setStatus"]("")
                }
            }
        },
        runIter: function (func) {
            if (ABORT) return;
            if (Module["preMainLoop"]) {
                var preRet = Module["preMainLoop"]();
                if (preRet === false) {
                    return
                }
            }
            try {
                func()
            } catch (e) {
                if (e instanceof ExitStatus) {
                    return
                } else {
                    if (e && typeof e === "object" && e.stack) err("exception thrown: " + [e, e.stack]);
                    throw e
                }
            }
            if (Module["postMainLoop"]) Module["postMainLoop"]()
        }
    },
    isFullscreen: false,
    pointerLock: false,
    moduleContextCreatedCallbacks: [],
    workers: [],
    init: function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = [];
        if (Browser.initted) return;
        Browser.initted = true;
        try {
            new Blob;
            Browser.hasBlobConstructor = true
        } catch (e) {
            Browser.hasBlobConstructor = false;
            console.log("warning: no blob constructor, cannot create blobs with mimetypes")
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : !Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null;
        Browser.URLObject = typeof window != "undefined" ? window.URL ? window.URL : window.webkitURL : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === "undefined") {
            console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
            Module.noImageDecoding = true
        }
        var imagePlugin = {};
        imagePlugin["canHandle"] = function imagePlugin_canHandle(name) {
            return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name)
        };
        imagePlugin["handle"] = function imagePlugin_handle(byteArray, name, onload, onerror) {
            var b = null;
            if (Browser.hasBlobConstructor) {
                try {
                    b = new Blob([byteArray], {type: Browser.getMimetype(name)});
                    if (b.size !== byteArray.length) {
                        b = new Blob([new Uint8Array(byteArray).buffer], {type: Browser.getMimetype(name)})
                    }
                } catch (e) {
                    warnOnce("Blob constructor present but fails: " + e + "; falling back to blob builder")
                }
            }
            if (!b) {
                var bb = new Browser.BlobBuilder;
                bb.append(new Uint8Array(byteArray).buffer);
                b = bb.getBlob()
            }
            var url = Browser.URLObject.createObjectURL(b);
            assert(typeof url == "string", "createObjectURL must return a url as a string");
            var img = new Image;
            img.onload = function img_onload() {
                assert(img.complete, "Image " + name + " could not be decoded");
                var canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                Module["preloadedImages"][name] = canvas;
                Browser.URLObject.revokeObjectURL(url);
                if (onload) onload(byteArray)
            };
            img.onerror = function img_onerror(event) {
                console.log("Image " + url + " could not be decoded");
                if (onerror) onerror()
            };
            img.src = url
        };
        Module["preloadPlugins"].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin["canHandle"] = function audioPlugin_canHandle(name) {
            return !Module.noAudioDecoding && name.substr(-4) in {".ogg": 1, ".wav": 1, ".mp3": 1}
        };
        audioPlugin["handle"] = function audioPlugin_handle(byteArray, name, onload, onerror) {
            var done = false;

            function finish(audio) {
                if (done) return;
                done = true;
                Module["preloadedAudios"][name] = audio;
                if (onload) onload(byteArray)
            }

            function fail() {
                if (done) return;
                done = true;
                Module["preloadedAudios"][name] = new Audio;
                if (onerror) onerror()
            }

            if (Browser.hasBlobConstructor) {
                try {
                    var b = new Blob([byteArray], {type: Browser.getMimetype(name)})
                } catch (e) {
                    return fail()
                }
                var url = Browser.URLObject.createObjectURL(b);
                assert(typeof url == "string", "createObjectURL must return a url as a string");
                var audio = new Audio;
                audio.addEventListener("canplaythrough", function () {
                    finish(audio)
                }, false);
                audio.onerror = function audio_onerror(event) {
                    if (done) return;
                    console.log("warning: browser could not fully decode audio " + name + ", trying slower base64 approach");

                    function encode64(data) {
                        var BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                        var PAD = "=";
                        var ret = "";
                        var leftchar = 0;
                        var leftbits = 0;
                        for (var i = 0; i < data.length; i++) {
                            leftchar = leftchar << 8 | data[i];
                            leftbits += 8;
                            while (leftbits >= 6) {
                                var curr = leftchar >> leftbits - 6 & 63;
                                leftbits -= 6;
                                ret += BASE[curr]
                            }
                        }
                        if (leftbits == 2) {
                            ret += BASE[(leftchar & 3) << 4];
                            ret += PAD + PAD
                        } else if (leftbits == 4) {
                            ret += BASE[(leftchar & 15) << 2];
                            ret += PAD
                        }
                        return ret
                    }

                    audio.src = "data:audio/x-" + name.substr(-3) + ";base64," + encode64(byteArray);
                    finish(audio)
                };
                audio.src = url;
                Browser.safeSetTimeout(function () {
                    finish(audio)
                }, 1e4)
            } else {
                return fail()
            }
        };
        Module["preloadPlugins"].push(audioPlugin);

        function pointerLockChange() {
            Browser.pointerLock = document["pointerLockElement"] === Module["canvas"] || document["mozPointerLockElement"] === Module["canvas"] || document["webkitPointerLockElement"] === Module["canvas"] || document["msPointerLockElement"] === Module["canvas"]
        }

        var canvas = Module["canvas"];
        if (canvas) {
            canvas.requestPointerLock = canvas["requestPointerLock"] || canvas["mozRequestPointerLock"] || canvas["webkitRequestPointerLock"] || canvas["msRequestPointerLock"] || function () {
            };
            canvas.exitPointerLock = document["exitPointerLock"] || document["mozExitPointerLock"] || document["webkitExitPointerLock"] || document["msExitPointerLock"] || function () {
            };
            canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
            document.addEventListener("pointerlockchange", pointerLockChange, false);
            document.addEventListener("mozpointerlockchange", pointerLockChange, false);
            document.addEventListener("webkitpointerlockchange", pointerLockChange, false);
            document.addEventListener("mspointerlockchange", pointerLockChange, false);
            if (Module["elementPointerLock"]) {
                canvas.addEventListener("click", function (ev) {
                    if (!Browser.pointerLock && Module["canvas"].requestPointerLock) {
                        Module["canvas"].requestPointerLock();
                        ev.preventDefault()
                    }
                }, false)
            }
        }
    },
    createContext: function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx;
        var ctx;
        var contextHandle;
        if (useWebGL) {
            var contextAttributes = {
                antialias: false,
                alpha: false,
                majorVersion: typeof WebGL2RenderingContext !== "undefined" ? 2 : 1
            };
            if (webGLContextAttributes) {
                for (var attribute in webGLContextAttributes) {
                    contextAttributes[attribute] = webGLContextAttributes[attribute]
                }
            }
            if (typeof GL !== "undefined") {
                contextHandle = GL.createContext(canvas, contextAttributes);
                if (contextHandle) {
                    ctx = GL.getContext(contextHandle).GLctx
                }
            }
        } else {
            ctx = canvas.getContext("2d")
        }
        if (!ctx) return null;
        if (setInModule) {
            if (!useWebGL) assert(typeof GLctx === "undefined", "cannot set in module if GLctx is used, but we are a non-GL context that would replace it");
            Module.ctx = ctx;
            if (useWebGL) GL.makeContextCurrent(contextHandle);
            Module.useWebGL = useWebGL;
            Browser.moduleContextCreatedCallbacks.forEach(function (callback) {
                callback()
            });
            Browser.init()
        }
        return ctx
    },
    destroyContext: function (canvas, useWebGL, setInModule) {
    },
    fullscreenHandlersInstalled: false,
    lockPointer: undefined,
    resizeCanvas: undefined,
    requestFullscreen: function (lockPointer, resizeCanvas, vrDevice) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        Browser.vrDevice = vrDevice;
        if (typeof Browser.lockPointer === "undefined") Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === "undefined") Browser.resizeCanvas = false;
        if (typeof Browser.vrDevice === "undefined") Browser.vrDevice = null;
        var canvas = Module["canvas"];

        function fullscreenChange() {
            Browser.isFullscreen = false;
            var canvasContainer = canvas.parentNode;
            if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvasContainer) {
                canvas.exitFullscreen = document["exitFullscreen"] || document["cancelFullScreen"] || document["mozCancelFullScreen"] || document["msExitFullscreen"] || document["webkitCancelFullScreen"] || function () {
                };
                canvas.exitFullscreen = canvas.exitFullscreen.bind(document);
                if (Browser.lockPointer) canvas.requestPointerLock();
                Browser.isFullscreen = true;
                if (Browser.resizeCanvas) {
                    Browser.setFullscreenCanvasSize()
                } else {
                    Browser.updateCanvasDimensions(canvas)
                }
            } else {
                canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
                canvasContainer.parentNode.removeChild(canvasContainer);
                if (Browser.resizeCanvas) {
                    Browser.setWindowedCanvasSize()
                } else {
                    Browser.updateCanvasDimensions(canvas)
                }
            }
            if (Module["onFullScreen"]) Module["onFullScreen"](Browser.isFullscreen);
            if (Module["onFullscreen"]) Module["onFullscreen"](Browser.isFullscreen)
        }

        if (!Browser.fullscreenHandlersInstalled) {
            Browser.fullscreenHandlersInstalled = true;
            document.addEventListener("fullscreenchange", fullscreenChange, false);
            document.addEventListener("mozfullscreenchange", fullscreenChange, false);
            document.addEventListener("webkitfullscreenchange", fullscreenChange, false);
            document.addEventListener("MSFullscreenChange", fullscreenChange, false)
        }
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        canvasContainer.requestFullscreen = canvasContainer["requestFullscreen"] || canvasContainer["mozRequestFullScreen"] || canvasContainer["msRequestFullscreen"] || (canvasContainer["webkitRequestFullscreen"] ? function () {
            canvasContainer["webkitRequestFullscreen"](Element["ALLOW_KEYBOARD_INPUT"])
        } : null) || (canvasContainer["webkitRequestFullScreen"] ? function () {
            canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"])
        } : null);
        if (vrDevice) {
            canvasContainer.requestFullscreen({vrDisplay: vrDevice})
        } else {
            canvasContainer.requestFullscreen()
        }
    },
    requestFullScreen: function (lockPointer, resizeCanvas, vrDevice) {
        err("Browser.requestFullScreen() is deprecated. Please call Browser.requestFullscreen instead.");
        Browser.requestFullScreen = function (lockPointer, resizeCanvas, vrDevice) {
            return Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice)
        };
        return Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice)
    },
    nextRAF: 0,
    fakeRequestAnimationFrame: function (func) {
        var now = Date.now();
        if (Browser.nextRAF === 0) {
            Browser.nextRAF = now + 1e3 / 60
        } else {
            while (now + 2 >= Browser.nextRAF) {
                Browser.nextRAF += 1e3 / 60
            }
        }
        var delay = Math.max(Browser.nextRAF - now, 0);
        setTimeout(func, delay)
    },
    requestAnimationFrame: function requestAnimationFrame(func) {
        if (typeof window === "undefined") {
            Browser.fakeRequestAnimationFrame(func)
        } else {
            if (!window.requestAnimationFrame) {
                window.requestAnimationFrame = window["requestAnimationFrame"] || window["mozRequestAnimationFrame"] || window["webkitRequestAnimationFrame"] || window["msRequestAnimationFrame"] || window["oRequestAnimationFrame"] || Browser.fakeRequestAnimationFrame
            }
            window.requestAnimationFrame(func)
        }
    },
    safeCallback: function (func) {
        return function () {
            if (!ABORT) return func.apply(null, arguments)
        }
    },
    allowAsyncCallbacks: true,
    queuedAsyncCallbacks: [],
    pauseAsyncCallbacks: function () {
        Browser.allowAsyncCallbacks = false
    },
    resumeAsyncCallbacks: function () {
        Browser.allowAsyncCallbacks = true;
        if (Browser.queuedAsyncCallbacks.length > 0) {
            var callbacks = Browser.queuedAsyncCallbacks;
            Browser.queuedAsyncCallbacks = [];
            callbacks.forEach(function (func) {
                func()
            })
        }
    },
    safeRequestAnimationFrame: function (func) {
        return Browser.requestAnimationFrame(function () {
            if (ABORT) return;
            if (Browser.allowAsyncCallbacks) {
                func()
            } else {
                Browser.queuedAsyncCallbacks.push(func)
            }
        })
    },
    safeSetTimeout: function (func, timeout) {
        Module["noExitRuntime"] = true;
        return setTimeout(function () {
            if (ABORT) return;
            if (Browser.allowAsyncCallbacks) {
                func()
            } else {
                Browser.queuedAsyncCallbacks.push(func)
            }
        }, timeout)
    },
    safeSetInterval: function (func, timeout) {
        Module["noExitRuntime"] = true;
        return setInterval(function () {
            if (ABORT) return;
            if (Browser.allowAsyncCallbacks) {
                func()
            }
        }, timeout)
    },
    getMimetype: function (name) {
        return {
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "png": "image/png",
            "bmp": "image/bmp",
            "ogg": "audio/ogg",
            "wav": "audio/wav",
            "mp3": "audio/mpeg"
        }[name.substr(name.lastIndexOf(".") + 1)]
    },
    getUserMedia: function (func) {
        if (!window.getUserMedia) {
            window.getUserMedia = navigator["getUserMedia"] || navigator["mozGetUserMedia"]
        }
        window.getUserMedia(func)
    },
    getMovementX: function (event) {
        return event["movementX"] || event["mozMovementX"] || event["webkitMovementX"] || 0
    },
    getMovementY: function (event) {
        return event["movementY"] || event["mozMovementY"] || event["webkitMovementY"] || 0
    },
    getMouseWheelDelta: function (event) {
        var delta = 0;
        switch (event.type) {
            case"DOMMouseScroll":
                delta = event.detail / 3;
                break;
            case"mousewheel":
                delta = event.wheelDelta / 120;
                break;
            case"wheel":
                delta = event.deltaY;
                switch (event.deltaMode) {
                    case 0:
                        delta /= 100;
                        break;
                    case 1:
                        delta /= 3;
                        break;
                    case 2:
                        delta *= 80;
                        break;
                    default:
                        throw"unrecognized mouse wheel delta mode: " + event.deltaMode
                }
                break;
            default:
                throw"unrecognized mouse wheel event: " + event.type
        }
        return delta
    },
    mouseX: 0,
    mouseY: 0,
    mouseMovementX: 0,
    mouseMovementY: 0,
    touches: {},
    lastTouches: {},
    calculateMouseEvent: function (event) {
        if (Browser.pointerLock) {
            if (event.type != "mousemove" && "mozMovementX" in event) {
                Browser.mouseMovementX = Browser.mouseMovementY = 0
            } else {
                Browser.mouseMovementX = Browser.getMovementX(event);
                Browser.mouseMovementY = Browser.getMovementY(event)
            }
            if (typeof SDL != "undefined") {
                Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
                Browser.mouseY = SDL.mouseY + Browser.mouseMovementY
            } else {
                Browser.mouseX += Browser.mouseMovementX;
                Browser.mouseY += Browser.mouseMovementY
            }
        } else {
            var rect = Module["canvas"].getBoundingClientRect();
            var cw = Module["canvas"].width;
            var ch = Module["canvas"].height;
            var scrollX = typeof window.scrollX !== "undefined" ? window.scrollX : window.pageXOffset;
            var scrollY = typeof window.scrollY !== "undefined" ? window.scrollY : window.pageYOffset;
            assert(typeof scrollX !== "undefined" && typeof scrollY !== "undefined", "Unable to retrieve scroll position, mouse positions likely broken.");
            if (event.type === "touchstart" || event.type === "touchend" || event.type === "touchmove") {
                var touch = event.touch;
                if (touch === undefined) {
                    return
                }
                var adjustedX = touch.pageX - (scrollX + rect.left);
                var adjustedY = touch.pageY - (scrollY + rect.top);
                adjustedX = adjustedX * (cw / rect.width);
                adjustedY = adjustedY * (ch / rect.height);
                var coords = {x: adjustedX, y: adjustedY};
                if (event.type === "touchstart") {
                    Browser.lastTouches[touch.identifier] = coords;
                    Browser.touches[touch.identifier] = coords
                } else if (event.type === "touchend" || event.type === "touchmove") {
                    var last = Browser.touches[touch.identifier];
                    if (!last) last = coords;
                    Browser.lastTouches[touch.identifier] = last;
                    Browser.touches[touch.identifier] = coords
                }
                return
            }
            var x = event.pageX - (scrollX + rect.left);
            var y = event.pageY - (scrollY + rect.top);
            x = x * (cw / rect.width);
            y = y * (ch / rect.height);
            Browser.mouseMovementX = x - Browser.mouseX;
            Browser.mouseMovementY = y - Browser.mouseY;
            Browser.mouseX = x;
            Browser.mouseY = y
        }
    },
    asyncLoad: function (url, onload, onerror, noRunDep) {
        var dep = !noRunDep ? getUniqueRunDependency("al " + url) : "";
        Module["readAsync"](url, function (arrayBuffer) {
            assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
            onload(new Uint8Array(arrayBuffer));
            if (dep) removeRunDependency(dep)
        }, function (event) {
            if (onerror) {
                onerror()
            } else {
                throw'Loading data file "' + url + '" failed.'
            }
        });
        if (dep) addRunDependency(dep)
    },
    resizeListeners: [],
    updateResizeListeners: function () {
        var canvas = Module["canvas"];
        Browser.resizeListeners.forEach(function (listener) {
            listener(canvas.width, canvas.height)
        })
    },
    setCanvasSize: function (width, height, noUpdates) {
        var canvas = Module["canvas"];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners()
    },
    windowedWidth: 0,
    windowedHeight: 0,
    setFullscreenCanvasSize: function () {
        if (typeof SDL != "undefined") {
            var flags = HEAPU32[SDL.screen >> 2];
            flags = flags | 8388608;
            HEAP32[SDL.screen >> 2] = flags
        }
        Browser.updateCanvasDimensions(Module["canvas"]);
        Browser.updateResizeListeners()
    },
    setWindowedCanvasSize: function () {
        if (typeof SDL != "undefined") {
            var flags = HEAPU32[SDL.screen >> 2];
            flags = flags & ~8388608;
            HEAP32[SDL.screen >> 2] = flags
        }
        Browser.updateCanvasDimensions(Module["canvas"]);
        Browser.updateResizeListeners()
    },
    updateCanvasDimensions: function (canvas, wNative, hNative) {
        if (wNative && hNative) {
            canvas.widthNative = wNative;
            canvas.heightNative = hNative
        } else {
            wNative = canvas.widthNative;
            hNative = canvas.heightNative
        }
        var w = wNative;
        var h = hNative;
        if (Module["forcedAspectRatio"] && Module["forcedAspectRatio"] > 0) {
            if (w / h < Module["forcedAspectRatio"]) {
                w = Math.round(h * Module["forcedAspectRatio"])
            } else {
                h = Math.round(w / Module["forcedAspectRatio"])
            }
        }
        if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvas.parentNode && typeof screen != "undefined") {
            var factor = Math.min(screen.width / w, screen.height / h);
            w = Math.round(w * factor);
            h = Math.round(h * factor)
        }
        if (Browser.resizeCanvas) {
            if (canvas.width != w) canvas.width = w;
            if (canvas.height != h) canvas.height = h;
            if (typeof canvas.style != "undefined") {
                canvas.style.removeProperty("width");
                canvas.style.removeProperty("height")
            }
        } else {
            if (canvas.width != wNative) canvas.width = wNative;
            if (canvas.height != hNative) canvas.height = hNative;
            if (typeof canvas.style != "undefined") {
                if (w != wNative || h != hNative) {
                    canvas.style.setProperty("width", w + "px", "important");
                    canvas.style.setProperty("height", h + "px", "important")
                } else {
                    canvas.style.removeProperty("width");
                    canvas.style.removeProperty("height")
                }
            }
        }
    },
    wgetRequests: {},
    nextWgetRequestHandle: 0,
    getNextWgetRequestHandle: function () {
        var handle = Browser.nextWgetRequestHandle;
        Browser.nextWgetRequestHandle++;
        return handle
    }
};

function _emscripten_async_call(func, arg, millis) {
    Module["noExitRuntime"] = true;

    function wrapper() {
        getFuncWrapper(func, "vi")(arg)
    }

    if (millis >= 0) {
        Browser.safeSetTimeout(wrapper, millis)
    } else {
        Browser.safeRequestAnimationFrame(wrapper)
    }
}

function _emscripten_async_wget2_data(url, request, param, arg, free, onload, onerror, onprogress) {
    var _url = UTF8ToString(url);
    var _request = UTF8ToString(request);
    var _param = UTF8ToString(param);
    var http = new XMLHttpRequest;
    http.open(_request, _url, true);
    http.responseType = "arraybuffer";
    var handle = Browser.getNextWgetRequestHandle();
    http.onload = function http_onload(e) {
        if (http.status >= 200 && http.status < 300 || _url.substr(0, 4).toLowerCase() != "http") {
            var byteArray = new Uint8Array(http.response);
            var buffer = _malloc(byteArray.length);
            HEAPU8.set(byteArray, buffer);
            if (onload) dynCall_viiii(onload, handle, arg, buffer, byteArray.length);
            if (free) _free(buffer)
        } else {
            if (onerror) dynCall_viiii(onerror, handle, arg, http.status, http.statusText)
        }
        delete Browser.wgetRequests[handle]
    };
    http.onerror = function http_onerror(e) {
        if (onerror) {
            dynCall_viiii(onerror, handle, arg, http.status, http.statusText)
        }
        delete Browser.wgetRequests[handle]
    };
    http.onprogress = function http_onprogress(e) {
        if (onprogress) dynCall_viiii(onprogress, handle, arg, e.loaded, e.lengthComputable || e.lengthComputable === undefined ? e.total : 0)
    };
    http.onabort = function http_onabort(e) {
        delete Browser.wgetRequests[handle]
    };
    if (_request == "POST") {
        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        http.send(_param)
    } else {
        http.send(null)
    }
    Browser.wgetRequests[handle] = http;
    return handle
}

function _emscripten_async_wget_data(url, arg, onload, onerror) {
    Browser.asyncLoad(UTF8ToString(url), function (byteArray) {
        var buffer = _malloc(byteArray.length);
        HEAPU8.set(byteArray, buffer);
        dynCall_viii(onload, arg, buffer, byteArray.length);
        _free(buffer)
    }, function () {
        if (onerror) dynCall_vi(onerror, arg)
    }, true)
}

var JSEvents = {
    keyEvent: 0,
    mouseEvent: 0,
    wheelEvent: 0,
    uiEvent: 0,
    focusEvent: 0,
    deviceOrientationEvent: 0,
    deviceMotionEvent: 0,
    fullscreenChangeEvent: 0,
    pointerlockChangeEvent: 0,
    visibilityChangeEvent: 0,
    touchEvent: 0,
    previousFullscreenElement: null,
    previousScreenX: null,
    previousScreenY: null,
    removeEventListenersRegistered: false,
    removeAllEventListeners: function () {
        for (var i = JSEvents.eventHandlers.length - 1; i >= 0; --i) {
            JSEvents._removeHandler(i)
        }
        JSEvents.eventHandlers = [];
        JSEvents.deferredCalls = []
    },
    registerRemoveEventListeners: function () {
        if (!JSEvents.removeEventListenersRegistered) {
            __ATEXIT__.push(JSEvents.removeAllEventListeners);
            JSEvents.removeEventListenersRegistered = true
        }
    },
    deferredCalls: [],
    deferCall: function (targetFunction, precedence, argsList) {
        function arraysHaveEqualContent(arrA, arrB) {
            if (arrA.length != arrB.length) return false;
            for (var i in arrA) {
                if (arrA[i] != arrB[i]) return false
            }
            return true
        }

        for (var i in JSEvents.deferredCalls) {
            var call = JSEvents.deferredCalls[i];
            if (call.targetFunction == targetFunction && arraysHaveEqualContent(call.argsList, argsList)) {
                return
            }
        }
        JSEvents.deferredCalls.push({targetFunction: targetFunction, precedence: precedence, argsList: argsList});
        JSEvents.deferredCalls.sort(function (x, y) {
            return x.precedence < y.precedence
        })
    },
    removeDeferredCalls: function (targetFunction) {
        for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
            if (JSEvents.deferredCalls[i].targetFunction == targetFunction) {
                JSEvents.deferredCalls.splice(i, 1);
                --i
            }
        }
    },
    canPerformEventHandlerRequests: function () {
        return JSEvents.inEventHandler && JSEvents.currentEventHandler.allowsDeferredCalls
    },
    runDeferredCalls: function () {
        if (!JSEvents.canPerformEventHandlerRequests()) {
            return
        }
        for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
            var call = JSEvents.deferredCalls[i];
            JSEvents.deferredCalls.splice(i, 1);
            --i;
            call.targetFunction.apply(this, call.argsList)
        }
    },
    inEventHandler: 0,
    currentEventHandler: null,
    eventHandlers: [],
    isInternetExplorer: function () {
        return navigator.userAgent.indexOf("MSIE") !== -1 || navigator.appVersion.indexOf("Trident/") > 0
    },
    removeAllHandlersOnTarget: function (target, eventTypeString) {
        for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
            if (JSEvents.eventHandlers[i].target == target && (!eventTypeString || eventTypeString == JSEvents.eventHandlers[i].eventTypeString)) {
                JSEvents._removeHandler(i--)
            }
        }
    },
    _removeHandler: function (i) {
        var h = JSEvents.eventHandlers[i];
        h.target.removeEventListener(h.eventTypeString, h.eventListenerFunc, h.useCapture);
        JSEvents.eventHandlers.splice(i, 1)
    },
    registerOrRemoveHandler: function (eventHandler) {
        var jsEventHandler = function jsEventHandler(event) {
            ++JSEvents.inEventHandler;
            JSEvents.currentEventHandler = eventHandler;
            JSEvents.runDeferredCalls();
            eventHandler.handlerFunc(event);
            JSEvents.runDeferredCalls();
            --JSEvents.inEventHandler
        };
        if (eventHandler.callbackfunc) {
            eventHandler.eventListenerFunc = jsEventHandler;
            eventHandler.target.addEventListener(eventHandler.eventTypeString, jsEventHandler, eventHandler.useCapture);
            JSEvents.eventHandlers.push(eventHandler);
            JSEvents.registerRemoveEventListeners()
        } else {
            for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
                if (JSEvents.eventHandlers[i].target == eventHandler.target && JSEvents.eventHandlers[i].eventTypeString == eventHandler.eventTypeString) {
                    JSEvents._removeHandler(i--)
                }
            }
        }
    },
    getBoundingClientRectOrZeros: function (target) {
        return target.getBoundingClientRect ? target.getBoundingClientRect() : {left: 0, top: 0}
    },
    pageScrollPos: function () {
        if (window.pageXOffset > 0 || window.pageYOffset > 0) {
            return [window.pageXOffset, window.pageYOffset]
        }
        if (typeof document.documentElement.scrollLeft !== "undefined" || typeof document.documentElement.scrollTop !== "undefined") {
            return [document.documentElement.scrollLeft, document.documentElement.scrollTop]
        }
        return [document.body.scrollLeft | 0, document.body.scrollTop | 0]
    },
    getNodeNameForTarget: function (target) {
        if (!target) return "";
        if (target == window) return "#window";
        if (target == screen) return "#screen";
        return target && target.nodeName ? target.nodeName : ""
    },
    tick: function () {
        if (window["performance"] && window["performance"]["now"]) return window["performance"]["now"](); else return Date.now()
    },
    fullscreenEnabled: function () {
        return document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled
    }
};

function __setLetterbox(element, topBottom, leftRight) {
    if (JSEvents.isInternetExplorer()) {
        element.style.marginLeft = element.style.marginRight = leftRight + "px";
        element.style.marginTop = element.style.marginBottom = topBottom + "px"
    } else {
        element.style.paddingLeft = element.style.paddingRight = leftRight + "px";
        element.style.paddingTop = element.style.paddingBottom = topBottom + "px"
    }
}

function __hideEverythingExceptGivenElement(onlyVisibleElement) {
    var child = onlyVisibleElement;
    var parent = child.parentNode;
    var hiddenElements = [];
    while (child != document.body) {
        var children = parent.children;
        for (var i = 0; i < children.length; ++i) {
            if (children[i] != child) {
                hiddenElements.push({node: children[i], displayState: children[i].style.display});
                children[i].style.display = "none"
            }
        }
        child = parent;
        parent = parent.parentNode
    }
    return hiddenElements
}

var __restoreOldWindowedStyle = null;
var __specialEventTargets = [0, typeof document !== "undefined" ? document : 0, typeof window !== "undefined" ? window : 0];

function __findEventTarget(target) {
    warnOnce("Rules for selecting event targets in HTML5 API are changing: instead of using document.getElementById() that only can refer to elements by their DOM ID, new event target selection mechanism uses the more flexible function document.querySelector() that can look up element names, classes, and complex CSS selectors. Build with -s DISABLE_DEPRECATED_FIND_EVENT_TARGET_BEHAVIOR=1 to change to the new lookup rules. See https://github.com/emscripten-core/emscripten/pull/7977 for more details.");
    try {
        if (!target) return window;
        if (typeof target === "number") target = __specialEventTargets[target] || UTF8ToString(target);
        if (target === "#window") return window; else if (target === "#document") return document; else if (target === "#screen") return screen; else if (target === "#canvas") return Module["canvas"];
        return typeof target === "string" ? document.getElementById(target) : target
    } catch (e) {
        return null
    }
}

function __findCanvasEventTarget(target) {
    if (typeof target === "number") target = UTF8ToString(target);
    if (!target || target === "#canvas") {
        if (typeof GL !== "undefined" && GL.offscreenCanvases["canvas"]) return GL.offscreenCanvases["canvas"];
        return Module["canvas"]
    }
    if (typeof GL !== "undefined" && GL.offscreenCanvases[target]) return GL.offscreenCanvases[target];
    return __findEventTarget(target)
}

function _emscripten_get_canvas_element_size(target, width, height) {
    var canvas = __findCanvasEventTarget(target);
    if (!canvas) return -4;
    HEAP32[width >> 2] = canvas.width;
    HEAP32[height >> 2] = canvas.height
}

function __get_canvas_element_size(target) {
    var stackTop = stackSave();
    var w = stackAlloc(8);
    var h = w + 4;
    var targetInt = stackAlloc(target.id.length + 1);
    stringToUTF8(target.id, targetInt, target.id.length + 1);
    var ret = _emscripten_get_canvas_element_size(targetInt, w, h);
    var size = [HEAP32[w >> 2], HEAP32[h >> 2]];
    stackRestore(stackTop);
    return size
}

function _emscripten_set_canvas_element_size(target, width, height) {
    var canvas = __findCanvasEventTarget(target);
    if (!canvas) return -4;
    canvas.width = width;
    canvas.height = height;
    return 0
}

function __set_canvas_element_size(target, width, height) {
    if (!target.controlTransferredOffscreen) {
        target.width = width;
        target.height = height
    } else {
        var stackTop = stackSave();
        var targetInt = stackAlloc(target.id.length + 1);
        stringToUTF8(target.id, targetInt, target.id.length + 1);
        _emscripten_set_canvas_element_size(targetInt, width, height);
        stackRestore(stackTop)
    }
}

function __registerRestoreOldStyle(canvas) {
    var canvasSize = __get_canvas_element_size(canvas);
    var oldWidth = canvasSize[0];
    var oldHeight = canvasSize[1];
    var oldCssWidth = canvas.style.width;
    var oldCssHeight = canvas.style.height;
    var oldBackgroundColor = canvas.style.backgroundColor;
    var oldDocumentBackgroundColor = document.body.style.backgroundColor;
    var oldPaddingLeft = canvas.style.paddingLeft;
    var oldPaddingRight = canvas.style.paddingRight;
    var oldPaddingTop = canvas.style.paddingTop;
    var oldPaddingBottom = canvas.style.paddingBottom;
    var oldMarginLeft = canvas.style.marginLeft;
    var oldMarginRight = canvas.style.marginRight;
    var oldMarginTop = canvas.style.marginTop;
    var oldMarginBottom = canvas.style.marginBottom;
    var oldDocumentBodyMargin = document.body.style.margin;
    var oldDocumentOverflow = document.documentElement.style.overflow;
    var oldDocumentScroll = document.body.scroll;
    var oldImageRendering = canvas.style.imageRendering;

    function restoreOldStyle() {
        var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
        if (!fullscreenElement) {
            document.removeEventListener("fullscreenchange", restoreOldStyle);
            document.removeEventListener("mozfullscreenchange", restoreOldStyle);
            document.removeEventListener("webkitfullscreenchange", restoreOldStyle);
            document.removeEventListener("MSFullscreenChange", restoreOldStyle);
            __set_canvas_element_size(canvas, oldWidth, oldHeight);
            canvas.style.width = oldCssWidth;
            canvas.style.height = oldCssHeight;
            canvas.style.backgroundColor = oldBackgroundColor;
            if (!oldDocumentBackgroundColor) document.body.style.backgroundColor = "white";
            document.body.style.backgroundColor = oldDocumentBackgroundColor;
            canvas.style.paddingLeft = oldPaddingLeft;
            canvas.style.paddingRight = oldPaddingRight;
            canvas.style.paddingTop = oldPaddingTop;
            canvas.style.paddingBottom = oldPaddingBottom;
            canvas.style.marginLeft = oldMarginLeft;
            canvas.style.marginRight = oldMarginRight;
            canvas.style.marginTop = oldMarginTop;
            canvas.style.marginBottom = oldMarginBottom;
            document.body.style.margin = oldDocumentBodyMargin;
            document.documentElement.style.overflow = oldDocumentOverflow;
            document.body.scroll = oldDocumentScroll;
            canvas.style.imageRendering = oldImageRendering;
            if (canvas.GLctxObject) canvas.GLctxObject.GLctx.viewport(0, 0, oldWidth, oldHeight);
            if (__currentFullscreenStrategy.canvasResizedCallback) {
                dynCall_iiii(__currentFullscreenStrategy.canvasResizedCallback, 37, 0, __currentFullscreenStrategy.canvasResizedCallbackUserData)
            }
        }
    }

    document.addEventListener("fullscreenchange", restoreOldStyle);
    document.addEventListener("mozfullscreenchange", restoreOldStyle);
    document.addEventListener("webkitfullscreenchange", restoreOldStyle);
    document.addEventListener("MSFullscreenChange", restoreOldStyle);
    return restoreOldStyle
}

function __restoreHiddenElements(hiddenElements) {
    for (var i = 0; i < hiddenElements.length; ++i) {
        hiddenElements[i].node.style.display = hiddenElements[i].displayState
    }
}

var __currentFullscreenStrategy = {};

function __softFullscreenResizeWebGLRenderTarget() {
    var inHiDPIFullscreenMode = __currentFullscreenStrategy.canvasResolutionScaleMode == 2;
    var inAspectRatioFixedFullscreenMode = __currentFullscreenStrategy.scaleMode == 2;
    var inPixelPerfectFullscreenMode = __currentFullscreenStrategy.canvasResolutionScaleMode != 0;
    var inCenteredWithoutScalingFullscreenMode = __currentFullscreenStrategy.scaleMode == 3;
    var screenWidth = inHiDPIFullscreenMode ? Math.round(window.innerWidth * window.devicePixelRatio) : window.innerWidth;
    var screenHeight = inHiDPIFullscreenMode ? Math.round(window.innerHeight * window.devicePixelRatio) : window.innerHeight;
    var w = screenWidth;
    var h = screenHeight;
    var canvas = __currentFullscreenStrategy.target;
    var canvasSize = __get_canvas_element_size(canvas);
    var x = canvasSize[0];
    var y = canvasSize[1];
    var topMargin;
    if (inAspectRatioFixedFullscreenMode) {
        if (w * y < x * h) h = w * y / x | 0; else if (w * y > x * h) w = h * x / y | 0;
        topMargin = (screenHeight - h) / 2 | 0
    }
    if (inPixelPerfectFullscreenMode) {
        __set_canvas_element_size(canvas, w, h);
        if (canvas.GLctxObject) canvas.GLctxObject.GLctx.viewport(0, 0, w, h)
    }
    if (inHiDPIFullscreenMode) {
        topMargin /= window.devicePixelRatio;
        w /= window.devicePixelRatio;
        h /= window.devicePixelRatio;
        w = Math.round(w * 1e4) / 1e4;
        h = Math.round(h * 1e4) / 1e4;
        topMargin = Math.round(topMargin * 1e4) / 1e4
    }
    if (inCenteredWithoutScalingFullscreenMode) {
        var t = (window.innerHeight - parseInt(canvas.style.height)) / 2;
        var b = (window.innerWidth - parseInt(canvas.style.width)) / 2;
        __setLetterbox(canvas, t, b)
    } else {
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        var b = (window.innerWidth - w) / 2;
        __setLetterbox(canvas, topMargin, b)
    }
    if (!inCenteredWithoutScalingFullscreenMode && __currentFullscreenStrategy.canvasResizedCallback) {
        dynCall_iiii(__currentFullscreenStrategy.canvasResizedCallback, 37, 0, __currentFullscreenStrategy.canvasResizedCallbackUserData)
    }
}

function _JSEvents_resizeCanvasForFullscreen(target, strategy) {
    var restoreOldStyle = __registerRestoreOldStyle(target);
    var cssWidth = strategy.softFullscreen ? window.innerWidth : screen.width;
    var cssHeight = strategy.softFullscreen ? window.innerHeight : screen.height;
    var rect = target.getBoundingClientRect();
    var windowedCssWidth = rect.right - rect.left;
    var windowedCssHeight = rect.bottom - rect.top;
    var canvasSize = __get_canvas_element_size(target);
    var windowedRttWidth = canvasSize[0];
    var windowedRttHeight = canvasSize[1];
    if (strategy.scaleMode == 3) {
        __setLetterbox(target, (cssHeight - windowedCssHeight) / 2, (cssWidth - windowedCssWidth) / 2);
        cssWidth = windowedCssWidth;
        cssHeight = windowedCssHeight
    } else if (strategy.scaleMode == 2) {
        if (cssWidth * windowedRttHeight < windowedRttWidth * cssHeight) {
            var desiredCssHeight = windowedRttHeight * cssWidth / windowedRttWidth;
            __setLetterbox(target, (cssHeight - desiredCssHeight) / 2, 0);
            cssHeight = desiredCssHeight
        } else {
            var desiredCssWidth = windowedRttWidth * cssHeight / windowedRttHeight;
            __setLetterbox(target, 0, (cssWidth - desiredCssWidth) / 2);
            cssWidth = desiredCssWidth
        }
    }
    if (!target.style.backgroundColor) target.style.backgroundColor = "black";
    if (!document.body.style.backgroundColor) document.body.style.backgroundColor = "black";
    target.style.width = cssWidth + "px";
    target.style.height = cssHeight + "px";
    if (strategy.filteringMode == 1) {
        target.style.imageRendering = "optimizeSpeed";
        target.style.imageRendering = "-moz-crisp-edges";
        target.style.imageRendering = "-o-crisp-edges";
        target.style.imageRendering = "-webkit-optimize-contrast";
        target.style.imageRendering = "optimize-contrast";
        target.style.imageRendering = "crisp-edges";
        target.style.imageRendering = "pixelated"
    }
    var dpiScale = strategy.canvasResolutionScaleMode == 2 ? window.devicePixelRatio : 1;
    if (strategy.canvasResolutionScaleMode != 0) {
        var newWidth = cssWidth * dpiScale | 0;
        var newHeight = cssHeight * dpiScale | 0;
        __set_canvas_element_size(target, newWidth, newHeight);
        if (target.GLctxObject) target.GLctxObject.GLctx.viewport(0, 0, newWidth, newHeight)
    }
    return restoreOldStyle
}

function _emscripten_enter_soft_fullscreen(target, fullscreenStrategy) {
    if (!target) target = "#canvas";
    target = __findEventTarget(target);
    if (!target) return -4;
    var strategy = {};
    strategy.scaleMode = HEAP32[fullscreenStrategy >> 2];
    strategy.canvasResolutionScaleMode = HEAP32[fullscreenStrategy + 4 >> 2];
    strategy.filteringMode = HEAP32[fullscreenStrategy + 8 >> 2];
    strategy.canvasResizedCallback = HEAP32[fullscreenStrategy + 12 >> 2];
    strategy.canvasResizedCallbackUserData = HEAP32[fullscreenStrategy + 16 >> 2];
    strategy.target = target;
    strategy.softFullscreen = true;
    var restoreOldStyle = _JSEvents_resizeCanvasForFullscreen(target, strategy);
    document.documentElement.style.overflow = "hidden";
    document.body.scroll = "no";
    document.body.style.margin = "0px";
    var hiddenElements = __hideEverythingExceptGivenElement(target);

    function restoreWindowedState() {
        restoreOldStyle();
        __restoreHiddenElements(hiddenElements);
        window.removeEventListener("resize", __softFullscreenResizeWebGLRenderTarget);
        if (strategy.canvasResizedCallback) {
            dynCall_iiii(strategy.canvasResizedCallback, 37, 0, strategy.canvasResizedCallbackUserData)
        }
        __currentFullscreenStrategy = 0
    }

    __restoreOldWindowedStyle = restoreWindowedState;
    __currentFullscreenStrategy = strategy;
    window.addEventListener("resize", __softFullscreenResizeWebGLRenderTarget);
    if (strategy.canvasResizedCallback) {
        dynCall_iiii(strategy.canvasResizedCallback, 37, 0, strategy.canvasResizedCallbackUserData)
    }
    return 0
}

function _emscripten_exit_soft_fullscreen() {
    if (__restoreOldWindowedStyle) __restoreOldWindowedStyle();
    __restoreOldWindowedStyle = null;
    return 0
}

function _emscripten_get_device_pixel_ratio() {
    return window.devicePixelRatio || 1
}

function __fillFullscreenChangeEventData(eventStruct, e) {
    var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
    var isFullscreen = !!fullscreenElement;
    HEAP32[eventStruct >> 2] = isFullscreen;
    HEAP32[eventStruct + 4 >> 2] = JSEvents.fullscreenEnabled();
    var reportedElement = isFullscreen ? fullscreenElement : JSEvents.previousFullscreenElement;
    var nodeName = JSEvents.getNodeNameForTarget(reportedElement);
    var id = reportedElement && reportedElement.id ? reportedElement.id : "";
    stringToUTF8(nodeName, eventStruct + 8, 128);
    stringToUTF8(id, eventStruct + 136, 128);
    HEAP32[eventStruct + 264 >> 2] = reportedElement ? reportedElement.clientWidth : 0;
    HEAP32[eventStruct + 268 >> 2] = reportedElement ? reportedElement.clientHeight : 0;
    HEAP32[eventStruct + 272 >> 2] = screen.width;
    HEAP32[eventStruct + 276 >> 2] = screen.height;
    if (isFullscreen) {
        JSEvents.previousFullscreenElement = fullscreenElement
    }
}

function _emscripten_get_fullscreen_status(fullscreenStatus) {
    if (typeof JSEvents.fullscreenEnabled() === "undefined") return -1;
    __fillFullscreenChangeEventData(fullscreenStatus);
    return 0
}

function _emscripten_get_heap_size() {
    return TOTAL_MEMORY
}

function __reallyNegative(x) {
    return x < 0 || x === 0 && 1 / x === -Infinity
}

function __formatString(format, varargs) {
    assert((varargs & 3) === 0);
    var textIndex = format;
    var argIndex = varargs;

    function prepVararg(ptr, type) {
        if (type === "double" || type === "i64") {
            if (ptr & 7) {
                assert((ptr & 7) === 4);
                ptr += 4
            }
        } else {
            assert((ptr & 3) === 0)
        }
        return ptr
    }

    function getNextArg(type) {
        var ret;
        argIndex = prepVararg(argIndex, type);
        if (type === "double") {
            ret = HEAPF64[argIndex >> 3];
            argIndex += 8
        } else if (type == "i64") {
            ret = [HEAP32[argIndex >> 2], HEAP32[argIndex + 4 >> 2]];
            argIndex += 8
        } else {
            assert((argIndex & 3) === 0);
            type = "i32";
            ret = HEAP32[argIndex >> 2];
            argIndex += 4
        }
        return ret
    }

    var ret = [];
    var curr, next, currArg;
    while (1) {
        var startTextIndex = textIndex;
        curr = HEAP8[textIndex >> 0];
        if (curr === 0) break;
        next = HEAP8[textIndex + 1 >> 0];
        if (curr == 37) {
            var flagAlwaysSigned = false;
            var flagLeftAlign = false;
            var flagAlternative = false;
            var flagZeroPad = false;
            var flagPadSign = false;
            flagsLoop:while (1) {
                switch (next) {
                    case 43:
                        flagAlwaysSigned = true;
                        break;
                    case 45:
                        flagLeftAlign = true;
                        break;
                    case 35:
                        flagAlternative = true;
                        break;
                    case 48:
                        if (flagZeroPad) {
                            break flagsLoop
                        } else {
                            flagZeroPad = true;
                            break
                        }
                    case 32:
                        flagPadSign = true;
                        break;
                    default:
                        break flagsLoop
                }
                textIndex++;
                next = HEAP8[textIndex + 1 >> 0]
            }
            var width = 0;
            if (next == 42) {
                width = getNextArg("i32");
                textIndex++;
                next = HEAP8[textIndex + 1 >> 0]
            } else {
                while (next >= 48 && next <= 57) {
                    width = width * 10 + (next - 48);
                    textIndex++;
                    next = HEAP8[textIndex + 1 >> 0]
                }
            }
            var precisionSet = false, precision = -1;
            if (next == 46) {
                precision = 0;
                precisionSet = true;
                textIndex++;
                next = HEAP8[textIndex + 1 >> 0];
                if (next == 42) {
                    precision = getNextArg("i32");
                    textIndex++
                } else {
                    while (1) {
                        var precisionChr = HEAP8[textIndex + 1 >> 0];
                        if (precisionChr < 48 || precisionChr > 57) break;
                        precision = precision * 10 + (precisionChr - 48);
                        textIndex++
                    }
                }
                next = HEAP8[textIndex + 1 >> 0]
            }
            if (precision < 0) {
                precision = 6;
                precisionSet = false
            }
            var argSize;
            switch (String.fromCharCode(next)) {
                case"h":
                    var nextNext = HEAP8[textIndex + 2 >> 0];
                    if (nextNext == 104) {
                        textIndex++;
                        argSize = 1
                    } else {
                        argSize = 2
                    }
                    break;
                case"l":
                    var nextNext = HEAP8[textIndex + 2 >> 0];
                    if (nextNext == 108) {
                        textIndex++;
                        argSize = 8
                    } else {
                        argSize = 4
                    }
                    break;
                case"L":
                case"q":
                case"j":
                    argSize = 8;
                    break;
                case"z":
                case"t":
                case"I":
                    argSize = 4;
                    break;
                default:
                    argSize = null
            }
            if (argSize) textIndex++;
            next = HEAP8[textIndex + 1 >> 0];
            switch (String.fromCharCode(next)) {
                case"d":
                case"i":
                case"u":
                case"o":
                case"x":
                case"X":
                case"p": {
                    var signed = next == 100 || next == 105;
                    argSize = argSize || 4;
                    currArg = getNextArg("i" + argSize * 8);
                    var argText;
                    if (argSize == 8) {
                        currArg = makeBigInt(currArg[0], currArg[1], next == 117)
                    }
                    if (argSize <= 4) {
                        var limit = Math.pow(256, argSize) - 1;
                        currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8)
                    }
                    var currAbsArg = Math.abs(currArg);
                    var prefix = "";
                    if (next == 100 || next == 105) {
                        argText = reSign(currArg, 8 * argSize, 1).toString(10)
                    } else if (next == 117) {
                        argText = unSign(currArg, 8 * argSize, 1).toString(10);
                        currArg = Math.abs(currArg)
                    } else if (next == 111) {
                        argText = (flagAlternative ? "0" : "") + currAbsArg.toString(8)
                    } else if (next == 120 || next == 88) {
                        prefix = flagAlternative && currArg != 0 ? "0x" : "";
                        if (currArg < 0) {
                            currArg = -currArg;
                            argText = (currAbsArg - 1).toString(16);
                            var buffer = [];
                            for (var i = 0; i < argText.length; i++) {
                                buffer.push((15 - parseInt(argText[i], 16)).toString(16))
                            }
                            argText = buffer.join("");
                            while (argText.length < argSize * 2) argText = "f" + argText
                        } else {
                            argText = currAbsArg.toString(16)
                        }
                        if (next == 88) {
                            prefix = prefix.toUpperCase();
                            argText = argText.toUpperCase()
                        }
                    } else if (next == 112) {
                        if (currAbsArg === 0) {
                            argText = "(nil)"
                        } else {
                            prefix = "0x";
                            argText = currAbsArg.toString(16)
                        }
                    }
                    if (precisionSet) {
                        while (argText.length < precision) {
                            argText = "0" + argText
                        }
                    }
                    if (currArg >= 0) {
                        if (flagAlwaysSigned) {
                            prefix = "+" + prefix
                        } else if (flagPadSign) {
                            prefix = " " + prefix
                        }
                    }
                    if (argText.charAt(0) == "-") {
                        prefix = "-" + prefix;
                        argText = argText.substr(1)
                    }
                    while (prefix.length + argText.length < width) {
                        if (flagLeftAlign) {
                            argText += " "
                        } else {
                            if (flagZeroPad) {
                                argText = "0" + argText
                            } else {
                                prefix = " " + prefix
                            }
                        }
                    }
                    argText = prefix + argText;
                    argText.split("").forEach(function (chr) {
                        ret.push(chr.charCodeAt(0))
                    });
                    break
                }
                case"f":
                case"F":
                case"e":
                case"E":
                case"g":
                case"G": {
                    currArg = getNextArg("double");
                    var argText;
                    if (isNaN(currArg)) {
                        argText = "nan";
                        flagZeroPad = false
                    } else if (!isFinite(currArg)) {
                        argText = (currArg < 0 ? "-" : "") + "inf";
                        flagZeroPad = false
                    } else {
                        var isGeneral = false;
                        var effectivePrecision = Math.min(precision, 20);
                        if (next == 103 || next == 71) {
                            isGeneral = true;
                            precision = precision || 1;
                            var exponent = parseInt(currArg.toExponential(effectivePrecision).split("e")[1], 10);
                            if (precision > exponent && exponent >= -4) {
                                next = (next == 103 ? "f" : "F").charCodeAt(0);
                                precision -= exponent + 1
                            } else {
                                next = (next == 103 ? "e" : "E").charCodeAt(0);
                                precision--
                            }
                            effectivePrecision = Math.min(precision, 20)
                        }
                        if (next == 101 || next == 69) {
                            argText = currArg.toExponential(effectivePrecision);
                            if (/[eE][-+]\d$/.test(argText)) {
                                argText = argText.slice(0, -1) + "0" + argText.slice(-1)
                            }
                        } else if (next == 102 || next == 70) {
                            argText = currArg.toFixed(effectivePrecision);
                            if (currArg === 0 && __reallyNegative(currArg)) {
                                argText = "-" + argText
                            }
                        }
                        var parts = argText.split("e");
                        if (isGeneral && !flagAlternative) {
                            while (parts[0].length > 1 && parts[0].indexOf(".") != -1 && (parts[0].slice(-1) == "0" || parts[0].slice(-1) == ".")) {
                                parts[0] = parts[0].slice(0, -1)
                            }
                        } else {
                            if (flagAlternative && argText.indexOf(".") == -1) parts[0] += ".";
                            while (precision > effectivePrecision++) parts[0] += "0"
                        }
                        argText = parts[0] + (parts.length > 1 ? "e" + parts[1] : "");
                        if (next == 69) argText = argText.toUpperCase();
                        if (currArg >= 0) {
                            if (flagAlwaysSigned) {
                                argText = "+" + argText
                            } else if (flagPadSign) {
                                argText = " " + argText
                            }
                        }
                    }
                    while (argText.length < width) {
                        if (flagLeftAlign) {
                            argText += " "
                        } else {
                            if (flagZeroPad && (argText[0] == "-" || argText[0] == "+")) {
                                argText = argText[0] + "0" + argText.slice(1)
                            } else {
                                argText = (flagZeroPad ? "0" : " ") + argText
                            }
                        }
                    }
                    if (next < 97) argText = argText.toUpperCase();
                    argText.split("").forEach(function (chr) {
                        ret.push(chr.charCodeAt(0))
                    });
                    break
                }
                case"s": {
                    var arg = getNextArg("i8*");
                    var argLength = arg ? _strlen(arg) : "(null)".length;
                    if (precisionSet) argLength = Math.min(argLength, precision);
                    if (!flagLeftAlign) {
                        while (argLength < width--) {
                            ret.push(32)
                        }
                    }
                    if (arg) {
                        for (var i = 0; i < argLength; i++) {
                            ret.push(HEAPU8[arg++ >> 0])
                        }
                    } else {
                        ret = ret.concat(intArrayFromString("(null)".substr(0, argLength), true))
                    }
                    if (flagLeftAlign) {
                        while (argLength < width--) {
                            ret.push(32)
                        }
                    }
                    break
                }
                case"c": {
                    if (flagLeftAlign) ret.push(getNextArg("i8"));
                    while (--width > 0) {
                        ret.push(32)
                    }
                    if (!flagLeftAlign) ret.push(getNextArg("i8"));
                    break
                }
                case"n": {
                    var ptr = getNextArg("i32*");
                    HEAP32[ptr >> 2] = ret.length;
                    break
                }
                case"%": {
                    ret.push(curr);
                    break
                }
                default: {
                    for (var i = startTextIndex; i < textIndex + 2; i++) {
                        ret.push(HEAP8[i >> 0])
                    }
                }
            }
            textIndex += 2
        } else {
            ret.push(curr);
            textIndex += 1
        }
    }
    return ret
}

function __emscripten_traverse_stack(args) {
    if (!args || !args.callee || !args.callee.name) {
        return [null, "", ""]
    }
    var funstr = args.callee.toString();
    var funcname = args.callee.name;
    var str = "(";
    var first = true;
    for (var i in args) {
        var a = args[i];
        if (!first) {
            str += ", "
        }
        first = false;
        if (typeof a === "number" || typeof a === "string") {
            str += a
        } else {
            str += "(" + typeof a + ")"
        }
    }
    str += ")";
    var caller = args.callee.caller;
    args = caller ? caller.arguments : [];
    if (first) str = "";
    return [args, funcname, str]
}

function _emscripten_get_callstack_js(flags) {
    var callstack = jsStackTrace();
    var iThisFunc = callstack.lastIndexOf("_emscripten_log");
    var iThisFunc2 = callstack.lastIndexOf("_emscripten_get_callstack");
    var iNextLine = callstack.indexOf("\n", Math.max(iThisFunc, iThisFunc2)) + 1;
    callstack = callstack.slice(iNextLine);
    if (flags & 8 && typeof emscripten_source_map === "undefined") {
        warnOnce('Source map information is not available, emscripten_log with EM_LOG_C_STACK will be ignored. Build with "--pre-js $EMSCRIPTEN/src/emscripten-source-map.min.js" linker flag to add source map loading to code.');
        flags ^= 8;
        flags |= 16
    }
    var stack_args = null;
    if (flags & 128) {
        stack_args = __emscripten_traverse_stack(arguments);
        while (stack_args[1].indexOf("_emscripten_") >= 0) stack_args = __emscripten_traverse_stack(stack_args[0])
    }
    var lines = callstack.split("\n");
    callstack = "";
    var newFirefoxRe = new RegExp("\\s*(.*?)@(.*?):([0-9]+):([0-9]+)");
    var firefoxRe = new RegExp("\\s*(.*?)@(.*):(.*)(:(.*))?");
    var chromeRe = new RegExp("\\s*at (.*?) \\((.*):(.*):(.*)\\)");
    for (var l in lines) {
        var line = lines[l];
        var jsSymbolName = "";
        var file = "";
        var lineno = 0;
        var column = 0;
        var parts = chromeRe.exec(line);
        if (parts && parts.length == 5) {
            jsSymbolName = parts[1];
            file = parts[2];
            lineno = parts[3];
            column = parts[4]
        } else {
            parts = newFirefoxRe.exec(line);
            if (!parts) parts = firefoxRe.exec(line);
            if (parts && parts.length >= 4) {
                jsSymbolName = parts[1];
                file = parts[2];
                lineno = parts[3];
                column = parts[4] | 0
            } else {
                callstack += line + "\n";
                continue
            }
        }
        var cSymbolName = flags & 32 ? demangle(jsSymbolName) : jsSymbolName;
        if (!cSymbolName) {
            cSymbolName = jsSymbolName
        }
        var haveSourceMap = false;
        if (flags & 8) {
            var orig = emscripten_source_map.originalPositionFor({line: lineno, column: column});
            haveSourceMap = orig && orig.source;
            if (haveSourceMap) {
                if (flags & 64) {
                    orig.source = orig.source.substring(orig.source.replace(/\\/g, "/").lastIndexOf("/") + 1)
                }
                callstack += "    at " + cSymbolName + " (" + orig.source + ":" + orig.line + ":" + orig.column + ")\n"
            }
        }
        if (flags & 16 || !haveSourceMap) {
            if (flags & 64) {
                file = file.substring(file.replace(/\\/g, "/").lastIndexOf("/") + 1)
            }
            callstack += (haveSourceMap ? "     = " + jsSymbolName : "    at " + cSymbolName) + " (" + file + ":" + lineno + ":" + column + ")\n"
        }
        if (flags & 128 && stack_args[0]) {
            if (stack_args[1] == jsSymbolName && stack_args[2].length > 0) {
                callstack = callstack.replace(/\s+$/, "");
                callstack += " with values: " + stack_args[1] + stack_args[2] + "\n"
            }
            stack_args = __emscripten_traverse_stack(stack_args[0])
        }
    }
    callstack = callstack.replace(/\s+$/, "");
    return callstack
}

function _emscripten_log_js(flags, str) {
    if (flags & 24) {
        str = str.replace(/\s+$/, "");
        str += (str.length > 0 ? "\n" : "") + _emscripten_get_callstack_js(flags)
    }
    if (flags & 1) {
        if (flags & 4) {
            console.error(str)
        } else if (flags & 2) {
            console.warn(str)
        } else {
            console.log(str)
        }
    } else if (flags & 6) {
        err(str)
    } else {
        out(str)
    }
}

function _emscripten_log(flags, varargs) {
    var format = HEAP32[varargs >> 2];
    varargs += 4;
    var str = "";
    if (format) {
        var result = __formatString(format, varargs);
        for (var i = 0; i < result.length; ++i) {
            str += String.fromCharCode(result[i])
        }
    }
    _emscripten_log_js(flags, str)
}

function _emscripten_random() {
    return Math.random()
}

function _JSEvents_requestFullscreen(target, strategy) {
    if (strategy.scaleMode != 0 || strategy.canvasResolutionScaleMode != 0) {
        _JSEvents_resizeCanvasForFullscreen(target, strategy)
    }
    if (target.requestFullscreen) {
        target.requestFullscreen()
    } else if (target.msRequestFullscreen) {
        target.msRequestFullscreen()
    } else if (target.mozRequestFullScreen) {
        target.mozRequestFullScreen()
    } else if (target.mozRequestFullscreen) {
        target.mozRequestFullscreen()
    } else if (target.webkitRequestFullscreen) {
        target.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
    } else {
        if (typeof JSEvents.fullscreenEnabled() === "undefined") {
            return -1
        } else {
            return -3
        }
    }
    if (strategy.canvasResizedCallback) {
        dynCall_iiii(strategy.canvasResizedCallback, 37, 0, strategy.canvasResizedCallbackUserData)
    }
    return 0
}

function __emscripten_do_request_fullscreen(target, strategy) {
    if (typeof JSEvents.fullscreenEnabled() === "undefined") return -1;
    if (!JSEvents.fullscreenEnabled()) return -3;
    if (!target) target = "#canvas";
    target = __findEventTarget(target);
    if (!target) return -4;
    if (!target.requestFullscreen && !target.msRequestFullscreen && !target.mozRequestFullScreen && !target.mozRequestFullscreen && !target.webkitRequestFullscreen) {
        return -3
    }
    var canPerformRequests = JSEvents.canPerformEventHandlerRequests();
    if (!canPerformRequests) {
        if (strategy.deferUntilInEventHandler) {
            JSEvents.deferCall(_JSEvents_requestFullscreen, 1, [target, strategy]);
            return 1
        } else {
            return -2
        }
    }
    return _JSEvents_requestFullscreen(target, strategy)
}

function _emscripten_request_fullscreen_strategy(target, deferUntilInEventHandler, fullscreenStrategy) {
    var strategy = {};
    strategy.scaleMode = HEAP32[fullscreenStrategy >> 2];
    strategy.canvasResolutionScaleMode = HEAP32[fullscreenStrategy + 4 >> 2];
    strategy.filteringMode = HEAP32[fullscreenStrategy + 8 >> 2];
    strategy.deferUntilInEventHandler = deferUntilInEventHandler;
    strategy.canvasResizedCallback = HEAP32[fullscreenStrategy + 12 >> 2];
    strategy.canvasResizedCallbackUserData = HEAP32[fullscreenStrategy + 16 >> 2];
    __currentFullscreenStrategy = strategy;
    return __emscripten_do_request_fullscreen(target, strategy)
}

function abortOnCannotGrowMemory(requestedSize) {
    abort("Cannot enlarge memory arrays to size " + requestedSize + " bytes (OOM). Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value " + TOTAL_MEMORY + ", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ")
}

function emscripten_realloc_buffer(size) {
    var PAGE_MULTIPLE = 65536;
    size = alignUp(size, PAGE_MULTIPLE);
    var old = Module["buffer"];
    var oldSize = old.byteLength;
    try {
        var result = wasmMemory.grow((size - oldSize) / 65536);
        if (result !== (-1 | 0)) {
            return Module["buffer"] = wasmMemory.buffer
        } else {
            return null
        }
    } catch (e) {
        console.error("emscripten_realloc_buffer: Attempted to grow from " + oldSize + " bytes to " + size + " bytes, but got error: " + e);
        return null
    }
}

function _emscripten_resize_heap(requestedSize) {
    var oldSize = _emscripten_get_heap_size();
    assert(requestedSize > oldSize);
    var PAGE_MULTIPLE = 65536;
    var LIMIT = 2147483648 - PAGE_MULTIPLE;
    if (requestedSize > LIMIT) {
        err("Cannot enlarge memory, asked to go up to " + requestedSize + " bytes, but the limit is " + LIMIT + " bytes!");
        return false
    }
    var MIN_TOTAL_MEMORY = 16777216;
    var newSize = Math.max(oldSize, MIN_TOTAL_MEMORY);
    while (newSize < requestedSize) {
        if (newSize <= 536870912) {
            newSize = alignUp(2 * newSize, PAGE_MULTIPLE)
        } else {
            newSize = Math.min(alignUp((3 * newSize + 2147483648) / 4, PAGE_MULTIPLE), LIMIT);
            if (newSize === oldSize) {
                warnOnce("Cannot ask for more memory since we reached the practical limit in browsers (which is just below 2GB), so the request would have failed. Requesting only " + TOTAL_MEMORY)
            }
        }
    }
    var start = Date.now();
    var replacement = emscripten_realloc_buffer(newSize);
    if (!replacement || replacement.byteLength != newSize) {
        err("Failed to grow the heap from " + oldSize + " bytes to " + newSize + " bytes, not enough memory!");
        if (replacement) {
            err("Expected to get back a buffer of size " + newSize + " bytes, but instead got back a buffer of size " + replacement.byteLength)
        }
        return false
    }
    updateGlobalBuffer(replacement);
    updateGlobalBufferViews();
    TOTAL_MEMORY = newSize;
    HEAPU32[DYNAMICTOP_PTR >> 2] = requestedSize;
    return true
}

function _emscripten_run_script(ptr) {
    eval(UTF8ToString(ptr))
}

function _emscripten_run_script_int(ptr) {
    return eval(UTF8ToString(ptr)) | 0
}

function __fillMouseEventData(eventStruct, e, target) {
    HEAPF64[eventStruct >> 3] = JSEvents.tick();
    HEAP32[eventStruct + 8 >> 2] = e.screenX;
    HEAP32[eventStruct + 12 >> 2] = e.screenY;
    HEAP32[eventStruct + 16 >> 2] = e.clientX;
    HEAP32[eventStruct + 20 >> 2] = e.clientY;
    HEAP32[eventStruct + 24 >> 2] = e.ctrlKey;
    HEAP32[eventStruct + 28 >> 2] = e.shiftKey;
    HEAP32[eventStruct + 32 >> 2] = e.altKey;
    HEAP32[eventStruct + 36 >> 2] = e.metaKey;
    HEAP16[eventStruct + 40 >> 1] = e.button;
    HEAP16[eventStruct + 42 >> 1] = e.buttons;
    HEAP32[eventStruct + 44 >> 2] = e["movementX"] || e["mozMovementX"] || e["webkitMovementX"] || e.screenX - JSEvents.previousScreenX;
    HEAP32[eventStruct + 48 >> 2] = e["movementY"] || e["mozMovementY"] || e["webkitMovementY"] || e.screenY - JSEvents.previousScreenY;
    if (Module["canvas"]) {
        var rect = Module["canvas"].getBoundingClientRect();
        HEAP32[eventStruct + 60 >> 2] = e.clientX - rect.left;
        HEAP32[eventStruct + 64 >> 2] = e.clientY - rect.top
    } else {
        HEAP32[eventStruct + 60 >> 2] = 0;
        HEAP32[eventStruct + 64 >> 2] = 0
    }
    if (target) {
        var rect = JSEvents.getBoundingClientRectOrZeros(target);
        HEAP32[eventStruct + 52 >> 2] = e.clientX - rect.left;
        HEAP32[eventStruct + 56 >> 2] = e.clientY - rect.top
    } else {
        HEAP32[eventStruct + 52 >> 2] = 0;
        HEAP32[eventStruct + 56 >> 2] = 0
    }
    if (e.type !== "wheel" && e.type !== "mousewheel") {
        JSEvents.previousScreenX = e.screenX;
        JSEvents.previousScreenY = e.screenY
    }
}

function __registerMouseEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
    if (!JSEvents.mouseEvent) JSEvents.mouseEvent = _malloc(72);
    target = __findEventTarget(target);
    var mouseEventHandlerFunc = function (event) {
        var e = event || window.event;
        __fillMouseEventData(JSEvents.mouseEvent, e, target);
        if (dynCall_iiii(callbackfunc, eventTypeId, JSEvents.mouseEvent, userData)) e.preventDefault()
    };
    var eventHandler = {
        target: target,
        allowsDeferredCalls: eventTypeString != "mousemove" && eventTypeString != "mouseenter" && eventTypeString != "mouseleave",
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: mouseEventHandlerFunc,
        useCapture: useCapture
    };
    if (JSEvents.isInternetExplorer() && eventTypeString == "mousedown") eventHandler.allowsDeferredCalls = false;
    JSEvents.registerOrRemoveHandler(eventHandler)
}

function _emscripten_set_dblclick_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
    __registerMouseEventCallback(target, userData, useCapture, callbackfunc, 7, "dblclick", targetThread);
    return 0
}

function _emscripten_set_mousedown_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
    __registerMouseEventCallback(target, userData, useCapture, callbackfunc, 5, "mousedown", targetThread);
    return 0
}

function _emscripten_set_mouseleave_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
    __registerMouseEventCallback(target, userData, useCapture, callbackfunc, 34, "mouseleave", targetThread);
    return 0
}

function _emscripten_set_mousemove_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
    __registerMouseEventCallback(target, userData, useCapture, callbackfunc, 8, "mousemove", targetThread);
    return 0
}

function _emscripten_set_mouseup_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
    __registerMouseEventCallback(target, userData, useCapture, callbackfunc, 6, "mouseup", targetThread);
    return 0
}

function __registerUiEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
    if (!JSEvents.uiEvent) JSEvents.uiEvent = _malloc(36);
    if (eventTypeString == "scroll" && !target) {
        target = document
    } else {
        target = __findEventTarget(target)
    }
    var uiEventHandlerFunc = function (event) {
        var e = event || window.event;
        if (e.target != target) {
            return
        }
        var scrollPos = JSEvents.pageScrollPos();
        var uiEvent = JSEvents.uiEvent;
        HEAP32[uiEvent >> 2] = e.detail;
        HEAP32[uiEvent + 4 >> 2] = document.body.clientWidth;
        HEAP32[uiEvent + 8 >> 2] = document.body.clientHeight;
        HEAP32[uiEvent + 12 >> 2] = window.innerWidth;
        HEAP32[uiEvent + 16 >> 2] = window.innerHeight;
        HEAP32[uiEvent + 20 >> 2] = window.outerWidth;
        HEAP32[uiEvent + 24 >> 2] = window.outerHeight;
        HEAP32[uiEvent + 28 >> 2] = scrollPos[0];
        HEAP32[uiEvent + 32 >> 2] = scrollPos[1];
        if (dynCall_iiii(callbackfunc, eventTypeId, uiEvent, userData)) e.preventDefault()
    };
    var eventHandler = {
        target: target,
        allowsDeferredCalls: false,
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: uiEventHandlerFunc,
        useCapture: useCapture
    };
    JSEvents.registerOrRemoveHandler(eventHandler)
}

function _emscripten_set_resize_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
    __registerUiEventCallback(target, userData, useCapture, callbackfunc, 10, "resize", targetThread);
    return 0
}

function __registerTouchEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
    if (!JSEvents.touchEvent) JSEvents.touchEvent = _malloc(1684);
    target = __findEventTarget(target);
    var touchEventHandlerFunc = function (event) {
        var e = event || window.event;
        var touches = {};
        for (var i = 0; i < e.touches.length; ++i) {
            var touch = e.touches[i];
            touches[touch.identifier] = touch
        }
        for (var i = 0; i < e.changedTouches.length; ++i) {
            var touch = e.changedTouches[i];
            touches[touch.identifier] = touch;
            touch.changed = true
        }
        for (var i = 0; i < e.targetTouches.length; ++i) {
            var touch = e.targetTouches[i];
            touches[touch.identifier].onTarget = true
        }
        var touchEvent = JSEvents.touchEvent;
        var ptr = touchEvent;
        HEAP32[ptr + 4 >> 2] = e.ctrlKey;
        HEAP32[ptr + 8 >> 2] = e.shiftKey;
        HEAP32[ptr + 12 >> 2] = e.altKey;
        HEAP32[ptr + 16 >> 2] = e.metaKey;
        ptr += 20;
        var canvasRect = Module["canvas"] ? Module["canvas"].getBoundingClientRect() : undefined;
        var targetRect = JSEvents.getBoundingClientRectOrZeros(target);
        var numTouches = 0;
        for (var i in touches) {
            var t = touches[i];
            HEAP32[ptr >> 2] = t.identifier;
            HEAP32[ptr + 4 >> 2] = t.screenX;
            HEAP32[ptr + 8 >> 2] = t.screenY;
            HEAP32[ptr + 12 >> 2] = t.clientX;
            HEAP32[ptr + 16 >> 2] = t.clientY;
            HEAP32[ptr + 20 >> 2] = t.pageX;
            HEAP32[ptr + 24 >> 2] = t.pageY;
            HEAP32[ptr + 28 >> 2] = t.changed;
            HEAP32[ptr + 32 >> 2] = t.onTarget;
            if (canvasRect) {
                HEAP32[ptr + 44 >> 2] = t.clientX - canvasRect.left;
                HEAP32[ptr + 48 >> 2] = t.clientY - canvasRect.top
            } else {
                HEAP32[ptr + 44 >> 2] = 0;
                HEAP32[ptr + 48 >> 2] = 0
            }
            HEAP32[ptr + 36 >> 2] = t.clientX - targetRect.left;
            HEAP32[ptr + 40 >> 2] = t.clientY - targetRect.top;
            ptr += 52;
            if (++numTouches >= 32) {
                break
            }
        }
        HEAP32[touchEvent >> 2] = numTouches;
        if (dynCall_iiii(callbackfunc, eventTypeId, touchEvent, userData)) e.preventDefault()
    };
    var eventHandler = {
        target: target,
        allowsDeferredCalls: eventTypeString == "touchstart" || eventTypeString == "touchend",
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: touchEventHandlerFunc,
        useCapture: useCapture
    };
    JSEvents.registerOrRemoveHandler(eventHandler)
}

function _emscripten_set_touchcancel_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
    __registerTouchEventCallback(target, userData, useCapture, callbackfunc, 25, "touchcancel", targetThread);
    return 0
}

function _emscripten_set_touchend_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
    __registerTouchEventCallback(target, userData, useCapture, callbackfunc, 23, "touchend", targetThread);
    return 0
}

function _emscripten_set_touchmove_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
    __registerTouchEventCallback(target, userData, useCapture, callbackfunc, 24, "touchmove", targetThread);
    return 0
}

function _emscripten_set_touchstart_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
    __registerTouchEventCallback(target, userData, useCapture, callbackfunc, 22, "touchstart", targetThread);
    return 0
}

function __registerWheelEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
    if (!JSEvents.wheelEvent) JSEvents.wheelEvent = _malloc(104);
    var wheelHandlerFunc = function (event) {
        var e = event || window.event;
        var wheelEvent = JSEvents.wheelEvent;
        __fillMouseEventData(wheelEvent, e, target);
        HEAPF64[wheelEvent + 72 >> 3] = e["deltaX"];
        HEAPF64[wheelEvent + 80 >> 3] = e["deltaY"];
        HEAPF64[wheelEvent + 88 >> 3] = e["deltaZ"];
        HEAP32[wheelEvent + 96 >> 2] = e["deltaMode"];
        if (dynCall_iiii(callbackfunc, eventTypeId, wheelEvent, userData)) e.preventDefault()
    };
    var mouseWheelHandlerFunc = function (event) {
        var e = event || window.event;
        __fillMouseEventData(JSEvents.wheelEvent, e, target);
        HEAPF64[JSEvents.wheelEvent + 72 >> 3] = e["wheelDeltaX"] || 0;
        HEAPF64[JSEvents.wheelEvent + 80 >> 3] = -(e["wheelDeltaY"] ? e["wheelDeltaY"] : e["wheelDelta"]);
        HEAPF64[JSEvents.wheelEvent + 88 >> 3] = 0;
        HEAP32[JSEvents.wheelEvent + 96 >> 2] = 0;
        var shouldCancel = dynCall_iiii(callbackfunc, eventTypeId, JSEvents.wheelEvent, userData);
        if (shouldCancel) {
            e.preventDefault()
        }
    };
    var eventHandler = {
        target: target,
        allowsDeferredCalls: true,
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: eventTypeString == "wheel" ? wheelHandlerFunc : mouseWheelHandlerFunc,
        useCapture: useCapture
    };
    JSEvents.registerOrRemoveHandler(eventHandler)
}

function _emscripten_set_wheel_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
    target = __findEventTarget(target);
    if (typeof target.onwheel !== "undefined") {
        __registerWheelEventCallback(target, userData, useCapture, callbackfunc, 9, "wheel", targetThread);
        return 0
    } else if (typeof target.onmousewheel !== "undefined") {
        __registerWheelEventCallback(target, userData, useCapture, callbackfunc, 9, "mousewheel", targetThread);
        return 0
    } else {
        return -1
    }
}

var GL = {
    counter: 1,
    lastError: 0,
    buffers: [],
    mappedBuffers: {},
    programs: [],
    framebuffers: [],
    renderbuffers: [],
    textures: [],
    uniforms: [],
    shaders: [],
    vaos: [],
    contexts: {},
    currentContext: null,
    offscreenCanvases: {},
    timerQueriesEXT: [],
    queries: [],
    samplers: [],
    transformFeedbacks: [],
    syncs: [],
    currArrayBuffer: 0,
    currElementArrayBuffer: 0,
    byteSizeByTypeRoot: 5120,
    byteSizeByType: [1, 1, 2, 2, 4, 4, 4, 2, 3, 4, 8],
    programInfos: {},
    stringCache: {},
    stringiCache: {},
    unpackAlignment: 4,
    init: function () {
        GL.createLog2ceilLookup(GL.MAX_TEMP_BUFFER_SIZE);
        GL.miniTempBuffer = new Float32Array(GL.MINI_TEMP_BUFFER_SIZE);
        for (var i = 0; i < GL.MINI_TEMP_BUFFER_SIZE; i++) {
            GL.miniTempBufferViews[i] = GL.miniTempBuffer.subarray(0, i + 1)
        }
    },
    recordError: function recordError(errorCode) {
        if (!GL.lastError) {
            GL.lastError = errorCode
        }
    },
    getNewId: function (table) {
        var ret = GL.counter++;
        for (var i = table.length; i < ret; i++) {
            table[i] = null
        }
        return ret
    },
    MINI_TEMP_BUFFER_SIZE: 256,
    miniTempBuffer: null,
    miniTempBufferViews: [0],
    MAX_TEMP_BUFFER_SIZE: 2097152,
    numTempVertexBuffersPerSize: 64,
    log2ceilLookup: null,
    createLog2ceilLookup: function (maxValue) {
        GL.log2ceilLookup = new Uint8Array(maxValue + 1);
        var log2 = 0;
        var pow2 = 1;
        GL.log2ceilLookup[0] = 0;
        for (var i = 1; i <= maxValue; ++i) {
            if (i > pow2) {
                pow2 <<= 1;
                ++log2
            }
            GL.log2ceilLookup[i] = log2
        }
    },
    generateTempBuffers: function (quads, context) {
        var largestIndex = GL.log2ceilLookup[GL.MAX_TEMP_BUFFER_SIZE];
        context.tempVertexBufferCounters1 = [];
        context.tempVertexBufferCounters2 = [];
        context.tempVertexBufferCounters1.length = context.tempVertexBufferCounters2.length = largestIndex + 1;
        context.tempVertexBuffers1 = [];
        context.tempVertexBuffers2 = [];
        context.tempVertexBuffers1.length = context.tempVertexBuffers2.length = largestIndex + 1;
        context.tempIndexBuffers = [];
        context.tempIndexBuffers.length = largestIndex + 1;
        for (var i = 0; i <= largestIndex; ++i) {
            context.tempIndexBuffers[i] = null;
            context.tempVertexBufferCounters1[i] = context.tempVertexBufferCounters2[i] = 0;
            var ringbufferLength = GL.numTempVertexBuffersPerSize;
            context.tempVertexBuffers1[i] = [];
            context.tempVertexBuffers2[i] = [];
            var ringbuffer1 = context.tempVertexBuffers1[i];
            var ringbuffer2 = context.tempVertexBuffers2[i];
            ringbuffer1.length = ringbuffer2.length = ringbufferLength;
            for (var j = 0; j < ringbufferLength; ++j) {
                ringbuffer1[j] = ringbuffer2[j] = null
            }
        }
        if (quads) {
            context.tempQuadIndexBuffer = GLctx.createBuffer();
            context.GLctx.bindBuffer(context.GLctx.ELEMENT_ARRAY_BUFFER, context.tempQuadIndexBuffer);
            var numIndexes = GL.MAX_TEMP_BUFFER_SIZE >> 1;
            var quadIndexes = new Uint16Array(numIndexes);
            var i = 0, v = 0;
            while (1) {
                quadIndexes[i++] = v;
                if (i >= numIndexes) break;
                quadIndexes[i++] = v + 1;
                if (i >= numIndexes) break;
                quadIndexes[i++] = v + 2;
                if (i >= numIndexes) break;
                quadIndexes[i++] = v;
                if (i >= numIndexes) break;
                quadIndexes[i++] = v + 2;
                if (i >= numIndexes) break;
                quadIndexes[i++] = v + 3;
                if (i >= numIndexes) break;
                v += 4
            }
            context.GLctx.bufferData(context.GLctx.ELEMENT_ARRAY_BUFFER, quadIndexes, context.GLctx.STATIC_DRAW);
            context.GLctx.bindBuffer(context.GLctx.ELEMENT_ARRAY_BUFFER, null)
        }
    },
    getTempVertexBuffer: function getTempVertexBuffer(sizeBytes) {
        var idx = GL.log2ceilLookup[sizeBytes];
        var ringbuffer = GL.currentContext.tempVertexBuffers1[idx];
        var nextFreeBufferIndex = GL.currentContext.tempVertexBufferCounters1[idx];
        GL.currentContext.tempVertexBufferCounters1[idx] = GL.currentContext.tempVertexBufferCounters1[idx] + 1 & GL.numTempVertexBuffersPerSize - 1;
        var vbo = ringbuffer[nextFreeBufferIndex];
        if (vbo) {
            return vbo
        }
        var prevVBO = GLctx.getParameter(GLctx.ARRAY_BUFFER_BINDING);
        ringbuffer[nextFreeBufferIndex] = GLctx.createBuffer();
        GLctx.bindBuffer(GLctx.ARRAY_BUFFER, ringbuffer[nextFreeBufferIndex]);
        GLctx.bufferData(GLctx.ARRAY_BUFFER, 1 << idx, GLctx.DYNAMIC_DRAW);
        GLctx.bindBuffer(GLctx.ARRAY_BUFFER, prevVBO);
        return ringbuffer[nextFreeBufferIndex]
    },
    getTempIndexBuffer: function getTempIndexBuffer(sizeBytes) {
        var idx = GL.log2ceilLookup[sizeBytes];
        var ibo = GL.currentContext.tempIndexBuffers[idx];
        if (ibo) {
            return ibo
        }
        var prevIBO = GLctx.getParameter(GLctx.ELEMENT_ARRAY_BUFFER_BINDING);
        GL.currentContext.tempIndexBuffers[idx] = GLctx.createBuffer();
        GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, GL.currentContext.tempIndexBuffers[idx]);
        GLctx.bufferData(GLctx.ELEMENT_ARRAY_BUFFER, 1 << idx, GLctx.DYNAMIC_DRAW);
        GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, prevIBO);
        return GL.currentContext.tempIndexBuffers[idx]
    },
    newRenderingFrameStarted: function newRenderingFrameStarted() {
        if (!GL.currentContext) {
            return
        }
        var vb = GL.currentContext.tempVertexBuffers1;
        GL.currentContext.tempVertexBuffers1 = GL.currentContext.tempVertexBuffers2;
        GL.currentContext.tempVertexBuffers2 = vb;
        vb = GL.currentContext.tempVertexBufferCounters1;
        GL.currentContext.tempVertexBufferCounters1 = GL.currentContext.tempVertexBufferCounters2;
        GL.currentContext.tempVertexBufferCounters2 = vb;
        var largestIndex = GL.log2ceilLookup[GL.MAX_TEMP_BUFFER_SIZE];
        for (var i = 0; i <= largestIndex; ++i) {
            GL.currentContext.tempVertexBufferCounters1[i] = 0
        }
    },
    getSource: function (shader, count, string, length) {
        var source = "";
        for (var i = 0; i < count; ++i) {
            var len = length ? HEAP32[length + i * 4 >> 2] : -1;
            source += UTF8ToString(HEAP32[string + i * 4 >> 2], len < 0 ? undefined : len)
        }
        return source
    },
    calcBufLength: function calcBufLength(size, type, stride, count) {
        if (stride > 0) {
            return count * stride
        }
        var typeSize = GL.byteSizeByType[type - GL.byteSizeByTypeRoot];
        return size * typeSize * count
    },
    usedTempBuffers: [],
    preDrawHandleClientVertexAttribBindings: function preDrawHandleClientVertexAttribBindings(count) {
        GL.resetBufferBinding = false;
        for (var i = 0; i < GL.currentContext.maxVertexAttribs; ++i) {
            var cb = GL.currentContext.clientBuffers[i];
            if (!cb.clientside || !cb.enabled) continue;
            GL.resetBufferBinding = true;
            var size = GL.calcBufLength(cb.size, cb.type, cb.stride, count);
            var buf = GL.getTempVertexBuffer(size);
            GLctx.bindBuffer(GLctx.ARRAY_BUFFER, buf);
            GLctx.bufferSubData(GLctx.ARRAY_BUFFER, 0, HEAPU8.subarray(cb.ptr, cb.ptr + size));
            cb.vertexAttribPointerAdaptor.call(GLctx, i, cb.size, cb.type, cb.normalized, cb.stride, 0)
        }
    },
    postDrawHandleClientVertexAttribBindings: function postDrawHandleClientVertexAttribBindings() {
        if (GL.resetBufferBinding) {
            GLctx.bindBuffer(GLctx.ARRAY_BUFFER, GL.buffers[GL.currArrayBuffer])
        }
    },
    createContext: function (canvas, webGLContextAttributes) {
        var ctx = webGLContextAttributes.majorVersion > 1 ? canvas.getContext("webgl2", webGLContextAttributes) : canvas.getContext("webgl", webGLContextAttributes) || canvas.getContext("experimental-webgl", webGLContextAttributes);
        return ctx && GL.registerContext(ctx, webGLContextAttributes)
    },
    registerContext: function (ctx, webGLContextAttributes) {
        var handle = _malloc(8);
        var context = {
            handle: handle,
            attributes: webGLContextAttributes,
            version: webGLContextAttributes.majorVersion,
            GLctx: ctx
        };

        function getChromeVersion() {
            var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
            return raw ? parseInt(raw[2], 10) : false
        }

        context.supportsWebGL2EntryPoints = context.version >= 2 && (getChromeVersion() === false || getChromeVersion() >= 58);
        if (ctx.canvas) ctx.canvas.GLctxObject = context;
        GL.contexts[handle] = context;
        if (typeof webGLContextAttributes.enableExtensionsByDefault === "undefined" || webGLContextAttributes.enableExtensionsByDefault) {
            GL.initExtensions(context)
        }
        context.maxVertexAttribs = context.GLctx.getParameter(context.GLctx.MAX_VERTEX_ATTRIBS);
        context.clientBuffers = [];
        for (var i = 0; i < context.maxVertexAttribs; i++) {
            context.clientBuffers[i] = {
                enabled: false,
                clientside: false,
                size: 0,
                type: 0,
                normalized: 0,
                stride: 0,
                ptr: 0,
                vertexAttribPointerAdaptor: null
            }
        }
        GL.generateTempBuffers(false, context);
        return handle
    },
    makeContextCurrent: function (contextHandle) {
        GL.currentContext = GL.contexts[contextHandle];
        Module.ctx = GLctx = GL.currentContext && GL.currentContext.GLctx;
        return !(contextHandle && !GLctx)
    },
    getContext: function (contextHandle) {
        return GL.contexts[contextHandle]
    },
    deleteContext: function (contextHandle) {
        if (GL.currentContext === GL.contexts[contextHandle]) GL.currentContext = null;
        if (typeof JSEvents === "object") JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
        if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas) GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined;
        _free(GL.contexts[contextHandle]);
        GL.contexts[contextHandle] = null
    },
    initExtensions: function (context) {
        if (!context) context = GL.currentContext;
        if (context.initExtensionsDone) return;
        context.initExtensionsDone = true;
        var GLctx = context.GLctx;
        if (context.version < 2) {
            var instancedArraysExt = GLctx.getExtension("ANGLE_instanced_arrays");
            if (instancedArraysExt) {
                GLctx["vertexAttribDivisor"] = function (index, divisor) {
                    instancedArraysExt["vertexAttribDivisorANGLE"](index, divisor)
                };
                GLctx["drawArraysInstanced"] = function (mode, first, count, primcount) {
                    instancedArraysExt["drawArraysInstancedANGLE"](mode, first, count, primcount)
                };
                GLctx["drawElementsInstanced"] = function (mode, count, type, indices, primcount) {
                    instancedArraysExt["drawElementsInstancedANGLE"](mode, count, type, indices, primcount)
                }
            }
            var vaoExt = GLctx.getExtension("OES_vertex_array_object");
            if (vaoExt) {
                GLctx["createVertexArray"] = function () {
                    return vaoExt["createVertexArrayOES"]()
                };
                GLctx["deleteVertexArray"] = function (vao) {
                    vaoExt["deleteVertexArrayOES"](vao)
                };
                GLctx["bindVertexArray"] = function (vao) {
                    vaoExt["bindVertexArrayOES"](vao)
                };
                GLctx["isVertexArray"] = function (vao) {
                    return vaoExt["isVertexArrayOES"](vao)
                }
            }
            var drawBuffersExt = GLctx.getExtension("WEBGL_draw_buffers");
            if (drawBuffersExt) {
                GLctx["drawBuffers"] = function (n, bufs) {
                    drawBuffersExt["drawBuffersWEBGL"](n, bufs)
                }
            }
        }
        GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query");
        var automaticallyEnabledExtensions = ["OES_texture_float", "OES_texture_half_float", "OES_standard_derivatives", "OES_vertex_array_object", "WEBGL_compressed_texture_s3tc", "WEBGL_depth_texture", "OES_element_index_uint", "EXT_texture_filter_anisotropic", "EXT_frag_depth", "WEBGL_draw_buffers", "ANGLE_instanced_arrays", "OES_texture_float_linear", "OES_texture_half_float_linear", "EXT_blend_minmax", "EXT_shader_texture_lod", "WEBGL_compressed_texture_pvrtc", "EXT_color_buffer_half_float", "WEBGL_color_buffer_float", "EXT_sRGB", "WEBGL_compressed_texture_etc1", "EXT_disjoint_timer_query", "WEBGL_compressed_texture_etc", "WEBGL_compressed_texture_astc", "EXT_color_buffer_float", "WEBGL_compressed_texture_s3tc_srgb", "EXT_disjoint_timer_query_webgl2"];
        var exts = GLctx.getSupportedExtensions();
        if (exts && exts.length > 0) {
            GLctx.getSupportedExtensions().forEach(function (ext) {
                if (automaticallyEnabledExtensions.indexOf(ext) != -1) {
                    GLctx.getExtension(ext)
                }
            })
        }
    },
    populateUniformTable: function (program) {
        var p = GL.programs[program];
        var ptable = GL.programInfos[program] = {
            uniforms: {},
            maxUniformLength: 0,
            maxAttributeLength: -1,
            maxUniformBlockNameLength: -1
        };
        var utable = ptable.uniforms;
        var numUniforms = GLctx.getProgramParameter(p, 35718);
        for (var i = 0; i < numUniforms; ++i) {
            var u = GLctx.getActiveUniform(p, i);
            var name = u.name;
            ptable.maxUniformLength = Math.max(ptable.maxUniformLength, name.length + 1);
            if (name.slice(-1) == "]") {
                name = name.slice(0, name.lastIndexOf("["))
            }
            var loc = GLctx.getUniformLocation(p, name);
            if (loc) {
                var id = GL.getNewId(GL.uniforms);
                utable[name] = [u.size, id];
                GL.uniforms[id] = loc;
                for (var j = 1; j < u.size; ++j) {
                    var n = name + "[" + j + "]";
                    loc = GLctx.getUniformLocation(p, n);
                    id = GL.getNewId(GL.uniforms);
                    GL.uniforms[id] = loc
                }
            }
        }
    }
};
var __emscripten_webgl_power_preferences = ["default", "low-power", "high-performance"];

function _emscripten_webgl_do_create_context(target, attributes) {
    var contextAttributes = {};
    var a = attributes >> 2;
    contextAttributes["alpha"] = !!HEAP32[a + (0 >> 2)];
    contextAttributes["depth"] = !!HEAP32[a + (4 >> 2)];
    contextAttributes["stencil"] = !!HEAP32[a + (8 >> 2)];
    contextAttributes["antialias"] = !!HEAP32[a + (12 >> 2)];
    contextAttributes["premultipliedAlpha"] = !!HEAP32[a + (16 >> 2)];
    contextAttributes["preserveDrawingBuffer"] = !!HEAP32[a + (20 >> 2)];
    var powerPreference = HEAP32[a + (24 >> 2)];
    contextAttributes["powerPreference"] = __emscripten_webgl_power_preferences[powerPreference];
    contextAttributes["failIfMajorPerformanceCaveat"] = !!HEAP32[a + (28 >> 2)];
    contextAttributes.majorVersion = HEAP32[a + (32 >> 2)];
    contextAttributes.minorVersion = HEAP32[a + (36 >> 2)];
    contextAttributes.enableExtensionsByDefault = HEAP32[a + (40 >> 2)];
    contextAttributes.explicitSwapControl = HEAP32[a + (44 >> 2)];
    contextAttributes.proxyContextToMainThread = HEAP32[a + (48 >> 2)];
    contextAttributes.renderViaOffscreenBackBuffer = HEAP32[a + (52 >> 2)];
    var canvas = __findCanvasEventTarget(target);
    if (!canvas) {
        return 0
    }
    if (contextAttributes.explicitSwapControl) {
        return 0
    }
    var contextHandle = GL.createContext(canvas, contextAttributes);
    return contextHandle
}

function _emscripten_webgl_create_context(a0, a1) {
    return _emscripten_webgl_do_create_context(a0, a1)
}

function _emscripten_webgl_destroy_context_calling_thread(contextHandle) {
    if (GL.currentContext == contextHandle) GL.currentContext = 0;
    GL.deleteContext(contextHandle)
}

function _emscripten_webgl_destroy_context(a0) {
    return _emscripten_webgl_destroy_context_calling_thread(a0)
}

function _emscripten_webgl_init_context_attributes(attributes) {
    var a = attributes >> 2;
    for (var i = 0; i < 56 >> 2; ++i) {
        HEAP32[a + i] = 0
    }
    HEAP32[a + (0 >> 2)] = HEAP32[a + (4 >> 2)] = HEAP32[a + (12 >> 2)] = HEAP32[a + (16 >> 2)] = HEAP32[a + (32 >> 2)] = HEAP32[a + (40 >> 2)] = 1
}

function _emscripten_webgl_make_context_current(contextHandle) {
    var success = GL.makeContextCurrent(contextHandle);
    return success ? 0 : -5
}

Module["_emscripten_webgl_make_context_current"] = _emscripten_webgl_make_context_current;

function _getenv(name) {
    if (name === 0) return 0;
    name = UTF8ToString(name);
    if (!ENV.hasOwnProperty(name)) return 0;
    if (_getenv.ret) _free(_getenv.ret);
    _getenv.ret = allocateUTF8(ENV[name]);
    return _getenv.ret
}

function _gethostbyname(name) {
    name = UTF8ToString(name);
    var ret = _malloc(20);
    var nameBuf = _malloc(name.length + 1);
    stringToUTF8(name, nameBuf, name.length + 1);
    HEAP32[ret >> 2] = nameBuf;
    var aliasesBuf = _malloc(4);
    HEAP32[aliasesBuf >> 2] = 0;
    HEAP32[ret + 4 >> 2] = aliasesBuf;
    var afinet = 2;
    HEAP32[ret + 8 >> 2] = afinet;
    HEAP32[ret + 12 >> 2] = 4;
    var addrListBuf = _malloc(12);
    HEAP32[addrListBuf >> 2] = addrListBuf + 8;
    HEAP32[addrListBuf + 4 >> 2] = 0;
    HEAP32[addrListBuf + 8 >> 2] = __inet_pton4_raw(DNS.lookup_name(name));
    HEAP32[ret + 16 >> 2] = addrListBuf;
    return ret
}

function _getpwuid(uid) {
    return 0
}

function _gettimeofday(ptr) {
    var now = Date.now();
    HEAP32[ptr >> 2] = now / 1e3 | 0;
    HEAP32[ptr + 4 >> 2] = now % 1e3 * 1e3 | 0;
    return 0
}

function _glActiveTexture(x0) {
    GLctx["activeTexture"](x0)
}

function _glAttachShader(program, shader) {
    GLctx.attachShader(GL.programs[program], GL.shaders[shader])
}

function _glBeginQuery(target, id) {
    GLctx["beginQuery"](target, GL.queries[id])
}

function _glBeginTransformFeedback(x0) {
    GLctx["beginTransformFeedback"](x0)
}

function _glBindAttribLocation(program, index, name) {
    GLctx.bindAttribLocation(GL.programs[program], index, UTF8ToString(name))
}

function _glBindBuffer(target, buffer) {
    if (target == GLctx.ARRAY_BUFFER) {
        GL.currArrayBuffer = buffer
    } else if (target == GLctx.ELEMENT_ARRAY_BUFFER) {
        GL.currElementArrayBuffer = buffer
    }
    if (target == 35051) {
        GLctx.currentPixelPackBufferBinding = buffer
    } else if (target == 35052) {
        GLctx.currentPixelUnpackBufferBinding = buffer
    }
    GLctx.bindBuffer(target, GL.buffers[buffer])
}

function _glBindTexture(target, texture) {
    GLctx.bindTexture(target, GL.textures[texture])
}

function _glBlendFunc(x0, x1) {
    GLctx["blendFunc"](x0, x1)
}

function _glBufferData(target, size, data, usage) {
    if (GL.currentContext.supportsWebGL2EntryPoints) {
        if (data) {
            GLctx.bufferData(target, HEAPU8, usage, data, size)
        } else {
            GLctx.bufferData(target, size, usage)
        }
    } else {
        GLctx.bufferData(target, data ? HEAPU8.subarray(data, data + size) : size, usage)
    }
}

function _glClear(x0) {
    GLctx["clear"](x0)
}

function _glClearColor(x0, x1, x2, x3) {
    GLctx["clearColor"](x0, x1, x2, x3)
}

function _glColorMask(red, green, blue, alpha) {
    GLctx.colorMask(!!red, !!green, !!blue, !!alpha)
}

function _glCompileShader(shader) {
    GLctx.compileShader(GL.shaders[shader])
}

function _glCreateProgram() {
    var id = GL.getNewId(GL.programs);
    var program = GLctx.createProgram();
    program.name = id;
    GL.programs[id] = program;
    return id
}

function _glCreateShader(shaderType) {
    var id = GL.getNewId(GL.shaders);
    GL.shaders[id] = GLctx.createShader(shaderType);
    return id
}

function _glDeleteBuffers(n, buffers) {
    for (var i = 0; i < n; i++) {
        var id = HEAP32[buffers + i * 4 >> 2];
        var buffer = GL.buffers[id];
        if (!buffer) continue;
        GLctx.deleteBuffer(buffer);
        buffer.name = 0;
        GL.buffers[id] = null;
        if (id == GL.currArrayBuffer) GL.currArrayBuffer = 0;
        if (id == GL.currElementArrayBuffer) GL.currElementArrayBuffer = 0;
        if (id == GLctx.currentPixelPackBufferBinding) GLctx.currentPixelPackBufferBinding = 0;
        if (id == GLctx.currentPixelUnpackBufferBinding) GLctx.currentPixelUnpackBufferBinding = 0
    }
}

function _glDeleteProgram(id) {
    if (!id) return;
    var program = GL.programs[id];
    if (!program) {
        GL.recordError(1281);
        return
    }
    GLctx.deleteProgram(program);
    program.name = 0;
    GL.programs[id] = null;
    GL.programInfos[id] = null
}

function _glDeleteTextures(n, textures) {
    for (var i = 0; i < n; i++) {
        var id = HEAP32[textures + i * 4 >> 2];
        var texture = GL.textures[id];
        if (!texture) continue;
        GLctx.deleteTexture(texture);
        texture.name = 0;
        GL.textures[id] = null
    }
}

function _glDepthFunc(x0) {
    GLctx["depthFunc"](x0)
}

function _glDepthMask(flag) {
    GLctx.depthMask(!!flag)
}

function _glDisable(x0) {
    GLctx["disable"](x0)
}

function _glDisableVertexAttribArray(index) {
    var cb = GL.currentContext.clientBuffers[index];
    cb.enabled = false;
    GLctx.disableVertexAttribArray(index)
}

function _glDrawArrays(mode, first, count) {
    GL.preDrawHandleClientVertexAttribBindings(first + count);
    GLctx.drawArrays(mode, first, count);
    GL.postDrawHandleClientVertexAttribBindings()
}

function _glDrawElements(mode, count, type, indices) {
    var buf;
    if (!GL.currElementArrayBuffer) {
        var size = GL.calcBufLength(1, type, 0, count);
        buf = GL.getTempIndexBuffer(size);
        GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, buf);
        GLctx.bufferSubData(GLctx.ELEMENT_ARRAY_BUFFER, 0, HEAPU8.subarray(indices, indices + size));
        indices = 0
    }
    GL.preDrawHandleClientVertexAttribBindings(count);
    GLctx.drawElements(mode, count, type, indices);
    GL.postDrawHandleClientVertexAttribBindings(count);
    if (!GL.currElementArrayBuffer) {
        GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, null)
    }
}

function _glEnable(x0) {
    GLctx["enable"](x0)
}

function _glEnableVertexAttribArray(index) {
    var cb = GL.currentContext.clientBuffers[index];
    cb.enabled = true;
    GLctx.enableVertexAttribArray(index)
}

function _glEndQuery(x0) {
    GLctx["endQuery"](x0)
}

function _glEndTransformFeedback() {
    GLctx["endTransformFeedback"]()
}

function _glFinish() {
    GLctx["finish"]()
}

function _glFlush() {
    GLctx["flush"]()
}

function __glGenObject(n, buffers, createFunction, objectTable) {
    for (var i = 0; i < n; i++) {
        var buffer = GLctx[createFunction]();
        var id = buffer && GL.getNewId(objectTable);
        if (buffer) {
            buffer.name = id;
            objectTable[id] = buffer
        } else {
            GL.recordError(1282)
        }
        HEAP32[buffers + i * 4 >> 2] = id
    }
}

function _glGenBuffers(n, buffers) {
    __glGenObject(n, buffers, "createBuffer", GL.buffers)
}

function _glGenTextures(n, textures) {
    __glGenObject(n, textures, "createTexture", GL.textures)
}

function emscriptenWebGLGet(name_, p, type) {
    if (!p) {
        GL.recordError(1281);
        return
    }
    var ret = undefined;
    switch (name_) {
        case 36346:
            ret = 1;
            break;
        case 36344:
            if (type !== "Integer" && type !== "Integer64") {
                GL.recordError(1280)
            }
            return;
        case 34814:
        case 36345:
            ret = 0;
            break;
        case 34466:
            var formats = GLctx.getParameter(34467);
            ret = formats ? formats.length : 0;
            break;
        case 33309:
            if (GL.currentContext.version < 2) {
                GL.recordError(1282);
                return
            }
            var exts = GLctx.getSupportedExtensions();
            ret = 2 * exts.length;
            break;
        case 33307:
        case 33308:
            if (GL.currentContext.version < 2) {
                GL.recordError(1280);
                return
            }
            ret = name_ == 33307 ? 3 : 0;
            break
    }
    if (ret === undefined) {
        var result = GLctx.getParameter(name_);
        switch (typeof result) {
            case"number":
                ret = result;
                break;
            case"boolean":
                ret = result ? 1 : 0;
                break;
            case"string":
                GL.recordError(1280);
                return;
            case"object":
                if (result === null) {
                    switch (name_) {
                        case 34964:
                        case 35725:
                        case 34965:
                        case 36006:
                        case 36007:
                        case 32873:
                        case 34229:
                        case 35097:
                        case 36389:
                        case 34068: {
                            ret = 0;
                            break
                        }
                        default: {
                            GL.recordError(1280);
                            return
                        }
                    }
                } else if (result instanceof Float32Array || result instanceof Uint32Array || result instanceof Int32Array || result instanceof Array) {
                    for (var i = 0; i < result.length; ++i) {
                        switch (type) {
                            case"Integer":
                                HEAP32[p + i * 4 >> 2] = result[i];
                                break;
                            case"Float":
                                HEAPF32[p + i * 4 >> 2] = result[i];
                                break;
                            case"Boolean":
                                HEAP8[p + i >> 0] = result[i] ? 1 : 0;
                                break;
                            default:
                                throw"internal glGet error, bad type: " + type
                        }
                    }
                    return
                } else {
                    try {
                        ret = result.name | 0
                    } catch (e) {
                        GL.recordError(1280);
                        err("GL_INVALID_ENUM in glGet" + type + "v: Unknown object returned from WebGL getParameter(" + name_ + ")! (error: " + e + ")");
                        return
                    }
                }
                break;
            default:
                GL.recordError(1280);
                return
        }
    }
    switch (type) {
        case"Integer64":
            tempI64 = [ret >>> 0, (tempDouble = ret, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[p >> 2] = tempI64[0], HEAP32[p + 4 >> 2] = tempI64[1];
            break;
        case"Integer":
            HEAP32[p >> 2] = ret;
            break;
        case"Float":
            HEAPF32[p >> 2] = ret;
            break;
        case"Boolean":
            HEAP8[p >> 0] = ret ? 1 : 0;
            break;
        default:
            throw"internal glGet error, bad type: " + type
    }
}

function _glGetFloatv(name_, p) {
    emscriptenWebGLGet(name_, p, "Float")
}

function _glGetIntegerv(name_, p) {
    emscriptenWebGLGet(name_, p, "Integer")
}

function _glGetProgramInfoLog(program, maxLength, length, infoLog) {
    var log = GLctx.getProgramInfoLog(GL.programs[program]);
    if (log === null) log = "(unknown error)";
    if (maxLength > 0 && infoLog) {
        var numBytesWrittenExclNull = stringToUTF8(log, infoLog, maxLength);
        if (length) HEAP32[length >> 2] = numBytesWrittenExclNull
    } else {
        if (length) HEAP32[length >> 2] = 0
    }
}

function _glGetProgramiv(program, pname, p) {
    if (!p) {
        GL.recordError(1281);
        return
    }
    if (program >= GL.counter) {
        GL.recordError(1281);
        return
    }
    var ptable = GL.programInfos[program];
    if (!ptable) {
        GL.recordError(1282);
        return
    }
    if (pname == 35716) {
        var log = GLctx.getProgramInfoLog(GL.programs[program]);
        if (log === null) log = "(unknown error)";
        HEAP32[p >> 2] = log.length + 1
    } else if (pname == 35719) {
        HEAP32[p >> 2] = ptable.maxUniformLength
    } else if (pname == 35722) {
        if (ptable.maxAttributeLength == -1) {
            program = GL.programs[program];
            var numAttribs = GLctx.getProgramParameter(program, 35721);
            ptable.maxAttributeLength = 0;
            for (var i = 0; i < numAttribs; ++i) {
                var activeAttrib = GLctx.getActiveAttrib(program, i);
                ptable.maxAttributeLength = Math.max(ptable.maxAttributeLength, activeAttrib.name.length + 1)
            }
        }
        HEAP32[p >> 2] = ptable.maxAttributeLength
    } else if (pname == 35381) {
        if (ptable.maxUniformBlockNameLength == -1) {
            program = GL.programs[program];
            var numBlocks = GLctx.getProgramParameter(program, 35382);
            ptable.maxUniformBlockNameLength = 0;
            for (var i = 0; i < numBlocks; ++i) {
                var activeBlockName = GLctx.getActiveUniformBlockName(program, i);
                ptable.maxUniformBlockNameLength = Math.max(ptable.maxUniformBlockNameLength, activeBlockName.length + 1)
            }
        }
        HEAP32[p >> 2] = ptable.maxUniformBlockNameLength
    } else {
        HEAP32[p >> 2] = GLctx.getProgramParameter(GL.programs[program], pname)
    }
}

function _glGetShaderInfoLog(shader, maxLength, length, infoLog) {
    var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
    if (log === null) log = "(unknown error)";
    if (maxLength > 0 && infoLog) {
        var numBytesWrittenExclNull = stringToUTF8(log, infoLog, maxLength);
        if (length) HEAP32[length >> 2] = numBytesWrittenExclNull
    } else {
        if (length) HEAP32[length >> 2] = 0
    }
}

function _glGetShaderiv(shader, pname, p) {
    if (!p) {
        GL.recordError(1281);
        return
    }
    if (pname == 35716) {
        var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
        if (log === null) log = "(unknown error)";
        HEAP32[p >> 2] = log.length + 1
    } else if (pname == 35720) {
        var source = GLctx.getShaderSource(GL.shaders[shader]);
        var sourceLength = source === null || source.length == 0 ? 0 : source.length + 1;
        HEAP32[p >> 2] = sourceLength
    } else {
        HEAP32[p >> 2] = GLctx.getShaderParameter(GL.shaders[shader], pname)
    }
}

function stringToNewUTF8(jsString) {
    var length = lengthBytesUTF8(jsString) + 1;
    var cString = _malloc(length);
    stringToUTF8(jsString, cString, length);
    return cString
}

function _glGetString(name_) {
    if (GL.stringCache[name_]) return GL.stringCache[name_];
    var ret;
    switch (name_) {
        case 7939:
            var exts = GLctx.getSupportedExtensions();
            var gl_exts = [];
            for (var i = 0; i < exts.length; ++i) {
                gl_exts.push(exts[i]);
                gl_exts.push("GL_" + exts[i])
            }
            ret = stringToNewUTF8(gl_exts.join(" "));
            break;
        case 7936:
        case 7937:
        case 37445:
        case 37446:
            var s = GLctx.getParameter(name_);
            if (!s) {
                GL.recordError(1280)
            }
            ret = stringToNewUTF8(s);
            break;
        case 7938:
            var glVersion = GLctx.getParameter(GLctx.VERSION);
            if (GL.currentContext.version >= 2) glVersion = "OpenGL ES 3.0 (" + glVersion + ")"; else {
                glVersion = "OpenGL ES 2.0 (" + glVersion + ")"
            }
            ret = stringToNewUTF8(glVersion);
            break;
        case 35724:
            var glslVersion = GLctx.getParameter(GLctx.SHADING_LANGUAGE_VERSION);
            var ver_re = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/;
            var ver_num = glslVersion.match(ver_re);
            if (ver_num !== null) {
                if (ver_num[1].length == 3) ver_num[1] = ver_num[1] + "0";
                glslVersion = "OpenGL ES GLSL ES " + ver_num[1] + " (" + glslVersion + ")"
            }
            ret = stringToNewUTF8(glslVersion);
            break;
        default:
            GL.recordError(1280);
            return 0
    }
    GL.stringCache[name_] = ret;
    return ret
}

function _glGetUniformLocation(program, name) {
    name = UTF8ToString(name);
    var arrayIndex = 0;
    if (name[name.length - 1] == "]") {
        var leftBrace = name.lastIndexOf("[");
        arrayIndex = name[leftBrace + 1] != "]" ? parseInt(name.slice(leftBrace + 1)) : 0;
        name = name.slice(0, leftBrace)
    }
    var uniformInfo = GL.programInfos[program] && GL.programInfos[program].uniforms[name];
    if (uniformInfo && arrayIndex >= 0 && arrayIndex < uniformInfo[0]) {
        return uniformInfo[1] + arrayIndex
    } else {
        return -1
    }
}

function _glIsEnabled(x0) {
    return GLctx["isEnabled"](x0)
}

function _glIsTexture(id) {
    var texture = GL.textures[id];
    if (!texture) return 0;
    return GLctx.isTexture(texture)
}

function _glLineWidth(x0) {
    GLctx["lineWidth"](x0)
}

function _glLinkProgram(program) {
    GLctx.linkProgram(GL.programs[program]);
    GL.populateUniformTable(program)
}

function __computeUnpackAlignedImageSize(width, height, sizePerPixel, alignment) {
    function roundedToNextMultipleOf(x, y) {
        return x + y - 1 & -y
    }

    var plainRowSize = width * sizePerPixel;
    var alignedRowSize = roundedToNextMultipleOf(plainRowSize, alignment);
    return height * alignedRowSize
}

var __colorChannelsInGlTextureFormat = {
    6402: 1,
    6403: 1,
    6406: 1,
    6407: 3,
    6408: 4,
    6409: 1,
    6410: 2,
    33319: 2,
    33320: 2,
    35904: 3,
    35906: 4,
    36244: 1,
    36248: 3,
    36249: 4
};
var __sizeOfGlTextureElementType = {
    5120: 1,
    5121: 1,
    5122: 2,
    5123: 2,
    5124: 4,
    5125: 4,
    5126: 4,
    5131: 2,
    32819: 2,
    32820: 2,
    33635: 2,
    33640: 4,
    34042: 4,
    35899: 4,
    35902: 4,
    36193: 2
};

function emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) {
    var sizePerPixel = __colorChannelsInGlTextureFormat[format] * __sizeOfGlTextureElementType[type];
    if (!sizePerPixel) {
        GL.recordError(1280);
        return
    }
    var bytes = __computeUnpackAlignedImageSize(width, height, sizePerPixel, GL.unpackAlignment);
    var end = pixels + bytes;
    switch (type) {
        case 5120:
            return HEAP8.subarray(pixels, end);
        case 5121:
            return HEAPU8.subarray(pixels, end);
        case 5122:
            return HEAP16.subarray(pixels >> 1, end >> 1);
        case 5124:
            return HEAP32.subarray(pixels >> 2, end >> 2);
        case 5126:
            return HEAPF32.subarray(pixels >> 2, end >> 2);
        case 5125:
        case 34042:
        case 35902:
        case 33640:
        case 35899:
        case 34042:
            return HEAPU32.subarray(pixels >> 2, end >> 2);
        case 5123:
        case 33635:
        case 32819:
        case 32820:
        case 36193:
        case 5131:
            return HEAPU16.subarray(pixels >> 1, end >> 1);
        default:
            GL.recordError(1280)
    }
}

function __heapObjectForWebGLType(type) {
    switch (type) {
        case 5120:
            return HEAP8;
        case 5121:
            return HEAPU8;
        case 5122:
            return HEAP16;
        case 5123:
        case 33635:
        case 32819:
        case 32820:
        case 36193:
        case 5131:
            return HEAPU16;
        case 5124:
            return HEAP32;
        case 5125:
        case 34042:
        case 35902:
        case 33640:
        case 35899:
        case 34042:
            return HEAPU32;
        case 5126:
            return HEAPF32
    }
}

var __heapAccessShiftForWebGLType = {
    5122: 1,
    5123: 1,
    5124: 2,
    5125: 2,
    5126: 2,
    5131: 1,
    32819: 1,
    32820: 1,
    33635: 1,
    33640: 2,
    34042: 2,
    35899: 2,
    35902: 2,
    36193: 1
};

function _glReadPixels(x, y, width, height, format, type, pixels) {
    if (GL.currentContext.supportsWebGL2EntryPoints) {
        if (GLctx.currentPixelPackBufferBinding) {
            GLctx.readPixels(x, y, width, height, format, type, pixels)
        } else {
            GLctx.readPixels(x, y, width, height, format, type, __heapObjectForWebGLType(type), pixels >> (__heapAccessShiftForWebGLType[type] | 0))
        }
        return
    }
    var pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, format);
    if (!pixelData) {
        GL.recordError(1280);
        return
    }
    GLctx.readPixels(x, y, width, height, format, type, pixelData)
}

function _glShaderSource(shader, count, string, length) {
    var source = GL.getSource(shader, count, string, length);
    GLctx.shaderSource(GL.shaders[shader], source)
}

function _glStencilFunc(x0, x1, x2) {
    GLctx["stencilFunc"](x0, x1, x2)
}

function _glStencilOp(x0, x1, x2) {
    GLctx["stencilOp"](x0, x1, x2)
}

function _glTexImage2D(target, level, internalFormat, width, height, border, format, type, pixels) {
    if (GL.currentContext.supportsWebGL2EntryPoints) {
        if (GLctx.currentPixelUnpackBufferBinding) {
            GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels)
        } else if (pixels != 0) {
            GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, __heapObjectForWebGLType(type), pixels >> (__heapAccessShiftForWebGLType[type] | 0))
        } else {
            GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, null)
        }
        return
    }
    GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) : null)
}

function _glTexParameteri(x0, x1, x2) {
    GLctx["texParameteri"](x0, x1, x2)
}

function _glUniform1f(location, v0) {
    GLctx.uniform1f(GL.uniforms[location], v0)
}

function _glUniform1i(location, v0) {
    GLctx.uniform1i(GL.uniforms[location], v0)
}

function _glUniform1iv(location, count, value) {
    if (GL.currentContext.supportsWebGL2EntryPoints) {
        GLctx.uniform1iv(GL.uniforms[location], HEAP32, value >> 2, count);
        return
    }
    GLctx.uniform1iv(GL.uniforms[location], HEAP32.subarray(value >> 2, value + count * 4 >> 2))
}

function _glUniform3fv(location, count, value) {
    if (GL.currentContext.supportsWebGL2EntryPoints) {
        GLctx.uniform3fv(GL.uniforms[location], HEAPF32, value >> 2, count * 3);
        return
    }
    if (3 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
        var view = GL.miniTempBufferViews[3 * count - 1];
        for (var i = 0; i < 3 * count; i += 3) {
            view[i] = HEAPF32[value + 4 * i >> 2];
            view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
            view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2]
        }
    } else {
        var view = HEAPF32.subarray(value >> 2, value + count * 12 >> 2)
    }
    GLctx.uniform3fv(GL.uniforms[location], view)
}

function _glUniform4f(location, v0, v1, v2, v3) {
    GLctx.uniform4f(GL.uniforms[location], v0, v1, v2, v3)
}

function _glUniform4fv(location, count, value) {
    if (GL.currentContext.supportsWebGL2EntryPoints) {
        GLctx.uniform4fv(GL.uniforms[location], HEAPF32, value >> 2, count * 4);
        return
    }
    if (4 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
        var view = GL.miniTempBufferViews[4 * count - 1];
        for (var i = 0; i < 4 * count; i += 4) {
            view[i] = HEAPF32[value + 4 * i >> 2];
            view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
            view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
            view[i + 3] = HEAPF32[value + (4 * i + 12) >> 2]
        }
    } else {
        var view = HEAPF32.subarray(value >> 2, value + count * 16 >> 2)
    }
    GLctx.uniform4fv(GL.uniforms[location], view)
}

function _glUniformMatrix4fv(location, count, transpose, value) {
    if (GL.currentContext.supportsWebGL2EntryPoints) {
        GLctx.uniformMatrix4fv(GL.uniforms[location], !!transpose, HEAPF32, value >> 2, count * 16);
        return
    }
    if (16 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
        var view = GL.miniTempBufferViews[16 * count - 1];
        for (var i = 0; i < 16 * count; i += 16) {
            view[i] = HEAPF32[value + 4 * i >> 2];
            view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
            view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
            view[i + 3] = HEAPF32[value + (4 * i + 12) >> 2];
            view[i + 4] = HEAPF32[value + (4 * i + 16) >> 2];
            view[i + 5] = HEAPF32[value + (4 * i + 20) >> 2];
            view[i + 6] = HEAPF32[value + (4 * i + 24) >> 2];
            view[i + 7] = HEAPF32[value + (4 * i + 28) >> 2];
            view[i + 8] = HEAPF32[value + (4 * i + 32) >> 2];
            view[i + 9] = HEAPF32[value + (4 * i + 36) >> 2];
            view[i + 10] = HEAPF32[value + (4 * i + 40) >> 2];
            view[i + 11] = HEAPF32[value + (4 * i + 44) >> 2];
            view[i + 12] = HEAPF32[value + (4 * i + 48) >> 2];
            view[i + 13] = HEAPF32[value + (4 * i + 52) >> 2];
            view[i + 14] = HEAPF32[value + (4 * i + 56) >> 2];
            view[i + 15] = HEAPF32[value + (4 * i + 60) >> 2]
        }
    } else {
        var view = HEAPF32.subarray(value >> 2, value + count * 64 >> 2)
    }
    GLctx.uniformMatrix4fv(GL.uniforms[location], !!transpose, view)
}

function _glUseProgram(program) {
    GLctx.useProgram(GL.programs[program])
}

function _glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
    var cb = GL.currentContext.clientBuffers[index];
    if (!GL.currArrayBuffer) {
        cb.size = size;
        cb.type = type;
        cb.normalized = normalized;
        cb.stride = stride;
        cb.ptr = ptr;
        cb.clientside = true;
        cb.vertexAttribPointerAdaptor = function (index, size, type, normalized, stride, ptr) {
            this.vertexAttribPointer(index, size, type, normalized, stride, ptr)
        };
        return
    }
    cb.clientside = false;
    GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr)
}

function _glViewport(x0, x1, x2, x3) {
    GLctx["viewport"](x0, x1, x2, x3)
}

function _gmtime_r(time, tmPtr) {
    var date = new Date(HEAP32[time >> 2] * 1e3);
    HEAP32[tmPtr >> 2] = date.getUTCSeconds();
    HEAP32[tmPtr + 4 >> 2] = date.getUTCMinutes();
    HEAP32[tmPtr + 8 >> 2] = date.getUTCHours();
    HEAP32[tmPtr + 12 >> 2] = date.getUTCDate();
    HEAP32[tmPtr + 16 >> 2] = date.getUTCMonth();
    HEAP32[tmPtr + 20 >> 2] = date.getUTCFullYear() - 1900;
    HEAP32[tmPtr + 24 >> 2] = date.getUTCDay();
    HEAP32[tmPtr + 36 >> 2] = 0;
    HEAP32[tmPtr + 32 >> 2] = 0;
    var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
    var yday = (date.getTime() - start) / (1e3 * 60 * 60 * 24) | 0;
    HEAP32[tmPtr + 28 >> 2] = yday;
    HEAP32[tmPtr + 40 >> 2] = ___tm_timezone;
    return tmPtr
}

function _gmtime(time) {
    return _gmtime_r(time, ___tm_current)
}

function _imFindIdb() {
    err("missing function: imFindIdb");
    abort(-1)
}

function _imMakeIdb() {
    err("missing function: imMakeIdb");
    abort(-1)
}

function _imReadAudio() {
    err("missing function: imReadAudio");
    abort(-1)
}

function _imReadIdb() {
    err("missing function: imReadIdb");
    abort(-1)
}

function _imRenameAudio() {
    err("missing function: imRenameAudio");
    abort(-1)
}

function _imWaitJobBg() {
    err("missing function: imWaitJobBg");
    abort(-1)
}

function _imWrGamess() {
    err("missing function: imWrGamess");
    abort(-1)
}

function _imWriteAudio() {
    err("missing function: imWriteAudio");
    abort(-1)
}

function _imWriteIdb() {
    err("missing function: imWriteIdb");
    abort(-1)
}

function _llvm_bswap_i64(l, h) {
    var retl = _llvm_bswap_i32(h) >>> 0;
    var reth = _llvm_bswap_i32(l) >>> 0;
    return (setTempRet0(reth), retl) | 0
}

function _llvm_exp2_f32(x) {
    return Math.pow(2, x)
}

function _llvm_exp2_f64(a0) {
    return _llvm_exp2_f32(a0)
}

function _llvm_log10_f32(x) {
    return Math.log(x) / Math.LN10
}

function _llvm_log10_f64(a0) {
    return _llvm_log10_f32(a0)
}

function _llvm_trap() {
    abort("trap!")
}

var _llvm_trunc_f64 = Math_trunc;

function _localtime(time) {
    return _localtime_r(time, ___tm_current)
}

function _longjmp(env, value) {
    _setThrew(env, value || 1);
    throw"longjmp"
}

function _mcLoopStep() {
    err("missing function: mcLoopStep");
    abort(-1)
}

function _emscripten_memcpy_big(dest, src, num) {
    HEAPU8.set(HEAPU8.subarray(src, src + num), dest)
}

function _mkProfileSeq() {
    err("missing function: mkProfileSeq");
    abort(-1)
}

function _popen() {
    err("missing function: popen");
    abort(-1)
}

function _putenv(string) {
    if (string === 0) {
        ___setErrNo(22);
        return -1
    }
    string = UTF8ToString(string);
    var splitPoint = string.indexOf("=");
    if (string === "" || string.indexOf("=") === -1) {
        ___setErrNo(22);
        return -1
    }
    var name = string.slice(0, splitPoint);
    var value = string.slice(splitPoint + 1);
    if (!(name in ENV) || ENV[name] !== value) {
        ENV[name] = value;
        ___buildEnvironment(__get_environ())
    }
    return 0
}

function _rdGamess() {
    err("missing function: rdGamess");
    abort(-1)
}

var _sqrt = Math_sqrt;

function __isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

function __arraySum(array, index) {
    var sum = 0;
    for (var i = 0; i <= index; sum += array[i++]) ;
    return sum
}

var __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function __addDays(date, days) {
    var newDate = new Date(date.getTime());
    while (days > 0) {
        var leap = __isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
        if (days > daysInCurrentMonth - newDate.getDate()) {
            days -= daysInCurrentMonth - newDate.getDate() + 1;
            newDate.setDate(1);
            if (currentMonth < 11) {
                newDate.setMonth(currentMonth + 1)
            } else {
                newDate.setMonth(0);
                newDate.setFullYear(newDate.getFullYear() + 1)
            }
        } else {
            newDate.setDate(newDate.getDate() + days);
            return newDate
        }
    }
    return newDate
}

function _strftime(s, maxsize, format, tm) {
    var tm_zone = HEAP32[tm + 40 >> 2];
    var date = {
        tm_sec: HEAP32[tm >> 2],
        tm_min: HEAP32[tm + 4 >> 2],
        tm_hour: HEAP32[tm + 8 >> 2],
        tm_mday: HEAP32[tm + 12 >> 2],
        tm_mon: HEAP32[tm + 16 >> 2],
        tm_year: HEAP32[tm + 20 >> 2],
        tm_wday: HEAP32[tm + 24 >> 2],
        tm_yday: HEAP32[tm + 28 >> 2],
        tm_isdst: HEAP32[tm + 32 >> 2],
        tm_gmtoff: HEAP32[tm + 36 >> 2],
        tm_zone: tm_zone ? UTF8ToString(tm_zone) : ""
    };
    var pattern = UTF8ToString(format);
    var EXPANSION_RULES_1 = {
        "%c": "%a %b %d %H:%M:%S %Y",
        "%D": "%m/%d/%y",
        "%F": "%Y-%m-%d",
        "%h": "%b",
        "%r": "%I:%M:%S %p",
        "%R": "%H:%M",
        "%T": "%H:%M:%S",
        "%x": "%m/%d/%y",
        "%X": "%H:%M:%S"
    };
    for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule])
    }
    var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    function leadingSomething(value, digits, character) {
        var str = typeof value === "number" ? value.toString() : value || "";
        while (str.length < digits) {
            str = character[0] + str
        }
        return str
    }

    function leadingNulls(value, digits) {
        return leadingSomething(value, digits, "0")
    }

    function compareByDay(date1, date2) {
        function sgn(value) {
            return value < 0 ? -1 : value > 0 ? 1 : 0
        }

        var compare;
        if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
            if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
                compare = sgn(date1.getDate() - date2.getDate())
            }
        }
        return compare
    }

    function getFirstWeekStartDate(janFourth) {
        switch (janFourth.getDay()) {
            case 0:
                return new Date(janFourth.getFullYear() - 1, 11, 29);
            case 1:
                return janFourth;
            case 2:
                return new Date(janFourth.getFullYear(), 0, 3);
            case 3:
                return new Date(janFourth.getFullYear(), 0, 2);
            case 4:
                return new Date(janFourth.getFullYear(), 0, 1);
            case 5:
                return new Date(janFourth.getFullYear() - 1, 11, 31);
            case 6:
                return new Date(janFourth.getFullYear() - 1, 11, 30)
        }
    }

    function getWeekBasedYear(date) {
        var thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
        var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
        var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
        var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
        var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
        if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
                return thisDate.getFullYear() + 1
            } else {
                return thisDate.getFullYear()
            }
        } else {
            return thisDate.getFullYear() - 1
        }
    }

    var EXPANSION_RULES_2 = {
        "%a": function (date) {
            return WEEKDAYS[date.tm_wday].substring(0, 3)
        }, "%A": function (date) {
            return WEEKDAYS[date.tm_wday]
        }, "%b": function (date) {
            return MONTHS[date.tm_mon].substring(0, 3)
        }, "%B": function (date) {
            return MONTHS[date.tm_mon]
        }, "%C": function (date) {
            var year = date.tm_year + 1900;
            return leadingNulls(year / 100 | 0, 2)
        }, "%d": function (date) {
            return leadingNulls(date.tm_mday, 2)
        }, "%e": function (date) {
            return leadingSomething(date.tm_mday, 2, " ")
        }, "%g": function (date) {
            return getWeekBasedYear(date).toString().substring(2)
        }, "%G": function (date) {
            return getWeekBasedYear(date)
        }, "%H": function (date) {
            return leadingNulls(date.tm_hour, 2)
        }, "%I": function (date) {
            var twelveHour = date.tm_hour;
            if (twelveHour == 0) twelveHour = 12; else if (twelveHour > 12) twelveHour -= 12;
            return leadingNulls(twelveHour, 2)
        }, "%j": function (date) {
            return leadingNulls(date.tm_mday + __arraySum(__isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon - 1), 3)
        }, "%m": function (date) {
            return leadingNulls(date.tm_mon + 1, 2)
        }, "%M": function (date) {
            return leadingNulls(date.tm_min, 2)
        }, "%n": function () {
            return "\n"
        }, "%p": function (date) {
            if (date.tm_hour >= 0 && date.tm_hour < 12) {
                return "AM"
            } else {
                return "PM"
            }
        }, "%S": function (date) {
            return leadingNulls(date.tm_sec, 2)
        }, "%t": function () {
            return "\t"
        }, "%u": function (date) {
            var day = new Date(date.tm_year + 1900, date.tm_mon + 1, date.tm_mday, 0, 0, 0, 0);
            return day.getDay() || 7
        }, "%U": function (date) {
            var janFirst = new Date(date.tm_year + 1900, 0, 1);
            var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7 - janFirst.getDay());
            var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
            if (compareByDay(firstSunday, endDate) < 0) {
                var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
                var firstSundayUntilEndJanuary = 31 - firstSunday.getDate();
                var days = firstSundayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
                return leadingNulls(Math.ceil(days / 7), 2)
            }
            return compareByDay(firstSunday, janFirst) === 0 ? "01" : "00"
        }, "%V": function (date) {
            var janFourthThisYear = new Date(date.tm_year + 1900, 0, 4);
            var janFourthNextYear = new Date(date.tm_year + 1901, 0, 4);
            var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
            var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
            var endDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
            if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
                return "53"
            }
            if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
                return "01"
            }
            var daysDifference;
            if (firstWeekStartThisYear.getFullYear() < date.tm_year + 1900) {
                daysDifference = date.tm_yday + 32 - firstWeekStartThisYear.getDate()
            } else {
                daysDifference = date.tm_yday + 1 - firstWeekStartThisYear.getDate()
            }
            return leadingNulls(Math.ceil(daysDifference / 7), 2)
        }, "%w": function (date) {
            var day = new Date(date.tm_year + 1900, date.tm_mon + 1, date.tm_mday, 0, 0, 0, 0);
            return day.getDay()
        }, "%W": function (date) {
            var janFirst = new Date(date.tm_year, 0, 1);
            var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7 - janFirst.getDay() + 1);
            var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
            if (compareByDay(firstMonday, endDate) < 0) {
                var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
                var firstMondayUntilEndJanuary = 31 - firstMonday.getDate();
                var days = firstMondayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
                return leadingNulls(Math.ceil(days / 7), 2)
            }
            return compareByDay(firstMonday, janFirst) === 0 ? "01" : "00"
        }, "%y": function (date) {
            return (date.tm_year + 1900).toString().substring(2)
        }, "%Y": function (date) {
            return date.tm_year + 1900
        }, "%z": function (date) {
            var off = date.tm_gmtoff;
            var ahead = off >= 0;
            off = Math.abs(off) / 60;
            off = off / 60 * 100 + off % 60;
            return (ahead ? "+" : "-") + String("0000" + off).slice(-4)
        }, "%Z": function (date) {
            return date.tm_zone
        }, "%%": function () {
            return "%"
        }
    };
    for (var rule in EXPANSION_RULES_2) {
        if (pattern.indexOf(rule) >= 0) {
            pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date))
        }
    }
    var bytes = intArrayFromString(pattern, false);
    if (bytes.length > maxsize) {
        return 0
    }
    writeArrayToMemory(bytes, s);
    return bytes.length - 1
}

function _strptime(buf, format, tm) {
    var pattern = UTF8ToString(format);
    var SPECIAL_CHARS = "\\!@#$^&*()+=-[]/{}|:<>?,.";
    for (var i = 0, ii = SPECIAL_CHARS.length; i < ii; ++i) {
        pattern = pattern.replace(new RegExp("\\" + SPECIAL_CHARS[i], "g"), "\\" + SPECIAL_CHARS[i])
    }
    var EQUIVALENT_MATCHERS = {
        "%A": "%a",
        "%B": "%b",
        "%c": "%a %b %d %H:%M:%S %Y",
        "%D": "%m\\/%d\\/%y",
        "%e": "%d",
        "%F": "%Y-%m-%d",
        "%h": "%b",
        "%R": "%H\\:%M",
        "%r": "%I\\:%M\\:%S\\s%p",
        "%T": "%H\\:%M\\:%S",
        "%x": "%m\\/%d\\/(?:%y|%Y)",
        "%X": "%H\\:%M\\:%S"
    };
    for (var matcher in EQUIVALENT_MATCHERS) {
        pattern = pattern.replace(matcher, EQUIVALENT_MATCHERS[matcher])
    }
    var DATE_PATTERNS = {
        "%a": "(?:Sun(?:day)?)|(?:Mon(?:day)?)|(?:Tue(?:sday)?)|(?:Wed(?:nesday)?)|(?:Thu(?:rsday)?)|(?:Fri(?:day)?)|(?:Sat(?:urday)?)",
        "%b": "(?:Jan(?:uary)?)|(?:Feb(?:ruary)?)|(?:Mar(?:ch)?)|(?:Apr(?:il)?)|May|(?:Jun(?:e)?)|(?:Jul(?:y)?)|(?:Aug(?:ust)?)|(?:Sep(?:tember)?)|(?:Oct(?:ober)?)|(?:Nov(?:ember)?)|(?:Dec(?:ember)?)",
        "%C": "\\d\\d",
        "%d": "0[1-9]|[1-9](?!\\d)|1\\d|2\\d|30|31",
        "%H": "\\d(?!\\d)|[0,1]\\d|20|21|22|23",
        "%I": "\\d(?!\\d)|0\\d|10|11|12",
        "%j": "00[1-9]|0?[1-9](?!\\d)|0?[1-9]\\d(?!\\d)|[1,2]\\d\\d|3[0-6]\\d",
        "%m": "0[1-9]|[1-9](?!\\d)|10|11|12",
        "%M": "0\\d|\\d(?!\\d)|[1-5]\\d",
        "%n": "\\s",
        "%p": "AM|am|PM|pm|A\\.M\\.|a\\.m\\.|P\\.M\\.|p\\.m\\.",
        "%S": "0\\d|\\d(?!\\d)|[1-5]\\d|60",
        "%U": "0\\d|\\d(?!\\d)|[1-4]\\d|50|51|52|53",
        "%W": "0\\d|\\d(?!\\d)|[1-4]\\d|50|51|52|53",
        "%w": "[0-6]",
        "%y": "\\d\\d",
        "%Y": "\\d\\d\\d\\d",
        "%%": "%",
        "%t": "\\s"
    };
    var MONTH_NUMBERS = {
        JAN: 0,
        FEB: 1,
        MAR: 2,
        APR: 3,
        MAY: 4,
        JUN: 5,
        JUL: 6,
        AUG: 7,
        SEP: 8,
        OCT: 9,
        NOV: 10,
        DEC: 11
    };
    var DAY_NUMBERS_SUN_FIRST = {SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6};
    var DAY_NUMBERS_MON_FIRST = {MON: 0, TUE: 1, WED: 2, THU: 3, FRI: 4, SAT: 5, SUN: 6};
    for (var datePattern in DATE_PATTERNS) {
        pattern = pattern.replace(datePattern, "(" + datePattern + DATE_PATTERNS[datePattern] + ")")
    }
    var capture = [];
    for (var i = pattern.indexOf("%"); i >= 0; i = pattern.indexOf("%")) {
        capture.push(pattern[i + 1]);
        pattern = pattern.replace(new RegExp("\\%" + pattern[i + 1], "g"), "")
    }
    var matches = new RegExp("^" + pattern, "i").exec(UTF8ToString(buf));

    function initDate() {
        function fixup(value, min, max) {
            return typeof value !== "number" || isNaN(value) ? min : value >= min ? value <= max ? value : max : min
        }

        return {
            year: fixup(HEAP32[tm + 20 >> 2] + 1900, 1970, 9999),
            month: fixup(HEAP32[tm + 16 >> 2], 0, 11),
            day: fixup(HEAP32[tm + 12 >> 2], 1, 31),
            hour: fixup(HEAP32[tm + 8 >> 2], 0, 23),
            min: fixup(HEAP32[tm + 4 >> 2], 0, 59),
            sec: fixup(HEAP32[tm >> 2], 0, 59)
        }
    }

    if (matches) {
        var date = initDate();
        var value;

        function getMatch(symbol) {
            var pos = capture.indexOf(symbol);
            if (pos >= 0) {
                return matches[pos + 1]
            }
            return
        }

        if (value = getMatch("S")) {
            date.sec = parseInt(value)
        }
        if (value = getMatch("M")) {
            date.min = parseInt(value)
        }
        if (value = getMatch("H")) {
            date.hour = parseInt(value)
        } else if (value = getMatch("I")) {
            var hour = parseInt(value);
            if (value = getMatch("p")) {
                hour += value.toUpperCase()[0] === "P" ? 12 : 0
            }
            date.hour = hour
        }
        if (value = getMatch("Y")) {
            date.year = parseInt(value)
        } else if (value = getMatch("y")) {
            var year = parseInt(value);
            if (value = getMatch("C")) {
                year += parseInt(value) * 100
            } else {
                year += year < 69 ? 2e3 : 1900
            }
            date.year = year
        }
        if (value = getMatch("m")) {
            date.month = parseInt(value) - 1
        } else if (value = getMatch("b")) {
            date.month = MONTH_NUMBERS[value.substring(0, 3).toUpperCase()] || 0
        }
        if (value = getMatch("d")) {
            date.day = parseInt(value)
        } else if (value = getMatch("j")) {
            var day = parseInt(value);
            var leapYear = __isLeapYear(date.year);
            for (var month = 0; month < 12; ++month) {
                var daysUntilMonth = __arraySum(leapYear ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, month - 1);
                if (day <= daysUntilMonth + (leapYear ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[month]) {
                    date.day = day - daysUntilMonth
                }
            }
        } else if (value = getMatch("a")) {
            var weekDay = value.substring(0, 3).toUpperCase();
            if (value = getMatch("U")) {
                var weekDayNumber = DAY_NUMBERS_SUN_FIRST[weekDay];
                var weekNumber = parseInt(value);
                var janFirst = new Date(date.year, 0, 1);
                var endDate;
                if (janFirst.getDay() === 0) {
                    endDate = __addDays(janFirst, weekDayNumber + 7 * (weekNumber - 1))
                } else {
                    endDate = __addDays(janFirst, 7 - janFirst.getDay() + weekDayNumber + 7 * (weekNumber - 1))
                }
                date.day = endDate.getDate();
                date.month = endDate.getMonth()
            } else if (value = getMatch("W")) {
                var weekDayNumber = DAY_NUMBERS_MON_FIRST[weekDay];
                var weekNumber = parseInt(value);
                var janFirst = new Date(date.year, 0, 1);
                var endDate;
                if (janFirst.getDay() === 1) {
                    endDate = __addDays(janFirst, weekDayNumber + 7 * (weekNumber - 1))
                } else {
                    endDate = __addDays(janFirst, 7 - janFirst.getDay() + 1 + weekDayNumber + 7 * (weekNumber - 1))
                }
                date.day = endDate.getDate();
                date.month = endDate.getMonth()
            }
        }
        var fullDate = new Date(date.year, date.month, date.day, date.hour, date.min, date.sec, 0);
        HEAP32[tm >> 2] = fullDate.getSeconds();
        HEAP32[tm + 4 >> 2] = fullDate.getMinutes();
        HEAP32[tm + 8 >> 2] = fullDate.getHours();
        HEAP32[tm + 12 >> 2] = fullDate.getDate();
        HEAP32[tm + 16 >> 2] = fullDate.getMonth();
        HEAP32[tm + 20 >> 2] = fullDate.getFullYear() - 1900;
        HEAP32[tm + 24 >> 2] = fullDate.getDay();
        HEAP32[tm + 28 >> 2] = __arraySum(__isLeapYear(fullDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, fullDate.getMonth() - 1) + fullDate.getDate() - 1;
        HEAP32[tm + 32 >> 2] = 0;
        return buf + intArrayFromString(matches[0]).length - 1
    }
    return 0
}

function _time(ptr) {
    var ret = Date.now() / 1e3 | 0;
    if (ptr) {
        HEAP32[ptr >> 2] = ret
    }
    return ret
}

function _usleep(useconds) {
    var msec = useconds / 1e3;
    if ((ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && self["performance"] && self["performance"]["now"]) {
        var start = self["performance"]["now"]();
        while (self["performance"]["now"]() - start < msec) {
        }
    } else {
        var start = Date.now();
        while (Date.now() - start < msec) {
        }
    }
    return 0
}

var ___dso_handle = 3484912;
if (ENVIRONMENT_IS_NODE) {
    _emscripten_get_now = function _emscripten_get_now_actual() {
        var t = process["hrtime"]();
        return t[0] * 1e3 + t[1] / 1e6
    }
} else if (typeof dateNow !== "undefined") {
    _emscripten_get_now = dateNow
} else if (typeof self === "object" && self["performance"] && typeof self["performance"]["now"] === "function") {
    _emscripten_get_now = function () {
        return self["performance"]["now"]()
    }
} else if (typeof performance === "object" && typeof performance["now"] === "function") {
    _emscripten_get_now = function () {
        return performance["now"]()
    }
} else {
    _emscripten_get_now = Date.now
}
FS.staticInit();
if (ENVIRONMENT_IS_NODE) {
    var fs = require("fs");
    var NODEJS_PATH = require("path");
    NODEFS.staticInit()
}
embind_init_charCodes();
BindingError = Module["BindingError"] = extendError(Error, "BindingError");
InternalError = Module["InternalError"] = extendError(Error, "InternalError");
init_ClassHandle();
init_RegisteredPointer();
init_embind();
UnboundTypeError = Module["UnboundTypeError"] = extendError(Error, "UnboundTypeError");
init_emval();
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas, vrDevice) {
    err("Module.requestFullScreen is deprecated. Please call Module.requestFullscreen instead.");
    Module["requestFullScreen"] = Module["requestFullscreen"];
    Browser.requestFullScreen(lockPointer, resizeCanvas, vrDevice)
};
Module["requestFullscreen"] = function Module_requestFullscreen(lockPointer, resizeCanvas, vrDevice) {
    Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice)
};
Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) {
    Browser.requestAnimationFrame(func)
};
Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) {
    Browser.setCanvasSize(width, height, noUpdates)
};
Module["pauseMainLoop"] = function Module_pauseMainLoop() {
    Browser.mainLoop.pause()
};
Module["resumeMainLoop"] = function Module_resumeMainLoop() {
    Browser.mainLoop.resume()
};
Module["getUserMedia"] = function Module_getUserMedia() {
    Browser.getUserMedia()
};
Module["createContext"] = function Module_createContext(canvas, useWebGL, setInModule, webGLContextAttributes) {
    return Browser.createContext(canvas, useWebGL, setInModule, webGLContextAttributes)
};
var GLctx;
GL.init();
var ASSERTIONS = true;

function intArrayFromString(stringy, dontAddNull, length) {
    var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
    var u8array = new Array(len);
    var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
    if (dontAddNull) u8array.length = numBytesWritten;
    return u8array
}

var debug_table_dd = ["0", "__Z16KernelUniform_1fd", "__Z17KernelTriangle_1fd", "__Z21KernelEpanechnikov_1fd", "__Z16KernelQuartic_1fd", "__Z18KernelTriweight_1fd", "__Z17KernelGaussian_1fd", "__Z16KernelCosinus_1fd", "_sqrt", "__Z9fwhm_funcd", "__Z11bell_filterd", "0", "0", "0", "0", "0"];
var debug_table_di = ["0", "__ZNK3SVM15PredictionModel10linearBiasEv", "__ZNK3SVM15RegressionModel10linearBiasEv", "__ZNK3SVM10KPLSRModel10linearBiasEv", "__ZNK3SVM18SVMPredictionModel10linearBiasEv", "__ZNK16ChemicalInstance6weightEv", "__ZN16ChemicalInstance13elementWeightEi", "0"];
var debug_table_dii = ["0", "__ZNK10PatternSetI9BeeBitSetE7sqrNormEi", "__ZNK10PatternSetI9NumVectorIfEE7sqrNormEi", "__ZNK14MixedVectorSet7sqrNormEi", "__ZNK10PatternSetI12SparseVectorIidEE7sqrNormEi", "__ZNK10PatternSetI12SparseVectorIiiEE7sqrNormEi", "__ZNK10PatternSetI9NumVectorIiEE7sqrNormEi", "__ZNK10PatternSetI9NumVectorIdEE7sqrNormEi", "__ZNK10PatternSetI9BeeStringE7sqrNormEi", "__ZNK9VectorSet7sqrNormEi", "__ZN3SVM9SVMachine3C_iEi", "__ZN3SVM11SVMRMachine3p_iEi", "__ZN3SVM11SVMCMachine3C_iEi", "__ZN3SVM11SVMCMachine3p_iEi", "__ZN10emscripten8internal13MethodInvokerIM16ChemicalInstanceKFdvEdPKS2_JEE6invokeERKS4_S6_", "__ZN10emscripten8internal7InvokerIdJiEE6invokeEPFdiEi", "__Z7eq_funcPdPv", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"];
var debug_table_diii = ["0", "__ZNK10PatternSetI9BeeBitSetE2ipEii", "__ZNK10PatternSetI9BeeBitSetE7sqrDistEii", "__ZNK9VectorSet4simlEii", "__ZNK9VectorSet4dissEii", "__ZNK17CBitSetPatternSet4dissEii", "__ZNK10PatternSetI9NumVectorIfEE2ipEii", "__ZNK10PatternSetI9NumVectorIfEE7sqrDistEii", "__ZNK14MixedVectorSet2ipEii", "__ZNK14MixedVectorSet7sqrDistEii", "__ZNK14MixedVectorSet4simlEii", "__ZNK14MixedVectorSet4dissEii", "__ZNK10PatternSetI12SparseVectorIidEE2ipEii", "__ZNK10PatternSetI12SparseVectorIidEE7sqrDistEii", "__ZNK10PatternSetI12SparseVectorIiiEE2ipEii", "__ZNK10PatternSetI12SparseVectorIiiEE7sqrDistEii", "__ZNK10PatternSetI9NumVectorIiEE2ipEii", "__ZNK10PatternSetI9NumVectorIiEE7sqrDistEii", "__ZNK10PatternSetI9NumVectorIdEE2ipEii", "__ZNK10PatternSetI9NumVectorIdEE7sqrDistEii", "__ZNK10PatternSetI9BeeStringE2ipEii", "__ZNK10PatternSetI9BeeStringE7sqrDistEii", "__ZNK9VectorSet2ipEii", "__ZNK9VectorSet7sqrDistEii", "__ZNK18UpperDimtVectorSetIfE4dissEii", "__ZN3SVM11SVMRMachine4Q_ijEii", "__ZN3SVM11SVMCMachine4Q_ijEii", "__ZNK15DMatrixExport_F2atEii", "0", "0", "0", "0"];
var debug_table_diiii = ["0", "__ZNK10PatternSetI9BeeBitSetE2ipEiP9VectorSeti", "__ZNK10PatternSetI9BeeBitSetE7sqrDistEiP9VectorSeti", "__ZNK9VectorSet4simlEiPS_i", "__ZNK9VectorSet4dissEiPS_i", "__ZNK17CBitSetPatternSet4dissEiP9VectorSeti", "__ZNK10PatternSetI9NumVectorIfEE2ipEiP9VectorSeti", "__ZNK10PatternSetI9NumVectorIfEE7sqrDistEiP9VectorSeti", "__ZNK14MixedVectorSet2ipEiP9VectorSeti", "__ZNK14MixedVectorSet7sqrDistEiP9VectorSeti", "__ZNK14MixedVectorSet4simlEiP9VectorSeti", "__ZNK10PatternSetI12SparseVectorIidEE2ipEiP9VectorSeti", "__ZNK10PatternSetI12SparseVectorIidEE7sqrDistEiP9VectorSeti", "__ZNK10PatternSetI12SparseVectorIiiEE2ipEiP9VectorSeti", "__ZNK10PatternSetI12SparseVectorIiiEE7sqrDistEiP9VectorSeti", "__ZNK10PatternSetI9NumVectorIiEE2ipEiP9VectorSeti", "__ZNK10PatternSetI9NumVectorIiEE7sqrDistEiP9VectorSeti", "__ZNK10PatternSetI9NumVectorIdEE2ipEiP9VectorSeti", "__ZNK10PatternSetI9NumVectorIdEE7sqrDistEiP9VectorSeti", "__ZNK3SVM10Kernel_Dot8kProductERK11URefPointerI9VectorSetEii", "__ZNK10PatternSetI9BeeStringE2ipEiP9VectorSeti", "__ZNK10PatternSetI9BeeStringE7sqrDistEiP9VectorSeti", "__ZNK9VectorSet2ipEiPS_i", "__ZNK9VectorSet7sqrDistEiPS_i", "__ZNK3SVM17Kernel_Polynomial8kProductERK11URefPointerI9VectorSetEii", "__ZNK3SVM13Kernel_Radial8kProductERK11URefPointerI9VectorSetEii", "__ZNK3SVM14Kernel_Sigmoid8kProductERK11URefPointerI9VectorSetEii", "__ZNK3SVM15Kernel_Tanimoto8kProductERK11URefPointerI9VectorSetEii", "0", "0", "0", "0"];
var debug_table_diiiii = ["0", "__ZNK3SVM10Kernel_Dot8kProductERK11URefPointerI9VectorSetEiS5_i", "__ZNK3SVM17Kernel_Polynomial8kProductERK11URefPointerI9VectorSetEiS5_i", "__ZNK3SVM13Kernel_Radial8kProductERK11URefPointerI9VectorSetEiS5_i", "__ZNK3SVM14Kernel_Sigmoid8kProductERK11URefPointerI9VectorSetEiS5_i", "__ZNK3SVM15Kernel_Tanimoto8kProductERK11URefPointerI9VectorSetEiS5_i", "0", "0"];
var debug_table_i = ["0"];
var debug_table_ii = ["0", "__ZN17IcmPluginInstance6haveGLEv", "__ZN17IcmPluginInstance13switchContextEv", "__ZN17IcmPluginInstance15onDisplayChangeEv", "__ZN17IcmPluginInstance6onLoadEv", "__ZN17IcmPluginInstance12parentWindowEv", "__ZN18IcmPluginInterface23sendCheckVersionRequestEv", "__ZN18IcmPluginInterface22checkVersionFromBufferEv", "__ZN18IcmPluginInterface14isInWebBrowserEv", "__ZNKSt3__210__function6__funcI3__1NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI3__1NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcI3__2NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI3__2NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcI3__3NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI3__3NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcI3__4NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI3__4NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcI3__5NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI3__5NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcI3__6NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI3__6NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcI3__7NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI3__7NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcI3__8NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI3__8NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcI3__9NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI3__9NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcI4__10NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI4__10NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcI4__11NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI4__11NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcI4__12NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI4__12NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcI4__13NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI4__13NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcI4__14NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI4__14NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcI4__15NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI4__15NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcI4__16NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI4__16NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcI4__17NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI4__17NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcI4__18NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI4__18NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcI4__19NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI4__19NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcI4__20NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI4__20NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcI4__21NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI4__21NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcI4__22NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI4__22NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcI4__23NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI4__23NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcI4__24NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI4__24NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcI4__25NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEv", "__ZNKSt3__210__function6__funcI4__25NS_9allocatorIS2_EEFbP5S_AT_EE11target_typeEv", "__ZNKSt3__210__function6__funcIZN21IcmPluginChemicalViewC1ERKN10emscripten3valERK16ChemicalInstanceE3__7NS_9allocatorISA_EEFvvEE7__cloneEv", "__ZNKSt3__210__function6__funcIZN21IcmPluginChemicalViewC1ERKN10emscripten3valERK16ChemicalInstanceE3__7NS_9allocatorISA_EEFvvEE11target_typeEv", "__ZNKSt3__210__function6__funcIZN13IcmPluginPlot12set_plotDataERKN10emscripten3valEE3__0NS_9allocatorIS7_EEFvP9QPlotItemRK9BeeBitSetEE7__cloneEv", "__ZNKSt3__210__function6__funcIZN13IcmPluginPlot12set_plotDataERKN10emscripten3valEE3__0NS_9allocatorIS7_EEFvP9QPlotItemRK9BeeBitSetEE11target_typeEv", "__ZNKSt3__210__function6__funcIZN13IcmPluginPlot12set_plotDataERKN10emscripten3valEE3__1NS_9allocatorIS7_EEFviiEE7__cloneEv", "__ZNKSt3__210__function6__funcIZN13IcmPluginPlot12set_plotDataERKN10emscripten3valEE3__1NS_9allocatorIS7_EEFviiEE11target_typeEv", "__ZNKSt3__210__function6__funcIZN13IcmPluginPlot12set_plotDataERKN10emscripten3valEE3__2NS_9allocatorIS7_EEFviEE7__cloneEv", "__ZNKSt3__210__function6__funcIZN13IcmPluginPlot12set_plotDataERKN10emscripten3valEE3__2NS_9allocatorIS7_EEFviEE11target_typeEv", "__ZNKSt3__210__function6__funcIZN14IcmPluginTable13createClusterEiRKN10emscripten3valEE3__5NS_9allocatorIS7_EEFvvEE7__cloneEv", "__ZNKSt3__210__function6__funcIZN14IcmPluginTable13createClusterEiRKN10emscripten3valEE3__5NS_9allocatorIS7_EEFvvEE11target_typeEv", "__ZNKSt3__210__function6__funcIZN14IcmPluginTable13createClusterEiRKN10emscripten3valEE3__6NS_9allocatorIS7_EEFvvEE7__cloneEv", "__ZNKSt3__210__function6__funcIZN14IcmPluginTable13createClusterEiRKN10emscripten3valEE3__6NS_9allocatorIS7_EEFvvEE11target_typeEv", "__ZNKSt3__210__function6__funcIZN14IcmPluginTable10createPlotEiRKN10emscripten3valEE3__3NS_9allocatorIS7_EEFvvEE7__cloneEv", "__ZNKSt3__210__function6__funcIZN14IcmPluginTable10createPlotEiRKN10emscripten3valEE3__3NS_9allocatorIS7_EEFvvEE11target_typeEv", "__ZNKSt3__210__function6__funcIZN14IcmPluginTable10createPlotEiRKN10emscripten3valEE3__4NS_9allocatorIS7_EEFvP9QPlotItemRK9BeeBitSetEE7__cloneEv", "__ZNKSt3__210__function6__funcIZN14IcmPluginTable10createPlotEiRKN10emscripten3valEE3__4NS_9allocatorIS7_EEFvP9QPlotItemRK9BeeBitSetEE11target_typeEv", "__ZN18IcmPluginInterface13switchContextEv", "__ZN18IcmPluginInterface15onDisplayChangeEv", "__ZN18IcmPluginInterface6onLoadEv", "__ZN18IcmPluginInterface12parentWindowEv", "__ZNK9VectorSet7isEmptyEv", "__ZNK10PatternSetI9BeeBitSetE4typeEv", "__ZNK10PatternSetI9BeeBitSetE9vectorDimEv", "__ZNK10PatternSetI9BeeBitSetE8makeCopyEv", "__ZNK10PatternSetI9NumVectorIfEE4typeEv", "__ZNK10PatternSetI9NumVectorIfEE9vectorDimEv", "__ZNK10PatternSetI9NumVectorIfEE8makeCopyEv", "__ZNK14MixedVectorSet4typeEv", "__ZNK14MixedVectorSet9vectorDimEv", "__ZNK14MixedVectorSet8makeCopyEv", "__ZNK10PatternSetI12SparseVectorIidEE4typeEv", "__ZNK10PatternSetI12SparseVectorIidEE9vectorDimEv", "__ZNK10PatternSetI12SparseVectorIidEE8makeCopyEv", "__ZNK10PatternSetI12SparseVectorIiiEE4typeEv", "__ZNK10PatternSetI12SparseVectorIiiEE9vectorDimEv", "__ZNK10PatternSetI12SparseVectorIiiEE8makeCopyEv", "__ZNK10PatternSetI9NumVectorIiEE4typeEv", "__ZNK10PatternSetI9NumVectorIiEE9vectorDimEv", "__ZNK10PatternSetI9NumVectorIiEE8makeCopyEv", "__ZNK10PatternSetI9NumVectorIdEE4typeEv", "__ZNK10PatternSetI9NumVectorIdEE9vectorDimEv", "__ZNK10PatternSetI9NumVectorIdEE8makeCopyEv", "__ZNK13ConvChemFP_PS4typeEv", "__ZNK20BeeFindexTableAccess9countRowsEv", "__ZN20BeeFindexTableAccess11loadNextRowEv", "__ZN11StringBeeIn4sizeEv", "__ZN5BeeIn10currentPosEv", "__ZN5BeeIn5atEndEv", "__ZNK12IcmPredModel14createLabelSetEv", "_chemical_get_usmiles", "__ZNK18BeeAbstractGVectorI9NumVectorIdEE8makeCopyEv", "__ZNK18BeeAbstractGVectorI9NumVectorIdEE4sizeEv", "__ZNK18BeeAbstractGVectorI9NumVectorIiEE8makeCopyEv", "__ZNK18BeeAbstractGVectorI9NumVectorIiEE4sizeEv", "__ZNK3SVM6Kernel16needsNormSquaresEv", "__ZNK3SVM10Kernel_Dot8makeCopyEv", "__ZNK3SVM15PredictionModel9labelTypeEv", "__ZNK3SVM15PredictionModel11patternTypeEv", "__ZNK5ASite8makeCopyEv", "__ZNK7MolSite8makeCopyEv", "__ZNK15ImobjView_Molob8makeCopyEv", "__ZNK15ImobjView_Molob9displayedEv", "__ZNK14ImobjView_Grob8makeCopyEv", "__ZNK14ImobjView_Grob9displayedEv", "__ZNK13ImobjView_Map8makeCopyEv", "__ZNK13ImobjView_Map9displayedEv", "__ZNK17ImobjView_Label3D8makeCopyEv", "__ZNK9ImobjView9displayedEv", "__ZNK11IcmPairDist8makeCopyEv", "__ZNK15ImobjView_Table8makeCopyEv", "__ZNK20ImobjView_ImageAlbum8makeCopyEv", "__ZNK19ImobjView_Alignment8makeCopyEv", "__ZNK9ImobjView8makeCopyEv", "__ZNK14IcmTableAccess9countRowsEv", "__ZN14IcmTableAccess11loadNextRowEv", "__ZNK18BeeAbstractGVectorI8SequenceE8makeCopyEv", "__ZNK18BeeAbstractGVectorI8SequenceE4sizeEv", "__ZNK18BeeAbstractGVectorI8ChemicalE8makeCopyEv", "__ZNK18BeeAbstractGVectorI8ChemicalE4sizeEv", "__ZNK18BeeAbstractGVectorI8ReactionE8makeCopyEv", "__ZNK18BeeAbstractGVectorI8ReactionE4sizeEv", "__ZNK18BeeAbstractGVectorI8IcmMolobE8makeCopyEv", "__ZNK18BeeAbstractGVectorI8IcmMolobE4sizeEv", "__ZNK18BeeAbstractGVectorI8BeeImageE8makeCopyEv", "__ZNK18BeeAbstractGVectorI8BeeImageE4sizeEv", "__ZNK18BeeAbstractGVectorI9BeeBitSetE8makeCopyEv", "__ZNK18BeeAbstractGVectorI9BeeBitSetE4sizeEv", "__ZNK18BeeAbstractGVectorI15BeeStringVectorE8makeCopyEv", "__ZNK18BeeAbstractGVectorI15BeeStringVectorE4sizeEv", "__ZNK18BeeAbstractGVectorI7BeeDateE8makeCopyEv", "__ZNK18BeeAbstractGVectorI7BeeDateE4sizeEv", "__ZNK11UOStrStream15nofWrittenBytesEv", "__ZNK8UOStream15nofWrittenBytesEv", "__ZNK11UIStrStream12nofReadBytesEv", "__ZN11UIStrStream3getEv", "__ZNK11UIStrStream6getposEv", "__ZN11UIStrStream4peekEv", "__ZNK8UIStream12nofReadBytesEv", "__ZN12UIFileStream3getEv", "__ZNK12UIFileStream6getposEv", "__ZN12UIFileStream4peekEv", "__ZNK10PatternSetI9BeeStringE4typeEv", "__ZNK10PatternSetI9BeeStringE9vectorDimEv", "__ZNK10PatternSetI9BeeStringE8makeCopyEv", "__ZN5BeeIn4sizeEv", "__Z9prop_atcdP8S_BEE_AT", "__Z10prop_athybP8S_BEE_AT", "__Z9prop_atarP8S_BEE_AT", "__Z10prop_athydP8S_BEE_AT", "__Z10prop_atrngP8S_BEE_AT", "__Z8prop_atpP8S_BEE_AT", "__Z10prop_atnboP8S_BEE_AT", "__Z10prop_atchiP8S_BEE_AT", "__Z12prop_atsybylP8S_BEE_AT", "__Z10prop_atrszP8S_BEE_AT", "__Z8prop_atqP8S_BEE_AT", "__Z12prop_atconstP8S_BEE_AT", "__Z8prop_atxP8S_BEE_AT", "__Z13prop_atpolhydP8S_BEE_AT", "__Z10prop_atex1P8S_BEE_AT", "__Z10prop_atar2P8S_BEE_AT", "__Z10prop_atcd2P8S_BEE_AT", "__Z10prop_atmodP8S_BEE_AT", "__Z9prop_hbdaP8S_BEE_AT", "__Z8prop_hbdP8S_BEE_AT", "__Z8prop_hbaP8S_BEE_AT", "__Z7prop_aaP8S_BEE_AT", "__Z8prop_ph4P8S_BEE_AT", "__Z10prop_ph4_2P8S_BEE_AT", "__ZNK13IndexTreeRoot8makeCopyEv", "__ZNK14DMatrixCluster15canFindCentroidEv", "__ZNK9VectorSet4typeEv", "__ZNK9VectorSet9vectorDimEv", "__ZNK9VectorSet8makeCopyEv", "__ZNK13IndexTreeRoot15canFindCentroidEv", "__ZNK3SVM17Kernel_Polynomial8makeCopyEv", "__ZNK3SVM13Kernel_Radial16needsNormSquaresEv", "__ZNK3SVM13Kernel_Radial8makeCopyEv", "__ZNK3SVM14Kernel_Sigmoid8makeCopyEv", "__ZNK3SVM15Kernel_Tanimoto16needsNormSquaresEv", "__ZNK3SVM15Kernel_Tanimoto8makeCopyEv", "__ZNK3SVM11PLSRMachine16nofLatentVectorsEv", "__ZNK3SVM15RegressionModel9labelTypeEv", "__ZNK3SVM15RegressionModel11patternTypeEv", "__ZNK3SVM15RegressionModel9vectorDimEv", "__ZNK3SVM10KPLSRModel9labelTypeEv", "__ZNK3SVM10KPLSRModel11patternTypeEv", "__ZNK3SVM10KPLSRModel9vectorDimEv", "__ZNK3SVM7NNModel9labelTypeEv", "__ZNK3SVM7NNModel11patternTypeEv", "__ZNK3SVM7NNModel9vectorDimEv", "__ZNK3SVM16PredictionModel09labelTypeEv", "__ZNK3SVM16PredictionModel011patternTypeEv", "__ZNK3SVM16PredictionModel09vectorDimEv", "__ZN3SVM9SVMachine9calcAutoCEv", "__ZN3SVM9SVMachine15hasNuConditionsEv", "__ZN3SVM9SVMachine7initSVMEv", "__ZN3SVM9SVMachine10initAlphasEv", "__ZNK3SVM18SVMPredictionModel11patternTypeEv", "__ZNK3SVM18SVMPredictionModel9vectorDimEv", "__ZNK3SVM9SVMMModel9labelTypeEv", "__ZNK3SVM9SVMMModel11patternTypeEv", "__ZNK3SVM9SVMMModel9vectorDimEv", "__ZNK3SVM9SVMCModel9labelTypeEv", "__ZNK3SVM9SVMRModel9labelTypeEv", "__ZNK3SVM18ClassifierLabelSet8makeCopyEv", "__ZNK3SVM11OPELabelSetIiE12hasPredictedEv", "__ZN3SVM18ClassifierLabelSet14calcStatisticsEv", "__ZNK3SVM8LabelSet8makeCopyEv", "__ZN3SVM8LabelSet14calcStatisticsEv", "__ZNK3SVM8LabelSet12hasPredictedEv", "__ZNK3SVM18MultiClassLabelSet8makeCopyEv", "__ZN3SVM18MultiClassLabelSet14calcStatisticsEv", "__ZNK3SVM23MultiClassMultiLabelSet8makeCopyEv", "__ZNK3SVM11OPELabelSetI9NumVectorIiEE12hasPredictedEv", "__ZN3SVM23MultiClassMultiLabelSet14calcStatisticsEv", "__ZNK3SVM18RegressionLabelSet8makeCopyEv", "__ZNK3SVM11OPELabelSetIdE12hasPredictedEv", "__ZN3SVM18RegressionLabelSet14calcStatisticsEv", "__ZNK3SVM23MultiRegressionLabelSet8makeCopyEv", "__ZNK3SVM11OPELabelSetI16BeeVariantVectorE12hasPredictedEv", "__ZN3SVM23MultiRegressionLabelSet14calcStatisticsEv", "__ZN3SVM11SVMRMachine7initSVMEv", "__ZN3SVM11ModelSearch7qualifyEv", "__ZN3SVM11ModelSearch4initEv", "__ZN3SVM10PLSRSearch7qualifyEv", "__ZN3SVM10PLSRSearch4initEv", "__ZN3SVM10SVMRSearch7qualifyEv", "__ZN3SVM10SVMRSearch4initEv", "__ZN3SVM10SVMCSearch7qualifyEv", "__ZN3SVM10SVMCSearch4initEv", "__ZNK3SVM10PCRMachine16nofLatentVectorsEv", "__ZN3SVM11SVMCMachine9calcAutoCEv", "__ZN3SVM11SVMCMachine7initSVMEv", "__ZNK3SVM18DecisionTreeCModel9labelTypeEv", "__ZNK3SVM18DecisionTreeCModel11patternTypeEv", "__ZNK3SVM18DecisionTreeCModel9vectorDimEv", "__ZNK3SVM11BayesCModel9labelTypeEv", "__ZNK3SVM11BayesCModel11patternTypeEv", "__ZNK3SVM11BayesCModel9vectorDimEv", "__ZNK3SVM12NaiveDensity9labelTypeEv", "__ZNK3SVM12NaiveDensity9vectorDimEv", "__ZNK3SVM18RandomForestCModel9labelTypeEv", "__ZNK3SVM18RandomForestCModel11patternTypeEv", "__ZNK3SVM18RandomForestCModel9vectorDimEv", "__ZNK3SVM22RandomForestRegression9labelTypeEv", "__ZNK3SVM22RandomForestRegression11patternTypeEv", "__ZNK3SVM22RandomForestRegression9vectorDimEv", "__ZNK3SVM10MxnetModel9labelTypeEv", "__ZNK3SVM10MxnetModel11patternTypeEv", "__ZNK3SVM10MxnetModel9vectorDimEv", "__ZNK11AlphabetU264sizeEv", "__ZNK13ASite_SStruct8makeCopyEv", "__ZNK13ASite_Surface8makeCopyEv", "__ZNK8ASite_3D8makeCopyEv", "__ZNK12ASite_Domain8makeCopyEv", "__ZN9QPlotItem11zoomChangedEv", "__ZN9QPlotItem17widgetSizeChangedEv", "__ZNK9QPlotItem5ndimsEv", "__ZNK10QPlotCurve7npointsEv", "__ZN14QPlotHistogram11zoomChangedEv", "__ZN14QPlotHistogram17widgetSizeChangedEv", "__ZNK14QPlotHistogram5ndimsEv", "__ZNK14QPlotHistogram7npointsEv", "__ZNK12QPlotHeatMap7npointsEv", "__ZNK11QPlotMatrix7npointsEv", "__ZNK9QPlotArea7npointsEv", "__ZNK9QPlotItem7npointsEv", "__ZN14QicmTableCurve12needsRefreshEv", "__ZThn428_N14QicmTableCurve12needsRefreshEv", "__ZNK17QicmTablePlotItem3tabEv", "__ZN18QicmTableHistogram12needsRefreshEv", "__ZNK18QicmTableHistogram3tabEv", "__ZThn304_N18QicmTableHistogram12needsRefreshEv", "__ZThn304_NK18QicmTableHistogram3tabEv", "__ZN19QicmTableMatrixPlot12needsRefreshEv", "__ZThn268_N19QicmTableMatrixPlot12needsRefreshEv", "__ZN16QicmTableHeatMap12needsRefreshEv", "__ZThn208_N16QicmTableHeatMap12needsRefreshEv", "__ZNK19QicmTableScrollPlot10hasContentEv", "___stdio_close", "__ZNKSt3__217bad_function_call4whatEv", "__ZNKSt9bad_alloc4whatEv", "__ZN10emscripten8internal13getActualTypeI17IcmPluginInstanceEEPKvPT_", "__ZN17IcmPluginInstance28isFullScreenOrSoftFullScreenEv", "__ZNK17IcmPluginInstance20pGetProjectSizeLimitEv", "__ZNK17IcmPluginInstance18pGetAnaglyphStereoEv", "__ZNK17IcmPluginInstance13pGetNofSlidesEv", "__ZNK17IcmPluginInstance19pNofActiveDownloadsEv", "__ZNK17IcmPluginInstance16pGetCurrentSlideEv", "__ZNK17IcmPluginInstance12pGetRockViewEv", "__ZNK17IcmPluginInstance3fogEv", "__ZNK17IcmPluginInstance11usePointersEv", "__ZNK17IcmPluginInstance14getDisplayMaskEv", "__ZNK17IcmPluginInstance12webglContextEv", "__ZNK17IcmPluginInstance13needsGraphicsEv", "__ZNK17IcmPluginInstance10nofAsGraphEv", "__ZNK17IcmPluginInstance6nofObjEv", "__ZNK17IcmPluginInstance11requireAuthEv", "__ZN10emscripten8internal13getActualTypeI18IcmPluginAlignmentEEPKvPT_", "__ZN10emscripten8internal12operator_newI18IcmPluginAlignmentJNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEEEEPT_DpOT0_", "__ZN10emscripten8internal13getActualTypeI14IcmPluginTableEEPKvPT_", "__ZN10emscripten8internal12operator_newI14IcmPluginTableJNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEEEEPT_DpOT0_", "__ZNK14IcmPluginTable12displayStyleEv", "__ZNK14IcmPluginTable4exmgEv", "__ZNK14IcmPluginTable2mgEv", "__ZNK14IcmPluginTable11needsUpdateEv", "__ZN10emscripten8internal13getActualTypeI13IcmPluginPlotEEPKvPT_", "__ZNK13IcmPluginPlot7isDirtyEv", "__ZN10emscripten8internal13getActualTypeI21IcmPluginChemicalViewEEPKvPT_", "__ZNK21IcmPluginChemicalView7isDirtyEv", "__ZN10emscripten8internal13getActualTypeI16ChemicalInstanceEEPKvPT_", "__ZN10emscripten8internal12operator_newI16ChemicalInstanceJNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEEEEPT_DpOT0_", "__ZN10emscripten8internal13getActualTypeI16ReactionInstanceEEPKvPT_", "__ZN10emscripten8internal12operator_newI16ReactionInstanceJNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEEEEPT_DpOT0_", "_shObject", "_shMolecule", "_shResidue", "_clsudidw", "_clsudiup", "_clbebo", "_maxleft", "_xcond", "_ycond", "_njnddraw", "_shAtom", "_wrwarn_cond_strz", "_png_create_info_struct", "_malloc", "_strlen", "_png_set_interlace_handling", "_time", "_fflush", "_ftell", "_wrer_strz", "_chemical_get_usmiles_ns", "_wrou_info_strz", "__Z17tf_isSmilesColumnRK9BeeString", "__Z16tf_isInChiColumnRK9BeeString", "__Z11isIsobutaneR5ArrayIP8S_BEE_ATE", "__Z12isIsopentaneR5ArrayIP8S_BEE_ATE", "__Z12isNeopentaneR5ArrayIP8S_BEE_ATE", "__Z10isIsopreneR5ArrayIP8S_BEE_ATE", "__Z7isVinylR5ArrayIP8S_BEE_ATE", "__Z7isAllylR5ArrayIP8S_BEE_ATE", "__Z12isAceticAcidR5ArrayIP8S_BEE_ATE", "__Z13isMalonicAcidR5ArrayIP8S_BEE_ATE", "__Z13isAcrylicAcidR5ArrayIP8S_BEE_ATE", "__Z14isSuccinicAcidR5ArrayIP8S_BEE_ATE", "__Z14isAcetaldehydeR5ArrayIP8S_BEE_ATE", "__Z15isAcrylaldehydeR5ArrayIP8S_BEE_ATE", "__Z16isAcetylFluorideR5ArrayIP8S_BEE_ATE", "__Z16isAcetylChlorideR5ArrayIP8S_BEE_ATE", "__Z15isAcetylBromideR5ArrayIP8S_BEE_ATE", "__Z14isAcetylIodideR5ArrayIP8S_BEE_ATE", "__Z14isCarbamicAcidR5ArrayIP8S_BEE_ATE", "__Z18isCarbonicHalogeneR5ArrayIP8S_BEE_ATE", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"];
var debug_table_iid = ["0", "__ZN11UOStrStream5writeEd", "__ZN12UOFileStream5writeEd", "__ZN3SVM9SVMachine4setCEd", "__ZN3SVM11SVMCMachine4setCEd", "0", "0", "0"];
var debug_table_iidi = ["0", "__ZNK25PropertyColorInterpolator13getColorRgbafEdPf", "__ZNK17ColorInterpolator13getColorRgbafEdPf", "__ZN10QPlotCurve9zoomMarksEd12PlotZoomMode", "__ZN14QPlotHistogram9zoomMarksEd12PlotZoomMode", "__ZN9QPlotItem9zoomMarksEd12PlotZoomMode", "0", "0"];
var debug_table_iif = ["0", "__ZN11UOStrStream5writeEf", "__ZN12UOFileStream5writeEf", "0"];
var debug_table_iii = ["0", "__ZN17IcmPluginInstance7call_jsERK9BeeString", "__ZN18IcmPluginInterface11loadProjectERK9BeeString", "__ZNSt3__210__function6__funcI3__1NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI3__1NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNSt3__210__function6__funcI3__2NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI3__2NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNSt3__210__function6__funcI3__3NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI3__3NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNSt3__210__function6__funcI3__4NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI3__4NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNSt3__210__function6__funcI3__5NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI3__5NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNSt3__210__function6__funcI3__6NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI3__6NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNSt3__210__function6__funcI3__7NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI3__7NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNSt3__210__function6__funcI3__8NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI3__8NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNSt3__210__function6__funcI3__9NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI3__9NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNSt3__210__function6__funcI4__10NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI4__10NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNSt3__210__function6__funcI4__11NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI4__11NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNSt3__210__function6__funcI4__12NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI4__12NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNSt3__210__function6__funcI4__13NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI4__13NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNSt3__210__function6__funcI4__14NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI4__14NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNSt3__210__function6__funcI4__15NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI4__15NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNSt3__210__function6__funcI4__16NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI4__16NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNSt3__210__function6__funcI4__17NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI4__17NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNSt3__210__function6__funcI4__18NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI4__18NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNSt3__210__function6__funcI4__19NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI4__19NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNSt3__210__function6__funcI4__20NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI4__20NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNSt3__210__function6__funcI4__21NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI4__21NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNSt3__210__function6__funcI4__22NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI4__22NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNSt3__210__function6__funcI4__23NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI4__23NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNSt3__210__function6__funcI4__24NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI4__24NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNSt3__210__function6__funcI4__25NS_9allocatorIS2_EEFbP5S_AT_EEclEOS6_", "__ZNKSt3__210__function6__funcI4__25NS_9allocatorIS2_EEFbP5S_AT_EE6targetERKSt9type_info", "__ZNKSt3__210__function6__funcIZN21IcmPluginChemicalViewC1ERKN10emscripten3valERK16ChemicalInstanceE3__7NS_9allocatorISA_EEFvvEE6targetERKSt9type_info", "__ZNKSt3__210__function6__funcIZN13IcmPluginPlot12set_plotDataERKN10emscripten3valEE3__0NS_9allocatorIS7_EEFvP9QPlotItemRK9BeeBitSetEE6targetERKSt9type_info", "__ZNKSt3__210__function6__funcIZN13IcmPluginPlot12set_plotDataERKN10emscripten3valEE3__1NS_9allocatorIS7_EEFviiEE6targetERKSt9type_info", "__ZNKSt3__210__function6__funcIZN13IcmPluginPlot12set_plotDataERKN10emscripten3valEE3__2NS_9allocatorIS7_EEFviEE6targetERKSt9type_info", "__ZNKSt3__210__function6__funcIZN14IcmPluginTable13createClusterEiRKN10emscripten3valEE3__5NS_9allocatorIS7_EEFvvEE6targetERKSt9type_info", "__ZNKSt3__210__function6__funcIZN14IcmPluginTable13createClusterEiRKN10emscripten3valEE3__6NS_9allocatorIS7_EEFvvEE6targetERKSt9type_info", "__ZNKSt3__210__function6__funcIZN14IcmPluginTable10createPlotEiRKN10emscripten3valEE3__3NS_9allocatorIS7_EEFvvEE6targetERKSt9type_info", "__ZNKSt3__210__function6__funcIZN14IcmPluginTable10createPlotEiRKN10emscripten3valEE3__4NS_9allocatorIS7_EEFvP9QPlotItemRK9BeeBitSetEE6targetERKSt9type_info", "__ZN18IcmPluginInterface7call_jsERK9BeeString", "_unzip", "__ZNK10PatternSetI9BeeBitSetE5writeEP8UOStream", "__ZNK10PatternSetI9BeeBitSetE20writeBinaryVectorSetEP10OBinStream", "__ZN16CArrayPatternSetI9BeeBitSetE19readBinaryVectorSetEP10IBinStream", "__ZNK9VectorSet14compatibleWithEPS_", "__ZNK16CArrayPatternSetI9BeeBitSetE9getVectorEi", "__ZN9VectorSet19readBinaryVectorSetEP10IBinStream", "__ZNK13PatternSubSetI9BeeBitSetE9getVectorEi", "__ZNK10PatternSetI9NumVectorIfEE5writeEP8UOStream", "__ZNK10PatternSetI9NumVectorIfEE20writeBinaryVectorSetEP10OBinStream", "__ZN16CArrayPatternSetI9NumVectorIfEE19readBinaryVectorSetEP10IBinStream", "__ZNK16CArrayPatternSetI9NumVectorIfEE9getVectorEi", "__ZNK14MixedVectorSet5writeEP8UOStream", "__ZNK14MixedVectorSet20writeBinaryVectorSetEP10OBinStream", "__ZN14MixedVectorSet19readBinaryVectorSetEP10IBinStream", "__ZNK14MixedVectorSet14compatibleWithEP9VectorSet", "__ZNK10PatternSetI12SparseVectorIidEE5writeEP8UOStream", "__ZNK10PatternSetI12SparseVectorIidEE20writeBinaryVectorSetEP10OBinStream", "__ZN16CArrayPatternSetI12SparseVectorIidEE19readBinaryVectorSetEP10IBinStream", "__ZNK16CArrayPatternSetI12SparseVectorIidEE9getVectorEi", "__ZNK10PatternSetI12SparseVectorIiiEE5writeEP8UOStream", "__ZNK10PatternSetI12SparseVectorIiiEE20writeBinaryVectorSetEP10OBinStream", "__ZN16CArrayPatternSetI12SparseVectorIiiEE19readBinaryVectorSetEP10IBinStream", "__ZNK16CArrayPatternSetI12SparseVectorIiiEE9getVectorEi", "__ZNK10PatternSetI9NumVectorIiEE5writeEP8UOStream", "__ZNK10PatternSetI9NumVectorIiEE20writeBinaryVectorSetEP10OBinStream", "__ZN16CArrayPatternSetI9NumVectorIiEE19readBinaryVectorSetEP10IBinStream", "__ZNK16CArrayPatternSetI9NumVectorIiEE9getVectorEi", "__ZNK13PatternSubSetI9NumVectorIiEE9getVectorEi", "__ZNK13PatternSubSetI12SparseVectorIiiEE9getVectorEi", "__ZNK13PatternSubSetI12SparseVectorIidEE9getVectorEi", "__ZNK10PatternSetI9NumVectorIdEE5writeEP8UOStream", "__ZNK10PatternSetI9NumVectorIdEE20writeBinaryVectorSetEP10OBinStream", "__ZN16CArrayPatternSetI9NumVectorIdEE19readBinaryVectorSetEP10IBinStream", "__ZNK16CArrayPatternSetI9NumVectorIdEE9getVectorEi", "__ZNK13PatternSubSetI9NumVectorIdEE9getVectorEi", "__ZNK13PatternSubSetI9NumVectorIfEE9getVectorEi", "__ZNK20BeeFindexTableAccess6getRowER16BeeVariantVector", "__ZN12IcmPredModel14initFromBinaryEP10IBinStream", "__ZNK12IcmPredModel12writeBinaryVEP10OBinStream", "__ZN3SVM6Kernel13setParametersERK15BeeStringVector", "__ZNK3SVM10Kernel_Dot15writeBinaryBodyEP10OBinStream", "__ZN3SVM10Kernel_Dot14initFromBinaryEP10IBinStream", "__ZN3SVM6Kernel10setDataDimEi", "__ZN3SVM17PredictionMachine12prepareLearnEPNS_14PredictionDataE", "__ZN3SVM17PredictionMachine13finishedLearnEPNS_14PredictionDataE", "__ZN3SVM15PredictionModel5writeEP8UOStream", "__ZNK3SVM15PredictionModel15writeBinaryBodyEP10OBinStream", "__ZN3SVM15PredictionModel14initFromBinaryEP10IBinStream", "__ZNK5ASite16writeBinaryExtraEP10OBinStream", "__ZN5ASite15readBinaryExtraEP10IBinStream", "__ZNK7MolSite16writeBinaryExtraEP10OBinStream", "__ZN7MolSite15readBinaryExtraEP10IBinStream", "__ZN7MolSite17readBinaryMolSiteEP10IBinStream", "__ZN12StringBeeOut5writeEc", "__ZNK14IcmTableAccess6getRowER16BeeVariantVector", "__ZN11UOStrStream5writeEb", "__ZN11UOStrStream5writeEi", "__ZN11UOStrStream5writeEs", "__ZN11UOStrStream5writeEj", "__ZN11UOStrStream5writeEt", "__ZN8UOStream5writeEh", "__ZN11UOStrStream5writeEc", "__ZN11UOStrStream5writeEPKc", "__ZN11UOStrStream5writeEPKv", "__ZN11UOStrStream5writeERK9BeeString", "__ZN12UOFileStream5writeEb", "__ZN12UOFileStream5writeEi", "__ZN12UOFileStream5writeEs", "__ZN12UOFileStream5writeEj", "__ZN12UOFileStream5writeEt", "__ZN12UOFileStream5writeEc", "__ZN12UOFileStream5writeEPKc", "__ZN12UOFileStream5writeEPKv", "__ZN12UOFileStream5writeERK9BeeString", "__ZN11UIStrStream4readERb", "__ZN11UIStrStream4readERi", "__ZN11UIStrStream4readERs", "__ZN11UIStrStream4readERj", "__ZN11UIStrStream4readERt", "__ZN11UIStrStream4readERf", "__ZN11UIStrStream4readERd", "__ZN11UIStrStream4readERh", "__ZN11UIStrStream4readERa", "__ZN8UIStream4readERPc", "__ZN11UIStrStream4readERPv", "__ZN8UIStream4readER9BeeString", "__ZN8UIStream4readERx", "__ZN8UIStream4readERy", "__ZN8UIStream5read1ERc", "__ZN8UIStream5read2ERs", "__ZN8UIStream5read4ERi", "__ZN8UIStream5read8ERx", "__ZN8UIStream5read1ERh", "__ZN8UIStream5read2ERt", "__ZN8UIStream5read4ERj", "__ZN8UIStream5read8ERy", "__ZN11UIStrStream7putbackEc", "__ZN11UIStrStream3getERc", "__ZN11UIStrStream7ignoreNEi", "__ZN11UIStrStream6getAllER9BeeString", "__ZN11UIStrStream4readERl", "__ZN11UIStrStream4readERm", "__ZN12UIFileStream4readERb", "__ZN12UIFileStream4readERi", "__ZN12UIFileStream4readERs", "__ZN12UIFileStream4readERj", "__ZN12UIFileStream4readERt", "__ZN12UIFileStream4readERf", "__ZN12UIFileStream4readERd", "__ZN12UIFileStream4readERh", "__ZN12UIFileStream4readERa", "__ZN8UIStream4readERPv", "__ZN12UIFileStream7putbackEc", "__ZN12UIFileStream3getERc", "__ZN12UIFileStream7ignoreNEi", "__ZN8UIStream6getAllER9BeeString", "__ZN12UIFileStream4readERl", "__ZN12UIFileStream4readERm", "__ZNK10PatternSetI9BeeStringE5writeEP8UOStream", "__ZNK10PatternSetI9BeeStringE20writeBinaryVectorSetEP10OBinStream", "__ZN16CArrayPatternSetI9BeeStringE19readBinaryVectorSetEP10IBinStream", "__ZNK16CArrayPatternSetI9BeeStringE9getVectorEi", "__ZNK13PatternSubSetI9BeeStringE9getVectorEi", "__ZN6BeeOut5writeEc", "__ZNK8EqFilterclERK10BeeVariant", "__ZNK9NeqFilterclERK10BeeVariant", "__ZNK8LsFilterclERK10BeeVariant", "__ZNK8GtFilterclERK10BeeVariant", "__ZNK9LseFilterclERK10BeeVariant", "__ZNK9GteFilterclERK10BeeVariant", "__ZNK12SubstrFilterclERK10BeeVariant", "__ZNK12StartsFilterclERK10BeeVariant", "__ZNK10EndsFilterclERK10BeeVariant", "__ZNK11MatchFilterclERK10BeeVariant", "__Z11ph4_isNeg_CP8S_BEE_ATj", "__Z11ph4_isNeg_SP8S_BEE_ATj", "__Z11ph4_isNeg_PP8S_BEE_ATj", "__Z9ph4_isPosP8S_BEE_ATj", "__Z9ph4_falseP8S_BEE_ATj", "__Z16ph4_isPosAmidineP8S_BEE_ATj", "__Z9ph4_isHBAP8S_BEE_ATj", "__Z9ph4_isHBDP8S_BEE_ATj", "__Z17ph4_isHydrophobicP8S_BEE_ATj", "__ZNK14DMatrixCluster15writeBinaryBodyEP10OBinStream", "__ZNK14DMatrixCluster15writeBinaryRootEP10OBinStream", "__ZNK14DMatrixCluster17firstTreeForEntryEi", "__ZNK9VectorSet5writeEP8UOStream", "__ZNK9VectorSet20writeBinaryVectorSetEP10OBinStream", "__ZNK13IndexTreeRoot15writeBinaryBodyEP10OBinStream", "__ZNK9Evolution15writeBinaryBodyEP10OBinStream", "__ZNK8KCluster15writeBinaryBodyEP10OBinStream", "__ZNK8KCluster15writeBinaryRootEP10OBinStream", "__ZNK8KCluster17firstTreeForEntryEi", "__ZN3SVM17Kernel_Polynomial13setParametersERK15BeeStringVector", "__ZNK3SVM17Kernel_Polynomial15writeBinaryBodyEP10OBinStream", "__ZN3SVM17Kernel_Polynomial14initFromBinaryEP10IBinStream", "__ZN3SVM13Kernel_Radial13setParametersERK15BeeStringVector", "__ZNK3SVM13Kernel_Radial15writeBinaryBodyEP10OBinStream", "__ZN3SVM13Kernel_Radial14initFromBinaryEP10IBinStream", "__ZN3SVM13Kernel_Radial10setDataDimEi", "__ZN3SVM14Kernel_Sigmoid13setParametersERK15BeeStringVector", "__ZNK3SVM14Kernel_Sigmoid15writeBinaryBodyEP10OBinStream", "__ZN3SVM14Kernel_Sigmoid14initFromBinaryEP10IBinStream", "__ZNK3SVM15Kernel_Tanimoto15writeBinaryBodyEP10OBinStream", "__ZN3SVM15Kernel_Tanimoto14initFromBinaryEP10IBinStream", "__ZN3SVM15RegressionModel5writeEP8UOStream", "__ZNK3SVM15RegressionModel15writeBinaryBodyEP10OBinStream", "__ZN3SVM15RegressionModel14initFromBinaryEP10IBinStream", "__ZN3SVM10KPLSRModel5writeEP8UOStream", "__ZNK3SVM10KPLSRModel15writeBinaryBodyEP10OBinStream", "__ZN3SVM10KPLSRModel14initFromBinaryEP10IBinStream", "__ZNK3SVM7NNModel15writeBinaryBodyEP10OBinStream", "__ZN3SVM7NNModel14initFromBinaryEP10IBinStream", "__ZN3SVM9SVMachine12prepareLearnEPNS_14PredictionDataE", "__ZN3SVM9SVMachine13finishedLearnEPNS_14PredictionDataE", "__ZN3SVM18SVMPredictionModel5writeEP8UOStream", "__ZNK3SVM18SVMPredictionModel15writeBinaryBodyEP10OBinStream", "__ZN3SVM18SVMPredictionModel14initFromBinaryEP10IBinStream", "__ZN3SVM9SVMMModel5writeEP8UOStream", "__ZNK3SVM9SVMMModel15writeBinaryBodyEP10OBinStream", "__ZN3SVM9SVMMModel14initFromBinaryEP10IBinStream", "__ZN3SVM18ClassifierLabelSet13copyStatsFromEPKNS_8LabelSetE", "__ZNK3SVM18ClassifierLabelSet15writeBinaryBodyEP10OBinStream", "__ZN3SVM18ClassifierLabelSet14initFromBinaryEP10IBinStream", "__ZN3SVM8LabelSet13copyStatsFromEPKS0_", "__ZNK3SVM8LabelSet15writeBinaryBodyEP10OBinStream", "__ZN3SVM8LabelSet14initFromBinaryEP10IBinStream", "__ZNK3SVM18MultiClassLabelSet15writeBinaryBodyEP10OBinStream", "__ZN3SVM18MultiClassLabelSet14initFromBinaryEP10IBinStream", "__ZNK3SVM23MultiClassMultiLabelSet15writeBinaryBodyEP10OBinStream", "__ZN3SVM23MultiClassMultiLabelSet14initFromBinaryEP10IBinStream", "__ZN3SVM18RegressionLabelSet13copyStatsFromEPKNS_8LabelSetE", "__ZNK3SVM18RegressionLabelSet15writeBinaryBodyEP10OBinStream", "__ZN3SVM18RegressionLabelSet14initFromBinaryEP10IBinStream", "__ZNK3SVM23MultiRegressionLabelSet15writeBinaryBodyEP10OBinStream", "__ZN3SVM23MultiRegressionLabelSet14initFromBinaryEP10IBinStream", "__ZN3SVM11SVMRMachine12prepareLearnEPNS_14PredictionDataE", "__ZN3SVM11SVMRMachine13finishedLearnEPNS_14PredictionDataE", "__ZN3SVM11SVMRMachine3u_iEi", "__ZN3SVM11SVMCMachine12prepareLearnEPNS_14PredictionDataE", "__ZN3SVM11SVMCMachine13finishedLearnEPNS_14PredictionDataE", "__ZN3SVM11SVMCMachine3u_iEi", "__ZNK3SVM11BayesCModel15writeBinaryBodyEP10OBinStream", "__ZN3SVM11BayesCModel14initFromBinaryEP10IBinStream", "__ZNK3SVM12NaiveDensity15writeBinaryBodyEP10OBinStream", "__ZN3SVM12NaiveDensity14initFromBinaryEP10IBinStream", "__ZNK3SVM18RandomForestCModel15writeBinaryBodyEP10OBinStream", "__ZN3SVM18RandomForestCModel14initFromBinaryEP10IBinStream", "__ZNK3SVM22RandomForestRegression15writeBinaryBodyEP10OBinStream", "__ZN3SVM22RandomForestRegression14initFromBinaryEP10IBinStream", "__ZNK3SVM10MxnetModel15writeBinaryBodyEP10OBinStream", "__ZN3SVM10MxnetModel14initFromBinaryEP10IBinStream", "__ZNK13ASite_SStruct16writeBinaryExtraEP10OBinStream", "__ZN13ASite_SStruct15readBinaryExtraEP10IBinStream", "__ZNK13ASite_Surface16writeBinaryExtraEP10OBinStream", "__ZN13ASite_Surface15readBinaryExtraEP10IBinStream", "__ZNK10QPlotCurve17allSelectedInRectERK5WRect", "__ZNK10QPlotCurve17isSelectedElementEi", "__ZNK14QPlotHistogram17allSelectedInRectERK5WRect", "__ZNK14QPlotHistogram17isSelectedElementEi", "__ZNK9QPlotItem17allSelectedInRectERK5WRect", "__ZNK9QPlotItem17isSelectedElementEi", "_deflate_stored", "_deflate_fast", "_deflate_slow", "__ZN17IcmPluginInstance21openProjectFromBinaryERKN10emscripten3valE", "__ZN10emscripten8internal13MethodInvokerIM17IcmPluginInstanceFbvEbPS2_JEE6invokeERKS4_S5_", "__ZN10emscripten8internal12GetterPolicyIM17IcmPluginInstanceKFNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEvEE3getIS2_EEPNS0_11BindingTypeIS9_EUt_ERKSB_RKT_", "__ZN10emscripten8internal12GetterPolicyIM17IcmPluginInstanceKFivEE3getIS2_EEiRKS4_RKT_", "__ZN10emscripten8internal12GetterPolicyIM17IcmPluginInstanceKFbvEE3getIS2_EEbRKS4_RKT_", "__ZN10emscripten8internal12GetterPolicyIM17IcmPluginInstanceKFNS_3valEvEE3getIS2_EEPNS0_7_EM_VALERKS5_RKT_", "__ZN10emscripten8internal7InvokerIP18IcmPluginAlignmentJONSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEEE6invokeEPFS3_SB_EPNS0_11BindingTypeISA_EUt_E", "__ZN10emscripten8internal13MethodInvokerIM18IcmPluginAlignmentFNS_3valEvES3_PS2_JEE6invokeERKS5_S6_", "__ZN10emscripten8internal12GetterPolicyIM18IcmPluginAlignmentKFNS_3valEvEE3getIS2_EEPNS0_7_EM_VALERKS5_RKT_", "__ZN10emscripten8internal7InvokerIP14IcmPluginTableJONSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEEE6invokeEPFS3_SB_EPNS0_11BindingTypeISA_EUt_E", "__ZN10emscripten8internal13MethodInvokerIM14IcmPluginTableFNS_3valEvES3_PS2_JEE6invokeERKS5_S6_", "__ZNK14IcmPluginTable16columnIsSelectedEi", "__ZNK14IcmPluginTable13rowIsSelectedEi", "__ZNK14IcmPluginTable13calcSortOrderEi", "__ZN10emscripten8internal13MethodInvokerIM14IcmPluginTableKFivEiPKS2_JEE6invokeERKS4_S6_", "__ZN10emscripten8internal12GetterPolicyIM14IcmPluginTableKFNS_3valEvEE3getIS2_EEPNS0_7_EM_VALERKS5_RKT_", "__ZN10emscripten8internal12GetterPolicyIM14IcmPluginTableKFivEE3getIS2_EEiRKS4_RKT_", "__ZN10emscripten8internal12GetterPolicyIM14IcmPluginTableKFbvEE3getIS2_EEbRKS4_RKT_", "__ZN10emscripten8internal12operator_newI13IcmPluginPlotJNS_3valES3_EEEPT_DpOT0_", "__ZN10emscripten8internal12GetterPolicyIM13IcmPluginPlotKFNS_3valEvEE3getIS2_EEPNS0_7_EM_VALERKS5_RKT_", "__ZN10emscripten8internal12GetterPolicyIM13IcmPluginPlotKFbvEE3getIS2_EEbRKS4_RKT_", "__ZN10emscripten8internal12operator_newI21IcmPluginChemicalViewJNS_3valE16ChemicalInstanceEEEPT_DpOT0_", "__ZN10emscripten8internal12GetterPolicyIM21IcmPluginChemicalViewKFbvEE3getIS2_EEbRKS4_RKT_", "__ZN10emscripten8internal12GetterPolicyIM21IcmPluginChemicalViewKFNS_3valEvEE3getIS2_EEPNS0_7_EM_VALERKS5_RKT_", "__ZN10emscripten8internal7InvokerIP16ChemicalInstanceJONSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEEE6invokeEPFS3_SB_EPNS0_11BindingTypeISA_EUt_E", "__ZN10emscripten8internal13MethodInvokerIM16ChemicalInstanceKFNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEvES9_PKS2_JEE6invokeERKSB_SD_", "__ZN16ChemicalInstance7fromMolERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE", "__ZN16ChemicalInstance10fromSmilesERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE", "__ZN16ChemicalInstance10fromStringERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE", "__ZN16ChemicalInstance7fromCDXERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE", "__ZN10emscripten8internal12GetterPolicyIM16ChemicalInstanceKFNS_3valEvEE3getIS2_EEPNS0_7_EM_VALERKS5_RKT_", "__ZN10emscripten8internal7InvokerIP16ReactionInstanceJONSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEEE6invokeEPFS3_SB_EPNS0_11BindingTypeISA_EUt_E", "__ZN10emscripten8internal13MethodInvokerIM16ReactionInstanceKFNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEvES9_PKS2_JEE6invokeERKSB_SD_", "__ZN16ReactionInstance7fromMolERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE", "__ZN16ReactionInstance10fromSmilesERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE", "__ZN16ReactionInstance10fromStringERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE", "_atidx_cmp", "_cesobo", "_cmp_hebo", "_cept1", "_cell1", "_cepr", "_ceprnb", "_cemlob", "_cept2", "_ceobfdB2S", "_ceobfdS2B", "_cerenat", "_unpack", "_unlzw", "_unlzh", "_socmey", "_ceimshob", "_cesele_pdb", "_cesele", "_staynx", "_staynv", "_stayix", "_stayiv", "_sta1nx", "_sta1nv", "_sta1ix", "_sta1iv", "_iia1iv", "_iia1ix", "_dba1iv", "_dba1ix", "_chemical_a1ix", "_chemical_a1iv", "_chemical_a1ix_sm", "_chemical_a1iv_sm", "_datea1iv", "_datea1ix", "_varianta1iv", "_varianta1ix", "_pitem_cmp_rev", "_pitem_cmp", "_gnayce", "_staynx_stbl", "_staynv_stbl", "_stayix_stbl", "_stayiv_stbl", "_iiayiv_stbl", "_iiayix_stbl", "_dbayiv_stbl", "_dbayix_stbl", "_chemical_ayix_stbl", "_chemical_ayiv_stbl", "_chemical_ayix_sm_stbl", "_chemical_ayiv_sm_stbl", "_dateayiv_stbl", "_dateayix_stbl", "_variantayix_stbl", "_variantayiv_stbl", "_pitemix_stbl", "_pitemiv_stbl", "_trsort12", "_trsortpl", "_ceclass", "_cmVertex", "_cmptgb", "_cevesv", "_cetear", "_cehi", "_pn_new_match", "_pn_ci_new_match", "_cevesv_i", "_cevesv_l", "_cevesv_AG", "_atmap_cmp", "__Z6ceatnaPKvS0_", "__Z10token_funcPcP14S_PARSER_DATA_", "_wrer", "_wrou", "_strcpy", "_strchr", "_realloc", "_strcmp", "__Z12cmp_taborderPKvS0_", "__Z9cmClusterPKvS0_", "__Z10cmLisodbixPKvS0_", "__Z10cmLisoixdbPKvS0_", "_chemref_cmp_usmiles", "__Z17IMTableCompareIdxPKiS0_", "__Z18IMTableSortComparePvPKi", "__ZL13cmp_at_qu_maxPKvS0_", "__ZL13cmp_at_qu_minPKvS0_", "__Z12cmp_beeat_cdPKvS0_", "__Z10cmp_at_ordPKvS0_", "__Z10cmp_at_cipPKvS0_", "__Z12cmp_chem_refPKvS0_", "__ZN5S_PRII5S_AT_E7cmp_cipEPKvS3_", "__Z11cmp_pri_intPKvS0_", "__Z14cmp_at_ord_resPKvS0_", "__ZL12cmp_ref_pairPKvS0_", "__Z12cmp_dir_infoPKvS0_", "__Z11cmp_nei_CIPI8S_BEE_ATEiPKvS2_", "__Z11cmp_nei_tmpPKvS0_", "__Z13cmp_ctbond_wkPKvS0_", "__ZN5S_PRII8S_BEE_ATE7cmp_cipEPKvS3_", "__Z11cmp_at_rnumPKvS0_", "__Z15cmp_nei_tmp_revPKvS0_", "__Z11cmp_nei_keyPKvS0_", "__Z8cmp_bondPKvS0_", "__Z11cmp_frag_szPKvS0_", "__Z12cmp_frag_numPKvS0_", "__Z10cmp_nei_cdPKvS0_", "__Z12cmp_rng_sizePKvS0_", "__Z9isCarboxyP8S_BEE_ATi", "__Z14isThioCarboxyOP8S_BEE_ATi", "__Z14isThioCarboxySP8S_BEE_ATi", "__Z15isDiThioCarboxyP8S_BEE_ATi", "__Z9isSulfinoP8S_BEE_ATi", "__Z14isSulfinoThioOP8S_BEE_ATi", "__Z14isSulfinoThioSP8S_BEE_ATi", "__Z15isSulfinoDiThioP8S_BEE_ATi", "__Z13isOxyCarbonylP8S_BEE_ATi", "__Z16isFluoroCarbonylP8S_BEE_ATi", "__Z21isFluoroCarbonoThioylP8S_BEE_ATi", "__Z16isChloroCarbonylP8S_BEE_ATi", "__Z21isChloroCarbonoThioylP8S_BEE_ATi", "__Z15isBromoCarbonylP8S_BEE_ATi", "__Z20isBromoCarbonoThioylP8S_BEE_ATi", "__Z14isIodoCarbonylP8S_BEE_ATi", "__Z19isIodoCarbonoThioylP8S_BEE_ATi", "__Z7isSulfoP8S_BEE_ATi", "__Z11isSulfoThioP8S_BEE_ATi", "__Z11isPhosphonoP8S_BEE_ATi", "__Z10isNitrooxyP8S_BEE_ATi", "__Z12isNitrosooxyP8S_BEE_ATi", "__Z16isFluoroSulfonylP8S_BEE_ATi", "__Z16isFluoroSulfinylP8S_BEE_ATi", "__Z21isFluoroSulfinoThioylP8S_BEE_ATi", "__Z16isChloroSulfonylP8S_BEE_ATi", "__Z16isChloroSulfinylP8S_BEE_ATi", "__Z21isChloroSulfinoThioylP8S_BEE_ATi", "__Z15isBromoSulfonylP8S_BEE_ATi", "__Z15isBromoSulfinylP8S_BEE_ATi", "__Z20isBromoSulfinoThioylP8S_BEE_ATi", "__Z14isIodoSulfonylP8S_BEE_ATi", "__Z14isIodoSulfinylP8S_BEE_ATi", "__Z19isIodoSulfinoThioylP8S_BEE_ATi", "__Z11isCarbamoylP8S_BEE_ATi", "__Z15isCarbamoThioylP8S_BEE_ATi", "__Z15isCarbamimidoylP8S_BEE_ATi", "__Z11isSulfamoylP8S_BEE_ATi", "__Z13isSulfinamoylP8S_BEE_ATi", "__Z17isSulfinamothioylP8S_BEE_ATi", "__Z7isCyanoP8S_BEE_ATi", "__Z8isFormylP8S_BEE_ATi", "__Z12isThioFormylP8S_BEE_ATi", "__Z5isOxoP8S_BEE_ATi", "__Z8isThiOxoP8S_BEE_ATi", "__Z9isHydroxyP8S_BEE_ATi", "__Z10isMercaptoP8S_BEE_ATi", "__Z7isAminoP8S_BEE_ATi", "__Z7isIminoP8S_BEE_ATi", "__Z12isHydrazinylP8S_BEE_ATi", "__Z11isPhosphinoP8S_BEE_ATi", "__Z13isBoronicAcidP8S_BEE_ATi", "__Z8isFluoroP8S_BEE_ATi", "__Z8isChloroP8S_BEE_ATi", "__Z7isBromoP8S_BEE_ATi", "__Z6isIodoP8S_BEE_ATi", "__Z7isNitroP8S_BEE_ATi", "__Z13isThiocyanatoP8S_BEE_ATi", "__Z16isIsothiocyanatoP8S_BEE_ATi", "__Z9isNitrosoP8S_BEE_ATi", "__Z13isHydroperoxyP8S_BEE_ATi", "__Z7isAzidoP8S_BEE_ATi", "__Z15isHydrosulfonylP8S_BEE_ATi", "__Z10isIsocyanoP8S_BEE_ATi", "__Z9isCyanatoP8S_BEE_ATi", "__Z12isIsocyanatoP8S_BEE_ATi", "__Z12isPerchlorylP8S_BEE_ATi", "__Z9isChlorylP8S_BEE_ATi", "__Z11isChlorosylP8S_BEE_ATi", "__Z7isIodylP8S_BEE_ATi", "__Z9isIodosylP8S_BEE_ATi", "__Z7isDiazoP8S_BEE_ATi", "__Z7isEtherP8S_BEE_ATi", "__Z10isSulfonylP8S_BEE_ATi", "__Z10isSulfinylP8S_BEE_ATi", "__Z10isSulfanylP8S_BEE_ATi", "__Z10cmp_at_nboPKvS0_", "__Z6cmp_brPKvS0_", "__Z14cmp_nei_key_wkPKvS0_", "__Z15cmp_neibour_cipPKvS0_", "__Z10cmp_nei_wkPKvS0_", "__Z8setBit_fjj", "__Z10clearBit_fjj", "_png_malloc", "_CompNeighLists", "_CompNeighListsUpToMaxRank", "_CompChemElemLex", "_CompAtomInvariants2", "_CompRank", "_CompRanksOrd", "_CompNeighListRanksOrd", "_CompNeighborsAT_NUMBER", "_CompRankTautomer", "_CompNeighborsRanksCountEql", "_CompRanksInvOrd", "_comp_AT_RANK", "_CompNeighListRanks", "_CompareDfsDescendants4CT", "_cmp_iso_atw_diff_component_no", "_CompDble", "_comp_AT_NUMB", "_CmpCCandidates", "_CompCGroupNumber", "_CompTGroupNumber", "_comp_candidates", "_cmp_rad_endpoints", "_bIsCenterPointStrict", "_CompINChINonTaut2", "_CompINChITaut2", "_cmp_components", "_comp_cc_cand", "_cmp_charge_val", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"];
var debug_table_iiid = ["0", "__ZN10QPlotCurve12setLabelSizeEid", "__ZN9QPlotItem12setLabelSizeEid", "0"];
var debug_table_iiidi = ["0", "__ZN10QPlotCurve11findElementERK6WPointd19PlotElementProperty", "__ZN10QPlotCurve14setMarkSizeIncEidPd", "__ZN14QPlotHistogram11findElementERK6WPointd19PlotElementProperty", "__ZN9QPlotItem14setMarkSizeIncEidPd", "__ZN9QPlotItem11findElementERK6WPointd19PlotElementProperty", "__ZN11QPlotMatrix11findElementERK6WPointd19PlotElementProperty", "0"];
var debug_table_iiii = ["0", "__ZNK9VectorSet8findMeanEPKii", "__ZNK10PatternSetI9BeeBitSetE10makeSubSetERK6SubSetN9VectorSet8CopyModeE", "__ZNK10PatternSetI9NumVectorIfEE10makeSubSetERK6SubSetN9VectorSet8CopyModeE", "__ZNK14MixedVectorSet10makeSubSetERK6SubSetN9VectorSet8CopyModeE", "__ZNK10PatternSetI12SparseVectorIidEE10makeSubSetERK6SubSetN9VectorSet8CopyModeE", "__ZNK10PatternSetI12SparseVectorIiiEE10makeSubSetERK6SubSetN9VectorSet8CopyModeE", "__ZNK10PatternSetI9NumVectorIiEE10makeSubSetERK6SubSetN9VectorSet8CopyModeE", "__ZNK10PatternSetI9NumVectorIdEE10makeSubSetERK6SubSetN9VectorSet8CopyModeE", "__ZN11StringBeeIn4readEPvi", "__ZN5ArrayI10S_RGP_COMBE6DeleteEii", "__ZN5ArrayIiE6DeleteEii", "__ZN5ArrayIP12IMTableEntryE6DeleteEii", "__ZN3SVM15PredictionModel8initFromEP8UIStream11PatternType", "__ZNK15ImobjView_Molob15writeBinaryBodyEP10OBinStreami", "__ZNK14ImobjView_Grob15writeBinaryBodyEP10OBinStreami", "__ZNK13ImobjView_Map15writeBinaryBodyEP10OBinStreami", "__ZNK17ImobjView_Label3D15writeBinaryBodyEP10OBinStreami", "__ZNK15ImobjView_Table15writeBinaryBodyEP10OBinStreami", "__ZNK20ImobjView_ImageAlbum15writeBinaryBodyEP10OBinStreami", "__ZNK19ImobjView_Alignment15writeBinaryBodyEP10OBinStreami", "__ZNK9ImobjView15writeBinaryBodyEP10OBinStreami", "__ZN5ArrayI7BeePairIi9BeeStringEE6DeleteEii", "__ZN12StringBeeOut5writeEPKvi", "__ZN5ArrayIPdE6DeleteEii", "__ZN5ArrayIPfE6DeleteEii", "__ZN5ArrayIPvE6DeleteEii", "__ZN5ArrayI7BeePairIiiEE6DeleteEii", "__ZN11UOStrStream6printfEPKcz", "__ZN11UOStrStream10writeBytesEiPKc", "__ZN12UOFileStream6printfEPKcz", "__ZN12UOFileStream10writeBytesEiPKc", "__ZN12UOFileStream7vprintfEPKcPi", "__ZN11UIStrStream3getER9BeeStringc", "__ZN11UIStrStream5sgetnEPci", "__ZN11UIStrStream5seekgElN4UIOS6CursorE", "__ZN8UIStream3getER9BeeStringc", "__ZN12UIFileStream5sgetnEPci", "__ZN12UIFileStream5seekgElN4UIOS6CursorE", "__ZNK10PatternSetI9BeeStringE10makeSubSetERK6SubSetN9VectorSet8CopyModeE", "__ZN5BeeIn4readEPvi", "__ZN6BeeOut5writeEPKvi", "__ZN5ArrayI5S_ALSE6DeleteEii", "__ZN5ArrayI12S_TEXT_ENTRYE6DeleteEii", "__ZN5ArrayI5S_PRII8S_BEE_ATEE6DeleteEii", "__ZN5ArrayIP8S_BEE_ATE6DeleteEii", "__ZN5ArrayIP4S_BOE6DeleteEii", "__ZN5ArrayIjE6DeleteEii", "__ZN5ArrayIP14S_AT_TREE_NODEE6DeleteEii", "__ZN5ArrayIP15S_CHEMICAL_RINGE6DeleteEii", "__ZN5ArrayI11ring_structE6DeleteEii", "__ZN5ArrayI9S_UPAC_BRE6DeleteEii", "__ZN5ArrayIP18mol_fpchain_stat_tE6DeleteEii", "__ZN5ArrayItE6DeleteEii", "__ZNK14DMatrixCluster9writeBodyEP8UOStreamN13IndexTreeRoot11WriteFormatE", "__ZNK9VectorSet10makeSubSetERK6SubSetNS_8CopyModeE", "__ZNK13IndexTreeRoot9writeBodyEP8UOStreamNS_11WriteFormatE", "__ZN3SVM15RegressionModel8initFromEP8UIStream11PatternType", "__ZN3SVM10KPLSRModel8initFromEP8UIStream11PatternType", "__ZN3SVM15KernelCacheFakeIfE4initERK11URefPointerI9VectorSetERKS2_INS_6KernelEE", "__ZN3SVM15KernelCacheFakeIfE6getRowEiRPf", "__ZN3SVM15KernelCacheFullIfE4initERK11URefPointerI9VectorSetERKS2_INS_6KernelEE", "__ZN3SVM15KernelCacheFullIfE6getRowEiRPf", "__ZN3SVM17KernelCacheNormalIfE4initERK11URefPointerI9VectorSetERKS2_INS_6KernelEE", "__ZN3SVM17KernelCacheNormalIfE6getRowEiRPf", "__ZN3SVM11KernelCacheIfE4initERK11URefPointerI9VectorSetERKS2_INS_6KernelEE", "__ZN3SVM18SVMPredictionModel8initFromEP8UIStream11PatternType", "__ZN3SVM9SVMMModel8initFromEP8UIStream11PatternType", "__ZNK3SVM18ClassifierLabelSet13getStatByNameERK9BeeStringPd", "__ZNK3SVM8LabelSet13getStatByNameERK9BeeStringPd", "__ZNK3SVM18RegressionLabelSet13getStatByNameERK9BeeStringPd", "__ZN10QPlotCurve10setElementEiRK6WPoint", "__ZN10QPlotCurve11setLabelPosEiRK6WPoint", "__ZNK10QPlotCurve11hasPropertyEi19PlotElementProperty", "__ZN10QPlotCurve13insertElementEiRK6WPoint", "__ZN9QPlotItem10setElementEiRK6WPoint", "__ZN9QPlotItem11setLabelPosEiRK6WPoint", "__ZNK14QPlotHistogram11hasPropertyEi19PlotElementProperty", "__ZNK9QPlotItem11hasPropertyEi19PlotElementProperty", "___stdout_write", "___stdio_seek", "___stdio_write", "___stdio_read", "_sn_write", "__ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv", "__ZNK10__cxxabiv123__fundamental_type_info9can_catchEPKNS_16__shim_type_infoERPv", "__ZNK10__cxxabiv119__pointer_type_info9can_catchEPKNS_16__shim_type_infoERPv", "__Z18mousedown_callbackiPK20EmscriptenMouseEventPv", "__Z22mousedblclick_callbackiPK20EmscriptenMouseEventPv", "__Z16mouseup_callbackiPK20EmscriptenMouseEventPv", "__Z18mousemove_callbackiPK20EmscriptenMouseEventPv", "__Z19mousewheel_callbackiPK20EmscriptenWheelEventPv", "__Z19touchstart_callbackiPK20EmscriptenTouchEventPv", "__Z17touchend_callbackiPK20EmscriptenTouchEventPv", "__Z18touchmove_callbackiPK20EmscriptenTouchEventPv", "__Z20touchcancel_callbackiPK20EmscriptenTouchEventPv", "__Z15resize_callbackiPK17EmscriptenUiEventPv", "__Z21on_canvassize_changediPKvPv", "__ZN10emscripten8internal12operator_newI17IcmPluginInstanceJNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEiiEEEPT_DpOT0_", "__ZN17IcmPluginInstance11openProjectERKN10emscripten3valES3_", "__ZN10emscripten8internal13MethodInvokerIM17IcmPluginInstanceFbRKNS_3valEEbPS2_JS5_EE6invokeERKS7_S8_PNS0_7_EM_VALE", "__ZN10emscripten8internal13MethodInvokerIM17IcmPluginInstanceFNS_3valERKNSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEES3_PS2_JSC_EE6invokeERKSE_SF_PNS0_11BindingTypeISA_EUt_E", "__ZN17IcmPluginInstance10callScriptERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEERKN10emscripten3valE", "__ZN17IcmPluginInstance11setShellVarERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEERKN10emscripten3valE", "__ZN10emscripten8internal13MethodInvokerIM17IcmPluginInstanceKFNS_3valERKNSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEES3_PKS2_JSC_EE6invokeERKSE_SG_PNS0_11BindingTypeISA_EUt_E", "__ZN10emscripten8internal13MethodInvokerIM18IcmPluginAlignmentKFNS_3valERKS3_ES3_PKS2_JS5_EE6invokeERKS7_S9_PNS0_7_EM_VALE", "__ZN10emscripten8internal13MethodInvokerIM14IcmPluginTableKFbiEbPKS2_JiEE6invokeERKS4_S6_i", "__ZN10emscripten8internal13MethodInvokerIM14IcmPluginTableKFiiEiPKS2_JiEE6invokeERKS4_S6_i", "__ZN10emscripten8internal13MethodInvokerIM14IcmPluginTableKFNS_3valEiES3_PKS2_JiEE6invokeERKS5_S7_i", "__ZN10emscripten8internal13MethodInvokerIM14IcmPluginTableKFNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEiES9_PKS2_JiEE6invokeERKSB_SD_i", "__ZN10emscripten8internal7InvokerIP13IcmPluginPlotJONS_3valES5_EE6invokeEPFS3_S5_S5_EPNS0_7_EM_VALESA_", "__ZN10emscripten8internal7InvokerIP21IcmPluginChemicalViewJONS_3valEO16ChemicalInstanceEE6invokeEPFS3_S5_S7_EPNS0_7_EM_VALEPS6_", "__ZN10emscripten8internal13MethodInvokerIM16ChemicalInstanceKFNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEbES9_PKS2_JbEE6invokeERKSB_SD_b", "__ZN10emscripten8internal13MethodInvokerIM16ChemicalInstanceFbRKNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEEbPS2_JSB_EE6invokeERKSD_SE_PNS0_11BindingTypeIS9_EUt_E", "__ZN16ChemicalInstance5matchERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEEb", "__ZN16ChemicalInstance11exact_matchERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEES8_", "__ZN10emscripten8internal13MethodInvokerIM16ReactionInstanceFbRKNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEEbPS2_JSB_EE6invokeERKSD_SE_PNS0_11BindingTypeIS9_EUt_E", "_memcmp", "_strncmp", "__Z10stub_writeiPvi", "__Z9stub_readiPvi", "_zcalloc", "_png_create_struct_2", "_png_zalloc", "_inflateInit_", "_do_read", "0", "0"];
var debug_table_iiiii = ["0", "__ZN7BeeEval8funcHashERK9BeeStringiR14BeeVariantType", "__ZNK10PatternSetI9BeeBitSetE9asRVectorEiPdi", "__ZNK10PatternSetI9BeeBitSetE9asFVectorEiPfi", "__ZNK10PatternSetI9NumVectorIfEE9asRVectorEiPdi", "__ZNK10PatternSetI9NumVectorIfEE9asFVectorEiPfi", "__ZNK14MixedVectorSet9asRVectorEiPdi", "__ZNK14MixedVectorSet9asFVectorEiPfi", "__ZNK10PatternSetI12SparseVectorIidEE9asRVectorEiPdi", "__ZNK10PatternSetI12SparseVectorIidEE9asFVectorEiPfi", "__ZNK10PatternSetI12SparseVectorIiiEE9asRVectorEiPdi", "__ZNK10PatternSetI12SparseVectorIiiEE9asFVectorEiPfi", "__ZNK10PatternSetI9NumVectorIiEE9asRVectorEiPdi", "__ZNK10PatternSetI9NumVectorIiEE9asFVectorEiPfi", "__ZNK10PatternSetI9NumVectorIdEE9asRVectorEiPdi", "__ZNK10PatternSetI9NumVectorIdEE9asFVectorEiPfi", "__ZN15ImobjView_Molob14readBinaryBodyEP10IBinStreamji", "__ZN14ImobjView_Grob14readBinaryBodyEP10IBinStreamji", "__ZN13ImobjView_Map14readBinaryBodyEP10IBinStreamji", "__ZN17ImobjView_Label3D14readBinaryBodyEP10IBinStreamji", "__ZN15ImobjView_Table14readBinaryBodyEP10IBinStreamji", "__ZN20ImobjView_ImageAlbum14readBinaryBodyEP10IBinStreamji", "__ZN19ImobjView_Alignment14readBinaryBodyEP10IBinStreamji", "__ZN9ImobjView14readBinaryBodyEP10IBinStreamji", "__ZN10ImChemEval8funcHashERK9BeeStringiR14BeeVariantType", "__ZN11UIStrStream3getEPcic", "__ZN11UIStrStream3getEPciPFbcE", "__ZN8UIStream3getEPcic", "__ZN8UIStream3getEPciPFbcE", "__ZNK10PatternSetI9BeeStringE9asRVectorEiPdi", "__ZNK10PatternSetI9BeeStringE9asFVectorEiPfi", "__ZN17BeeVariantRowEval8funcHashERK9BeeStringiR14BeeVariantType", "__ZN11BeeFuncEval8funcHashERK9BeeStringiR14BeeVariantType", "__Z9prop_bobtibP8S_BEE_ATS0_", "__Z10prop_borngibP8S_BEE_ATS0_", "__Z10prop_borotibP8S_BEE_ATS0_", "__Z10prop_boanyibP8S_BEE_ATS0_", "__Z10prop_boaroibP8S_BEE_ATS0_", "__ZN14FragFilterEval8funcHashERK9BeeStringiR14BeeVariantType", "__ZN8ChemEval8funcHashERK9BeeStringiR14BeeVariantType", "__ZN12AtomChemEval8funcHashERK9BeeStringiR14BeeVariantType", "__ZN14DMatrixCluster14initFromBinaryEP10IBinStreamji", "__ZNK9VectorSet9asRVectorEiPdi", "__ZNK9VectorSet9asFVectorEiPfi", "__ZN13IndexTreeRoot14initFromBinaryEP10IBinStreamji", "__ZN9Evolution14initFromBinaryEP10IBinStreamji", "__ZN8KCluster14initFromBinaryEP10IBinStreamji", "__ZNK3SVM15RegressionModel7predictERK11URefPointerI9VectorSetERS1_INS_8LabelSetEEP13BeeVariantMap", "__ZNK3SVM10KPLSRModel7predictERK11URefPointerI9VectorSetERS1_INS_8LabelSetEEP13BeeVariantMap", "__ZNK3SVM7NNModel7predictERK11URefPointerI9VectorSetERS1_INS_8LabelSetEEP13BeeVariantMap", "__ZNK3SVM16PredictionModel07predictERK11URefPointerI9VectorSetERS1_INS_8LabelSetEEP13BeeVariantMap", "__ZNK3SVM9SVMMModel7predictERK11URefPointerI9VectorSetERS1_INS_8LabelSetEEP13BeeVariantMap", "__ZNK3SVM9SVMCModel7predictERK11URefPointerI9VectorSetERS1_INS_8LabelSetEEP13BeeVariantMap", "__ZNK3SVM9SVMRModel7predictERK11URefPointerI9VectorSetERS1_INS_8LabelSetEEP13BeeVariantMap", "__ZNK3SVM18DecisionTreeCModel7predictERK11URefPointerI9VectorSetERS1_INS_8LabelSetEEP13BeeVariantMap", "__ZNK3SVM11BayesCModel7predictERK11URefPointerI9VectorSetERS1_INS_8LabelSetEEP13BeeVariantMap", "__ZNK3SVM12NaiveDensity7predictERK11URefPointerI9VectorSetERS1_INS_8LabelSetEEP13BeeVariantMap", "__ZNK3SVM18RandomForestCModel7predictERK11URefPointerI9VectorSetERS1_INS_8LabelSetEEP13BeeVariantMap", "__ZNK3SVM22RandomForestRegression7predictERK11URefPointerI9VectorSetERS1_INS_8LabelSetEEP13BeeVariantMap", "__ZNK3SVM10MxnetModel7predictERK11URefPointerI9VectorSetERS1_INS_8LabelSetEEP13BeeVariantMap", "__ZN16SequenceSiteEval8funcHashERK9BeeStringiR14BeeVariantType", "__ZN16ClusterTableEval8funcHashERK9BeeStringiR14BeeVariantType", "__ZN10emscripten8internal7InvokerIP17IcmPluginInstanceJONSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEOiSC_EE6invokeEPFS3_SB_SC_SC_EPNS0_11BindingTypeISA_EUt_Eii", "__ZN10emscripten8internal13MethodInvokerIM17IcmPluginInstanceFbRKNS_3valES5_EbPS2_JS5_S5_EE6invokeERKS7_S8_PNS0_7_EM_VALESD_", "__ZN10emscripten8internal13MethodInvokerIM17IcmPluginInstanceFbRKNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEERKNS_3valEEbPS2_JSB_SE_EE6invokeERKSG_SH_PNS0_11BindingTypeIS9_EUt_EPNS0_7_EM_VALE", "__ZN10emscripten8internal13MethodInvokerIM14IcmPluginTableKFNS_3valERKS3_S5_ES3_PKS2_JS5_S5_EE6invokeERKS7_S9_PNS0_7_EM_VALESE_", "__ZN14IcmPluginTable12setElementAtERKN10emscripten3valES3_S3_", "__ZN10emscripten8internal13MethodInvokerIM16ChemicalInstanceFiRKNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEbEiPS2_JSB_bEE6invokeERKSD_SE_PNS0_11BindingTypeIS9_EUt_Eb", "__ZN10emscripten8internal13MethodInvokerIM16ChemicalInstanceFbRKNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEESB_EbPS2_JSB_SB_EE6invokeERKSD_SE_PNS0_11BindingTypeIS9_EUt_ESL_", "_png_create_write_struct", "__Z12bond_sim_mapiibi", "__Z13bond_sim_map1iibi", "__Z12bond_sss_mapiibi", "__Z13bond_frag_mapiibi", "_snprintf", "_MakeAbcNumber", "_MakeDecNumber", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"];
var debug_table_iiiiii = ["0", "__ZN10FilterEval8funcHashERK9BeeStringS2_iR14BeeVariantType", "__ZNK10PatternSetI9BeeBitSetE11asAnyVectorEiPvii", "__ZNK10PatternSetI9NumVectorIfEE11asAnyVectorEiPvii", "__ZNK14MixedVectorSet11asAnyVectorEiPvii", "__ZNK10PatternSetI12SparseVectorIidEE11asAnyVectorEiPvii", "__ZNK10PatternSetI12SparseVectorIiiEE11asAnyVectorEiPvii", "__ZNK10PatternSetI9NumVectorIiEE11asAnyVectorEiPvii", "__ZNK10PatternSetI9NumVectorIdEE11asAnyVectorEiPvii", "__ZN7BeeEval8funcHashERK9BeeStringS2_iR14BeeVariantType", "__ZN17IcmCollectionEval8funcHashERK9BeeStringS2_iR14BeeVariantType", "__ZN7IcmEval8funcHashERK9BeeStringS2_iR14BeeVariantType", "__ZN12IcmTableEval8funcHashERK9BeeStringS2_iR14BeeVariantType", "__ZNK10PatternSetI9BeeStringE11asAnyVectorEiPvii", "__Z14atom_frag_map1P8S_BEE_ATiP12ChemicalDatabPb", "__Z14atom_frag_map2P8S_BEE_ATiP12ChemicalDatabPb", "__Z14atom_frag_map3P8S_BEE_ATiP12ChemicalDatabPb", "__Z14atom_frag_map4P8S_BEE_ATiP12ChemicalDatabPb", "__Z14atom_frag_map5P8S_BEE_ATiP12ChemicalDatabPb", "__Z14atom_frag_map6P8S_BEE_ATiP12ChemicalDatabPb", "__Z14atom_frag_map7P8S_BEE_ATiP12ChemicalDatabPb", "__ZN13Ph4ConstrEval8funcHashERK9BeeStringS2_iR14BeeVariantType", "__ZN14DMatrixCluster14readBinaryRootEP10IBinStreamjjRi", "__ZNK9VectorSet11asAnyVectorEiPvii", "__ZN8KCluster14readBinaryRootEP10IBinStreamjjRi", "__ZN3SVM15KernelCacheFakeIfE7getRowsEiiRPfS3_", "__ZN3SVM15KernelCacheFullIfE7getRowsEiiRPfS3_", "__ZN3SVM17KernelCacheNormalIfE7getRowsEiiRPfS3_", "__ZN10emscripten8internal13MethodInvokerIM14IcmPluginTableFbRKNS_3valES5_S5_EbPS2_JS5_S5_S5_EE6invokeERKS7_S8_PNS0_7_EM_VALESD_SD_", "__Z13atom_sim_map2P8S_BEE_ATiP12ChemicalDatabPb", "__Z13atom_sim_map1P8S_BEE_ATiP12ChemicalDatabPb", "__Z12atom_sss_mapP8S_BEE_ATiP12ChemicalDatabPb", "__Z13atom_sim_map3P8S_BEE_ATiP12ChemicalDatabPb", "__Z13atom_sim_map4P8S_BEE_ATiP12ChemicalDatabPb", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"];
var debug_table_iiiiiiii = ["0", "_Check15TautPathCenterpoint"];
var debug_table_iiiiiiiiiiiiiiii = ["0", "_Check6MembTautRing", "_Check5MembTautRing", "_Check7MembTautRing"];
var debug_table_iiiiiiiiiiiiiiiii = ["0", "_Check15TautPath"];
var debug_table_iij = ["0", "__ZN11UOStrStream5writeEy", "__ZN11UOStrStream5writeEx", "__ZN12UOFileStream5writeEy", "__ZN12UOFileStream5writeEx", "_rdots", "0", "0"];
var debug_table_v = ["0", "___cxa_pure_virtual", "__ZL25default_terminate_handlerv", "_loop_callback", "_abort", "__ZN10__cxxabiv112_GLOBAL__N_110construct_Ev", "0", "0"];
var debug_table_vi = ["0", "__ZN17IcmPluginInstanceD2Ev", "__ZN17IcmPluginInstanceD0Ev", "__ZN18IcmPluginInterface13updateProjectEv", "__ZN18IcmPluginInterface10updateViewEv", "__ZN18IcmPluginInterface11saveContextEv", "__ZN17IcmPluginInstance13swapBuffersGLEv", "__ZN18IcmPluginInterface9PopupMenuEv", "__ZN18IcmPluginInterface11updateTimerEv", "__ZN17IcmPluginInstance19updateAutoPlayTimerEv", "__ZN18IcmPluginInterface14loadSharedFileEv", "__ZN18IcmPluginInterface9enterLoopEv", "__ZN7BeeEvalD2Ev", "__ZN10FilterEvalD0Ev", "__ZNSt3__210__function6__baseIFbP5S_AT_EED2Ev", "__ZNSt3__210__function6__funcI3__1NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI3__1NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI3__1NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__funcI3__2NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI3__2NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI3__2NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__funcI3__3NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI3__3NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI3__3NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__funcI3__4NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI3__4NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI3__4NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__funcI3__5NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI3__5NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI3__5NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__funcI3__6NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI3__6NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI3__6NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__funcI3__7NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI3__7NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI3__7NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__funcI3__8NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI3__8NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI3__8NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__funcI3__9NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI3__9NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI3__9NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__funcI4__10NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI4__10NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI4__10NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__funcI4__11NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI4__11NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI4__11NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__funcI4__12NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI4__12NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI4__12NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__funcI4__13NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI4__13NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI4__13NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__funcI4__14NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI4__14NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI4__14NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__funcI4__15NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI4__15NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI4__15NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__funcI4__16NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI4__16NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI4__16NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__funcI4__17NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI4__17NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI4__17NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__funcI4__18NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI4__18NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI4__18NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__funcI4__19NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI4__19NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI4__19NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__funcI4__20NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI4__20NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI4__20NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__funcI4__21NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI4__21NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI4__21NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__funcI4__22NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI4__22NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI4__22NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__funcI4__23NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI4__23NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI4__23NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__funcI4__24NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI4__24NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI4__24NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__funcI4__25NS_9allocatorIS2_EEFbP5S_AT_EED0Ev", "__ZNSt3__210__function6__funcI4__25NS_9allocatorIS2_EEFbP5S_AT_EE7destroyEv", "__ZNSt3__210__function6__funcI4__25NS_9allocatorIS2_EEFbP5S_AT_EE18destroy_deallocateEv", "__ZNSt3__210__function6__baseIFvvEED2Ev", "__ZNSt3__210__function6__funcIZN21IcmPluginChemicalViewC1ERKN10emscripten3valERK16ChemicalInstanceE3__7NS_9allocatorISA_EEFvvEED0Ev", "__ZNSt3__210__function6__funcIZN21IcmPluginChemicalViewC1ERKN10emscripten3valERK16ChemicalInstanceE3__7NS_9allocatorISA_EEFvvEE7destroyEv", "__ZNSt3__210__function6__funcIZN21IcmPluginChemicalViewC1ERKN10emscripten3valERK16ChemicalInstanceE3__7NS_9allocatorISA_EEFvvEE18destroy_deallocateEv", "__ZNSt3__210__function6__funcIZN21IcmPluginChemicalViewC1ERKN10emscripten3valERK16ChemicalInstanceE3__7NS_9allocatorISA_EEFvvEEclEv", "__ZN12ChemicalView6updateEv", "__ZNSt3__210__function6__baseIFvP9QPlotItemRK9BeeBitSetEED2Ev", "__ZNSt3__210__function6__funcIZN13IcmPluginPlot12set_plotDataERKN10emscripten3valEE3__0NS_9allocatorIS7_EEFvP9QPlotItemRK9BeeBitSetEED0Ev", "__ZNSt3__210__function6__funcIZN13IcmPluginPlot12set_plotDataERKN10emscripten3valEE3__0NS_9allocatorIS7_EEFvP9QPlotItemRK9BeeBitSetEE7destroyEv", "__ZNSt3__210__function6__funcIZN13IcmPluginPlot12set_plotDataERKN10emscripten3valEE3__0NS_9allocatorIS7_EEFvP9QPlotItemRK9BeeBitSetEE18destroy_deallocateEv", "__ZNSt3__210__function6__baseIFviiEED2Ev", "__ZNSt3__210__function6__funcIZN13IcmPluginPlot12set_plotDataERKN10emscripten3valEE3__1NS_9allocatorIS7_EEFviiEED0Ev", "__ZNSt3__210__function6__funcIZN13IcmPluginPlot12set_plotDataERKN10emscripten3valEE3__1NS_9allocatorIS7_EEFviiEE7destroyEv", "__ZNSt3__210__function6__funcIZN13IcmPluginPlot12set_plotDataERKN10emscripten3valEE3__1NS_9allocatorIS7_EEFviiEE18destroy_deallocateEv", "__ZNSt3__210__function6__baseIFviEED2Ev", "__ZNSt3__210__function6__funcIZN13IcmPluginPlot12set_plotDataERKN10emscripten3valEE3__2NS_9allocatorIS7_EEFviEED0Ev", "__ZNSt3__210__function6__funcIZN13IcmPluginPlot12set_plotDataERKN10emscripten3valEE3__2NS_9allocatorIS7_EEFviEE7destroyEv", "__ZNSt3__210__function6__funcIZN13IcmPluginPlot12set_plotDataERKN10emscripten3valEE3__2NS_9allocatorIS7_EEFviEE18destroy_deallocateEv", "__ZNSt3__210__function6__funcIZN14IcmPluginTable13createClusterEiRKN10emscripten3valEE3__5NS_9allocatorIS7_EEFvvEED0Ev", "__ZNSt3__210__function6__funcIZN14IcmPluginTable13createClusterEiRKN10emscripten3valEE3__5NS_9allocatorIS7_EEFvvEE7destroyEv", "__ZNSt3__210__function6__funcIZN14IcmPluginTable13createClusterEiRKN10emscripten3valEE3__5NS_9allocatorIS7_EEFvvEE18destroy_deallocateEv", "__ZNSt3__210__function6__funcIZN14IcmPluginTable13createClusterEiRKN10emscripten3valEE3__5NS_9allocatorIS7_EEFvvEEclEv", "__ZNSt3__210__function6__funcIZN14IcmPluginTable13createClusterEiRKN10emscripten3valEE3__6NS_9allocatorIS7_EEFvvEED0Ev", "__ZNSt3__210__function6__funcIZN14IcmPluginTable13createClusterEiRKN10emscripten3valEE3__6NS_9allocatorIS7_EEFvvEE7destroyEv", "__ZNSt3__210__function6__funcIZN14IcmPluginTable13createClusterEiRKN10emscripten3valEE3__6NS_9allocatorIS7_EEFvvEE18destroy_deallocateEv", "__ZNSt3__210__function6__funcIZN14IcmPluginTable13createClusterEiRKN10emscripten3valEE3__6NS_9allocatorIS7_EEFvvEEclEv", "__ZNSt3__210__function6__funcIZN14IcmPluginTable10createPlotEiRKN10emscripten3valEE3__3NS_9allocatorIS7_EEFvvEED0Ev", "__ZNSt3__210__function6__funcIZN14IcmPluginTable10createPlotEiRKN10emscripten3valEE3__3NS_9allocatorIS7_EEFvvEE7destroyEv", "__ZNSt3__210__function6__funcIZN14IcmPluginTable10createPlotEiRKN10emscripten3valEE3__3NS_9allocatorIS7_EEFvvEE18destroy_deallocateEv", "__ZNSt3__210__function6__funcIZN14IcmPluginTable10createPlotEiRKN10emscripten3valEE3__3NS_9allocatorIS7_EEFvvEEclEv", "__ZNSt3__210__function6__funcIZN14IcmPluginTable10createPlotEiRKN10emscripten3valEE3__4NS_9allocatorIS7_EEFvP9QPlotItemRK9BeeBitSetEED0Ev", "__ZNSt3__210__function6__funcIZN14IcmPluginTable10createPlotEiRKN10emscripten3valEE3__4NS_9allocatorIS7_EEFvP9QPlotItemRK9BeeBitSetEE7destroyEv", "__ZNSt3__210__function6__funcIZN14IcmPluginTable10createPlotEiRKN10emscripten3valEE3__4NS_9allocatorIS7_EEFvP9QPlotItemRK9BeeBitSetEE18destroy_deallocateEv", "__ZN18IcmPluginInterfaceD2Ev", "__ZN18IcmPluginInterfaceD0Ev", "__ZN18IcmPluginInterface13swapBuffersGLEv", "__ZN18IcmPluginInterface19updateAutoPlayTimerEv", "__ZN9FastArrayI8S_BEE_ATED2Ev", "__ZN9FastArrayI8S_BEE_ATED0Ev", "__ZN9FastArrayI4S_BOED2Ev", "__ZN9FastArrayI4S_BOED0Ev", "__ZN16CArrayPatternSetI9BeeBitSetED2Ev", "__ZN16CArrayPatternSetI9BeeBitSetED0Ev", "__ZN10PatternSetI9BeeBitSetED2Ev", "__ZN10PatternSetI9BeeBitSetED0Ev", "__ZN13PatternSubSetI9BeeBitSetED2Ev", "__ZN13PatternSubSetI9BeeBitSetED0Ev", "__ZN17CBitSetPatternSetD2Ev", "__ZN13AtomChemFP_PSD0Ev", "__ZN14CountChemFP_PSD2Ev", "__ZN14CountChemFP_PSD0Ev", "__ZN17IcmTableVectorSetD2Ev", "__ZN17IcmTableVectorSetD0Ev", "__ZN16CArrayPatternSetI12SparseVectorIidEED2Ev", "__ZN16CArrayPatternSetI12SparseVectorIidEED0Ev", "__ZN10PatternSetI12SparseVectorIidEED2Ev", "__ZN10PatternSetI12SparseVectorIidEED0Ev", "__ZN16CArrayPatternSetI12SparseVectorIiiEED2Ev", "__ZN16CArrayPatternSetI12SparseVectorIiiEED0Ev", "__ZN10PatternSetI12SparseVectorIiiEED2Ev", "__ZN10PatternSetI12SparseVectorIiiEED0Ev", "__ZN16CArrayPatternSetI9NumVectorIiEED2Ev", "__ZN16CArrayPatternSetI9NumVectorIiEED0Ev", "__ZN10PatternSetI9NumVectorIiEED2Ev", "__ZN10PatternSetI9NumVectorIiEED0Ev", "__ZN13PatternSubSetI9NumVectorIiEED2Ev", "__ZN13PatternSubSetI9NumVectorIiEED0Ev", "__ZN13PatternSubSetI12SparseVectorIiiEED2Ev", "__ZN13PatternSubSetI12SparseVectorIiiEED0Ev", "__ZN13PatternSubSetI12SparseVectorIidEED2Ev", "__ZN13PatternSubSetI12SparseVectorIidEED0Ev", "__ZN16CArrayPatternSetI9NumVectorIdEED2Ev", "__ZN16CArrayPatternSetI9NumVectorIdEED0Ev", "__ZN10PatternSetI9NumVectorIdEED2Ev", "__ZN10PatternSetI9NumVectorIdEED0Ev", "__ZN13PatternSubSetI9NumVectorIdEED2Ev", "__ZN13PatternSubSetI9NumVectorIdEED0Ev", "__ZN16CArrayPatternSetI9NumVectorIfEED2Ev", "__ZN16CArrayPatternSetI9NumVectorIfEED0Ev", "__ZN10PatternSetI9NumVectorIfEED2Ev", "__ZN10PatternSetI9NumVectorIfEED0Ev", "__ZN13PatternSubSetI9NumVectorIfEED2Ev", "__ZN13PatternSubSetI9NumVectorIfEED0Ev", "__ZN18CountAtomChemFP_PSD0Ev", "__ZN13ConvChemFP_PSD2Ev", "__ZN13ConvChemFP_PSD0Ev", "__ZN25PropertyColorInterpolatorD2Ev", "__ZN25PropertyColorInterpolatorD0Ev", "__ZN20BeeFindexTableAccessD2Ev", "__ZN20BeeFindexTableAccessD0Ev", "__ZN20BeeFindexTableAccess9beginRowsEv", "__ZN11StringBeeInD2Ev", "__ZN11StringBeeInD0Ev", "__ZN5ArrayI10S_RGP_COMBED2Ev", "__ZN5ArrayI10S_RGP_COMBED0Ev", "__ZN5ArrayI10S_RGP_COMBE4growEv", "__ZN5ArrayIiED2Ev", "__ZN5ArrayIiED0Ev", "__ZN5ArrayIiE4growEv", "__ZN12IcmPredModelD2Ev", "__ZN12IcmPredModelD0Ev", "__ZN5ArrayIP12IMTableEntryED2Ev", "__ZN5ArrayIP12IMTableEntryED0Ev", "__ZN5ArrayIP12IMTableEntryE4growEv", "__ZN18BeeAbstractGVectorI9NumVectorIdEED2Ev", "__ZN18BeeAbstractGVectorI9NumVectorIdEED0Ev", "__ZN18BeeAbstractGVectorI9NumVectorIdEE6unlinkEv", "__ZN18BeeAbstractGVectorI9NumVectorIiEED2Ev", "__ZN18BeeAbstractGVectorI9NumVectorIiEED0Ev", "__ZN18BeeAbstractGVectorI9NumVectorIiEE6unlinkEv", "__ZN17BeeAbstractVectorD2Ev", "__ZN17BeeAbstractVectorD0Ev", "__ZN17BeeAbstractVector6unlinkEv", "__ZN3SVM6KernelD2Ev", "__ZN3SVM10Kernel_DotD0Ev", "__ZN3SVM17PredictionMachineD2Ev", "__ZN3SVM13SimpleMachineD0Ev", "__ZN3SVM15PredictionModelD2Ev", "__ZN3SVM15PredictionModelD0Ev", "__ZN13IcmFuncSearchD2Ev", "__ZN13IcmFuncSearchD0Ev", "__ZN5ASiteD2Ev", "__ZN13ASite_CommentD0Ev", "__ZN5ASiteD0Ev", "__ZN7MolSiteD2Ev", "__ZN7MolSiteD0Ev", "__ZN15ImobjView_MolobD2Ev", "__ZN15ImobjView_MolobD0Ev", "__ZN14ImobjView_GrobD2Ev", "__ZN14ImobjView_GrobD0Ev", "__ZN9ImobjViewD2Ev", "__ZN13ImobjView_MapD0Ev", "__ZN17ImobjView_Label3DD2Ev", "__ZN17ImobjView_Label3DD0Ev", "__ZN15ImobjView_TableD2Ev", "__ZN15ImobjView_TableD0Ev", "__ZN20ImobjView_ImageAlbumD2Ev", "__ZN20ImobjView_ImageAlbumD0Ev", "__ZN19ImobjView_AlignmentD0Ev", "__ZN9ImobjViewD0Ev", "__ZN5ArrayI7BeePairIi9BeeStringEED2Ev", "__ZN5ArrayI7BeePairIi9BeeStringEED0Ev", "__ZN5ArrayI7BeePairIi9BeeStringEE4growEv", "__ZN8ChemEvalD2Ev", "__ZN10ImChemEvalD0Ev", "__ZN12StringBeeOutD2Ev", "__ZN12StringBeeOutD0Ev", "__ZN12StringBeeOut9startMoreEv", "__ZN12StringBeeOut8stopMoreEv", "__ZN5ArrayIPdED2Ev", "__ZN5ArrayIPdED0Ev", "__ZN5ArrayIPdE4growEv", "__ZN5ArrayIPfED2Ev", "__ZN5ArrayIPfED0Ev", "__ZN5ArrayIPfE4growEv", "__ZN5ArrayIPvED2Ev", "__ZN5ArrayIPvED0Ev", "__ZN5ArrayIPvE4growEv", "__ZN5ArrayI7BeePairIiiEED2Ev", "__ZN5ArrayI7BeePairIiiEED0Ev", "__ZN5ArrayI7BeePairIiiEE4growEv", "__ZN14IcmTableAccessD2Ev", "__ZN14IcmTableAccessD0Ev", "__ZN14IcmTableAccess9beginRowsEv", "__ZN17IcmCollectionEvalD2Ev", "__ZN17IcmCollectionEvalD0Ev", "__ZN7IcmEvalD0Ev", "__ZN12IcmTableEvalD2Ev", "__ZN12IcmTableEvalD0Ev", "__ZN18BeeAbstractGVectorI8SequenceED2Ev", "__ZN18BeeAbstractGVectorI8SequenceED0Ev", "__ZN18BeeAbstractGVectorI8SequenceE6unlinkEv", "__ZN18BeeAbstractGVectorI8ChemicalED2Ev", "__ZN18BeeAbstractGVectorI8ChemicalED0Ev", "__ZN18BeeAbstractGVectorI8ChemicalE6unlinkEv", "__ZN18BeeAbstractGVectorI8ReactionED2Ev", "__ZN18BeeAbstractGVectorI8ReactionED0Ev", "__ZN18BeeAbstractGVectorI8ReactionE6unlinkEv", "__ZN18BeeAbstractGVectorI8IcmMolobED2Ev", "__ZN18BeeAbstractGVectorI8IcmMolobED0Ev", "__ZN18BeeAbstractGVectorI8IcmMolobE6unlinkEv", "__ZN18BeeAbstractGVectorI8BeeImageED2Ev", "__ZN18BeeAbstractGVectorI8BeeImageED0Ev", "__ZN18BeeAbstractGVectorI8BeeImageE6unlinkEv", "__ZN18BeeAbstractGVectorI9BeeBitSetED2Ev", "__ZN18BeeAbstractGVectorI9BeeBitSetED0Ev", "__ZN18BeeAbstractGVectorI9BeeBitSetE6unlinkEv", "__ZN18BeeAbstractGVectorI15BeeStringVectorED2Ev", "__ZN18BeeAbstractGVectorI15BeeStringVectorED0Ev", "__ZN18BeeAbstractGVectorI15BeeStringVectorE6unlinkEv", "__ZN18BeeAbstractGVectorI7BeeDateED2Ev", "__ZN18BeeAbstractGVectorI7BeeDateED0Ev", "__ZN18BeeAbstractGVectorI7BeeDateE6unlinkEv", "__ZN11UOStrStreamD2Ev", "__ZN11UOStrStreamD0Ev", "__ZN12UOFileStreamD2Ev", "__ZN12UOFileStreamD0Ev", "__ZN8UIStreamD2Ev", "__ZN11UIStrStreamD0Ev", "__ZN8UIStream5closeEv", "__ZN11UIStrStream11putbackSameEv", "__ZN12UIFileStreamD2Ev", "__ZN12UIFileStreamD0Ev", "__ZN12UIFileStream5closeEv", "__ZN8UIStream11putbackSameEv", "__ZN17CBitSetPatternSetD0Ev", "__ZN14MixedVectorSetD2Ev", "__ZN14MixedVectorSetD0Ev", "__ZN16CArrayPatternSetI9BeeStringED2Ev", "__ZN16CArrayPatternSetI9BeeStringED0Ev", "__ZN10PatternSetI9BeeStringED2Ev", "__ZN10PatternSetI9BeeStringED0Ev", "__ZN13PatternSubSetI9BeeStringED2Ev", "__ZN13PatternSubSetI9BeeStringED0Ev", "__ZN10FuncSearchD2Ev", "__ZN10FuncSearchD0Ev", "__ZN5BeeInD2Ev", "__ZN5BeeInD0Ev", "__ZN6BeeOutD2Ev", "__ZN6BeeOutD0Ev", "__ZN6BeeOut9startMoreEv", "__ZN6BeeOut8stopMoreEv", "__ZN17BeeVariantRowEvalD2Ev", "__ZN17BeeVariantRowEvalD0Ev", "__ZN11BeeFuncEvalD2Ev", "__ZN11BeeFuncEvalD0Ev", "__ZN7BeeEvalD0Ev", "__ZN17BeeEvalFuncSearchD2Ev", "__ZN17BeeEvalFuncSearchD0Ev", "__ZN17ColorInterpolatorD2Ev", "__ZN17ColorInterpolatorD0Ev", "__ZN5ArrayI5S_ALSED2Ev", "__ZN5ArrayI5S_ALSED0Ev", "__ZN5ArrayI5S_ALSE4growEv", "__ZN5ArrayI12S_TEXT_ENTRYED2Ev", "__ZN5ArrayI12S_TEXT_ENTRYED0Ev", "__ZN5ArrayI12S_TEXT_ENTRYE4growEv", "__ZN5ArrayI5S_PRII8S_BEE_ATEED2Ev", "__ZN5ArrayI5S_PRII8S_BEE_ATEED0Ev", "__ZN5ArrayI5S_PRII8S_BEE_ATEE4growEv", "__ZN5ArrayIP8S_BEE_ATED2Ev", "__ZN5ArrayIP8S_BEE_ATED0Ev", "__ZN5ArrayIP8S_BEE_ATE4growEv", "__ZN5ArrayIP4S_BOED2Ev", "__ZN5ArrayIP4S_BOED0Ev", "__ZN5ArrayIP4S_BOE4growEv", "__ZN5ArrayIjED2Ev", "__ZN5ArrayIjED0Ev", "__ZN5ArrayIjE4growEv", "__ZN11MolFragmentD2Ev", "__ZN11MolFragmentD0Ev", "__ZN17FusedRingFragmentD2Ev", "__ZN17FusedRingFragmentD0Ev", "__ZN12BaseFragmentD2Ev", "__ZN12BaseFragmentD0Ev", "__ZN5ArrayIP14S_AT_TREE_NODEED2Ev", "__ZN5ArrayIP14S_AT_TREE_NODEED0Ev", "__ZN5ArrayIP14S_AT_TREE_NODEE4growEv", "__ZN5ArrayIP15S_CHEMICAL_RINGED2Ev", "__ZN5ArrayIP15S_CHEMICAL_RINGED0Ev", "__ZN5ArrayIP15S_CHEMICAL_RINGE4growEv", "__ZN5ArrayI11ring_structED2Ev", "__ZN5ArrayI11ring_structED0Ev", "__ZN5ArrayI11ring_structE4growEv", "__ZN5ArrayI9S_UPAC_BRED2Ev", "__ZN5ArrayI9S_UPAC_BRED0Ev", "__ZN5ArrayI9S_UPAC_BRE4growEv", "__ZN9ChemFP_PSD0Ev", "__ZN13Ph4ConstrEvalD2Ev", "__ZN13Ph4ConstrEvalD0Ev", "__ZN5ArrayIP18mol_fpchain_stat_tED2Ev", "__ZN5ArrayIP18mol_fpchain_stat_tED0Ev", "__ZN5ArrayIP18mol_fpchain_stat_tE4growEv", "__ZN5ArrayItED2Ev", "__ZN5ArrayItED0Ev", "__ZN5ArrayItE4growEv", "__ZN14FragFilterEvalD2Ev", "__ZN14FragFilterEvalD0Ev", "__ZN8ChemEvalD0Ev", "__ZN12AtomChemEvalD0Ev", "__ZN14DMatrixClusterD2Ev", "__ZN14DMatrixClusterD0Ev", "__ZN9VectorSetD2Ev", "__ZN18UpperDimtVectorSetIfED0Ev", "__ZN13IndexTreeRootD2Ev", "__ZN13IndexTreeRootD0Ev", "__ZN9EvolutionD0Ev", "__ZN8KClusterD2Ev", "__ZN8KClusterD0Ev", "__ZN3SVM17Kernel_PolynomialD0Ev", "__ZN3SVM13Kernel_RadialD0Ev", "__ZN3SVM14Kernel_SigmoidD0Ev", "__ZN3SVM15Kernel_TanimotoD0Ev", "__ZN3SVM11PLSRMachineD2Ev", "__ZN3SVM11PLSRMachineD0Ev", "__ZN3SVM15RegressionModelD2Ev", "__ZN3SVM15RegressionModelD0Ev", "__ZN3SVM17RegressionMachineD2Ev", "__ZN3SVM17RegressionMachineD0Ev", "__ZN3SVM10KPLSRModelD2Ev", "__ZN3SVM10KPLSRModelD0Ev", "__ZN3SVM7NNModelD2Ev", "__ZN3SVM7NNModelD0Ev", "__ZN3SVM16PredictionModel0D0Ev", "__ZN3SVM9SVMachineD2Ev", "__ZN3SVM9SVMachineD0Ev", "__ZN3SVM15KernelCacheFakeIfED2Ev", "__ZN3SVM15KernelCacheFakeIfED0Ev", "__ZN3SVM15KernelCacheFullIfED2Ev", "__ZN3SVM15KernelCacheFullIfED0Ev", "__ZN3SVM17KernelCacheNormalIfED2Ev", "__ZN3SVM17KernelCacheNormalIfED0Ev", "__ZN3SVM11KernelCacheIfED2Ev", "__ZN3SVM11KernelCacheIfED0Ev", "__ZN3SVM18SVMPredictionModelD2Ev", "__ZN3SVM18SVMPredictionModelD0Ev", "__ZN3SVM9SVMMModelD2Ev", "__ZN3SVM9SVMMModelD0Ev", "__ZN3SVM9SVMCModelD0Ev", "__ZN3SVM9SVMRModelD0Ev", "__ZN3SVM18ClassifierLabelSetD2Ev", "__ZN3SVM18ClassifierLabelSetD0Ev", "__ZN3SVM18ClassifierLabelSet11destroyDataEv", "__ZN3SVM18ClassifierLabelSet17allocatePredictedEv", "__ZN3SVM11OPELabelSetIiED2Ev", "__ZN3SVM11OPELabelSetIiED0Ev", "__ZN3SVM8LabelSet11destroyDataEv", "__ZN3SVM8LabelSet17allocatePredictedEv", "__ZN3SVM8LabelSetD2Ev", "__ZN3SVM8LabelSetD0Ev", "__ZN3SVM18MultiClassLabelSetD2Ev", "__ZN3SVM18MultiClassLabelSetD0Ev", "__ZN3SVM18MultiClassLabelSet11destroyDataEv", "__ZN3SVM18MultiClassLabelSet17allocatePredictedEv", "__ZN3SVM23MultiClassMultiLabelSetD2Ev", "__ZN3SVM23MultiClassMultiLabelSetD0Ev", "__ZN3SVM23MultiClassMultiLabelSet11destroyDataEv", "__ZN3SVM23MultiClassMultiLabelSet17allocatePredictedEv", "__ZN3SVM11OPELabelSetI9NumVectorIiEED2Ev", "__ZN3SVM11OPELabelSetI9NumVectorIiEED0Ev", "__ZN3SVM18RegressionLabelSetD2Ev", "__ZN3SVM18RegressionLabelSetD0Ev", "__ZN3SVM18RegressionLabelSet11destroyDataEv", "__ZN3SVM18RegressionLabelSet17allocatePredictedEv", "__ZN3SVM11OPELabelSetIdED2Ev", "__ZN3SVM11OPELabelSetIdED0Ev", "__ZN3SVM23MultiRegressionLabelSetD2Ev", "__ZN3SVM23MultiRegressionLabelSetD0Ev", "__ZN3SVM23MultiRegressionLabelSet11destroyDataEv", "__ZN3SVM23MultiRegressionLabelSet17allocatePredictedEv", "__ZN3SVM11OPELabelSetI16BeeVariantVectorED2Ev", "__ZN3SVM11OPELabelSetI16BeeVariantVectorED0Ev", "__ZN3SVM11SVMRMachineD2Ev", "__ZN3SVM11SVMRMachineD0Ev", "__ZN3SVM11SVMRMachine18calcSpecStatisticsEv", "__ZN3SVM11ModelSearchD2Ev", "__ZN3SVM11ModelSearchD0Ev", "__ZN3SVM11ModelSearch4loadEv", "__ZN3SVM11ModelSearch3runEv", "__ZN3SVM10PLSRSearchD2Ev", "__ZN3SVM10PLSRSearchD0Ev", "__ZN3SVM10PLSRSearch4loadEv", "__ZN3SVM10SVMRSearchD2Ev", "__ZN3SVM10SVMRSearchD0Ev", "__ZN3SVM10SVMRSearch4loadEv", "__ZN3SVM10SVMCSearchD2Ev", "__ZN3SVM10SVMCSearchD0Ev", "__ZN3SVM10SVMCSearch4loadEv", "__ZN3SVM10PCRMachineD2Ev", "__ZN3SVM10PCRMachineD0Ev", "__ZN3SVM11SVMCMachineD2Ev", "__ZN3SVM11SVMCMachineD0Ev", "__ZN3SVM11SVMCMachine18calcSpecStatisticsEv", "__ZN3SVM18DecisionTreeCModelD2Ev", "__ZN3SVM18DecisionTreeCModelD0Ev", "__ZN3SVM11BayesCModelD2Ev", "__ZN3SVM11BayesCModelD0Ev", "__ZN3SVM12NaiveDensityD2Ev", "__ZN3SVM12NaiveDensityD0Ev", "__ZN3SVM18RandomForestCModelD2Ev", "__ZN3SVM18RandomForestCModelD0Ev", "__ZN3SVM22RandomForestRegressionD2Ev", "__ZN3SVM22RandomForestRegressionD0Ev", "__ZN3SVM10MxnetModelD2Ev", "__ZN3SVM10MxnetModelD0Ev", "__ZN11AlphabetU26D2Ev", "__ZN11AlphabetU26D0Ev", "__ZN13ASite_SStructD2Ev", "__ZN13ASite_SStructD0Ev", "__ZN13ASite_SurfaceD2Ev", "__ZN13ASite_SurfaceD0Ev", "__ZN16SequenceSiteEvalD2Ev", "__ZN16SequenceSiteEvalD0Ev", "__ZN12AlphabetNuclD0Ev", "__ZN13AlphabetAminoD2Ev", "__ZN13AlphabetAminoD0Ev", "__ZN8ASite_3DD2Ev", "__ZN8ASite_3DD0Ev", "__ZN12ASite_DomainD0Ev", "__ZN10QPlotCurve29recalculateLimitDependentDataEv", "__ZN9QPlotItem7changedEv", "__ZN9QPlotItem29recalculateLimitDependentDataEv", "__ZN19QicmTableScrollPlot13removeContentEv", "__ZN19QicmTableScrollPlot12updateFilterEv", "__ZN14QIndexTreeView16onBeginSelectionEv", "__ZN14QIndexTreeView14onEndSelectionEv", "__ZN14QIndexTreeView11hideToolTipEv", "__ZN17QicmIndexTreeView16onBeginSelectionEv", "__ZN17QicmIndexTreeView14onEndSelectionEv", "__ZN16ClusterTableEvalD0Ev", "__ZN13DMatrixExportD2Ev", "__ZN15DMatrixExport_FD0Ev", "__ZN13QChemicalView6updateEv", "__ZThn24_N13QChemicalView6updateEv", "__ZNSt3__217bad_function_callD2Ev", "__ZNSt3__217bad_function_callD0Ev", "__ZN10__cxxabiv116__shim_type_infoD2Ev", "__ZN10__cxxabiv117__class_type_infoD0Ev", "__ZNK10__cxxabiv116__shim_type_info5noop1Ev", "__ZNK10__cxxabiv116__shim_type_info5noop2Ev", "__ZN10__cxxabiv120__si_class_type_infoD0Ev", "__ZNSt9bad_allocD2Ev", "__ZNSt9bad_allocD0Ev", "__ZN10__cxxabiv123__fundamental_type_infoD0Ev", "__ZN10__cxxabiv119__pointer_type_infoD0Ev", "__ZN10__cxxabiv121__vmi_class_type_infoD0Ev", "__Z22runCommandsTimeoutFuncPv", "__ZN10emscripten3valD2Ev", "__Z23readBinaryOnErrorPluginPv", "__ZN9BeeStringD2Ev", "__ZN10emscripten8internal14raw_destructorI17IcmPluginInstanceEEvPT_", "__ZN17IcmPluginInstance6redrawEv", "__ZN17IcmPluginInstance12renderToGrobEv", "__ZN10emscripten8internal14raw_destructorI18IcmPluginAlignmentEEvPT_", "__ZN18IcmPluginAlignment6updateEv", "__ZN18IcmPluginAlignment14clearSelectionEv", "__Z22readBinaryOnErrorMacroPv", "__Z21readModuleOnErrorFilePv", "__ZN7GVectorI9BeeStringED2Ev", "__ZN6BeeMapI9BeeStringS0_7BeeLessIS0_EED2Ev", "___cxx_global_array_dtor", "__ZN6BeeMapI9BeeStringi7BeeLessIS0_EED2Ev", "__ZN10emscripten8internal14raw_destructorI14IcmPluginTableEEvPT_", "__ZN14IcmPluginTable14clearSelectionEv", "__ZN14IcmPluginTable6updateEv", "__ZN14IcmPluginTable14updateIfNeededEv", "__ZN10emscripten8internal14raw_destructorI13IcmPluginPlotEEvPT_", "__ZN13IcmPluginPlot4drawEv", "__ZN13IcmPluginPlot14drawMolIfDirtyEv", "__ZN10emscripten8internal14raw_destructorI21IcmPluginChemicalViewEEvPT_", "__ZN21IcmPluginChemicalView4drawEv", "__ZN21IcmPluginChemicalView14drawMolIfDirtyEv", "__ZN7GVectorIP18IcmPluginInterfaceED2Ev", "__ZN6BeeMapI9BeeString7GVectorIP18IcmPluginInterfaceE7BeeLessIS0_EED2Ev", "__ZN10emscripten8internal14raw_destructorI16ChemicalInstanceEEvPT_", "__ZN10emscripten8internal14raw_destructorI16ReactionInstanceEEvPT_", "__ZN8BeeRegexD2Ev", "__ZN7GVectorIS_I12S_STORE_INFOEED2Ev", "__ZN13S_ALKR_SCHEMAD2Ev", "__ZN6BeeMapI9BeeString11WarnCount_t7BeeLessIS0_EED2Ev", "__ZN7GVectorIiED2Ev", "__ZL19obinstream_flush_fnP14png_struct_def", "_png_set_packing", "_free", "__ZN10S_RGP_COMBD2Ev", "__ZN6BeeMapI9BeeString18S_OPENED_FILE_INFO7BeeLessIS0_EED2Ev", "__ZN7GVectorIP10GrobMtlLibED2Ev", "__ZN7GVectorIP9GrobGraphED2Ev", "__ZN8UPointerI13IcmFuncSearchS0_ED2Ev", "__ZN7GVectorIN13IcmFuncSearch11IcmUserFuncEED2Ev", "__ZN8UPointerI7IcmViewS0_ED2Ev", "__ZN6BeeMapI9BeeString10BeeVariant7BeeLessIS0_EED2Ev", "__ZN7GVectorI8ChemicalED2Ev", "__ZN8ChemicalD2Ev", "__ZN17LigandRecordStackD2Ev", "__ZN6BeeMapI9BeeString9NumVectorIdE7BeeLessIS0_EED2Ev", "__ZN6BeeMapI9BeeString9NumVectorIiE7BeeLessIS0_EED2Ev", "__Z10stub_flushi", "__ZN6BeeMapI9BeeString10ChemFilter7BeeLessIS0_EED2Ev", "__ZN7GVectorI7BeePairI8ChemicalS1_EED2Ev", "__ZN6BeeMapI9BeeStringP8_IO_FILE7BeeLessIS0_EED2Ev", "__ZN7GVectorI9NumVectorIdEED2Ev", "___cxx_global_array_dtor_22371", "___cxx_global_array_dtor_107", "___cxx_global_array_dtor_109", "__ZN7GVectorI8BeeColorED2Ev", "__ZN9Common_sp9SemaphoreD2Ev", "__ZN7GVectorI10BeeVariantED2Ev", "__ZN11URefPointerI17BeeEvalFuncSearchED2Ev", "__ZN8BeeImageD2Ev", "__ZN7GVectorI7BeePairI8BeeRegex9BeeStringEED2Ev", "__ZN7GVectorI12RingsPatternED2Ev", "__ZN9S_UPAC_BRD2Ev", "___cxx_global_array_dtor_552", "___cxx_global_array_dtor_27866", "__ZN7GVectorI11Ph4TypeDescED2Ev", "_png_default_flush", "__ZN10__cxxabiv112_GLOBAL__N_19destruct_EPv", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"];
var debug_table_vid = ["0", "__ZN14QIndexTreeView21onClusterStatsChangedEd", "__ZN17QicmIndexTreeView21onClusterStatsChangedEd", "0"];
var debug_table_vidddddi = ["0", "__ZN17TableLineCallBackclEdddddi"];
var debug_table_vii = ["0", "__ZN18IcmPluginInterface13renderNoReadyERK9BeeString", "__ZN17IcmPluginInstance9controlIdEv", "__ZN17IcmPluginInstance12onTorsionRotERK10BeeVariant", "__ZN18IcmPluginInterface15loadExternalURLERK9BeeString", "__ZN18IcmPluginInterface14setProjectFileERK9BeeString", "__ZN17IcmPluginInstance16onTorsionRotInitEP5S_AT_", "__ZN17IcmPluginInstance18onTorsionRotUpdateEP5S_AT_", "__ZN17IcmPluginInstance16onTorsionRotDoneEP5S_AT_", "__ZNK7BeeEval15defaultArgumentEv", "__ZNK10FilterEval18supportedFunctionsEv", "__ZNKSt3__210__function6__funcI3__1NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcI3__2NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcI3__3NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcI3__4NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcI3__5NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcI3__6NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcI3__7NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcI3__8NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcI3__9NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcI4__10NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcI4__11NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcI4__12NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcI4__13NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcI4__14NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcI4__15NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcI4__16NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcI4__17NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcI4__18NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcI4__19NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcI4__20NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcI4__21NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcI4__22NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcI4__23NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcI4__24NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcI4__25NS_9allocatorIS2_EEFbP5S_AT_EE7__cloneEPNS0_6__baseIS7_EE", "__ZNKSt3__210__function6__funcIZN21IcmPluginChemicalViewC1ERKN10emscripten3valERK16ChemicalInstanceE3__7NS_9allocatorISA_EEFvvEE7__cloneEPNS0_6__baseISD_EE", "__ZN7QWidget10paintEventEP11QPaintEvent", "__ZN7QWidget11resizeEventEP12QResizeEvent", "__ZN7QWidget6resizeERK5WSize", "__ZNKSt3__210__function6__funcIZN13IcmPluginPlot12set_plotDataERKN10emscripten3valEE3__0NS_9allocatorIS7_EEFvP9QPlotItemRK9BeeBitSetEE7__cloneEPNS0_6__baseISF_EE", "__ZNKSt3__210__function6__funcIZN13IcmPluginPlot12set_plotDataERKN10emscripten3valEE3__1NS_9allocatorIS7_EEFviiEE7__cloneEPNS0_6__baseISA_EE", "__ZNKSt3__210__function6__funcIZN13IcmPluginPlot12set_plotDataERKN10emscripten3valEE3__2NS_9allocatorIS7_EEFviEE7__cloneEPNS0_6__baseISA_EE", "__ZNSt3__210__function6__funcIZN13IcmPluginPlot12set_plotDataERKN10emscripten3valEE3__2NS_9allocatorIS7_EEFviEEclEOi", "__ZNKSt3__210__function6__funcIZN14IcmPluginTable13createClusterEiRKN10emscripten3valEE3__5NS_9allocatorIS7_EEFvvEE7__cloneEPNS0_6__baseISA_EE", "__ZNKSt3__210__function6__funcIZN14IcmPluginTable13createClusterEiRKN10emscripten3valEE3__6NS_9allocatorIS7_EEFvvEE7__cloneEPNS0_6__baseISA_EE", "__ZNKSt3__210__function6__funcIZN14IcmPluginTable10createPlotEiRKN10emscripten3valEE3__3NS_9allocatorIS7_EEFvvEE7__cloneEPNS0_6__baseISA_EE", "__ZNKSt3__210__function6__funcIZN14IcmPluginTable10createPlotEiRKN10emscripten3valEE3__4NS_9allocatorIS7_EEFvP9QPlotItemRK9BeeBitSetEE7__cloneEPNS0_6__baseISF_EE", "__ZN18IcmPluginInterface12onTorsionRotERK10BeeVariant", "__ZN9VectorSet14accelerateDissEb", "__ZNK10PatternSetI9BeeBitSetE20calculateNormSquaresEb", "__ZNK10PatternSetI9NumVectorIfEE20calculateNormSquaresEb", "__ZN14MixedVectorSet14accelerateDissEb", "__ZNK14MixedVectorSet20calculateNormSquaresEb", "__ZNK10PatternSetI12SparseVectorIidEE20calculateNormSquaresEb", "__ZNK10PatternSetI12SparseVectorIiiEE20calculateNormSquaresEb", "__ZNK10PatternSetI9NumVectorIiEE20calculateNormSquaresEb", "__ZNK10PatternSetI9NumVectorIdEE20calculateNormSquaresEb", "__ZNK20BeeFindexTableAccess11columnNamesEv", "__ZNK20BeeFindexTableAccess11columnTypesEv", "__ZN18BeeAbstractGVectorI9NumVectorIdEE6setAllERK10BeeVariant", "__ZN18BeeAbstractGVectorI9NumVectorIdEE6appendERK10BeeVariant", "__ZN18BeeAbstractGVectorI9NumVectorIiEE6setAllERK10BeeVariant", "__ZN18BeeAbstractGVectorI9NumVectorIiEE6appendERK10BeeVariant", "__ZN17BeeAbstractVector6appendERK10BeeVariant", "__ZNK3SVM6Kernel10parametersEv", "__ZNK3SVM15PredictionModel13linearWeightsEv", "__ZNK3SVM15PredictionModel15variableWeightsEv", "__ZN9RangeListIiE11removeRangeEi", "__ZNK15ImobjView_Molob8asStringEv", "__ZNK14ImobjView_Grob8asStringEv", "__ZNK13ImobjView_Map8asStringEv", "__ZNK17ImobjView_Label3D8asStringEv", "__ZNK15ImobjView_Table8asStringEv", "__ZNK20ImobjView_ImageAlbum8asStringEv", "__ZNK19ImobjView_Alignment8asStringEv", "__ZNK9ImobjView8asStringEv", "__ZNK8ChemEval15defaultArgumentEv", "__ZNK10ImChemEval18supportedFunctionsEv", "__ZNK14IcmTableAccess11columnNamesEv", "__ZNK14IcmTableAccess11columnTypesEv", "__ZNK17IcmCollectionEval18supportedFunctionsEv", "__ZNK7IcmEval18supportedFunctionsEv", "__ZNK12IcmTableEval18supportedFunctionsEv", "__ZN18BeeAbstractGVectorI8SequenceE6setAllERK10BeeVariant", "__ZN18BeeAbstractGVectorI8SequenceE6appendERK10BeeVariant", "__ZN18BeeAbstractGVectorI8ChemicalE6setAllERK10BeeVariant", "__ZN18BeeAbstractGVectorI8ChemicalE6appendERK10BeeVariant", "__ZN18BeeAbstractGVectorI8ReactionE6setAllERK10BeeVariant", "__ZN18BeeAbstractGVectorI8ReactionE6appendERK10BeeVariant", "__ZN18BeeAbstractGVectorI8IcmMolobE6setAllERK10BeeVariant", "__ZN18BeeAbstractGVectorI8IcmMolobE6appendERK10BeeVariant", "__ZN18BeeAbstractGVectorI8BeeImageE6setAllERK10BeeVariant", "__ZN18BeeAbstractGVectorI8BeeImageE6appendERK10BeeVariant", "__ZN18BeeAbstractGVectorI9BeeBitSetE6setAllERK10BeeVariant", "__ZN18BeeAbstractGVectorI9BeeBitSetE6appendERK10BeeVariant", "__ZN18BeeAbstractGVectorI15BeeStringVectorE6setAllERK10BeeVariant", "__ZN18BeeAbstractGVectorI15BeeStringVectorE6appendERK10BeeVariant", "__ZN18BeeAbstractGVectorI7BeeDateE6setAllERK10BeeVariant", "__ZN18BeeAbstractGVectorI7BeeDateE6appendERK10BeeVariant", "__ZNK10PatternSetI9BeeStringE20calculateNormSquaresEb", "__ZNK7BeeEval18supportedFunctionsEv", "__Z18convprop_simpleMapP8S_BEE_AT", "__Z22convprop_simpleMendMapP8S_BEE_AT", "__Z11convprop_nHP8S_BEE_AT", "__Z12convprop_qfmP8S_BEE_AT", "__Z14convprop_constP8S_BEE_AT", "__Z11convprop_nRP8S_BEE_AT", "__Z11convprop_spP8S_BEE_AT", "__Z12convprop_hbdP8S_BEE_AT", "__Z12convprop_hbaP8S_BEE_AT", "__Z14convprop_atnboP8S_BEE_AT", "__Z27convprop_simpleMendMapMetalP8S_BEE_AT", "__Z12convprop_sp1P8S_BEE_AT", "__Z12convprop_sp2P8S_BEE_AT", "__Z12convprop_sp3P8S_BEE_AT", "__Z12convprop_atxP8S_BEE_AT", "__Z12convprop_rs3P8S_BEE_AT", "__Z12convprop_rs5P8S_BEE_AT", "__Z12convprop_rs6P8S_BEE_AT", "__Z13prop_atcd_revt", "__Z14prop_athyb_revt", "__Z13prop_atar_revt", "__Z14prop_athyd_revt", "__Z14prop_atrng_revt", "__Z12prop_atp_revt", "__Z14prop_atnbo_revt", "__Z14prop_atchi_revt", "__Z16prop_atsybyl_revt", "__Z14prop_atrsz_revt", "__Z12prop_atq_revt", "__Z16prop_atconst_revt", "__Z12prop_atx_revt", "__Z17prop_atpolhyd_revt", "__Z14prop_atex1_revt", "__Z14prop_atar2_revt", "__Z14prop_atcd2_revt", "__Z14prop_atmod_revt", "__Z13prop_hbda_revt", "__Z12prop_hbd_revt", "__Z12prop_hba_revt", "__Z11prop_aa_revt", "__Z12prop_ph4_revt", "__Z14prop_ph4_rev_2t", "__Z13prop_bobt_revt", "__Z14prop_borng_revt", "__Z14prop_borot_revt", "__Z14prop_boany_revt", "__Z14prop_boaro_revt", "__ZN9ChemFP_PS14accelerateDissEb", "__ZNK13Ph4ConstrEval18supportedFunctionsEv", "__ZNK8ChemEval18supportedFunctionsEv", "__ZNK12AtomChemEval18supportedFunctionsEv", "__ZN14DMatrixCluster11deleteEntryEi", "__ZN14DMatrixCluster17rebuildEntryOrderEP11ClusterTree", "__ZNK9VectorSet20calculateNormSquaresEb", "__ZN8KCluster11deleteEntryEi", "__ZN8KCluster17rebuildEntryOrderEP11ClusterTree", "__ZNK3SVM17Kernel_Polynomial10parametersEv", "__ZNK3SVM13Kernel_Radial10parametersEv", "__ZNK3SVM14Kernel_Sigmoid10parametersEv", "__ZNK3SVM15RegressionModel13linearWeightsEv", "__ZN3SVM9SVMachine11createModelEv", "__ZNK3SVM18SVMPredictionModel13linearWeightsEv", "__ZNK3SVM18ClassifierLabelSet6strataEv", "__ZNK3SVM18ClassifierLabelSet8asStringEv", "__ZNK3SVM8LabelSet6strataEv", "__ZNK3SVM8LabelSet8asStringEv", "__ZNK3SVM18RegressionLabelSet8asStringEv", "__ZN3SVM11SVMRMachine11createModelEv", "__ZN3SVM11SVMCMachine11createModelEv", "__ZNK3SVM18RandomForestCModel15variableWeightsEv", "__ZNK3SVM22RandomForestRegression15variableWeightsEv", "__ZNK11AlphabetU2614cumulativeFreqEv", "__ZNK11AlphabetU2613printAlphabetEv", "__ZN13ASite_SStruct11removeRangeEi", "__ZN7QPlot2D10paintEventEP11QPaintEvent", "__ZN7QPlot2D21mouseDoubleClickEventEP11QMouseEvent", "__ZN7QPlot2D15mousePressEventEP11QMouseEvent", "__ZN7QPlot2D14mouseMoveEventEP11QMouseEvent", "__ZN7QPlot2D17mouseReleaseEventEP11QMouseEvent", "__ZN7QPlot2D10wheelEventEP11QWheelEvent", "__ZN7QPlot2D10setEnabledEb", "__ZNK14QicmTableCurve8asStringEv", "__ZN14QicmTableCurve16refreshFromTableEi", "__ZThn428_NK14QicmTableCurve8asStringEv", "__ZThn428_N14QicmTableCurve16refreshFromTableEi", "__ZNK18QicmTableHistogram8asStringEv", "__ZN18QicmTableHistogram16refreshFromTableEi", "__ZThn304_NK18QicmTableHistogram8asStringEv", "__ZThn304_N18QicmTableHistogram16refreshFromTableEi", "__ZNK19QicmTableMatrixPlot8asStringEv", "__ZN19QicmTableMatrixPlot16refreshFromTableEi", "__ZThn268_NK19QicmTableMatrixPlot8asStringEv", "__ZThn268_N19QicmTableMatrixPlot16refreshFromTableEi", "__ZNK16QicmTableHeatMap8asStringEv", "__ZN16QicmTableHeatMap16refreshFromTableEi", "__ZThn208_NK16QicmTableHeatMap8asStringEv", "__ZThn208_N16QicmTableHeatMap16refreshFromTableEi", "__ZNK19QicmTableScrollPlot9longTitleEv", "__ZN14QIndexTreeView10paintEventEP11QPaintEvent", "__ZN14QIndexTreeView14selectCentroidEP11ClusterTree", "__ZN14QIndexTreeView9drawFrameEP8QPainter", "__ZN14QIndexTreeView29contentsMouseDoubleClickEventEP11QMouseEvent", "__ZN14QIndexTreeView23contentsMousePressEventEP11QMouseEvent", "__ZN14QIndexTreeView22contentsMouseMoveEventEP11QMouseEvent", "__ZN14QIndexTreeView25contentsMouseReleaseEventEP11QMouseEvent", "__ZN14QIndexTreeView15mousePressEventEP11QMouseEvent", "__ZN14QIndexTreeView14mouseMoveEventEP11QMouseEvent", "__ZN14QIndexTreeView17mouseReleaseEventEP11QMouseEvent", "__ZN14QIndexTreeView10wheelEventEP11QWheelEvent", "__ZN14QIndexTreeView14onChangedColorEP11ClusterTree", "__ZN14QIndexTreeView13onMultiActionEb", "__ZN14QIndexTreeView11fireToolTipEP11ClusterTree", "__ZN17QicmIndexTreeView14onChangedColorEP11ClusterTree", "__ZN17QicmIndexTreeView13onMultiActionEb", "__ZN13QChemicalView10paintEventEP11QPaintEvent", "__ZN13QChemicalView11resizeEventEP12QResizeEvent", "__ZNK13QChemicalView8sizeHintEv", "__ZN13QChemicalView17mouseReleaseEventEP11QMouseEvent", "__ZN13QChemicalView15mousePressEventEP11QMouseEvent", "__ZN13QChemicalView14mouseMoveEventEP11QMouseEvent", "__ZN13QChemicalView10wheelEventEP11QWheelEvent", "__ZN17IcmPluginInstance11runCommandsERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE", "__ZN17IcmPluginInstance15runCommandsLiteERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE", "__ZN17IcmPluginInstance20runCommandsUndoStoreERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE", "__ZN10emscripten8internal13MethodInvokerIM17IcmPluginInstanceFvvEvPS2_JEE6invokeERKS4_S5_", "__ZN17IcmPluginInstance13setFullScreenEb", "__ZN17IcmPluginInstance10addToGroupERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE", "__ZN17IcmPluginInstance15removeFromGroupERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE", "__ZN17IcmPluginInstance11pointerDownERKN10emscripten3valE", "__ZN17IcmPluginInstance9pointerUpERKN10emscripten3valE", "__ZN17IcmPluginInstance11pointerMoveERKN10emscripten3valE", "__ZN17IcmPluginInstance9authTokenERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE", "__ZN17IcmPluginInstance10loadModuleERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE", "__ZNK17IcmPluginInstance11pGetVersionEv", "__ZNK17IcmPluginInstance15pGetProjectFileEv", "__ZN17IcmPluginInstance15pSetProjectFileERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE", "__ZN17IcmPluginInstance20pSetProjectSizeLimitEi", "__ZN17IcmPluginInstance18pSetAnaglyphStereoERKb", "__ZN17IcmPluginInstance13pSetNofSlidesERKi", "__ZN17IcmPluginInstance16pSetCurrentSlideERKi", "__ZN17IcmPluginInstance12pSetRockViewERKb", "__ZN17IcmPluginInstance6setFogEb", "__ZN17IcmPluginInstance14setUsePointersEb", "__ZNK17IcmPluginInstance21pGet_onDisplayChange_Ev", "__ZN17IcmPluginInstance21pSet_onDisplayChange_ERKN10emscripten3valE", "__ZNK17IcmPluginInstance19pGet_onLoadProject_Ev", "__ZN17IcmPluginInstance19pSet_onLoadProject_ERKN10emscripten3valE", "__ZNK17IcmPluginInstance18pGet_onTorsionRot_Ev", "__ZN17IcmPluginInstance18pSet_onTorsionRot_ERKN10emscripten3valE", "__ZNK17IcmPluginInstance17currentObjectInfoEv", "__ZNK17IcmPluginInstance6tablesEv", "__ZNK17IcmPluginInstance10alignmentsEv", "__ZNK17IcmPluginInstance6slidesEv", "__ZNK17IcmPluginInstance7objectsEv", "__ZNK17IcmPluginInstance5htmlsEv", "__ZNK17IcmPluginInstance8elementsEv", "__ZNK17IcmPluginInstance8getImageEv", "__ZNK17IcmPluginInstance13loadedModulesEv", "__ZNK17IcmPluginInstance9clickToolEv", "__ZN17IcmPluginInstance12setClickToolERKN10emscripten3valE", "__ZN18IcmPluginAlignment11htmlElementEv", "__ZN10emscripten8internal13MethodInvokerIM18IcmPluginAlignmentFvvEvPS2_JEE6invokeERKS4_S5_", "__ZNK18IcmPluginAlignment9getCanvasEv", "__ZNK18IcmPluginAlignment13getCanvasContEv", "__ZNK18IcmPluginAlignment14getColorSchemeEv", "__ZN18IcmPluginAlignment14setColorSchemeERKN10emscripten3valE", "__ZNK18IcmPluginAlignment16listColorSchemasEv", "__ZNK18IcmPluginAlignment13listSequencesEv", "__ZNK18IcmPluginAlignment10show_rulerEv", "__ZN18IcmPluginAlignment14set_show_rulerERKN10emscripten3valE", "__ZNK18IcmPluginAlignment12show_profileEv", "__ZN18IcmPluginAlignment16set_show_profileERKN10emscripten3valE", "__ZNK18IcmPluginAlignment14show_consensusEv", "__ZN18IcmPluginAlignment18set_show_consensusERKN10emscripten3valE", "__ZNK18IcmPluginAlignment9seq_rulerEv", "__ZN18IcmPluginAlignment13set_seq_rulerERKN10emscripten3valE", "__ZN14IcmPluginTable11htmlElementEv", "__ZN10emscripten8internal13MethodInvokerIM14IcmPluginTableFvvEvPS2_JEE6invokeERKS4_S5_", "__ZN14IcmPluginTable11runCommandsERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE", "__ZN14IcmPluginTable15setDisplayStyleEi", "__ZN14IcmPluginTable8drawPlotEi", "__ZN14IcmPluginTable10updatePlotEi", "__ZN14IcmPluginTable13updateClusterEi", "__ZNK14IcmPluginTable5plotsEv", "__ZNK14IcmPluginTable7clusterEv", "__ZNK14IcmPluginTable12selectedRowsEv", "__ZN10emscripten8internal13MethodInvokerIM13IcmPluginPlotFvvEvPS2_JEE6invokeERKS4_S5_", "__ZN13IcmPluginPlot15mousePressEventERKN10emscripten3valE", "__ZN13IcmPluginPlot17mouseReleaseEventERKN10emscripten3valE", "__ZN13IcmPluginPlot14mouseMoveEventERKN10emscripten3valE", "__ZN13IcmPluginPlot10wheelEventERKN10emscripten3valE", "__ZNK13IcmPluginPlot8onselectEv", "__ZN13IcmPluginPlot12set_onselectERKN10emscripten3valE", "__ZNK13IcmPluginPlot7onclickEv", "__ZN13IcmPluginPlot11set_onclickERKN10emscripten3valE", "__ZNK13IcmPluginPlot11onmouseoverEv", "__ZN13IcmPluginPlot15set_onmouseoverERKN10emscripten3valE", "__ZN13IcmPluginPlot10setIsDirtyEb", "__ZNK13IcmPluginPlot8plotDataEv", "__ZN13IcmPluginPlot12set_plotDataERKN10emscripten3valE", "__ZNK13IcmPluginPlot9selectionEv", "__ZN13IcmPluginPlot12setSelectionERKN10emscripten3valE", "__ZNK13IcmPluginPlot6canvasEv", "__ZN10emscripten8internal13MethodInvokerIM21IcmPluginChemicalViewFvvEvPS2_JEE6invokeERKS4_S5_", "__ZN21IcmPluginChemicalView15mousePressEventERKN10emscripten3valE", "__ZN21IcmPluginChemicalView17mouseReleaseEventERKN10emscripten3valE", "__ZN21IcmPluginChemicalView14mouseMoveEventERKN10emscripten3valE", "__ZN21IcmPluginChemicalView10wheelEventERKN10emscripten3valE", "__ZN21IcmPluginChemicalView10setIsDirtyEb", "__ZNK21IcmPluginChemicalView6canvasEv", "__ZNK16ChemicalInstance7toInCHIEv", "__ZNK16ChemicalInstance9iupacNameEv", "__ZNK16ChemicalInstance7formulaEv", "__ZNK16ChemicalInstance5atomsEv", "__ZNK16ChemicalInstance5bondsEv", "__ZNK16ChemicalInstance5ringsEv", "__ZNK16ChemicalInstance11annotationsEv", "__ZNK16ReactionInstance8toSmilesEv", "__ZNK16ReactionInstance5toMolEv", "__ZL12png_xv_errorP14png_struct_defPKc", "__ZL14png_xv_warningP14png_struct_defPKc", "_png_destroy_write_struct", "__ZN9BeeStringC2EPKc", "_png_init_io", "_png_set_compression_level", "_png_write_info", "_png_error", "_png_write_row", "_png_convert_from_time_t", "_png_write_end", "__ZN3SVM11BayesCModel9makeModelER11URefPointerINS_14PredictionDataEE", "_zcfree", "_png_free", "_png_warning", "_png_zfree", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"];
var debug_table_viid = ["0", "__ZN15DMatrixExport_F9setAtDiagEid"];
var debug_table_viii = ["0", "__ZN18IcmPluginInterface7readURLERK9BeeString", "__ZNSt3__210__function6__funcIZN13IcmPluginPlot12set_plotDataERKN10emscripten3valEE3__0NS_9allocatorIS7_EEFvP9QPlotItemRK9BeeBitSetEEclEOSB_SE_", "__ZNSt3__210__function6__funcIZN13IcmPluginPlot12set_plotDataERKN10emscripten3valEE3__1NS_9allocatorIS7_EEFviiEEclEOiSC_", "__ZNSt3__210__function6__funcIZN14IcmPluginTable10createPlotEiRKN10emscripten3valEE3__4NS_9allocatorIS7_EEFvP9QPlotItemRK9BeeBitSetEEclEOSB_SE_", "__ZNK10PatternSetI9BeeBitSetE12colAsRVectorEi", "__ZNK10PatternSetI9NumVectorIfEE12colAsRVectorEi", "__ZNK14MixedVectorSet12colAsRVectorEi", "__ZNK10PatternSetI12SparseVectorIidEE12colAsRVectorEi", "__ZNK10PatternSetI12SparseVectorIiiEE12colAsRVectorEi", "__ZNK10PatternSetI9NumVectorIiEE12colAsRVectorEi", "__ZNK10PatternSetI9NumVectorIdEE12colAsRVectorEi", "__ZN5ArrayI10S_RGP_COMBE8insertAtEiRKS0_", "__ZN5ArrayIiE8insertAtEiRKi", "__ZN5ArrayIP12IMTableEntryE8insertAtEiRKS1_", "__ZNK18BeeAbstractGVectorI9NumVectorIdEE2atEi", "__ZN18BeeAbstractGVectorI9NumVectorIdEE6qSetAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI9NumVectorIdEE11resizeSetAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI9NumVectorIdEE8insertAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI9NumVectorIdEE6removeEii", "__ZNK18BeeAbstractGVectorI9NumVectorIiEE2atEi", "__ZN18BeeAbstractGVectorI9NumVectorIiEE6qSetAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI9NumVectorIiEE11resizeSetAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI9NumVectorIiEE8insertAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI9NumVectorIiEE6removeEii", "__ZN13IcmFuncSearch20findGlobalPreferenceERK9BeeString", "__ZN5ArrayI7BeePairIi9BeeStringEE8insertAtEiRKS2_", "__ZN5ArrayIPdE8insertAtEiRKS0_", "__ZN5ArrayIPfE8insertAtEiRKS0_", "__ZN5ArrayIPvE8insertAtEiRKS0_", "__ZN5ArrayI7BeePairIiiEE8insertAtEiRKS1_", "__ZNK18BeeAbstractGVectorI8SequenceE2atEi", "__ZN18BeeAbstractGVectorI8SequenceE6qSetAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI8SequenceE11resizeSetAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI8SequenceE8insertAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI8SequenceE6removeEii", "__ZNK18BeeAbstractGVectorI8ChemicalE2atEi", "__ZN18BeeAbstractGVectorI8ChemicalE6qSetAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI8ChemicalE11resizeSetAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI8ChemicalE8insertAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI8ChemicalE6removeEii", "__ZNK18BeeAbstractGVectorI8ReactionE2atEi", "__ZN18BeeAbstractGVectorI8ReactionE6qSetAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI8ReactionE11resizeSetAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI8ReactionE8insertAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI8ReactionE6removeEii", "__ZNK18BeeAbstractGVectorI8IcmMolobE2atEi", "__ZN18BeeAbstractGVectorI8IcmMolobE6qSetAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI8IcmMolobE11resizeSetAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI8IcmMolobE8insertAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI8IcmMolobE6removeEii", "__ZNK18BeeAbstractGVectorI8BeeImageE2atEi", "__ZN18BeeAbstractGVectorI8BeeImageE6qSetAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI8BeeImageE11resizeSetAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI8BeeImageE8insertAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI8BeeImageE6removeEii", "__ZNK18BeeAbstractGVectorI9BeeBitSetE2atEi", "__ZN18BeeAbstractGVectorI9BeeBitSetE6qSetAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI9BeeBitSetE11resizeSetAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI9BeeBitSetE8insertAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI9BeeBitSetE6removeEii", "__ZNK18BeeAbstractGVectorI15BeeStringVectorE2atEi", "__ZN18BeeAbstractGVectorI15BeeStringVectorE6qSetAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI15BeeStringVectorE11resizeSetAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI15BeeStringVectorE8insertAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI15BeeStringVectorE6removeEii", "__ZNK18BeeAbstractGVectorI7BeeDateE2atEi", "__ZN18BeeAbstractGVectorI7BeeDateE6qSetAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI7BeeDateE11resizeSetAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI7BeeDateE8insertAtEiRK10BeeVariant", "__ZN18BeeAbstractGVectorI7BeeDateE6removeEii", "__ZNK10PatternSetI9BeeStringE12colAsRVectorEi", "__ZN10FuncSearch20findGlobalPreferenceERK9BeeString", "__ZN5ArrayI5S_ALSE8insertAtEiRKS0_", "__ZN5ArrayI12S_TEXT_ENTRYE8insertAtEiRKS0_", "__ZN5ArrayI5S_PRII8S_BEE_ATEE8insertAtEiRKS2_", "__ZN5ArrayIP8S_BEE_ATE8insertAtEiRKS1_", "__ZN5ArrayIP4S_BOE8insertAtEiRKS1_", "__ZN5ArrayIjE8insertAtEiRKj", "__ZN5ArrayIP14S_AT_TREE_NODEE8insertAtEiRKS1_", "__ZN5ArrayIP15S_CHEMICAL_RINGE8insertAtEiRKS1_", "__ZN5ArrayI11ring_structE8insertAtEiRKS0_", "__ZN5ArrayI9S_UPAC_BRE8insertAtEiRKS0_", "__ZN5ArrayIP18mol_fpchain_stat_tE8insertAtEiRKS1_", "__ZN5ArrayItE8insertAtEiRKt", "__ZNK9VectorSet12colAsRVectorEi", "__ZN3SVM11KernelCacheIfE11swapIndicesEii", "__ZN3SVM15KernelCacheFullIfE11swapIndicesEii", "__ZN3SVM17KernelCacheNormalIfE11swapIndicesEii", "__ZNK3SVM18ClassifierLabelSet12copyElementsERK9NumVectorIiE", "__ZN3SVM18ClassifierLabelSet14assignToSubSetERK6SubSetPKNS_8LabelSetE", "__ZNK3SVM18ClassifierLabelSet14getStatsVectorEP15BeeStringVector", "__ZNK3SVM8LabelSet12copyElementsERK9NumVectorIiE", "__ZN3SVM8LabelSet14assignToSubSetERK6SubSetPKS0_", "__ZNK3SVM8LabelSet14getStatsVectorEP15BeeStringVector", "__ZNK3SVM18MultiClassLabelSet12copyElementsERK9NumVectorIiE", "__ZN3SVM18MultiClassLabelSet14assignToSubSetERK6SubSetPKNS_8LabelSetE", "__ZNK3SVM23MultiClassMultiLabelSet12copyElementsERK9NumVectorIiE", "__ZN3SVM23MultiClassMultiLabelSet14assignToSubSetERK6SubSetPKNS_8LabelSetE", "__ZNK3SVM18RegressionLabelSet12copyElementsERK9NumVectorIiE", "__ZN3SVM18RegressionLabelSet14assignToSubSetERK6SubSetPKNS_8LabelSetE", "__ZNK3SVM18RegressionLabelSet14getStatsVectorEP15BeeStringVector", "__ZNK3SVM23MultiRegressionLabelSet12copyElementsERK9NumVectorIiE", "__ZN3SVM23MultiRegressionLabelSet14assignToSubSetERK6SubSetPKNS_8LabelSetE", "__ZNK11AlphabetU268toStringERK9NumVectorIcE", "__ZNK7QPlot2D10scrToWorldERK6WPoint", "__ZNK7QPlot2D10worldToScrERK6WPoint", "__ZNK7QPlot2D10scrToWorldERK5WRect", "__ZNK7QPlot2D10worldToScrERK5WRect", "__ZNK10QPlotCurve6boundsERK9BeeBitSet", "__ZN10QPlotCurve10selectRectERK5WRect13SelectionMode", "__ZN10QPlotCurve4drawEP8QPainterRK5WRect", "__ZNK10QPlotCurve16findElementsRectERK5WRect", "__ZN10QPlotCurve7elementEi", "__ZN10QPlotCurve18storeLabelPositionEiRK10BeeVariant", "__ZNK10QPlotCurve13labelPositionEi", "__ZNK14QPlotHistogram6boundsERK9BeeBitSet", "__ZN14QPlotHistogram10selectRectERK5WRect13SelectionMode", "__ZN14QPlotHistogram4drawEP8QPainterRK5WRect", "__ZNK9QPlotItem16findElementsRectERK5WRect", "__ZN9QPlotItem7elementEi", "__ZNK12QPlotHeatMap6boundsERK9BeeBitSet", "__ZN12QPlotHeatMap10selectRectERK5WRect13SelectionMode", "__ZN12QPlotHeatMap4drawEP8QPainterRK5WRect", "__ZNK11QPlotMatrix6boundsERK9BeeBitSet", "__ZN9QPlotItem10selectRectERK5WRect13SelectionMode", "__ZN11QPlotMatrix4drawEP8QPainterRK5WRect", "__ZNK9QPlotArea6boundsERK9BeeBitSet", "__ZN9QPlotArea4drawEP8QPainterRK5WRect", "__ZN14QicmTableCurve18storeLabelPositionEiRK10BeeVariant", "__ZNK14QicmTableCurve13labelPositionEi", "__ZN14QicmTableCurve12initFromListERK15BeeStringVectori", "__ZThn428_N14QicmTableCurve12initFromListERK15BeeStringVectori", "__ZN18QicmTableHistogram12initFromListERK15BeeStringVectori", "__ZThn304_N18QicmTableHistogram12initFromListERK15BeeStringVectori", "__ZN19QicmTableMatrixPlot12initFromListERK15BeeStringVectori", "__ZThn268_N19QicmTableMatrixPlot12initFromListERK15BeeStringVectori", "__ZN16QicmTableHeatMap12initFromListERK15BeeStringVectori", "__ZThn208_N16QicmTableHeatMap12initFromListERK15BeeStringVectori", "__ZN14QIndexTreeView23onChangedEntrySelectionEib", "__ZN17QicmIndexTreeView23onChangedEntrySelectionEib", "__Z22readBinaryOnLoadPluginPvS_i", "__Z22callScriptOnLoadPluginPvS_i", "__ZN10emscripten8internal13MethodInvokerIM17IcmPluginInstanceFvRKNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEEvPS2_JSB_EE6invokeERKSD_SE_PNS0_11BindingTypeIS9_EUt_E", "__ZN17IcmPluginInstance16runCommandsValueERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE", "__ZN17IcmPluginInstance11getShellVarERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE", "__ZN17IcmPluginInstance11isDisplayedERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE", "__ZN17IcmPluginInstance18updateCanvasLayoutEii", "__ZN10emscripten8internal13MethodInvokerIM17IcmPluginInstanceFvbEvPS2_JbEE6invokeERKS4_S5_b", "__ZN10emscripten8internal13MethodInvokerIM17IcmPluginInstanceFvRKNS_3valEEvPS2_JS5_EE6invokeERKS7_S8_PNS0_7_EM_VALE", "__ZN17IcmPluginInstance16authUserPasswordERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEES8_", "__ZNK17IcmPluginInstance17filteredMoleculesERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE", "__ZNK17IcmPluginInstance15filteredObjectsERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE", "__ZN10emscripten8internal12SetterPolicyIM17IcmPluginInstanceFvRKNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEEE3setIS2_EEvRKSD_RT_PNS0_11BindingTypeIS9_EUt_E", "__ZN10emscripten8internal12SetterPolicyIM17IcmPluginInstanceFviEE3setIS2_EEvRKS4_RT_i", "__ZN10emscripten8internal12SetterPolicyIM17IcmPluginInstanceFvRKbEE3setIS2_EEvRKS6_RT_b", "__ZN10emscripten8internal12SetterPolicyIM17IcmPluginInstanceFvRKiEE3setIS2_EEvRKS6_RT_i", "__ZN10emscripten8internal12SetterPolicyIM17IcmPluginInstanceFvbEE3setIS2_EEvRKS4_RT_b", "__ZN10emscripten8internal12SetterPolicyIM17IcmPluginInstanceFvRKNS_3valEEE3setIS2_EEvRKS7_RT_PNS0_7_EM_VALE", "__ZNK18IcmPluginAlignment9getAliPosERKN10emscripten3valE", "__ZNK18IcmPluginAlignment12getInfoAtPosERKN10emscripten3valE", "__ZN18IcmPluginAlignment11doSelectionERKN10emscripten3valES3_", "__ZN10emscripten8internal12SetterPolicyIM18IcmPluginAlignmentFvRKNS_3valEEE3setIS2_EEvRKS7_RT_PNS0_7_EM_VALE", "__Z21readBinaryOnLoadMacroPvS_i", "__Z20readModuleOnLoadFilePvS_i", "__ZN14IcmPluginTable12resizeColumnEii", "__ZN14IcmPluginTable9resizeRowEii", "__ZNK14IcmPluginTable10columnInfoEi", "__ZN10emscripten8internal13MethodInvokerIM14IcmPluginTableFvRKNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEEvPS2_JSB_EE6invokeERKSD_SE_PNS0_11BindingTypeIS9_EUt_E", "__ZN10emscripten8internal13MethodInvokerIM14IcmPluginTableFviEvPS2_JiEE6invokeERKS4_S5_i", "__ZN14IcmPluginTable10createPlotEiRKN10emscripten3valE", "__ZN14IcmPluginTable13createClusterEiRKN10emscripten3valE", "__ZN14IcmPluginTable11drawClusterEiRKN10emscripten3valE", "__ZNK14IcmPluginTable9plotTitleEi", "__ZN14IcmPluginTable19plotMousePressEventEiRKN10emscripten3valE", "__ZN14IcmPluginTable21plotMouseReleaseEventEiRKN10emscripten3valE", "__ZN14IcmPluginTable18plotMouseMoveEventEiRKN10emscripten3valE", "__ZN14IcmPluginTable14plotWheelEventEiRKN10emscripten3valE", "__ZN14IcmPluginTable22clusterMousePressEventEiRKN10emscripten3valE", "__ZN14IcmPluginTable24clusterMouseReleaseEventEiRKN10emscripten3valE", "__ZN14IcmPluginTable21clusterMouseMoveEventEiRKN10emscripten3valE", "__ZN14IcmPluginTable17clusterWheelEventEiRKN10emscripten3valE", "__ZN13IcmPluginPlot6resizeEii", "__ZN13IcmPluginPlot12resizeCanvasERKN10emscripten3valES3_", "__ZN10emscripten8internal13MethodInvokerIM13IcmPluginPlotFvRKNS_3valEEvPS2_JS5_EE6invokeERKS7_S8_PNS0_7_EM_VALE", "__ZN10emscripten8internal12SetterPolicyIM13IcmPluginPlotFvRKNS_3valEEE3setIS2_EEvRKS7_RT_PNS0_7_EM_VALE", "__ZN10emscripten8internal12SetterPolicyIM13IcmPluginPlotFvbEE3setIS2_EEvRKS4_RT_b", "__ZN21IcmPluginChemicalView6resizeEii", "__ZN21IcmPluginChemicalView12resizeCanvasERKN10emscripten3valES3_", "__ZN10emscripten8internal13MethodInvokerIM21IcmPluginChemicalViewFvRKNS_3valEEvPS2_JS5_EE6invokeERKS7_S8_PNS0_7_EM_VALE", "__ZN10emscripten8internal12SetterPolicyIM21IcmPluginChemicalViewFvbEE3setIS2_EEvRKS4_RT_b", "__ZNK16ChemicalInstance8toSmilesEb", "__ZNK16ChemicalInstance5toMolEb", "__ZL19obinstream_write_fnP14png_struct_defPhm", "__ZL18ibinstream_read_fnP14png_struct_defPhm", "_png_set_filter", "_png_set_tIME", "__Z7eq_gradPdS_Pv", "__Z12ef_NormalizeRK16BeeVariantVectorR13FuncMessageIO", "__Z7ef_RealRK16BeeVariantVectorR13FuncMessageIO", "__Z10ef_IntegerRK16BeeVariantVectorR13FuncMessageIO", "__Z9ef_StringRK16BeeVariantVectorR13FuncMessageIO", "__Z7ef_DateRK16BeeVariantVectorR13FuncMessageIO", "__Z6ef_MinRK16BeeVariantVectorR13FuncMessageIO", "__Z6ef_MaxRK16BeeVariantVectorR13FuncMessageIO", "__Z7ef_MeanRK16BeeVariantVectorR13FuncMessageIO", "__Z7ef_RmsdRK16BeeVariantVectorR13FuncMessageIO", "__Z6ef_SumRK16BeeVariantVectorR13FuncMessageIO", "__Z7ef_CeilRK16BeeVariantVectorR13FuncMessageIO", "__Z8ef_FloorRK16BeeVariantVectorR13FuncMessageIO", "__Z7ef_SignRK16BeeVariantVectorR13FuncMessageIO", "__Z6ef_LogRK16BeeVariantVectorR13FuncMessageIO", "__Z7ef_SqrtRK16BeeVariantVectorR13FuncMessageIO", "__Z6ef_PowRK16BeeVariantVectorR13FuncMessageIO", "__Z8ef_SplitRK16BeeVariantVectorR13FuncMessageIO", "__Z6ef_NofRK16BeeVariantVectorR13FuncMessageIO", "__Z12ef_MolWeightRK16BeeVariantVectorR13FuncMessageIO", "__Z13ef_MolFormulaRK16BeeVariantVectorR13FuncMessageIO", "__Z12ef_IupacNameRK16BeeVariantVectorR13FuncMessageIO", "__Z16ef_Nof_MoleculesRK16BeeVariantVectorR13FuncMessageIO", "__Z12ef_Nof_AtomsRK16BeeVariantVectorR13FuncMessageIO", "__Z16ef_Nof_FragmentsRK16BeeVariantVectorR13FuncMessageIO", "__Z14ef_Nof_ChiralsRK16BeeVariantVectorR13FuncMessageIO", "__Z11ef_Nof_RotBRK16BeeVariantVectorR13FuncMessageIO", "__Z10ef_Nof_HBARK16BeeVariantVectorR13FuncMessageIO", "__Z10ef_Nof_HBDRK16BeeVariantVectorR13FuncMessageIO", "__Z12ef_Nof_RingsRK16BeeVariantVectorR13FuncMessageIO", "__Z16ef_Max_Ring_SizeRK16BeeVariantVectorR13FuncMessageIO", "__Z16ef_Min_Ring_SizeRK16BeeVariantVectorR13FuncMessageIO", "__Z18ef_Max_Fused_RingsRK16BeeVariantVectorR13FuncMessageIO", "__Z13ef_IsAromaticRK16BeeVariantVectorR13FuncMessageIO", "__Z14ef_IsAliphaticRK16BeeVariantVectorR13FuncMessageIO", "__Z9ef_SmilesRK16BeeVariantVectorR13FuncMessageIO", "__Z10ef_MolLogPRK16BeeVariantVectorR13FuncMessageIO", "__Z10ef_MolLogDRK16BeeVariantVectorR13FuncMessageIO", "__Z10ef_MolLogSRK16BeeVariantVectorR13FuncMessageIO", "__Z12ef_MolVolumeRK16BeeVariantVectorR13FuncMessageIO", "__Z9ef_MoldHfRK16BeeVariantVectorR13FuncMessageIO", "__Z9ef_MolPSARK16BeeVariantVectorR13FuncMessageIO", "__Z10ef_MolAreaRK16BeeVariantVectorR13FuncMessageIO", "__Z15ef_DrugLikenessRK16BeeVariantVectorR13FuncMessageIO", "__Z11ef_MolSynthRK16BeeVariantVectorR13FuncMessageIO", "__Z10ef_MolhERGRK16BeeVariantVectorR13FuncMessageIO", "__Z14ef_MolHalfLifeRK16BeeVariantVectorR13FuncMessageIO", "__Z11ef_MolPAINSRK16BeeVariantVectorR13FuncMessageIO", "__Z12ef_MolChargeRK16BeeVariantVectorR13FuncMessageIO", "__Z9ef_pKa_maRK16BeeVariantVectorR13FuncMessageIO", "__Z9ef_pKa_mbRK16BeeVariantVectorR13FuncMessageIO", "__Z11ef_NofSitesRK16BeeVariantVectorR13FuncMessageIO", "__Z14b_convprop_rs3P4S_BOP12ChemicalData", "__Z14b_convprop_rs5P4S_BOP12ChemicalData", "__Z14b_convprop_rs6P4S_BOP12ChemicalData", "__Z14b_convprop_rs7P4S_BOP12ChemicalData", "__Z14b_convprop_rsXP4S_BOP12ChemicalData", "__ZN3__08__invokeEP4S_BOP12ChemicalData", "__ZN3__18__invokeEP4S_BOP12ChemicalData", "__ZN3__28__invokeEP4S_BOP12ChemicalData", "__ZN3__38__invokeEP4S_BOP12ChemicalData", "__ZN3__48__invokeEP4S_BOP12ChemicalData", "_png_default_read_data", "_png_destroy_struct_2", "_png_set_read_fn", "_png_default_write_data", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"];
var debug_table_viiid = ["0", "__ZN15DMatrixExport_F5setAtEiid", "__ZN15DMatrixExport_F9setSymmAtEiid", "0"];
var debug_table_viiidd = ["0", "__ZN3SVM11SVMRMachine11updateGradWEiidd", "__ZN3SVM11SVMCMachine11updateGradWEiidd", "0"];
var debug_table_viiii = ["0", "__ZN17IcmPluginInstance13atomPopupMenuEP5S_AT_ii", "__ZN18IcmPluginInterface15getOpenFileNameERK9BeeStringPKc", "__ZN18IcmPluginInterface15getSaveFileNameERK9BeeStringPKc", "__ZNK10FilterEval5funcIEiRK16BeeVariantVector", "__ZN18IcmPluginInterface13atomPopupMenuEP5S_AT_ii", "__ZNK18BeeAbstractGVectorI9NumVectorIdEE3midEii", "__ZNK18BeeAbstractGVectorI9NumVectorIiEE3midEii", "__ZN3SVM13SimpleMachine9bareLearnER11URefPointerINS_14PredictionDataEEb", "__ZNK10ImChemEval5funcIEiRK16BeeVariantVector", "__ZNK17IcmCollectionEval5funcIEiRK16BeeVariantVector", "__ZNK7IcmEval5funcIEiRK16BeeVariantVector", "__ZNK12IcmTableEval5funcIEiRK16BeeVariantVector", "__ZNK18BeeAbstractGVectorI8SequenceE3midEii", "__ZNK18BeeAbstractGVectorI8ChemicalE3midEii", "__ZNK18BeeAbstractGVectorI8ReactionE3midEii", "__ZNK18BeeAbstractGVectorI8IcmMolobE3midEii", "__ZNK18BeeAbstractGVectorI8BeeImageE3midEii", "__ZNK18BeeAbstractGVectorI9BeeBitSetE3midEii", "__ZNK18BeeAbstractGVectorI15BeeStringVectorE3midEii", "__ZNK18BeeAbstractGVectorI7BeeDateE3midEii", "__ZNK17BeeVariantRowEval5funcIEiRK16BeeVariantVector", "__ZNK11BeeFuncEval5funcIEiRK16BeeVariantVector", "__ZNK7BeeEval5funcIEiRK16BeeVariantVector", "__ZNK13Ph4ConstrEval5funcIEiRK16BeeVariantVector", "__ZNK14FragFilterEval5funcIEiRK16BeeVariantVector", "__ZNK8ChemEval5funcIEiRK16BeeVariantVector", "__ZNK12AtomChemEval5funcIEiRK16BeeVariantVector", "__ZN3SVM11PLSRMachine9bareLearnER11URefPointerINS_14PredictionDataEEb", "__ZN3SVM11SVMRMachine9bareLearnER11URefPointerINS_14PredictionDataEEb", "__ZN3SVM10PCRMachine9bareLearnER11URefPointerINS_14PredictionDataEEb", "__ZN3SVM11SVMCMachine9bareLearnER11URefPointerINS_14PredictionDataEEb", "__ZN11AlphabetU2610fromStringEPKci", "__ZNK16SequenceSiteEval5funcIEiRK16BeeVariantVector", "__ZN10QPlotCurve13selectElementEibi", "__ZN14QPlotHistogram13selectElementEibi", "__ZN9QPlotItem13selectElementEibi", "__ZN14QIndexTreeView14onChangedOrderEP11ClusterTreePKii", "__ZN17QicmIndexTreeView14onChangedOrderEP11ClusterTreePKii", "__ZNK16ClusterTableEval5funcIEiRK16BeeVariantVector", "__ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi", "__ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi", "__ZNK10__cxxabiv121__vmi_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi", "__ZN10emscripten8internal13MethodInvokerIM17IcmPluginInstanceFviiEvPS2_JiiEE6invokeERKS4_S5_ii", "__ZN10emscripten8internal13MethodInvokerIM17IcmPluginInstanceFvRKNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEESB_EvPS2_JSB_SB_EE6invokeERKSD_SE_PNS0_11BindingTypeIS9_EUt_ESL_", "__ZN10emscripten8internal13MethodInvokerIM18IcmPluginAlignmentFvRKNS_3valES5_EvPS2_JS5_S5_EE6invokeERKS7_S8_PNS0_7_EM_VALESD_", "__Z22authUserPasswordOnLoadjPvS_j", "__Z23authUserPasswordOnErrorjPviPKc", "__Z15authTokenOnLoadjPvS_j", "__Z14authTokenErrorjPviPKc", "__ZN10emscripten8internal13MethodInvokerIM14IcmPluginTableFviiEvPS2_JiiEE6invokeERKS4_S5_ii", "__ZNK14IcmPluginTable9elementAtERKN10emscripten3valES3_", "__ZN10emscripten8internal13MethodInvokerIM14IcmPluginTableFviRKNS_3valEEvPS2_JiS5_EE6invokeERKS7_S8_iPNS0_7_EM_VALE", "__ZN10emscripten8internal13MethodInvokerIM13IcmPluginPlotFviiEvPS2_JiiEE6invokeERKS4_S5_ii", "__ZN10emscripten8internal13MethodInvokerIM13IcmPluginPlotFvRKNS_3valES5_EvPS2_JS5_S5_EE6invokeERKS7_S8_PNS0_7_EM_VALESD_", "__ZN10emscripten8internal13MethodInvokerIM21IcmPluginChemicalViewFviiEvPS2_JiiEE6invokeERKS4_S5_ii", "__ZN10emscripten8internal13MethodInvokerIM21IcmPluginChemicalViewFvRKNS_3valES5_EvPS2_JS5_S5_EE6invokeERKS7_S8_PNS0_7_EM_VALESD_", "_png_set_write_fn", "_png_set_PLTE", "_png_set_text", "_png_set_mem_fn", "_png_set_error_fn", "0", "0"];
var debug_table_viiiii = ["0", "__ZNK9VectorSet11fillDissRowEiPdii", "__ZNK9VectorSet11fillDissRowEiPfii", "__ZNK9ChemFP_PS11fillDissRowEiPdii", "__ZNK9ChemFP_PS11fillDissRowEiPfii", "__ZNK18UpperDimtVectorSetIfE11fillDissRowEiPdii", "__ZNK18UpperDimtVectorSetIfE11fillDissRowEiPfii", "__ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib", "__ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib", "__ZNK10__cxxabiv121__vmi_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib", "__ZN14IcmPluginTable13selectColumnsEiibb", "__ZN14IcmPluginTable10selectRowsEiibb", "__ZN8BeeImage8setImageE12BeeImageTypeiiRK9BeeString", "_png_set_filter_heuristics", "0", "0"];
var debug_table_viiiiii = ["0", "__ZN17IcmPluginInstance13distPopupMenuEP9S_VAPTAY_iiii", "__ZN18IcmPluginInterface13distPopupMenuEP9S_VAPTAY_iiii", "__ZN14QIndexTreeView12drawContentsEP8QPainteriiii", "__ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib", "__ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib", "__ZNK10__cxxabiv121__vmi_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib", "__ZN10emscripten8internal13MethodInvokerIM14IcmPluginTableFviibbEvPS2_JiibbEE6invokeERKS4_S5_iibb"];
var debug_table_viiiiiiiii = ["0", "_png_set_IHDR"];
var debug_table_viij = ["0", "__ZN17IcmPluginInstance19redrawControlNoLockEby", "__ZN18IcmPluginInterface19redrawControlNoLockEby", "0"];

function nullFunc_dd(x) {
    err("Invalid function pointer '" + x + "' called with signature 'dd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: di: " + debug_table_di[x] + "  dii: " + debug_table_dii[x] + "  iid: " + debug_table_iid[x] + "  vid: " + debug_table_vid[x] + "  i: " + debug_table_i[x] + "  v: " + debug_table_v[x] + "  ii: " + debug_table_ii[x] + "  vi: " + debug_table_vi[x] + "  diii: " + debug_table_diii[x] + "  iidi: " + debug_table_iidi[x] + "  iiid: " + debug_table_iiid[x] + "  viid: " + debug_table_viid[x] + "  iif: " + debug_table_iif[x] + "  iii: " + debug_table_iii[x] + "  iij: " + debug_table_iij[x] + "  vii: " + debug_table_vii[x] + "  diiii: " + debug_table_diiii[x] + "  viiidd: " + debug_table_viiidd[x] + "  iiidi: " + debug_table_iiidi[x] + "  viiid: " + debug_table_viiid[x] + "  iiii: " + debug_table_iiii[x] + "  viii: " + debug_table_viii[x] + "  viij: " + debug_table_viij[x] + "  diiiii: " + debug_table_diiiii[x] + "  iiiii: " + debug_table_iiiii[x] + "  viiii: " + debug_table_viiii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  viiiii: " + debug_table_viiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_di(x) {
    err("Invalid function pointer '" + x + "' called with signature 'di'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: dii: " + debug_table_dii[x] + "  diii: " + debug_table_diii[x] + "  diiii: " + debug_table_diiii[x] + "  diiiii: " + debug_table_diiiii[x] + "  i: " + debug_table_i[x] + "  dd: " + debug_table_dd[x] + "  ii: " + debug_table_ii[x] + "  vi: " + debug_table_vi[x] + "  iidi: " + debug_table_iidi[x] + "  iid: " + debug_table_iid[x] + "  iif: " + debug_table_iif[x] + "  iii: " + debug_table_iii[x] + "  iij: " + debug_table_iij[x] + "  vid: " + debug_table_vid[x] + "  vii: " + debug_table_vii[x] + "  v: " + debug_table_v[x] + "  iiidi: " + debug_table_iiidi[x] + "  iiid: " + debug_table_iiid[x] + "  iiii: " + debug_table_iiii[x] + "  viid: " + debug_table_viid[x] + "  viii: " + debug_table_viii[x] + "  viij: " + debug_table_viij[x] + "  iiiii: " + debug_table_iiiii[x] + "  viiid: " + debug_table_viiid[x] + "  viiii: " + debug_table_viiii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  viiidd: " + debug_table_viiidd[x] + "  viiiii: " + debug_table_viiiii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_dii(x) {
    err("Invalid function pointer '" + x + "' called with signature 'dii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: di: " + debug_table_di[x] + "  diii: " + debug_table_diii[x] + "  diiii: " + debug_table_diiii[x] + "  diiiii: " + debug_table_diiiii[x] + "  ii: " + debug_table_ii[x] + "  iii: " + debug_table_iii[x] + "  vii: " + debug_table_vii[x] + "  iid: " + debug_table_iid[x] + "  iif: " + debug_table_iif[x] + "  iij: " + debug_table_iij[x] + "  i: " + debug_table_i[x] + "  dd: " + debug_table_dd[x] + "  vi: " + debug_table_vi[x] + "  iiid: " + debug_table_iiid[x] + "  iiii: " + debug_table_iiii[x] + "  viid: " + debug_table_viid[x] + "  viii: " + debug_table_viii[x] + "  viij: " + debug_table_viij[x] + "  iidi: " + debug_table_iidi[x] + "  vid: " + debug_table_vid[x] + "  iiidi: " + debug_table_iiidi[x] + "  iiiii: " + debug_table_iiiii[x] + "  viiid: " + debug_table_viiid[x] + "  viiii: " + debug_table_viiii[x] + "  v: " + debug_table_v[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  viiidd: " + debug_table_viiidd[x] + "  viiiii: " + debug_table_viiiii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_diii(x) {
    err("Invalid function pointer '" + x + "' called with signature 'diii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: dii: " + debug_table_dii[x] + "  di: " + debug_table_di[x] + "  diiii: " + debug_table_diiii[x] + "  diiiii: " + debug_table_diiiii[x] + "  iii: " + debug_table_iii[x] + "  ii: " + debug_table_ii[x] + "  iiii: " + debug_table_iiii[x] + "  viii: " + debug_table_viii[x] + "  iidi: " + debug_table_iidi[x] + "  iiid: " + debug_table_iiid[x] + "  vii: " + debug_table_vii[x] + "  iid: " + debug_table_iid[x] + "  iif: " + debug_table_iif[x] + "  iij: " + debug_table_iij[x] + "  dd: " + debug_table_dd[x] + "  vi: " + debug_table_vi[x] + "  viid: " + debug_table_viid[x] + "  viij: " + debug_table_viij[x] + "  iiiii: " + debug_table_iiiii[x] + "  viiid: " + debug_table_viiid[x] + "  viiii: " + debug_table_viiii[x] + "  i: " + debug_table_i[x] + "  iiidi: " + debug_table_iiidi[x] + "  vid: " + debug_table_vid[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  viiidd: " + debug_table_viiidd[x] + "  viiiii: " + debug_table_viiiii[x] + "  v: " + debug_table_v[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_diiii(x) {
    err("Invalid function pointer '" + x + "' called with signature 'diiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: diii: " + debug_table_diii[x] + "  dii: " + debug_table_dii[x] + "  di: " + debug_table_di[x] + "  diiiii: " + debug_table_diiiii[x] + "  iiii: " + debug_table_iiii[x] + "  iii: " + debug_table_iii[x] + "  ii: " + debug_table_ii[x] + "  iiiii: " + debug_table_iiiii[x] + "  viiii: " + debug_table_viiii[x] + "  iiidi: " + debug_table_iiidi[x] + "  viii: " + debug_table_viii[x] + "  iidi: " + debug_table_iidi[x] + "  iiid: " + debug_table_iiid[x] + "  vii: " + debug_table_vii[x] + "  iid: " + debug_table_iid[x] + "  iif: " + debug_table_iif[x] + "  iij: " + debug_table_iij[x] + "  viiid: " + debug_table_viiid[x] + "  dd: " + debug_table_dd[x] + "  vi: " + debug_table_vi[x] + "  viid: " + debug_table_viid[x] + "  viij: " + debug_table_viij[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  viiiii: " + debug_table_viiiii[x] + "  vid: " + debug_table_vid[x] + "  i: " + debug_table_i[x] + "  viiidd: " + debug_table_viiidd[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  v: " + debug_table_v[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_diiiii(x) {
    err("Invalid function pointer '" + x + "' called with signature 'diiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: diii: " + debug_table_diii[x] + "  diiii: " + debug_table_diiii[x] + "  dii: " + debug_table_dii[x] + "  di: " + debug_table_di[x] + "  iiii: " + debug_table_iiii[x] + "  iiiii: " + debug_table_iiiii[x] + "  iii: " + debug_table_iii[x] + "  ii: " + debug_table_ii[x] + "  viiii: " + debug_table_viiii[x] + "  iiidi: " + debug_table_iiidi[x] + "  viii: " + debug_table_viii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  viiiii: " + debug_table_viiiii[x] + "  iidi: " + debug_table_iidi[x] + "  iiid: " + debug_table_iiid[x] + "  vii: " + debug_table_vii[x] + "  iid: " + debug_table_iid[x] + "  iif: " + debug_table_iif[x] + "  iij: " + debug_table_iij[x] + "  viiid: " + debug_table_viiid[x] + "  viid: " + debug_table_viid[x] + "  viij: " + debug_table_viij[x] + "  dd: " + debug_table_dd[x] + "  vi: " + debug_table_vi[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  vid: " + debug_table_vid[x] + "  viiidd: " + debug_table_viiidd[x] + "  i: " + debug_table_i[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  v: " + debug_table_v[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_i(x) {
    err("Invalid function pointer '" + x + "' called with signature 'i'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: ii: " + debug_table_ii[x] + "  iid: " + debug_table_iid[x] + "  iif: " + debug_table_iif[x] + "  iii: " + debug_table_iii[x] + "  iij: " + debug_table_iij[x] + "  iidi: " + debug_table_iidi[x] + "  iiid: " + debug_table_iiid[x] + "  iiii: " + debug_table_iiii[x] + "  iiidi: " + debug_table_iiidi[x] + "  iiiii: " + debug_table_iiiii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  di: " + debug_table_di[x] + "  vi: " + debug_table_vi[x] + "  v: " + debug_table_v[x] + "  dii: " + debug_table_dii[x] + "  vid: " + debug_table_vid[x] + "  vii: " + debug_table_vii[x] + "  dd: " + debug_table_dd[x] + "  diii: " + debug_table_diii[x] + "  viid: " + debug_table_viid[x] + "  viii: " + debug_table_viii[x] + "  viij: " + debug_table_viij[x] + "  diiii: " + debug_table_diiii[x] + "  viiid: " + debug_table_viiid[x] + "  viiii: " + debug_table_viiii[x] + "  diiiii: " + debug_table_diiiii[x] + "  viiidd: " + debug_table_viiidd[x] + "  viiiii: " + debug_table_viiiii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_ii(x) {
    err("Invalid function pointer '" + x + "' called with signature 'ii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: i: " + debug_table_i[x] + "  iid: " + debug_table_iid[x] + "  iif: " + debug_table_iif[x] + "  iii: " + debug_table_iii[x] + "  iij: " + debug_table_iij[x] + "  iidi: " + debug_table_iidi[x] + "  iiid: " + debug_table_iiid[x] + "  iiii: " + debug_table_iiii[x] + "  iiidi: " + debug_table_iiidi[x] + "  iiiii: " + debug_table_iiiii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  dii: " + debug_table_dii[x] + "  vii: " + debug_table_vii[x] + "  di: " + debug_table_di[x] + "  vi: " + debug_table_vi[x] + "  diii: " + debug_table_diii[x] + "  viid: " + debug_table_viid[x] + "  viii: " + debug_table_viii[x] + "  viij: " + debug_table_viij[x] + "  vid: " + debug_table_vid[x] + "  v: " + debug_table_v[x] + "  dd: " + debug_table_dd[x] + "  diiii: " + debug_table_diiii[x] + "  viiid: " + debug_table_viiid[x] + "  viiii: " + debug_table_viiii[x] + "  diiiii: " + debug_table_diiiii[x] + "  viiidd: " + debug_table_viiidd[x] + "  viiiii: " + debug_table_viiiii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_iid(x) {
    err("Invalid function pointer '" + x + "' called with signature 'iid'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: ii: " + debug_table_ii[x] + "  iidi: " + debug_table_iidi[x] + "  i: " + debug_table_i[x] + "  iiid: " + debug_table_iiid[x] + "  iif: " + debug_table_iif[x] + "  iii: " + debug_table_iii[x] + "  iij: " + debug_table_iij[x] + "  vid: " + debug_table_vid[x] + "  viid: " + debug_table_viid[x] + "  dii: " + debug_table_dii[x] + "  vii: " + debug_table_vii[x] + "  di: " + debug_table_di[x] + "  vi: " + debug_table_vi[x] + "  dd: " + debug_table_dd[x] + "  iiii: " + debug_table_iiii[x] + "  iiidi: " + debug_table_iiidi[x] + "  diii: " + debug_table_diii[x] + "  viii: " + debug_table_viii[x] + "  viij: " + debug_table_viij[x] + "  viiid: " + debug_table_viiid[x] + "  iiiii: " + debug_table_iiiii[x] + "  diiii: " + debug_table_diiii[x] + "  viiii: " + debug_table_viiii[x] + "  viiidd: " + debug_table_viiidd[x] + "  v: " + debug_table_v[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  diiiii: " + debug_table_diiiii[x] + "  viiiii: " + debug_table_viiiii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_iidi(x) {
    err("Invalid function pointer '" + x + "' called with signature 'iidi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: iid: " + debug_table_iid[x] + "  ii: " + debug_table_ii[x] + "  i: " + debug_table_i[x] + "  iii: " + debug_table_iii[x] + "  di: " + debug_table_di[x] + "  iiii: " + debug_table_iiii[x] + "  iiid: " + debug_table_iiid[x] + "  viii: " + debug_table_viii[x] + "  viid: " + debug_table_viid[x] + "  iiidi: " + debug_table_iiidi[x] + "  iif: " + debug_table_iif[x] + "  iij: " + debug_table_iij[x] + "  vid: " + debug_table_vid[x] + "  dii: " + debug_table_dii[x] + "  vii: " + debug_table_vii[x] + "  vi: " + debug_table_vi[x] + "  dd: " + debug_table_dd[x] + "  diii: " + debug_table_diii[x] + "  iiiii: " + debug_table_iiiii[x] + "  viij: " + debug_table_viij[x] + "  viiid: " + debug_table_viiid[x] + "  viiii: " + debug_table_viiii[x] + "  diiii: " + debug_table_diiii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  viiidd: " + debug_table_viiidd[x] + "  viiiii: " + debug_table_viiiii[x] + "  v: " + debug_table_v[x] + "  diiiii: " + debug_table_diiiii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_iif(x) {
    err("Invalid function pointer '" + x + "' called with signature 'iif'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: ii: " + debug_table_ii[x] + "  i: " + debug_table_i[x] + "  iid: " + debug_table_iid[x] + "  iii: " + debug_table_iii[x] + "  iij: " + debug_table_iij[x] + "  dii: " + debug_table_dii[x] + "  vii: " + debug_table_vii[x] + "  di: " + debug_table_di[x] + "  vi: " + debug_table_vi[x] + "  iidi: " + debug_table_iidi[x] + "  iiid: " + debug_table_iiid[x] + "  iiii: " + debug_table_iiii[x] + "  diii: " + debug_table_diii[x] + "  viid: " + debug_table_viid[x] + "  viii: " + debug_table_viii[x] + "  viij: " + debug_table_viij[x] + "  vid: " + debug_table_vid[x] + "  iiidi: " + debug_table_iiidi[x] + "  iiiii: " + debug_table_iiiii[x] + "  diiii: " + debug_table_diiii[x] + "  viiid: " + debug_table_viiid[x] + "  viiii: " + debug_table_viiii[x] + "  dd: " + debug_table_dd[x] + "  v: " + debug_table_v[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  diiiii: " + debug_table_diiiii[x] + "  viiidd: " + debug_table_viiidd[x] + "  viiiii: " + debug_table_viiiii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_iii(x) {
    err("Invalid function pointer '" + x + "' called with signature 'iii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: ii: " + debug_table_ii[x] + "  iiid: " + debug_table_iiid[x] + "  iiii: " + debug_table_iiii[x] + "  i: " + debug_table_i[x] + "  iiidi: " + debug_table_iiidi[x] + "  iiiii: " + debug_table_iiiii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  diii: " + debug_table_diii[x] + "  iidi: " + debug_table_iidi[x] + "  viii: " + debug_table_viii[x] + "  dii: " + debug_table_dii[x] + "  iid: " + debug_table_iid[x] + "  iif: " + debug_table_iif[x] + "  iij: " + debug_table_iij[x] + "  vii: " + debug_table_vii[x] + "  di: " + debug_table_di[x] + "  vi: " + debug_table_vi[x] + "  viid: " + debug_table_viid[x] + "  viij: " + debug_table_viij[x] + "  diiii: " + debug_table_diiii[x] + "  viiid: " + debug_table_viiid[x] + "  viiii: " + debug_table_viiii[x] + "  vid: " + debug_table_vid[x] + "  diiiii: " + debug_table_diiiii[x] + "  viiidd: " + debug_table_viiidd[x] + "  viiiii: " + debug_table_viiiii[x] + "  dd: " + debug_table_dd[x] + "  v: " + debug_table_v[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_iiid(x) {
    err("Invalid function pointer '" + x + "' called with signature 'iiid'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: iii: " + debug_table_iii[x] + "  ii: " + debug_table_ii[x] + "  iiidi: " + debug_table_iiidi[x] + "  i: " + debug_table_i[x] + "  iid: " + debug_table_iid[x] + "  iiii: " + debug_table_iiii[x] + "  viid: " + debug_table_viid[x] + "  diii: " + debug_table_diii[x] + "  iidi: " + debug_table_iidi[x] + "  viii: " + debug_table_viii[x] + "  viiid: " + debug_table_viiid[x] + "  dii: " + debug_table_dii[x] + "  iif: " + debug_table_iif[x] + "  iij: " + debug_table_iij[x] + "  vii: " + debug_table_vii[x] + "  vid: " + debug_table_vid[x] + "  di: " + debug_table_di[x] + "  vi: " + debug_table_vi[x] + "  dd: " + debug_table_dd[x] + "  viij: " + debug_table_viij[x] + "  iiiii: " + debug_table_iiiii[x] + "  diiii: " + debug_table_diiii[x] + "  viiii: " + debug_table_viiii[x] + "  viiidd: " + debug_table_viiidd[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  diiiii: " + debug_table_diiiii[x] + "  viiiii: " + debug_table_viiiii[x] + "  v: " + debug_table_v[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_iiidi(x) {
    err("Invalid function pointer '" + x + "' called with signature 'iiidi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: iiid: " + debug_table_iiid[x] + "  iii: " + debug_table_iii[x] + "  ii: " + debug_table_ii[x] + "  i: " + debug_table_i[x] + "  iiii: " + debug_table_iiii[x] + "  iidi: " + debug_table_iidi[x] + "  iid: " + debug_table_iid[x] + "  di: " + debug_table_di[x] + "  iiiii: " + debug_table_iiiii[x] + "  diiii: " + debug_table_diiii[x] + "  viiii: " + debug_table_viiii[x] + "  viid: " + debug_table_viid[x] + "  viiid: " + debug_table_viiid[x] + "  diii: " + debug_table_diii[x] + "  viii: " + debug_table_viii[x] + "  dii: " + debug_table_dii[x] + "  iif: " + debug_table_iif[x] + "  iij: " + debug_table_iij[x] + "  vii: " + debug_table_vii[x] + "  vid: " + debug_table_vid[x] + "  vi: " + debug_table_vi[x] + "  viij: " + debug_table_viij[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  diiiii: " + debug_table_diiiii[x] + "  viiiii: " + debug_table_viiiii[x] + "  viiidd: " + debug_table_viiidd[x] + "  dd: " + debug_table_dd[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  v: " + debug_table_v[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_iiii(x) {
    err("Invalid function pointer '" + x + "' called with signature 'iiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: iii: " + debug_table_iii[x] + "  ii: " + debug_table_ii[x] + "  iiiii: " + debug_table_iiiii[x] + "  i: " + debug_table_i[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  diii: " + debug_table_diii[x] + "  iidi: " + debug_table_iidi[x] + "  iiid: " + debug_table_iiid[x] + "  viii: " + debug_table_viii[x] + "  diiii: " + debug_table_diiii[x] + "  iiidi: " + debug_table_iiidi[x] + "  viiii: " + debug_table_viiii[x] + "  dii: " + debug_table_dii[x] + "  iid: " + debug_table_iid[x] + "  iif: " + debug_table_iif[x] + "  iij: " + debug_table_iij[x] + "  vii: " + debug_table_vii[x] + "  di: " + debug_table_di[x] + "  vi: " + debug_table_vi[x] + "  viid: " + debug_table_viid[x] + "  viij: " + debug_table_viij[x] + "  viiid: " + debug_table_viiid[x] + "  diiiii: " + debug_table_diiiii[x] + "  viiiii: " + debug_table_viiiii[x] + "  vid: " + debug_table_vid[x] + "  viiidd: " + debug_table_viiidd[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  dd: " + debug_table_dd[x] + "  v: " + debug_table_v[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_iiiii(x) {
    err("Invalid function pointer '" + x + "' called with signature 'iiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: iiii: " + debug_table_iiii[x] + "  iii: " + debug_table_iii[x] + "  ii: " + debug_table_ii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  i: " + debug_table_i[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  diiii: " + debug_table_diiii[x] + "  iiidi: " + debug_table_iiidi[x] + "  viiii: " + debug_table_viiii[x] + "  diii: " + debug_table_diii[x] + "  iidi: " + debug_table_iidi[x] + "  iiid: " + debug_table_iiid[x] + "  viii: " + debug_table_viii[x] + "  diiiii: " + debug_table_diiiii[x] + "  viiiii: " + debug_table_viiiii[x] + "  dii: " + debug_table_dii[x] + "  iid: " + debug_table_iid[x] + "  iif: " + debug_table_iif[x] + "  iij: " + debug_table_iij[x] + "  vii: " + debug_table_vii[x] + "  viiid: " + debug_table_viiid[x] + "  di: " + debug_table_di[x] + "  vi: " + debug_table_vi[x] + "  viid: " + debug_table_viid[x] + "  viij: " + debug_table_viij[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  vid: " + debug_table_vid[x] + "  viiidd: " + debug_table_viiidd[x] + "  dd: " + debug_table_dd[x] + "  v: " + debug_table_v[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  ");
    abort(x)
}

function nullFunc_iiiiii(x) {
    err("Invalid function pointer '" + x + "' called with signature 'iiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: iiii: " + debug_table_iiii[x] + "  iiiii: " + debug_table_iiiii[x] + "  iii: " + debug_table_iii[x] + "  ii: " + debug_table_ii[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  i: " + debug_table_i[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  diiii: " + debug_table_diiii[x] + "  iiidi: " + debug_table_iiidi[x] + "  viiii: " + debug_table_viiii[x] + "  diii: " + debug_table_diii[x] + "  iidi: " + debug_table_iidi[x] + "  iiid: " + debug_table_iiid[x] + "  viii: " + debug_table_viii[x] + "  diiiii: " + debug_table_diiiii[x] + "  viiiii: " + debug_table_viiiii[x] + "  dii: " + debug_table_dii[x] + "  iid: " + debug_table_iid[x] + "  iif: " + debug_table_iif[x] + "  iij: " + debug_table_iij[x] + "  vii: " + debug_table_vii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  viiid: " + debug_table_viiid[x] + "  viid: " + debug_table_viid[x] + "  viij: " + debug_table_viij[x] + "  di: " + debug_table_di[x] + "  vi: " + debug_table_vi[x] + "  vid: " + debug_table_vid[x] + "  viiidd: " + debug_table_viiidd[x] + "  dd: " + debug_table_dd[x] + "  v: " + debug_table_v[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  ");
    abort(x)
}

function nullFunc_iiiiiiii(x) {
    err("Invalid function pointer '" + x + "' called with signature 'iiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: iiii: " + debug_table_iiii[x] + "  iiiii: " + debug_table_iiiii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  iii: " + debug_table_iii[x] + "  ii: " + debug_table_ii[x] + "  i: " + debug_table_i[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  diiii: " + debug_table_diiii[x] + "  iiidi: " + debug_table_iiidi[x] + "  viiii: " + debug_table_viiii[x] + "  diii: " + debug_table_diii[x] + "  iidi: " + debug_table_iidi[x] + "  iiid: " + debug_table_iiid[x] + "  viii: " + debug_table_viii[x] + "  diiiii: " + debug_table_diiiii[x] + "  viiiii: " + debug_table_viiiii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  dii: " + debug_table_dii[x] + "  iid: " + debug_table_iid[x] + "  iif: " + debug_table_iif[x] + "  iij: " + debug_table_iij[x] + "  vii: " + debug_table_vii[x] + "  viiid: " + debug_table_viiid[x] + "  viid: " + debug_table_viid[x] + "  viij: " + debug_table_viij[x] + "  di: " + debug_table_di[x] + "  vi: " + debug_table_vi[x] + "  vid: " + debug_table_vid[x] + "  viiidd: " + debug_table_viiidd[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  dd: " + debug_table_dd[x] + "  v: " + debug_table_v[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  ");
    abort(x)
}

function nullFunc_iiiiiiiiiiiiiiii(x) {
    err("Invalid function pointer '" + x + "' called with signature 'iiiiiiiiiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: iiiii: " + debug_table_iiiii[x] + "  iiii: " + debug_table_iiii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  iii: " + debug_table_iii[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  ii: " + debug_table_ii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  i: " + debug_table_i[x] + "  diiii: " + debug_table_diiii[x] + "  iiidi: " + debug_table_iiidi[x] + "  viiii: " + debug_table_viiii[x] + "  diiiii: " + debug_table_diiiii[x] + "  viiiii: " + debug_table_viiiii[x] + "  diii: " + debug_table_diii[x] + "  iidi: " + debug_table_iidi[x] + "  iiid: " + debug_table_iiid[x] + "  viii: " + debug_table_viii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  viiid: " + debug_table_viiid[x] + "  dii: " + debug_table_dii[x] + "  iid: " + debug_table_iid[x] + "  iif: " + debug_table_iif[x] + "  iij: " + debug_table_iij[x] + "  vii: " + debug_table_vii[x] + "  viid: " + debug_table_viid[x] + "  viij: " + debug_table_viij[x] + "  viiidd: " + debug_table_viiidd[x] + "  vid: " + debug_table_vid[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  di: " + debug_table_di[x] + "  vi: " + debug_table_vi[x] + "  dd: " + debug_table_dd[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  v: " + debug_table_v[x] + "  ");
    abort(x)
}

function nullFunc_iiiiiiiiiiiiiiiii(x) {
    err("Invalid function pointer '" + x + "' called with signature 'iiiiiiiiiiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: iiiii: " + debug_table_iiiii[x] + "  iiii: " + debug_table_iiii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  iii: " + debug_table_iii[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  ii: " + debug_table_ii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  i: " + debug_table_i[x] + "  diiii: " + debug_table_diiii[x] + "  iiidi: " + debug_table_iiidi[x] + "  viiii: " + debug_table_viiii[x] + "  diiiii: " + debug_table_diiiii[x] + "  viiiii: " + debug_table_viiiii[x] + "  diii: " + debug_table_diii[x] + "  iidi: " + debug_table_iidi[x] + "  iiid: " + debug_table_iiid[x] + "  viii: " + debug_table_viii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  viiid: " + debug_table_viiid[x] + "  dii: " + debug_table_dii[x] + "  iid: " + debug_table_iid[x] + "  iif: " + debug_table_iif[x] + "  iij: " + debug_table_iij[x] + "  vii: " + debug_table_vii[x] + "  viid: " + debug_table_viid[x] + "  viij: " + debug_table_viij[x] + "  viiidd: " + debug_table_viiidd[x] + "  vid: " + debug_table_vid[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  di: " + debug_table_di[x] + "  vi: " + debug_table_vi[x] + "  dd: " + debug_table_dd[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  v: " + debug_table_v[x] + "  ");
    abort(x)
}

function nullFunc_iij(x) {
    err("Invalid function pointer '" + x + "' called with signature 'iij'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: ii: " + debug_table_ii[x] + "  i: " + debug_table_i[x] + "  iid: " + debug_table_iid[x] + "  iif: " + debug_table_iif[x] + "  iii: " + debug_table_iii[x] + "  viij: " + debug_table_viij[x] + "  dii: " + debug_table_dii[x] + "  vii: " + debug_table_vii[x] + "  di: " + debug_table_di[x] + "  vi: " + debug_table_vi[x] + "  iidi: " + debug_table_iidi[x] + "  iiid: " + debug_table_iiid[x] + "  iiii: " + debug_table_iiii[x] + "  diii: " + debug_table_diii[x] + "  viid: " + debug_table_viid[x] + "  viii: " + debug_table_viii[x] + "  vid: " + debug_table_vid[x] + "  iiidi: " + debug_table_iiidi[x] + "  iiiii: " + debug_table_iiiii[x] + "  diiii: " + debug_table_diiii[x] + "  viiid: " + debug_table_viiid[x] + "  viiii: " + debug_table_viiii[x] + "  dd: " + debug_table_dd[x] + "  v: " + debug_table_v[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  diiiii: " + debug_table_diiiii[x] + "  viiidd: " + debug_table_viiidd[x] + "  viiiii: " + debug_table_viiiii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_v(x) {
    err("Invalid function pointer '" + x + "' called with signature 'v'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: vi: " + debug_table_vi[x] + "  vid: " + debug_table_vid[x] + "  vii: " + debug_table_vii[x] + "  viid: " + debug_table_viid[x] + "  viii: " + debug_table_viii[x] + "  viij: " + debug_table_viij[x] + "  viiid: " + debug_table_viiid[x] + "  viiii: " + debug_table_viiii[x] + "  viiidd: " + debug_table_viiidd[x] + "  viiiii: " + debug_table_viiiii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  i: " + debug_table_i[x] + "  dd: " + debug_table_dd[x] + "  di: " + debug_table_di[x] + "  ii: " + debug_table_ii[x] + "  dii: " + debug_table_dii[x] + "  iid: " + debug_table_iid[x] + "  iif: " + debug_table_iif[x] + "  iii: " + debug_table_iii[x] + "  iij: " + debug_table_iij[x] + "  diii: " + debug_table_diii[x] + "  iidi: " + debug_table_iidi[x] + "  iiid: " + debug_table_iiid[x] + "  iiii: " + debug_table_iiii[x] + "  diiii: " + debug_table_diiii[x] + "  iiidi: " + debug_table_iiidi[x] + "  iiiii: " + debug_table_iiiii[x] + "  diiiii: " + debug_table_diiiii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_vi(x) {
    err("Invalid function pointer '" + x + "' called with signature 'vi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: v: " + debug_table_v[x] + "  vid: " + debug_table_vid[x] + "  vii: " + debug_table_vii[x] + "  viid: " + debug_table_viid[x] + "  viii: " + debug_table_viii[x] + "  viij: " + debug_table_viij[x] + "  viiid: " + debug_table_viiid[x] + "  viiii: " + debug_table_viiii[x] + "  viiidd: " + debug_table_viiidd[x] + "  viiiii: " + debug_table_viiiii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  i: " + debug_table_i[x] + "  di: " + debug_table_di[x] + "  ii: " + debug_table_ii[x] + "  dii: " + debug_table_dii[x] + "  iid: " + debug_table_iid[x] + "  iif: " + debug_table_iif[x] + "  iii: " + debug_table_iii[x] + "  iij: " + debug_table_iij[x] + "  dd: " + debug_table_dd[x] + "  diii: " + debug_table_diii[x] + "  iidi: " + debug_table_iidi[x] + "  iiid: " + debug_table_iiid[x] + "  iiii: " + debug_table_iiii[x] + "  diiii: " + debug_table_diiii[x] + "  iiidi: " + debug_table_iiidi[x] + "  iiiii: " + debug_table_iiiii[x] + "  diiiii: " + debug_table_diiiii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_vid(x) {
    err("Invalid function pointer '" + x + "' called with signature 'vid'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: vi: " + debug_table_vi[x] + "  v: " + debug_table_v[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  viid: " + debug_table_viid[x] + "  iid: " + debug_table_iid[x] + "  vii: " + debug_table_vii[x] + "  i: " + debug_table_i[x] + "  di: " + debug_table_di[x] + "  ii: " + debug_table_ii[x] + "  dd: " + debug_table_dd[x] + "  iidi: " + debug_table_iidi[x] + "  viii: " + debug_table_viii[x] + "  viij: " + debug_table_viij[x] + "  viiid: " + debug_table_viiid[x] + "  iiid: " + debug_table_iiid[x] + "  dii: " + debug_table_dii[x] + "  iif: " + debug_table_iif[x] + "  iii: " + debug_table_iii[x] + "  iij: " + debug_table_iij[x] + "  viiii: " + debug_table_viiii[x] + "  iiidi: " + debug_table_iiidi[x] + "  viiidd: " + debug_table_viiidd[x] + "  diii: " + debug_table_diii[x] + "  iiii: " + debug_table_iiii[x] + "  viiiii: " + debug_table_viiiii[x] + "  diiii: " + debug_table_diiii[x] + "  iiiii: " + debug_table_iiiii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  diiiii: " + debug_table_diiiii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_vidddddi(x) {
    err("Invalid function pointer '" + x + "' called with signature 'vidddddi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: vid: " + debug_table_vid[x] + "  vi: " + debug_table_vi[x] + "  v: " + debug_table_v[x] + "  vii: " + debug_table_vii[x] + "  viid: " + debug_table_viid[x] + "  iidi: " + debug_table_iidi[x] + "  viii: " + debug_table_viii[x] + "  viij: " + debug_table_viij[x] + "  di: " + debug_table_di[x] + "  ii: " + debug_table_ii[x] + "  dd: " + debug_table_dd[x] + "  iid: " + debug_table_iid[x] + "  dii: " + debug_table_dii[x] + "  iif: " + debug_table_iif[x] + "  iii: " + debug_table_iii[x] + "  iij: " + debug_table_iij[x] + "  viiid: " + debug_table_viiid[x] + "  iiidi: " + debug_table_iiidi[x] + "  viiii: " + debug_table_viiii[x] + "  viiidd: " + debug_table_viiidd[x] + "  iiid: " + debug_table_iiid[x] + "  diii: " + debug_table_diii[x] + "  iiii: " + debug_table_iiii[x] + "  viiiii: " + debug_table_viiiii[x] + "  diiii: " + debug_table_diiii[x] + "  iiiii: " + debug_table_iiiii[x] + "  diiiii: " + debug_table_diiiii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  i: " + debug_table_i[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_vii(x) {
    err("Invalid function pointer '" + x + "' called with signature 'vii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: vi: " + debug_table_vi[x] + "  viid: " + debug_table_viid[x] + "  viii: " + debug_table_viii[x] + "  viij: " + debug_table_viij[x] + "  v: " + debug_table_v[x] + "  viiid: " + debug_table_viiid[x] + "  viiii: " + debug_table_viiii[x] + "  viiidd: " + debug_table_viiidd[x] + "  viiiii: " + debug_table_viiiii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  ii: " + debug_table_ii[x] + "  dii: " + debug_table_dii[x] + "  iii: " + debug_table_iii[x] + "  vid: " + debug_table_vid[x] + "  iid: " + debug_table_iid[x] + "  iif: " + debug_table_iif[x] + "  iij: " + debug_table_iij[x] + "  i: " + debug_table_i[x] + "  di: " + debug_table_di[x] + "  diii: " + debug_table_diii[x] + "  iiid: " + debug_table_iiid[x] + "  iiii: " + debug_table_iiii[x] + "  iidi: " + debug_table_iidi[x] + "  diiii: " + debug_table_diiii[x] + "  iiidi: " + debug_table_iiidi[x] + "  iiiii: " + debug_table_iiiii[x] + "  dd: " + debug_table_dd[x] + "  diiiii: " + debug_table_diiiii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_viid(x) {
    err("Invalid function pointer '" + x + "' called with signature 'viid'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: vii: " + debug_table_vii[x] + "  vi: " + debug_table_vi[x] + "  v: " + debug_table_v[x] + "  vid: " + debug_table_vid[x] + "  iid: " + debug_table_iid[x] + "  ii: " + debug_table_ii[x] + "  iiid: " + debug_table_iiid[x] + "  viii: " + debug_table_viii[x] + "  viij: " + debug_table_viij[x] + "  iidi: " + debug_table_iidi[x] + "  viiid: " + debug_table_viiid[x] + "  dii: " + debug_table_dii[x] + "  iii: " + debug_table_iii[x] + "  iif: " + debug_table_iif[x] + "  iij: " + debug_table_iij[x] + "  di: " + debug_table_di[x] + "  dd: " + debug_table_dd[x] + "  diii: " + debug_table_diii[x] + "  iiii: " + debug_table_iiii[x] + "  iiidi: " + debug_table_iiidi[x] + "  viiii: " + debug_table_viiii[x] + "  i: " + debug_table_i[x] + "  viiidd: " + debug_table_viiidd[x] + "  diiii: " + debug_table_diiii[x] + "  iiiii: " + debug_table_iiiii[x] + "  viiiii: " + debug_table_viiiii[x] + "  diiiii: " + debug_table_diiiii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_viii(x) {
    err("Invalid function pointer '" + x + "' called with signature 'viii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: vii: " + debug_table_vii[x] + "  vi: " + debug_table_vi[x] + "  viiid: " + debug_table_viiid[x] + "  viiii: " + debug_table_viiii[x] + "  v: " + debug_table_v[x] + "  viiidd: " + debug_table_viiidd[x] + "  viiiii: " + debug_table_viiiii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  iii: " + debug_table_iii[x] + "  ii: " + debug_table_ii[x] + "  diii: " + debug_table_diii[x] + "  iiii: " + debug_table_iiii[x] + "  viid: " + debug_table_viid[x] + "  viij: " + debug_table_viij[x] + "  iidi: " + debug_table_iidi[x] + "  iiid: " + debug_table_iiid[x] + "  dii: " + debug_table_dii[x] + "  vid: " + debug_table_vid[x] + "  iid: " + debug_table_iid[x] + "  iif: " + debug_table_iif[x] + "  iij: " + debug_table_iij[x] + "  di: " + debug_table_di[x] + "  diiii: " + debug_table_diiii[x] + "  iiiii: " + debug_table_iiiii[x] + "  i: " + debug_table_i[x] + "  iiidi: " + debug_table_iiidi[x] + "  diiiii: " + debug_table_diiiii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  dd: " + debug_table_dd[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_viiid(x) {
    err("Invalid function pointer '" + x + "' called with signature 'viiid'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: viii: " + debug_table_viii[x] + "  vii: " + debug_table_vii[x] + "  vi: " + debug_table_vi[x] + "  viiidd: " + debug_table_viiidd[x] + "  v: " + debug_table_v[x] + "  viid: " + debug_table_viid[x] + "  iiid: " + debug_table_iiid[x] + "  iii: " + debug_table_iii[x] + "  vid: " + debug_table_vid[x] + "  iid: " + debug_table_iid[x] + "  ii: " + debug_table_ii[x] + "  viiii: " + debug_table_viiii[x] + "  diii: " + debug_table_diii[x] + "  iiii: " + debug_table_iiii[x] + "  viij: " + debug_table_viij[x] + "  iiidi: " + debug_table_iiidi[x] + "  iidi: " + debug_table_iidi[x] + "  dii: " + debug_table_dii[x] + "  iif: " + debug_table_iif[x] + "  iij: " + debug_table_iij[x] + "  diiii: " + debug_table_diiii[x] + "  iiiii: " + debug_table_iiiii[x] + "  di: " + debug_table_di[x] + "  viiiii: " + debug_table_viiiii[x] + "  dd: " + debug_table_dd[x] + "  i: " + debug_table_i[x] + "  diiiii: " + debug_table_diiiii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_viiidd(x) {
    err("Invalid function pointer '" + x + "' called with signature 'viiidd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: viii: " + debug_table_viii[x] + "  viiid: " + debug_table_viiid[x] + "  vii: " + debug_table_vii[x] + "  vi: " + debug_table_vi[x] + "  v: " + debug_table_v[x] + "  viid: " + debug_table_viid[x] + "  iiid: " + debug_table_iiid[x] + "  iii: " + debug_table_iii[x] + "  vid: " + debug_table_vid[x] + "  iid: " + debug_table_iid[x] + "  ii: " + debug_table_ii[x] + "  viiii: " + debug_table_viiii[x] + "  dd: " + debug_table_dd[x] + "  diii: " + debug_table_diii[x] + "  iiii: " + debug_table_iiii[x] + "  viij: " + debug_table_viij[x] + "  iiidi: " + debug_table_iiidi[x] + "  iidi: " + debug_table_iidi[x] + "  dii: " + debug_table_dii[x] + "  iif: " + debug_table_iif[x] + "  iij: " + debug_table_iij[x] + "  diiii: " + debug_table_diiii[x] + "  iiiii: " + debug_table_iiiii[x] + "  viiiii: " + debug_table_viiiii[x] + "  di: " + debug_table_di[x] + "  diiiii: " + debug_table_diiiii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  i: " + debug_table_i[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_viiii(x) {
    err("Invalid function pointer '" + x + "' called with signature 'viiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: viii: " + debug_table_viii[x] + "  vii: " + debug_table_vii[x] + "  vi: " + debug_table_vi[x] + "  viiiii: " + debug_table_viiiii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  v: " + debug_table_v[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  iiii: " + debug_table_iiii[x] + "  iii: " + debug_table_iii[x] + "  ii: " + debug_table_ii[x] + "  diiii: " + debug_table_diiii[x] + "  iiiii: " + debug_table_iiiii[x] + "  viiid: " + debug_table_viiid[x] + "  iiidi: " + debug_table_iiidi[x] + "  diii: " + debug_table_diii[x] + "  viid: " + debug_table_viid[x] + "  viij: " + debug_table_viij[x] + "  iidi: " + debug_table_iidi[x] + "  iiid: " + debug_table_iiid[x] + "  dii: " + debug_table_dii[x] + "  vid: " + debug_table_vid[x] + "  iid: " + debug_table_iid[x] + "  iif: " + debug_table_iif[x] + "  iij: " + debug_table_iij[x] + "  di: " + debug_table_di[x] + "  diiiii: " + debug_table_diiiii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  viiidd: " + debug_table_viiidd[x] + "  i: " + debug_table_i[x] + "  dd: " + debug_table_dd[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_viiiii(x) {
    err("Invalid function pointer '" + x + "' called with signature 'viiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: viii: " + debug_table_viii[x] + "  viiii: " + debug_table_viiii[x] + "  vii: " + debug_table_vii[x] + "  vi: " + debug_table_vi[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  v: " + debug_table_v[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  iiii: " + debug_table_iiii[x] + "  iiiii: " + debug_table_iiiii[x] + "  iii: " + debug_table_iii[x] + "  ii: " + debug_table_ii[x] + "  diiii: " + debug_table_diiii[x] + "  viiid: " + debug_table_viiid[x] + "  iiidi: " + debug_table_iiidi[x] + "  diii: " + debug_table_diii[x] + "  viid: " + debug_table_viid[x] + "  viij: " + debug_table_viij[x] + "  diiiii: " + debug_table_diiiii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  iidi: " + debug_table_iidi[x] + "  iiid: " + debug_table_iiid[x] + "  dii: " + debug_table_dii[x] + "  vid: " + debug_table_vid[x] + "  iid: " + debug_table_iid[x] + "  iif: " + debug_table_iif[x] + "  iij: " + debug_table_iij[x] + "  viiidd: " + debug_table_viiidd[x] + "  di: " + debug_table_di[x] + "  i: " + debug_table_i[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  dd: " + debug_table_dd[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_viiiiii(x) {
    err("Invalid function pointer '" + x + "' called with signature 'viiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: viii: " + debug_table_viii[x] + "  viiii: " + debug_table_viiii[x] + "  viiiii: " + debug_table_viiiii[x] + "  vii: " + debug_table_vii[x] + "  vi: " + debug_table_vi[x] + "  v: " + debug_table_v[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  iiii: " + debug_table_iiii[x] + "  iiiii: " + debug_table_iiiii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  iii: " + debug_table_iii[x] + "  diiii: " + debug_table_diiii[x] + "  viiid: " + debug_table_viiid[x] + "  iiidi: " + debug_table_iiidi[x] + "  diii: " + debug_table_diii[x] + "  viid: " + debug_table_viid[x] + "  viij: " + debug_table_viij[x] + "  ii: " + debug_table_ii[x] + "  diiiii: " + debug_table_diiiii[x] + "  iidi: " + debug_table_iidi[x] + "  iiid: " + debug_table_iiid[x] + "  dii: " + debug_table_dii[x] + "  vid: " + debug_table_vid[x] + "  iid: " + debug_table_iid[x] + "  iif: " + debug_table_iif[x] + "  iij: " + debug_table_iij[x] + "  viiidd: " + debug_table_viiidd[x] + "  di: " + debug_table_di[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  i: " + debug_table_i[x] + "  dd: " + debug_table_dd[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_viiiiiiiii(x) {
    err("Invalid function pointer '" + x + "' called with signature 'viiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: viiii: " + debug_table_viiii[x] + "  viii: " + debug_table_viii[x] + "  viiiii: " + debug_table_viiiii[x] + "  vii: " + debug_table_vii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  vi: " + debug_table_vi[x] + "  v: " + debug_table_v[x] + "  iiiii: " + debug_table_iiiii[x] + "  iiii: " + debug_table_iiii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  iii: " + debug_table_iii[x] + "  diiii: " + debug_table_diiii[x] + "  viiid: " + debug_table_viiid[x] + "  iiidi: " + debug_table_iiidi[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  diii: " + debug_table_diii[x] + "  viid: " + debug_table_viid[x] + "  viij: " + debug_table_viij[x] + "  diiiii: " + debug_table_diiiii[x] + "  iidi: " + debug_table_iidi[x] + "  iiid: " + debug_table_iiid[x] + "  dii: " + debug_table_dii[x] + "  vid: " + debug_table_vid[x] + "  iid: " + debug_table_iid[x] + "  iif: " + debug_table_iif[x] + "  iij: " + debug_table_iij[x] + "  ii: " + debug_table_ii[x] + "  viiidd: " + debug_table_viiidd[x] + "  di: " + debug_table_di[x] + "  dd: " + debug_table_dd[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  i: " + debug_table_i[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function nullFunc_viij(x) {
    err("Invalid function pointer '" + x + "' called with signature 'viij'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
    err("This pointer might make sense in another type signature: vii: " + debug_table_vii[x] + "  vi: " + debug_table_vi[x] + "  v: " + debug_table_v[x] + "  iij: " + debug_table_iij[x] + "  ii: " + debug_table_ii[x] + "  viid: " + debug_table_viid[x] + "  viii: " + debug_table_viii[x] + "  dii: " + debug_table_dii[x] + "  iii: " + debug_table_iii[x] + "  vid: " + debug_table_vid[x] + "  iid: " + debug_table_iid[x] + "  iif: " + debug_table_iif[x] + "  di: " + debug_table_di[x] + "  diii: " + debug_table_diii[x] + "  iiid: " + debug_table_iiid[x] + "  iiii: " + debug_table_iiii[x] + "  viiid: " + debug_table_viiid[x] + "  viiii: " + debug_table_viiii[x] + "  i: " + debug_table_i[x] + "  iidi: " + debug_table_iidi[x] + "  diiii: " + debug_table_diiii[x] + "  iiidi: " + debug_table_iiidi[x] + "  iiiii: " + debug_table_iiiii[x] + "  viiidd: " + debug_table_viiidd[x] + "  viiiii: " + debug_table_viiiii[x] + "  dd: " + debug_table_dd[x] + "  diiiii: " + debug_table_diiiii[x] + "  iiiiii: " + debug_table_iiiiii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  vidddddi: " + debug_table_vidddddi[x] + "  iiiiiiii: " + debug_table_iiiiiiii[x] + "  viiiiiiiii: " + debug_table_viiiiiiiii[x] + "  iiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiii[x] + "  iiiiiiiiiiiiiiiii: " + debug_table_iiiiiiiiiiiiiiiii[x] + "  ");
    abort(x)
}

function invoke_ii(index, a1) {
    var sp = stackSave();
    try {
        return dynCall_ii(index, a1)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}

function invoke_iii(index, a1, a2) {
    var sp = stackSave();
    try {
        return dynCall_iii(index, a1, a2)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}

function invoke_iiii(index, a1, a2, a3) {
    var sp = stackSave();
    try {
        return dynCall_iiii(index, a1, a2, a3)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}

function invoke_iiiii(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
        return dynCall_iiiii(index, a1, a2, a3, a4)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}

function invoke_v(index) {
    var sp = stackSave();
    try {
        dynCall_v(index)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}

function invoke_vi(index, a1) {
    var sp = stackSave();
    try {
        dynCall_vi(index, a1)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}

function invoke_vii(index, a1, a2) {
    var sp = stackSave();
    try {
        dynCall_vii(index, a1, a2)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}

function invoke_viii(index, a1, a2, a3) {
    var sp = stackSave();
    try {
        dynCall_viii(index, a1, a2, a3)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}

function invoke_viiii(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
        dynCall_viiii(index, a1, a2, a3, a4)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}

function invoke_viiiii(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
        dynCall_viiiii(index, a1, a2, a3, a4, a5)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}

function invoke_viiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    var sp = stackSave();
    try {
        dynCall_viiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}

var asmGlobalArg = {};
var asmLibraryArg = {
    "abort": abort,
    "setTempRet0": setTempRet0,
    "getTempRet0": getTempRet0,
    "abortStackOverflow": abortStackOverflow,
    "nullFunc_dd": nullFunc_dd,
    "nullFunc_di": nullFunc_di,
    "nullFunc_dii": nullFunc_dii,
    "nullFunc_diii": nullFunc_diii,
    "nullFunc_diiii": nullFunc_diiii,
    "nullFunc_diiiii": nullFunc_diiiii,
    "nullFunc_i": nullFunc_i,
    "nullFunc_ii": nullFunc_ii,
    "nullFunc_iid": nullFunc_iid,
    "nullFunc_iidi": nullFunc_iidi,
    "nullFunc_iif": nullFunc_iif,
    "nullFunc_iii": nullFunc_iii,
    "nullFunc_iiid": nullFunc_iiid,
    "nullFunc_iiidi": nullFunc_iiidi,
    "nullFunc_iiii": nullFunc_iiii,
    "nullFunc_iiiii": nullFunc_iiiii,
    "nullFunc_iiiiii": nullFunc_iiiiii,
    "nullFunc_iiiiiiii": nullFunc_iiiiiiii,
    "nullFunc_iiiiiiiiiiiiiiii": nullFunc_iiiiiiiiiiiiiiii,
    "nullFunc_iiiiiiiiiiiiiiiii": nullFunc_iiiiiiiiiiiiiiiii,
    "nullFunc_iij": nullFunc_iij,
    "nullFunc_v": nullFunc_v,
    "nullFunc_vi": nullFunc_vi,
    "nullFunc_vid": nullFunc_vid,
    "nullFunc_vidddddi": nullFunc_vidddddi,
    "nullFunc_vii": nullFunc_vii,
    "nullFunc_viid": nullFunc_viid,
    "nullFunc_viii": nullFunc_viii,
    "nullFunc_viiid": nullFunc_viiid,
    "nullFunc_viiidd": nullFunc_viiidd,
    "nullFunc_viiii": nullFunc_viiii,
    "nullFunc_viiiii": nullFunc_viiiii,
    "nullFunc_viiiiii": nullFunc_viiiiii,
    "nullFunc_viiiiiiiii": nullFunc_viiiiiiiii,
    "nullFunc_viij": nullFunc_viij,
    "invoke_ii": invoke_ii,
    "invoke_iii": invoke_iii,
    "invoke_iiii": invoke_iiii,
    "invoke_iiiii": invoke_iiiii,
    "invoke_v": invoke_v,
    "invoke_vi": invoke_vi,
    "invoke_vii": invoke_vii,
    "invoke_viii": invoke_viii,
    "invoke_viiii": invoke_viiii,
    "invoke_viiiii": invoke_viiiii,
    "invoke_viiiiiiiii": invoke_viiiiiiiii,
    "ClassHandle": ClassHandle,
    "ClassHandle_clone": ClassHandle_clone,
    "ClassHandle_delete": ClassHandle_delete,
    "ClassHandle_deleteLater": ClassHandle_deleteLater,
    "ClassHandle_isAliasOf": ClassHandle_isAliasOf,
    "ClassHandle_isDeleted": ClassHandle_isDeleted,
    "RegisteredClass": RegisteredClass,
    "RegisteredPointer": RegisteredPointer,
    "RegisteredPointer_deleteObject": RegisteredPointer_deleteObject,
    "RegisteredPointer_destructor": RegisteredPointer_destructor,
    "RegisteredPointer_fromWireType": RegisteredPointer_fromWireType,
    "RegisteredPointer_getPointee": RegisteredPointer_getPointee,
    "_JSEvents_requestFullscreen": _JSEvents_requestFullscreen,
    "_JSEvents_resizeCanvasForFullscreen": _JSEvents_resizeCanvasForFullscreen,
    "__Z11Utf8ToUtf16iPKh": __Z11Utf8ToUtf16iPKh,
    "__Z11readGrobKMLbP9S_VAGROB_RK9BeeString": __Z11readGrobKMLbP9S_VAGROB_RK9BeeString,
    "__Z13readGrob3DXMLbP9S_VAGROB_RK9BeeString": __Z13readGrob3DXMLbP9S_VAGROB_RK9BeeString,
    "__Z14readHeaderJpegP8_IO_FILERK9BeeStringPiS4_S4_PjPS1_S6_": __Z14readHeaderJpegP8_IO_FILERK9BeeStringPiS4_S4_PjPS1_S6_,
    "__Z17Utf16ToLatin1HtmliPKtbb": __Z17Utf16ToLatin1HtmliPKtbb,
    "__Z18readGrobColladaDaebP9S_VAGROB_RK9BeeString": __Z18readGrobColladaDaebP9S_VAGROB_RK9BeeString,
    "__Z18readGrobColladaKmzbP9S_VAGROB_RK9BeeString": __Z18readGrobColladaKmzbP9S_VAGROB_RK9BeeString,
    "__Z19graphAdjacencyListsiiPi": __Z19graphAdjacencyListsiiPi,
    "__ZN12BeeZipFindex9makeIndexEP8_IO_FILEPFiPKcxE": __ZN12BeeZipFindex9makeIndexEP8_IO_FILEPFiPKcxE,
    "__ZN12BeeZipFindexC1Ev": __ZN12BeeZipFindexC1Ev,
    "__ZN12BeeZipFindexD1Ev": __ZN12BeeZipFindexD1Ev,
    "__ZN12TableEssence10readHeaderEP8_IO_FILE": __ZN12TableEssence10readHeaderEP8_IO_FILE,
    "__ZN15IcmTableEssence6getIDBERK9BeeStringP8_IO_FILE": __ZN15IcmTableEssence6getIDBERK9BeeStringP8_IO_FILE,
    "__ZN17IcmPluginInstance16onTorsionRotDoneEP5S_AT_": __ZN17IcmPluginInstance16onTorsionRotDoneEP5S_AT_,
    "__ZN17IcmPluginInstance16onTorsionRotInitEP5S_AT_": __ZN17IcmPluginInstance16onTorsionRotInitEP5S_AT_,
    "__ZN17IcmPluginInstance18onTorsionRotUpdateEP5S_AT_": __ZN17IcmPluginInstance18onTorsionRotUpdateEP5S_AT_,
    "__ZN18IcmPluginInterface13atomPopupMenuEP5S_AT_ii": __ZN18IcmPluginInterface13atomPopupMenuEP5S_AT_ii,
    "__ZN7QPlot2D19showAxisContextMenuE8AxisTypeRK6WPoint": __ZN7QPlot2D19showAxisContextMenuE8AxisTypeRK6WPoint,
    "__ZN9BeeFindex10buildIndexE13BeeFileFormatP8_IO_FILEPFiPKcxEi": __ZN9BeeFindex10buildIndexE13BeeFileFormatP8_IO_FILEPFiPKcxEi,
    "__ZN9BeeFindex10readRecordEv": __ZN9BeeFindex10readRecordEv,
    "__ZN9BeeFindex13buildCsvIndexEP8_IO_FILEcPFiPKcxEi": __ZN9BeeFindex13buildCsvIndexEP8_IO_FILEcPFiPKcxEi,
    "__ZN9BeeFindex16makePatternIndexEP8_IO_FILERK9BeeStringS4_PFiPKcxEiS4_": __ZN9BeeFindex16makePatternIndexEP8_IO_FILERK9BeeStringS4_PFiPKcxEiS4_,
    "__ZN9BeeFindex5beginEi": __ZN9BeeFindex5beginEi,
    "__ZN9XmlReader16getStructuredXmlERK9BeeStringb": __ZN9XmlReader16getStructuredXmlERK9BeeStringb,
    "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv,
    "___assert_fail": ___assert_fail,
    "___buildEnvironment": ___buildEnvironment,
    "___clock_gettime": ___clock_gettime,
    "___cxa_allocate_exception": ___cxa_allocate_exception,
    "___cxa_atexit": ___cxa_atexit,
    "___cxa_begin_catch": ___cxa_begin_catch,
    "___cxa_find_matching_catch": ___cxa_find_matching_catch,
    "___cxa_free_exception": ___cxa_free_exception,
    "___cxa_pure_virtual": ___cxa_pure_virtual,
    "___cxa_throw": ___cxa_throw,
    "___gxx_personality_v0": ___gxx_personality_v0,
    "___lock": ___lock,
    "___map_file": ___map_file,
    "___resumeException": ___resumeException,
    "___setErrNo": ___setErrNo,
    "___syscall10": ___syscall10,
    "___syscall102": ___syscall102,
    "___syscall114": ___syscall114,
    "___syscall12": ___syscall12,
    "___syscall140": ___syscall140,
    "___syscall142": ___syscall142,
    "___syscall145": ___syscall145,
    "___syscall146": ___syscall146,
    "___syscall183": ___syscall183,
    "___syscall195": ___syscall195,
    "___syscall197": ___syscall197,
    "___syscall199": ___syscall199,
    "___syscall20": ___syscall20,
    "___syscall200": ___syscall200,
    "___syscall202": ___syscall202,
    "___syscall220": ___syscall220,
    "___syscall221": ___syscall221,
    "___syscall3": ___syscall3,
    "___syscall33": ___syscall33,
    "___syscall330": ___syscall330,
    "___syscall38": ___syscall38,
    "___syscall39": ___syscall39,
    "___syscall4": ___syscall4,
    "___syscall40": ___syscall40,
    "___syscall5": ___syscall5,
    "___syscall54": ___syscall54,
    "___syscall6": ___syscall6,
    "___syscall60": ___syscall60,
    "___syscall63": ___syscall63,
    "___syscall91": ___syscall91,
    "___unlock": ___unlock,
    "__addDays": __addDays,
    "__arraySum": __arraySum,
    "__computeUnpackAlignedImageSize": __computeUnpackAlignedImageSize,
    "__embind_register_bool": __embind_register_bool,
    "__embind_register_class": __embind_register_class,
    "__embind_register_class_class_function": __embind_register_class_class_function,
    "__embind_register_class_constructor": __embind_register_class_constructor,
    "__embind_register_class_function": __embind_register_class_function,
    "__embind_register_class_property": __embind_register_class_property,
    "__embind_register_emval": __embind_register_emval,
    "__embind_register_float": __embind_register_float,
    "__embind_register_integer": __embind_register_integer,
    "__embind_register_memory_view": __embind_register_memory_view,
    "__embind_register_std_string": __embind_register_std_string,
    "__embind_register_std_wstring": __embind_register_std_wstring,
    "__embind_register_void": __embind_register_void,
    "__emscripten_do_request_fullscreen": __emscripten_do_request_fullscreen,
    "__emscripten_traverse_stack": __emscripten_traverse_stack,
    "__emval_addMethodCaller": __emval_addMethodCaller,
    "__emval_allocateDestructors": __emval_allocateDestructors,
    "__emval_as": __emval_as,
    "__emval_call": __emval_call,
    "__emval_call_method": __emval_call_method,
    "__emval_call_void_method": __emval_call_void_method,
    "__emval_decref": __emval_decref,
    "__emval_equals": __emval_equals,
    "__emval_get_global": __emval_get_global,
    "__emval_get_method_caller": __emval_get_method_caller,
    "__emval_get_module_property": __emval_get_module_property,
    "__emval_get_property": __emval_get_property,
    "__emval_incref": __emval_incref,
    "__emval_lookupTypes": __emval_lookupTypes,
    "__emval_new_array": __emval_new_array,
    "__emval_new_cstring": __emval_new_cstring,
    "__emval_new_object": __emval_new_object,
    "__emval_register": __emval_register,
    "__emval_run_destructors": __emval_run_destructors,
    "__emval_set_property": __emval_set_property,
    "__emval_take_value": __emval_take_value,
    "__emval_typeof": __emval_typeof,
    "__fillFullscreenChangeEventData": __fillFullscreenChangeEventData,
    "__fillMouseEventData": __fillMouseEventData,
    "__findCanvasEventTarget": __findCanvasEventTarget,
    "__findEventTarget": __findEventTarget,
    "__formatString": __formatString,
    "__get_canvas_element_size": __get_canvas_element_size,
    "__glGenObject": __glGenObject,
    "__heapObjectForWebGLType": __heapObjectForWebGLType,
    "__hideEverythingExceptGivenElement": __hideEverythingExceptGivenElement,
    "__inet_ntop4_raw": __inet_ntop4_raw,
    "__inet_ntop6_raw": __inet_ntop6_raw,
    "__inet_pton4_raw": __inet_pton4_raw,
    "__inet_pton6_raw": __inet_pton6_raw,
    "__isLeapYear": __isLeapYear,
    "__read_sockaddr": __read_sockaddr,
    "__reallyNegative": __reallyNegative,
    "__registerMouseEventCallback": __registerMouseEventCallback,
    "__registerRestoreOldStyle": __registerRestoreOldStyle,
    "__registerTouchEventCallback": __registerTouchEventCallback,
    "__registerUiEventCallback": __registerUiEventCallback,
    "__registerWheelEventCallback": __registerWheelEventCallback,
    "__restoreHiddenElements": __restoreHiddenElements,
    "__setLetterbox": __setLetterbox,
    "__set_canvas_element_size": __set_canvas_element_size,
    "__softFullscreenResizeWebGLRenderTarget": __softFullscreenResizeWebGLRenderTarget,
    "__write_sockaddr": __write_sockaddr,
    "_abort": _abort,
    "_asctime": _asctime,
    "_asctime_r": _asctime_r,
    "_atexit": _atexit,
    "_calc_bbfreq": _calc_bbfreq,
    "_calc_mfapty": _calc_mfapty,
    "_clProfileStats": _clProfileStats,
    "_clock": _clock,
    "_clock_gettime": _clock_gettime,
    "_ctime": _ctime,
    "_ctime_r": _ctime_r,
    "_embind_repr": _embind_repr,
    "_emscripten_asm_const_i": _emscripten_asm_const_i,
    "_emscripten_async_call": _emscripten_async_call,
    "_emscripten_async_wget2_data": _emscripten_async_wget2_data,
    "_emscripten_async_wget_data": _emscripten_async_wget_data,
    "_emscripten_enter_soft_fullscreen": _emscripten_enter_soft_fullscreen,
    "_emscripten_exit_soft_fullscreen": _emscripten_exit_soft_fullscreen,
    "_emscripten_get_callstack_js": _emscripten_get_callstack_js,
    "_emscripten_get_canvas_element_size": _emscripten_get_canvas_element_size,
    "_emscripten_get_device_pixel_ratio": _emscripten_get_device_pixel_ratio,
    "_emscripten_get_fullscreen_status": _emscripten_get_fullscreen_status,
    "_emscripten_get_heap_size": _emscripten_get_heap_size,
    "_emscripten_get_now": _emscripten_get_now,
    "_emscripten_get_now_is_monotonic": _emscripten_get_now_is_monotonic,
    "_emscripten_log": _emscripten_log,
    "_emscripten_log_js": _emscripten_log_js,
    "_emscripten_memcpy_big": _emscripten_memcpy_big,
    "_emscripten_random": _emscripten_random,
    "_emscripten_request_fullscreen_strategy": _emscripten_request_fullscreen_strategy,
    "_emscripten_resize_heap": _emscripten_resize_heap,
    "_emscripten_run_script": _emscripten_run_script,
    "_emscripten_run_script_int": _emscripten_run_script_int,
    "_emscripten_set_canvas_element_size": _emscripten_set_canvas_element_size,
    "_emscripten_set_dblclick_callback_on_thread": _emscripten_set_dblclick_callback_on_thread,
    "_emscripten_set_main_loop": _emscripten_set_main_loop,
    "_emscripten_set_main_loop_timing": _emscripten_set_main_loop_timing,
    "_emscripten_set_mousedown_callback_on_thread": _emscripten_set_mousedown_callback_on_thread,
    "_emscripten_set_mouseleave_callback_on_thread": _emscripten_set_mouseleave_callback_on_thread,
    "_emscripten_set_mousemove_callback_on_thread": _emscripten_set_mousemove_callback_on_thread,
    "_emscripten_set_mouseup_callback_on_thread": _emscripten_set_mouseup_callback_on_thread,
    "_emscripten_set_resize_callback_on_thread": _emscripten_set_resize_callback_on_thread,
    "_emscripten_set_touchcancel_callback_on_thread": _emscripten_set_touchcancel_callback_on_thread,
    "_emscripten_set_touchend_callback_on_thread": _emscripten_set_touchend_callback_on_thread,
    "_emscripten_set_touchmove_callback_on_thread": _emscripten_set_touchmove_callback_on_thread,
    "_emscripten_set_touchstart_callback_on_thread": _emscripten_set_touchstart_callback_on_thread,
    "_emscripten_set_wheel_callback_on_thread": _emscripten_set_wheel_callback_on_thread,
    "_emscripten_webgl_create_context": _emscripten_webgl_create_context,
    "_emscripten_webgl_destroy_context": _emscripten_webgl_destroy_context,
    "_emscripten_webgl_destroy_context_calling_thread": _emscripten_webgl_destroy_context_calling_thread,
    "_emscripten_webgl_do_create_context": _emscripten_webgl_do_create_context,
    "_emscripten_webgl_init_context_attributes": _emscripten_webgl_init_context_attributes,
    "_emscripten_webgl_make_context_current": _emscripten_webgl_make_context_current,
    "_getenv": _getenv,
    "_gethostbyname": _gethostbyname,
    "_getpwuid": _getpwuid,
    "_gettimeofday": _gettimeofday,
    "_glActiveTexture": _glActiveTexture,
    "_glAttachShader": _glAttachShader,
    "_glBeginQuery": _glBeginQuery,
    "_glBeginTransformFeedback": _glBeginTransformFeedback,
    "_glBindAttribLocation": _glBindAttribLocation,
    "_glBindBuffer": _glBindBuffer,
    "_glBindTexture": _glBindTexture,
    "_glBlendFunc": _glBlendFunc,
    "_glBufferData": _glBufferData,
    "_glClear": _glClear,
    "_glClearColor": _glClearColor,
    "_glColorMask": _glColorMask,
    "_glCompileShader": _glCompileShader,
    "_glCreateProgram": _glCreateProgram,
    "_glCreateShader": _glCreateShader,
    "_glDeleteBuffers": _glDeleteBuffers,
    "_glDeleteProgram": _glDeleteProgram,
    "_glDeleteTextures": _glDeleteTextures,
    "_glDepthFunc": _glDepthFunc,
    "_glDepthMask": _glDepthMask,
    "_glDisable": _glDisable,
    "_glDisableVertexAttribArray": _glDisableVertexAttribArray,
    "_glDrawArrays": _glDrawArrays,
    "_glDrawElements": _glDrawElements,
    "_glEnable": _glEnable,
    "_glEnableVertexAttribArray": _glEnableVertexAttribArray,
    "_glEndQuery": _glEndQuery,
    "_glEndTransformFeedback": _glEndTransformFeedback,
    "_glFinish": _glFinish,
    "_glFlush": _glFlush,
    "_glGenBuffers": _glGenBuffers,
    "_glGenTextures": _glGenTextures,
    "_glGetFloatv": _glGetFloatv,
    "_glGetIntegerv": _glGetIntegerv,
    "_glGetProgramInfoLog": _glGetProgramInfoLog,
    "_glGetProgramiv": _glGetProgramiv,
    "_glGetShaderInfoLog": _glGetShaderInfoLog,
    "_glGetShaderiv": _glGetShaderiv,
    "_glGetString": _glGetString,
    "_glGetUniformLocation": _glGetUniformLocation,
    "_glIsEnabled": _glIsEnabled,
    "_glIsTexture": _glIsTexture,
    "_glLineWidth": _glLineWidth,
    "_glLinkProgram": _glLinkProgram,
    "_glReadPixels": _glReadPixels,
    "_glShaderSource": _glShaderSource,
    "_glStencilFunc": _glStencilFunc,
    "_glStencilOp": _glStencilOp,
    "_glTexImage2D": _glTexImage2D,
    "_glTexParameteri": _glTexParameteri,
    "_glUniform1f": _glUniform1f,
    "_glUniform1i": _glUniform1i,
    "_glUniform1iv": _glUniform1iv,
    "_glUniform3fv": _glUniform3fv,
    "_glUniform4f": _glUniform4f,
    "_glUniform4fv": _glUniform4fv,
    "_glUniformMatrix4fv": _glUniformMatrix4fv,
    "_glUseProgram": _glUseProgram,
    "_glVertexAttribPointer": _glVertexAttribPointer,
    "_glViewport": _glViewport,
    "_gmtime": _gmtime,
    "_gmtime_r": _gmtime_r,
    "_imFindIdb": _imFindIdb,
    "_imMakeIdb": _imMakeIdb,
    "_imReadAudio": _imReadAudio,
    "_imReadIdb": _imReadIdb,
    "_imRenameAudio": _imRenameAudio,
    "_imWaitJobBg": _imWaitJobBg,
    "_imWrGamess": _imWrGamess,
    "_imWriteAudio": _imWriteAudio,
    "_imWriteIdb": _imWriteIdb,
    "_llvm_bswap_i64": _llvm_bswap_i64,
    "_llvm_exp2_f32": _llvm_exp2_f32,
    "_llvm_exp2_f64": _llvm_exp2_f64,
    "_llvm_log10_f32": _llvm_log10_f32,
    "_llvm_log10_f64": _llvm_log10_f64,
    "_llvm_trap": _llvm_trap,
    "_llvm_trunc_f64": _llvm_trunc_f64,
    "_localtime": _localtime,
    "_localtime_r": _localtime_r,
    "_longjmp": _longjmp,
    "_mcLoopStep": _mcLoopStep,
    "_mkProfileSeq": _mkProfileSeq,
    "_mktime": _mktime,
    "_popen": _popen,
    "_putenv": _putenv,
    "_rdGamess": _rdGamess,
    "_sqrt": _sqrt,
    "_strftime": _strftime,
    "_strptime": _strptime,
    "_time": _time,
    "_tzset": _tzset,
    "_usleep": _usleep,
    "abortOnCannotGrowMemory": abortOnCannotGrowMemory,
    "constNoSmartPtrRawPointerToWireType": constNoSmartPtrRawPointerToWireType,
    "count_emval_handles": count_emval_handles,
    "craftInvokerFunction": craftInvokerFunction,
    "createNamedFunction": createNamedFunction,
    "downcastPointer": downcastPointer,
    "embind__requireFunction": embind__requireFunction,
    "embind_init_charCodes": embind_init_charCodes,
    "emscriptenWebGLGet": emscriptenWebGLGet,
    "emscriptenWebGLGetTexPixelData": emscriptenWebGLGetTexPixelData,
    "emscripten_realloc_buffer": emscripten_realloc_buffer,
    "emval_get_global": emval_get_global,
    "ensureOverloadTable": ensureOverloadTable,
    "exposePublicSymbol": exposePublicSymbol,
    "extendError": extendError,
    "floatReadValueFromPointer": floatReadValueFromPointer,
    "flushPendingDeletes": flushPendingDeletes,
    "genericPointerToWireType": genericPointerToWireType,
    "getBasestPointer": getBasestPointer,
    "getInheritedInstance": getInheritedInstance,
    "getInheritedInstanceCount": getInheritedInstanceCount,
    "getLiveInheritedInstances": getLiveInheritedInstances,
    "getShiftFromSize": getShiftFromSize,
    "getStringOrSymbol": getStringOrSymbol,
    "getTypeName": getTypeName,
    "get_first_emval": get_first_emval,
    "heap32VectorToArray": heap32VectorToArray,
    "init_ClassHandle": init_ClassHandle,
    "init_RegisteredPointer": init_RegisteredPointer,
    "init_embind": init_embind,
    "init_emval": init_emval,
    "integerReadValueFromPointer": integerReadValueFromPointer,
    "makeClassHandle": makeClassHandle,
    "makeLegalFunctionName": makeLegalFunctionName,
    "new_": new_,
    "nonConstNoSmartPtrRawPointerToWireType": nonConstNoSmartPtrRawPointerToWireType,
    "readLatin1String": readLatin1String,
    "registerType": registerType,
    "replacePublicSymbol": replacePublicSymbol,
    "requireHandle": requireHandle,
    "requireRegisteredType": requireRegisteredType,
    "runDestructor": runDestructor,
    "runDestructors": runDestructors,
    "setDelayFunction": setDelayFunction,
    "shallowCopyInternalPointer": shallowCopyInternalPointer,
    "simpleReadValueFromPointer": simpleReadValueFromPointer,
    "stringToNewUTF8": stringToNewUTF8,
    "throwBindingError": throwBindingError,
    "throwInstanceAlreadyDeleted": throwInstanceAlreadyDeleted,
    "throwInternalError": throwInternalError,
    "throwUnboundTypeError": throwUnboundTypeError,
    "upcastPointer": upcastPointer,
    "validateThis": validateThis,
    "whenDependentTypesAreResolved": whenDependentTypesAreResolved,
    "tempDoublePtr": tempDoublePtr,
    "DYNAMICTOP_PTR": DYNAMICTOP_PTR,
    "___dso_handle": ___dso_handle
};
var asm = Module["asm"](asmGlobalArg, asmLibraryArg, buffer);
var real____cxa_can_catch = asm["___cxa_can_catch"];
asm["___cxa_can_catch"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real____cxa_can_catch.apply(null, arguments)
};
var real____cxa_is_pointer_type = asm["___cxa_is_pointer_type"];
asm["___cxa_is_pointer_type"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real____cxa_is_pointer_type.apply(null, arguments)
};
var real____errno_location = asm["___errno_location"];
asm["___errno_location"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real____errno_location.apply(null, arguments)
};
var real____getTypeName = asm["___getTypeName"];
asm["___getTypeName"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real____getTypeName.apply(null, arguments)
};
var real___get_daylight = asm["__get_daylight"];
asm["__get_daylight"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real___get_daylight.apply(null, arguments)
};
var real___get_environ = asm["__get_environ"];
asm["__get_environ"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real___get_environ.apply(null, arguments)
};
var real___get_timezone = asm["__get_timezone"];
asm["__get_timezone"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real___get_timezone.apply(null, arguments)
};
var real___get_tzname = asm["__get_tzname"];
asm["__get_tzname"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real___get_tzname.apply(null, arguments)
};
var real__fflush = asm["_fflush"];
asm["_fflush"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real__fflush.apply(null, arguments)
};
var real__free = asm["_free"];
asm["_free"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real__free.apply(null, arguments)
};
var real__htonl = asm["_htonl"];
asm["_htonl"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real__htonl.apply(null, arguments)
};
var real__htons = asm["_htons"];
asm["_htons"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real__htons.apply(null, arguments)
};
var real__llvm_bswap_i16 = asm["_llvm_bswap_i16"];
asm["_llvm_bswap_i16"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real__llvm_bswap_i16.apply(null, arguments)
};
var real__llvm_bswap_i32 = asm["_llvm_bswap_i32"];
asm["_llvm_bswap_i32"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real__llvm_bswap_i32.apply(null, arguments)
};
var real__llvm_rint_f64 = asm["_llvm_rint_f64"];
asm["_llvm_rint_f64"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real__llvm_rint_f64.apply(null, arguments)
};
var real__main = asm["_main"];
asm["_main"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real__main.apply(null, arguments)
};
var real__malloc = asm["_malloc"];
asm["_malloc"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real__malloc.apply(null, arguments)
};
var real__memmove = asm["_memmove"];
asm["_memmove"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real__memmove.apply(null, arguments)
};
var real__ntohs = asm["_ntohs"];
asm["_ntohs"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real__ntohs.apply(null, arguments)
};
var real__realloc = asm["_realloc"];
asm["_realloc"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real__realloc.apply(null, arguments)
};
var real__saveSetjmp = asm["_saveSetjmp"];
asm["_saveSetjmp"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real__saveSetjmp.apply(null, arguments)
};
var real__sbrk = asm["_sbrk"];
asm["_sbrk"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real__sbrk.apply(null, arguments)
};
var real__setThrew = asm["_setThrew"];
asm["_setThrew"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real__setThrew.apply(null, arguments)
};
var real__strlen = asm["_strlen"];
asm["_strlen"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real__strlen.apply(null, arguments)
};
var real__testSetjmp = asm["_testSetjmp"];
asm["_testSetjmp"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real__testSetjmp.apply(null, arguments)
};
var real_establishStackSpace = asm["establishStackSpace"];
asm["establishStackSpace"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real_establishStackSpace.apply(null, arguments)
};
var real_globalCtors = asm["globalCtors"];
asm["globalCtors"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real_globalCtors.apply(null, arguments)
};
var real_stackAlloc = asm["stackAlloc"];
asm["stackAlloc"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real_stackAlloc.apply(null, arguments)
};
var real_stackRestore = asm["stackRestore"];
asm["stackRestore"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real_stackRestore.apply(null, arguments)
};
var real_stackSave = asm["stackSave"];
asm["stackSave"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return real_stackSave.apply(null, arguments)
};
Module["asm"] = asm;
var ___cxa_can_catch = Module["___cxa_can_catch"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["___cxa_can_catch"].apply(null, arguments)
};
var ___cxa_is_pointer_type = Module["___cxa_is_pointer_type"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["___cxa_is_pointer_type"].apply(null, arguments)
};
var ___errno_location = Module["___errno_location"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["___errno_location"].apply(null, arguments)
};
var ___getTypeName = Module["___getTypeName"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["___getTypeName"].apply(null, arguments)
};
var __get_daylight = Module["__get_daylight"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["__get_daylight"].apply(null, arguments)
};
var __get_environ = Module["__get_environ"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["__get_environ"].apply(null, arguments)
};
var __get_timezone = Module["__get_timezone"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["__get_timezone"].apply(null, arguments)
};
var __get_tzname = Module["__get_tzname"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["__get_tzname"].apply(null, arguments)
};
var _emscripten_replace_memory = Module["_emscripten_replace_memory"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["_emscripten_replace_memory"].apply(null, arguments)
};
var _fflush = Module["_fflush"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["_fflush"].apply(null, arguments)
};
var _free = Module["_free"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["_free"].apply(null, arguments)
};
var _htonl = Module["_htonl"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["_htonl"].apply(null, arguments)
};
var _htons = Module["_htons"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["_htons"].apply(null, arguments)
};
var _llvm_bswap_i16 = Module["_llvm_bswap_i16"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["_llvm_bswap_i16"].apply(null, arguments)
};
var _llvm_bswap_i32 = Module["_llvm_bswap_i32"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["_llvm_bswap_i32"].apply(null, arguments)
};
var _llvm_rint_f64 = Module["_llvm_rint_f64"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["_llvm_rint_f64"].apply(null, arguments)
};
var _main = Module["_main"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["_main"].apply(null, arguments)
};
var _malloc = Module["_malloc"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["_malloc"].apply(null, arguments)
};
var _memcpy = Module["_memcpy"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["_memcpy"].apply(null, arguments)
};
var _memmove = Module["_memmove"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["_memmove"].apply(null, arguments)
};
var _memset = Module["_memset"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["_memset"].apply(null, arguments)
};
var _ntohs = Module["_ntohs"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["_ntohs"].apply(null, arguments)
};
var _realloc = Module["_realloc"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["_realloc"].apply(null, arguments)
};
var _saveSetjmp = Module["_saveSetjmp"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["_saveSetjmp"].apply(null, arguments)
};
var _sbrk = Module["_sbrk"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["_sbrk"].apply(null, arguments)
};
var _setThrew = Module["_setThrew"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["_setThrew"].apply(null, arguments)
};
var _strlen = Module["_strlen"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["_strlen"].apply(null, arguments)
};
var _testSetjmp = Module["_testSetjmp"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["_testSetjmp"].apply(null, arguments)
};
var establishStackSpace = Module["establishStackSpace"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["establishStackSpace"].apply(null, arguments)
};
var globalCtors = Module["globalCtors"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["globalCtors"].apply(null, arguments)
};
var stackAlloc = Module["stackAlloc"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["stackAlloc"].apply(null, arguments)
};
var stackRestore = Module["stackRestore"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["stackRestore"].apply(null, arguments)
};
var stackSave = Module["stackSave"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["stackSave"].apply(null, arguments)
};
var dynCall_dd = Module["dynCall_dd"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_dd"].apply(null, arguments)
};
var dynCall_di = Module["dynCall_di"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_di"].apply(null, arguments)
};
var dynCall_dii = Module["dynCall_dii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_dii"].apply(null, arguments)
};
var dynCall_diii = Module["dynCall_diii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_diii"].apply(null, arguments)
};
var dynCall_diiii = Module["dynCall_diiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_diiii"].apply(null, arguments)
};
var dynCall_diiiii = Module["dynCall_diiiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_diiiii"].apply(null, arguments)
};
var dynCall_i = Module["dynCall_i"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_i"].apply(null, arguments)
};
var dynCall_ii = Module["dynCall_ii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_ii"].apply(null, arguments)
};
var dynCall_iid = Module["dynCall_iid"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_iid"].apply(null, arguments)
};
var dynCall_iidi = Module["dynCall_iidi"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_iidi"].apply(null, arguments)
};
var dynCall_iif = Module["dynCall_iif"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_iif"].apply(null, arguments)
};
var dynCall_iii = Module["dynCall_iii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_iii"].apply(null, arguments)
};
var dynCall_iiid = Module["dynCall_iiid"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_iiid"].apply(null, arguments)
};
var dynCall_iiidi = Module["dynCall_iiidi"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_iiidi"].apply(null, arguments)
};
var dynCall_iiii = Module["dynCall_iiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_iiii"].apply(null, arguments)
};
var dynCall_iiiii = Module["dynCall_iiiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_iiiii"].apply(null, arguments)
};
var dynCall_iiiiii = Module["dynCall_iiiiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_iiiiii"].apply(null, arguments)
};
var dynCall_iiiiiiii = Module["dynCall_iiiiiiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_iiiiiiii"].apply(null, arguments)
};
var dynCall_iiiiiiiiiiiiiiii = Module["dynCall_iiiiiiiiiiiiiiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_iiiiiiiiiiiiiiii"].apply(null, arguments)
};
var dynCall_iiiiiiiiiiiiiiiii = Module["dynCall_iiiiiiiiiiiiiiiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_iiiiiiiiiiiiiiiii"].apply(null, arguments)
};
var dynCall_iij = Module["dynCall_iij"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_iij"].apply(null, arguments)
};
var dynCall_v = Module["dynCall_v"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_v"].apply(null, arguments)
};
var dynCall_vi = Module["dynCall_vi"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_vi"].apply(null, arguments)
};
var dynCall_vid = Module["dynCall_vid"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_vid"].apply(null, arguments)
};
var dynCall_vidddddi = Module["dynCall_vidddddi"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_vidddddi"].apply(null, arguments)
};
var dynCall_vii = Module["dynCall_vii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_vii"].apply(null, arguments)
};
var dynCall_viid = Module["dynCall_viid"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_viid"].apply(null, arguments)
};
var dynCall_viii = Module["dynCall_viii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_viii"].apply(null, arguments)
};
var dynCall_viiid = Module["dynCall_viiid"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_viiid"].apply(null, arguments)
};
var dynCall_viiidd = Module["dynCall_viiidd"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_viiidd"].apply(null, arguments)
};
var dynCall_viiii = Module["dynCall_viiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_viiii"].apply(null, arguments)
};
var dynCall_viiiii = Module["dynCall_viiiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_viiiii"].apply(null, arguments)
};
var dynCall_viiiiii = Module["dynCall_viiiiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_viiiiii"].apply(null, arguments)
};
var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_viiiiiiiii"].apply(null, arguments)
};
var dynCall_viij = Module["dynCall_viij"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dynCall_viij"].apply(null, arguments)
};
Module["asm"] = asm;
if (!Module["intArrayFromString"]) Module["intArrayFromString"] = function () {
    abort("'intArrayFromString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["intArrayToString"]) Module["intArrayToString"] = function () {
    abort("'intArrayToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["ccall"]) Module["ccall"] = function () {
    abort("'ccall' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["cwrap"]) Module["cwrap"] = function () {
    abort("'cwrap' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["setValue"]) Module["setValue"] = function () {
    abort("'setValue' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["getValue"]) Module["getValue"] = function () {
    abort("'getValue' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["allocate"]) Module["allocate"] = function () {
    abort("'allocate' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["getMemory"]) Module["getMemory"] = function () {
    abort("'getMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Module["AsciiToString"]) Module["AsciiToString"] = function () {
    abort("'AsciiToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["stringToAscii"]) Module["stringToAscii"] = function () {
    abort("'stringToAscii' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["UTF8ArrayToString"]) Module["UTF8ArrayToString"] = function () {
    abort("'UTF8ArrayToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["UTF8ToString"]) Module["UTF8ToString"] = function () {
    abort("'UTF8ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["stringToUTF8Array"]) Module["stringToUTF8Array"] = function () {
    abort("'stringToUTF8Array' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["stringToUTF8"]) Module["stringToUTF8"] = function () {
    abort("'stringToUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["lengthBytesUTF8"]) Module["lengthBytesUTF8"] = function () {
    abort("'lengthBytesUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["UTF16ToString"]) Module["UTF16ToString"] = function () {
    abort("'UTF16ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["stringToUTF16"]) Module["stringToUTF16"] = function () {
    abort("'stringToUTF16' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["lengthBytesUTF16"]) Module["lengthBytesUTF16"] = function () {
    abort("'lengthBytesUTF16' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["UTF32ToString"]) Module["UTF32ToString"] = function () {
    abort("'UTF32ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["stringToUTF32"]) Module["stringToUTF32"] = function () {
    abort("'stringToUTF32' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["lengthBytesUTF32"]) Module["lengthBytesUTF32"] = function () {
    abort("'lengthBytesUTF32' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["allocateUTF8"]) Module["allocateUTF8"] = function () {
    abort("'allocateUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["stackTrace"]) Module["stackTrace"] = function () {
    abort("'stackTrace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["addOnPreRun"]) Module["addOnPreRun"] = function () {
    abort("'addOnPreRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["addOnInit"]) Module["addOnInit"] = function () {
    abort("'addOnInit' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["addOnPreMain"]) Module["addOnPreMain"] = function () {
    abort("'addOnPreMain' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["addOnExit"]) Module["addOnExit"] = function () {
    abort("'addOnExit' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["addOnPostRun"]) Module["addOnPostRun"] = function () {
    abort("'addOnPostRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["writeStringToMemory"]) Module["writeStringToMemory"] = function () {
    abort("'writeStringToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["writeArrayToMemory"]) Module["writeArrayToMemory"] = function () {
    abort("'writeArrayToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["writeAsciiToMemory"]) Module["writeAsciiToMemory"] = function () {
    abort("'writeAsciiToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["addRunDependency"]) Module["addRunDependency"] = function () {
    abort("'addRunDependency' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Module["removeRunDependency"]) Module["removeRunDependency"] = function () {
    abort("'removeRunDependency' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Module["ENV"]) Module["ENV"] = function () {
    abort("'ENV' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["FS"]) Module["FS"] = function () {
    abort("'FS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["FS_createFolder"]) Module["FS_createFolder"] = function () {
    abort("'FS_createFolder' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Module["FS_createPath"]) Module["FS_createPath"] = function () {
    abort("'FS_createPath' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Module["FS_createDataFile"]) Module["FS_createDataFile"] = function () {
    abort("'FS_createDataFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Module["FS_createPreloadedFile"]) Module["FS_createPreloadedFile"] = function () {
    abort("'FS_createPreloadedFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Module["FS_createLazyFile"]) Module["FS_createLazyFile"] = function () {
    abort("'FS_createLazyFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Module["FS_createLink"]) Module["FS_createLink"] = function () {
    abort("'FS_createLink' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Module["FS_createDevice"]) Module["FS_createDevice"] = function () {
    abort("'FS_createDevice' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Module["FS_unlink"]) Module["FS_unlink"] = function () {
    abort("'FS_unlink' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
};
if (!Module["GL"]) Module["GL"] = function () {
    abort("'GL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["dynamicAlloc"]) Module["dynamicAlloc"] = function () {
    abort("'dynamicAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["warnOnce"]) Module["warnOnce"] = function () {
    abort("'warnOnce' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["loadDynamicLibrary"]) Module["loadDynamicLibrary"] = function () {
    abort("'loadDynamicLibrary' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["loadWebAssemblyModule"]) Module["loadWebAssemblyModule"] = function () {
    abort("'loadWebAssemblyModule' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["getLEB"]) Module["getLEB"] = function () {
    abort("'getLEB' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["getFunctionTables"]) Module["getFunctionTables"] = function () {
    abort("'getFunctionTables' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["alignFunctionTables"]) Module["alignFunctionTables"] = function () {
    abort("'alignFunctionTables' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["registerFunctions"]) Module["registerFunctions"] = function () {
    abort("'registerFunctions' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["addFunction"]) Module["addFunction"] = function () {
    abort("'addFunction' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["removeFunction"]) Module["removeFunction"] = function () {
    abort("'removeFunction' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["getFuncWrapper"]) Module["getFuncWrapper"] = function () {
    abort("'getFuncWrapper' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["prettyPrint"]) Module["prettyPrint"] = function () {
    abort("'prettyPrint' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["makeBigInt"]) Module["makeBigInt"] = function () {
    abort("'makeBigInt' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["dynCall"]) Module["dynCall"] = function () {
    abort("'dynCall' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["getCompilerSetting"]) Module["getCompilerSetting"] = function () {
    abort("'getCompilerSetting' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["stackSave"]) Module["stackSave"] = function () {
    abort("'stackSave' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["stackRestore"]) Module["stackRestore"] = function () {
    abort("'stackRestore' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["stackAlloc"]) Module["stackAlloc"] = function () {
    abort("'stackAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["establishStackSpace"]) Module["establishStackSpace"] = function () {
    abort("'establishStackSpace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["print"]) Module["print"] = function () {
    abort("'print' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["printErr"]) Module["printErr"] = function () {
    abort("'printErr' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["getTempRet0"]) Module["getTempRet0"] = function () {
    abort("'getTempRet0' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["setTempRet0"]) Module["setTempRet0"] = function () {
    abort("'setTempRet0' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["Pointer_stringify"]) Module["Pointer_stringify"] = function () {
    abort("'Pointer_stringify' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
};
if (!Module["ALLOC_NORMAL"]) Object.defineProperty(Module, "ALLOC_NORMAL", {
    get: function () {
        abort("'ALLOC_NORMAL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
});
if (!Module["ALLOC_STACK"]) Object.defineProperty(Module, "ALLOC_STACK", {
    get: function () {
        abort("'ALLOC_STACK' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
});
if (!Module["ALLOC_DYNAMIC"]) Object.defineProperty(Module, "ALLOC_DYNAMIC", {
    get: function () {
        abort("'ALLOC_DYNAMIC' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
});
if (!Module["ALLOC_NONE"]) Object.defineProperty(Module, "ALLOC_NONE", {
    get: function () {
        abort("'ALLOC_NONE' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
});

function ExitStatus(status) {
    this.name = "ExitStatus";
    this.message = "Program terminated with exit(" + status + ")";
    this.status = status
}

ExitStatus.prototype = new Error;
ExitStatus.prototype.constructor = ExitStatus;
var calledMain = false;
dependenciesFulfilled = function runCaller() {
    if (!Module["calledRun"]) run();
    if (!Module["calledRun"]) dependenciesFulfilled = runCaller
};
Module["callMain"] = function callMain(args) {
    assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on Module["onRuntimeInitialized"])');
    assert(__ATPRERUN__.length == 0, "cannot call main when preRun functions remain to be called");
    args = args || [];
    ensureInitRuntime();
    var argc = args.length + 1;
    var argv = stackAlloc((argc + 1) * 4);
    HEAP32[argv >> 2] = allocateUTF8OnStack(Module["thisProgram"]);
    for (var i = 1; i < argc; i++) {
        HEAP32[(argv >> 2) + i] = allocateUTF8OnStack(args[i - 1])
    }
    HEAP32[(argv >> 2) + argc] = 0;
    try {
        var ret = Module["_main"](argc, argv, 0);
        exit(ret, true)
    } catch (e) {
        if (e instanceof ExitStatus) {
            return
        } else if (e == "SimulateInfiniteLoop") {
            Module["noExitRuntime"] = true;
            return
        } else {
            var toLog = e;
            if (e && typeof e === "object" && e.stack) {
                toLog = [e, e.stack]
            }
            err("exception thrown: " + toLog);
            Module["quit"](1, e)
        }
    } finally {
        calledMain = true
    }
};

function run(args) {
    args = args || Module["arguments"];
    if (runDependencies > 0) {
        return
    }
    writeStackCookie();
    preRun();
    if (runDependencies > 0) return;
    if (Module["calledRun"]) return;

    function doRun() {
        if (Module["calledRun"]) return;
        Module["calledRun"] = true;
        if (ABORT) return;
        ensureInitRuntime();
        preMain();
        if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
        if (Module["_main"] && shouldRunNow) Module["callMain"](args);
        postRun()
    }

    if (Module["setStatus"]) {
        Module["setStatus"]("Running...");
        setTimeout(function () {
            setTimeout(function () {
                Module["setStatus"]("")
            }, 1);
            doRun()
        }, 1)
    } else {
        doRun()
    }
    checkStackCookie()
}

Module["run"] = run;

function exit(status, implicit) {
    if (implicit && Module["noExitRuntime"] && status === 0) {
        return
    }
    if (Module["noExitRuntime"]) {
        if (!implicit) {
            err("exit(" + status + ") called, but noExitRuntime is set due to an async operation, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)")
        }
    } else {
        ABORT = true;
        EXITSTATUS = status;
        exitRuntime();
        if (Module["onExit"]) Module["onExit"](status)
    }
    Module["quit"](status, new ExitStatus(status))
}

var abortDecorators = [];

function abort(what) {
    if (Module["onAbort"]) {
        Module["onAbort"](what)
    }
    if (what !== undefined) {
        out(what);
        err(what);
        what = JSON.stringify(what)
    } else {
        what = ""
    }
    ABORT = true;
    EXITSTATUS = 1;
    var extra = "";
    var output = "abort(" + what + ") at " + stackTrace() + extra;
    if (abortDecorators) {
        abortDecorators.forEach(function (decorator) {
            output = decorator(output, what)
        })
    }
    throw output
}

Module["abort"] = abort;
if (Module["preInit"]) {
    if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
    while (Module["preInit"].length > 0) {
        Module["preInit"].pop()()
    }
}
var shouldRunNow = true;
if (Module["noInitialRun"]) {
    shouldRunNow = false
}
run();
