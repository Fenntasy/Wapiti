/* global window Blob FileReader FormData URLSearchParams XMLHttpRequest */
var fetchBrowser = window.fetch;

(function(global, factory) {
  global.fetchVCR = factory();
})(window, function() {
  "use strict";

  (function(self) {
    "use strict";

    if (self.fetch) {
      return;
    }

    var support = {
      searchParams: "URLSearchParams" in self,
      iterable: "Symbol" in self && "iterator" in Symbol,
      blob:
        "FileReader" in self &&
        "Blob" in self &&
        (function() {
          try {
            new Blob();
            return true;
          } catch (e) {
            return false;
          }
        })(),
      formData: "FormData" in self,
      arrayBuffer: "ArrayBuffer" in self
    };

    if (support.arrayBuffer) {
      var viewClasses = [
        "[object Int8Array]",
        "[object Uint8Array]",
        "[object Uint8ClampedArray]",
        "[object Int16Array]",
        "[object Uint16Array]",
        "[object Int32Array]",
        "[object Uint32Array]",
        "[object Float32Array]",
        "[object Float64Array]"
      ];

      var isDataView = function(obj) {
        return obj && DataView.prototype.isPrototypeOf(obj);
      };

      var isArrayBufferView =
        ArrayBuffer.isView ||
        function(obj) {
          return (
            obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
          );
        };
    }

    function normalizeName(name) {
      if (typeof name !== "string") {
        name = String(name);
      }
      if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
        throw new TypeError("Invalid character in header field name");
      }
      return name.toLowerCase();
    }

    function normalizeValue(value) {
      if (typeof value !== "string") {
        value = String(value);
      }
      return value;
    }

    // Build a destructive iterator for the value list
    function iteratorFor(items) {
      var iterator = {
        next: function() {
          var value = items.shift();
          return { done: value === undefined, value: value };
        }
      };

      if (support.iterable) {
        iterator[Symbol.iterator] = function() {
          return iterator;
        };
      }

      return iterator;
    }

    function Headers(headers) {
      this.map = {};

      if (headers instanceof Headers) {
        headers.forEach(function(value, name) {
          this.append(name, value);
        }, this);
      } else if (Array.isArray(headers)) {
        headers.forEach(function(header) {
          this.append(header[0], header[1]);
        }, this);
      } else if (headers) {
        Object.getOwnPropertyNames(headers).forEach(function(name) {
          this.append(name, headers[name]);
        }, this);
      }
    }

    Headers.prototype.append = function(name, value) {
      name = normalizeName(name);
      value = normalizeValue(value);
      var oldValue = this.map[name];
      this.map[name] = oldValue ? oldValue + "," + value : value;
    };

    Headers.prototype["delete"] = function(name) {
      delete this.map[normalizeName(name)];
    };

    Headers.prototype.get = function(name) {
      name = normalizeName(name);
      return this.has(name) ? this.map[name] : null;
    };

    Headers.prototype.has = function(name) {
      return this.map.hasOwnProperty(normalizeName(name));
    };

    Headers.prototype.set = function(name, value) {
      this.map[normalizeName(name)] = normalizeValue(value);
    };

    Headers.prototype.forEach = function(callback, thisArg) {
      for (var name in this.map) {
        if (this.map.hasOwnProperty(name)) {
          callback.call(thisArg, this.map[name], name, this);
        }
      }
    };

    Headers.prototype.keys = function() {
      var items = [];
      this.forEach(function(value, name) {
        items.push(name);
      });
      return iteratorFor(items);
    };

    Headers.prototype.values = function() {
      var items = [];
      this.forEach(function(value) {
        items.push(value);
      });
      return iteratorFor(items);
    };

    Headers.prototype.entries = function() {
      var items = [];
      this.forEach(function(value, name) {
        items.push([name, value]);
      });
      return iteratorFor(items);
    };

    if (support.iterable) {
      Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
    }

    function consumed(body) {
      if (body.bodyUsed) {
        return Promise.reject(new TypeError("Already read"));
      }
      body.bodyUsed = true;
    }

    function fileReaderReady(reader) {
      return new Promise(function(resolve, reject) {
        reader.onload = function() {
          resolve(reader.result);
        };
        reader.onerror = function() {
          reject(reader.error);
        };
      });
    }

    function readBlobAsArrayBuffer(blob) {
      var reader = new FileReader();
      var promise = fileReaderReady(reader);
      reader.readAsArrayBuffer(blob);
      return promise;
    }

    function readBlobAsText(blob) {
      var reader = new FileReader();
      var promise = fileReaderReady(reader);
      reader.readAsText(blob);
      return promise;
    }

    function readArrayBufferAsText(buf) {
      var view = new Uint8Array(buf);
      var chars = new Array(view.length);

      for (var i = 0; i < view.length; i++) {
        chars[i] = String.fromCharCode(view[i]);
      }
      return chars.join("");
    }

    function bufferClone(buf) {
      if (buf.slice) {
        return buf.slice(0);
      } else {
        var view = new Uint8Array(buf.byteLength);
        view.set(new Uint8Array(buf));
        return view.buffer;
      }
    }

    function Body() {
      this.bodyUsed = false;

      this._initBody = function(body) {
        this._bodyInit = body;
        if (!body) {
          this._bodyText = "";
        } else if (typeof body === "string") {
          this._bodyText = body;
        } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
          this._bodyBlob = body;
        } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
          this._bodyFormData = body;
        } else if (
          support.searchParams &&
          URLSearchParams.prototype.isPrototypeOf(body)
        ) {
          this._bodyText = body.toString();
        } else if (support.arrayBuffer && support.blob && isDataView(body)) {
          this._bodyArrayBuffer = bufferClone(body.buffer);
          // IE 10-11 can't handle a DataView body.
          this._bodyInit = new Blob([this._bodyArrayBuffer]);
        } else if (
          support.arrayBuffer &&
          (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))
        ) {
          this._bodyArrayBuffer = bufferClone(body);
        } else {
          throw new Error("unsupported BodyInit type");
        }

        if (!this.headers.get("content-type")) {
          if (typeof body === "string") {
            this.headers.set("content-type", "text/plain;charset=UTF-8");
          } else if (this._bodyBlob && this._bodyBlob.type) {
            this.headers.set("content-type", this._bodyBlob.type);
          } else if (
            support.searchParams &&
            URLSearchParams.prototype.isPrototypeOf(body)
          ) {
            this.headers.set(
              "content-type",
              "application/x-www-form-urlencoded;charset=UTF-8"
            );
          }
        }
      };

      if (support.blob) {
        this.blob = function() {
          var rejected = consumed(this);
          if (rejected) {
            return rejected;
          }

          if (this._bodyBlob) {
            return Promise.resolve(this._bodyBlob);
          } else if (this._bodyArrayBuffer) {
            return Promise.resolve(new Blob([this._bodyArrayBuffer]));
          } else if (this._bodyFormData) {
            throw new Error("could not read FormData body as blob");
          } else {
            return Promise.resolve(new Blob([this._bodyText]));
          }
        };

        this.arrayBuffer = function() {
          if (this._bodyArrayBuffer) {
            return consumed(this) || Promise.resolve(this._bodyArrayBuffer);
          } else {
            return this.blob().then(readBlobAsArrayBuffer);
          }
        };
      }

      this.text = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected;
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob);
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
        } else if (this._bodyFormData) {
          throw new Error("could not read FormData body as text");
        } else {
          return Promise.resolve(this._bodyText);
        }
      };

      if (support.formData) {
        this.formData = function() {
          return this.text().then(decode);
        };
      }

      this.json = function() {
        return this.text().then(JSON.parse);
      };

      return this;
    }

    // HTTP methods whose capitalization should be normalized
    var methods = ["DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"];

    function normalizeMethod(method) {
      var upcased = method.toUpperCase();
      return methods.indexOf(upcased) > -1 ? upcased : method;
    }

    function Request(input, options) {
      options = options || {};
      var body = options.body;

      if (input instanceof Request) {
        if (input.bodyUsed) {
          throw new TypeError("Already read");
        }
        this.url = input.url;
        this.credentials = input.credentials;
        if (!options.headers) {
          this.headers = new Headers(input.headers);
        }
        this.method = input.method;
        this.mode = input.mode;
        if (!body && input._bodyInit != null) {
          body = input._bodyInit;
          input.bodyUsed = true;
        }
      } else {
        this.url = String(input);
      }

      this.credentials = options.credentials || this.credentials || "omit";
      if (options.headers || !this.headers) {
        this.headers = new Headers(options.headers);
      }
      this.method = normalizeMethod(options.method || this.method || "GET");
      this.mode = options.mode || this.mode || null;
      this.referrer = null;

      if ((this.method === "GET" || this.method === "HEAD") && body) {
        throw new TypeError("Body not allowed for GET or HEAD requests");
      }
      this._initBody(body);
    }

    Request.prototype.clone = function() {
      return new Request(this, { body: this._bodyInit });
    };

    function decode(body) {
      var form = new FormData();
      body
        .trim()
        .split("&")
        .forEach(function(bytes) {
          if (bytes) {
            var split = bytes.split("=");
            var name = split.shift().replace(/\+/g, " ");
            var value = split.join("=").replace(/\+/g, " ");
            form.append(decodeURIComponent(name), decodeURIComponent(value));
          }
        });
      return form;
    }

    function parseHeaders(rawHeaders) {
      var headers = new Headers();
      rawHeaders.split(/\r?\n/).forEach(function(line) {
        var parts = line.split(":");
        var key = parts.shift().trim();
        if (key) {
          var value = parts.join(":").trim();
          headers.append(key, value);
        }
      });
      return headers;
    }

    Body.call(Request.prototype);

    function Response(bodyInit, options) {
      if (!options) {
        options = {};
      }

      this.type = "default";
      this.status = "status" in options ? options.status : 200;
      this.ok = this.status >= 200 && this.status < 300;
      this.statusText = "statusText" in options ? options.statusText : "OK";
      this.headers = new Headers(options.headers);
      this.url = options.url || "";
      this._initBody(bodyInit);
    }

    Body.call(Response.prototype);

    Response.prototype.clone = function() {
      return new Response(this._bodyInit, {
        status: this.status,
        statusText: this.statusText,
        headers: new Headers(this.headers),
        url: this.url
      });
    };

    Response.error = function() {
      var response = new Response(null, { status: 0, statusText: "" });
      response.type = "error";
      return response;
    };

    var redirectStatuses = [301, 302, 303, 307, 308];

    Response.redirect = function(url, status) {
      if (redirectStatuses.indexOf(status) === -1) {
        throw new RangeError("Invalid status code");
      }

      return new Response(null, { status: status, headers: { location: url } });
    };

    self.Headers = Headers;
    self.Request = Request;
    self.Response = Response;

    self.fetch = function(input, init) {
      return new Promise(function(resolve, reject) {
        var request = new Request(input, init);
        var xhr = new XMLHttpRequest();

        xhr.onload = function() {
          var options = {
            status: xhr.status,
            statusText: xhr.statusText,
            headers: parseHeaders(xhr.getAllResponseHeaders() || "")
          };
          options.url =
            "responseURL" in xhr
              ? xhr.responseURL
              : options.headers.get("X-Request-URL");
          var body = "response" in xhr ? xhr.response : xhr.responseText;
          resolve(new Response(body, options));
        };

        xhr.onerror = function() {
          reject(new TypeError("Network request failed"));
        };

        xhr.ontimeout = function() {
          reject(new TypeError("Network request failed"));
        };

        xhr.open(request.method, request.url, true);

        if (request.credentials === "include") {
          xhr.withCredentials = true;
        }

        if ("responseType" in xhr && support.blob) {
          xhr.responseType = "blob";
        }

        request.headers.forEach(function(value, name) {
          xhr.setRequestHeader(name, value);
        });

        xhr.send(
          typeof request._bodyInit === "undefined" ? null : request._bodyInit
        );
      });
    };
    self.fetch.polyfill = true;
    // eslint-disable-next-line no-undef
  })(typeof self !== "undefined" ? self : undefined);

  // 'fetch' is now a global
  var responseBrowser = window.Response;

  var VCR_MODE = null;
  var DEBUG = false;

  // Valid modes:
  // - 'playback': ONLY uses the fixture files (default)
  // - 'cache': tries to use the fixture and if not found then fetched and saves
  // - 'record': forces files to be written
  // - 'erase': deletes the fixture corresponding to the request

  // mode: 'playback' or 'cache' or 'record'
  // fixturePath: './_fixtures/'
  var CONFIGURATION = {
    mode: VCR_MODE,
    fixturePath: "./_fixtures",
    headerBlacklist: ["authorization", "user-agent"] // These need to be lowercase
  };

  function debug(url, message, ...rest) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log(url, message, ...rest);
    }
  }

  // Use the correct constructor if there is a body.
  // In a browser it needs to be the single-arg constructor.
  function newResponse(bodyBuffer, opts) {
    if (bodyBuffer || typeof window === "undefined") {
      return new responseBrowser(bodyBuffer, opts);
    } else {
      return new responseBrowser(null, opts);
    }
  }

  function hashCode(str) {
    var hash = 0,
      i,
      chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  function buildHash(url, args) {
    var json = {};
    if (args) {
      json.method = args.method;
      json.redirect = args.redirect;
      json.body = args.body; // Include POST body in the hash

      // Filter out all the headers in the headerBlacklist
      if (args.headers) {
        json.headers = {};
        var headerKeys = Object.keys(args.headers);
        for (var index in headerKeys) {
          var key = headerKeys[index];
          if (CONFIGURATION.headerBlacklist.indexOf(key.toLowerCase()) < 0) {
            json.headers[key] = args.headers[key];
          }
        }
      }
    }
    // const hash = crypto.createHash('sha256')
    // hash.update(JSON.stringify(json))
    // return hash.digest('hex')
    return hashCode(JSON.stringify(json));
  }

  function buildFilenamePrefix(url, args, hash) {
    args = args || {};
    url = escape(url).replace(/\//g, "_");
    var method = args.method || "GET";
    method = method.toUpperCase();
    return url + "_" + method + "_" + hash;
  }

  function buildOptionsFilename(url, args, hash) {
    return buildFilenamePrefix(url, args, hash) + "_options.json";
  }

  function buildBodyFilename(url, args, hash) {
    return buildFilenamePrefix(url, args, hash) + "_body.raw";
  }

  function loadFixture(url, args) {
    var hash = buildHash(url, args);
    var bodyFilename = buildBodyFilename(url, args, hash);
    var optionsFilename = buildOptionsFilename(url, args, hash);
    var root = CONFIGURATION.fixturePath;

    return Promise.all([
      fetchVCR.loadFile(root, optionsFilename),
      fetchVCR.loadFile(root, bodyFilename)
    ]).then(function(resolvedValues) {
      var optionsBuffer = resolvedValues[0];
      var bodyBuffer = resolvedValues[1];

      var opts = JSON.parse(optionsBuffer.toString());
      if (
        opts.headers &&
        opts.headers["content-type"] &&
        opts.headers["content-type"][0] &&
        /^application\/json/.test(opts.headers["content-type"][0])
      ) {
        // Check that the JSON is parseable
        // There is an odd thing that happens for api.github.com/search/repositories?q=github
        // Extra text is at the end of the JSON when it is saved to the fixture.
        // TODO: remove this hack by fixing it in fetch-vcr
        try {
          bodyBuffer = bodyBuffer.toString();
          JSON.parse(bodyBuffer);
        } catch (e) {
          // JSON occasionally has extra stuff at the end. not sure why
          // Sample message: "Unexpected number in JSON at position 146432"
          var tokens = e.message.split(" ");
          var num = parseInt(tokens[tokens.length - 1]);
          /* eslint-disable no-console */
          console.log("---------------------------------");
          console.log("BUG: could not parse json. Using HACK");
          console.log(url + " " + ((args && args.method) || "GET"));
          console.log('Message: "' + e.message + '"');
          console.log("Parse character:", num);
          console.log("---------------------------------");
          /* eslint-enable no-console */
          bodyBuffer = bodyBuffer.substring(0, num);
        }
      }

      // Use the correct constructor if there is a body
      return newResponse(bodyBuffer, opts);
    });
  }

  function saveFixture(url, args, response) {
    var hash = buildHash(url, args);
    var bodyFilename = buildBodyFilename(url, args, hash);
    var optionsFilename = buildOptionsFilename(url, args, hash);
    // const requestFilename = buildOptionsFilename(url, args, hash) + '_request.log'
    var root = CONFIGURATION.fixturePath;

    // Convert the response body to a Buffer for saving
    debug(url, "getting buffer to save");
    // DO NOT .clone() this response because response.clone() does not work well. See https://github.com/bitinn/node-fetch/issues/151
    return response.text().then(function(bodyBuffer) {
      // Write the Response contents and the Response options
      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = [].concat(value);
      });
      var json = {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: headers
      };
      var optionsRaw = JSON.stringify(json);

      return Promise.all([
        fetchVCR.saveFile(root, bodyFilename, bodyBuffer),
        fetchVCR.saveFile(
          root,
          optionsFilename,
          optionsRaw
        ) /*, fetchVCR.saveFile(root, requestFilename, JSON.stringify(args || {})) */
      ]).then(function() {
        // send a new buffer because response.clone() does not work well. See https://github.com/bitinn/node-fetch/issues/151
        // Use the correct constructor if there is a body
        return newResponse(bodyBuffer, json);
      });
    });
  }

  function fetchVCR(url, args) {
    // Try to load the response from the fixture.
    // Then, if a fixture was not found, either fetch it for reals or error (depending on the VCR_MODE)
    return new Promise(function(resolve, reject) {
      if (CONFIGURATION.mode === "record") {
        // Perform the fetch, save the response, and then yield the original response
        fetchBrowser(url, args)
          .then(function(response) {
            saveFixture(url, args, response)
              .then(resolve)
              .catch(reject);
          })
          .catch(reject);
      } else {
        debug(url, "checking for cached version");
        // Check if cached version exists
        loadFixture(url, args)
          .then(resolve)
          .catch(function(err) {
            // Cached version does not exist
            debug(url, "cached version not found because", err.message);
            if (CONFIGURATION.mode === "cache") {
              debug(url, "making network request");
              // Perform the fetch, save the response, and then yield the original response
              fetchBrowser(url, args)
                .then(function(response) {
                  debug(url, "saving network request");
                  saveFixture(url, args, response)
                    .then(function(val) {
                      debug(url, "done saving");
                      resolve(val);
                    })
                    .catch(reject);
                })
                .catch(reject);
            } else {
              debug(
                url,
                "NOT making network request because VCR_MODE=" +
                  CONFIGURATION.mode
              );
              // throw new Error('fetch-vcr ERROR: Fixture file was not found.')
              reject(err); // TODO: Provide a more detailed message
            }
          });
      }
    });
  }

  fetchVCR.configure = function(config) {
    CONFIGURATION.mode = VCR_MODE || config.mode;
    CONFIGURATION.fixturePath = config.fixturePath || CONFIGURATION.fixturePath;
    if (config.headerBlacklist) {
      CONFIGURATION.headerBlacklist = [];
      config.headerBlacklist.forEach(function(key) {
        CONFIGURATION.headerBlacklist.push(key.toLowerCase());
      });
    }
  };

  fetchVCR.loadFile = window.readfile;
  fetchVCR.saveFile = window.writefile;

  var lib = fetchVCR;

  return lib;
});
