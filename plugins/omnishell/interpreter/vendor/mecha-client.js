var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../libraries/mecha/packages/node_modules/.deno/ms@2.1.3/node_modules/ms/index.js
var require_ms = __commonJS({
  "../../libraries/mecha/packages/node_modules/.deno/ms@2.1.3/node_modules/ms/index.js"(exports, module) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// ../../libraries/mecha/packages/node_modules/.deno/debug@4.4.3/node_modules/debug/src/common.js
var require_common = __commonJS({
  "../../libraries/mecha/packages/node_modules/.deno/debug@4.4.3/node_modules/debug/src/common.js"(exports, module) {
    function setup(env) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce;
      createDebug.disable = disable;
      createDebug.enable = enable;
      createDebug.enabled = enabled;
      createDebug.humanize = require_ms();
      createDebug.destroy = destroy;
      Object.keys(env).forEach((key) => {
        createDebug[key] = env[key];
      });
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        let hash2 = 0;
        for (let i = 0; i < namespace.length; i++) {
          hash2 = (hash2 << 5) - hash2 + namespace.charCodeAt(i);
          hash2 |= 0;
        }
        return createDebug.colors[Math.abs(hash2) % createDebug.colors.length];
      }
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug3(...args) {
          if (!debug3.enabled) {
            return;
          }
          const self = debug3;
          const curr = Number(/* @__PURE__ */ new Date());
          const ms = curr - (prevTime || curr);
          self.diff = ms;
          self.prev = prevTime;
          self.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          let index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
            if (match === "%%") {
              return "%";
            }
            index++;
            const formatter = createDebug.formatters[format];
            if (typeof formatter === "function") {
              const val = args[index];
              match = formatter.call(self, val);
              args.splice(index, 1);
              index--;
            }
            return match;
          });
          createDebug.formatArgs.call(self, args);
          const logFn = self.log || createDebug.log;
          logFn.apply(self, args);
        }
        debug3.namespace = namespace;
        debug3.useColors = createDebug.useColors();
        debug3.color = createDebug.selectColor(namespace);
        debug3.extend = extend;
        debug3.destroy = createDebug.destroy;
        Object.defineProperty(debug3, "enabled", {
          enumerable: true,
          configurable: false,
          get: () => {
            if (enableOverride !== null) {
              return enableOverride;
            }
            if (namespacesCache !== createDebug.namespaces) {
              namespacesCache = createDebug.namespaces;
              enabledCache = createDebug.enabled(namespace);
            }
            return enabledCache;
          },
          set: (v) => {
            enableOverride = v;
          }
        });
        if (typeof createDebug.init === "function") {
          createDebug.init(debug3);
        }
        return debug3;
      }
      function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
      }
      function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
        for (const ns of split) {
          if (ns[0] === "-") {
            createDebug.skips.push(ns.slice(1));
          } else {
            createDebug.names.push(ns);
          }
        }
      }
      function matchesTemplate(search, template) {
        let searchIndex = 0;
        let templateIndex = 0;
        let starIndex = -1;
        let matchIndex = 0;
        while (searchIndex < search.length) {
          if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
            if (template[templateIndex] === "*") {
              starIndex = templateIndex;
              matchIndex = searchIndex;
              templateIndex++;
            } else {
              searchIndex++;
              templateIndex++;
            }
          } else if (starIndex !== -1) {
            templateIndex = starIndex + 1;
            matchIndex++;
            searchIndex = matchIndex;
          } else {
            return false;
          }
        }
        while (templateIndex < template.length && template[templateIndex] === "*") {
          templateIndex++;
        }
        return templateIndex === template.length;
      }
      function disable() {
        const namespaces = [
          ...createDebug.names,
          ...createDebug.skips.map((namespace) => "-" + namespace)
        ].join(",");
        createDebug.enable("");
        return namespaces;
      }
      function enabled(name) {
        for (const skip of createDebug.skips) {
          if (matchesTemplate(name, skip)) {
            return false;
          }
        }
        for (const ns of createDebug.names) {
          if (matchesTemplate(name, ns)) {
            return true;
          }
        }
        return false;
      }
      function coerce(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      function destroy() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    module.exports = setup;
  }
});

// ../../libraries/mecha/packages/node_modules/.deno/debug@4.4.3/node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "../../libraries/mecha/packages/node_modules/.deno/debug@4.4.3/node_modules/debug/src/browser.js"(exports, module) {
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = localstorage();
    exports.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    exports.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports.storage.setItem("debug", namespaces);
        } else {
          exports.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      let r;
      try {
        r = exports.storage.getItem("debug") || exports.storage.getItem("DEBUG");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module.exports = require_common()(exports);
    var { formatters } = module.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  }
});

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/query/ir.js
var INCLUDES_SCALAR_FIELD = `__includes_scalar__`;
var BaseExpression = class {
};
var CollectionRef = class extends BaseExpression {
  constructor(collection, alias) {
    super();
    this.collection = collection;
    this.alias = alias;
    this.type = `collectionRef`;
  }
};
var QueryRef = class extends BaseExpression {
  constructor(query, alias) {
    super();
    this.query = query;
    this.alias = alias;
    this.type = `queryRef`;
  }
};
var UnionFrom = class extends BaseExpression {
  constructor(sources) {
    super();
    this.sources = sources;
    this.type = `unionFrom`;
  }
  get alias() {
    return this.sources[0]?.alias ?? ``;
  }
};
var UnionAll = class extends BaseExpression {
  /**
   * Result-level UNION ALL. Downstream query clauses see the union result row
   * shape, not the branch source aliases. Optimizers may push safe operations
   * into branches, but compiler phases should treat this as a derived relation
   * unless they are explicitly handling branch lowering.
   */
  constructor(queries) {
    super();
    this.queries = queries;
    this.type = `unionAll`;
  }
  get alias() {
    return ``;
  }
};
var PropRef = class extends BaseExpression {
  constructor(path) {
    super();
    this.path = path;
    this.type = `ref`;
  }
};
var Value = class extends BaseExpression {
  constructor(value) {
    super();
    this.value = value;
    this.type = `val`;
  }
};
var Func = class extends BaseExpression {
  constructor(name, args) {
    super();
    this.name = name;
    this.args = args;
    this.type = `func`;
  }
};
var Aggregate = class extends BaseExpression {
  constructor(name, args) {
    super();
    this.name = name;
    this.args = args;
    this.type = `agg`;
  }
};
var IncludesSubquery = class extends BaseExpression {
  constructor(query, correlationField, childCorrelationField, fieldName, parentFilters, parentProjection, materialization = `collection`, scalarField) {
    super();
    this.query = query;
    this.correlationField = correlationField;
    this.childCorrelationField = childCorrelationField;
    this.fieldName = fieldName;
    this.parentFilters = parentFilters;
    this.parentProjection = parentProjection;
    this.materialization = materialization;
    this.scalarField = scalarField;
    this.type = `includesSubquery`;
  }
};
var ConditionalSelect = class extends BaseExpression {
  constructor(branches, defaultValue) {
    super();
    this.branches = branches;
    this.defaultValue = defaultValue;
    this.type = `conditionalSelect`;
  }
};
function isExpressionLike(value) {
  if (value instanceof Aggregate || value instanceof ConditionalSelect || value instanceof Func || value instanceof PropRef || value instanceof Value || value instanceof IncludesSubquery) {
    return true;
  }
  if (!value || typeof value !== `object`) {
    return false;
  }
  if (value.type === `conditionalSelect`) {
    return Array.isArray(value.branches);
  }
  if (value.type === `agg` || value.type === `func`) {
    return typeof value.name === `string` && Array.isArray(value.args);
  }
  if (value.type === `ref`) {
    return Array.isArray(value.path);
  }
  if (value.type === `val`) {
    return `value` in value;
  }
  if (value.type === `includesSubquery`) {
    return `query` in value && `fieldName` in value;
  }
  return false;
}
function getWhereExpression(where) {
  return typeof where === `object` && `expression` in where ? where.expression : where;
}
function getHavingExpression(having) {
  return typeof having === `object` && `expression` in having ? having.expression : having;
}
function isResidualWhere(where) {
  return typeof where === `object` && `expression` in where && where.residual === true;
}
function createResidualWhere(expression) {
  return {
    expression,
    residual: true
  };
}
function getRefFromAlias(query, alias) {
  if (query.from.type === `unionFrom`) {
    for (const source of query.from.sources) {
      if (source.alias === alias) {
        return source;
      }
    }
  } else if (query.from.type !== `unionAll` && query.from.alias === alias) {
    return query.from;
  }
  for (const join2 of query.join || []) {
    if (join2.from.alias === alias) {
      return join2.from;
    }
  }
}
function followRef(query, ref, collection) {
  if (ref.path.length === 0) {
    return;
  }
  if (ref.path.length === 1) {
    const field = ref.path[0];
    if (query.select) {
      const selectedField = query.select[field];
      if (selectedField && selectedField.type === `ref`) {
        return followRef(query, selectedField, collection);
      }
    }
    return {
      collection,
      path: [
        field
      ]
    };
  }
  if (ref.path.length > 1) {
    const [alias, ...rest] = ref.path;
    const aliasRef = getRefFromAlias(query, alias);
    if (!aliasRef) {
      return;
    }
    if (aliasRef.type === `queryRef`) {
      return followRef(aliasRef.query, new PropRef(rest), collection);
    } else {
      return {
        collection: aliasRef.collection,
        path: rest,
        alias
      };
    }
  }
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/utils/uuid.js
function safeRandomUUID() {
  const c = typeof globalThis !== `undefined` ? globalThis.crypto : void 0;
  if (c && typeof c.randomUUID === `function`) {
    return c.randomUUID();
  }
  if (c && typeof c.getRandomValues === `function`) {
    const bytes = c.getRandomValues(new Uint8Array(16));
    bytes[6] = bytes[6] & 15 | 64;
    bytes[8] = bytes[8] & 63 | 128;
    const hex = [];
    for (let i = 0; i < 16; i++) {
      hex.push(bytes[i].toString(16).padStart(2, `0`));
    }
    return hex.slice(0, 4).join(``) + `-` + hex.slice(4, 6).join(``) + `-` + hex.slice(6, 8).join(``) + `-` + hex.slice(8, 10).join(``) + `-` + hex.slice(10, 16).join(``);
  }
  throw new Error(`No secure random number generator available: neither crypto.randomUUID nor crypto.getRandomValues is defined in this environment.`);
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/errors.js
var TanStackDBError = class extends Error {
  constructor(message) {
    super(message);
    this.name = `TanStackDBError`;
  }
};
var SchemaValidationError = class extends TanStackDBError {
  constructor(type, issues, message) {
    const defaultMessage = `${type === `insert` ? `Insert` : `Update`} validation failed: ${issues.map((issue) => `
- ${issue.message} - path: ${issue.path}`).join(``)}`;
    super(message || defaultMessage);
    this.name = `SchemaValidationError`;
    this.type = type;
    this.issues = issues;
  }
};
var CollectionConfigurationError = class extends TanStackDBError {
  constructor(message) {
    super(message);
    this.name = `CollectionConfigurationError`;
  }
};
var CollectionRequiresConfigError = class extends CollectionConfigurationError {
  constructor() {
    super(`Collection requires a config`);
  }
};
var CollectionRequiresSyncConfigError = class extends CollectionConfigurationError {
  constructor() {
    super(`Collection requires a sync config`);
  }
};
var InvalidSchemaError = class extends CollectionConfigurationError {
  constructor() {
    super(`Schema must implement the standard-schema interface`);
  }
};
var SchemaMustBeSynchronousError = class extends CollectionConfigurationError {
  constructor() {
    super(`Schema validation must be synchronous`);
  }
};
var CollectionStateError = class extends TanStackDBError {
  constructor(message) {
    super(message);
    this.name = `CollectionStateError`;
  }
};
var CollectionInErrorStateError = class extends CollectionStateError {
  constructor(operation, collectionId) {
    super(`Cannot perform ${operation} on collection "${collectionId}" - collection is in error state. Try calling cleanup() and restarting the collection.`);
  }
};
var InvalidCollectionStatusTransitionError = class extends CollectionStateError {
  constructor(from, to, collectionId) {
    super(`Invalid collection status transition from "${from}" to "${to}" for collection "${collectionId}"`);
  }
};
var CollectionIsInErrorStateError = class extends CollectionStateError {
  constructor() {
    super(`Collection is in error state`);
  }
};
var NegativeActiveSubscribersError = class extends CollectionStateError {
  constructor() {
    super(`Active subscribers count is negative - this should never happen`);
  }
};
var CollectionOperationError = class extends TanStackDBError {
  constructor(message) {
    super(message);
    this.name = `CollectionOperationError`;
  }
};
var UndefinedKeyError = class extends CollectionOperationError {
  constructor(item) {
    super(`An object was created without a defined key: ${JSON.stringify(item)}`);
  }
};
var InvalidKeyError = class extends CollectionOperationError {
  constructor(key, item) {
    const keyType = key === null ? `null` : typeof key;
    super(`getKey returned an invalid key type. Expected string or number, but got ${keyType}: ${JSON.stringify(key)}. Item: ${JSON.stringify(item)}`);
  }
};
var DuplicateKeyError = class extends CollectionOperationError {
  constructor(key) {
    super(`Cannot insert document with ID "${key}" because it already exists in the collection`);
  }
};
var DuplicateKeySyncError = class extends CollectionOperationError {
  constructor(key, collectionId, options) {
    const baseMessage = `Cannot insert document with key "${key}" from sync because it already exists in the collection "${collectionId}"`;
    if (options?.hasCustomGetKey && options.hasDistinct) {
      super(`${baseMessage}. This collection uses a custom getKey with .distinct(). The .distinct() operator deduplicates by the ENTIRE selected object (standard SQL behavior), but your custom getKey extracts only a subset of fields. This causes multiple distinct rows (with different values in non-key fields) to receive the same key. To fix this, either: (1) ensure your SELECT only includes fields that uniquely identify each row, (2) use .groupBy() with min()/max() aggregates to select one value per group, or (3) remove the custom getKey to use the default key behavior.`);
    } else if (options?.hasCustomGetKey && options.hasJoins) {
      super(`${baseMessage}. This collection uses a custom getKey with joined queries. Joined queries can produce multiple rows with the same key when relationships are not 1:1. Consider: (1) using a composite key in your getKey function (e.g., \`\${item.key1}-\${item.key2}\`), (2) ensuring your join produces unique rows per key, or (3) removing the custom getKey to use the default composite key behavior.`);
    } else {
      super(baseMessage);
    }
  }
};
var MissingUpdateArgumentError = class extends CollectionOperationError {
  constructor() {
    super(`The first argument to update is missing`);
  }
};
var NoKeysPassedToUpdateError = class extends CollectionOperationError {
  constructor() {
    super(`No keys were passed to update`);
  }
};
var UpdateKeyNotFoundError = class extends CollectionOperationError {
  constructor(key) {
    super(`The key "${key}" was passed to update but an object for this key was not found in the collection`);
  }
};
var KeyUpdateNotAllowedError = class extends CollectionOperationError {
  constructor(originalKey, newKey) {
    super(`Updating the key of an item is not allowed. Original key: "${originalKey}", Attempted new key: "${newKey}". Please delete the old item and create a new one if a key change is necessary.`);
  }
};
var NoKeysPassedToDeleteError = class extends CollectionOperationError {
  constructor() {
    super(`No keys were passed to delete`);
  }
};
var DeleteKeyNotFoundError = class extends CollectionOperationError {
  constructor(key) {
    super(`Collection.delete was called with key '${key}' but there is no item in the collection with this key`);
  }
};
var MissingHandlerError = class extends TanStackDBError {
  constructor(message) {
    super(message);
    this.name = `MissingHandlerError`;
  }
};
var MissingInsertHandlerError = class extends MissingHandlerError {
  constructor() {
    super(`Collection.insert called directly (not within an explicit transaction) but no 'onInsert' handler is configured.`);
  }
};
var MissingUpdateHandlerError = class extends MissingHandlerError {
  constructor() {
    super(`Collection.update called directly (not within an explicit transaction) but no 'onUpdate' handler is configured.`);
  }
};
var MissingDeleteHandlerError = class extends MissingHandlerError {
  constructor() {
    super(`Collection.delete called directly (not within an explicit transaction) but no 'onDelete' handler is configured.`);
  }
};
var TransactionError = class extends TanStackDBError {
  constructor(message) {
    super(message);
    this.name = `TransactionError`;
  }
};
var MissingMutationFunctionError = class extends TransactionError {
  constructor() {
    super(`mutationFn is required when creating a transaction`);
  }
};
var OnMutateMustBeSynchronousError = class extends TransactionError {
  constructor() {
    super(`onMutate must be synchronous and cannot return a promise. Remove async/await or returned promises from onMutate.`);
    this.name = `OnMutateMustBeSynchronousError`;
  }
};
var TransactionNotPendingMutateError = class extends TransactionError {
  constructor() {
    super(`You can no longer call .mutate() as the transaction is no longer pending`);
  }
};
var TransactionAlreadyCompletedRollbackError = class extends TransactionError {
  constructor() {
    super(`You can no longer call .rollback() as the transaction is already completed`);
  }
};
var TransactionNotPendingCommitError = class extends TransactionError {
  constructor() {
    super(`You can no longer call .commit() as the transaction is no longer pending`);
  }
};
var NoPendingSyncTransactionWriteError = class extends TransactionError {
  constructor() {
    super(`No pending sync transaction to write to`);
  }
};
var SyncTransactionAlreadyCommittedWriteError = class extends TransactionError {
  constructor() {
    super(`The pending sync transaction is already committed, you can't still write to it.`);
  }
};
var NoPendingSyncTransactionCommitError = class extends TransactionError {
  constructor() {
    super(`No pending sync transaction to commit`);
  }
};
var SyncTransactionAlreadyCommittedError = class extends TransactionError {
  constructor() {
    super(`The pending sync transaction is already committed, you can't commit it again.`);
  }
};
var QueryBuilderError = class extends TanStackDBError {
  constructor(message) {
    super(message);
    this.name = `QueryBuilderError`;
  }
};
var OnlyOneSourceAllowedError = class extends QueryBuilderError {
  constructor(context) {
    super(`Only one source is allowed in the ${context}`);
  }
};
var SubQueryMustHaveFromClauseError = class extends QueryBuilderError {
  constructor(context) {
    super(`A sub query passed to a ${context} must have a from clause itself`);
  }
};
var InvalidSourceError = class extends QueryBuilderError {
  constructor(alias) {
    super(`Invalid source for live query: The value provided for alias "${alias}" is not a Collection or subquery. Live queries only accept Collection instances or subqueries. Please ensure you're passing a valid Collection or QueryBuilder, not a plain array or other data type.`);
  }
};
var InvalidSourceTypeError = class extends QueryBuilderError {
  constructor(context, type) {
    const expected = context === `unionAll clause` ? `an object with one or more key-value pairs like { alias: collection }` : `an object with a single key-value pair like { alias: collection }`;
    const example = context === `unionAll clause` ? `.unionAll({ todos: todosCollection, events: eventsCollection })` : context === `join clause` ? `.join({ todos: todosCollection }, ({ todo, todos }) => eq(todo.id, todos.id))` : `.from({ todos: todosCollection })`;
    super(`Invalid source for ${context}: Expected ${expected}. For example: ${example}. Got: ${type}`);
  }
};
var JoinConditionMustBeEqualityError = class extends QueryBuilderError {
  constructor() {
    super(`Join condition must be an equality expression`);
  }
};
var QueryMustHaveFromClauseError = class extends QueryBuilderError {
  constructor() {
    super(`Query must have a from clause`);
  }
};
var InvalidWhereExpressionError = class extends QueryBuilderError {
  constructor(valueType) {
    super(`Invalid where() expression: Expected a query expression, but received a ${valueType}. This usually happens when using JavaScript's comparison operators (===, !==, <, >, etc.) directly. Instead, use the query builder functions:

  \u274C .where(({ user }) => user.id === 'abc')
  \u2705 .where(({ user }) => eq(user.id, 'abc'))

Available comparison functions: eq, gt, gte, lt, lte, and, or, not, like, ilike, isNull, isUndefined`);
  }
};
var QueryCompilationError = class extends TanStackDBError {
  constructor(message) {
    super(message);
    this.name = `QueryCompilationError`;
  }
};
var UnsafeAliasPathError = class extends QueryCompilationError {
  constructor(segment) {
    super(`Unsafe alias path segment "${segment}" is not allowed in .select(). Aliases must not contain "__proto__", "prototype", or "constructor".`);
    this.name = `UnsafeAliasPathError`;
  }
};
var DistinctRequiresSelectError = class extends QueryCompilationError {
  constructor() {
    super(`DISTINCT requires a SELECT clause.`);
  }
};
var FnSelectWithGroupByError = class extends QueryCompilationError {
  constructor() {
    super(`fn.select() cannot be used with groupBy(). groupBy requires the compiler to statically analyze aggregate functions (count, sum, max, etc.) in the SELECT clause, which is not possible with fn.select() since it is an opaque function. Use .select() instead of .fn.select() when combining with groupBy().`);
  }
};
var UnsupportedRootScalarSelectError = class extends QueryCompilationError {
  constructor() {
    super(`Top-level scalar select() is not supported by createLiveQueryCollection() or queryOnce(). Return an object from .select(), or use the scalar query inside toArray(...) or concat(toArray(...)).`);
  }
};
var HavingRequiresGroupByError = class extends QueryCompilationError {
  constructor() {
    super(`HAVING clause requires GROUP BY clause`);
  }
};
var LimitOffsetRequireOrderByError = class extends QueryCompilationError {
  constructor() {
    super(`LIMIT and OFFSET require an ORDER BY clause to ensure deterministic results`);
  }
};
var CollectionInputNotFoundError = class extends QueryCompilationError {
  constructor(alias, collectionId, availableKeys) {
    const details = collectionId ? `alias "${alias}" (collection "${collectionId}")` : `collection "${alias}"`;
    const availableKeysMsg = availableKeys?.length ? `. Available keys: ${availableKeys.join(`, `)}` : ``;
    super(`Input for ${details} not found in inputs map${availableKeysMsg}`);
  }
};
var DuplicateAliasInSubqueryError = class extends QueryCompilationError {
  constructor(alias, parentAliases) {
    super(`Subquery uses alias "${alias}" which is already used in the parent query. Each alias must be unique across parent and subquery contexts. Parent query aliases: ${parentAliases.join(`, `)}. Please rename "${alias}" in either the parent query or subquery to avoid conflicts.`);
  }
};
var UnsupportedFromTypeError = class extends QueryCompilationError {
  constructor(type) {
    super(`Unsupported FROM type: ${type}`);
  }
};
var UnknownExpressionTypeError = class extends QueryCompilationError {
  constructor(type) {
    super(`Unknown expression type: ${type}`);
  }
};
var EmptyReferencePathError = class extends QueryCompilationError {
  constructor() {
    super(`Reference path cannot be empty`);
  }
};
var UnknownFunctionError = class extends QueryCompilationError {
  constructor(functionName) {
    super(`Unknown function: ${functionName}`);
  }
};
var JoinCollectionNotFoundError = class extends QueryCompilationError {
  constructor(collectionId) {
    super(`Collection "${collectionId}" not found during compilation of join`);
  }
};
var JoinError = class extends TanStackDBError {
  constructor(message) {
    super(message);
    this.name = `JoinError`;
  }
};
var UnsupportedJoinTypeError = class extends JoinError {
  constructor(joinType) {
    super(`Unsupported join type: ${joinType}`);
  }
};
var InvalidJoinConditionSameSourceError = class extends JoinError {
  constructor(sourceAlias) {
    super(`Invalid join condition: both expressions refer to the same source "${sourceAlias}"`);
  }
};
var InvalidJoinConditionSourceMismatchError = class extends JoinError {
  constructor() {
    super(`Invalid join condition: expressions must reference source aliases`);
  }
};
var InvalidJoinConditionLeftSourceError = class extends JoinError {
  constructor(sourceAlias) {
    super(`Invalid join condition: left expression refers to an unavailable source "${sourceAlias}"`);
  }
};
var InvalidJoinConditionRightSourceError = class extends JoinError {
  constructor(sourceAlias) {
    super(`Invalid join condition: right expression does not refer to the joined source "${sourceAlias}"`);
  }
};
var InvalidJoinCondition = class extends JoinError {
  constructor() {
    super(`Invalid join condition`);
  }
};
var UnsupportedJoinSourceTypeError = class extends JoinError {
  constructor(type) {
    super(`Unsupported join source type: ${type}`);
  }
};
var GroupByError = class extends TanStackDBError {
  constructor(message) {
    super(message);
    this.name = `GroupByError`;
  }
};
var NonAggregateExpressionNotInGroupByError = class extends GroupByError {
  constructor(alias) {
    super(`Non-aggregate expression '${alias}' in SELECT must also appear in GROUP BY clause`);
  }
};
var UnsupportedAggregateFunctionError = class extends GroupByError {
  constructor(functionName) {
    super(`Unsupported aggregate function: ${functionName}`);
  }
};
var AggregateFunctionNotInSelectError = class extends GroupByError {
  constructor(functionName) {
    super(`Aggregate function in HAVING clause must also be in SELECT clause: ${functionName}`);
  }
};
var UnknownHavingExpressionTypeError = class extends GroupByError {
  constructor(type) {
    super(`Unknown expression type in HAVING clause: ${type}`);
  }
};
var StorageError = class extends TanStackDBError {
  constructor(message) {
    super(message);
    this.name = `StorageError`;
  }
};
var SerializationError = class extends StorageError {
  constructor(operation, originalError) {
    super(`Cannot ${operation} item because it cannot be JSON serialized: ${originalError}`);
  }
};
var LocalStorageCollectionError = class extends StorageError {
  constructor(message) {
    super(message);
    this.name = `LocalStorageCollectionError`;
  }
};
var StorageKeyRequiredError = class extends LocalStorageCollectionError {
  constructor() {
    super(`[LocalStorageCollection] storageKey must be provided.`);
  }
};
var InvalidStorageDataFormatError = class extends LocalStorageCollectionError {
  constructor(storageKey, key) {
    super(`[LocalStorageCollection] Invalid data format in storage key "${storageKey}" for key "${key}".`);
  }
};
var InvalidStorageObjectFormatError = class extends LocalStorageCollectionError {
  constructor(storageKey) {
    super(`[LocalStorageCollection] Invalid data format in storage key "${storageKey}". Expected object format.`);
  }
};
var SyncCleanupError = class extends TanStackDBError {
  constructor(collectionId, error) {
    const message = error instanceof Error ? error.message : String(error);
    super(`Collection "${collectionId}" sync cleanup function threw an error: ${message}`);
    this.name = `SyncCleanupError`;
  }
};
var QueryOptimizerError = class extends TanStackDBError {
  constructor(message) {
    super(message);
    this.name = `QueryOptimizerError`;
  }
};
var CannotCombineEmptyExpressionListError = class extends QueryOptimizerError {
  constructor() {
    super(`Cannot combine empty expression list`);
  }
};
var SubscriptionNotFoundError = class extends QueryCompilationError {
  constructor(resolvedAlias, originalAlias, collectionId, availableAliases) {
    super(`Internal error: subscription for alias '${resolvedAlias}' (remapped from '${originalAlias}', collection '${collectionId}') is missing in join pipeline. Available aliases: ${availableAliases.join(`, `)}. This indicates a bug in alias tracking.`);
  }
};
var MissingAliasInputsError = class extends QueryCompilationError {
  constructor(missingAliases) {
    super(`Internal error: compiler returned aliases without inputs: ${missingAliases.join(`, `)}. This indicates a bug in query compilation. Please report this issue.`);
  }
};
var SetWindowRequiresOrderByError = class extends QueryCompilationError {
  constructor() {
    super(`setWindow() can only be called on collections with an ORDER BY clause. Add .orderBy() to your query to enable window movement.`);
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/utils.js
function deepEquals(a, b) {
  return deepEqualsInternal(a, b, /* @__PURE__ */ new Map());
}
function deepEqualsInternal(a, b, visited) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  if (a instanceof Date) {
    if (!(b instanceof Date)) return false;
    return a.getTime() === b.getTime();
  }
  if (b instanceof Date) return false;
  if (a instanceof RegExp) {
    if (!(b instanceof RegExp)) return false;
    return a.source === b.source && a.flags === b.flags;
  }
  if (b instanceof RegExp) return false;
  if (a instanceof Map) {
    if (!(b instanceof Map)) return false;
    if (a.size !== b.size) return false;
    if (visited.has(a)) {
      return visited.get(a) === b;
    }
    visited.set(a, b);
    const entries = Array.from(a.entries());
    const result = entries.every(([key, val]) => {
      return b.has(key) && deepEqualsInternal(val, b.get(key), visited);
    });
    visited.delete(a);
    return result;
  }
  if (b instanceof Map) return false;
  if (a instanceof Set) {
    if (!(b instanceof Set)) return false;
    if (a.size !== b.size) return false;
    if (visited.has(a)) {
      return visited.get(a) === b;
    }
    visited.set(a, b);
    const aValues = Array.from(a);
    const bValues = Array.from(b);
    if (aValues.every((val) => typeof val !== `object`)) {
      visited.delete(a);
      return aValues.every((val) => b.has(val));
    }
    const result = aValues.length === bValues.length;
    visited.delete(a);
    return result;
  }
  if (b instanceof Set) return false;
  if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b) && !(a instanceof DataView) && !(b instanceof DataView)) {
    const typedA = a;
    const typedB = b;
    if (typedA.length !== typedB.length) return false;
    for (let i = 0; i < typedA.length; i++) {
      if (typedA[i] !== typedB[i]) return false;
    }
    return true;
  }
  if (ArrayBuffer.isView(b) && !(b instanceof DataView) && !ArrayBuffer.isView(a)) {
    return false;
  }
  if (isTemporal(a) && isTemporal(b)) {
    const aTag = a[Symbol.toStringTag];
    const bTag = b[Symbol.toStringTag];
    if (aTag !== bTag) return false;
    if (typeof a.equals === `function`) {
      return a.equals(b);
    }
    return a.toString() === b.toString();
  }
  if (isTemporal(b)) return false;
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    if (visited.has(a)) {
      return visited.get(a) === b;
    }
    visited.set(a, b);
    const result = a.every((item, index) => deepEqualsInternal(item, b[index], visited));
    visited.delete(a);
    return result;
  }
  if (Array.isArray(b)) return false;
  if (typeof a === `object`) {
    if (visited.has(a)) {
      return visited.get(a) === b;
    }
    visited.set(a, b);
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) {
      visited.delete(a);
      return false;
    }
    const result = keysA.every((key) => key in b && deepEqualsInternal(a[key], b[key], visited));
    visited.delete(a);
    return result;
  }
  return false;
}
var temporalTypes = /* @__PURE__ */ new Set([
  `Temporal.Duration`,
  `Temporal.Instant`,
  `Temporal.PlainDate`,
  `Temporal.PlainDateTime`,
  `Temporal.PlainMonthDay`,
  `Temporal.PlainTime`,
  `Temporal.PlainYearMonth`,
  `Temporal.ZonedDateTime`
]);
function isTemporal(a) {
  if (a == null || typeof a !== `object`) return false;
  const tag = a[Symbol.toStringTag];
  return typeof tag === `string` && temporalTypes.has(tag);
}
var DEFAULT_COMPARE_OPTIONS = {
  direction: `asc`,
  nulls: `first`,
  stringSort: `locale`
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/utils/comparison.js
var objectIds = /* @__PURE__ */ new WeakMap();
var nextObjectId = 1;
function getObjectId(obj) {
  if (objectIds.has(obj)) {
    return objectIds.get(obj);
  }
  const id = nextObjectId++;
  objectIds.set(obj, id);
  return id;
}
function isUnorderable(value) {
  return typeof value === `number` && Number.isNaN(value) || value instanceof Date && Number.isNaN(value.getTime());
}
var ascComparator = (a, b, opts) => {
  const { nulls } = opts;
  if (a == null && b == null) return 0;
  if (a == null) return nulls === `first` ? -1 : 1;
  if (b == null) return nulls === `first` ? 1 : -1;
  const aUnordered = isUnorderable(a);
  const bUnordered = isUnorderable(b);
  if (aUnordered && bUnordered) return 0;
  if (aUnordered) return 1;
  if (bUnordered) return -1;
  if (typeof a === `string` && typeof b === `string`) {
    if (opts.stringSort === `locale`) {
      return a.localeCompare(b, opts.locale, opts.localeOptions);
    }
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      const result = ascComparator(a[i], b[i], opts);
      if (result !== 0) {
        return result;
      }
    }
    return a.length - b.length;
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }
  if (isTemporal(a) && isTemporal(b)) {
    const aStr = a.toString();
    const bStr = b.toString();
    if (aStr < bStr) return -1;
    if (aStr > bStr) return 1;
    return 0;
  }
  const aIsObject = typeof a === `object`;
  const bIsObject = typeof b === `object`;
  if (aIsObject || bIsObject) {
    if (aIsObject && bIsObject) {
      const aId = getObjectId(a);
      const bId = getObjectId(b);
      return aId - bId;
    }
    if (aIsObject) return 1;
    if (bIsObject) return -1;
  }
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};
var descComparator = (a, b, opts) => {
  return ascComparator(b, a, {
    ...opts,
    nulls: opts.nulls === `first` ? `last` : `first`
  });
};
function makeComparator(opts) {
  return (a, b) => {
    if (opts.direction === `asc`) {
      return ascComparator(a, b, opts);
    } else {
      return descComparator(a, b, opts);
    }
  };
}
var defaultComparator = makeComparator({
  direction: `asc`,
  nulls: `first`,
  stringSort: `locale`
});
function areUint8ArraysEqual(a, b) {
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
var UINT8ARRAY_NORMALIZE_THRESHOLD = 128;
var UNDEFINED_SENTINEL = `__TS_DB_BTREE_UNDEFINED_VALUE__`;
function normalizeValue(value) {
  if (typeof value !== `object` || value === null) {
    return value;
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  if (isTemporal(value)) {
    return `__temporal__${value[Symbol.toStringTag]}__${value.toString()}`;
  }
  const isUint8Array = typeof Buffer !== `undefined` && value instanceof Buffer || value instanceof Uint8Array;
  if (isUint8Array) {
    if (value.byteLength <= UINT8ARRAY_NORMALIZE_THRESHOLD) {
      return `__u8__${Array.from(value).join(`,`)}`;
    }
  }
  return value;
}
function normalizeForBTree(value) {
  if (value === void 0) {
    return UNDEFINED_SENTINEL;
  }
  return normalizeValue(value);
}
function areSameValueZeroEqual(a, b) {
  return a === b || Number.isNaN(a) && Number.isNaN(b);
}
function denormalizeUndefined(value) {
  if (value === UNDEFINED_SENTINEL) {
    return void 0;
  }
  return value;
}
function areValuesEqual(a, b) {
  if (a === b) {
    return true;
  }
  const aIsUint8Array = typeof Buffer !== `undefined` && a instanceof Buffer || a instanceof Uint8Array;
  const bIsUint8Array = typeof Buffer !== `undefined` && b instanceof Buffer || b instanceof Uint8Array;
  if (aIsUint8Array && bIsUint8Array) {
    return areUint8ArraysEqual(a, b);
  }
  return false;
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/query/compiler/evaluators.js
function isUnknown(value) {
  return value === null || value === void 0;
}
function valuesEqual(a, b) {
  if (isUnorderable(a) || isUnorderable(b)) {
    return isUnorderable(a) && isUnorderable(b);
  }
  return areValuesEqual(a, b);
}
function toDateValue(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === `string` || typeof value === `number`) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}
function evaluateStrftime(format, date) {
  if (format === `%Y-%m-%d`) {
    return date.toISOString().slice(0, 10);
  }
  if (format === `%Y-%m-%dT%H:%M:%fZ`) {
    return date.toISOString();
  }
  return date.toISOString();
}
function toBooleanPredicate(result) {
  return result === true;
}
function compileExpression(expr, isSingleRow = false) {
  const compiledFn = compileExpressionInternal(expr, isSingleRow);
  return compiledFn;
}
function compileSingleRowExpression(expr) {
  const compiledFn = compileExpressionInternal(expr, true);
  return compiledFn;
}
function compileExpressionInternal(expr, isSingleRow) {
  switch (expr.type) {
    case `val`: {
      const value = expr.value;
      return () => value;
    }
    case `ref`: {
      return isSingleRow ? compileSingleRowRef(expr) : compileRef(expr);
    }
    case `func`: {
      return compileFunction(expr, isSingleRow);
    }
    default:
      throw new UnknownExpressionTypeError(expr.type);
  }
}
function compileRef(ref) {
  const [namespace, ...propertyPath] = ref.path;
  if (!namespace) {
    throw new EmptyReferencePathError();
  }
  if (namespace === `$selected`) {
    if (propertyPath.length === 0) {
      return (namespacedRow) => namespacedRow.$selected;
    } else if (propertyPath.length === 1) {
      const prop = propertyPath[0];
      return (namespacedRow) => {
        const selectResults = namespacedRow.$selected;
        return selectResults?.[prop];
      };
    } else {
      return (namespacedRow) => {
        const selectResults = namespacedRow.$selected;
        if (selectResults === void 0) {
          return void 0;
        }
        let value = selectResults;
        for (const prop of propertyPath) {
          if (value == null) {
            return value;
          }
          value = value[prop];
        }
        return value;
      };
    }
  }
  const tableAlias = namespace;
  if (propertyPath.length === 0) {
    return (namespacedRow) => namespacedRow[tableAlias];
  } else if (propertyPath.length === 1) {
    const prop = propertyPath[0];
    return (namespacedRow) => {
      const tableData = namespacedRow[tableAlias];
      return tableData?.[prop];
    };
  } else {
    return (namespacedRow) => {
      const tableData = namespacedRow[tableAlias];
      if (tableData === void 0) {
        return void 0;
      }
      let value = tableData;
      for (const prop of propertyPath) {
        if (value == null) {
          return value;
        }
        value = value[prop];
      }
      return value;
    };
  }
}
function compileSingleRowRef(ref) {
  const propertyPath = ref.path;
  return (item) => {
    let value = item;
    for (const prop of propertyPath) {
      if (value == null) {
        return value;
      }
      value = value[prop];
    }
    return value;
  };
}
function compileFunction(func, isSingleRow) {
  const compiledArgs = func.args.map((arg) => compileExpressionInternal(arg, isSingleRow));
  switch (func.name) {
    // Comparison operators
    case `eq`: {
      const argA = compiledArgs[0];
      const argB = compiledArgs[1];
      return (data) => {
        const a = normalizeValue(argA(data));
        const b = normalizeValue(argB(data));
        if (isUnknown(a) || isUnknown(b)) {
          return null;
        }
        return valuesEqual(a, b);
      };
    }
    case `gt`: {
      const argA = compiledArgs[0];
      const argB = compiledArgs[1];
      return (data) => {
        const a = argA(data);
        const b = argB(data);
        if (isUnknown(a) || isUnknown(b)) {
          return null;
        }
        if (isUnorderable(a) || isUnorderable(b)) {
          return isUnorderable(a) && !isUnorderable(b);
        }
        return a > b;
      };
    }
    case `gte`: {
      const argA = compiledArgs[0];
      const argB = compiledArgs[1];
      return (data) => {
        const a = argA(data);
        const b = argB(data);
        if (isUnknown(a) || isUnknown(b)) {
          return null;
        }
        if (isUnorderable(a) || isUnorderable(b)) {
          return isUnorderable(a);
        }
        return a >= b;
      };
    }
    case `lt`: {
      const argA = compiledArgs[0];
      const argB = compiledArgs[1];
      return (data) => {
        const a = argA(data);
        const b = argB(data);
        if (isUnknown(a) || isUnknown(b)) {
          return null;
        }
        if (isUnorderable(a) || isUnorderable(b)) {
          return isUnorderable(b) && !isUnorderable(a);
        }
        return a < b;
      };
    }
    case `lte`: {
      const argA = compiledArgs[0];
      const argB = compiledArgs[1];
      return (data) => {
        const a = argA(data);
        const b = argB(data);
        if (isUnknown(a) || isUnknown(b)) {
          return null;
        }
        if (isUnorderable(a) || isUnorderable(b)) {
          return isUnorderable(b);
        }
        return a <= b;
      };
    }
    // Boolean operators
    case `and`:
      return (data) => {
        let hasUnknown = false;
        for (const compiledArg of compiledArgs) {
          const result = compiledArg(data);
          if (result === false) {
            return false;
          }
          if (isUnknown(result)) {
            hasUnknown = true;
          }
        }
        if (hasUnknown) {
          return null;
        }
        return true;
      };
    case `or`:
      return (data) => {
        let hasUnknown = false;
        for (const compiledArg of compiledArgs) {
          const result = compiledArg(data);
          if (result === true) {
            return true;
          }
          if (isUnknown(result)) {
            hasUnknown = true;
          }
        }
        if (hasUnknown) {
          return null;
        }
        return false;
      };
    case `not`: {
      const arg = compiledArgs[0];
      return (data) => {
        const result = arg(data);
        if (isUnknown(result)) {
          return null;
        }
        return !result;
      };
    }
    // Array operators
    case `in`: {
      const valueEvaluator = compiledArgs[0];
      const arrayEvaluator = compiledArgs[1];
      return (data) => {
        const value = normalizeValue(valueEvaluator(data));
        const array = arrayEvaluator(data);
        if (isUnknown(value)) {
          return null;
        }
        if (!Array.isArray(array)) {
          return false;
        }
        return array.some((item) => valuesEqual(normalizeValue(item), value));
      };
    }
    // String operators
    case `like`: {
      const valueEvaluator = compiledArgs[0];
      const patternEvaluator = compiledArgs[1];
      return (data) => {
        const value = valueEvaluator(data);
        const pattern = patternEvaluator(data);
        if (isUnknown(value) || isUnknown(pattern)) {
          return null;
        }
        return evaluateLike(value, pattern, false);
      };
    }
    case `ilike`: {
      const valueEvaluator = compiledArgs[0];
      const patternEvaluator = compiledArgs[1];
      return (data) => {
        const value = valueEvaluator(data);
        const pattern = patternEvaluator(data);
        if (isUnknown(value) || isUnknown(pattern)) {
          return null;
        }
        return evaluateLike(value, pattern, true);
      };
    }
    // String functions
    case `upper`: {
      const arg = compiledArgs[0];
      return (data) => {
        const value = arg(data);
        return typeof value === `string` ? value.toUpperCase() : value;
      };
    }
    case `lower`: {
      const arg = compiledArgs[0];
      return (data) => {
        const value = arg(data);
        return typeof value === `string` ? value.toLowerCase() : value;
      };
    }
    case `length`: {
      const arg = compiledArgs[0];
      return (data) => {
        const value = arg(data);
        if (typeof value === `string`) {
          return value.length;
        }
        if (Array.isArray(value)) {
          return value.length;
        }
        return 0;
      };
    }
    case `concat`:
      return (data) => {
        return compiledArgs.map((evaluator) => {
          const arg = evaluator(data);
          try {
            return String(arg ?? ``);
          } catch {
            try {
              return JSON.stringify(arg) || ``;
            } catch {
              return `[object]`;
            }
          }
        }).join(``);
      };
    case `coalesce`:
      return (data) => {
        for (const evaluator of compiledArgs) {
          const value = evaluator(data);
          if (value !== null && value !== void 0) {
            return value;
          }
        }
        return null;
      };
    case `caseWhen`: {
      const hasDefaultValue = compiledArgs.length % 2 === 1;
      const pairCount = Math.floor(compiledArgs.length / 2);
      if (compiledArgs.length < 2) {
        throw new Error(`caseWhen() requires at least two arguments`);
      }
      return (data) => {
        for (let i = 0; i < pairCount; i++) {
          const condition = compiledArgs[i * 2];
          if (isCaseWhenConditionTrue(condition(data))) {
            const value = compiledArgs[i * 2 + 1];
            return value(data);
          }
        }
        if (hasDefaultValue) {
          return compiledArgs[compiledArgs.length - 1](data);
        }
        return null;
      };
    }
    // Math functions
    case `add`: {
      const argA = compiledArgs[0];
      const argB = compiledArgs[1];
      return (data) => {
        const a = argA(data);
        const b = argB(data);
        return (a ?? 0) + (b ?? 0);
      };
    }
    case `subtract`: {
      const argA = compiledArgs[0];
      const argB = compiledArgs[1];
      return (data) => {
        const a = argA(data);
        const b = argB(data);
        return (a ?? 0) - (b ?? 0);
      };
    }
    case `multiply`: {
      const argA = compiledArgs[0];
      const argB = compiledArgs[1];
      return (data) => {
        const a = argA(data);
        const b = argB(data);
        return (a ?? 0) * (b ?? 0);
      };
    }
    case `divide`: {
      const argA = compiledArgs[0];
      const argB = compiledArgs[1];
      return (data) => {
        const a = argA(data);
        const b = argB(data);
        const divisor = b ?? 0;
        return divisor !== 0 ? (a ?? 0) / divisor : null;
      };
    }
    case `date`: {
      const arg = compiledArgs[0];
      return (data) => {
        const value = arg(data);
        const dateValue = toDateValue(value);
        return dateValue ? dateValue.toISOString().slice(0, 10) : null;
      };
    }
    case `datetime`: {
      const arg = compiledArgs[0];
      return (data) => {
        const value = arg(data);
        const dateValue = toDateValue(value);
        return dateValue ? dateValue.toISOString() : null;
      };
    }
    case `strftime`: {
      const formatArg = compiledArgs[0];
      const sourceArg = compiledArgs[1];
      return (data) => {
        const format = formatArg(data);
        if (typeof format !== `string`) {
          return null;
        }
        const sourceValue = sourceArg(data);
        const dateValue = toDateValue(sourceValue);
        if (!dateValue) {
          return null;
        }
        return evaluateStrftime(format, dateValue);
      };
    }
    // Null/undefined checking functions
    case `isUndefined`: {
      const arg = compiledArgs[0];
      return (data) => {
        const value = arg(data);
        return value === void 0;
      };
    }
    case `isNull`: {
      const arg = compiledArgs[0];
      return (data) => {
        const value = arg(data);
        return value === null;
      };
    }
    default:
      throw new UnknownFunctionError(func.name);
  }
}
function isCaseWhenConditionTrue(value) {
  if (value == null || value === false) {
    return false;
  }
  if (value === true) {
    return true;
  }
  if (typeof value === `number`) {
    return value !== 0 && !Number.isNaN(value);
  }
  if (typeof value === `bigint`) {
    return value !== 0n;
  }
  return Boolean(value);
}
function evaluateLike(value, pattern, caseInsensitive) {
  if (typeof value !== `string` || typeof pattern !== `string`) {
    return false;
  }
  const searchValue = caseInsensitive ? value.toLowerCase() : value;
  const searchPattern = caseInsensitive ? pattern.toLowerCase() : pattern;
  let regexPattern = searchPattern.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
  regexPattern = regexPattern.replace(/%/g, `.*`);
  regexPattern = regexPattern.replace(/_/g, `.`);
  const regex = new RegExp(`^${regexPattern}$`, "s");
  return regex.test(searchValue);
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/indexes/reverse-index.js
var ReverseIndex = class {
  constructor(index) {
    this.originalIndex = index;
  }
  // Define the reversed operations
  lookup(operation, value) {
    const reverseOperation = operation === `gt` ? `lt` : operation === `gte` ? `lte` : operation === `lt` ? `gt` : operation === `lte` ? `gte` : operation;
    return this.originalIndex.lookup(reverseOperation, value);
  }
  rangeQuery(options = {}) {
    return this.originalIndex.rangeQueryReversed(options);
  }
  rangeQueryReversed(options = {}) {
    return this.originalIndex.rangeQuery(options);
  }
  take(n, from, filterFn) {
    return this.originalIndex.takeReversed(n, from, filterFn);
  }
  takeFromStart(n, filterFn) {
    return this.originalIndex.takeReversedFromEnd(n, filterFn);
  }
  takeReversed(n, from, filterFn) {
    return this.originalIndex.take(n, from, filterFn);
  }
  takeReversedFromEnd(n, filterFn) {
    return this.originalIndex.takeFromStart(n, filterFn);
  }
  get orderedEntriesArray() {
    return this.originalIndex.orderedEntriesArrayReversed;
  }
  get orderedEntriesArrayReversed() {
    return this.originalIndex.orderedEntriesArray;
  }
  // All operations below delegate to the original index
  supports(operation) {
    return this.originalIndex.supports(operation);
  }
  get supportsRangeOptimization() {
    return this.originalIndex.supportsRangeOptimization;
  }
  matchesField(fieldPath) {
    return this.originalIndex.matchesField(fieldPath);
  }
  matchesCompareOptions(compareOptions) {
    return this.originalIndex.matchesCompareOptions(compareOptions);
  }
  matchesDirection(direction) {
    return this.originalIndex.matchesDirection(direction);
  }
  getStats() {
    return this.originalIndex.getStats();
  }
  add(key, item) {
    this.originalIndex.add(key, item);
  }
  remove(key, item) {
    this.originalIndex.remove(key, item);
  }
  update(key, oldItem, newItem) {
    this.originalIndex.update(key, oldItem, newItem);
  }
  build(entries) {
    this.originalIndex.build(entries);
  }
  clear() {
    this.originalIndex.clear();
  }
  get keyCount() {
    return this.originalIndex.keyCount;
  }
  equalityLookup(value) {
    return this.originalIndex.equalityLookup(value);
  }
  inArrayLookup(values) {
    return this.originalIndex.inArrayLookup(values);
  }
  get indexedKeysSet() {
    return this.originalIndex.indexedKeysSet;
  }
  get valueMapData() {
    return this.originalIndex.valueMapData;
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/virtual-props.js
function enrichRowWithVirtualProps(row, key, collectionId, computeSynced, computeOrigin) {
  const existingRow = row;
  return {
    ...row,
    $synced: existingRow.$synced ?? computeSynced(),
    $origin: existingRow.$origin ?? computeOrigin(),
    $key: existingRow.$key ?? key,
    $collectionId: existingRow.$collectionId ?? collectionId
  };
}
var VIRTUAL_PROP_NAMES = [
  "$synced",
  "$origin",
  "$key",
  "$collectionId"
];
function isVirtualPropName(name) {
  return VIRTUAL_PROP_NAMES.includes(name);
}
function hasVirtualPropPath(path) {
  return path.some((segment) => isVirtualPropName(segment));
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/utils/index-optimization.js
function findIndexForField(collection, fieldPath, compareOptions) {
  if (hasVirtualPropPath(fieldPath)) {
    return void 0;
  }
  const compareOpts = compareOptions ?? {
    ...DEFAULT_COMPARE_OPTIONS,
    ...collection.compareOptions
  };
  for (const index of collection.indexes.values()) {
    if (index.matchesField(fieldPath) && index.matchesCompareOptions(compareOpts)) {
      if (!index.matchesDirection(compareOpts.direction)) {
        return new ReverseIndex(index);
      }
      return index;
    }
  }
  return void 0;
}
function intersectSets(sets) {
  if (sets.length === 0) return /* @__PURE__ */ new Set();
  if (sets.length === 1) return new Set(sets[0]);
  let result = new Set(sets[0]);
  for (let i = 1; i < sets.length; i++) {
    const newResult = /* @__PURE__ */ new Set();
    for (const item of result) {
      if (sets[i].has(item)) {
        newResult.add(item);
      }
    }
    result = newResult;
  }
  return result;
}
function unionSets(sets) {
  const result = /* @__PURE__ */ new Set();
  for (const set of sets) {
    for (const item of set) {
      result.add(item);
    }
  }
  return result;
}
function isExactComparisonValue(value) {
  return value != null;
}
function usesLocaleStringSort(collection) {
  const opts = {
    ...DEFAULT_COMPARE_OPTIONS,
    ...collection.compareOptions
  };
  return opts.stringSort === `locale`;
}
function isRangeOrderingDivergent(value, collection) {
  switch (typeof value) {
    case `number`:
    case `bigint`:
    case `boolean`:
      return false;
    case `string`:
      return usesLocaleStringSort(collection);
    case `object`: {
      if (value === null) return false;
      return !(value instanceof Date);
    }
    default:
      return false;
  }
}
function canRangeOptimize(value, index, collection) {
  return !isRangeOrderingDivergent(value, collection) && index.supportsRangeOptimization;
}
function optimizeExpressionWithIndexes(expression, collection) {
  return optimizeQueryRecursive(expression, collection);
}
function optimizeQueryRecursive(expression, collection) {
  if (expression.type === `func`) {
    switch (expression.name) {
      case `eq`:
      case `gt`:
      case `gte`:
      case `lt`:
      case `lte`:
        return optimizeSimpleComparison(expression, collection);
      case `and`:
        return optimizeAndExpression(expression, collection);
      case `or`:
        return optimizeOrExpression(expression, collection);
      case `in`:
        return optimizeInArrayExpression(expression, collection);
    }
  }
  return {
    canOptimize: false,
    matchingKeys: /* @__PURE__ */ new Set(),
    isExact: false
  };
}
function optimizeCompoundRangeQuery(expression, collection) {
  if (expression.type !== `func` || expression.args.length < 2) {
    return {
      canOptimize: false,
      matchingKeys: /* @__PURE__ */ new Set(),
      isExact: false,
      coveredArgIndices: /* @__PURE__ */ new Set()
    };
  }
  const fieldOperations = /* @__PURE__ */ new Map();
  for (const [argIndex, arg] of expression.args.entries()) {
    if (arg.type === `func` && [
      `gt`,
      `gte`,
      `lt`,
      `lte`
    ].includes(arg.name)) {
      const rangeOp = arg;
      if (rangeOp.args.length === 2) {
        const leftArg = rangeOp.args[0];
        const rightArg = rangeOp.args[1];
        let fieldArg = null;
        let valueArg = null;
        let operation = rangeOp.name;
        if (leftArg.type === `ref` && rightArg.type === `val`) {
          fieldArg = leftArg;
          valueArg = rightArg;
        } else if (leftArg.type === `val` && rightArg.type === `ref`) {
          fieldArg = rightArg;
          valueArg = leftArg;
          switch (operation) {
            case `gt`:
              operation = `lt`;
              break;
            case `gte`:
              operation = `lte`;
              break;
            case `lt`:
              operation = `gt`;
              break;
            case `lte`:
              operation = `gte`;
              break;
          }
        }
        if (fieldArg && valueArg) {
          const fieldPath = fieldArg.path;
          const fieldKey = fieldPath.join(`.`);
          const value = valueArg.value;
          if (!fieldOperations.has(fieldKey)) {
            fieldOperations.set(fieldKey, []);
          }
          fieldOperations.get(fieldKey).push({
            operation,
            value,
            argIndex
          });
        }
      }
    }
  }
  for (const [fieldKey, operations] of fieldOperations) {
    if (operations.length >= 2) {
      const fieldPath = fieldKey.split(`.`);
      const index = findIndexForField(collection, fieldPath);
      if (index && operations.some((op) => !canRangeOptimize(op.value, index, collection))) {
        continue;
      }
      if (index && index.supports(`gt`) && index.supports(`lt`)) {
        const compare = makeComparator({
          ...DEFAULT_COMPARE_OPTIONS,
          ...collection.compareOptions,
          direction: `asc`
        });
        let from = void 0;
        let to = void 0;
        let hasFromBound = false;
        let hasToBound = false;
        let fromInclusive = true;
        let toInclusive = true;
        let hasNonComparableBound = false;
        for (const { operation, value } of operations) {
          if (!isExactComparisonValue(value)) {
            hasNonComparableBound = true;
            continue;
          }
          switch (operation) {
            case `gt`:
            case `gte`: {
              const cmp = hasFromBound ? compare(value, from) : 1;
              if (cmp > 0) {
                from = value;
                hasFromBound = true;
                fromInclusive = operation === `gte`;
              } else if (cmp === 0 && operation === `gt`) {
                fromInclusive = false;
              }
              break;
            }
            case `lt`:
            case `lte`: {
              const cmp = hasToBound ? compare(value, to) : -1;
              if (cmp < 0) {
                to = value;
                hasToBound = true;
                toInclusive = operation === `lte`;
              } else if (cmp === 0 && operation === `lt`) {
                toInclusive = false;
              }
              break;
            }
          }
        }
        const rangeOptions = {};
        if (hasFromBound) {
          rangeOptions.from = from;
          rangeOptions.fromInclusive = fromInclusive;
        }
        if (hasToBound) {
          rangeOptions.to = to;
          rangeOptions.toInclusive = toInclusive;
        }
        const matchingKeys = index.rangeQuery(rangeOptions);
        return {
          canOptimize: true,
          matchingKeys,
          // The range result is exact only when it cannot include rows with a
          // nullish indexed value (which a comparison would reject but the
          // index returns, as they sort as the smallest key). That requires a
          // non-nullish lower bound to exclude them: without `hasFromBound`
          // the range is open at the bottom and captures those rows, and a
          // non-comparable bound value (`hasNonComparableBound`) can never
          // bound them out.
          isExact: hasFromBound && !hasNonComparableBound,
          coveredArgIndices: new Set(operations.map((op) => op.argIndex))
        };
      }
    }
  }
  return {
    canOptimize: false,
    matchingKeys: /* @__PURE__ */ new Set(),
    isExact: false,
    coveredArgIndices: /* @__PURE__ */ new Set()
  };
}
function optimizeSimpleComparison(expression, collection) {
  if (expression.type !== `func` || expression.args.length !== 2) {
    return {
      canOptimize: false,
      matchingKeys: /* @__PURE__ */ new Set(),
      isExact: false
    };
  }
  const leftArg = expression.args[0];
  const rightArg = expression.args[1];
  let fieldArg = null;
  let valueArg = null;
  let operation = expression.name;
  if (leftArg.type === `ref` && rightArg.type === `val`) {
    fieldArg = leftArg;
    valueArg = rightArg;
  } else if (leftArg.type === `val` && rightArg.type === `ref`) {
    fieldArg = rightArg;
    valueArg = leftArg;
    switch (operation) {
      case `gt`:
        operation = `lt`;
        break;
      case `gte`:
        operation = `lte`;
        break;
      case `lt`:
        operation = `gt`;
        break;
      case `lte`:
        operation = `gte`;
        break;
    }
  }
  if (fieldArg && valueArg) {
    const fieldPath = fieldArg.path;
    const index = findIndexForField(collection, fieldPath);
    if (index) {
      const queryValue = valueArg.value;
      const indexOperation = operation;
      if (!index.supports(indexOperation)) {
        return {
          canOptimize: false,
          matchingKeys: /* @__PURE__ */ new Set(),
          isExact: false
        };
      }
      if ((operation === `gt` || operation === `gte` || operation === `lt` || operation === `lte`) && !canRangeOptimize(queryValue, index, collection)) {
        return {
          canOptimize: false,
          matchingKeys: /* @__PURE__ */ new Set(),
          isExact: false
        };
      }
      const matchingKeys = index.lookup(indexOperation, queryValue);
      const isExact = operation === `lt` || operation === `lte` ? false : isExactComparisonValue(queryValue);
      return {
        canOptimize: true,
        matchingKeys,
        isExact
      };
    }
  }
  return {
    canOptimize: false,
    matchingKeys: /* @__PURE__ */ new Set(),
    isExact: false
  };
}
function optimizeAndExpression(expression, collection) {
  if (expression.type !== `func` || expression.args.length < 2) {
    return {
      canOptimize: false,
      matchingKeys: /* @__PURE__ */ new Set(),
      isExact: false
    };
  }
  const compoundRangeResult = optimizeCompoundRangeQuery(expression, collection);
  const coveredArgIndices = compoundRangeResult.canOptimize ? compoundRangeResult.coveredArgIndices : /* @__PURE__ */ new Set();
  const results = [];
  if (compoundRangeResult.canOptimize) {
    results.push(compoundRangeResult);
  }
  let allConjunctsExact = !compoundRangeResult.canOptimize ? true : compoundRangeResult.isExact;
  for (const [argIndex, arg] of expression.args.entries()) {
    if (coveredArgIndices.has(argIndex)) {
      continue;
    }
    const result = optimizeQueryRecursive(arg, collection);
    if (result.canOptimize) {
      results.push(result);
      if (!result.isExact) {
        allConjunctsExact = false;
      }
    } else {
      allConjunctsExact = false;
    }
  }
  if (results.length > 0) {
    const allMatchingSets = results.map((r) => r.matchingKeys);
    const intersectedKeys = intersectSets(allMatchingSets);
    return {
      canOptimize: true,
      matchingKeys: intersectedKeys,
      isExact: allConjunctsExact
    };
  }
  return {
    canOptimize: false,
    matchingKeys: /* @__PURE__ */ new Set(),
    isExact: false
  };
}
function optimizeOrExpression(expression, collection) {
  if (expression.type !== `func` || expression.args.length < 2) {
    return {
      canOptimize: false,
      matchingKeys: /* @__PURE__ */ new Set(),
      isExact: false
    };
  }
  const results = [];
  for (const arg of expression.args) {
    const result = optimizeQueryRecursive(arg, collection);
    if (!result.canOptimize) {
      return {
        canOptimize: false,
        matchingKeys: /* @__PURE__ */ new Set(),
        isExact: false
      };
    }
    results.push(result);
  }
  const allMatchingSets = results.map((r) => r.matchingKeys);
  const unionedKeys = unionSets(allMatchingSets);
  return {
    canOptimize: true,
    matchingKeys: unionedKeys,
    // An inexact (superset) disjunct makes the union a superset as well
    isExact: results.every((r) => r.isExact)
  };
}
function optimizeInArrayExpression(expression, collection) {
  if (expression.type !== `func` || expression.args.length !== 2) {
    return {
      canOptimize: false,
      matchingKeys: /* @__PURE__ */ new Set(),
      isExact: false
    };
  }
  const fieldArg = expression.args[0];
  const arrayArg = expression.args[1];
  if (fieldArg.type === `ref` && arrayArg.type === `val` && Array.isArray(arrayArg.value)) {
    const fieldPath = fieldArg.path;
    const values = arrayArg.value;
    const index = findIndexForField(collection, fieldPath);
    const isExact = values.every((value) => isExactComparisonValue(value));
    if (index) {
      if (index.supports(`in`)) {
        const matchingKeys = index.lookup(`in`, values);
        return {
          canOptimize: true,
          matchingKeys,
          isExact
        };
      } else if (index.supports(`eq`)) {
        const matchingKeys = /* @__PURE__ */ new Set();
        for (const value of values) {
          const keysForValue = index.lookup(`eq`, value);
          for (const key of keysForValue) {
            matchingKeys.add(key);
          }
        }
        return {
          canOptimize: true,
          matchingKeys,
          isExact
        };
      }
    }
  }
  return {
    canOptimize: false,
    matchingKeys: /* @__PURE__ */ new Set(),
    isExact: false
  };
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/indexes/index-registry.js
var devModeConfig = {
  enabled: true,
  collectionSizeThreshold: 1e3,
  slowQueryThresholdMs: 10,
  onSuggestion: null
};
function isDevModeEnabled() {
  return devModeConfig.enabled && true;
}
function emitIndexSuggestion(suggestion) {
  if (!isDevModeEnabled()) return;
  if (devModeConfig.onSuggestion) {
    try {
      devModeConfig.onSuggestion(suggestion);
    } catch {
    }
  } else {
    console.warn(`[TanStack DB] Index suggestion for "${suggestion.collectionId}":
  ${suggestion.message}
  Field: ${suggestion.fieldPath.join(`.`)}
  Add index: collection.createIndex((row) => row.${suggestion.fieldPath.join(`.`)})`);
  }
}
function checkCollectionSizeForIndex(collectionId, collectionSize, fieldPath) {
  if (!isDevModeEnabled()) return;
  if (collectionSize > devModeConfig.collectionSizeThreshold) {
    emitIndexSuggestion({
      type: `collection-size`,
      collectionId,
      fieldPath,
      message: `Collection has ${collectionSize} items. Queries on "${fieldPath.join(`.`)}" may benefit from an index.`,
      collectionSize
    });
  }
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/indexes/auto-index.js
function shouldAutoIndex(collection) {
  return collection.config.autoIndex === `eager`;
}
function ensureIndexForField(fieldName, fieldPath, collection, compareOptions, compareFn) {
  if (hasVirtualPropPath(fieldPath)) {
    return;
  }
  if (!shouldAutoIndex(collection)) {
    return;
  }
  const compareOpts = compareOptions ?? {
    ...DEFAULT_COMPARE_OPTIONS,
    ...collection.compareOptions
  };
  const existingIndex = Array.from(collection.indexes.values()).find((index) => index.matchesField(fieldPath) && index.matchesCompareOptions(compareOpts));
  if (existingIndex) {
    return;
  }
  if (isDevModeEnabled()) {
    checkCollectionSizeForIndex(collection.id || `unknown`, collection.size, fieldPath);
  }
  try {
    collection.createIndex((row) => {
      let current = row;
      for (const part of fieldPath) {
        current = current[part];
      }
      return current;
    }, {
      name: `auto:${fieldPath.join(`.`)}`,
      options: compareFn ? {
        compareFn,
        compareOptions: compareOpts
      } : {}
    });
  } catch (error) {
    console.warn(`${collection.id ? `[${collection.id}] ` : ``}Failed to create auto-index for field path "${fieldPath.join(`.`)}":`, error);
  }
}
function ensureIndexForExpression(expression, collection) {
  if (!shouldAutoIndex(collection)) {
    return;
  }
  const indexableExpressions = extractIndexableExpressions(expression);
  for (const { fieldName, fieldPath } of indexableExpressions) {
    ensureIndexForField(fieldName, fieldPath, collection);
  }
}
function extractIndexableExpressions(expression) {
  const results = [];
  function extractFromExpression(expr) {
    if (expr.type !== `func`) {
      return;
    }
    const func = expr;
    if (func.name === `and`) {
      for (const arg of func.args) {
        extractFromExpression(arg);
      }
      return;
    }
    const supportedOperations = [
      `eq`,
      `gt`,
      `gte`,
      `lt`,
      `lte`,
      `in`
    ];
    if (!supportedOperations.includes(func.name)) {
      return;
    }
    if (func.args.length < 1 || func.args[0].type !== `ref`) {
      return;
    }
    const fieldRef = func.args[0];
    const fieldPath = fieldRef.path;
    if (fieldPath.length === 0) {
      return;
    }
    const fieldName = fieldPath.join(`_`);
    results.push({
      fieldName,
      fieldPath
    });
  }
  extractFromExpression(expression);
  return results;
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db-ivm@0.1.18/node_modules/@tanstack/db-ivm/dist/esm/utils.js
var DefaultMap = class extends Map {
  constructor(defaultValue, entries) {
    super(entries);
    this.defaultValue = defaultValue;
  }
  get(key) {
    if (!this.has(key)) {
      return this.defaultValue();
    }
    return super.get(key);
  }
  /**
   * Update the value for a key using a function.
   */
  update(key, updater) {
    const value = this.get(key);
    const newValue = updater(value);
    this.set(key, newValue);
    return newValue;
  }
};
var chunkSize = 3e4;
function chunkedArrayPush(array, other) {
  if (other.length <= chunkSize) {
    array.push(...other);
  } else {
    for (let i = 0; i < other.length; i += chunkSize) {
      const chunk = other.slice(i, i + chunkSize);
      array.push(...chunk);
    }
  }
}
function binarySearch(array, value, comparator) {
  let low = 0;
  let high = array.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const comparison = comparator(array[mid], value);
    if (comparison < 0) {
      low = mid + 1;
    } else if (comparison > 0) {
      high = mid;
    } else {
      return mid;
    }
  }
  return low;
}
var ObjectIdGenerator = class {
  constructor() {
    this.objectIds = /* @__PURE__ */ new WeakMap();
    this.nextId = 0;
  }
  /**
   * Get a unique identifier for any value.
   * - Objects: Uses WeakMap for reference-based identity
   * - Primitives: Uses consistent string-based hashing
   */
  getId(value) {
    if (typeof value !== `object` || value === null) {
      const str = String(value);
      let hashValue = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hashValue = (hashValue << 5) - hashValue + char;
        hashValue = hashValue & hashValue;
      }
      return hashValue;
    }
    if (!this.objectIds.has(value)) {
      this.objectIds.set(value, this.nextId++);
    }
    return this.objectIds.get(value);
  }
  /**
   * Get a string representation of the ID for use in composite keys.
   */
  getStringId(value) {
    if (value === null) return `null`;
    if (value === void 0) return `undefined`;
    if (typeof value !== `object`) return `str_${String(value)}`;
    return `obj_${this.getId(value)}`;
  }
};
var globalObjectIdGenerator = new ObjectIdGenerator();
function diffHalfOpen(a, b) {
  const [a1, a2] = a;
  const [b1, b2] = b;
  const onlyInA = [
    ...range(a1, Math.min(a2, b1)),
    // left side of A outside B
    ...range(Math.max(a1, b2), a2)
  ];
  const onlyInB = [
    ...range(b1, Math.min(b2, a1)),
    ...range(Math.max(b1, a2), b2)
  ];
  return {
    onlyInA,
    onlyInB
  };
}
function range(start, end) {
  const out = [];
  for (let i = start; i < end; i++) out.push(i);
  return out;
}
function compareKeys(a, b) {
  if (typeof a === typeof b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }
  return typeof a === `string` ? -1 : 1;
}
function serializeValue(value) {
  return JSON.stringify(value, (_, val) => {
    if (typeof val === "bigint") {
      return val.toString();
    }
    if (val instanceof Date) {
      return val.toISOString();
    }
    return val;
  });
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db-ivm@0.1.18/node_modules/@tanstack/db-ivm/dist/esm/hashing/murmur.js
var RANDOM_SEED = randomHash();
var STRING_MARKER = randomHash();
var BIG_INT_MARKER = randomHash();
var NEG_BIG_INT_MARKER = randomHash();
var SYMBOL_MARKER = randomHash();
function randomHash() {
  return Math.random() * (2 ** 31 - 1) >>> 0;
}
var buf = new ArrayBuffer(8);
var dv = new DataView(buf);
var u8 = new Uint8Array(buf);
var MurmurHashStream = class {
  constructor() {
    this.hash = RANDOM_SEED;
    this.length = 0;
    this.carry = 0;
    this.carryBytes = 0;
  }
  _mix(k1) {
    k1 = Math.imul(k1, 3432918353);
    k1 = k1 << 15 | k1 >>> 17;
    k1 = Math.imul(k1, 461845907);
    this.hash ^= k1;
    this.hash = this.hash << 13 | this.hash >>> 19;
    this.hash = Math.imul(this.hash, 5) + 3864292196;
  }
  writeByte(byte) {
    this.carry |= (byte & 255) << 8 * this.carryBytes;
    this.carryBytes++;
    this.length++;
    if (this.carryBytes === 4) {
      this._mix(this.carry >>> 0);
      this.carry = 0;
      this.carryBytes = 0;
    }
  }
  update(chunk) {
    switch (typeof chunk) {
      case `symbol`: {
        this.update(SYMBOL_MARKER);
        const description = chunk.description;
        if (!description) {
          return;
        }
        for (let i = 0; i < description.length; i++) {
          const code = description.charCodeAt(i);
          this.writeByte(code & 255);
          this.writeByte(code >>> 8 & 255);
        }
        return;
      }
      case `string`:
        this.update(STRING_MARKER);
        for (let i = 0; i < chunk.length; i++) {
          const code = chunk.charCodeAt(i);
          this.writeByte(code & 255);
          this.writeByte(code >>> 8 & 255);
        }
        return;
      case `number`:
        dv.setFloat64(0, chunk, true);
        this.writeByte(u8[0]);
        this.writeByte(u8[1]);
        this.writeByte(u8[2]);
        this.writeByte(u8[3]);
        this.writeByte(u8[4]);
        this.writeByte(u8[5]);
        this.writeByte(u8[6]);
        this.writeByte(u8[7]);
        return;
      case `bigint`: {
        let value = chunk;
        if (value < 0n) {
          value = -value;
          this.update(NEG_BIG_INT_MARKER);
        } else {
          this.update(BIG_INT_MARKER);
        }
        while (value > 0n) {
          this.writeByte(Number(value & 0xffn));
          value >>= 8n;
        }
        if (chunk === 0n) this.writeByte(0);
        return;
      }
      default:
        throw new TypeError(`Unsupported input type: ${typeof chunk}`);
    }
  }
  digest() {
    if (this.carryBytes > 0) {
      let k1 = this.carry >>> 0;
      k1 = Math.imul(k1, 3432918353);
      k1 = k1 << 15 | k1 >>> 17;
      k1 = Math.imul(k1, 461845907);
      this.hash ^= k1;
    }
    this.hash ^= this.length;
    this.hash ^= this.hash >>> 16;
    this.hash = Math.imul(this.hash, 2246822507);
    this.hash ^= this.hash >>> 13;
    this.hash = Math.imul(this.hash, 3266489909);
    this.hash ^= this.hash >>> 16;
    return this.hash >>> 0;
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db-ivm@0.1.18/node_modules/@tanstack/db-ivm/dist/esm/hashing/hash.js
var TRUE = randomHash();
var FALSE = randomHash();
var NULL = randomHash();
var UNDEFINED = randomHash();
var KEY = randomHash();
var FUNCTIONS = randomHash();
var DATE_MARKER = randomHash();
var OBJECT_MARKER = randomHash();
var ARRAY_MARKER = randomHash();
var MAP_MARKER = randomHash();
var SET_MARKER = randomHash();
var UINT8ARRAY_MARKER = randomHash();
var TEMPORAL_MARKER = randomHash();
var temporalTypes2 = /* @__PURE__ */ new Set([
  `Temporal.Duration`,
  `Temporal.Instant`,
  `Temporal.PlainDate`,
  `Temporal.PlainDateTime`,
  `Temporal.PlainMonthDay`,
  `Temporal.PlainTime`,
  `Temporal.PlainYearMonth`,
  `Temporal.ZonedDateTime`
]);
function isTemporal2(input) {
  const tag = input[Symbol.toStringTag];
  return typeof tag === `string` && temporalTypes2.has(tag);
}
var UINT8ARRAY_CONTENT_HASH_THRESHOLD = 128;
var hashCache = /* @__PURE__ */ new WeakMap();
function hash(input) {
  const hasher = new MurmurHashStream();
  updateHasher(hasher, input);
  return hasher.digest();
}
function hashObject(input) {
  const cachedHash = hashCache.get(input);
  if (cachedHash !== void 0) {
    return cachedHash;
  }
  let valueHash;
  if (input instanceof Date) {
    valueHash = hashDate(input);
  } else if (
    // Check if input is a Uint8Array or Buffer
    typeof Buffer !== `undefined` && input instanceof Buffer || input instanceof Uint8Array
  ) {
    if (input.byteLength <= UINT8ARRAY_CONTENT_HASH_THRESHOLD) {
      valueHash = hashUint8Array(input);
    } else {
      return cachedReferenceHash(input);
    }
  } else if (input instanceof File) {
    return cachedReferenceHash(input);
  } else if (isTemporal2(input)) {
    valueHash = hashTemporal(input);
  } else {
    let plainObjectInput = input;
    let marker = OBJECT_MARKER;
    if (input instanceof Array) {
      marker = ARRAY_MARKER;
    }
    if (input instanceof Map) {
      marker = MAP_MARKER;
      plainObjectInput = [
        ...input.entries()
      ];
    }
    if (input instanceof Set) {
      marker = SET_MARKER;
      plainObjectInput = [
        ...input.entries()
      ];
    }
    valueHash = hashPlainObject(plainObjectInput, marker);
  }
  hashCache.set(input, valueHash);
  return valueHash;
}
function hashDate(input) {
  const hasher = new MurmurHashStream();
  hasher.update(DATE_MARKER);
  hasher.update(input.getTime());
  return hasher.digest();
}
function hashUint8Array(input) {
  const hasher = new MurmurHashStream();
  hasher.update(UINT8ARRAY_MARKER);
  hasher.update(input.byteLength);
  for (let i = 0; i < input.byteLength; i++) {
    hasher.writeByte(input[i]);
  }
  return hasher.digest();
}
function hashTemporal(input) {
  const hasher = new MurmurHashStream();
  hasher.update(TEMPORAL_MARKER);
  hasher.update(input[Symbol.toStringTag]);
  hasher.update(input.toString());
  return hasher.digest();
}
function hashPlainObject(input, marker) {
  const hasher = new MurmurHashStream();
  hasher.update(marker);
  const keys = Object.keys(input);
  keys.sort(keySort);
  for (const key of keys) {
    hasher.update(KEY);
    hasher.update(key);
    updateHasher(hasher, input[key]);
  }
  return hasher.digest();
}
function updateHasher(hasher, input) {
  if (input === null) {
    hasher.update(NULL);
    return;
  }
  switch (typeof input) {
    case `undefined`:
      hasher.update(UNDEFINED);
      return;
    case `boolean`:
      hasher.update(input ? TRUE : FALSE);
      return;
    case `number`:
      hasher.update(isNaN(input) ? NaN : input === 0 ? 0 : input);
      return;
    case `bigint`:
    case `string`:
    case `symbol`:
      hasher.update(input);
      return;
    case `object`:
      hasher.update(getCachedHash(input));
      return;
    case `function`:
      hasher.update(cachedReferenceHash(input));
      return;
    default:
      console.warn(`Ignored input during hashing because it is of type ${typeof input} which is not supported`);
  }
}
function getCachedHash(input) {
  let valueHash = hashCache.get(input);
  if (valueHash === void 0) {
    valueHash = hashObject(input);
  }
  return valueHash;
}
var nextRefId = 1;
function cachedReferenceHash(fn) {
  let valueHash = hashCache.get(fn);
  if (valueHash === void 0) {
    valueHash = nextRefId ^ FUNCTIONS;
    nextRefId++;
    hashCache.set(fn, valueHash);
  }
  return valueHash;
}
function keySort(a, b) {
  return a.localeCompare(b);
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db-ivm@0.1.18/node_modules/@tanstack/db-ivm/dist/esm/multiset.js
var MultiSet = class _MultiSet {
  #inner;
  constructor(data = []) {
    this.#inner = data;
  }
  toString(indent = false) {
    return `MultiSet(${JSON.stringify(this.#inner, null, indent ? 2 : void 0)})`;
  }
  toJSON() {
    return JSON.stringify(Array.from(this.getInner()));
  }
  static fromJSON(json) {
    return new _MultiSet(JSON.parse(json));
  }
  /**
   * Apply a function to all records in the collection.
   */
  map(f) {
    return new _MultiSet(this.#inner.map(([data, multiplicity]) => [
      f(data),
      multiplicity
    ]));
  }
  /**
   * Filter out records for which a function f(record) evaluates to False.
   */
  filter(f) {
    return new _MultiSet(this.#inner.filter(([data, _]) => f(data)));
  }
  /**
   * Negate all multiplicities in the collection.
   */
  negate() {
    return new _MultiSet(this.#inner.map(([data, multiplicity]) => [
      data,
      -multiplicity
    ]));
  }
  /**
   * Concatenate two collections together.
   */
  concat(other) {
    const out = [];
    chunkedArrayPush(out, this.#inner);
    chunkedArrayPush(out, other.getInner());
    return new _MultiSet(out);
  }
  /**
   * Produce as output a collection that is logically equivalent to the input
   * but which combines identical instances of the same record into one
   * (record, multiplicity) pair.
   */
  consolidate() {
    if (this.#inner.length > 0) {
      const firstItem = this.#inner[0]?.[0];
      if (Array.isArray(firstItem) && firstItem.length === 2) {
        return this.#consolidateKeyed();
      }
    }
    return this.#consolidateUnkeyed();
  }
  /**
   * Private method for consolidating keyed multisets where keys are strings/numbers
   * and values are compared by reference equality.
   *
   * This method provides significant performance improvements over the hash-based approach
   * by using WeakMap for object reference tracking and avoiding expensive serialization.
   *
   * Special handling for join operations: When values are tuples of length 2 (common in joins),
   * we unpack them and compare each element individually to maintain proper equality semantics.
   */
  #consolidateKeyed() {
    const consolidated = /* @__PURE__ */ new Map();
    const values = /* @__PURE__ */ new Map();
    const getTupleId = (tuple) => {
      if (tuple.length !== 2) {
        throw new Error(`Expected tuple of length 2`);
      }
      const [first, second] = tuple;
      return `${globalObjectIdGenerator.getStringId(first)}|${globalObjectIdGenerator.getStringId(second)}`;
    };
    for (const [data, multiplicity] of this.#inner) {
      if (!Array.isArray(data) || data.length !== 2) {
        return this.#consolidateUnkeyed();
      }
      const [key, value] = data;
      if (typeof key !== `string` && typeof key !== `number`) {
        return this.#consolidateUnkeyed();
      }
      let valueId;
      if (Array.isArray(value) && value.length === 2) {
        valueId = getTupleId(value);
      } else {
        valueId = globalObjectIdGenerator.getStringId(value);
      }
      const compositeKey = key + `|` + valueId;
      consolidated.set(compositeKey, (consolidated.get(compositeKey) || 0) + multiplicity);
      if (!values.has(compositeKey)) {
        values.set(compositeKey, data);
      }
    }
    const result = [];
    for (const [compositeKey, multiplicity] of consolidated) {
      if (multiplicity !== 0) {
        result.push([
          values.get(compositeKey),
          multiplicity
        ]);
      }
    }
    return new _MultiSet(result);
  }
  /**
   * Private method for consolidating unkeyed multisets using the original approach.
   */
  #consolidateUnkeyed() {
    const consolidated = new DefaultMap(() => 0);
    const values = /* @__PURE__ */ new Map();
    let hasString = false;
    let hasNumber = false;
    let hasOther = false;
    for (const [data, _] of this.#inner) {
      if (typeof data === `string`) {
        hasString = true;
      } else if (typeof data === `number`) {
        hasNumber = true;
      } else {
        hasOther = true;
        break;
      }
    }
    const requireJson = hasOther || hasString && hasNumber;
    for (const [data, multiplicity] of this.#inner) {
      const key = requireJson ? hash(data) : data;
      if (requireJson && !values.has(key)) {
        values.set(key, data);
      }
      consolidated.update(key, (count6) => count6 + multiplicity);
    }
    const result = [];
    for (const [key, multiplicity] of consolidated.entries()) {
      if (multiplicity !== 0) {
        const parsedKey = requireJson ? values.get(key) : key;
        result.push([
          parsedKey,
          multiplicity
        ]);
      }
    }
    return new _MultiSet(result);
  }
  extend(other) {
    const otherArray = other instanceof _MultiSet ? other.getInner() : other;
    chunkedArrayPush(this.#inner, otherArray);
  }
  add(item, multiplicity) {
    if (multiplicity !== 0) {
      this.#inner.push([
        item,
        multiplicity
      ]);
    }
  }
  getInner() {
    return this.#inner;
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db-ivm@0.1.18/node_modules/@tanstack/db-ivm/dist/esm/graph.js
var DifferenceStreamReader = class {
  #queue;
  constructor(queue) {
    this.#queue = queue;
  }
  drain() {
    const out = [
      ...this.#queue
    ].reverse();
    this.#queue.length = 0;
    return out;
  }
  isEmpty() {
    return this.#queue.length === 0;
  }
};
var DifferenceStreamWriter = class {
  #queues = [];
  sendData(collection) {
    if (!(collection instanceof MultiSet)) {
      collection = new MultiSet(collection);
    }
    for (const q of this.#queues) {
      q.unshift(collection);
    }
  }
  newReader() {
    const q = [];
    this.#queues.push(q);
    return new DifferenceStreamReader(q);
  }
};
var Operator = class {
  constructor(id, inputs, output2) {
    this.id = id;
    this.inputs = inputs;
    this.output = output2;
  }
  hasPendingWork() {
    return this.inputs.some((input) => !input.isEmpty());
  }
};
var UnaryOperator = class extends Operator {
  constructor(id, inputA, output2) {
    super(id, [
      inputA
    ], output2);
    this.id = id;
  }
  inputMessages() {
    return this.inputs[0].drain();
  }
};
var BinaryOperator = class extends Operator {
  constructor(id, inputA, inputB, output2) {
    super(id, [
      inputA,
      inputB
    ], output2);
    this.id = id;
  }
  inputAMessages() {
    return this.inputs[0].drain();
  }
  inputBMessages() {
    return this.inputs[1].drain();
  }
};
var LinearUnaryOperator = class extends UnaryOperator {
  run() {
    for (const message of this.inputMessages()) {
      this.output.sendData(this.inner(message));
    }
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db-ivm@0.1.18/node_modules/@tanstack/db-ivm/dist/esm/d2.js
var D2 = class {
  #operators = [];
  #nextOperatorId = 0;
  #finalized = false;
  constructor() {
  }
  #checkNotFinalized() {
    if (this.#finalized) {
      throw new Error(`Graph already finalized`);
    }
  }
  getNextOperatorId() {
    this.#checkNotFinalized();
    return this.#nextOperatorId++;
  }
  newInput() {
    this.#checkNotFinalized();
    const writer = new DifferenceStreamWriter();
    const streamBuilder = new RootStreamBuilder(this, writer);
    return streamBuilder;
  }
  addOperator(operator) {
    this.#checkNotFinalized();
    this.#operators.push(operator);
  }
  finalize() {
    this.#checkNotFinalized();
    this.#finalized = true;
  }
  step() {
    if (!this.#finalized) {
      throw new Error(`Graph not finalized`);
    }
    for (const op of this.#operators) {
      op.run();
    }
  }
  pendingWork() {
    return this.#operators.some((op) => op.hasPendingWork());
  }
  run() {
    while (this.pendingWork()) {
      this.step();
    }
  }
};
var StreamBuilder = class {
  #graph;
  #writer;
  constructor(graph, writer) {
    this.#graph = graph;
    this.#writer = writer;
  }
  connectReader() {
    return this.#writer.newReader();
  }
  get writer() {
    return this.#writer;
  }
  get graph() {
    return this.#graph;
  }
  pipe(...operators2) {
    return operators2.reduce((stream, operator) => {
      return operator(stream);
    }, this);
  }
};
var RootStreamBuilder = class extends StreamBuilder {
  sendData(collection) {
    this.writer.sendData(collection);
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db-ivm@0.1.18/node_modules/@tanstack/db-ivm/dist/esm/operators/concat.js
var ConcatOperator = class extends BinaryOperator {
  run() {
    for (const message of this.inputAMessages()) {
      this.output.sendData(message);
    }
    for (const message of this.inputBMessages()) {
      this.output.sendData(message);
    }
  }
};
function concat(other) {
  return (stream) => {
    if (stream.graph !== other.graph) {
      throw new Error(`Cannot concat streams from different graphs`);
    }
    const output2 = new StreamBuilder(stream.graph, new DifferenceStreamWriter());
    const operator = new ConcatOperator(stream.graph.getNextOperatorId(), stream.connectReader(), other.connectReader(), output2.writer);
    stream.graph.addOperator(operator);
    return output2;
  };
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db-ivm@0.1.18/node_modules/@tanstack/db-ivm/dist/esm/operators/consolidate.js
var ConsolidateOperator = class extends UnaryOperator {
  run() {
    const messages = this.inputMessages();
    if (messages.length === 0) {
      return;
    }
    const combined = new MultiSet();
    for (const message of messages) {
      combined.extend(message);
    }
    const consolidated = combined.consolidate();
    if (consolidated.getInner().length > 0) {
      this.output.sendData(consolidated);
    }
  }
};
function consolidate() {
  return (stream) => {
    const output2 = new StreamBuilder(stream.graph, new DifferenceStreamWriter());
    const operator = new ConsolidateOperator(stream.graph.getNextOperatorId(), stream.connectReader(), output2.writer);
    stream.graph.addOperator(operator);
    return output2;
  };
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db-ivm@0.1.18/node_modules/@tanstack/db-ivm/dist/esm/indexes.js
var NO_PREFIX = /* @__PURE__ */ Symbol(`NO_PREFIX`);
var PrefixMap = class extends Map {
  /**
   * Add a value to the PrefixMap. Returns true if the map becomes empty after the operation.
   */
  addValue(value, multiplicity) {
    if (multiplicity === 0) return this.size === 0;
    const prefix = getPrefix(value);
    const valueMapOrSingleValue = this.get(prefix);
    if (isSingleValue(valueMapOrSingleValue)) {
      const [currentValue, currentMultiplicity] = valueMapOrSingleValue;
      const currentPrefix = getPrefix(currentValue);
      if (currentPrefix !== prefix) {
        throw new Error(`Mismatching prefixes, this should never happen`);
      }
      if (currentValue === value || hash(currentValue) === hash(value)) {
        const newMultiplicity = currentMultiplicity + multiplicity;
        if (newMultiplicity === 0) {
          this.delete(prefix);
        } else {
          this.set(prefix, [
            value,
            newMultiplicity
          ]);
        }
      } else {
        const valueMap = new ValueMap();
        valueMap.set(hash(currentValue), valueMapOrSingleValue);
        valueMap.set(hash(value), [
          value,
          multiplicity
        ]);
        this.set(prefix, valueMap);
      }
    } else if (valueMapOrSingleValue === void 0) {
      this.set(prefix, [
        value,
        multiplicity
      ]);
    } else {
      const isEmpty = valueMapOrSingleValue.addValue(value, multiplicity);
      if (isEmpty) {
        this.delete(prefix);
      }
    }
    return this.size === 0;
  }
};
var ValueMap = class extends Map {
  /**
   * Add a value to the ValueMap. Returns true if the map becomes empty after the operation.
   * @param value - The full value to store
   * @param multiplicity - The multiplicity to add
   * @param hashKey - Optional hash key to use instead of hashing the full value (used when in PrefixMap context)
   */
  addValue(value, multiplicity) {
    if (multiplicity === 0) return this.size === 0;
    const key = hash(value);
    const currentValue = this.get(key);
    if (currentValue) {
      const [, currentMultiplicity] = currentValue;
      const newMultiplicity = currentMultiplicity + multiplicity;
      if (newMultiplicity === 0) {
        this.delete(key);
      } else {
        this.set(key, [
          value,
          newMultiplicity
        ]);
      }
    } else {
      this.set(key, [
        value,
        multiplicity
      ]);
    }
    return this.size === 0;
  }
};
var Index = class _Index {
  /*
   * This index maintains a nested map of keys -> (value, multiplicities), where:
   * - initially the values are stored against the key as a single value tuple
   * - when a key gets additional values, the values are stored against the key in a
   *   prefix map
   * - the prefix is extract where possible from values that are structured as
   *   [rowPrimaryKey, rowValue], as they are in the Tanstack DB query pipeline.
   * - only when there are multiple values for a given prefix do we fall back to a
   *   hash to identify identical values, storing them in a third level value map.
   */
  #inner;
  #consolidatedMultiplicity = /* @__PURE__ */ new Map();
  // sum of multiplicities per key
  constructor() {
    this.#inner = /* @__PURE__ */ new Map();
  }
  /**
   * Create an Index from multiple MultiSet messages.
   * @param messages - Array of MultiSet messages to build the index from.
   * @returns A new Index containing all the data from the messages.
   */
  static fromMultiSets(messages) {
    const index = new _Index();
    for (const message of messages) {
      for (const [item, multiplicity] of message.getInner()) {
        const [key, value] = item;
        index.addValue(key, [
          value,
          multiplicity
        ]);
      }
    }
    return index;
  }
  /**
   * This method returns a string representation of the index.
   * @param indent - Whether to indent the string representation.
   * @returns A string representation of the index.
   */
  toString(indent = false) {
    return `Index(${JSON.stringify([
      ...this.entries()
    ], void 0, indent ? 2 : void 0)})`;
  }
  /**
   * The size of the index.
   */
  get size() {
    return this.#inner.size;
  }
  /**
   * This method checks if the index has a given key.
   * @param key - The key to check.
   * @returns True if the index has the key, false otherwise.
   */
  has(key) {
    return this.#inner.has(key);
  }
  /**
   * Check if a key has presence (non-zero consolidated multiplicity).
   * @param key - The key to check.
   * @returns True if the key has non-zero consolidated multiplicity, false otherwise.
   */
  hasPresence(key) {
    return (this.#consolidatedMultiplicity.get(key) || 0) !== 0;
  }
  /**
   * Get the consolidated multiplicity (sum of multiplicities) for a key.
   * @param key - The key to get the consolidated multiplicity for.
   * @returns The consolidated multiplicity for the key.
   */
  getConsolidatedMultiplicity(key) {
    return this.#consolidatedMultiplicity.get(key) || 0;
  }
  /**
   * Get all keys that have presence (non-zero consolidated multiplicity).
   * @returns An iterator of keys with non-zero consolidated multiplicity.
   */
  getPresenceKeys() {
    return this.#consolidatedMultiplicity.keys();
  }
  /**
   * This method returns all values for a given key.
   * @param key - The key to get the values for.
   * @returns An array of value tuples [value, multiplicity].
   */
  get(key) {
    return [
      ...this.getIterator(key)
    ];
  }
  /**
   * This method returns an iterator over all values for a given key.
   * @param key - The key to get the values for.
   * @returns An iterator of value tuples [value, multiplicity].
   */
  *getIterator(key) {
    const mapOrSingleValue = this.#inner.get(key);
    if (isSingleValue(mapOrSingleValue)) {
      yield mapOrSingleValue;
    } else if (mapOrSingleValue === void 0) {
      return;
    } else if (mapOrSingleValue instanceof ValueMap) {
      for (const valueTuple of mapOrSingleValue.values()) {
        yield valueTuple;
      }
    } else {
      for (const singleValueOrValueMap of mapOrSingleValue.values()) {
        if (isSingleValue(singleValueOrValueMap)) {
          yield singleValueOrValueMap;
        } else {
          for (const valueTuple of singleValueOrValueMap.values()) {
            yield valueTuple;
          }
        }
      }
    }
  }
  /**
   * This returns an iterator that iterates over all key-value pairs.
   * @returns An iterable of all key-value pairs (and their multiplicities) in the index.
   */
  *entries() {
    for (const key of this.#inner.keys()) {
      for (const valueTuple of this.getIterator(key)) {
        yield [
          key,
          valueTuple
        ];
      }
    }
  }
  /**
   * This method only iterates over the keys and not over the values.
   * Hence, it is more efficient than the `#entries` method.
   * It returns an iterator that you can use if you need to iterate over the values for a given key.
   * @returns An iterator of all *keys* in the index and their corresponding value iterator.
   */
  *entriesIterators() {
    for (const key of this.#inner.keys()) {
      yield [
        key,
        this.getIterator(key)
      ];
    }
  }
  /**
   * This method adds a value to the index.
   * @param key - The key to add the value to.
   * @param valueTuple - The value tuple [value, multiplicity] to add to the index.
   */
  addValue(key, valueTuple) {
    const [value, multiplicity] = valueTuple;
    if (multiplicity === 0) return;
    const newConsolidatedMultiplicity = (this.#consolidatedMultiplicity.get(key) || 0) + multiplicity;
    if (newConsolidatedMultiplicity === 0) {
      this.#consolidatedMultiplicity.delete(key);
    } else {
      this.#consolidatedMultiplicity.set(key, newConsolidatedMultiplicity);
    }
    const mapOrSingleValue = this.#inner.get(key);
    if (mapOrSingleValue === void 0) {
      this.#inner.set(key, valueTuple);
      return;
    }
    if (isSingleValue(mapOrSingleValue)) {
      this.#handleSingleValueTransition(key, mapOrSingleValue, value, multiplicity);
      return;
    }
    if (mapOrSingleValue instanceof ValueMap) {
      const prefix = getPrefix(value);
      if (prefix !== NO_PREFIX) {
        const prefixMap = new PrefixMap();
        prefixMap.set(NO_PREFIX, mapOrSingleValue);
        prefixMap.set(prefix, valueTuple);
        this.#inner.set(key, prefixMap);
      } else {
        const isEmpty = mapOrSingleValue.addValue(value, multiplicity);
        if (isEmpty) {
          this.#inner.delete(key);
        }
      }
    } else {
      const isEmpty = mapOrSingleValue.addValue(value, multiplicity);
      if (isEmpty) {
        this.#inner.delete(key);
      }
    }
  }
  /**
   * Handle the transition from a single value to either a ValueMap or PrefixMap
   */
  #handleSingleValueTransition(key, currentSingleValue, newValue, multiplicity) {
    const [currentValue, currentMultiplicity] = currentSingleValue;
    if (currentValue === newValue) {
      const newMultiplicity = currentMultiplicity + multiplicity;
      if (newMultiplicity === 0) {
        this.#inner.delete(key);
      } else {
        this.#inner.set(key, [
          newValue,
          newMultiplicity
        ]);
      }
      return;
    }
    const newPrefix = getPrefix(newValue);
    const currentPrefix = getPrefix(currentValue);
    if (currentPrefix === newPrefix && (currentValue === newValue || hash(currentValue) === hash(newValue))) {
      const newMultiplicity = currentMultiplicity + multiplicity;
      if (newMultiplicity === 0) {
        this.#inner.delete(key);
      } else {
        this.#inner.set(key, [
          newValue,
          newMultiplicity
        ]);
      }
      return;
    }
    if (currentPrefix === NO_PREFIX && newPrefix === NO_PREFIX) {
      const valueMap = new ValueMap();
      valueMap.set(hash(currentValue), currentSingleValue);
      valueMap.set(hash(newValue), [
        newValue,
        multiplicity
      ]);
      this.#inner.set(key, valueMap);
    } else {
      const prefixMap = new PrefixMap();
      if (currentPrefix === newPrefix) {
        const valueMap = new ValueMap();
        valueMap.set(hash(currentValue), currentSingleValue);
        valueMap.set(hash(newValue), [
          newValue,
          multiplicity
        ]);
        prefixMap.set(currentPrefix, valueMap);
      } else {
        prefixMap.set(currentPrefix, currentSingleValue);
        prefixMap.set(newPrefix, [
          newValue,
          multiplicity
        ]);
      }
      this.#inner.set(key, prefixMap);
    }
  }
  /**
   * This method appends another index to the current index.
   * @param other - The index to append to the current index.
   */
  append(other) {
    for (const [key, value] of other.entries()) {
      this.addValue(key, value);
    }
  }
  /**
   * This method joins two indexes.
   * @param other - The index to join with the current index.
   * @returns A multiset of the joined values.
   */
  join(other) {
    const result = [];
    if (this.size <= other.size) {
      for (const [key, valueIt] of this.entriesIterators()) {
        if (!other.has(key)) continue;
        const otherValues = other.get(key);
        for (const [val1, mul1] of valueIt) {
          for (const [val2, mul2] of otherValues) {
            if (mul1 !== 0 && mul2 !== 0) {
              result.push([
                [
                  key,
                  [
                    val1,
                    val2
                  ]
                ],
                mul1 * mul2
              ]);
            }
          }
        }
      }
    } else {
      for (const [key, otherValueIt] of other.entriesIterators()) {
        if (!this.has(key)) continue;
        const values = this.get(key);
        for (const [val2, mul2] of otherValueIt) {
          for (const [val1, mul1] of values) {
            if (mul1 !== 0 && mul2 !== 0) {
              result.push([
                [
                  key,
                  [
                    val1,
                    val2
                  ]
                ],
                mul1 * mul2
              ]);
            }
          }
        }
      }
    }
    return new MultiSet(result);
  }
};
function getPrefix(value) {
  if (Array.isArray(value) && (typeof value[0] === `string` || typeof value[0] === `number` || typeof value[0] === `bigint`)) {
    return value[0];
  }
  return NO_PREFIX;
}
function isSingleValue(value) {
  return Array.isArray(value);
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db-ivm@0.1.18/node_modules/@tanstack/db-ivm/dist/esm/operators/reduce.js
var ReduceOperator = class extends UnaryOperator {
  #index = new Index();
  #indexOut = new Index();
  #f;
  constructor(id, inputA, output2, f) {
    super(id, inputA, output2);
    this.#f = f;
  }
  run() {
    const keysTodo = /* @__PURE__ */ new Set();
    for (const message of this.inputMessages()) {
      for (const [item, multiplicity] of message.getInner()) {
        const [key, value] = item;
        this.#index.addValue(key, [
          value,
          multiplicity
        ]);
        keysTodo.add(key);
      }
    }
    const result = [];
    for (const key of keysTodo) {
      const curr = this.#index.get(key);
      const currOut = this.#indexOut.get(key);
      const out = this.#f(curr);
      const newOutputMap = /* @__PURE__ */ new Map();
      const oldOutputMap = /* @__PURE__ */ new Map();
      for (const [value, multiplicity] of out) {
        const existing = newOutputMap.get(value) ?? 0;
        newOutputMap.set(value, existing + multiplicity);
      }
      for (const [value, multiplicity] of currOut) {
        const existing = oldOutputMap.get(value) ?? 0;
        oldOutputMap.set(value, existing + multiplicity);
      }
      for (const [value, multiplicity] of oldOutputMap) {
        if (!newOutputMap.has(value)) {
          result.push([
            [
              key,
              value
            ],
            -multiplicity
          ]);
          this.#indexOut.addValue(key, [
            value,
            -multiplicity
          ]);
        }
      }
      for (const [value, multiplicity] of newOutputMap) {
        if (!oldOutputMap.has(value)) {
          if (multiplicity !== 0) {
            result.push([
              [
                key,
                value
              ],
              multiplicity
            ]);
            this.#indexOut.addValue(key, [
              value,
              multiplicity
            ]);
          }
        }
      }
      for (const [value, newMultiplicity] of newOutputMap) {
        const oldMultiplicity = oldOutputMap.get(value);
        if (oldMultiplicity !== void 0) {
          const delta = newMultiplicity - oldMultiplicity;
          if (delta !== 0) {
            result.push([
              [
                key,
                value
              ],
              delta
            ]);
            this.#indexOut.addValue(key, [
              value,
              delta
            ]);
          }
        }
      }
    }
    if (result.length > 0) {
      this.output.sendData(new MultiSet(result));
    }
  }
};
function reduce(f) {
  return (stream) => {
    const output2 = new StreamBuilder(stream.graph, new DifferenceStreamWriter());
    const operator = new ReduceOperator(stream.graph.getNextOperatorId(), stream.connectReader(), output2.writer, f);
    stream.graph.addOperator(operator);
    return output2;
  };
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db-ivm@0.1.18/node_modules/@tanstack/db-ivm/dist/esm/operators/distinct.js
var DistinctOperator = class extends UnaryOperator {
  #by;
  #values;
  // keeps track of the number of times each value has been seen
  constructor(id, input, output2, by = (value) => value) {
    super(id, input, output2);
    this.#by = by;
    this.#values = /* @__PURE__ */ new Map();
  }
  run() {
    const updatedValues = /* @__PURE__ */ new Map();
    for (const message of this.inputMessages()) {
      for (const [value, diff] of message.getInner()) {
        const hashedValue = hash(this.#by(value));
        const oldMultiplicity = updatedValues.get(hashedValue)?.[0] ?? this.#values.get(hashedValue) ?? 0;
        const newMultiplicity = oldMultiplicity + diff;
        updatedValues.set(hashedValue, [
          newMultiplicity,
          value
        ]);
      }
    }
    const result = [];
    for (const [hashedValue, [newMultiplicity, value]] of updatedValues.entries()) {
      const oldMultiplicity = this.#values.get(hashedValue) ?? 0;
      if (newMultiplicity === 0) {
        this.#values.delete(hashedValue);
      } else {
        this.#values.set(hashedValue, newMultiplicity);
      }
      if (oldMultiplicity <= 0 && newMultiplicity > 0) {
        result.push([
          [
            hash(this.#by(value)),
            value[1]
          ],
          1
        ]);
      } else if (oldMultiplicity > 0 && newMultiplicity <= 0) {
        result.push([
          [
            hash(this.#by(value)),
            value[1]
          ],
          -1
        ]);
      }
    }
    if (result.length > 0) {
      this.output.sendData(new MultiSet(result));
    }
  }
};
function distinct(by = (value) => value) {
  return (stream) => {
    const output2 = new StreamBuilder(stream.graph, new DifferenceStreamWriter());
    const operator = new DistinctOperator(stream.graph.getNextOperatorId(), stream.connectReader(), output2.writer, by);
    stream.graph.addOperator(operator);
    return output2;
  };
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db-ivm@0.1.18/node_modules/@tanstack/db-ivm/dist/esm/operators/filter.js
var FilterOperator = class extends LinearUnaryOperator {
  #f;
  constructor(id, inputA, output2, f) {
    super(id, inputA, output2);
    this.#f = f;
  }
  inner(collection) {
    return collection.filter(this.#f);
  }
};
function filter(f) {
  return (stream) => {
    const output2 = new StreamBuilder(stream.graph, new DifferenceStreamWriter());
    const operator = new FilterOperator(stream.graph.getNextOperatorId(), stream.connectReader(), output2.writer, f);
    stream.graph.addOperator(operator);
    return output2;
  };
}

// ../../libraries/mecha/packages/node_modules/.deno/fractional-indexing@3.4.0/node_modules/fractional-indexing/src/index.js
var BASE_62_DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
var digitIndexCache = /* @__PURE__ */ new Map();
function getDigitIndex(digits) {
  let m = digitIndexCache.get(digits);
  if (m === void 0) {
    m = new Uint8Array(256);
    for (let i = 0; i < digits.length; i++) {
      m[digits.charCodeAt(i)] = i;
    }
    digitIndexCache.set(digits, m);
  }
  return m;
}
function midpoint(a, b, digits, lookup) {
  const zero = digits[0];
  if (b != null && a >= b) {
    throw new Error(a + " >= " + b);
  }
  if (a.slice(-1) === zero || b && b.slice(-1) === zero) {
    throw new Error("trailing zero");
  }
  if (b) {
    let n = 0;
    while ((a[n] || zero) === b[n]) {
      n++;
    }
    if (n > 0) {
      return b.slice(0, n) + midpoint(a.slice(n), b.slice(n), digits, lookup);
    }
  }
  const digitA = a ? (
    /** @type {number} */
    lookup[a.charCodeAt(0)]
  ) : 0;
  const digitB = b != null ? (
    /** @type {number} */
    lookup[b.charCodeAt(0)]
  ) : digits.length;
  if (digitB - digitA > 1) {
    const midDigit = Math.round(0.5 * (digitA + digitB));
    return digits[midDigit];
  } else {
    if (b && b.length > 1) {
      return b.slice(0, 1);
    } else {
      return digits[digitA] + midpoint(a.slice(1), null, digits, lookup);
    }
  }
}
function validateInteger(int, intDigits) {
  if (int.length !== getIntegerLength(int[0], intDigits)) {
    throw new Error("invalid integer part of order key: " + int);
  }
}
function getIntegerLength(head, intDigits) {
  if (intDigits === void 0) {
    const c = head.charCodeAt(0);
    if (c >= 97 && c <= 122) {
      return c - 97 + 2;
    }
    if (c >= 65 && c <= 90) {
      return 90 - c + 2;
    }
  } else {
    const i = intDigits.indexOf(head);
    if (i !== -1) {
      const half = intDigits.length / 2;
      return i < half ? half - i + 1 : i - half + 2;
    }
  }
  throw new Error("invalid order key head: " + head);
}
function getIntegerPart(key, intDigits) {
  const integerPartLength = getIntegerLength(key[0], intDigits);
  if (integerPartLength > key.length) {
    throw new Error("invalid order key: " + key);
  }
  return key.slice(0, integerPartLength);
}
function validateOrderKey(key, digits, intDigits) {
  if (isSmallestInteger(key, digits, intDigits)) {
    throw new Error("invalid order key: " + key);
  }
  const i = getIntegerPart(key, intDigits);
  const f = key.slice(i.length);
  if (f.slice(-1) === digits[0]) {
    throw new Error("invalid order key: " + key);
  }
}
function incrementInteger(x, digits, lookup, intDigits) {
  validateInteger(x, intDigits);
  const head = x[0];
  const zero = digits[0];
  let trailing = "";
  for (let i = x.length - 1; i >= 1; i--) {
    const d = (
      /** @type {number} */
      lookup[x.charCodeAt(i)] + 1
    );
    if (d === digits.length) {
      trailing = zero + trailing;
    } else {
      return head + x.slice(1, i) + digits[d] + trailing;
    }
  }
  if (intDigits === void 0) {
    if (head === "Z") {
      return "a" + zero;
    }
    if (head === "z") {
      return null;
    }
    const h2 = String.fromCharCode(head.charCodeAt(0) + 1);
    return h2 + (h2 > "a" ? trailing + zero : trailing.slice(1));
  }
  const headIndex = intDigits.indexOf(head);
  if (headIndex === intDigits.length - 1) {
    return null;
  }
  const h = intDigits[headIndex + 1];
  const lengthDelta = getIntegerLength(h, intDigits) - getIntegerLength(head, intDigits);
  return h + (lengthDelta > 0 ? trailing + zero : lengthDelta < 0 ? trailing.slice(1) : trailing);
}
function decrementInteger(x, digits, lookup, intDigits) {
  validateInteger(x, intDigits);
  const head = x[0];
  const last = digits[digits.length - 1];
  let trailing = "";
  for (let i = x.length - 1; i >= 1; i--) {
    const d = (
      /** @type {number} */
      lookup[x.charCodeAt(i)] - 1
    );
    if (d === -1) {
      trailing = last + trailing;
    } else {
      return head + x.slice(1, i) + digits[d] + trailing;
    }
  }
  if (intDigits === void 0) {
    if (head === "a") {
      return "Z" + last;
    }
    if (head === "A") {
      return null;
    }
    const h2 = String.fromCharCode(head.charCodeAt(0) - 1);
    return h2 + (h2 < "Z" ? trailing + last : trailing.slice(1));
  }
  const headIndex = intDigits.indexOf(head);
  if (headIndex === 0) {
    return null;
  }
  const h = intDigits[headIndex - 1];
  const lengthDelta = getIntegerLength(h, intDigits) - getIntegerLength(head, intDigits);
  return h + (lengthDelta > 0 ? trailing + last : lengthDelta < 0 ? trailing.slice(1) : trailing);
}
var repeatedKeysCache = /* @__PURE__ */ new Map();
function isSmallestInteger(key, digits, intDigits = "") {
  let byDigit = repeatedKeysCache.get(intDigits);
  if (byDigit === void 0) {
    byDigit = /* @__PURE__ */ new Map();
    repeatedKeysCache.set(intDigits, byDigit);
  }
  const zeroCode = digits.charCodeAt(0);
  let cached = byDigit.get(zeroCode);
  if (cached === void 0) {
    cached = intDigits === "" ? "A" + digits[0].repeat(26) : intDigits[0] + digits[0].repeat(intDigits.length / 2);
    byDigit.set(zeroCode, cached);
  }
  return key === cached;
}
function isStrictlyAscending(s) {
  for (let i = 1; i < s.length; i++) {
    if (s.charCodeAt(i - 1) >= s.charCodeAt(i)) {
      return false;
    }
  }
  return true;
}
function isSingleByte(s) {
  for (let i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) > 255) {
      return false;
    }
  }
  return true;
}
var validatedDigits = /* @__PURE__ */ new Set();
function validateDigits(digits) {
  if (validatedDigits.has(digits)) {
    return;
  }
  if (digits.length < 2 || !isStrictlyAscending(digits)) {
    throw new Error("digits must be at least 2 characters in strictly ascending character code order: " + digits);
  }
  if (!isSingleByte(digits)) {
    throw new Error("digits must be single-byte (char code 0-255): " + digits);
  }
  validatedDigits.add(digits);
}
var validatedIntDigits = /* @__PURE__ */ new Set();
function validateIntDigits(intDigits) {
  if (validatedIntDigits.has(intDigits)) {
    return;
  }
  if (intDigits.length < 2 || intDigits.length % 2 !== 0 || !isStrictlyAscending(intDigits)) {
    throw new Error("intDigits must be an even number of at least 2 characters in strictly ascending character code order: " + intDigits);
  }
  if (!isSingleByte(intDigits)) {
    throw new Error("intDigits must be single-byte (char code 0-255): " + intDigits);
  }
  validatedIntDigits.add(intDigits);
}
function generateKeyBetween(a, b, digits = BASE_62_DIGITS, intDigits = void 0) {
  validateDigits(digits);
  if (intDigits !== void 0) {
    validateIntDigits(intDigits);
  }
  const lookup = getDigitIndex(digits);
  if (a != null) {
    validateOrderKey(a, digits, intDigits);
  }
  if (b != null) {
    validateOrderKey(b, digits, intDigits);
  }
  if (a != null && b != null) {
    if (a > b) {
      const temp = a;
      a = b;
      b = temp;
    }
  }
  if (a == null) {
    if (b == null) {
      const head = intDigits === void 0 ? "a" : intDigits[intDigits.length / 2];
      return head + digits[0];
    }
    const ib2 = getIntegerPart(b, intDigits);
    const fb2 = b.slice(ib2.length);
    if (isSmallestInteger(ib2, digits, intDigits)) {
      return ib2 + midpoint("", fb2, digits, lookup);
    }
    if (ib2 < b) {
      return ib2;
    }
    const res = decrementInteger(ib2, digits, lookup, intDigits);
    if (res == null) {
      throw new Error("cannot decrement any more");
    }
    return res;
  }
  if (b == null) {
    const ia2 = getIntegerPart(a, intDigits);
    const fa2 = a.slice(ia2.length);
    const i2 = incrementInteger(ia2, digits, lookup, intDigits);
    return i2 == null ? ia2 + midpoint(fa2, null, digits, lookup) : i2;
  }
  const ia = getIntegerPart(a, intDigits);
  const fa = a.slice(ia.length);
  const ib = getIntegerPart(b, intDigits);
  const fb = b.slice(ib.length);
  if (ia === ib) {
    return ia + midpoint(fa, fb, digits, lookup);
  }
  const i = incrementInteger(ia, digits, lookup, intDigits);
  if (i == null) {
    throw new Error("cannot increment any more");
  }
  if (i < b) {
    return i;
  }
  return ia + midpoint(fa, null, digits, lookup);
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db-ivm@0.1.18/node_modules/@tanstack/db-ivm/dist/esm/operators/topKArray.js
function indexedValue(value, index) {
  return [
    value,
    index
  ];
}
function getValue(indexedVal) {
  return indexedVal[0];
}
function getIndex(indexedVal) {
  return indexedVal[1];
}
function createKeyedComparator(comparator) {
  return ([aKey, aVal], [bKey, bVal]) => {
    const valueComparison = comparator(aVal, bVal);
    if (valueComparison !== 0) {
      return valueComparison;
    }
    return compareKeys(aKey, bKey);
  };
}
var TopKArray = class {
  #sortedValues = [];
  #comparator;
  #topKStart;
  #topKEnd;
  constructor(offset, limit, comparator) {
    this.#topKStart = offset;
    this.#topKEnd = offset + limit;
    this.#comparator = comparator;
  }
  get size() {
    const offset = this.#topKStart;
    const limit = this.#topKEnd - this.#topKStart;
    const available = this.#sortedValues.length - offset;
    return Math.max(0, Math.min(limit, available));
  }
  /**
   * Moves the topK window
   */
  move({ offset, limit }) {
    const oldOffset = this.#topKStart;
    const oldLimit = this.#topKEnd - this.#topKStart;
    const oldRange = [
      this.#topKStart,
      this.#topKEnd === Infinity ? this.#topKStart + this.size : this.#topKEnd
    ];
    this.#topKStart = offset ?? oldOffset;
    this.#topKEnd = this.#topKStart + (limit ?? oldLimit);
    const newRange = [
      this.#topKStart,
      this.#topKEnd === Infinity ? Math.max(this.#topKStart + this.size, oldRange[1]) : this.#topKEnd
    ];
    const { onlyInA, onlyInB } = diffHalfOpen(oldRange, newRange);
    const moveIns = [];
    onlyInB.forEach((index) => {
      const value = this.#sortedValues[index];
      if (value) {
        moveIns.push(value);
      }
    });
    const moveOuts = [];
    onlyInA.forEach((index) => {
      const value = this.#sortedValues[index];
      if (value) {
        moveOuts.push(value);
      }
    });
    return {
      moveIns,
      moveOuts,
      changes: onlyInA.length + onlyInB.length > 0
    };
  }
  insert(value) {
    const result = {
      moveIn: null,
      moveOut: null
    };
    const index = this.#findIndex(value);
    const indexBefore = index === 0 ? null : getIndex(this.#sortedValues[index - 1]);
    const indexAfter = index === this.#sortedValues.length ? null : getIndex(this.#sortedValues[index]);
    const fractionalIndex = generateKeyBetween(indexBefore, indexAfter);
    const val = indexedValue(value, fractionalIndex);
    this.#sortedValues.splice(index, 0, val);
    if (index < this.#topKEnd) {
      const moveInIndex = Math.max(index, this.#topKStart);
      if (moveInIndex < this.#sortedValues.length) {
        result.moveIn = this.#sortedValues[moveInIndex];
        if (this.#topKEnd < this.#sortedValues.length) {
          result.moveOut = this.#sortedValues[this.#topKEnd];
        }
      }
    }
    return result;
  }
  /**
   * Deletes a value that may or may not be in the topK.
   * IMPORTANT: this assumes that the value is present in the collection
   *            if it's not the case it will remove the element
   *            that is on the position where the provided `value` would be.
   */
  delete(value) {
    const result = {
      moveIn: null,
      moveOut: null
    };
    const index = this.#findIndex(value);
    const [removedElem] = this.#sortedValues.splice(index, 1);
    if (index < this.#topKEnd) {
      result.moveOut = removedElem;
      if (index < this.#topKStart) {
        const moveOutIndex = this.#topKStart - 1;
        if (moveOutIndex < this.#sortedValues.length) {
          result.moveOut = this.#sortedValues[moveOutIndex];
        } else {
          result.moveOut = null;
        }
      }
      const moveInIndex = this.#topKEnd - 1;
      if (moveInIndex < this.#sortedValues.length) {
        result.moveIn = this.#sortedValues[moveInIndex];
      }
    }
    return result;
  }
  // TODO: see if there is a way to refactor the code for insert and delete in the topK above
  //       because they are very similar, one is shifting the topK window to the left and the other is shifting it to the right
  //       so i have the feeling there is a common pattern here and we can implement both cases using that pattern
  #findIndex(value) {
    return binarySearch(this.#sortedValues, indexedValue(value, ``), (a, b) => this.#comparator(getValue(a), getValue(b)));
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db-ivm@0.1.18/node_modules/@tanstack/db-ivm/dist/esm/operators/topKState.js
var TopKState = class {
  #multiplicities = /* @__PURE__ */ new Map();
  #topK;
  constructor(topK2) {
    this.#topK = topK2;
  }
  get size() {
    return this.#topK.size;
  }
  get isEmpty() {
    return this.#multiplicities.size === 0 && this.#topK.size === 0;
  }
  /**
   * Process an element update (insert or delete based on multiplicity change).
   * Returns the changes to the topK window.
   */
  processElement(key, value, multiplicity) {
    const { oldMultiplicity, newMultiplicity } = this.#updateMultiplicity(key, multiplicity);
    if (oldMultiplicity <= 0 && newMultiplicity > 0) {
      return this.#topK.insert([
        key,
        value
      ]);
    } else if (oldMultiplicity > 0 && newMultiplicity <= 0) {
      return this.#topK.delete([
        key,
        value
      ]);
    }
    return {
      moveIn: null,
      moveOut: null
    };
  }
  /**
   * Move the topK window. Only works with TopKArray implementation.
   */
  move(options) {
    if (!(this.#topK instanceof TopKArray)) {
      throw new Error(`Cannot move B+-tree implementation of TopK with fractional index`);
    }
    return this.#topK.move(options);
  }
  #updateMultiplicity(key, multiplicity) {
    if (multiplicity === 0) {
      const current = this.#multiplicities.get(key) ?? 0;
      return {
        oldMultiplicity: current,
        newMultiplicity: current
      };
    }
    const oldMultiplicity = this.#multiplicities.get(key) ?? 0;
    const newMultiplicity = oldMultiplicity + multiplicity;
    if (newMultiplicity === 0) {
      this.#multiplicities.delete(key);
    } else {
      this.#multiplicities.set(key, newMultiplicity);
    }
    return {
      oldMultiplicity,
      newMultiplicity
    };
  }
};
function handleMoveIn(moveIn, result) {
  if (moveIn) {
    const [[key, value], index] = moveIn;
    result.push([
      [
        key,
        [
          value,
          index
        ]
      ],
      1
    ]);
  }
}
function handleMoveOut(moveOut, result) {
  if (moveOut) {
    const [[key, value], index] = moveOut;
    result.push([
      [
        key,
        [
          value,
          index
        ]
      ],
      -1
    ]);
  }
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db-ivm@0.1.18/node_modules/@tanstack/db-ivm/dist/esm/operators/groupedTopKWithFractionalIndex.js
var GroupedTopKWithFractionalIndexOperator = class extends UnaryOperator {
  #groupStates = /* @__PURE__ */ new Map();
  #groupKeyFn;
  #comparator;
  #offset;
  #limit;
  constructor(id, inputA, output2, comparator, options) {
    super(id, inputA, output2);
    this.#groupKeyFn = options.groupKeyFn;
    this.#limit = options.limit ?? Infinity;
    this.#offset = options.offset ?? 0;
    this.#comparator = createKeyedComparator(comparator);
    options.setSizeCallback?.(() => this.#getTotalSize());
    options.setWindowFn?.(this.#moveTopK.bind(this));
  }
  /**
   * Creates a new TopK data structure for a group.
   * Can be overridden in subclasses to use different implementations (e.g., B+ tree).
   */
  createTopK(offset, limit, comparator) {
    return new TopKArray(offset, limit, comparator);
  }
  #getTotalSize() {
    let size = 0;
    for (const state of this.#groupStates.values()) {
      size += state.size;
    }
    return size;
  }
  #getOrCreateGroupState(groupKey) {
    let state = this.#groupStates.get(groupKey);
    if (!state) {
      const topK2 = this.createTopK(this.#offset, this.#limit, this.#comparator);
      state = new TopKState(topK2);
      this.#groupStates.set(groupKey, state);
    }
    return state;
  }
  #cleanupGroupIfEmpty(groupKey, state) {
    if (state.isEmpty) {
      this.#groupStates.delete(groupKey);
    }
  }
  /**
   * Moves the topK window for all groups based on the provided offset and limit.
   * Any changes to the topK are sent to the output.
   */
  #moveTopK({ offset, limit }) {
    if (offset !== void 0) {
      this.#offset = offset;
    }
    if (limit !== void 0) {
      this.#limit = limit;
    }
    const result = [];
    let hasChanges = false;
    for (const state of this.#groupStates.values()) {
      const diff = state.move({
        offset: this.#offset,
        limit: this.#limit
      });
      diff.moveIns.forEach((moveIn) => handleMoveIn(moveIn, result));
      diff.moveOuts.forEach((moveOut) => handleMoveOut(moveOut, result));
      if (diff.changes) {
        hasChanges = true;
      }
    }
    if (hasChanges) {
      this.output.sendData(new MultiSet(result));
    }
  }
  run() {
    const result = [];
    for (const message of this.inputMessages()) {
      for (const [item, multiplicity] of message.getInner()) {
        const [key, value] = item;
        this.#processElement(key, value, multiplicity, result);
      }
    }
    if (result.length > 0) {
      this.output.sendData(new MultiSet(result));
    }
  }
  #processElement(key, value, multiplicity, result) {
    const groupKey = this.#groupKeyFn(key, value);
    const state = this.#getOrCreateGroupState(groupKey);
    const changes = state.processElement(key, value, multiplicity);
    handleMoveIn(changes.moveIn, result);
    handleMoveOut(changes.moveOut, result);
    this.#cleanupGroupIfEmpty(groupKey, state);
  }
};
function groupedTopKWithFractionalIndex(comparator, options) {
  return (stream) => {
    const output2 = new StreamBuilder(stream.graph, new DifferenceStreamWriter());
    const operator = new GroupedTopKWithFractionalIndexOperator(stream.graph.getNextOperatorId(), stream.connectReader(), output2.writer, comparator, options);
    stream.graph.addOperator(operator);
    return output2;
  };
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db-ivm@0.1.18/node_modules/@tanstack/db-ivm/dist/esm/operators/join.js
var JoinOperator = class extends BinaryOperator {
  #indexA = new Index();
  #indexB = new Index();
  #mode;
  constructor(id, inputA, inputB, output2, mode2 = `inner`) {
    super(id, inputA, inputB, output2);
    this.#mode = mode2;
  }
  run() {
    const deltaA = Index.fromMultiSets(this.inputAMessages());
    const deltaB = Index.fromMultiSets(this.inputBMessages());
    if (deltaA.size === 0 && deltaB.size === 0) return;
    const results = new MultiSet();
    if (this.#mode !== `anti`) {
      this.emitInnerResults(deltaA, deltaB, results);
    }
    if (this.#mode === `left` || this.#mode === `full` || this.#mode === `anti`) {
      this.emitLeftOuterResults(deltaA, deltaB, results);
    }
    if (this.#mode === `right` || this.#mode === `full`) {
      this.emitRightOuterResults(deltaA, deltaB, results);
    }
    this.#indexA.append(deltaA);
    this.#indexB.append(deltaB);
    if (results.getInner().length > 0) {
      this.output.sendData(results);
    }
  }
  emitInnerResults(deltaA, deltaB, results) {
    if (deltaA.size > 0) results.extend(deltaA.join(this.#indexB));
    if (deltaB.size > 0) results.extend(this.#indexA.join(deltaB));
    if (deltaA.size > 0 && deltaB.size > 0) results.extend(deltaA.join(deltaB));
  }
  emitLeftOuterResults(deltaA, deltaB, results) {
    if (deltaA.size > 0) {
      for (const [key, valueIterator] of deltaA.entriesIterators()) {
        const currentMultiplicityB = this.#indexB.getConsolidatedMultiplicity(key);
        const deltaMultiplicityB = deltaB.getConsolidatedMultiplicity(key);
        const finalMultiplicityB = currentMultiplicityB + deltaMultiplicityB;
        if (finalMultiplicityB === 0) {
          for (const [value, multiplicity] of valueIterator) {
            if (multiplicity !== 0) {
              results.add([
                key,
                [
                  value,
                  null
                ]
              ], multiplicity);
            }
          }
        }
      }
    }
    if (deltaB.size > 0) {
      for (const key of deltaB.getPresenceKeys()) {
        const before = this.#indexB.getConsolidatedMultiplicity(key);
        const deltaMult = deltaB.getConsolidatedMultiplicity(key);
        if (deltaMult === 0) continue;
        const after = before + deltaMult;
        if (before === 0 === (after === 0)) continue;
        const transitioningToMatched = before === 0;
        for (const [value, multiplicity] of this.#indexA.getIterator(key)) {
          if (multiplicity !== 0) {
            results.add([
              key,
              [
                value,
                null
              ]
            ], transitioningToMatched ? -multiplicity : +multiplicity);
          }
        }
      }
    }
  }
  emitRightOuterResults(deltaA, deltaB, results) {
    if (deltaB.size > 0) {
      for (const [key, valueIterator] of deltaB.entriesIterators()) {
        const currentMultiplicityA = this.#indexA.getConsolidatedMultiplicity(key);
        const deltaMultiplicityA = deltaA.getConsolidatedMultiplicity(key);
        const finalMultiplicityA = currentMultiplicityA + deltaMultiplicityA;
        if (finalMultiplicityA === 0) {
          for (const [value, multiplicity] of valueIterator) {
            if (multiplicity !== 0) {
              results.add([
                key,
                [
                  null,
                  value
                ]
              ], multiplicity);
            }
          }
        }
      }
    }
    if (deltaA.size > 0) {
      for (const key of deltaA.getPresenceKeys()) {
        const before = this.#indexA.getConsolidatedMultiplicity(key);
        const deltaMult = deltaA.getConsolidatedMultiplicity(key);
        if (deltaMult === 0) continue;
        const after = before + deltaMult;
        if (before === 0 === (after === 0)) continue;
        const transitioningToMatched = before === 0;
        for (const [value, multiplicity] of this.#indexB.getIterator(key)) {
          if (multiplicity !== 0) {
            results.add([
              key,
              [
                null,
                value
              ]
            ], transitioningToMatched ? -multiplicity : +multiplicity);
          }
        }
      }
    }
  }
};
function join(other, type = `inner`) {
  return (stream) => {
    if (stream.graph !== other.graph) {
      throw new Error(`Cannot join streams from different graphs`);
    }
    const output2 = new StreamBuilder(stream.graph, new DifferenceStreamWriter());
    const operator = new JoinOperator(stream.graph.getNextOperatorId(), stream.connectReader(), other.connectReader(), output2.writer, type);
    stream.graph.addOperator(operator);
    return output2;
  };
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db-ivm@0.1.18/node_modules/@tanstack/db-ivm/dist/esm/operators/map.js
var MapOperator = class extends LinearUnaryOperator {
  #f;
  constructor(id, inputA, output2, f) {
    super(id, inputA, output2);
    this.#f = f;
  }
  inner(collection) {
    return collection.map(this.#f);
  }
};
function map(f) {
  return (stream) => {
    const output2 = new StreamBuilder(stream.graph, new DifferenceStreamWriter());
    const operator = new MapOperator(stream.graph.getNextOperatorId(), stream.connectReader(), output2.writer, f);
    stream.graph.addOperator(operator);
    return output2;
  };
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db-ivm@0.1.18/node_modules/@tanstack/db-ivm/dist/esm/operators/output.js
var OutputOperator = class extends UnaryOperator {
  #fn;
  constructor(id, inputA, outputWriter, fn) {
    super(id, inputA, outputWriter);
    this.#fn = fn;
  }
  run() {
    for (const message of this.inputMessages()) {
      this.#fn(message);
      this.output.sendData(message);
    }
  }
};
function output(fn) {
  return (stream) => {
    const outputStream = new StreamBuilder(stream.graph, new DifferenceStreamWriter());
    const operator = new OutputOperator(stream.graph.getNextOperatorId(), stream.connectReader(), outputStream.writer, fn);
    stream.graph.addOperator(operator);
    return outputStream;
  };
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db-ivm@0.1.18/node_modules/@tanstack/db-ivm/dist/esm/operators/tap.js
var TapOperator = class extends LinearUnaryOperator {
  #f;
  constructor(id, inputA, output2, f) {
    super(id, inputA, output2);
    this.#f = f;
  }
  inner(collection) {
    this.#f(collection);
    return collection;
  }
};
function tap(f) {
  return (stream) => {
    const output2 = new StreamBuilder(stream.graph, new DifferenceStreamWriter());
    const operator = new TapOperator(stream.graph.getNextOperatorId(), stream.connectReader(), output2.writer, f);
    stream.graph.addOperator(operator);
    return output2;
  };
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db-ivm@0.1.18/node_modules/@tanstack/db-ivm/dist/esm/operators/topKWithFractionalIndex.js
var TopKWithFractionalIndexOperator = class extends UnaryOperator {
  #state;
  constructor(id, inputA, output2, comparator, options) {
    super(id, inputA, output2);
    const limit = options.limit ?? Infinity;
    const offset = options.offset ?? 0;
    const topK2 = this.createTopK(offset, limit, createKeyedComparator(comparator));
    this.#state = new TopKState(topK2);
    options.setSizeCallback?.(() => this.#state.size);
    options.setWindowFn?.(this.moveTopK.bind(this));
  }
  createTopK(offset, limit, comparator) {
    return new TopKArray(offset, limit, comparator);
  }
  /**
   * Moves the topK window based on the provided offset and limit.
   * Any changes to the topK are sent to the output.
   */
  moveTopK({ offset, limit }) {
    const result = [];
    const diff = this.#state.move({
      offset,
      limit
    });
    diff.moveIns.forEach((moveIn) => handleMoveIn(moveIn, result));
    diff.moveOuts.forEach((moveOut) => handleMoveOut(moveOut, result));
    if (diff.changes) {
      this.output.sendData(new MultiSet(result));
    }
  }
  run() {
    const result = [];
    for (const message of this.inputMessages()) {
      for (const [item, multiplicity] of message.getInner()) {
        const [key, value] = item;
        this.processElement(key, value, multiplicity, result);
      }
    }
    if (result.length > 0) {
      this.output.sendData(new MultiSet(result));
    }
  }
  processElement(key, value, multiplicity, result) {
    const changes = this.#state.processElement(key, value, multiplicity);
    handleMoveIn(changes.moveIn, result);
    handleMoveOut(changes.moveOut, result);
  }
};
function topKWithFractionalIndex(comparator, options) {
  const opts = options || {};
  return (stream) => {
    const output2 = new StreamBuilder(stream.graph, new DifferenceStreamWriter());
    const operator = new TopKWithFractionalIndexOperator(stream.graph.getNextOperatorId(), stream.connectReader(), output2.writer, comparator, opts);
    stream.graph.addOperator(operator);
    return output2;
  };
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db-ivm@0.1.18/node_modules/@tanstack/db-ivm/dist/esm/operators/groupBy.js
function isPipedAggregateFunction(aggregate) {
  return `pipe` in aggregate;
}
function groupBy(keyExtractor, aggregates = {}) {
  const basicAggregates = Object.fromEntries(Object.entries(aggregates).filter(([_, aggregate]) => !isPipedAggregateFunction(aggregate)));
  Object.fromEntries(Object.entries(aggregates).filter(([_, aggregate]) => isPipedAggregateFunction(aggregate)));
  return (stream) => {
    const KEY_SENTINEL = `__original_key__`;
    const withKeysAndValues = stream.pipe(map((data) => {
      const key = keyExtractor(data);
      const keyString = serializeValue(key);
      const values = {};
      values[KEY_SENTINEL] = key;
      for (const [name, aggregate] of Object.entries(basicAggregates)) {
        values[name] = aggregate.preMap(data);
      }
      return [
        keyString,
        values
      ];
    }));
    const reduced = withKeysAndValues.pipe(reduce((values) => {
      let totalMultiplicity = 0;
      for (const [_, multiplicity] of values) {
        totalMultiplicity += multiplicity;
      }
      if (totalMultiplicity <= 0) {
        return [];
      }
      const result = {};
      const originalKey = values[0]?.[0]?.[KEY_SENTINEL];
      result[KEY_SENTINEL] = originalKey;
      for (const [name, aggregate] of Object.entries(basicAggregates)) {
        const preValues = values.map(([v, m]) => [
          v[name],
          m
        ]);
        result[name] = aggregate.reduce(preValues);
      }
      return [
        [
          result,
          1
        ]
      ];
    }));
    return reduced.pipe(map(([keyString, values]) => {
      const key = values[KEY_SENTINEL];
      const result = {};
      Object.assign(result, key);
      for (const [name, aggregate] of Object.entries(basicAggregates)) {
        if (aggregate.postMap) {
          result[name] = aggregate.postMap(values[name]);
        } else {
          result[name] = values[name];
        }
      }
      return [
        keyString,
        result
      ];
    }));
  };
}
function sum(valueExtractor = (v) => v) {
  return {
    preMap: (data) => valueExtractor(data),
    reduce: (values) => {
      let total = 0;
      for (const [value, multiplicity] of values) {
        total += value * multiplicity;
      }
      return total;
    }
  };
}
function count(valueExtractor = (v) => v) {
  return {
    // Count only not-null values (the `== null` comparison gives true for both null and undefined)
    preMap: (data) => valueExtractor(data) == null ? 0 : 1,
    reduce: (values) => {
      let totalCount = 0;
      for (const [nullMultiplier, multiplicity] of values) {
        totalCount += nullMultiplier * multiplicity;
      }
      return totalCount;
    }
  };
}
function avg(valueExtractor = (v) => v) {
  return {
    preMap: (data) => ({
      sum: valueExtractor(data),
      count: 0
    }),
    reduce: (values) => {
      let totalSum = 0;
      let totalCount = 0;
      for (const [value, multiplicity] of values) {
        totalSum += value.sum * multiplicity;
        totalCount += multiplicity;
      }
      return {
        sum: totalSum,
        count: totalCount
      };
    },
    postMap: (result) => {
      return result.sum / result.count;
    }
  };
}
function min(valueExtractor) {
  const extractor = valueExtractor ?? ((v) => v);
  return {
    preMap: (data) => extractor(data),
    reduce: (values) => {
      let minValue2;
      for (const [value, _multiplicity] of values) {
        if (!minValue2 || value && value < minValue2) {
          minValue2 = value;
        }
      }
      return minValue2;
    }
  };
}
function max(valueExtractor) {
  const extractor = valueExtractor ?? ((v) => v);
  return {
    preMap: (data) => extractor(data),
    reduce: (values) => {
      let maxValue2;
      for (const [value, _multiplicity] of values) {
        if (!maxValue2 || value && value > maxValue2) {
          maxValue2 = value;
        }
      }
      return maxValue2;
    }
  };
}
function median(valueExtractor = (v) => v) {
  return {
    preMap: (data) => [
      valueExtractor(data)
    ],
    reduce: (values) => {
      const allValues = [];
      for (const [valueArray, multiplicity] of values) {
        for (const value of valueArray) {
          for (let i = 0; i < multiplicity; i++) {
            allValues.push(value);
          }
        }
      }
      if (allValues.length === 0) {
        return [];
      }
      allValues.sort((a, b) => a - b);
      return allValues;
    },
    postMap: (result) => {
      if (result.length === 0) return 0;
      const mid = Math.floor(result.length / 2);
      if (result.length % 2 === 0) {
        return (result[mid - 1] + result[mid]) / 2;
      }
      return result[mid];
    }
  };
}
function mode(valueExtractor = (v) => v) {
  return {
    preMap: (data) => {
      const value = valueExtractor(data);
      const frequencyMap = /* @__PURE__ */ new Map();
      frequencyMap.set(value, 1);
      return frequencyMap;
    },
    reduce: (values) => {
      const combinedMap = /* @__PURE__ */ new Map();
      for (const [frequencyMap, multiplicity] of values) {
        for (const [value, frequencyCount] of frequencyMap.entries()) {
          const currentCount = combinedMap.get(value) || 0;
          combinedMap.set(value, currentCount + frequencyCount * multiplicity);
        }
      }
      return combinedMap;
    },
    postMap: (result) => {
      if (result.size === 0) return 0;
      let modeValue = 0;
      let maxFrequency = 0;
      for (const [value, frequency] of result.entries()) {
        if (frequency > maxFrequency) {
          maxFrequency = frequency;
          modeValue = value;
        }
      }
      return modeValue;
    }
  };
}
var groupByOperators = {
  sum,
  count,
  avg,
  min,
  max,
  median,
  mode
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db-ivm@0.1.18/node_modules/@tanstack/db-ivm/dist/esm/operators/groupedOrderBy.js
function groupedOrderByWithFractionalIndex(valueExtractor, options) {
  const limit = options.limit ?? Infinity;
  const offset = options.offset ?? 0;
  const setSizeCallback = options.setSizeCallback;
  const setWindowFn = options.setWindowFn;
  const groupKeyFn = options.groupKeyFn;
  const comparator = options.comparator ?? ((a, b) => {
    if (a === b) return 0;
    if (a < b) return -1;
    return 1;
  });
  return (stream) => {
    return stream.pipe(groupedTopKWithFractionalIndex((a, b) => comparator(valueExtractor(a), valueExtractor(b)), {
      limit,
      offset,
      setSizeCallback,
      setWindowFn,
      groupKeyFn
    }), consolidate());
  };
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db-ivm@0.1.18/node_modules/@tanstack/db-ivm/dist/esm/operators/orderBy.js
function orderByWithFractionalIndexBase(topKFunction, valueExtractor, options) {
  const limit = options?.limit ?? Infinity;
  const offset = options?.offset ?? 0;
  const setSizeCallback = options?.setSizeCallback;
  const setWindowFn = options?.setWindowFn;
  const comparator = options?.comparator ?? ((a, b) => {
    if (a === b) return 0;
    if (a < b) return -1;
    return 1;
  });
  return (stream) => {
    return stream.pipe(topKFunction((a, b) => comparator(valueExtractor(a), valueExtractor(b)), {
      limit,
      offset,
      setSizeCallback,
      setWindowFn
    }), consolidate());
  };
}
function orderByWithFractionalIndex(valueExtractor, options) {
  return orderByWithFractionalIndexBase(topKWithFractionalIndex, valueExtractor, options);
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/query/compiler/group-by.js
var VIRTUAL_SYNCED_KEY = `__virtual_synced__`;
var VIRTUAL_HAS_LOCAL_KEY = `__virtual_has_local__`;
var GROUP_KEY_REF_PREFIX = `__group_key_`;
function getRowVirtualMetadata(row) {
  let found = false;
  let allSynced = true;
  let hasLocal = false;
  for (const [alias, value] of Object.entries(row)) {
    if (alias === `$selected`) continue;
    if (value === null || typeof value !== `object`) continue;
    const asRecord = value;
    const hasSyncedProp = `$synced` in asRecord;
    const hasOriginProp = `$origin` in asRecord;
    if (!hasSyncedProp && !hasOriginProp) {
      continue;
    }
    found = true;
    if (asRecord.$synced === false) {
      allSynced = false;
    }
    if (asRecord.$origin === `local`) {
      hasLocal = true;
    }
  }
  return {
    synced: found ? allSynced : true,
    hasLocal
  };
}
var { sum: sum2, count: count3, avg: avg2, min: min2, max: max2 } = groupByOperators;
function validateAndCreateMapping(groupByClause, selectClause) {
  const selectToGroupByIndex = /* @__PURE__ */ new Map();
  const groupByExpressions = [
    ...groupByClause
  ];
  if (!selectClause) {
    return {
      selectToGroupByIndex,
      groupByExpressions
    };
  }
  for (const [alias, expr] of Object.entries(selectClause)) {
    if (expr.type === `agg` || containsAggregate(expr)) {
      continue;
    }
    const groupIndex = groupByExpressions.findIndex((groupExpr) => expressionsEqual(expr, groupExpr));
    if (groupIndex === -1) {
      throw new NonAggregateExpressionNotInGroupByError(alias);
    }
    selectToGroupByIndex.set(alias, groupIndex);
  }
  return {
    selectToGroupByIndex,
    groupByExpressions
  };
}
function processGroupBy(pipeline, groupByClause, havingClauses, selectClause, fnHavingClauses, aggregateCollectionId, mainSource) {
  const virtualAggregates = {
    [VIRTUAL_SYNCED_KEY]: {
      preMap: ([, row]) => getRowVirtualMetadata(row).synced,
      reduce: (values) => {
        for (const [isSynced, multiplicity] of values) {
          if (!isSynced && multiplicity > 0) {
            return false;
          }
        }
        return true;
      }
    },
    [VIRTUAL_HAS_LOCAL_KEY]: {
      preMap: ([, row]) => getRowVirtualMetadata(row).hasLocal,
      reduce: (values) => {
        for (const [isLocal, multiplicity] of values) {
          if (isLocal && multiplicity > 0) {
            return true;
          }
        }
        return false;
      }
    }
  };
  if (groupByClause.length === 0) {
    const aggregates2 = virtualAggregates;
    const wrappedAggExprs2 = {};
    const aggCounter2 = {
      value: 0
    };
    if (selectClause) {
      for (const [alias, expr] of Object.entries(selectClause)) {
        if (expr.type === `agg`) {
          aggregates2[alias] = getAggregateFunction(expr);
        } else if (containsAggregate(expr)) {
          const { transformed, extracted } = extractAndReplaceAggregates(expr, aggCounter2);
          for (const [syntheticAlias, aggExpr] of Object.entries(extracted)) {
            aggregates2[syntheticAlias] = getAggregateFunction(aggExpr);
          }
          wrappedAggExprs2[alias] = compileGroupedSelectValue(transformed);
        }
      }
    }
    const keyExtractor2 = mainSource ? ([, row]) => ({
      __singleGroup: true,
      __correlationKey: row?.[mainSource]?.__correlationKey
    }) : () => ({
      __singleGroup: true
    });
    pipeline = pipeline.pipe(groupBy(keyExtractor2, aggregates2));
    pipeline = pipeline.pipe(map(([, aggregatedRow]) => {
      const selectResults = aggregatedRow.$selected || {};
      const finalResults = {
        ...selectResults
      };
      if (selectClause) {
        for (const [alias, expr] of Object.entries(selectClause)) {
          if (expr.type === `agg`) {
            finalResults[alias] = aggregatedRow[alias];
          }
        }
        evaluateWrappedAggregates(finalResults, aggregatedRow, wrappedAggExprs2);
      }
      const correlationKey = mainSource ? aggregatedRow.__correlationKey : void 0;
      const resultKey = correlationKey !== void 0 ? `single_group_${serializeValue(correlationKey)}` : `single_group`;
      const resultRow = {
        ...aggregatedRow,
        $selected: finalResults
      };
      const groupSynced = aggregatedRow[VIRTUAL_SYNCED_KEY];
      const groupHasLocal = aggregatedRow[VIRTUAL_HAS_LOCAL_KEY];
      resultRow.$synced = groupSynced ?? true;
      resultRow.$origin = groupHasLocal ? `local` : `remote`;
      resultRow.$key = resultKey;
      resultRow.$collectionId = aggregateCollectionId ?? resultRow.$collectionId;
      if (mainSource && correlationKey !== void 0) {
        resultRow[mainSource] = {
          __correlationKey: correlationKey
        };
      }
      return [
        resultKey,
        resultRow
      ];
    }));
    if (havingClauses && havingClauses.length > 0) {
      for (const havingClause of havingClauses) {
        const havingExpression = getHavingExpression(havingClause);
        const transformedHavingClause = replaceAggregatesByRefs(havingExpression, selectClause || {}, `$selected`);
        const compiledHaving = compileExpression(transformedHavingClause);
        pipeline = pipeline.pipe(filter(([, row]) => {
          const namespacedRow = {
            $selected: row.$selected
          };
          return toBooleanPredicate(compiledHaving(namespacedRow));
        }));
      }
    }
    if (fnHavingClauses && fnHavingClauses.length > 0) {
      for (const fnHaving of fnHavingClauses) {
        pipeline = pipeline.pipe(filter(([, row]) => {
          const namespacedRow = {
            $selected: row.$selected
          };
          return toBooleanPredicate(fnHaving(namespacedRow));
        }));
      }
    }
    return pipeline;
  }
  const mapping = validateAndCreateMapping(groupByClause, selectClause);
  const compiledGroupByExpressions = groupByClause.map((e) => compileExpression(e));
  const keyExtractor = ([, row]) => {
    const namespacedRow = {
      ...row
    };
    delete namespacedRow.$selected;
    const key = {};
    for (let i = 0; i < groupByClause.length; i++) {
      const compiledExpr = compiledGroupByExpressions[i];
      const value = compiledExpr(namespacedRow);
      key[`__key_${i}`] = value;
    }
    if (mainSource) {
      key.__correlationKey = row?.[mainSource]?.__correlationKey;
    }
    return key;
  };
  const aggregates = virtualAggregates;
  const wrappedAggExprs = {};
  const aggCounter = {
    value: 0
  };
  if (selectClause) {
    for (const [alias, expr] of Object.entries(selectClause)) {
      if (expr.type === `agg`) {
        aggregates[alias] = getAggregateFunction(expr);
      } else if (containsAggregate(expr)) {
        const { transformed, extracted } = extractAndReplaceAggregates(expr, aggCounter);
        for (const [syntheticAlias, aggExpr] of Object.entries(extracted)) {
          aggregates[syntheticAlias] = getAggregateFunction(aggExpr);
        }
        wrappedAggExprs[alias] = compileGroupedSelectValue(replaceGroupByRefsInSelectValue(transformed, groupByClause));
      }
    }
  }
  pipeline = pipeline.pipe(groupBy(keyExtractor, aggregates));
  pipeline = pipeline.pipe(map(([, aggregatedRow]) => {
    const selectResults = aggregatedRow.$selected || {};
    const finalResults = {};
    if (selectClause) {
      for (const [alias, expr] of Object.entries(selectClause)) {
        if (expr.type === `agg`) {
          finalResults[alias] = aggregatedRow[alias];
        } else if (!wrappedAggExprs[alias]) {
          const groupIndex = mapping.selectToGroupByIndex.get(alias);
          if (groupIndex !== void 0) {
            finalResults[alias] = aggregatedRow[`__key_${groupIndex}`];
          } else {
            finalResults[alias] = selectResults[alias];
          }
        }
      }
      evaluateWrappedAggregates(finalResults, aggregatedRow, wrappedAggExprs, groupByClause.length);
    } else {
      for (let i = 0; i < groupByClause.length; i++) {
        finalResults[`__key_${i}`] = aggregatedRow[`__key_${i}`];
      }
    }
    const correlationKey = mainSource ? aggregatedRow.__correlationKey : void 0;
    const keyParts = [];
    for (let i = 0; i < groupByClause.length; i++) {
      keyParts.push(aggregatedRow[`__key_${i}`]);
    }
    if (correlationKey !== void 0) {
      keyParts.push(correlationKey);
    }
    const finalKey = keyParts.length === 1 ? keyParts[0] : serializeValue(keyParts);
    const resultRow = {
      ...aggregatedRow,
      $selected: finalResults
    };
    const groupSynced = aggregatedRow[VIRTUAL_SYNCED_KEY];
    const groupHasLocal = aggregatedRow[VIRTUAL_HAS_LOCAL_KEY];
    resultRow.$synced = groupSynced ?? true;
    resultRow.$origin = groupHasLocal ? `local` : `remote`;
    resultRow.$key = finalKey;
    resultRow.$collectionId = aggregateCollectionId ?? resultRow.$collectionId;
    if (mainSource && correlationKey !== void 0) {
      resultRow[mainSource] = {
        __correlationKey: correlationKey
      };
    }
    return [
      finalKey,
      resultRow
    ];
  }));
  if (havingClauses && havingClauses.length > 0) {
    for (const havingClause of havingClauses) {
      const havingExpression = getHavingExpression(havingClause);
      const transformedHavingClause = replaceAggregatesByRefs(havingExpression, selectClause || {});
      const compiledHaving = compileExpression(transformedHavingClause);
      pipeline = pipeline.pipe(filter(([, row]) => {
        const namespacedRow = {
          $selected: row.$selected
        };
        return compiledHaving(namespacedRow);
      }));
    }
  }
  if (fnHavingClauses && fnHavingClauses.length > 0) {
    for (const fnHaving of fnHavingClauses) {
      pipeline = pipeline.pipe(filter(([, row]) => {
        const namespacedRow = {
          $selected: row.$selected
        };
        return toBooleanPredicate(fnHaving(namespacedRow));
      }));
    }
  }
  return pipeline;
}
function expressionsEqual(expr1, expr2) {
  if (!expr1 || !expr2) return false;
  if (expr1.type !== expr2.type) return false;
  switch (expr1.type) {
    case `ref`:
      if (!expr1.path || !expr2.path) return false;
      if (expr1.path.length !== expr2.path.length) return false;
      return expr1.path.every((segment, i) => segment === expr2.path[i]);
    case `val`:
      return expr1.value === expr2.value;
    case `func`:
      return expr1.name === expr2.name && expr1.args?.length === expr2.args?.length && (expr1.args || []).every((arg, i) => expressionsEqual(arg, expr2.args[i]));
    case `agg`:
      return expr1.name === expr2.name && expr1.args?.length === expr2.args?.length && (expr1.args || []).every((arg, i) => expressionsEqual(arg, expr2.args[i]));
    default:
      return false;
  }
}
function getAggregateFunction(aggExpr) {
  const compiledExpr = compileExpression(aggExpr.args[0]);
  const valueExtractor = ([, namespacedRow]) => {
    const value = compiledExpr(namespacedRow);
    if (typeof value === `number`) {
      return value;
    }
    return value != null ? Number(value) : 0;
  };
  const valueExtractorForMinMax = ([, namespacedRow]) => {
    const value = compiledExpr(namespacedRow);
    if (typeof value === `number` || typeof value === `string` || typeof value === `bigint` || value instanceof Date) {
      return value;
    }
    return value != null ? Number(value) : 0;
  };
  const rawValueExtractor = ([, namespacedRow]) => {
    return compiledExpr(namespacedRow);
  };
  switch (aggExpr.name.toLowerCase()) {
    case `sum`:
      return sum2(valueExtractor);
    case `count`:
      return count3(rawValueExtractor);
    case `avg`:
      return avg2(valueExtractor);
    case `min`:
      return min2(valueExtractorForMinMax);
    case `max`:
      return max2(valueExtractorForMinMax);
    default:
      throw new UnsupportedAggregateFunctionError(aggExpr.name);
  }
}
function replaceAggregatesByRefs(havingExpr, selectClause, resultAlias = `$selected`) {
  switch (havingExpr.type) {
    case `agg`: {
      const aggExpr = havingExpr;
      for (const [alias, selectExpr] of Object.entries(selectClause)) {
        if (selectExpr.type === `agg` && aggregatesEqual(aggExpr, selectExpr)) {
          return new PropRef([
            resultAlias,
            alias
          ]);
        }
      }
      throw new AggregateFunctionNotInSelectError(aggExpr.name);
    }
    case `func`: {
      const funcExpr = havingExpr;
      const transformedArgs = funcExpr.args.map((arg) => replaceAggregatesByRefs(arg, selectClause));
      return new Func(funcExpr.name, transformedArgs);
    }
    case `ref`:
      return havingExpr;
    case `val`:
      return havingExpr;
    default:
      throw new UnknownHavingExpressionTypeError(havingExpr.type);
  }
}
function evaluateWrappedAggregates(finalResults, aggregatedRow, wrappedAggExprs, groupKeyCount = 0) {
  for (const key of Object.keys(aggregatedRow)) {
    if (key.startsWith(`__agg_`)) {
      finalResults[key] = aggregatedRow[key];
    }
  }
  for (let i = 0; i < groupKeyCount; i++) {
    finalResults[`${GROUP_KEY_REF_PREFIX}${i}`] = aggregatedRow[`__key_${i}`];
  }
  for (const [alias, evaluator] of Object.entries(wrappedAggExprs)) {
    finalResults[alias] = evaluator({
      $selected: finalResults
    });
  }
  for (const key of Object.keys(finalResults)) {
    if (key.startsWith(`__agg_`) || key.startsWith(GROUP_KEY_REF_PREFIX)) {
      delete finalResults[key];
    }
  }
}
function containsAggregate(expr) {
  if (isConditionalSelect(expr)) {
    const branchHasAggregate = expr.branches.some((branch) => containsAggregate(branch.condition) || containsAggregate(branch.value));
    return branchHasAggregate || expr.defaultValue !== void 0 && containsAggregate(expr.defaultValue);
  }
  if (isNestedSelectObject(expr)) {
    return Object.values(expr).some((value) => containsAggregate(value));
  }
  if (!isExpressionLike(expr)) {
    return false;
  }
  if (expr.type === `agg`) {
    return true;
  }
  if (expr.type === `func` && `args` in expr) {
    return expr.args.some((arg) => containsAggregate(arg));
  }
  return false;
}
function extractAndReplaceAggregates(expr, counter) {
  if (expr.type === `includesSubquery`) {
    return {
      transformed: expr,
      extracted: {}
    };
  }
  if (expr.type === `agg`) {
    const alias = `__agg_${counter.value++}`;
    return {
      transformed: new PropRef([
        `$selected`,
        alias
      ]),
      extracted: {
        [alias]: expr
      }
    };
  }
  if (expr.type === `func`) {
    const allExtracted = {};
    const newArgs = expr.args.map((arg) => {
      const result = extractAndReplaceAggregates(arg, counter);
      Object.assign(allExtracted, result.extracted);
      return result.transformed;
    });
    return {
      transformed: new Func(expr.name, newArgs),
      extracted: allExtracted
    };
  }
  if (isConditionalSelect(expr)) {
    const allExtracted = {};
    const branches = expr.branches.map((branch) => {
      const condition = extractAndReplaceAggregates(branch.condition, counter);
      const value = extractAndReplaceAggregates(branch.value, counter);
      Object.assign(allExtracted, condition.extracted, value.extracted);
      return {
        condition: condition.transformed,
        value: value.transformed
      };
    });
    const defaultValue = expr.defaultValue === void 0 ? void 0 : extractAndReplaceAggregates(expr.defaultValue, counter);
    if (defaultValue) {
      Object.assign(allExtracted, defaultValue.extracted);
    }
    return {
      transformed: new ConditionalSelect(branches, defaultValue?.transformed),
      extracted: allExtracted
    };
  }
  if (isNestedSelectObject(expr)) {
    const allExtracted = {};
    const transformed = {};
    for (const [key, value] of Object.entries(expr)) {
      const result = extractAndReplaceAggregates(value, counter);
      Object.assign(allExtracted, result.extracted);
      transformed[key] = result.transformed;
    }
    return {
      transformed,
      extracted: allExtracted
    };
  }
  return {
    transformed: expr,
    extracted: {}
  };
}
function replaceGroupByRefsInSelectValue(value, groupByClause) {
  if (isConditionalSelect(value)) {
    return new ConditionalSelect(value.branches.map((branch) => ({
      condition: replaceGroupByRefsInExpression(branch.condition, groupByClause),
      value: replaceGroupByRefsInSelectValue(branch.value, groupByClause)
    })), value.defaultValue === void 0 ? void 0 : replaceGroupByRefsInSelectValue(value.defaultValue, groupByClause));
  }
  if (isNestedSelectObject(value)) {
    const transformed = {};
    for (const [key, entry] of Object.entries(value)) {
      transformed[key] = replaceGroupByRefsInSelectValue(entry, groupByClause);
    }
    return transformed;
  }
  if (!isExpressionLike(value)) {
    return value;
  }
  if (value.type === `includesSubquery` || value.type === `agg`) {
    return value;
  }
  return replaceGroupByRefsInExpression(value, groupByClause);
}
function replaceGroupByRefsInExpression(expr, groupByClause) {
  if (expr.type === `ref`) {
    const groupIndex = groupByClause.findIndex((groupExpr) => expressionsEqual(expr, groupExpr));
    return groupIndex === -1 ? expr : new PropRef([
      `$selected`,
      `${GROUP_KEY_REF_PREFIX}${groupIndex}`
    ]);
  }
  if (expr.type === `func`) {
    return new Func(expr.name, expr.args.map((arg) => replaceGroupByRefsInExpression(arg, groupByClause)));
  }
  return expr;
}
function compileGroupedSelectValue(value) {
  if (isConditionalSelect(value)) {
    return compileGroupedConditionalSelect(value);
  }
  if (value.type === `includesSubquery`) {
    return () => null;
  }
  if (isNestedSelectObject(value)) {
    return compileGroupedSelectObject(value);
  }
  if (!isExpressionLike(value)) {
    return () => value;
  }
  return compileExpression(value);
}
function compileGroupedSelectObject(obj) {
  const entries = Object.entries(obj).map(([key, value]) => {
    if (key.startsWith(`__SPREAD_SENTINEL__`)) {
      const rest = key.slice(`__SPREAD_SENTINEL__`.length);
      const splitIndex = rest.lastIndexOf(`__`);
      const pathStr = splitIndex >= 0 ? rest.slice(0, splitIndex) : rest;
      const isRefExpr = typeof value === `object` && `type` in value && value.type === `ref`;
      const expression = isRefExpr ? value : new PropRef(pathStr.split(`.`));
      return {
        key,
        spread: true,
        value: compileExpression(expression)
      };
    }
    return {
      key,
      spread: false,
      value: compileGroupedSelectValue(value)
    };
  });
  return (row) => {
    const result = {};
    for (const entry of entries) {
      const value = entry.value(row);
      if (entry.spread) {
        if (value && typeof value === `object`) {
          Object.assign(result, value);
        }
      } else {
        result[entry.key] = value;
      }
    }
    return result;
  };
}
function compileGroupedConditionalSelect(conditional) {
  const branches = conditional.branches.map((branch) => ({
    condition: compileExpression(branch.condition),
    value: compileGroupedSelectValue(branch.value)
  }));
  const defaultValue = conditional.defaultValue === void 0 ? void 0 : compileGroupedSelectValue(conditional.defaultValue);
  return (row) => {
    for (const branch of branches) {
      if (isCaseWhenConditionTrue(branch.condition(row))) {
        return branch.value(row);
      }
    }
    return defaultValue !== void 0 ? defaultValue(row) : null;
  };
}
function isNestedSelectObject(value) {
  return value != null && typeof value === `object` && !Array.isArray(value) && !value.__refProxy && !isExpressionLike(value);
}
function isConditionalSelect(value) {
  return value instanceof ConditionalSelect || value != null && typeof value === `object` && value.type === `conditionalSelect`;
}
function aggregatesEqual(agg1, agg2) {
  return agg1.name === agg2.name && agg1.args.length === agg2.args.length && agg1.args.every((arg, i) => expressionsEqual(arg, agg2.args[i]));
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/query/compiler/order-by.js
function processOrderBy(rawQuery, pipeline, orderByClause, selectClause, collection, optimizableOrderByCollections, setWindowFn, limit, offset, groupKeyFn) {
  const compiledOrderBy = orderByClause.map((clause) => {
    const clauseWithoutAggregates = replaceAggregatesByRefs(clause.expression, selectClause, `$selected`);
    return {
      compiledExpression: compileExpression(clauseWithoutAggregates),
      compareOptions: buildCompareOptions(clause, collection)
    };
  });
  const valueExtractor = (row) => {
    const orderByContext = row;
    if (orderByClause.length > 1) {
      return compiledOrderBy.map((compiled) => compiled.compiledExpression(orderByContext));
    } else if (orderByClause.length === 1) {
      const compiled = compiledOrderBy[0];
      return compiled.compiledExpression(orderByContext);
    }
    return null;
  };
  const compare = (a, b) => {
    if (orderByClause.length > 1) {
      const arrayA = a;
      const arrayB = b;
      for (let i = 0; i < orderByClause.length; i++) {
        const clause = compiledOrderBy[i];
        const compareFn = makeComparator(clause.compareOptions);
        const result = compareFn(arrayA[i], arrayB[i]);
        if (result !== 0) {
          return result;
        }
      }
      return arrayA.length - arrayB.length;
    }
    if (orderByClause.length === 1) {
      const clause = compiledOrderBy[0];
      const compareFn = makeComparator(clause.compareOptions);
      return compareFn(a, b);
    }
    return defaultComparator(a, b);
  };
  let setSizeCallback;
  let orderByOptimizationInfo;
  if (limit && !groupKeyFn && rawQuery.from.type !== `unionFrom` && rawQuery.from.type !== `unionAll`) {
    let index;
    let followRefCollection;
    let firstColumnValueExtractor;
    let orderByAlias = rawQuery.from.alias;
    const firstClause = orderByClause[0];
    const firstOrderByExpression = firstClause.expression;
    if (firstOrderByExpression.type === `ref`) {
      const followRefResult = followRef(rawQuery, firstOrderByExpression, collection);
      if (followRefResult) {
        followRefCollection = followRefResult.collection;
        const fieldName = followRefResult.path[0];
        const compareOpts = buildCompareOptions(firstClause, followRefCollection);
        if (fieldName) {
          const firstColumnCompareFn = makeComparator(compareOpts);
          ensureIndexForField(fieldName, followRefResult.path, followRefCollection, compareOpts, firstColumnCompareFn);
        }
        firstColumnValueExtractor = compileExpression(new PropRef(followRefResult.path), true);
        index = findIndexForField(followRefCollection, followRefResult.path, compareOpts);
        if (!index?.supports(`gt`)) {
          index = void 0;
        }
        if (!index) {
          const collectionId = followRefCollection.id;
          const fieldPath = followRefResult.path.join(`.`);
          console.warn(`[TanStack DB]${collectionId ? ` [${collectionId}]` : ``} orderBy with limit requires an index on "${fieldPath}" for efficient lazy loading. Falling back to loading all data. Consider creating an index on the collection with collection.createIndex((row) => row.${fieldPath}) or enable auto-indexing with autoIndex: 'eager' and a defaultIndexType.`);
        }
        orderByAlias = firstOrderByExpression.path.length > 1 ? String(firstOrderByExpression.path[0]) : rawQuery.from.alias;
      }
    }
    if (!firstColumnValueExtractor) ;
    else {
      const allColumnsAreRefs = orderByClause.every((clause) => clause.expression.type === `ref`);
      const allColumnExtractors = allColumnsAreRefs ? orderByClause.map((clause) => {
        const refExpr = clause.expression;
        const followResult = followRef(rawQuery, refExpr, collection);
        if (followResult) {
          return compileExpression(new PropRef(followResult.path), true);
        }
        return compileExpression(clause.expression, true);
      }) : void 0;
      const comparator = (a, b) => {
        if (orderByClause.length === 1) {
          const extractedA = a ? firstColumnValueExtractor(a) : a;
          const extractedB = b ? firstColumnValueExtractor(b) : b;
          return compare(extractedA, extractedB);
        }
        if (allColumnExtractors) {
          const extractAll = (row) => {
            if (!row) return row;
            return allColumnExtractors.map((extractor) => extractor(row));
          };
          return compare(extractAll(a), extractAll(b));
        }
        return 0;
      };
      const rawRowValueExtractor = (row) => {
        if (orderByClause.length === 1) {
          return firstColumnValueExtractor(row);
        }
        if (allColumnExtractors) {
          return allColumnExtractors.map((extractor) => extractor(row));
        }
        return void 0;
      };
      orderByOptimizationInfo = {
        alias: orderByAlias,
        offset: offset ?? 0,
        limit,
        comparator,
        valueExtractorForRawRow: rawRowValueExtractor,
        firstColumnValueExtractor,
        index,
        orderBy: orderByClause
      };
      const targetCollectionId = followRefCollection?.id ?? collection.id;
      optimizableOrderByCollections[targetCollectionId] = orderByOptimizationInfo;
      if (index) {
        setSizeCallback = (getSize) => {
          optimizableOrderByCollections[targetCollectionId][`dataNeeded`] = () => {
            const size = getSize();
            return Math.max(0, orderByOptimizationInfo.limit - size);
          };
        };
      }
    }
  }
  if (groupKeyFn) {
    return pipeline.pipe(groupedOrderByWithFractionalIndex(valueExtractor, {
      limit,
      offset,
      comparator: compare,
      setSizeCallback,
      groupKeyFn,
      setWindowFn: (windowFn) => {
        setWindowFn((options) => {
          windowFn(options);
          if (orderByOptimizationInfo) {
            orderByOptimizationInfo.offset = options.offset ?? orderByOptimizationInfo.offset;
            orderByOptimizationInfo.limit = options.limit ?? orderByOptimizationInfo.limit;
          }
        });
      }
    }));
  }
  return pipeline.pipe(orderByWithFractionalIndex(valueExtractor, {
    limit,
    offset,
    comparator: compare,
    setSizeCallback,
    setWindowFn: (windowFn) => {
      setWindowFn(
        // We wrap the move function such that we update the orderByOptimizationInfo
        // because that is used by the `dataNeeded` callback to determine if we need to load more data
        (options) => {
          windowFn(options);
          if (orderByOptimizationInfo) {
            orderByOptimizationInfo.offset = options.offset ?? orderByOptimizationInfo.offset;
            orderByOptimizationInfo.limit = options.limit ?? orderByOptimizationInfo.limit;
          }
        }
      );
    }
  }));
}
function buildCompareOptions(clause, collection) {
  if (clause.compareOptions.stringSort !== void 0) {
    return clause.compareOptions;
  }
  return {
    ...collection.compareOptions,
    direction: clause.compareOptions.direction,
    nulls: clause.compareOptions.nulls
  };
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/collection/change-events.js
function currentStateAsChanges(collection, options = {}) {
  const collectFilteredResults = (filterFn) => {
    const result = [];
    for (const [key, value] of collection.entries()) {
      if (filterFn?.(value) ?? true) {
        result.push({
          type: `insert`,
          key,
          value
        });
      }
    }
    return result;
  };
  if (options.limit !== void 0 && !options.orderBy) {
    throw new Error(`limit cannot be used without orderBy`);
  }
  if (options.orderBy) {
    const whereFilter = options.where ? createFilterFunctionFromExpression(options.where) : void 0;
    const orderedKeys = getOrderedKeys(collection, options.orderBy, options.limit, whereFilter, options.optimizedOnly);
    if (orderedKeys === void 0) {
      return;
    }
    const result = [];
    for (const key of orderedKeys) {
      const value = collection.get(key);
      if (value !== void 0) {
        result.push({
          type: `insert`,
          key,
          value
        });
      }
    }
    return result;
  }
  if (!options.where) {
    return collectFilteredResults();
  }
  try {
    const expression = options.where;
    const optimizationResult = optimizeExpressionWithIndexes(expression, collection);
    if (optimizationResult.canOptimize) {
      const filterFn = optimizationResult.isExact ? void 0 : createFilterFunctionFromExpression(expression);
      const result = [];
      for (const key of optimizationResult.matchingKeys) {
        const value = collection.get(key);
        if (value !== void 0 && (filterFn?.(value) ?? true)) {
          result.push({
            type: `insert`,
            key,
            value
          });
        }
      }
      return result;
    } else {
      if (options.optimizedOnly) {
        return;
      }
      const filterFn = createFilterFunctionFromExpression(expression);
      return collectFilteredResults(filterFn);
    }
  } catch (error) {
    console.warn(`${collection.id ? `[${collection.id}] ` : ``}Error processing where clause, falling back to full scan:`, error);
    const filterFn = createFilterFunctionFromExpression(options.where);
    if (options.optimizedOnly) {
      return;
    }
    return collectFilteredResults(filterFn);
  }
}
function createFilterFunctionFromExpression(expression) {
  const evaluator = compileSingleRowExpression(expression);
  return (item) => {
    try {
      const result = evaluator(item);
      return toBooleanPredicate(result);
    } catch {
      return false;
    }
  };
}
function createFilteredCallback(originalCallback, options) {
  const filterFn = createFilterFunctionFromExpression(options.whereExpression);
  return (changes) => {
    const filteredChanges = [];
    for (const change of changes) {
      if (change.type === `insert`) {
        if (filterFn(change.value)) {
          filteredChanges.push(change);
        }
      } else if (change.type === `update`) {
        const newValueMatches = filterFn(change.value);
        const oldValueMatches = change.previousValue ? filterFn(change.previousValue) : false;
        if (newValueMatches && oldValueMatches) {
          filteredChanges.push(change);
        } else if (newValueMatches && !oldValueMatches) {
          filteredChanges.push({
            ...change,
            type: `insert`
          });
        } else if (!newValueMatches && oldValueMatches) {
          filteredChanges.push({
            ...change,
            type: `delete`,
            value: change.previousValue
          });
        }
      } else {
        if (filterFn(change.value)) {
          filteredChanges.push(change);
        }
      }
    }
    if (filteredChanges.length > 0 || changes.length === 0) {
      originalCallback(filteredChanges);
    }
  };
}
function getOrderedKeys(collection, orderBy2, limit, whereFilter, optimizedOnly) {
  if (orderBy2.length === 1) {
    const clause = orderBy2[0];
    const orderByExpression = clause.expression;
    if (orderByExpression.type === `ref`) {
      const propRef = orderByExpression;
      const fieldPath = propRef.path;
      const compareOpts = buildCompareOptions(clause, collection);
      ensureIndexForField(fieldPath[0], fieldPath, collection, compareOpts);
      const index = findIndexForField(collection, fieldPath, compareOpts);
      if (index && index.supports(`gt`)) {
        const filterFn = (key) => {
          const value = collection.get(key);
          if (value === void 0) {
            return false;
          }
          return whereFilter?.(value) ?? true;
        };
        return index.takeFromStart(limit ?? index.keyCount, filterFn);
      }
    }
  }
  if (optimizedOnly) {
    return;
  }
  const allItems = [];
  for (const [key, value] of collection.entries()) {
    if (whereFilter?.(value) ?? true) {
      allItems.push({
        key,
        value
      });
    }
  }
  const compare = (a, b) => {
    for (const clause of orderBy2) {
      const compareFn = makeComparator(clause.compareOptions);
      const aValue = extractValueFromItem(a.value, clause.expression);
      const bValue = extractValueFromItem(b.value, clause.expression);
      const result = compareFn(aValue, bValue);
      if (result !== 0) {
        return result;
      }
    }
    return 0;
  };
  allItems.sort(compare);
  const sortedKeys = allItems.map((item) => item.key);
  if (limit !== void 0) {
    return sortedKeys.slice(0, limit);
  }
  return sortedKeys;
}
function extractValueFromItem(item, expression) {
  if (expression.type === `ref`) {
    const propRef = expression;
    let value = item;
    for (const pathPart of propRef.path) {
      value = value?.[pathPart];
    }
    return value;
  } else if (expression.type === `val`) {
    return expression.value;
  } else {
    const evaluator = compileSingleRowExpression(expression);
    return evaluator(item);
  }
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/SortedMap.js
var SortedMap = class {
  /**
   * Creates a new SortedMap instance
   *
   * @param comparator - Optional function to compare values for sorting.
   *                     If not provided, entries are sorted by key only.
   */
  constructor(comparator) {
    this.map = /* @__PURE__ */ new Map();
    this.sortedKeys = [];
    this.comparator = comparator;
  }
  /**
   * Finds the index where a key-value pair should be inserted to maintain sort order.
   * Uses binary search to find the correct position based on the value (if comparator provided),
   * with key-based tie-breaking for deterministic ordering when values compare as equal.
   * If no comparator is provided, sorts by key only.
   * Runs in O(log n) time.
   *
   * @param key - The key to find position for (used as tie-breaker or primary sort when no comparator)
   * @param value - The value to compare against (only used if comparator is provided)
   * @returns The index where the key should be inserted
   */
  indexOf(key, value) {
    let left = 0;
    let right = this.sortedKeys.length;
    if (!this.comparator) {
      while (left < right) {
        const mid = Math.floor((left + right) / 2);
        const midKey = this.sortedKeys[mid];
        const keyComparison = compareKeys(key, midKey);
        if (keyComparison < 0) {
          right = mid;
        } else if (keyComparison > 0) {
          left = mid + 1;
        } else {
          return mid;
        }
      }
      return left;
    }
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      const midKey = this.sortedKeys[mid];
      const midValue = this.map.get(midKey);
      const valueComparison = this.comparator(value, midValue);
      if (valueComparison < 0) {
        right = mid;
      } else if (valueComparison > 0) {
        left = mid + 1;
      } else {
        const keyComparison = compareKeys(key, midKey);
        if (keyComparison < 0) {
          right = mid;
        } else if (keyComparison > 0) {
          left = mid + 1;
        } else {
          return mid;
        }
      }
    }
    return left;
  }
  /**
   * Sets a key-value pair in the map and maintains sort order
   *
   * @param key - The key to set
   * @param value - The value to associate with the key
   * @returns This SortedMap instance for chaining
   */
  set(key, value) {
    if (this.map.has(key)) {
      const oldValue = this.map.get(key);
      const oldIndex = this.indexOf(key, oldValue);
      this.sortedKeys.splice(oldIndex, 1);
    }
    const index = this.indexOf(key, value);
    this.sortedKeys.splice(index, 0, key);
    this.map.set(key, value);
    return this;
  }
  /**
   * Gets a value by its key
   *
   * @param key - The key to look up
   * @returns The value associated with the key, or undefined if not found
   */
  get(key) {
    return this.map.get(key);
  }
  /**
   * Removes a key-value pair from the map
   *
   * @param key - The key to remove
   * @returns True if the key was found and removed, false otherwise
   */
  delete(key) {
    if (this.map.has(key)) {
      const oldValue = this.map.get(key);
      const index = this.indexOf(key, oldValue);
      this.sortedKeys.splice(index, 1);
      return this.map.delete(key);
    }
    return false;
  }
  /**
   * Checks if a key exists in the map
   *
   * @param key - The key to check
   * @returns True if the key exists, false otherwise
   */
  has(key) {
    return this.map.has(key);
  }
  /**
   * Removes all key-value pairs from the map
   */
  clear() {
    this.map.clear();
    this.sortedKeys = [];
  }
  /**
   * Gets the number of key-value pairs in the map
   */
  get size() {
    return this.map.size;
  }
  /**
   * Default iterator that returns entries in sorted order
   *
   * @returns An iterator for the map's entries
   */
  *[Symbol.iterator]() {
    for (const key of this.sortedKeys) {
      yield [
        key,
        this.map.get(key)
      ];
    }
  }
  /**
   * Returns an iterator for the map's entries in sorted order
   *
   * @returns An iterator for the map's entries
   */
  entries() {
    return this[Symbol.iterator]();
  }
  /**
   * Returns an iterator for the map's keys in sorted order
   *
   * @returns An iterator for the map's keys
   */
  keys() {
    return this.sortedKeys[Symbol.iterator]();
  }
  /**
   * Returns an iterator for the map's values in sorted order
   *
   * @returns An iterator for the map's values
   */
  values() {
    return function* () {
      for (const key of this.sortedKeys) {
        yield this.map.get(key);
      }
    }.call(this);
  }
  /**
   * Executes a callback function for each key-value pair in the map in sorted order
   *
   * @param callbackfn - Function to execute for each entry
   */
  forEach(callbackfn) {
    for (const key of this.sortedKeys) {
      callbackfn(this.map.get(key), key, this.map);
    }
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/collection/transaction-metadata.js
var DIRECT_TRANSACTION_METADATA_KEY = `__tanstack_db_direct`;

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/collection/state.js
var CollectionStateManager = class {
  /**
   * Creates a new CollectionState manager
   */
  constructor(config) {
    this.pendingSyncedTransactions = [];
    this.syncedMetadata = /* @__PURE__ */ new Map();
    this.syncedCollectionMetadata = /* @__PURE__ */ new Map();
    this.optimisticUpserts = /* @__PURE__ */ new Map();
    this.optimisticDeletes = /* @__PURE__ */ new Set();
    this.pendingOptimisticUpserts = /* @__PURE__ */ new Map();
    this.pendingOptimisticDeletes = /* @__PURE__ */ new Set();
    this.pendingOptimisticDirectUpserts = /* @__PURE__ */ new Set();
    this.pendingOptimisticDirectDeletes = /* @__PURE__ */ new Set();
    this.rowOrigins = /* @__PURE__ */ new Map();
    this.pendingLocalChanges = /* @__PURE__ */ new Set();
    this.pendingLocalOrigins = /* @__PURE__ */ new Set();
    this.virtualPropsCache = /* @__PURE__ */ new WeakMap();
    this.size = 0;
    this.syncedKeys = /* @__PURE__ */ new Set();
    this.preSyncVisibleState = /* @__PURE__ */ new Map();
    this.recentlySyncedKeys = /* @__PURE__ */ new Set();
    this.hasReceivedFirstCommit = false;
    this.isCommittingSyncTransactions = false;
    this.isLocalOnly = false;
    this.commitPendingTransactions = () => {
      let hasPersistingTransaction = false;
      for (const transaction of this.transactions.values()) {
        if (transaction.state === `persisting`) {
          hasPersistingTransaction = true;
          break;
        }
      }
      const { committedSyncedTransactions, uncommittedSyncedTransactions, hasTruncateSync, hasImmediateSync } = this.pendingSyncedTransactions.reduce((acc, t) => {
        if (t.committed) {
          acc.committedSyncedTransactions.push(t);
          if (t.truncate) {
            acc.hasTruncateSync = true;
          }
          if (t.immediate) {
            acc.hasImmediateSync = true;
          }
        } else {
          acc.uncommittedSyncedTransactions.push(t);
        }
        return acc;
      }, {
        committedSyncedTransactions: [],
        uncommittedSyncedTransactions: [],
        hasTruncateSync: false,
        hasImmediateSync: false
      });
      if (!hasPersistingTransaction || hasTruncateSync || hasImmediateSync) {
        this.isCommittingSyncTransactions = true;
        const truncateOptimisticSnapshot = hasTruncateSync ? committedSyncedTransactions.find((t) => t.truncate)?.optimisticSnapshot : null;
        let truncatePendingLocalChanges;
        let truncatePendingLocalOrigins;
        const changedKeys = /* @__PURE__ */ new Set();
        for (const transaction of committedSyncedTransactions) {
          for (const operation of transaction.operations) {
            changedKeys.add(operation.key);
          }
          for (const [key] of transaction.rowMetadataWrites) {
            changedKeys.add(key);
          }
        }
        const virtualSnapshotKeys = new Set(changedKeys);
        for (const key of this.pendingOptimisticDirectUpserts) {
          virtualSnapshotKeys.add(key);
        }
        for (const key of this.pendingOptimisticDirectDeletes) {
          virtualSnapshotKeys.add(key);
        }
        const previousRowOrigins = this.snapshotRowOriginsForKeys(virtualSnapshotKeys);
        const previousOptimisticUpserts = new Map(this.optimisticUpserts);
        const previousOptimisticDeletes = new Set(this.optimisticDeletes);
        let currentVisibleState = this.preSyncVisibleState;
        if (currentVisibleState.size === 0) {
          currentVisibleState = /* @__PURE__ */ new Map();
          for (const key of changedKeys) {
            const currentValue = this.get(key);
            if (currentValue !== void 0) {
              currentVisibleState.set(key, currentValue);
            }
          }
        }
        const events = [];
        const rowUpdateMode = this.config.sync.rowUpdateMode || `partial`;
        const completedOptimisticOps = /* @__PURE__ */ new Map();
        for (const transaction of this.transactions.values()) {
          if (transaction.state === `completed`) {
            for (const mutation of transaction.mutations) {
              if (this.isThisCollection(mutation.collection)) {
                if (mutation.optimistic) {
                  completedOptimisticOps.set(mutation.key, {
                    type: mutation.type,
                    value: mutation.modified
                  });
                }
              }
            }
          }
        }
        for (const transaction of committedSyncedTransactions) {
          if (transaction.truncate) {
            const visibleKeys = /* @__PURE__ */ new Set([
              ...this.syncedData.keys(),
              ...truncateOptimisticSnapshot?.upserts.keys() || []
            ]);
            for (const key of visibleKeys) {
              if (truncateOptimisticSnapshot?.deletes.has(key)) continue;
              const previousValue = truncateOptimisticSnapshot?.upserts.get(key) || this.syncedData.get(key);
              if (previousValue !== void 0) {
                events.push({
                  type: `delete`,
                  key,
                  value: previousValue
                });
              }
            }
            truncatePendingLocalChanges = new Set(this.pendingLocalChanges);
            truncatePendingLocalOrigins = new Set(this.pendingLocalOrigins);
            this.syncedData.clear();
            this.syncedMetadata.clear();
            this.syncedKeys.clear();
            this.clearOriginTrackingState();
            for (const key of changedKeys) {
              currentVisibleState.delete(key);
            }
            this._events.emit(`truncate`, {
              type: `truncate`,
              collection: this.collection
            });
          }
          for (const operation of transaction.operations) {
            const key = operation.key;
            this.syncedKeys.add(key);
            const origin = this.isLocalOnly || this.pendingLocalChanges.has(key) || this.pendingLocalOrigins.has(key) || truncatePendingLocalChanges?.has(key) === true || truncatePendingLocalOrigins?.has(key) === true ? "local" : "remote";
            switch (operation.type) {
              case `insert`:
                this.syncedData.set(key, operation.value);
                this.rowOrigins.set(key, origin);
                this.pendingLocalChanges.delete(key);
                this.pendingLocalOrigins.delete(key);
                this.pendingOptimisticUpserts.delete(key);
                this.pendingOptimisticDeletes.delete(key);
                this.pendingOptimisticDirectUpserts.delete(key);
                this.pendingOptimisticDirectDeletes.delete(key);
                break;
              case `update`: {
                if (rowUpdateMode === `partial`) {
                  const updatedValue = Object.assign({}, this.syncedData.get(key), operation.value);
                  this.syncedData.set(key, updatedValue);
                } else {
                  this.syncedData.set(key, operation.value);
                }
                this.rowOrigins.set(key, origin);
                this.pendingLocalChanges.delete(key);
                this.pendingLocalOrigins.delete(key);
                this.pendingOptimisticUpserts.delete(key);
                this.pendingOptimisticDeletes.delete(key);
                this.pendingOptimisticDirectUpserts.delete(key);
                this.pendingOptimisticDirectDeletes.delete(key);
                break;
              }
              case `delete`:
                this.syncedData.delete(key);
                this.syncedMetadata.delete(key);
                this.rowOrigins.delete(key);
                this.pendingLocalChanges.delete(key);
                this.pendingLocalOrigins.delete(key);
                this.pendingOptimisticUpserts.delete(key);
                this.pendingOptimisticDeletes.delete(key);
                this.pendingOptimisticDirectUpserts.delete(key);
                this.pendingOptimisticDirectDeletes.delete(key);
                break;
            }
          }
          for (const [key, metadataWrite] of transaction.rowMetadataWrites) {
            if (metadataWrite.type === `delete`) {
              this.syncedMetadata.delete(key);
              continue;
            }
            this.syncedMetadata.set(key, metadataWrite.value);
          }
          for (const [key, metadataWrite] of transaction.collectionMetadataWrites) {
            if (metadataWrite.type === `delete`) {
              this.syncedCollectionMetadata.delete(key);
              continue;
            }
            this.syncedCollectionMetadata.set(key, metadataWrite.value);
          }
        }
        if (hasTruncateSync) {
          const syncedInsertedOrUpdatedKeys = /* @__PURE__ */ new Set();
          for (const t of committedSyncedTransactions) {
            for (const op of t.operations) {
              if (op.type === `insert` || op.type === `update`) {
                syncedInsertedOrUpdatedKeys.add(op.key);
              }
            }
          }
          const reapplyUpserts = new Map(truncateOptimisticSnapshot.upserts);
          const reapplyDeletes = new Set(truncateOptimisticSnapshot.deletes);
          for (const [key, value] of reapplyUpserts) {
            if (reapplyDeletes.has(key)) continue;
            if (syncedInsertedOrUpdatedKeys.has(key)) {
              let foundInsert = false;
              for (let i = events.length - 1; i >= 0; i--) {
                const evt = events[i];
                if (evt.key === key && evt.type === `insert`) {
                  evt.value = value;
                  foundInsert = true;
                  break;
                }
              }
              if (!foundInsert) {
                events.push({
                  type: `insert`,
                  key,
                  value
                });
              }
            } else {
              events.push({
                type: `insert`,
                key,
                value
              });
            }
          }
          if (events.length > 0 && reapplyDeletes.size > 0) {
            const filtered = [];
            for (const evt of events) {
              if (evt.type === `insert` && reapplyDeletes.has(evt.key)) {
                continue;
              }
              filtered.push(evt);
            }
            events.length = 0;
            events.push(...filtered);
          }
          if (this.lifecycle.status !== `ready`) {
            this.lifecycle.markReady();
          }
        }
        this.optimisticUpserts.clear();
        this.optimisticDeletes.clear();
        this.isCommittingSyncTransactions = false;
        if (hasTruncateSync && truncateOptimisticSnapshot) {
          for (const [key, value] of truncateOptimisticSnapshot.upserts) {
            this.optimisticUpserts.set(key, value);
          }
          for (const key of truncateOptimisticSnapshot.deletes) {
            this.optimisticDeletes.add(key);
          }
        }
        for (const transaction of this.transactions.values()) {
          if (![
            `completed`,
            `failed`
          ].includes(transaction.state)) {
            for (const mutation of transaction.mutations) {
              if (this.isThisCollection(mutation.collection) && mutation.optimistic) {
                switch (mutation.type) {
                  case `insert`:
                  case `update`:
                    this.optimisticUpserts.set(mutation.key, mutation.modified);
                    this.optimisticDeletes.delete(mutation.key);
                    break;
                  case `delete`:
                    this.optimisticUpserts.delete(mutation.key);
                    this.optimisticDeletes.add(mutation.key);
                    break;
                }
              }
            }
          }
        }
        for (const key of this.pendingOptimisticDirectUpserts) {
          if (!changedKeys.has(key)) {
            changedKeys.add(key);
            if (!currentVisibleState.has(key)) {
              const previousValue = previousOptimisticUpserts.get(key);
              if (previousValue !== void 0) {
                currentVisibleState.set(key, previousValue);
              }
            }
            this.pendingOptimisticUpserts.delete(key);
            this.pendingLocalOrigins.delete(key);
          }
        }
        for (const key of this.pendingOptimisticDirectDeletes) {
          if (!changedKeys.has(key)) {
            changedKeys.add(key);
          }
          this.pendingOptimisticDeletes.delete(key);
          this.pendingLocalOrigins.delete(key);
        }
        this.pendingOptimisticDirectUpserts.clear();
        this.pendingOptimisticDirectDeletes.clear();
        for (const key of changedKeys) {
          const previousVisibleValue = currentVisibleState.get(key);
          const newVisibleValue = this.get(key);
          const previousVirtualProps = this.getVirtualPropsSnapshotForState(key, {
            rowOrigins: previousRowOrigins,
            optimisticUpserts: previousOptimisticUpserts,
            optimisticDeletes: previousOptimisticDeletes,
            completedOptimisticKeys: completedOptimisticOps
          });
          const nextVirtualProps = this.getVirtualPropsSnapshotForState(key);
          const virtualChanged = previousVirtualProps.$synced !== nextVirtualProps.$synced || previousVirtualProps.$origin !== nextVirtualProps.$origin;
          const previousValueWithVirtual = previousVisibleValue !== void 0 ? enrichRowWithVirtualProps(previousVisibleValue, key, this.collection.id, () => previousVirtualProps.$synced, () => previousVirtualProps.$origin) : void 0;
          const completedOp = completedOptimisticOps.get(key);
          let isRedundantSync = false;
          if (completedOp) {
            if (completedOp.type === `delete` && previousVisibleValue !== void 0 && newVisibleValue === void 0 && deepEquals(completedOp.value, previousVisibleValue)) {
              isRedundantSync = true;
            } else if (newVisibleValue !== void 0 && deepEquals(completedOp.value, newVisibleValue)) {
              isRedundantSync = true;
            }
          }
          const shouldEmitVirtualUpdate = virtualChanged && previousVisibleValue !== void 0 && newVisibleValue !== void 0 && deepEquals(previousVisibleValue, newVisibleValue);
          if (isRedundantSync && !shouldEmitVirtualUpdate) {
            continue;
          }
          if (previousVisibleValue === void 0 && newVisibleValue !== void 0) {
            const completedOptimisticOp = completedOptimisticOps.get(key);
            if (completedOptimisticOp) {
              const previousValueFromCompleted = completedOptimisticOp.value;
              const previousValueWithVirtualFromCompleted = enrichRowWithVirtualProps(previousValueFromCompleted, key, this.collection.id, () => previousVirtualProps.$synced, () => previousVirtualProps.$origin);
              events.push({
                type: `update`,
                key,
                value: newVisibleValue,
                previousValue: previousValueWithVirtualFromCompleted
              });
            } else {
              events.push({
                type: `insert`,
                key,
                value: newVisibleValue
              });
            }
          } else if (previousVisibleValue !== void 0 && newVisibleValue === void 0) {
            events.push({
              type: `delete`,
              key,
              value: previousValueWithVirtual ?? previousVisibleValue
            });
          } else if (previousVisibleValue !== void 0 && newVisibleValue !== void 0 && (!deepEquals(previousVisibleValue, newVisibleValue) || shouldEmitVirtualUpdate)) {
            events.push({
              type: `update`,
              key,
              value: newVisibleValue,
              previousValue: previousValueWithVirtual ?? previousVisibleValue
            });
          }
        }
        this.size = this.calculateSize();
        if (events.length > 0) {
          this.indexes.updateIndexes(events);
        }
        this.changes.emitEvents(events, true);
        this.pendingSyncedTransactions = uncommittedSyncedTransactions;
        this.preSyncVisibleState.clear();
        Promise.resolve().then(() => {
          this.recentlySyncedKeys.clear();
        });
        if (!this.hasReceivedFirstCommit) {
          this.hasReceivedFirstCommit = true;
        }
      }
    };
    this.config = config;
    this.transactions = new SortedMap((a, b) => a.compareCreatedAt(b));
    this.syncedData = new SortedMap(config.compare);
  }
  setDeps(deps) {
    this.collection = deps.collection;
    this.lifecycle = deps.lifecycle;
    this.changes = deps.changes;
    this.indexes = deps.indexes;
    this._events = deps.events;
  }
  /**
   * Checks whether this row currently has no pending local optimistic writes.
   *
   * This is local mutation status, not backend confirmation: `true` means the
   * row is not currently affected by an optimistic transaction in this
   * collection's visible state.
   *
   * Used to compute the $synced virtual property.
   */
  isRowSynced(key) {
    if (this.isLocalOnly) {
      return true;
    }
    return !this.optimisticUpserts.has(key) && !this.optimisticDeletes.has(key);
  }
  /**
   * Gets the origin of the last confirmed change to a row.
   * Returns 'local' if the row has optimistic mutations (optimistic changes are local).
   * Used to compute the $origin virtual property.
   */
  getRowOrigin(key) {
    if (this.isLocalOnly) {
      return "local";
    }
    if (this.optimisticUpserts.has(key) || this.optimisticDeletes.has(key)) {
      return "local";
    }
    return this.rowOrigins.get(key) ?? "remote";
  }
  createVirtualPropsSnapshot(key, overrides) {
    return {
      $synced: overrides?.$synced ?? this.isRowSynced(key),
      $origin: overrides?.$origin ?? this.getRowOrigin(key),
      $key: overrides?.$key ?? key,
      $collectionId: overrides?.$collectionId ?? this.collection.id
    };
  }
  getVirtualPropsSnapshotForState(key, options) {
    if (this.isLocalOnly) {
      return this.createVirtualPropsSnapshot(key, {
        $synced: true,
        $origin: "local"
      });
    }
    const optimisticUpserts = options?.optimisticUpserts ?? this.optimisticUpserts;
    const optimisticDeletes = options?.optimisticDeletes ?? this.optimisticDeletes;
    const hasOptimisticChange = optimisticUpserts.has(key) || optimisticDeletes.has(key) || options?.completedOptimisticKeys?.has(key) === true;
    return this.createVirtualPropsSnapshot(key, {
      $synced: !hasOptimisticChange,
      $origin: hasOptimisticChange ? "local" : (options?.rowOrigins ?? this.rowOrigins).get(key) ?? "remote"
    });
  }
  snapshotRowOriginsForKeys(keys) {
    const rowOrigins = /* @__PURE__ */ new Map();
    for (const key of keys) {
      const origin = this.rowOrigins.get(key);
      if (origin !== void 0) {
        rowOrigins.set(key, origin);
      }
    }
    return rowOrigins;
  }
  enrichWithVirtualPropsSnapshot(row, virtualProps) {
    const existingRow = row;
    const synced = existingRow.$synced ?? virtualProps.$synced;
    const origin = existingRow.$origin ?? virtualProps.$origin;
    const resolvedKey = existingRow.$key ?? virtualProps.$key;
    const collectionId = existingRow.$collectionId ?? virtualProps.$collectionId;
    const cached = this.virtualPropsCache.get(row);
    if (cached && cached.synced === synced && cached.origin === origin && cached.key === resolvedKey && cached.collectionId === collectionId) {
      return cached.enriched;
    }
    const enriched = {
      ...row,
      $synced: synced,
      $origin: origin,
      $key: resolvedKey,
      $collectionId: collectionId
    };
    this.virtualPropsCache.set(row, {
      synced,
      origin,
      key: resolvedKey,
      collectionId,
      enriched
    });
    return enriched;
  }
  clearOriginTrackingState() {
    this.rowOrigins.clear();
    this.pendingLocalChanges.clear();
    this.pendingLocalOrigins.clear();
  }
  /**
   * Enriches a row with virtual properties using the "add-if-missing" pattern.
   * If the row already has virtual properties (from an upstream collection),
   * they are preserved. Otherwise, new values are computed.
   */
  enrichWithVirtualProps(row, key) {
    return this.enrichWithVirtualPropsSnapshot(row, this.createVirtualPropsSnapshot(key));
  }
  /**
   * Creates a change message with virtual properties.
   * Uses the "add-if-missing" pattern so that pass-through from upstream
   * collections works correctly.
   */
  enrichChangeMessage(change) {
    const { __virtualProps } = change;
    const enrichedValue = __virtualProps?.value ? this.enrichWithVirtualPropsSnapshot(change.value, __virtualProps.value) : this.enrichWithVirtualProps(change.value, change.key);
    const enrichedPreviousValue = change.previousValue ? __virtualProps?.previousValue ? this.enrichWithVirtualPropsSnapshot(change.previousValue, __virtualProps.previousValue) : this.enrichWithVirtualProps(change.previousValue, change.key) : void 0;
    return {
      key: change.key,
      type: change.type,
      value: enrichedValue,
      previousValue: enrichedPreviousValue,
      metadata: change.metadata
    };
  }
  /**
   * Get the current value for a key enriched with virtual properties.
   */
  getWithVirtualProps(key) {
    const value = this.get(key);
    if (value === void 0) {
      return void 0;
    }
    return this.enrichWithVirtualProps(value, key);
  }
  /**
   * Get the current value for a key (virtual derived state)
   */
  get(key) {
    const { optimisticDeletes, optimisticUpserts, syncedData } = this;
    if (optimisticDeletes.has(key)) {
      return void 0;
    }
    if (optimisticUpserts.has(key)) {
      return optimisticUpserts.get(key);
    }
    return syncedData.get(key);
  }
  /**
   * Check if a key exists in the collection (virtual derived state)
   */
  has(key) {
    const { optimisticDeletes, optimisticUpserts, syncedData } = this;
    if (optimisticDeletes.has(key)) {
      return false;
    }
    if (optimisticUpserts.has(key)) {
      return true;
    }
    return syncedData.has(key);
  }
  /**
   * Get all keys (virtual derived state)
   */
  *keys() {
    const { syncedData, optimisticDeletes, optimisticUpserts } = this;
    for (const key of syncedData.keys()) {
      if (!optimisticDeletes.has(key)) {
        yield key;
      }
    }
    for (const key of optimisticUpserts.keys()) {
      if (!syncedData.has(key) && !optimisticDeletes.has(key)) {
        yield key;
      }
    }
  }
  /**
   * Get all values (virtual derived state)
   */
  *values() {
    for (const key of this.keys()) {
      const value = this.get(key);
      if (value !== void 0) {
        yield value;
      }
    }
  }
  /**
   * Get all entries (virtual derived state)
   */
  *entries() {
    for (const key of this.keys()) {
      const value = this.get(key);
      if (value !== void 0) {
        yield [
          key,
          value
        ];
      }
    }
  }
  /**
   * Get all entries (virtual derived state)
   */
  *[Symbol.iterator]() {
    for (const [key, value] of this.entries()) {
      yield [
        key,
        value
      ];
    }
  }
  /**
   * Execute a callback for each entry in the collection
   */
  forEach(callbackfn) {
    let index = 0;
    for (const [key, value] of this.entries()) {
      callbackfn(value, key, index++);
    }
  }
  /**
   * Create a new array with the results of calling a function for each entry in the collection
   */
  map(callbackfn) {
    const result = [];
    let index = 0;
    for (const [key, value] of this.entries()) {
      result.push(callbackfn(value, key, index++));
    }
    return result;
  }
  /**
   * Check if the given collection is this collection
   * @param collection The collection to check
   * @returns True if the given collection is this collection, false otherwise
   */
  isThisCollection(collection) {
    return collection === this.collection;
  }
  /**
   * Recompute optimistic state from active transactions
   */
  recomputeOptimisticState(triggeredByUserAction = false) {
    if (this.isCommittingSyncTransactions && !triggeredByUserAction) {
      return;
    }
    const previousState = new Map(this.optimisticUpserts);
    const previousDeletes = new Set(this.optimisticDeletes);
    const previousRowOrigins = this.rowOrigins;
    for (const transaction of this.transactions.values()) {
      const isDirectTransaction = transaction.metadata[DIRECT_TRANSACTION_METADATA_KEY] === true;
      if (transaction.state === `completed`) {
        for (const mutation of transaction.mutations) {
          if (!this.isThisCollection(mutation.collection)) {
            continue;
          }
          this.pendingLocalOrigins.add(mutation.key);
          if (!mutation.optimistic) {
            continue;
          }
          switch (mutation.type) {
            case `insert`:
            case `update`:
              this.pendingOptimisticUpserts.set(mutation.key, mutation.modified);
              this.pendingOptimisticDeletes.delete(mutation.key);
              if (isDirectTransaction) {
                this.pendingOptimisticDirectUpserts.add(mutation.key);
                this.pendingOptimisticDirectDeletes.delete(mutation.key);
              } else {
                this.pendingOptimisticDirectUpserts.delete(mutation.key);
                this.pendingOptimisticDirectDeletes.delete(mutation.key);
              }
              break;
            case `delete`:
              this.pendingOptimisticUpserts.delete(mutation.key);
              this.pendingOptimisticDeletes.add(mutation.key);
              if (isDirectTransaction) {
                this.pendingOptimisticDirectUpserts.delete(mutation.key);
                this.pendingOptimisticDirectDeletes.add(mutation.key);
              } else {
                this.pendingOptimisticDirectUpserts.delete(mutation.key);
                this.pendingOptimisticDirectDeletes.delete(mutation.key);
              }
              break;
          }
        }
      } else if (transaction.state === `failed`) {
        for (const mutation of transaction.mutations) {
          if (!this.isThisCollection(mutation.collection)) {
            continue;
          }
          this.pendingLocalOrigins.delete(mutation.key);
          if (mutation.optimistic) {
            this.pendingOptimisticUpserts.delete(mutation.key);
            this.pendingOptimisticDeletes.delete(mutation.key);
            this.pendingOptimisticDirectUpserts.delete(mutation.key);
            this.pendingOptimisticDirectDeletes.delete(mutation.key);
          }
        }
      }
    }
    this.optimisticUpserts.clear();
    this.optimisticDeletes.clear();
    this.pendingLocalChanges.clear();
    const pendingSyncKeys = /* @__PURE__ */ new Set();
    for (const transaction of this.pendingSyncedTransactions) {
      for (const operation of transaction.operations) {
        pendingSyncKeys.add(operation.key);
      }
    }
    const staleOptimisticUpserts = [];
    for (const [key, value] of this.pendingOptimisticUpserts) {
      if (pendingSyncKeys.has(key) || this.pendingOptimisticDirectUpserts.has(key)) {
        this.optimisticUpserts.set(key, value);
      } else {
        staleOptimisticUpserts.push(key);
      }
    }
    for (const key of staleOptimisticUpserts) {
      this.pendingOptimisticUpserts.delete(key);
      this.pendingLocalOrigins.delete(key);
    }
    const staleOptimisticDeletes = [];
    for (const key of this.pendingOptimisticDeletes) {
      if (pendingSyncKeys.has(key) || this.pendingOptimisticDirectDeletes.has(key)) {
        this.optimisticDeletes.add(key);
      } else {
        staleOptimisticDeletes.push(key);
      }
    }
    for (const key of staleOptimisticDeletes) {
      this.pendingOptimisticDeletes.delete(key);
      this.pendingLocalOrigins.delete(key);
    }
    const activeTransactions = [];
    for (const transaction of this.transactions.values()) {
      if (![
        `completed`,
        `failed`
      ].includes(transaction.state)) {
        activeTransactions.push(transaction);
      }
    }
    for (const transaction of activeTransactions) {
      for (const mutation of transaction.mutations) {
        if (!this.isThisCollection(mutation.collection)) {
          continue;
        }
        this.pendingLocalChanges.add(mutation.key);
        if (mutation.optimistic) {
          switch (mutation.type) {
            case `insert`:
            case `update`:
              this.optimisticUpserts.set(mutation.key, mutation.modified);
              this.optimisticDeletes.delete(mutation.key);
              break;
            case `delete`:
              this.optimisticUpserts.delete(mutation.key);
              this.optimisticDeletes.add(mutation.key);
              break;
          }
        }
      }
    }
    this.size = this.calculateSize();
    const events = [];
    this.collectOptimisticChanges(previousState, previousDeletes, previousRowOrigins, events);
    const filteredEventsBySyncStatus = events.filter((event) => {
      if (!this.recentlySyncedKeys.has(event.key)) {
        return true;
      }
      if (triggeredByUserAction) {
        return true;
      }
      return false;
    });
    if (this.pendingSyncedTransactions.length > 0 && !triggeredByUserAction) {
      const pendingSyncKeysForFilter = /* @__PURE__ */ new Set();
      for (const transaction of this.pendingSyncedTransactions) {
        for (const operation of transaction.operations) {
          pendingSyncKeysForFilter.add(operation.key);
        }
      }
      const filteredEvents = filteredEventsBySyncStatus.filter((event) => {
        if (event.type === `delete` && pendingSyncKeysForFilter.has(event.key)) {
          const hasActiveOptimisticMutation = activeTransactions.some((tx) => tx.mutations.some((m) => this.isThisCollection(m.collection) && m.key === event.key));
          if (!hasActiveOptimisticMutation) {
            return false;
          }
        }
        return true;
      });
      if (filteredEvents.length > 0) {
        this.indexes.updateIndexes(filteredEvents);
      }
      this.changes.emitEvents(filteredEvents, triggeredByUserAction);
    } else {
      if (filteredEventsBySyncStatus.length > 0) {
        this.indexes.updateIndexes(filteredEventsBySyncStatus);
      }
      this.changes.emitEvents(filteredEventsBySyncStatus, triggeredByUserAction);
    }
  }
  /**
   * Calculate the current size based on synced data and optimistic changes
   */
  calculateSize() {
    const syncedSize = this.syncedData.size;
    const deletesFromSynced = Array.from(this.optimisticDeletes).filter((key) => this.syncedData.has(key) && !this.optimisticUpserts.has(key)).length;
    const upsertsNotInSynced = Array.from(this.optimisticUpserts.keys()).filter((key) => !this.syncedData.has(key)).length;
    return syncedSize - deletesFromSynced + upsertsNotInSynced;
  }
  /**
   * Collect events for optimistic changes
   */
  collectOptimisticChanges(previousUpserts, previousDeletes, previousRowOrigins, events) {
    const allKeys = /* @__PURE__ */ new Set([
      ...previousUpserts.keys(),
      ...this.optimisticUpserts.keys(),
      ...previousDeletes,
      ...this.optimisticDeletes
    ]);
    for (const key of allKeys) {
      const currentValue = this.get(key);
      const previousValue = this.getPreviousValue(key, previousUpserts, previousDeletes);
      const previousVirtualProps = this.getVirtualPropsSnapshotForState(key, {
        rowOrigins: previousRowOrigins,
        optimisticUpserts: previousUpserts,
        optimisticDeletes: previousDeletes
      });
      const nextVirtualProps = this.getVirtualPropsSnapshotForState(key);
      if (previousValue !== void 0 && currentValue === void 0) {
        events.push({
          type: `delete`,
          key,
          value: previousValue,
          __virtualProps: {
            value: previousVirtualProps
          }
        });
      } else if (previousValue === void 0 && currentValue !== void 0) {
        events.push({
          type: `insert`,
          key,
          value: currentValue,
          __virtualProps: {
            value: nextVirtualProps
          }
        });
      } else if (previousValue !== void 0 && currentValue !== void 0 && previousValue !== currentValue) {
        events.push({
          type: `update`,
          key,
          value: currentValue,
          previousValue,
          __virtualProps: {
            value: nextVirtualProps,
            previousValue: previousVirtualProps
          }
        });
      }
    }
  }
  /**
   * Get the previous value for a key given previous optimistic state
   */
  getPreviousValue(key, previousUpserts, previousDeletes) {
    if (previousDeletes.has(key)) {
      return void 0;
    }
    if (previousUpserts.has(key)) {
      return previousUpserts.get(key);
    }
    return this.syncedData.get(key);
  }
  /**
   * Schedule cleanup of a transaction when it completes
   */
  scheduleTransactionCleanup(transaction) {
    if (transaction.state === `completed`) {
      this.transactions.delete(transaction.id);
      return;
    }
    transaction.isPersisted.promise.then(() => {
      this.transactions.delete(transaction.id);
    }).catch(() => {
    });
  }
  /**
   * Capture visible state for keys that will be affected by pending sync operations
   * This must be called BEFORE onTransactionStateChange clears optimistic state
   */
  capturePreSyncVisibleState() {
    if (this.pendingSyncedTransactions.length === 0) return;
    const syncedKeys = /* @__PURE__ */ new Set();
    for (const transaction of this.pendingSyncedTransactions) {
      for (const operation of transaction.operations) {
        syncedKeys.add(operation.key);
      }
    }
    for (const key of syncedKeys) {
      this.recentlySyncedKeys.add(key);
    }
    for (const key of syncedKeys) {
      if (!this.preSyncVisibleState.has(key)) {
        const currentValue = this.get(key);
        if (currentValue !== void 0) {
          this.preSyncVisibleState.set(key, currentValue);
        }
      }
    }
  }
  /**
   * Trigger a recomputation when transactions change
   * This method should be called by the Transaction class when state changes
   */
  onTransactionStateChange() {
    this.changes.shouldBatchEvents = this.pendingSyncedTransactions.length > 0;
    this.capturePreSyncVisibleState();
    this.recomputeOptimisticState(false);
  }
  /**
   * Clean up the collection by stopping sync and clearing data
   * This can be called manually or automatically by garbage collection
   */
  cleanup() {
    this.syncedData.clear();
    this.syncedMetadata.clear();
    this.syncedCollectionMetadata.clear();
    this.optimisticUpserts.clear();
    this.optimisticDeletes.clear();
    this.pendingOptimisticUpserts.clear();
    this.pendingOptimisticDeletes.clear();
    this.pendingOptimisticDirectUpserts.clear();
    this.pendingOptimisticDirectDeletes.clear();
    this.clearOriginTrackingState();
    this.isLocalOnly = false;
    this.size = 0;
    this.pendingSyncedTransactions = [];
    this.syncedKeys.clear();
    this.hasReceivedFirstCommit = false;
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/query/builder/ref-proxy.js
function createSingleRowRefProxy() {
  const cache = /* @__PURE__ */ new Map();
  function createProxy(path) {
    const pathKey = path.join(`.`);
    if (cache.has(pathKey)) {
      return cache.get(pathKey);
    }
    const proxy = new Proxy({}, {
      get(target, prop, receiver) {
        if (prop === `__refProxy`) return true;
        if (prop === `__path`) return path;
        if (prop === `__type`) return void 0;
        if (typeof prop === `symbol`) return Reflect.get(target, prop, receiver);
        const newPath = [
          ...path,
          String(prop)
        ];
        return createProxy(newPath);
      },
      has(target, prop) {
        if (prop === `__refProxy` || prop === `__path` || prop === `__type`) return true;
        return Reflect.has(target, prop);
      },
      ownKeys(target) {
        return Reflect.ownKeys(target);
      },
      getOwnPropertyDescriptor(target, prop) {
        if (prop === `__refProxy` || prop === `__path` || prop === `__type`) {
          return {
            enumerable: false,
            configurable: true
          };
        }
        return Reflect.getOwnPropertyDescriptor(target, prop);
      }
    });
    cache.set(pathKey, proxy);
    return proxy;
  }
  return createProxy([]);
}
function createRefProxy(aliases) {
  const cache = /* @__PURE__ */ new Map();
  let accessId = 0;
  function createProxy(path) {
    const pathKey = path.join(`.`);
    if (cache.has(pathKey)) {
      return cache.get(pathKey);
    }
    const proxy = new Proxy({}, {
      get(target, prop, receiver) {
        if (prop === `__refProxy`) return true;
        if (prop === `__path`) return path;
        if (prop === `__type`) return void 0;
        if (typeof prop === `symbol`) return Reflect.get(target, prop, receiver);
        const newPath = [
          ...path,
          String(prop)
        ];
        return createProxy(newPath);
      },
      has(target, prop) {
        if (prop === `__refProxy` || prop === `__path` || prop === `__type`) return true;
        return Reflect.has(target, prop);
      },
      ownKeys(target) {
        const id = ++accessId;
        const sentinelKey = `__SPREAD_SENTINEL__${path.join(`.`)}__${id}`;
        if (!Object.prototype.hasOwnProperty.call(target, sentinelKey)) {
          Object.defineProperty(target, sentinelKey, {
            enumerable: true,
            configurable: true,
            value: true
          });
        }
        return Reflect.ownKeys(target);
      },
      getOwnPropertyDescriptor(target, prop) {
        if (prop === `__refProxy` || prop === `__path` || prop === `__type`) {
          return {
            enumerable: false,
            configurable: true
          };
        }
        return Reflect.getOwnPropertyDescriptor(target, prop);
      }
    });
    cache.set(pathKey, proxy);
    return proxy;
  }
  const rootProxy = new Proxy({}, {
    get(target, prop, receiver) {
      if (prop === `__refProxy`) return true;
      if (prop === `__path`) return [];
      if (prop === `__type`) return void 0;
      if (typeof prop === `symbol`) return Reflect.get(target, prop, receiver);
      const propStr = String(prop);
      if (aliases.includes(propStr) || aliases.includes(`*`)) {
        return createProxy([
          propStr
        ]);
      }
      return void 0;
    },
    has(target, prop) {
      if (prop === `__refProxy` || prop === `__path` || prop === `__type`) return true;
      if (typeof prop === `string` && aliases.includes(prop)) return true;
      return Reflect.has(target, prop);
    },
    ownKeys(_target) {
      return [
        ...aliases,
        `__refProxy`,
        `__path`,
        `__type`
      ];
    },
    getOwnPropertyDescriptor(target, prop) {
      if (prop === `__refProxy` || prop === `__path` || prop === `__type`) {
        return {
          enumerable: false,
          configurable: true
        };
      }
      if (typeof prop === `string` && aliases.includes(prop)) {
        return {
          enumerable: true,
          configurable: true
        };
      }
      return void 0;
    }
  });
  return rootProxy;
}
function createRefProxyWithSelected(aliases) {
  const baseProxy = createRefProxy(aliases);
  const cache = /* @__PURE__ */ new Map();
  function createSelectedProxy(path) {
    const pathKey = path.join(`.`);
    if (cache.has(pathKey)) {
      return cache.get(pathKey);
    }
    const proxy = new Proxy({}, {
      get(target, prop, receiver) {
        if (prop === `__refProxy`) return true;
        if (prop === `__path`) return [
          `$selected`,
          ...path
        ];
        if (prop === `__type`) return void 0;
        if (typeof prop === `symbol`) return Reflect.get(target, prop, receiver);
        const newPath = [
          ...path,
          String(prop)
        ];
        return createSelectedProxy(newPath);
      },
      has(target, prop) {
        if (prop === `__refProxy` || prop === `__path` || prop === `__type`) return true;
        return Reflect.has(target, prop);
      },
      ownKeys(target) {
        return Reflect.ownKeys(target);
      },
      getOwnPropertyDescriptor(target, prop) {
        if (prop === `__refProxy` || prop === `__path` || prop === `__type`) {
          return {
            enumerable: false,
            configurable: true
          };
        }
        return Reflect.getOwnPropertyDescriptor(target, prop);
      }
    });
    cache.set(pathKey, proxy);
    return proxy;
  }
  const wrappedSelectedProxy = createSelectedProxy([]);
  return new Proxy(baseProxy, {
    get(target, prop, receiver) {
      if (prop === `$selected`) {
        return wrappedSelectedProxy;
      }
      return Reflect.get(target, prop, receiver);
    },
    has(target, prop) {
      if (prop === `$selected`) return true;
      return Reflect.has(target, prop);
    },
    ownKeys(target) {
      return [
        ...Reflect.ownKeys(target),
        `$selected`
      ];
    },
    getOwnPropertyDescriptor(target, prop) {
      if (prop === `$selected`) {
        return {
          enumerable: true,
          configurable: true,
          value: wrappedSelectedProxy
        };
      }
      return Reflect.getOwnPropertyDescriptor(target, prop);
    }
  });
}
function toExpression(value) {
  if (isRefProxy(value)) {
    return new PropRef(value.__path);
  }
  if (value && typeof value === `object` && (value.__brand === `ToArrayWrapper` || value.__brand === `ConcatToArrayWrapper` || value.__brand === `CaseWhenWrapper` || value.__brand === `MaterializeWrapper`)) {
    const name = value.__brand === `ToArrayWrapper` ? `toArray()` : value.__brand === `ConcatToArrayWrapper` ? `concat(toArray())` : value.__brand === `CaseWhenWrapper` ? `caseWhen()` : `materialize()`;
    throw new Error(`${name} cannot be used inside expressions (e.g., coalesce(), eq(), not()). Use ${name} directly as a select field value instead.`);
  }
  if (value && typeof value === `object` && `type` in value && (value.type === `func` || value.type === `ref` || value.type === `val` || value.type === `agg`)) {
    return value;
  }
  return new Value(value);
}
function isRefProxy(value) {
  return value && typeof value === `object` && value.__refProxy === true;
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/query/builder/functions.js
function eq(left, right) {
  return new Func(`eq`, [
    toExpression(left),
    toExpression(right)
  ]);
}
function gt(left, right) {
  return new Func(`gt`, [
    toExpression(left),
    toExpression(right)
  ]);
}
function gte(left, right) {
  return new Func(`gte`, [
    toExpression(left),
    toExpression(right)
  ]);
}
function lt(left, right) {
  return new Func(`lt`, [
    toExpression(left),
    toExpression(right)
  ]);
}
function lte(left, right) {
  return new Func(`lte`, [
    toExpression(left),
    toExpression(right)
  ]);
}
function and(left, right, ...rest) {
  const allArgs = [
    left,
    right,
    ...rest
  ];
  return new Func(`and`, allArgs.map((arg) => toExpression(arg)));
}
function or(left, right, ...rest) {
  const allArgs = [
    left,
    right,
    ...rest
  ];
  return new Func(`or`, allArgs.map((arg) => toExpression(arg)));
}
function not(value) {
  return new Func(`not`, [
    toExpression(value)
  ]);
}
function isNull(value) {
  return new Func(`isNull`, [
    toExpression(value)
  ]);
}
function inArray(value, array) {
  return new Func(`in`, [
    toExpression(value),
    toExpression(array)
  ]);
}
var ToArrayWrapper = class {
  constructor(query) {
    this.query = query;
    this.__brand = `ToArrayWrapper`;
  }
};
var ConcatToArrayWrapper = class {
  constructor(query) {
    this.query = query;
    this.__brand = `ConcatToArrayWrapper`;
  }
};
var CaseWhenWrapper = class {
  constructor(args) {
    this.args = args;
    this.__brand = `CaseWhenWrapper`;
  }
};
var MaterializeWrapper = class {
  constructor(query) {
    this.query = query;
    this.__brand = `MaterializeWrapper`;
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/event-emitter.js
var EventEmitter = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Map();
  }
  /**
   * Subscribe to an event
   * @param event - Event name to listen for
   * @param callback - Function to call when event is emitted
   * @returns Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, /* @__PURE__ */ new Set());
    }
    this.listeners.get(event).add(callback);
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }
  /**
   * Subscribe to an event once (automatically unsubscribes after first emission)
   * @param event - Event name to listen for
   * @param callback - Function to call when event is emitted
   * @returns Unsubscribe function
   */
  once(event, callback) {
    const unsubscribe = this.on(event, (eventPayload) => {
      callback(eventPayload);
      unsubscribe();
    });
    return unsubscribe;
  }
  /**
   * Unsubscribe from an event
   * @param event - Event name to stop listening for
   * @param callback - Function to remove
   */
  off(event, callback) {
    this.listeners.get(event)?.delete(callback);
  }
  /**
   * Wait for an event to be emitted
   * @param event - Event name to wait for
   * @param timeout - Optional timeout in milliseconds
   * @returns Promise that resolves with the event payload
   */
  waitFor(event, timeout) {
    return new Promise((resolve, reject) => {
      let timeoutId;
      const unsubscribe = this.on(event, (eventPayload) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = void 0;
        }
        resolve(eventPayload);
        unsubscribe();
      });
      if (timeout) {
        timeoutId = setTimeout(() => {
          timeoutId = void 0;
          unsubscribe();
          reject(new Error(`Timeout waiting for event ${String(event)}`));
        }, timeout);
      }
    });
  }
  /**
   * Emit an event to all listeners
   * @param event - Event name to emit
   * @param eventPayload - Event payload
   * @internal For use by subclasses - subclasses should wrap this with a public emit if needed
   */
  emitInner(event, eventPayload) {
    this.listeners.get(event)?.forEach((listener) => {
      try {
        listener(eventPayload);
      } catch (error) {
        queueMicrotask(() => {
          throw error;
        });
      }
    });
  }
  /**
   * Clear all listeners
   */
  clearListeners() {
    this.listeners.clear();
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/utils/cursor.js
function buildCursor(orderBy2, values) {
  if (values.length === 0 || orderBy2.length === 0) {
    return void 0;
  }
  if (orderBy2.length === 1) {
    const { expression, compareOptions } = orderBy2[0];
    const operator = compareOptions.direction === `asc` ? gt : lt;
    return operator(expression, new Value(values[0]));
  }
  const clauses = [];
  for (let i = 0; i < orderBy2.length && i < values.length; i++) {
    const clause = orderBy2[i];
    const value = values[i];
    const eqConditions = [];
    for (let j = 0; j < i; j++) {
      const prevClause = orderBy2[j];
      const prevValue = values[j];
      eqConditions.push(eq(prevClause.expression, new Value(prevValue)));
    }
    const operator = clause.compareOptions.direction === `asc` ? gt : lt;
    const comparison = operator(clause.expression, new Value(value));
    if (eqConditions.length === 0) {
      clauses.push(comparison);
    } else {
      const allConditions = [
        ...eqConditions,
        comparison
      ];
      clauses.push(allConditions.reduce((acc, cond) => and(acc, cond)));
    }
  }
  if (clauses.length === 1) {
    return clauses[0];
  }
  return clauses.reduce((acc, clause) => or(acc, clause));
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/collection/subscription.js
var CollectionSubscription = class extends EventEmitter {
  constructor(collection, callback, options) {
    super();
    this.collection = collection;
    this.callback = callback;
    this.options = options;
    this.loadedInitialState = false;
    this.skipFiltering = false;
    this.snapshotSent = false;
    this.loadedSubsets = [];
    this.sentKeys = /* @__PURE__ */ new Set();
    this.limitedSnapshotRowCount = 0;
    this._status = `ready`;
    this.pendingLoadSubsetPromises = /* @__PURE__ */ new Set();
    this.isBufferingForTruncate = false;
    this.truncateBuffer = [];
    this.pendingTruncateRefetches = /* @__PURE__ */ new Set();
    if (options.onUnsubscribe) {
      this.on(`unsubscribed`, (event) => options.onUnsubscribe(event));
    }
    if (options.whereExpression) {
      ensureIndexForExpression(options.whereExpression, this.collection);
    }
    const callbackWithSentKeysTracking = (changes) => {
      callback(changes);
      this.trackSentKeys(changes);
    };
    this.callback = callbackWithSentKeysTracking;
    this.filteredCallback = options.whereExpression ? createFilteredCallback(this.callback, options) : this.callback;
    this.truncateCleanup = this.collection.on(`truncate`, () => {
      this.handleTruncate();
    });
  }
  get status() {
    return this._status;
  }
  /**
   * Handle collection truncate event by resetting state and re-requesting subsets.
   * This is called when the sync layer receives a must-refetch and clears all data.
   *
   * To prevent a flash of missing content, we buffer all changes (deletes from truncate
   * and inserts from refetch) until all loadSubset promises resolve, then emit them together.
   */
  handleTruncate() {
    const subsetsToReload = [
      ...this.loadedSubsets
    ];
    const hasLoadSubsetHandler = this.collection._sync.syncLoadSubsetFn !== null;
    if (subsetsToReload.length === 0 || !hasLoadSubsetHandler) {
      this.snapshotSent = false;
      this.loadedInitialState = false;
      this.limitedSnapshotRowCount = 0;
      this.lastSentKey = void 0;
      this.loadedSubsets = [];
      return;
    }
    this.isBufferingForTruncate = true;
    this.truncateBuffer = [];
    this.pendingTruncateRefetches.clear();
    this.snapshotSent = false;
    this.loadedInitialState = false;
    this.limitedSnapshotRowCount = 0;
    this.lastSentKey = void 0;
    this.loadedSubsets = [];
    queueMicrotask(() => {
      if (!this.isBufferingForTruncate) {
        return;
      }
      for (const options of subsetsToReload) {
        const syncResult = this.collection._sync.loadSubset(options);
        this.loadedSubsets.push(options);
        this.trackLoadSubsetPromise(syncResult);
        if (syncResult instanceof Promise) {
          this.pendingTruncateRefetches.add(syncResult);
          syncResult.catch(() => {
          }).finally(() => {
            this.pendingTruncateRefetches.delete(syncResult);
            this.checkTruncateRefetchComplete();
          });
        }
      }
      if (this.pendingTruncateRefetches.size === 0) {
        this.flushTruncateBuffer();
      }
    });
  }
  /**
   * Check if all truncate refetch promises have completed and flush buffer if so
   */
  checkTruncateRefetchComplete() {
    if (this.pendingTruncateRefetches.size === 0 && this.isBufferingForTruncate) {
      this.flushTruncateBuffer();
    }
  }
  /**
   * Flush the truncate buffer, emitting all buffered changes to the callback
   */
  flushTruncateBuffer() {
    this.isBufferingForTruncate = false;
    const merged = this.truncateBuffer.flat();
    if (merged.length > 0) {
      this.filteredCallback(merged);
    }
    this.truncateBuffer = [];
  }
  setOrderByIndex(index) {
    this.orderByIndex = index;
  }
  /**
   * Check if an orderBy index has been set for this subscription
   */
  hasOrderByIndex() {
    return this.orderByIndex !== void 0;
  }
  /**
   * Set subscription status and emit events if changed
   */
  setStatus(newStatus) {
    if (this._status === newStatus) {
      return;
    }
    const previousStatus = this._status;
    this._status = newStatus;
    this.emitInner(`status:change`, {
      type: `status:change`,
      subscription: this,
      previousStatus,
      status: newStatus
    });
    const eventKey = `status:${newStatus}`;
    this.emitInner(eventKey, {
      type: eventKey,
      subscription: this,
      previousStatus,
      status: newStatus
    });
  }
  /**
   * Track a loadSubset promise and manage loading status
   */
  trackLoadSubsetPromise(syncResult) {
    if (syncResult instanceof Promise) {
      this.pendingLoadSubsetPromises.add(syncResult);
      this.setStatus(`loadingSubset`);
      syncResult.finally(() => {
        this.pendingLoadSubsetPromises.delete(syncResult);
        if (this.pendingLoadSubsetPromises.size === 0) {
          this.setStatus(`ready`);
        }
      });
    }
  }
  hasLoadedInitialState() {
    return this.loadedInitialState;
  }
  hasSentAtLeastOneSnapshot() {
    return this.snapshotSent;
  }
  emitEvents(changes) {
    const newChanges = this.filterAndFlipChanges(changes);
    if (this.isBufferingForTruncate) {
      if (newChanges.length > 0) {
        this.truncateBuffer.push(newChanges);
      }
    } else {
      this.filteredCallback(newChanges);
    }
  }
  /**
   * Sends the snapshot to the callback.
   * Returns a boolean indicating if it succeeded.
   * It can only fail if there is no index to fulfill the request
   * and the optimizedOnly option is set to true,
   * or, the entire state was already loaded.
   */
  requestSnapshot(opts) {
    if (this.loadedInitialState) {
      return false;
    }
    const stateOpts = {
      where: this.options.whereExpression,
      optimizedOnly: opts?.optimizedOnly ?? false
    };
    if (opts) {
      if (`where` in opts) {
        const snapshotWhereExp = opts.where;
        if (stateOpts.where) {
          const subWhereExp = stateOpts.where;
          const combinedWhereExp = and(subWhereExp, snapshotWhereExp);
          stateOpts.where = combinedWhereExp;
        } else {
          stateOpts.where = snapshotWhereExp;
        }
      }
    } else {
      this.loadedInitialState = true;
    }
    const loadOptions = {
      where: stateOpts.where,
      subscription: this,
      // Include orderBy and limit if provided so sync layer can optimize the query
      orderBy: opts?.orderBy,
      limit: opts?.limit
    };
    const syncResult = this.collection._sync.loadSubset(loadOptions);
    opts?.onLoadSubsetResult?.(syncResult);
    this.loadedSubsets.push(loadOptions);
    const trackLoadSubsetPromise = opts?.trackLoadSubsetPromise ?? true;
    if (trackLoadSubsetPromise) {
      this.trackLoadSubsetPromise(syncResult);
    }
    const snapshot = this.collection.currentStateAsChanges(stateOpts);
    if (snapshot === void 0) {
      return false;
    }
    const filteredSnapshot = snapshot.filter((change) => !this.sentKeys.has(change.key));
    for (const change of filteredSnapshot) {
      this.sentKeys.add(change.key);
    }
    this.snapshotSent = true;
    this.callback(filteredSnapshot);
    return true;
  }
  /**
   * Sends a snapshot that fulfills the `where` clause and all rows are bigger or equal to the cursor.
   * Requires a range index to be set with `setOrderByIndex` prior to calling this method.
   * It uses that range index to load the items in the order of the index.
   *
   * For multi-column orderBy:
   * - Uses first value from `minValues` for LOCAL index operations (wide bounds, ensures no missed rows)
   * - Uses all `minValues` to build a precise composite cursor for SYNC layer loadSubset
   *
   * Note 1: it may load more rows than the provided LIMIT because it loads all values equal to the first cursor value + limit values greater.
   *         This is needed to ensure that it does not accidentally skip duplicate values when the limit falls in the middle of some duplicated values.
   * Note 2: it does not send keys that have already been sent before.
   */
  requestLimitedSnapshot({ orderBy: orderBy2, limit, minValues, offset, trackLoadSubsetPromise: shouldTrackLoadSubsetPromise = true, onLoadSubsetResult }) {
    if (!limit) throw new Error(`limit is required`);
    if (!this.orderByIndex) {
      throw new Error(`Ordered snapshot was requested but no index was found. You have to call setOrderByIndex before requesting an ordered snapshot.`);
    }
    const hasMinValue = minValues !== void 0 && minValues.length > 0;
    const minValue2 = minValues?.[0];
    const minValueForIndex = minValue2;
    const index = this.orderByIndex;
    const where = this.options.whereExpression;
    const whereFilterFn = where ? createFilterFunctionFromExpression(where) : void 0;
    const filterFn = (key) => {
      if (key !== void 0 && this.sentKeys.has(key)) {
        return false;
      }
      const value = this.collection.get(key);
      if (value === void 0) {
        return false;
      }
      return whereFilterFn?.(value) ?? true;
    };
    let biggestObservedValue = minValueForIndex;
    const changes = [];
    let keys = [];
    if (hasMinValue) {
      const { expression } = orderBy2[0];
      const allRowsWithMinValue = this.collection.currentStateAsChanges({
        where: eq(expression, new Value(minValueForIndex))
      });
      if (allRowsWithMinValue) {
        const keysWithMinValue = allRowsWithMinValue.map((change) => change.key).filter((key) => !this.sentKeys.has(key) && filterFn(key));
        keys.push(...keysWithMinValue);
        const keysGreaterThanMin = index.take(limit - keys.length, minValueForIndex, filterFn);
        keys.push(...keysGreaterThanMin);
      } else {
        keys = index.take(limit, minValueForIndex, filterFn);
      }
    } else {
      keys = index.takeFromStart(limit, filterFn);
    }
    const valuesNeeded = () => Math.max(limit - changes.length, 0);
    const collectionExhausted = () => keys.length === 0;
    const orderByExpression = orderBy2[0].expression;
    const valueExtractor = orderByExpression.type === `ref` ? compileExpression(new PropRef(orderByExpression.path), true) : null;
    while (valuesNeeded() > 0 && !collectionExhausted()) {
      const insertedKeys = /* @__PURE__ */ new Set();
      for (const key of keys) {
        const value = this.collection.get(key);
        changes.push({
          type: `insert`,
          key,
          value
        });
        biggestObservedValue = valueExtractor ? valueExtractor(value) : value;
        insertedKeys.add(key);
      }
      keys = index.take(valuesNeeded(), biggestObservedValue, filterFn);
    }
    const currentOffset = this.limitedSnapshotRowCount;
    for (const change of changes) {
      this.sentKeys.add(change.key);
    }
    this.callback(changes);
    this.limitedSnapshotRowCount += changes.length;
    if (changes.length > 0) {
      this.lastSentKey = changes[changes.length - 1].key;
    }
    let cursorExpressions;
    if (minValues !== void 0 && minValues.length > 0) {
      const whereFromCursor = buildCursor(orderBy2, minValues);
      if (whereFromCursor) {
        const { expression } = orderBy2[0];
        const cursorMinValue = minValues[0];
        let whereCurrentCursor;
        if (cursorMinValue instanceof Date) {
          const cursorMinValuePlus1ms = new Date(cursorMinValue.getTime() + 1);
          whereCurrentCursor = and(gte(expression, new Value(cursorMinValue)), lt(expression, new Value(cursorMinValuePlus1ms)));
        } else {
          whereCurrentCursor = eq(expression, new Value(cursorMinValue));
        }
        cursorExpressions = {
          whereFrom: whereFromCursor,
          whereCurrent: whereCurrentCursor,
          lastKey: this.lastSentKey
        };
      }
    }
    const loadOptions = {
      where,
      // Main filter only, no cursor
      limit,
      orderBy: orderBy2,
      cursor: cursorExpressions,
      // Cursor expressions passed separately
      offset: offset ?? currentOffset,
      // Use provided offset, or auto-tracked offset
      subscription: this
    };
    const syncResult = this.collection._sync.loadSubset(loadOptions);
    onLoadSubsetResult?.(syncResult);
    this.loadedSubsets.push(loadOptions);
    if (shouldTrackLoadSubsetPromise) {
      this.trackLoadSubsetPromise(syncResult);
    }
  }
  // TODO: also add similar test but that checks that it can also load it from the collection's loadSubset function
  //       and that that also works properly (i.e. does not skip duplicate values)
  /**
   * Filters and flips changes for keys that have not been sent yet.
   * Deletes are filtered out for keys that have not been sent yet.
   * Updates are flipped into inserts for keys that have not been sent yet.
   * Duplicate inserts are filtered out to prevent D2 multiplicity > 1.
   */
  filterAndFlipChanges(changes) {
    if (this.loadedInitialState || this.skipFiltering) {
      return changes;
    }
    const skipDeleteFilter = this.isBufferingForTruncate;
    const newChanges = [];
    for (const change of changes) {
      let newChange = change;
      const keyInSentKeys = this.sentKeys.has(change.key);
      if (!keyInSentKeys) {
        if (change.type === `update`) {
          newChange = {
            ...change,
            type: `insert`,
            previousValue: void 0
          };
        } else if (change.type === `delete`) {
          if (!skipDeleteFilter) {
            continue;
          }
        }
        this.sentKeys.add(change.key);
      } else {
        if (change.type === `insert`) {
          continue;
        } else if (change.type === `delete`) {
          this.sentKeys.delete(change.key);
        }
      }
      newChanges.push(newChange);
    }
    return newChanges;
  }
  trackSentKeys(changes) {
    if (this.loadedInitialState || this.skipFiltering) {
      return;
    }
    for (const change of changes) {
      if (change.type === `delete`) {
        this.sentKeys.delete(change.key);
      } else {
        this.sentKeys.add(change.key);
      }
    }
    if (this.orderByIndex) {
      this.limitedSnapshotRowCount = Math.max(this.limitedSnapshotRowCount, this.sentKeys.size);
    }
  }
  /**
   * Mark that the subscription should not filter any changes.
   * This is used when includeInitialState is explicitly set to false,
   * meaning the caller doesn't want initial state but does want ALL future changes.
   */
  markAllStateAsSeen() {
    this.skipFiltering = true;
  }
  unsubscribe() {
    this.truncateCleanup?.();
    this.truncateCleanup = void 0;
    this.isBufferingForTruncate = false;
    this.truncateBuffer = [];
    this.pendingTruncateRefetches.clear();
    for (const options of this.loadedSubsets) {
      this.collection._sync.unloadSubset(options);
    }
    this.loadedSubsets = [];
    this.emitInner(`unsubscribed`, {
      type: `unsubscribed`,
      subscription: this
    });
    this.clearListeners();
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/collection/changes.js
var CollectionChangesManager = class {
  /**
   * Creates a new CollectionChangesManager instance
   */
  constructor() {
    this.activeSubscribersCount = 0;
    this.changeSubscriptions = /* @__PURE__ */ new Set();
    this.batchedEvents = [];
    this.shouldBatchEvents = false;
  }
  setDeps(deps) {
    this.lifecycle = deps.lifecycle;
    this.sync = deps.sync;
    this.events = deps.events;
    this.collection = deps.collection;
    this.state = deps.state;
  }
  /**
   * Emit an empty ready event to notify subscribers that the collection is ready
   * This bypasses the normal empty array check in emitEvents
   */
  emitEmptyReadyEvent() {
    for (const subscription of this.changeSubscriptions) {
      subscription.emitEvents([]);
    }
  }
  /**
   * Enriches a change message with virtual properties ($synced, $origin, $key, $collectionId).
   * Uses the "add-if-missing" pattern to preserve virtual properties from upstream collections.
   */
  enrichChangeWithVirtualProps(change) {
    return this.state.enrichChangeMessage(change);
  }
  /**
   * Emit events either immediately or batch them for later emission
   */
  emitEvents(changes, forceEmit = false) {
    if (this.shouldBatchEvents && !forceEmit) {
      this.batchedEvents.push(...changes);
      return;
    }
    let rawEvents = changes;
    if (forceEmit) {
      if (this.batchedEvents.length > 0) {
        rawEvents = [
          ...this.batchedEvents,
          ...changes
        ];
      }
      this.batchedEvents = [];
      this.shouldBatchEvents = false;
    }
    if (rawEvents.length === 0) {
      return;
    }
    const enrichedEvents = rawEvents.map((change) => this.enrichChangeWithVirtualProps(change));
    for (const subscription of this.changeSubscriptions) {
      subscription.emitEvents(enrichedEvents);
    }
  }
  /**
   * Subscribe to changes in the collection
   */
  subscribeChanges(callback, options = {}) {
    this.addSubscriber();
    if (options.where && options.whereExpression) {
      throw new Error(`Cannot specify both 'where' and 'whereExpression' options. Use one or the other.`);
    }
    const { where, ...opts } = options;
    let whereExpression = opts.whereExpression;
    if (where) {
      const proxy = createSingleRowRefProxy();
      const result = where(proxy);
      whereExpression = toExpression(result);
    }
    const subscription = new CollectionSubscription(this.collection, callback, {
      ...opts,
      whereExpression,
      onUnsubscribe: () => {
        this.removeSubscriber();
        this.changeSubscriptions.delete(subscription);
      }
    });
    if (options.onStatusChange) {
      subscription.on(`status:change`, options.onStatusChange);
    }
    if (options.includeInitialState) {
      subscription.requestSnapshot({
        trackLoadSubsetPromise: false,
        orderBy: options.orderBy,
        limit: options.limit,
        onLoadSubsetResult: options.onLoadSubsetResult
      });
    } else if (options.includeInitialState === false) {
      subscription.markAllStateAsSeen();
    }
    this.changeSubscriptions.add(subscription);
    return subscription;
  }
  /**
   * Increment the active subscribers count and start sync if needed
   */
  addSubscriber() {
    const previousSubscriberCount = this.activeSubscribersCount;
    this.activeSubscribersCount++;
    this.lifecycle.cancelGCTimer();
    if (this.lifecycle.status === `cleaned-up` || this.lifecycle.status === `idle`) {
      this.sync.startSync();
    }
    this.events.emitSubscribersChange(this.activeSubscribersCount, previousSubscriberCount);
  }
  /**
   * Decrement the active subscribers count and start GC timer if needed
   */
  removeSubscriber() {
    const previousSubscriberCount = this.activeSubscribersCount;
    this.activeSubscribersCount--;
    if (this.activeSubscribersCount === 0) {
      this.lifecycle.startGCTimer();
    } else if (this.activeSubscribersCount < 0) {
      throw new NegativeActiveSubscribersError();
    }
    this.events.emitSubscribersChange(this.activeSubscribersCount, previousSubscriberCount);
  }
  /**
   * Clean up the collection by stopping sync and clearing data
   * This can be called manually or automatically by garbage collection
   */
  cleanup() {
    this.batchedEvents = [];
    this.shouldBatchEvents = false;
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/utils/browser-polyfills.js
var requestIdleCallbackPolyfill = (callback) => {
  const timeout = 0;
  const timeoutId = setTimeout(() => {
    callback({
      didTimeout: true,
      // Always indicate timeout for the polyfill
      timeRemaining: () => 50
    });
  }, timeout);
  return timeoutId;
};
var cancelIdleCallbackPolyfill = (id) => {
  clearTimeout(id);
};
var safeRequestIdleCallback = typeof window !== `undefined` && `requestIdleCallback` in window ? (callback, options) => window.requestIdleCallback(callback, options) : (callback, _options) => requestIdleCallbackPolyfill(callback);
var safeCancelIdleCallback = typeof window !== `undefined` && `cancelIdleCallback` in window ? (id) => window.cancelIdleCallback(id) : cancelIdleCallbackPolyfill;

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/collection/cleanup-queue.js
var _CleanupQueue = class _CleanupQueue2 {
  constructor() {
    this.tasks = /* @__PURE__ */ new Map();
    this.timeoutId = null;
    this.microtaskScheduled = false;
  }
  static getInstance() {
    if (!_CleanupQueue2.instance) {
      _CleanupQueue2.instance = new _CleanupQueue2();
    }
    return _CleanupQueue2.instance;
  }
  /**
   * Queues a cleanup task and defers timeout selection to a microtask so
   * multiple synchronous registrations can share one root timer.
   */
  schedule(key, gcTime, callback) {
    const executeAt = Date.now() + gcTime;
    this.tasks.set(key, {
      executeAt,
      callback
    });
    if (!this.microtaskScheduled) {
      this.microtaskScheduled = true;
      Promise.resolve().then(() => {
        this.microtaskScheduled = false;
        this.updateTimeout();
      });
    }
  }
  cancel(key) {
    this.tasks.delete(key);
  }
  /**
   * Keeps only one active timeout: whichever task is due next.
   */
  updateTimeout() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.tasks.size === 0) {
      return;
    }
    let earliestTime = Infinity;
    for (const task of this.tasks.values()) {
      if (task.executeAt < earliestTime) {
        earliestTime = task.executeAt;
      }
    }
    const delay = Math.max(0, earliestTime - Date.now());
    this.timeoutId = setTimeout(() => this.process(), delay);
  }
  /**
   * Runs every task whose deadline has passed, then schedules the next wakeup
   * if there is still pending work.
   */
  process() {
    this.timeoutId = null;
    const now = Date.now();
    for (const [key, task] of this.tasks.entries()) {
      if (now >= task.executeAt) {
        this.tasks.delete(key);
        try {
          task.callback();
        } catch (error) {
          console.error("Error in CleanupQueue task:", error);
        }
      }
    }
    if (this.tasks.size > 0) {
      this.updateTimeout();
    }
  }
  /**
   * Resets the singleton instance for tests.
   */
  static resetInstance() {
    if (_CleanupQueue2.instance) {
      if (_CleanupQueue2.instance.timeoutId !== null) {
        clearTimeout(_CleanupQueue2.instance.timeoutId);
      }
      _CleanupQueue2.instance = null;
    }
  }
};
_CleanupQueue.instance = null;
var CleanupQueue = _CleanupQueue;

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/collection/lifecycle.js
var CollectionLifecycleManager = class {
  /**
   * Creates a new CollectionLifecycleManager instance
   */
  constructor(config, id) {
    this.status = `idle`;
    this.hasBeenReady = false;
    this.hasReceivedFirstCommit = false;
    this.onFirstReadyCallbacks = [];
    this.idleCallbackId = null;
    this.config = config;
    this.id = id;
  }
  setDeps(deps) {
    this.indexes = deps.indexes;
    this.events = deps.events;
    this.changes = deps.changes;
    this.sync = deps.sync;
    this.state = deps.state;
  }
  /**
   * Validates state transitions to prevent invalid status changes
   */
  validateStatusTransition(from, to) {
    if (from === to) {
      return;
    }
    const validTransitions = {
      idle: [
        `loading`,
        `error`,
        `cleaned-up`
      ],
      loading: [
        `ready`,
        `error`,
        `cleaned-up`
      ],
      ready: [
        `cleaned-up`,
        `error`
      ],
      error: [
        `cleaned-up`,
        `idle`
      ],
      "cleaned-up": [
        `loading`,
        `error`
      ]
    };
    if (!validTransitions[from].includes(to)) {
      throw new InvalidCollectionStatusTransitionError(from, to, this.id);
    }
  }
  /**
   * Safely update the collection status with validation
   * @private
   */
  setStatus(newStatus, allowReady = false) {
    if (newStatus === `ready` && !allowReady) {
      throw new CollectionStateError(`You can't directly call "setStatus('ready'). You must use markReady instead.`);
    }
    this.validateStatusTransition(this.status, newStatus);
    const previousStatus = this.status;
    this.status = newStatus;
    this.events.emitStatusChange(newStatus, previousStatus);
  }
  /**
   * Validates that the collection is in a usable state for data operations
   * @private
   */
  validateCollectionUsable(operation) {
    switch (this.status) {
      case `error`:
        throw new CollectionInErrorStateError(operation, this.id);
      case `cleaned-up`:
        this.sync.startSync();
        break;
    }
  }
  /**
   * Mark the collection as ready for use
   * This is called by sync implementations to explicitly signal that the collection is ready,
   * providing a more intuitive alternative to using commits for readiness signaling
   * @private - Should only be called by sync implementations
   */
  markReady() {
    this.validateStatusTransition(this.status, `ready`);
    if (this.status === `loading`) {
      this.setStatus(`ready`, true);
      if (!this.hasBeenReady) {
        this.hasBeenReady = true;
        if (!this.hasReceivedFirstCommit) {
          this.hasReceivedFirstCommit = true;
        }
        const callbacks = [
          ...this.onFirstReadyCallbacks
        ];
        this.onFirstReadyCallbacks = [];
        callbacks.forEach((callback) => callback());
      }
      if (this.changes.changeSubscriptions.size > 0) {
        this.changes.emitEmptyReadyEvent();
      }
    }
  }
  /**
   * Start the garbage collection timer
   * Called when the collection becomes inactive (no subscribers)
   */
  startGCTimer() {
    const gcTime = this.config.gcTime ?? 3e5;
    if (gcTime <= 0 || !Number.isFinite(gcTime)) {
      return;
    }
    CleanupQueue.getInstance().schedule(this, gcTime, () => {
      if (this.changes.activeSubscribersCount === 0) {
        this.scheduleIdleCleanup();
      }
    });
  }
  /**
   * Cancel the garbage collection timer
   * Called when the collection becomes active again
   */
  cancelGCTimer() {
    CleanupQueue.getInstance().cancel(this);
    if (this.idleCallbackId !== null) {
      safeCancelIdleCallback(this.idleCallbackId);
      this.idleCallbackId = null;
    }
  }
  /**
   * Schedule cleanup to run during browser idle time
   * This prevents blocking the UI thread during cleanup operations
   */
  scheduleIdleCleanup() {
    if (this.idleCallbackId !== null) {
      safeCancelIdleCallback(this.idleCallbackId);
    }
    this.idleCallbackId = safeRequestIdleCallback((deadline) => {
      if (this.changes.activeSubscribersCount === 0) {
        const cleanupCompleted = this.performCleanup(deadline);
        if (cleanupCompleted) {
          this.idleCallbackId = null;
        }
      } else {
        this.idleCallbackId = null;
      }
    }, {
      timeout: 1e3
    });
  }
  /**
   * Perform cleanup operations, optionally in chunks during idle time
   * @returns true if cleanup was completed, false if it was rescheduled
   */
  performCleanup(deadline) {
    const hasTime = !deadline || deadline.timeRemaining() > 0 || deadline.didTimeout;
    if (hasTime) {
      this.sync.cleanup();
      this.state.cleanup();
      this.changes.cleanup();
      this.indexes.cleanup();
      CleanupQueue.getInstance().cancel(this);
      this.hasBeenReady = false;
      const callbacks = [
        ...this.onFirstReadyCallbacks
      ];
      this.onFirstReadyCallbacks = [];
      callbacks.forEach((callback) => {
        try {
          callback();
        } catch (error) {
          console.error(`${this.config.id ? `[${this.config.id}] ` : ``}Error in onFirstReady callback during cleanup:`, error);
        }
      });
      this.setStatus(`cleaned-up`);
      this.events.cleanup();
      return true;
    } else {
      this.scheduleIdleCleanup();
      return false;
    }
  }
  /**
   * Register a callback to be executed when the collection first becomes ready
   * Useful for preloading collections
   * @param callback Function to call when the collection first becomes ready
   */
  onFirstReady(callback) {
    if (this.hasBeenReady) {
      callback();
      return;
    }
    this.onFirstReadyCallbacks.push(callback);
  }
  cleanup() {
    if (this.idleCallbackId !== null) {
      safeCancelIdleCallback(this.idleCallbackId);
      this.idleCallbackId = null;
    }
    this.performCleanup();
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/query/live/internal.js
var LIVE_QUERY_INTERNAL = /* @__PURE__ */ Symbol(`liveQueryInternal`);

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/collection/sync.js
var CollectionSyncManager = class {
  /**
   * Creates a new CollectionSyncManager instance
   */
  constructor(config, id) {
    this.preloadPromise = null;
    this.syncCleanupFn = null;
    this.syncLoadSubsetFn = null;
    this.syncUnloadSubsetFn = null;
    this.pendingLoadSubsetPromises = /* @__PURE__ */ new Set();
    this.config = config;
    this.id = id;
    this.syncMode = config.syncMode ?? `eager`;
  }
  setDeps(deps) {
    this.collection = deps.collection;
    this.state = deps.state;
    this.lifecycle = deps.lifecycle;
    this._events = deps.events;
  }
  /**
   * Start the sync process for this collection
   * This is called when the collection is first accessed or preloaded
   */
  startSync() {
    if (this.lifecycle.status !== `idle` && this.lifecycle.status !== `cleaned-up`) {
      return;
    }
    this.lifecycle.setStatus(`loading`);
    try {
      const syncRes = normalizeSyncFnResult(this.config.sync.sync({
        collection: this.collection,
        begin: (options) => {
          this.state.pendingSyncedTransactions.push({
            committed: false,
            operations: [],
            deletedKeys: /* @__PURE__ */ new Set(),
            rowMetadataWrites: /* @__PURE__ */ new Map(),
            collectionMetadataWrites: /* @__PURE__ */ new Map(),
            immediate: options?.immediate
          });
        },
        write: (messageWithOptionalKey) => {
          const pendingTransaction = this.state.pendingSyncedTransactions[this.state.pendingSyncedTransactions.length - 1];
          if (!pendingTransaction) {
            throw new NoPendingSyncTransactionWriteError();
          }
          if (pendingTransaction.committed) {
            throw new SyncTransactionAlreadyCommittedWriteError();
          }
          let key = void 0;
          if (`key` in messageWithOptionalKey) {
            key = messageWithOptionalKey.key;
          } else {
            key = this.config.getKey(messageWithOptionalKey.value);
          }
          if (this.state.pendingLocalChanges.has(key)) {
            this.state.pendingLocalOrigins.add(key);
          }
          let messageType = messageWithOptionalKey.type;
          if (messageWithOptionalKey.type === `insert`) {
            const insertingIntoExistingSynced = this.state.syncedData.has(key);
            const hasPendingDeleteForKey = pendingTransaction.deletedKeys.has(key);
            const isTruncateTransaction = pendingTransaction.truncate === true;
            if (insertingIntoExistingSynced && !hasPendingDeleteForKey && !isTruncateTransaction) {
              const existingValue = this.state.syncedData.get(key);
              const valuesEqual2 = existingValue !== void 0 && deepEquals(existingValue, messageWithOptionalKey.value);
              if (valuesEqual2) {
                messageType = `update`;
              } else {
                const utils = this.config.utils;
                const internal = utils?.[LIVE_QUERY_INTERNAL];
                throw new DuplicateKeySyncError(key, this.id, {
                  hasCustomGetKey: internal?.hasCustomGetKey ?? false,
                  hasJoins: internal?.hasJoins ?? false,
                  hasDistinct: internal?.hasDistinct ?? false
                });
              }
            }
          }
          const message = {
            ...messageWithOptionalKey,
            type: messageType,
            key
          };
          pendingTransaction.operations.push(message);
          if (messageType === `delete`) {
            pendingTransaction.deletedKeys.add(key);
            pendingTransaction.rowMetadataWrites.set(key, {
              type: `delete`
            });
          } else if (messageType === `insert`) {
            if (message.metadata !== void 0) {
              pendingTransaction.rowMetadataWrites.set(key, {
                type: `set`,
                value: message.metadata
              });
            } else {
              pendingTransaction.rowMetadataWrites.set(key, {
                type: `delete`
              });
            }
          } else if (message.metadata !== void 0) {
            pendingTransaction.rowMetadataWrites.set(key, {
              type: `set`,
              value: message.metadata
            });
          }
        },
        commit: () => {
          const pendingTransaction = this.state.pendingSyncedTransactions[this.state.pendingSyncedTransactions.length - 1];
          if (!pendingTransaction) {
            throw new NoPendingSyncTransactionCommitError();
          }
          if (pendingTransaction.committed) {
            throw new SyncTransactionAlreadyCommittedError();
          }
          pendingTransaction.committed = true;
          this.state.commitPendingTransactions();
        },
        markReady: () => {
          this.lifecycle.markReady();
        },
        truncate: () => {
          const pendingTransaction = this.state.pendingSyncedTransactions[this.state.pendingSyncedTransactions.length - 1];
          if (!pendingTransaction) {
            throw new NoPendingSyncTransactionWriteError();
          }
          if (pendingTransaction.committed) {
            throw new SyncTransactionAlreadyCommittedWriteError();
          }
          pendingTransaction.operations = [];
          pendingTransaction.deletedKeys.clear();
          pendingTransaction.rowMetadataWrites.clear();
          pendingTransaction.truncate = true;
          pendingTransaction.optimisticSnapshot = {
            upserts: new Map(this.state.optimisticUpserts),
            deletes: new Set(this.state.optimisticDeletes)
          };
        },
        metadata: this.createSyncMetadataApi()
      }));
      this.syncCleanupFn = syncRes?.cleanup ?? null;
      this.syncLoadSubsetFn = syncRes?.loadSubset ?? null;
      this.syncUnloadSubsetFn = syncRes?.unloadSubset ?? null;
      if (this.syncMode === `on-demand` && !this.syncLoadSubsetFn) {
        throw new CollectionConfigurationError(`Collection "${this.id}" is configured with syncMode "on-demand" but the sync function did not return a loadSubset handler. Either provide a loadSubset handler or use syncMode "eager".`);
      }
    } catch (error) {
      this.lifecycle.setStatus(`error`);
      throw error;
    }
  }
  getActivePendingSyncTransaction() {
    const pendingTransaction = this.state.pendingSyncedTransactions[this.state.pendingSyncedTransactions.length - 1];
    if (!pendingTransaction) {
      throw new NoPendingSyncTransactionWriteError();
    }
    if (pendingTransaction.committed) {
      throw new SyncTransactionAlreadyCommittedWriteError();
    }
    return pendingTransaction;
  }
  createSyncMetadataApi() {
    return {
      row: {
        get: (key) => {
          const pendingTransaction = this.state.pendingSyncedTransactions[this.state.pendingSyncedTransactions.length - 1];
          const pendingWrite = pendingTransaction?.rowMetadataWrites.get(key);
          if (pendingWrite) {
            return pendingWrite.type === `delete` ? void 0 : pendingWrite.value;
          }
          if (pendingTransaction?.truncate) {
            return void 0;
          }
          return this.state.syncedMetadata.get(key);
        },
        set: (key, metadata) => {
          const pendingTransaction = this.getActivePendingSyncTransaction();
          pendingTransaction.rowMetadataWrites.set(key, {
            type: `set`,
            value: metadata
          });
        },
        delete: (key) => {
          const pendingTransaction = this.getActivePendingSyncTransaction();
          pendingTransaction.rowMetadataWrites.set(key, {
            type: `delete`
          });
        }
      },
      collection: {
        get: (key) => {
          const pendingTransaction = this.state.pendingSyncedTransactions[this.state.pendingSyncedTransactions.length - 1];
          const pendingWrite = pendingTransaction?.collectionMetadataWrites.get(key);
          if (pendingWrite) {
            return pendingWrite.type === `delete` ? void 0 : pendingWrite.value;
          }
          return this.state.syncedCollectionMetadata.get(key);
        },
        set: (key, value) => {
          const pendingTransaction = this.getActivePendingSyncTransaction();
          pendingTransaction.collectionMetadataWrites.set(key, {
            type: `set`,
            value
          });
        },
        delete: (key) => {
          const pendingTransaction = this.getActivePendingSyncTransaction();
          pendingTransaction.collectionMetadataWrites.set(key, {
            type: `delete`
          });
        },
        list: (prefix) => {
          const merged = new Map(this.state.syncedCollectionMetadata);
          const pendingTransaction = this.state.pendingSyncedTransactions[this.state.pendingSyncedTransactions.length - 1];
          if (pendingTransaction) {
            for (const [key, pendingWrite] of pendingTransaction.collectionMetadataWrites) {
              if (pendingWrite.type === `delete`) {
                merged.delete(key);
              } else {
                merged.set(key, pendingWrite.value);
              }
            }
          }
          return Array.from(merged.entries()).filter(([key]) => prefix ? key.startsWith(prefix) : true).map(([key, value]) => ({
            key,
            value
          }));
        }
      }
    };
  }
  /**
   * Preload the collection data by starting sync if not already started
   * Multiple concurrent calls will share the same promise
   */
  preload() {
    if (this.preloadPromise) {
      return this.preloadPromise;
    }
    if (this.syncMode === `on-demand`) {
      console.warn(`${this.id ? `[${this.id}] ` : ``}Calling .preload() on a collection with syncMode "on-demand" is a no-op. In on-demand mode, data is only loaded when queries request it. Instead, create a live query and call .preload() on that to load the specific data you need. See https://tanstack.com/blog/tanstack-db-0.5-query-driven-sync for more details.`);
    }
    this.preloadPromise = new Promise((resolve, reject) => {
      if (this.lifecycle.status === `ready`) {
        resolve();
        return;
      }
      if (this.lifecycle.status === `error`) {
        reject(new CollectionIsInErrorStateError());
        return;
      }
      this.lifecycle.onFirstReady(() => {
        resolve();
      });
      if (this.lifecycle.status === `idle` || this.lifecycle.status === `cleaned-up`) {
        try {
          this.startSync();
        } catch (error) {
          reject(error);
          return;
        }
      }
    });
    return this.preloadPromise;
  }
  /**
   * Gets whether the collection is currently loading more data
   */
  get isLoadingSubset() {
    return this.pendingLoadSubsetPromises.size > 0;
  }
  /**
   * Tracks a load promise for isLoadingSubset state.
   * @internal This is for internal coordination (e.g., live-query glue code), not for general use.
   */
  trackLoadPromise(promise) {
    const loadingStarting = !this.isLoadingSubset;
    this.pendingLoadSubsetPromises.add(promise);
    if (loadingStarting) {
      this._events.emit(`loadingSubset:change`, {
        type: `loadingSubset:change`,
        collection: this.collection,
        isLoadingSubset: true,
        previousIsLoadingSubset: false,
        loadingSubsetTransition: `start`
      });
    }
    promise.finally(() => {
      const loadingEnding = this.pendingLoadSubsetPromises.size === 1 && this.pendingLoadSubsetPromises.has(promise);
      this.pendingLoadSubsetPromises.delete(promise);
      if (loadingEnding) {
        this._events.emit(`loadingSubset:change`, {
          type: `loadingSubset:change`,
          collection: this.collection,
          isLoadingSubset: false,
          previousIsLoadingSubset: true,
          loadingSubsetTransition: `end`
        });
      }
    });
  }
  /**
   * Requests the sync layer to load more data.
   * @param options Options to control what data is being loaded
   * @returns If data loading is asynchronous, this method returns a promise that resolves when the data is loaded.
   *          Returns true if no sync function is configured, if syncMode is 'eager', or if there is no work to do.
   */
  loadSubset(options) {
    if (this.syncMode === `eager`) {
      return true;
    }
    if (this.syncLoadSubsetFn) {
      const result = this.syncLoadSubsetFn(options);
      if (result instanceof Promise) {
        this.trackLoadPromise(result);
        return result;
      }
    }
    return true;
  }
  /**
   * Notifies the sync layer that a subset is no longer needed.
   * @param options Options that identify what data is being unloaded
   */
  unloadSubset(options) {
    if (this.syncUnloadSubsetFn) {
      this.syncUnloadSubsetFn(options);
    }
  }
  cleanup() {
    try {
      if (this.syncCleanupFn) {
        this.syncCleanupFn();
        this.syncCleanupFn = null;
      }
    } catch (error) {
      queueMicrotask(() => {
        if (error instanceof Error) {
          const wrappedError = new SyncCleanupError(this.id, error);
          wrappedError.cause = error;
          wrappedError.stack = error.stack;
          throw wrappedError;
        } else {
          throw new SyncCleanupError(this.id, error);
        }
      });
    }
    this.preloadPromise = null;
  }
};
function normalizeSyncFnResult(result) {
  if (typeof result === `function`) {
    return {
      cleanup: result
    };
  }
  if (typeof result === `object`) {
    return result;
  }
  return void 0;
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/collection/indexes.js
var INDEX_SIGNATURE_VERSION = 1;
function compareStringsCodePoint(left, right) {
  if (left === right) {
    return 0;
  }
  return left < right ? -1 : 1;
}
function resolveResolverMetadata(resolver) {
  return {
    kind: `constructor`,
    ...resolver.name ? {
      name: resolver.name
    } : {}
  };
}
function toSerializableIndexValue(value) {
  if (value == null) {
    return value;
  }
  switch (typeof value) {
    case `string`:
    case `boolean`:
      return value;
    case `number`:
      return Number.isFinite(value) ? value : null;
    case `bigint`:
      return {
        __type: `bigint`,
        value: value.toString()
      };
    case `function`:
    case `symbol`:
      return void 0;
    case `undefined`:
      return void 0;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => toSerializableIndexValue(entry) ?? null);
  }
  if (value instanceof Date) {
    return {
      __type: `date`,
      value: value.toISOString()
    };
  }
  if (value instanceof Set) {
    const serializedValues = Array.from(value).map((entry) => toSerializableIndexValue(entry) ?? null).sort((a, b) => compareStringsCodePoint(stableStringifyCollectionIndexValue(a), stableStringifyCollectionIndexValue(b)));
    return {
      __type: `set`,
      values: serializedValues
    };
  }
  if (value instanceof Map) {
    const serializedEntries = Array.from(value.entries()).map(([mapKey, mapValue]) => ({
      key: toSerializableIndexValue(mapKey) ?? null,
      value: toSerializableIndexValue(mapValue) ?? null
    })).sort((a, b) => compareStringsCodePoint(stableStringifyCollectionIndexValue(a.key), stableStringifyCollectionIndexValue(b.key)));
    return {
      __type: `map`,
      entries: serializedEntries
    };
  }
  if (value instanceof RegExp) {
    return {
      __type: `regexp`,
      value: value.toString()
    };
  }
  const serializedObject = {};
  const entries = Object.entries(value).sort(([leftKey], [rightKey]) => compareStringsCodePoint(leftKey, rightKey));
  for (const [key, entryValue] of entries) {
    const serializedEntry = toSerializableIndexValue(entryValue);
    if (serializedEntry !== void 0) {
      serializedObject[key] = serializedEntry;
    }
  }
  return serializedObject;
}
function stableStringifyCollectionIndexValue(value) {
  if (value === null) {
    return `null`;
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringifyCollectionIndexValue).join(`,`)}]`;
  }
  if (typeof value !== `object`) {
    return JSON.stringify(value);
  }
  const sortedKeys = Object.keys(value).sort((left, right) => compareStringsCodePoint(left, right));
  const serializedEntries = sortedKeys.map((key) => `${JSON.stringify(key)}:${stableStringifyCollectionIndexValue(value[key])}`);
  return `{${serializedEntries.join(`,`)}}`;
}
function createCollectionIndexMetadata(indexId, expression, name, resolver, options) {
  const resolverMetadata = resolveResolverMetadata(resolver);
  const serializedExpression = toSerializableIndexValue(expression) ?? null;
  const serializedOptions = toSerializableIndexValue(options);
  const signatureInput = toSerializableIndexValue({
    signatureVersion: INDEX_SIGNATURE_VERSION,
    expression: serializedExpression,
    options: serializedOptions ?? null
  });
  const normalizedSignatureInput = signatureInput ?? null;
  const signature = stableStringifyCollectionIndexValue(normalizedSignatureInput);
  return {
    signatureVersion: INDEX_SIGNATURE_VERSION,
    signature,
    indexId,
    name,
    expression,
    resolver: resolverMetadata,
    ...serializedOptions === void 0 ? {} : {
      options: serializedOptions
    }
  };
}
function cloneSerializableIndexValue(value) {
  if (value === null || typeof value !== `object`) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => cloneSerializableIndexValue(entry));
  }
  const cloned = {};
  for (const [key, entryValue] of Object.entries(value)) {
    cloned[key] = cloneSerializableIndexValue(entryValue);
  }
  return cloned;
}
function cloneExpression(expression) {
  return JSON.parse(JSON.stringify(expression));
}
var CollectionIndexesManager = class {
  constructor() {
    this.indexes = /* @__PURE__ */ new Map();
    this.indexMetadata = /* @__PURE__ */ new Map();
    this.indexCounter = 0;
  }
  setDeps(deps) {
    this.state = deps.state;
    this.lifecycle = deps.lifecycle;
    this.defaultIndexType = deps.defaultIndexType;
    this.events = deps.events;
  }
  /**
   * Creates an index on a collection for faster queries.
   *
   * @example
   * ```ts
   * // With explicit index type (recommended for tree-shaking)
   * import { BasicIndex } from '@tanstack/db'
   * collection.createIndex((row) => row.userId, { indexType: BasicIndex })
   *
   * // With collection's default index type
   * collection.createIndex((row) => row.userId)
   * ```
   */
  createIndex(indexCallback, config = {}) {
    this.lifecycle.validateCollectionUsable(`createIndex`);
    const indexId = ++this.indexCounter;
    const singleRowRefProxy = createSingleRowRefProxy();
    const indexExpression = indexCallback(singleRowRefProxy);
    const expression = toExpression(indexExpression);
    const IndexType = config.indexType ?? this.defaultIndexType;
    if (!IndexType) {
      throw new CollectionConfigurationError(`No index type specified and no defaultIndexType set on collection. Either pass indexType in config, or set defaultIndexType on the collection:
  import { BasicIndex } from '@tanstack/db'
  createCollection({ defaultIndexType: BasicIndex, ... })`);
    }
    const index = new IndexType(indexId, expression, config.name, config.options);
    index.build(this.state.entries());
    this.indexes.set(indexId, index);
    const metadata = createCollectionIndexMetadata(indexId, expression, config.name, IndexType, config.options);
    this.indexMetadata.set(indexId, metadata);
    this.events.emitIndexAdded(metadata);
    return index;
  }
  /**
   * Removes an index from this collection.
   * Returns true when an index existed and was removed, false otherwise.
   */
  removeIndex(indexOrId) {
    this.lifecycle.validateCollectionUsable(`removeIndex`);
    const indexId = typeof indexOrId === `number` ? indexOrId : indexOrId.id;
    const index = this.indexes.get(indexId);
    if (!index) {
      return false;
    }
    if (typeof indexOrId !== `number` && index !== indexOrId) {
      return false;
    }
    this.indexes.delete(indexId);
    const metadata = this.indexMetadata.get(indexId);
    this.indexMetadata.delete(indexId);
    if (metadata) {
      this.events.emitIndexRemoved(metadata);
    }
    return true;
  }
  /**
   * Returns a sorted snapshot of index metadata.
   * This allows persisted wrappers to bootstrap from indexes that were created
   * before they attached lifecycle listeners.
   */
  getIndexMetadataSnapshot() {
    return Array.from(this.indexMetadata.values()).sort((left, right) => left.indexId - right.indexId).map((metadata) => ({
      ...metadata,
      expression: cloneExpression(metadata.expression),
      resolver: {
        ...metadata.resolver
      },
      ...metadata.options === void 0 ? {} : {
        options: cloneSerializableIndexValue(metadata.options)
      }
    }));
  }
  /**
   * Updates all indexes when the collection changes
   */
  updateIndexes(changes) {
    for (const index of this.indexes.values()) {
      for (const change of changes) {
        switch (change.type) {
          case `insert`:
            index.add(change.key, change.value);
            break;
          case `update`:
            if (change.previousValue) {
              index.update(change.key, change.previousValue, change.value);
            } else {
              index.add(change.key, change.value);
            }
            break;
          case `delete`:
            index.remove(change.key, change.value);
            break;
        }
      }
    }
  }
  /**
   * Clean up indexes
   */
  cleanup() {
    this.indexes.clear();
    this.indexMetadata.clear();
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/proxy.js
var CALLBACK_ITERATION_METHODS = /* @__PURE__ */ new Set([
  `find`,
  `findLast`,
  `findIndex`,
  `findLastIndex`,
  `filter`,
  `map`,
  `flatMap`,
  `forEach`,
  `some`,
  `every`,
  `reduce`,
  `reduceRight`
]);
var ARRAY_MODIFYING_METHODS = /* @__PURE__ */ new Set([
  `pop`,
  `push`,
  `shift`,
  `unshift`,
  `splice`,
  `sort`,
  `reverse`,
  `fill`,
  `copyWithin`
]);
var MAP_SET_MODIFYING_METHODS = /* @__PURE__ */ new Set([
  `set`,
  `delete`,
  `clear`,
  `add`
]);
var MAP_SET_ITERATOR_METHODS = /* @__PURE__ */ new Set([
  `entries`,
  `keys`,
  `values`,
  `forEach`
]);
function isProxiableObject(value) {
  return value !== null && typeof value === `object` && !(value instanceof Date) && !(value instanceof RegExp) && !isTemporal(value);
}
function createArrayIterationHandler(methodName, methodFn, changeTracker, memoizedCreateChangeProxy) {
  if (!CALLBACK_ITERATION_METHODS.has(methodName)) {
    return void 0;
  }
  return function(...args) {
    const callback = args[0];
    if (typeof callback !== `function`) {
      return methodFn.apply(changeTracker.copy_, args);
    }
    const getProxiedElement = (element, index) => {
      if (isProxiableObject(element)) {
        const nestedParent = {
          tracker: changeTracker,
          prop: String(index)
        };
        const { proxy: elementProxy } = memoizedCreateChangeProxy(element, nestedParent);
        return elementProxy;
      }
      return element;
    };
    const wrappedCallback = function(element, index, array) {
      const proxiedElement = getProxiedElement(element, index);
      return callback.call(this, proxiedElement, index, array);
    };
    if (methodName === `reduce` || methodName === `reduceRight`) {
      const reduceCallback = function(accumulator, element, index, array) {
        const proxiedElement = getProxiedElement(element, index);
        return callback.call(this, accumulator, proxiedElement, index, array);
      };
      return methodFn.apply(changeTracker.copy_, [
        reduceCallback,
        ...args.slice(1)
      ]);
    }
    const result = methodFn.apply(changeTracker.copy_, [
      wrappedCallback,
      ...args.slice(1)
    ]);
    if ((methodName === `find` || methodName === `findLast`) && result && typeof result === `object`) {
      const foundIndex = changeTracker.copy_.indexOf(result);
      if (foundIndex !== -1) {
        return getProxiedElement(result, foundIndex);
      }
    }
    if (methodName === `filter` && Array.isArray(result)) {
      return result.map((element) => {
        const originalIndex = changeTracker.copy_.indexOf(element);
        if (originalIndex !== -1) {
          return getProxiedElement(element, originalIndex);
        }
        return element;
      });
    }
    return result;
  };
}
function createArrayIteratorHandler(changeTracker, memoizedCreateChangeProxy) {
  return function() {
    const array = changeTracker.copy_;
    let index = 0;
    return {
      next() {
        if (index >= array.length) {
          return {
            done: true,
            value: void 0
          };
        }
        const element = array[index];
        let proxiedElement = element;
        if (isProxiableObject(element)) {
          const nestedParent = {
            tracker: changeTracker,
            prop: String(index)
          };
          const { proxy: elementProxy } = memoizedCreateChangeProxy(element, nestedParent);
          proxiedElement = elementProxy;
        }
        index++;
        return {
          done: false,
          value: proxiedElement
        };
      },
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function createModifyingMethodHandler(methodFn, changeTracker, markChanged) {
  return function(...args) {
    const result = methodFn.apply(changeTracker.copy_, args);
    markChanged(changeTracker);
    return result;
  };
}
function createMapSetIteratorHandler(methodName, prop, methodFn, target, changeTracker, memoizedCreateChangeProxy, markChanged) {
  const isIteratorMethod = MAP_SET_ITERATOR_METHODS.has(methodName) || prop === Symbol.iterator;
  if (!isIteratorMethod) {
    return void 0;
  }
  return function(...args) {
    const result = methodFn.apply(changeTracker.copy_, args);
    if (methodName === `forEach`) {
      const callback = args[0];
      if (typeof callback === `function`) {
        const wrappedCallback = function(value, key, collection) {
          const cbresult = callback.call(this, value, key, collection);
          markChanged(changeTracker);
          return cbresult;
        };
        return methodFn.apply(target, [
          wrappedCallback,
          ...args.slice(1)
        ]);
      }
    }
    const isValueIterator = methodName === `entries` || methodName === `values` || methodName === Symbol.iterator.toString() || prop === Symbol.iterator;
    if (isValueIterator) {
      const originalIterator = result;
      const valueToKeyMap = /* @__PURE__ */ new Map();
      if (methodName === `values` && target instanceof Map) {
        for (const [key, mapValue] of changeTracker.copy_.entries()) {
          valueToKeyMap.set(mapValue, key);
        }
      }
      const originalToModifiedMap = /* @__PURE__ */ new Map();
      if (target instanceof Set) {
        for (const setValue of changeTracker.copy_.values()) {
          originalToModifiedMap.set(setValue, setValue);
        }
      }
      return {
        next() {
          const nextResult = originalIterator.next();
          if (!nextResult.done && nextResult.value && typeof nextResult.value === `object`) {
            if (methodName === `entries` && Array.isArray(nextResult.value) && nextResult.value.length === 2) {
              if (nextResult.value[1] && typeof nextResult.value[1] === `object`) {
                const mapKey = nextResult.value[0];
                const mapParent = {
                  tracker: changeTracker,
                  prop: mapKey,
                  updateMap: (newValue) => {
                    if (changeTracker.copy_ instanceof Map) {
                      changeTracker.copy_.set(mapKey, newValue);
                    }
                  }
                };
                const { proxy: valueProxy } = memoizedCreateChangeProxy(nextResult.value[1], mapParent);
                nextResult.value[1] = valueProxy;
              }
            } else if (methodName === `values` || methodName === Symbol.iterator.toString() || prop === Symbol.iterator) {
              if (methodName === `values` && target instanceof Map) {
                const mapKey = valueToKeyMap.get(nextResult.value);
                if (mapKey !== void 0) {
                  const mapParent = {
                    tracker: changeTracker,
                    prop: mapKey,
                    updateMap: (newValue) => {
                      if (changeTracker.copy_ instanceof Map) {
                        changeTracker.copy_.set(mapKey, newValue);
                      }
                    }
                  };
                  const { proxy: valueProxy } = memoizedCreateChangeProxy(nextResult.value, mapParent);
                  nextResult.value = valueProxy;
                }
              } else if (target instanceof Set) {
                const setOriginalValue = nextResult.value;
                const setParent = {
                  tracker: changeTracker,
                  prop: setOriginalValue,
                  updateSet: (newValue) => {
                    if (changeTracker.copy_ instanceof Set) {
                      changeTracker.copy_.delete(setOriginalValue);
                      changeTracker.copy_.add(newValue);
                      originalToModifiedMap.set(setOriginalValue, newValue);
                    }
                  }
                };
                const { proxy: valueProxy } = memoizedCreateChangeProxy(nextResult.value, setParent);
                nextResult.value = valueProxy;
              } else {
                const tempKey = /* @__PURE__ */ Symbol(`iterator-value`);
                const { proxy: valueProxy } = memoizedCreateChangeProxy(nextResult.value, {
                  tracker: changeTracker,
                  prop: tempKey
                });
                nextResult.value = valueProxy;
              }
            }
          }
          return nextResult;
        },
        [Symbol.iterator]() {
          return this;
        }
      };
    }
    return result;
  };
}
function debugLog(...args) {
  const isBrowser = typeof window !== `undefined` && typeof localStorage !== `undefined`;
  if (isBrowser && localStorage.getItem(`DEBUG`) === `true`) {
    console.log(`[proxy]`, ...args);
  } else if (
    // true
    !isBrowser && typeof process !== `undefined` && process.env.DEBUG === `true`
  ) {
    console.log(`[proxy]`, ...args);
  }
}
function deepClone(obj, visited = /* @__PURE__ */ new WeakMap()) {
  if (obj === null || obj === void 0) {
    return obj;
  }
  if (typeof obj !== `object`) {
    return obj;
  }
  if (visited.has(obj)) {
    return visited.get(obj);
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags);
  }
  if (Array.isArray(obj)) {
    const arrayClone = [];
    visited.set(obj, arrayClone);
    obj.forEach((item, index) => {
      arrayClone[index] = deepClone(item, visited);
    });
    return arrayClone;
  }
  if (ArrayBuffer.isView(obj) && !(obj instanceof DataView)) {
    const TypedArrayConstructor = Object.getPrototypeOf(obj).constructor;
    const clone2 = new TypedArrayConstructor(obj.length);
    visited.set(obj, clone2);
    for (let i = 0; i < obj.length; i++) {
      clone2[i] = obj[i];
    }
    return clone2;
  }
  if (obj instanceof Map) {
    const clone2 = /* @__PURE__ */ new Map();
    visited.set(obj, clone2);
    obj.forEach((value, key) => {
      clone2.set(key, deepClone(value, visited));
    });
    return clone2;
  }
  if (obj instanceof Set) {
    const clone2 = /* @__PURE__ */ new Set();
    visited.set(obj, clone2);
    obj.forEach((value) => {
      clone2.add(deepClone(value, visited));
    });
    return clone2;
  }
  if (isTemporal(obj)) {
    return obj;
  }
  const clone = {};
  visited.set(obj, clone);
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepClone(obj[key], visited);
    }
  }
  const symbolProps = Object.getOwnPropertySymbols(obj);
  for (const sym of symbolProps) {
    clone[sym] = deepClone(obj[sym], visited);
  }
  return clone;
}
var count4 = 0;
function getProxyCount() {
  count4 += 1;
  return count4;
}
function createChangeProxy(target, parent) {
  const changeProxyCache = /* @__PURE__ */ new Map();
  function memoizedCreateChangeProxy(innerTarget, innerParent) {
    debugLog(`Object ID:`, innerTarget.constructor.name);
    if (changeProxyCache.has(innerTarget)) {
      return changeProxyCache.get(innerTarget);
    } else {
      const changeProxy = createChangeProxy(innerTarget, innerParent);
      changeProxyCache.set(innerTarget, changeProxy);
      return changeProxy;
    }
  }
  const proxyCache = /* @__PURE__ */ new Map();
  const changeTracker = {
    copy_: deepClone(target),
    originalObject: deepClone(target),
    proxyCount: getProxyCount(),
    modified: false,
    assigned_: {},
    parent,
    target
  };
  debugLog(`createChangeProxy called for target`, target, changeTracker.proxyCount);
  function markChanged(state) {
    if (!state.modified) {
      state.modified = true;
    }
    if (state.parent) {
      debugLog(`propagating change to parent`);
      if (`updateMap` in state.parent) {
        state.parent.updateMap(state.copy_);
      } else if (`updateSet` in state.parent) {
        state.parent.updateSet(state.copy_);
      } else {
        state.parent.tracker.copy_[state.parent.prop] = state.copy_;
        state.parent.tracker.assigned_[state.parent.prop] = true;
      }
      markChanged(state.parent.tracker);
    }
  }
  function checkIfReverted(state) {
    debugLog(`checkIfReverted called with assigned keys:`, Object.keys(state.assigned_));
    if (Object.keys(state.assigned_).length === 0 && Object.getOwnPropertySymbols(state.assigned_).length === 0) {
      debugLog(`No assigned properties, returning true`);
      return true;
    }
    for (const prop in state.assigned_) {
      if (state.assigned_[prop] === true) {
        const currentValue = state.copy_[prop];
        const originalValue = state.originalObject[prop];
        debugLog(`Checking property ${String(prop)}, current:`, currentValue, `original:`, originalValue);
        if (!deepEquals(currentValue, originalValue)) {
          debugLog(`Property ${String(prop)} is different, returning false`);
          return false;
        }
      } else if (state.assigned_[prop] === false) {
        debugLog(`Property ${String(prop)} was deleted, returning false`);
        return false;
      }
    }
    const symbolProps = Object.getOwnPropertySymbols(state.assigned_);
    for (const sym of symbolProps) {
      if (state.assigned_[sym] === true) {
        const currentValue = state.copy_[sym];
        const originalValue = state.originalObject[sym];
        if (!deepEquals(currentValue, originalValue)) {
          debugLog(`Symbol property is different, returning false`);
          return false;
        }
      } else if (state.assigned_[sym] === false) {
        debugLog(`Symbol property was deleted, returning false`);
        return false;
      }
    }
    debugLog(`All properties match original values, returning true`);
    return true;
  }
  function checkParentStatus(parentState, childProp) {
    debugLog(`checkParentStatus called for child prop:`, childProp);
    const isReverted = checkIfReverted(parentState);
    debugLog(`Parent checkIfReverted returned:`, isReverted);
    if (isReverted) {
      debugLog(`Parent is fully reverted, clearing tracking`);
      parentState.modified = false;
      parentState.assigned_ = {};
      if (parentState.parent) {
        debugLog(`Continuing up the parent chain`);
        checkParentStatus(parentState.parent.tracker, parentState.parent.prop);
      }
    }
  }
  function createObjectProxy(obj) {
    debugLog(`createObjectProxy`, obj);
    if (proxyCache.has(obj)) {
      debugLog(`proxyCache found match`);
      return proxyCache.get(obj);
    }
    const proxy2 = new Proxy(obj, {
      get(ptarget, prop) {
        debugLog(`get`, ptarget, prop);
        const value = changeTracker.copy_[prop] ?? changeTracker.originalObject[prop];
        const originalValue = changeTracker.originalObject[prop];
        debugLog(`value (at top of proxy get)`, value);
        const desc = Object.getOwnPropertyDescriptor(ptarget, prop);
        if (desc?.get) {
          return value;
        }
        if (typeof value === `function`) {
          if (Array.isArray(ptarget)) {
            const methodName = prop.toString();
            if (ARRAY_MODIFYING_METHODS.has(methodName)) {
              return createModifyingMethodHandler(value, changeTracker, markChanged);
            }
            const iterationHandler = createArrayIterationHandler(methodName, value, changeTracker, memoizedCreateChangeProxy);
            if (iterationHandler) {
              return iterationHandler;
            }
            if (prop === Symbol.iterator) {
              return createArrayIteratorHandler(changeTracker, memoizedCreateChangeProxy);
            }
          }
          if (ptarget instanceof Map || ptarget instanceof Set) {
            const methodName = prop.toString();
            if (MAP_SET_MODIFYING_METHODS.has(methodName)) {
              return createModifyingMethodHandler(value, changeTracker, markChanged);
            }
            const iteratorHandler = createMapSetIteratorHandler(methodName, prop, value, ptarget, changeTracker, memoizedCreateChangeProxy, markChanged);
            if (iteratorHandler) {
              return iteratorHandler;
            }
          }
          return value.bind(ptarget);
        }
        if (isProxiableObject(value)) {
          const nestedParent = {
            tracker: changeTracker,
            prop: String(prop)
          };
          const { proxy: nestedProxy } = memoizedCreateChangeProxy(originalValue, nestedParent);
          proxyCache.set(value, nestedProxy);
          return nestedProxy;
        }
        return value;
      },
      set(_sobj, prop, value) {
        const currentValue = changeTracker.copy_[prop];
        debugLog(`set called for property ${String(prop)}, current:`, currentValue, `new:`, value);
        if (!deepEquals(currentValue, value)) {
          const originalValue = changeTracker.originalObject[prop];
          const isRevertToOriginal = deepEquals(value, originalValue);
          debugLog(`value:`, value, `original:`, originalValue, `isRevertToOriginal:`, isRevertToOriginal);
          if (isRevertToOriginal) {
            debugLog(`Reverting property ${String(prop)} to original value`);
            delete changeTracker.assigned_[prop.toString()];
            debugLog(`Updating copy with original value for ${String(prop)}`);
            changeTracker.copy_[prop] = deepClone(originalValue);
            debugLog(`Checking if all properties reverted`);
            const allReverted = checkIfReverted(changeTracker);
            debugLog(`All reverted:`, allReverted);
            if (allReverted) {
              debugLog(`All properties reverted, clearing tracking`);
              changeTracker.modified = false;
              changeTracker.assigned_ = {};
              if (parent) {
                debugLog(`Updating parent for property:`, parent.prop);
                checkParentStatus(parent.tracker, parent.prop);
              }
            } else {
              debugLog(`Some properties still changed, keeping modified flag`);
              changeTracker.modified = true;
            }
          } else {
            debugLog(`Setting new value for property ${String(prop)}`);
            changeTracker.copy_[prop] = value;
            changeTracker.assigned_[prop.toString()] = true;
            debugLog(`Marking object and ancestors as modified`, changeTracker);
            markChanged(changeTracker);
          }
        } else {
          debugLog(`Value unchanged, not tracking`);
        }
        return true;
      },
      defineProperty(ptarget, prop, descriptor) {
        const result = Reflect.defineProperty(ptarget, prop, descriptor);
        if (result && `value` in descriptor) {
          changeTracker.copy_[prop] = deepClone(descriptor.value);
          changeTracker.assigned_[prop.toString()] = true;
          markChanged(changeTracker);
        }
        return result;
      },
      getOwnPropertyDescriptor(ptarget, prop) {
        return Reflect.getOwnPropertyDescriptor(ptarget, prop);
      },
      preventExtensions(ptarget) {
        return Reflect.preventExtensions(ptarget);
      },
      isExtensible(ptarget) {
        return Reflect.isExtensible(ptarget);
      },
      deleteProperty(dobj, prop) {
        debugLog(`deleteProperty`, dobj, prop);
        const stringProp = typeof prop === `symbol` ? prop.toString() : prop;
        if (stringProp in dobj) {
          const hadPropertyInOriginal = stringProp in changeTracker.originalObject;
          const result = Reflect.deleteProperty(dobj, prop);
          if (result) {
            if (!hadPropertyInOriginal) {
              delete changeTracker.assigned_[stringProp];
              if (Object.keys(changeTracker.assigned_).length === 0 && Object.getOwnPropertySymbols(changeTracker.assigned_).length === 0) {
                changeTracker.modified = false;
              } else {
                changeTracker.modified = true;
              }
            } else {
              changeTracker.assigned_[stringProp] = false;
              markChanged(changeTracker);
            }
          }
          return result;
        }
        return true;
      }
    });
    proxyCache.set(obj, proxy2);
    return proxy2;
  }
  const proxy = createObjectProxy(changeTracker.copy_);
  return {
    proxy,
    getChanges: () => {
      debugLog(`getChanges called, modified:`, changeTracker.modified);
      debugLog(changeTracker);
      if (!changeTracker.modified) {
        debugLog(`Object not modified, returning empty object`);
        return {};
      }
      if (typeof changeTracker.copy_ !== `object` || Array.isArray(changeTracker.copy_)) {
        return changeTracker.copy_;
      }
      if (Object.keys(changeTracker.assigned_).length === 0) {
        return changeTracker.copy_;
      }
      const result = {};
      for (const key in changeTracker.copy_) {
        if (changeTracker.assigned_[key] === true && key in changeTracker.copy_) {
          result[key] = changeTracker.copy_[key];
        }
      }
      debugLog(`Returning copy:`, result);
      return result;
    }
  };
}
function createArrayChangeProxy(targets) {
  const proxiesWithChanges = targets.map((target) => createChangeProxy(target));
  return {
    proxies: proxiesWithChanges.map((p) => p.proxy),
    getChanges: () => proxiesWithChanges.map((p) => p.getChanges())
  };
}
function withChangeTracking(target, callback) {
  const { proxy, getChanges } = createChangeProxy(target);
  callback(proxy);
  return getChanges();
}
function withArrayChangeTracking(targets, callback) {
  const { proxies, getChanges } = createArrayChangeProxy(targets);
  callback(proxies);
  return getChanges();
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/deferred.js
function createDeferred() {
  let resolve;
  let reject;
  let isPending = true;
  const promise = new Promise((res, rej) => {
    resolve = (value) => {
      isPending = false;
      res(value);
    };
    reject = (reason) => {
      isPending = false;
      rej(reason);
    };
  });
  return {
    promise,
    resolve,
    reject,
    isPending: () => isPending
  };
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/scheduler.js
function isPendingAwareJob(dep) {
  return typeof dep === `object` && dep !== null && typeof dep.hasPendingGraphRun === `function`;
}
var Scheduler = class {
  constructor() {
    this.contexts = /* @__PURE__ */ new Map();
    this.clearListeners = /* @__PURE__ */ new Set();
  }
  /**
   * Get or create the state bucket for a context.
   */
  getOrCreateContext(contextId) {
    let context = this.contexts.get(contextId);
    if (!context) {
      context = {
        queue: [],
        jobs: /* @__PURE__ */ new Map(),
        dependencies: /* @__PURE__ */ new Map(),
        completed: /* @__PURE__ */ new Set()
      };
      this.contexts.set(contextId, context);
    }
    return context;
  }
  /**
   * Schedule work. Without a context id, executes immediately.
   * Otherwise queues the job to be flushed once dependencies are satisfied.
   * Scheduling the same jobId again replaces the previous run function.
   */
  schedule({ contextId, jobId, dependencies, run }) {
    if (typeof contextId === `undefined`) {
      run();
      return;
    }
    const context = this.getOrCreateContext(contextId);
    if (!context.jobs.has(jobId)) {
      context.queue.push(jobId);
    }
    context.jobs.set(jobId, run);
    if (dependencies) {
      const depSet = new Set(dependencies);
      depSet.delete(jobId);
      context.dependencies.set(jobId, depSet);
    } else if (!context.dependencies.has(jobId)) {
      context.dependencies.set(jobId, /* @__PURE__ */ new Set());
    }
    context.completed.delete(jobId);
  }
  /**
   * Flush all queued work for a context. Jobs with unmet dependencies are retried.
   * Throws if a pass completes without running any job (dependency cycle).
   */
  flush(contextId) {
    const context = this.contexts.get(contextId);
    if (!context) return;
    const { queue, jobs, dependencies, completed } = context;
    while (queue.length > 0) {
      let ranThisPass = false;
      const jobsThisPass = queue.length;
      for (let i = 0; i < jobsThisPass; i++) {
        const jobId = queue.shift();
        const run = jobs.get(jobId);
        if (!run) {
          dependencies.delete(jobId);
          completed.delete(jobId);
          continue;
        }
        const deps = dependencies.get(jobId);
        let ready = !deps;
        if (deps) {
          ready = true;
          for (const dep of deps) {
            if (dep === jobId) continue;
            const depHasPending = isPendingAwareJob(dep) && dep.hasPendingGraphRun(contextId);
            if (jobs.has(dep) && !completed.has(dep) || !jobs.has(dep) && depHasPending) {
              ready = false;
              break;
            }
          }
        }
        if (ready) {
          jobs.delete(jobId);
          dependencies.delete(jobId);
          run();
          completed.add(jobId);
          ranThisPass = true;
        } else {
          queue.push(jobId);
        }
      }
      if (!ranThisPass) {
        throw new Error(`Scheduler detected unresolved dependencies for context ${String(contextId)}.`);
      }
    }
    this.contexts.delete(contextId);
  }
  /**
   * Flush all contexts with pending work. Useful during tear-down.
   */
  flushAll() {
    for (const contextId of Array.from(this.contexts.keys())) {
      this.flush(contextId);
    }
  }
  /** Clear all scheduled jobs for a context. */
  clear(contextId) {
    this.contexts.delete(contextId);
    this.clearListeners.forEach((listener) => listener(contextId));
  }
  /** Register a listener to be notified when a context is cleared. */
  onClear(listener) {
    this.clearListeners.add(listener);
    return () => this.clearListeners.delete(listener);
  }
  /** Check if a context has pending jobs. */
  hasPendingJobs(contextId) {
    const context = this.contexts.get(contextId);
    return !!context && context.jobs.size > 0;
  }
  /** Remove a single job from a context and clean up its dependencies. */
  clearJob(contextId, jobId) {
    const context = this.contexts.get(contextId);
    if (!context) return;
    context.jobs.delete(jobId);
    context.dependencies.delete(jobId);
    context.completed.delete(jobId);
    context.queue = context.queue.filter((id) => id !== jobId);
    if (context.jobs.size === 0) {
      this.contexts.delete(contextId);
    }
  }
};
var transactionScopedScheduler = new Scheduler();

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/transactions.js
var transactions = [];
var transactionStack = [];
var sequenceNumber = 0;
function mergePendingMutations(existing, incoming) {
  switch (`${existing.type}-${incoming.type}`) {
    case `insert-update`: {
      return {
        ...existing,
        type: `insert`,
        original: {},
        modified: incoming.modified,
        changes: {
          ...existing.changes,
          ...incoming.changes
        },
        // Keep existing keys (key changes not allowed in updates)
        key: existing.key,
        globalKey: existing.globalKey,
        // Merge metadata (last-write-wins)
        metadata: incoming.metadata ?? existing.metadata,
        syncMetadata: {
          ...existing.syncMetadata,
          ...incoming.syncMetadata
        },
        // Update tracking info
        mutationId: incoming.mutationId,
        updatedAt: incoming.updatedAt
      };
    }
    case `insert-delete`:
      return null;
    case `update-delete`:
      return incoming;
    case `update-update`: {
      return {
        ...incoming,
        // Keep original from first update
        original: existing.original,
        // Union the changes from both updates
        changes: {
          ...existing.changes,
          ...incoming.changes
        },
        // Merge metadata
        metadata: incoming.metadata ?? existing.metadata,
        syncMetadata: {
          ...existing.syncMetadata,
          ...incoming.syncMetadata
        }
      };
    }
    case `delete-delete`:
    case `insert-insert`:
      return incoming;
    default: {
      const _exhaustive = `${existing.type}-${incoming.type}`;
      throw new Error(`Unhandled mutation combination: ${_exhaustive}`);
    }
  }
}
function createTransaction(config) {
  const newTransaction = new Transaction(config);
  transactions.push(newTransaction);
  return newTransaction;
}
function getActiveTransaction() {
  if (transactionStack.length > 0) {
    return transactionStack.slice(-1)[0];
  } else {
    return void 0;
  }
}
function registerTransaction(tx) {
  transactionScopedScheduler.clear(tx.id);
  transactionStack.push(tx);
}
function unregisterTransaction(tx) {
  try {
    transactionScopedScheduler.flush(tx.id);
  } finally {
    transactionStack = transactionStack.filter((t) => t.id !== tx.id);
  }
}
function removeFromPendingList(tx) {
  const index = transactions.findIndex((t) => t.id === tx.id);
  if (index !== -1) {
    transactions.splice(index, 1);
  }
}
var Transaction = class {
  constructor(config) {
    if (typeof config.mutationFn === `undefined`) {
      throw new MissingMutationFunctionError();
    }
    this.id = config.id ?? safeRandomUUID();
    this.mutationFn = config.mutationFn;
    this.state = `pending`;
    this.mutations = [];
    this.isPersisted = createDeferred();
    this.autoCommit = config.autoCommit ?? true;
    this.createdAt = /* @__PURE__ */ new Date();
    this.sequenceNumber = sequenceNumber++;
    this.metadata = config.metadata ?? {};
  }
  setState(newState) {
    this.state = newState;
    if (newState === `completed` || newState === `failed`) {
      removeFromPendingList(this);
    }
  }
  /**
   * Execute collection operations within this transaction
   * @param callback - Synchronous function containing collection operations to group together.
   * The transaction context is active only for the synchronous duration of this callback.
   * Async work should happen in `mutationFn`; collection operations after `await` boundaries
   * inside this callback will not be part of this transaction. For manual transactions, call
   * `mutate` multiple times before committing to add more synchronous operations to the same
   * transaction.
   * @returns This transaction for chaining
   * @example
   * // Group multiple operations
   * const tx = createTransaction({ mutationFn: async () => {
   *   // Send to API
   * }})
   *
   * tx.mutate(() => {
   *   collection.insert({ id: "1", text: "Buy milk" })
   *   collection.update("2", draft => { draft.completed = true })
   *   collection.delete("3")
   * })
   *
   * await tx.isPersisted.promise
   *
   * @example
   * // Handle mutate errors
   * try {
   *   tx.mutate(() => {
   *     collection.insert({ id: "invalid" }) // This might throw
   *   })
   * } catch (error) {
   *   console.log('Mutation failed:', error)
   * }
   *
   * @example
   * // Manual commit control
   * const tx = createTransaction({ autoCommit: false, mutationFn: async () => {} })
   *
   * tx.mutate(() => {
   *   collection.insert({ id: "1", text: "Item" })
   * })
   *
   * // Add more synchronous mutations to the same transaction
   * tx.mutate(() => {
   *   collection.update("1", draft => { draft.text = "Updated item" })
   * })
   *
   * // Commit later when ready
   * await tx.commit()
   */
  mutate(callback) {
    if (this.state !== `pending`) {
      throw new TransactionNotPendingMutateError();
    }
    registerTransaction(this);
    try {
      callback();
    } finally {
      unregisterTransaction(this);
    }
    if (this.autoCommit) {
      this.commit().catch(() => {
      });
    }
    return this;
  }
  /**
   * Apply new mutations to this transaction, intelligently merging with existing mutations
   *
   * When mutations operate on the same item (same globalKey), they are merged according to
   * the following rules:
   *
   * - **insert + update** → insert (merge changes, keep empty original)
   * - **insert + delete** → removed (mutations cancel each other out)
   * - **update + delete** → delete (delete dominates)
   * - **update + update** → update (union changes, keep first original)
   * - **same type** → replace with latest
   *
   * This merging reduces over-the-wire churn and keeps the optimistic local view
   * aligned with user intent.
   *
   * @param mutations - Array of new mutations to apply
   */
  applyMutations(mutations) {
    const merged = /* @__PURE__ */ new Map();
    for (const mutation of this.mutations) {
      merged.set(mutation.globalKey, mutation);
    }
    for (const newMutation of mutations) {
      const existingMutation = merged.get(newMutation.globalKey);
      if (existingMutation) {
        const mergeResult = mergePendingMutations(existingMutation, newMutation);
        if (mergeResult === null) {
          merged.delete(newMutation.globalKey);
        } else {
          merged.set(newMutation.globalKey, mergeResult);
        }
      } else {
        merged.set(newMutation.globalKey, newMutation);
      }
    }
    this.mutations.length = 0;
    for (const mutation of merged.values()) {
      this.mutations.push(mutation);
    }
  }
  /**
   * Rollback the transaction and any conflicting transactions
   * @param config - Configuration for rollback behavior
   * @returns This transaction for chaining
   * @example
   * // Manual rollback
   * const tx = createTransaction({ mutationFn: async () => {
   *   // Send to API
   * }})
   *
   * tx.mutate(() => {
   *   collection.insert({ id: "1", text: "Buy milk" })
   * })
   *
   * // Rollback if needed
   * if (shouldCancel) {
   *   tx.rollback()
   * }
   *
   * @example
   * // Handle rollback cascade (automatic)
   * const tx1 = createTransaction({ mutationFn: async () => {} })
   * const tx2 = createTransaction({ mutationFn: async () => {} })
   *
   * tx1.mutate(() => collection.update("1", draft => { draft.value = "A" }))
   * tx2.mutate(() => collection.update("1", draft => { draft.value = "B" })) // Same item
   *
   * tx1.rollback() // This will also rollback tx2 due to conflict
   *
   * @example
   * // Handle rollback in error scenarios
   * try {
   *   await tx.isPersisted.promise
   * } catch (error) {
   *   console.log('Transaction was rolled back:', error)
   *   // Transaction automatically rolled back on mutation function failure
   * }
   */
  rollback(config) {
    const isSecondaryRollback = config?.isSecondaryRollback ?? false;
    if (this.state === `completed`) {
      throw new TransactionAlreadyCompletedRollbackError();
    }
    this.setState(`failed`);
    if (!isSecondaryRollback) {
      const mutationIds = /* @__PURE__ */ new Set();
      this.mutations.forEach((m) => mutationIds.add(m.globalKey));
      for (const t of transactions) {
        t.state === `pending` && t.mutations.some((m) => mutationIds.has(m.globalKey)) && t.rollback({
          isSecondaryRollback: true
        });
      }
    }
    this.isPersisted.reject(this.error?.error);
    this.touchCollection();
    return this;
  }
  // Tell collection that something has changed with the transaction
  touchCollection() {
    const hasCalled = /* @__PURE__ */ new Set();
    for (const mutation of this.mutations) {
      if (!hasCalled.has(mutation.collection.id)) {
        mutation.collection._state.onTransactionStateChange();
        if (mutation.collection._state.pendingSyncedTransactions.length > 0) {
          mutation.collection._state.commitPendingTransactions();
        }
        hasCalled.add(mutation.collection.id);
      }
    }
  }
  /**
   * Commit the transaction and execute the mutation function
   * @returns Promise that resolves to this transaction when complete
   * @example
   * // Manual commit (when autoCommit is false)
   * const tx = createTransaction({
   *   autoCommit: false,
   *   mutationFn: async ({ transaction }) => {
   *     await api.saveChanges(transaction.mutations)
   *   }
   * })
   *
   * tx.mutate(() => {
   *   collection.insert({ id: "1", text: "Buy milk" })
   * })
   *
   * await tx.commit() // Manually commit
   *
   * @example
   * // Handle commit errors
   * try {
   *   const tx = createTransaction({
   *     mutationFn: async () => { throw new Error("API failed") }
   *   })
   *
   *   tx.mutate(() => {
   *     collection.insert({ id: "1", text: "Item" })
   *   })
   *
   *   await tx.commit()
   * } catch (error) {
   *   console.log('Commit failed, transaction rolled back:', error)
   * }
   *
   * @example
   * // Check transaction state after commit
   * await tx.commit()
   * console.log(tx.state) // "completed" or "failed"
   */
  async commit() {
    if (this.state !== `pending`) {
      throw new TransactionNotPendingCommitError();
    }
    this.setState(`persisting`);
    if (this.mutations.length === 0) {
      this.setState(`completed`);
      this.isPersisted.resolve(this);
      return this;
    }
    try {
      await this.mutationFn({
        transaction: this
      });
      this.setState(`completed`);
      this.touchCollection();
      this.isPersisted.resolve(this);
    } catch (error) {
      const originalError = error instanceof Error ? error : new Error(String(error));
      this.error = {
        message: originalError.message,
        error: originalError
      };
      this.rollback();
      throw originalError;
    }
    return this;
  }
  /**
   * Compare two transactions by their createdAt time and sequence number in order
   * to sort them in the order they were created.
   * @param other - The other transaction to compare to
   * @returns -1 if this transaction was created before the other, 1 if it was created after, 0 if they were created at the same time
   */
  compareCreatedAt(other) {
    const createdAtComparison = this.createdAt.getTime() - other.createdAt.getTime();
    if (createdAtComparison !== 0) {
      return createdAtComparison;
    }
    return this.sequenceNumber - other.sequenceNumber;
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/collection/mutations.js
var CollectionMutationsManager = class {
  constructor(config, id) {
    this.insert = (data, config2) => {
      this.lifecycle.validateCollectionUsable(`insert`);
      const state = this.state;
      const ambientTransaction = getActiveTransaction();
      if (!ambientTransaction && !this.config.onInsert) {
        throw new MissingInsertHandlerError();
      }
      const items = Array.isArray(data) ? data : [
        data
      ];
      const mutations = [];
      const keysInCurrentBatch = /* @__PURE__ */ new Set();
      items.forEach((item) => {
        const validatedData = this.validateData(item, `insert`);
        const key = this.config.getKey(validatedData);
        if (this.state.has(key) || keysInCurrentBatch.has(key)) {
          throw new DuplicateKeyError(key);
        }
        keysInCurrentBatch.add(key);
        const globalKey = this.generateGlobalKey(key, item);
        const mutation = {
          mutationId: safeRandomUUID(),
          original: {},
          modified: validatedData,
          // Pick the values from validatedData based on what's passed in - this is for cases
          // where a schema has default values. The validated data has the extra default
          // values but for changes, we just want to show the data that was actually passed in.
          changes: Object.fromEntries(Object.keys(item).map((k) => [
            k,
            validatedData[k]
          ])),
          globalKey,
          key,
          metadata: config2?.metadata,
          syncMetadata: this.config.sync.getSyncMetadata?.() || {},
          optimistic: config2?.optimistic ?? true,
          type: `insert`,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date(),
          collection: this.collection
        };
        mutations.push(mutation);
      });
      if (ambientTransaction) {
        ambientTransaction.applyMutations(mutations);
        state.transactions.set(ambientTransaction.id, ambientTransaction);
        state.scheduleTransactionCleanup(ambientTransaction);
        state.recomputeOptimisticState(true);
        return ambientTransaction;
      } else {
        const directOpTransaction = createTransaction({
          metadata: {
            [DIRECT_TRANSACTION_METADATA_KEY]: true
          },
          mutationFn: async (params) => {
            return await this.config.onInsert({
              transaction: params.transaction,
              collection: this.collection
            });
          }
        });
        directOpTransaction.applyMutations(mutations);
        this.markPendingLocalOrigins(mutations);
        directOpTransaction.commit().catch(() => void 0);
        state.transactions.set(directOpTransaction.id, directOpTransaction);
        state.scheduleTransactionCleanup(directOpTransaction);
        state.recomputeOptimisticState(true);
        return directOpTransaction;
      }
    };
    this.delete = (keys, config2) => {
      const state = this.state;
      this.lifecycle.validateCollectionUsable(`delete`);
      const ambientTransaction = getActiveTransaction();
      if (!ambientTransaction && !this.config.onDelete) {
        throw new MissingDeleteHandlerError();
      }
      if (Array.isArray(keys) && keys.length === 0) {
        throw new NoKeysPassedToDeleteError();
      }
      const keysArray = Array.isArray(keys) ? keys : [
        keys
      ];
      const mutations = [];
      for (const key of keysArray) {
        if (!this.state.has(key)) {
          throw new DeleteKeyNotFoundError(key);
        }
        const globalKey = this.generateGlobalKey(key, this.state.get(key));
        const mutation = {
          mutationId: safeRandomUUID(),
          original: this.state.get(key),
          modified: this.state.get(key),
          changes: this.state.get(key),
          globalKey,
          key,
          metadata: config2?.metadata,
          syncMetadata: state.syncedMetadata.get(key) || {},
          optimistic: config2?.optimistic ?? true,
          type: `delete`,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date(),
          collection: this.collection
        };
        mutations.push(mutation);
      }
      if (ambientTransaction) {
        ambientTransaction.applyMutations(mutations);
        state.transactions.set(ambientTransaction.id, ambientTransaction);
        state.scheduleTransactionCleanup(ambientTransaction);
        state.recomputeOptimisticState(true);
        return ambientTransaction;
      }
      const directOpTransaction = createTransaction({
        autoCommit: true,
        metadata: {
          [DIRECT_TRANSACTION_METADATA_KEY]: true
        },
        mutationFn: async (params) => {
          return this.config.onDelete({
            transaction: params.transaction,
            collection: this.collection
          });
        }
      });
      directOpTransaction.applyMutations(mutations);
      this.markPendingLocalOrigins(mutations);
      directOpTransaction.commit().catch(() => void 0);
      state.transactions.set(directOpTransaction.id, directOpTransaction);
      state.scheduleTransactionCleanup(directOpTransaction);
      state.recomputeOptimisticState(true);
      return directOpTransaction;
    };
    this.id = id;
    this.config = config;
  }
  setDeps(deps) {
    this.lifecycle = deps.lifecycle;
    this.state = deps.state;
    this.collection = deps.collection;
  }
  ensureStandardSchema(schema) {
    if (schema && `~standard` in schema) {
      return schema;
    }
    throw new InvalidSchemaError();
  }
  validateData(data, type, key) {
    if (!this.config.schema) return data;
    const standardSchema = this.ensureStandardSchema(this.config.schema);
    if (type === `update` && key) {
      const existingData = this.state.get(key);
      if (existingData && data && typeof data === `object` && typeof existingData === `object`) {
        const mergedData = Object.assign({}, existingData, data);
        const result2 = standardSchema[`~standard`].validate(mergedData);
        if (result2 instanceof Promise) {
          throw new SchemaMustBeSynchronousError();
        }
        if (`issues` in result2 && result2.issues) {
          const typedIssues = result2.issues.map((issue) => ({
            message: issue.message,
            path: issue.path?.map((p) => String(p))
          }));
          throw new SchemaValidationError(type, typedIssues);
        }
        const validatedMergedData = result2.value;
        const modifiedKeys = Object.keys(data);
        const extractedChanges = Object.fromEntries(modifiedKeys.map((k) => [
          k,
          validatedMergedData[k]
        ]));
        return extractedChanges;
      }
    }
    const result = standardSchema[`~standard`].validate(data);
    if (result instanceof Promise) {
      throw new SchemaMustBeSynchronousError();
    }
    if (`issues` in result && result.issues) {
      const typedIssues = result.issues.map((issue) => ({
        message: issue.message,
        path: issue.path?.map((p) => String(p))
      }));
      throw new SchemaValidationError(type, typedIssues);
    }
    return result.value;
  }
  generateGlobalKey(key, item) {
    if (typeof key !== `string` && typeof key !== `number`) {
      if (typeof key === `undefined`) {
        throw new UndefinedKeyError(item);
      }
      throw new InvalidKeyError(key, item);
    }
    return `KEY::${this.id}/${key}`;
  }
  markPendingLocalOrigins(mutations) {
    for (const mutation of mutations) {
      this.state.pendingLocalOrigins.add(mutation.key);
    }
  }
  /**
   * Updates one or more items in the collection using a callback function
   */
  update(keys, configOrCallback, maybeCallback) {
    if (typeof keys === `undefined`) {
      throw new MissingUpdateArgumentError();
    }
    const state = this.state;
    this.lifecycle.validateCollectionUsable(`update`);
    const ambientTransaction = getActiveTransaction();
    if (!ambientTransaction && !this.config.onUpdate) {
      throw new MissingUpdateHandlerError();
    }
    const isArray = Array.isArray(keys);
    const keysArray = isArray ? keys : [
      keys
    ];
    if (isArray && keysArray.length === 0) {
      throw new NoKeysPassedToUpdateError();
    }
    const callback = typeof configOrCallback === `function` ? configOrCallback : maybeCallback;
    const config = typeof configOrCallback === `function` ? {} : configOrCallback;
    const currentObjects = keysArray.map((key) => {
      const item = this.state.get(key);
      if (!item) {
        throw new UpdateKeyNotFoundError(key);
      }
      return item;
    });
    let changesArray;
    if (isArray) {
      changesArray = withArrayChangeTracking(currentObjects, callback);
    } else {
      const result = withChangeTracking(currentObjects[0], callback);
      changesArray = [
        result
      ];
    }
    const mutations = keysArray.map((key, index) => {
      const itemChanges = changesArray[index];
      if (!itemChanges || Object.keys(itemChanges).length === 0) {
        return null;
      }
      const originalItem = currentObjects[index];
      const validatedUpdatePayload = this.validateData(itemChanges, `update`, key);
      const modifiedItem = Object.assign({}, originalItem, validatedUpdatePayload);
      const originalItemId = this.config.getKey(originalItem);
      const modifiedItemId = this.config.getKey(modifiedItem);
      if (originalItemId !== modifiedItemId) {
        throw new KeyUpdateNotAllowedError(originalItemId, modifiedItemId);
      }
      const globalKey = this.generateGlobalKey(modifiedItemId, modifiedItem);
      return {
        mutationId: safeRandomUUID(),
        original: originalItem,
        modified: modifiedItem,
        // Pick the values from modifiedItem based on what's passed in - this is for cases
        // where a schema has default values or transforms. The modified data has the extra
        // default or transformed values but for changes, we just want to show the data that
        // was actually passed in.
        changes: Object.fromEntries(Object.keys(itemChanges).map((k) => [
          k,
          modifiedItem[k]
        ])),
        globalKey,
        key,
        metadata: config.metadata,
        syncMetadata: state.syncedMetadata.get(key) || {},
        optimistic: config.optimistic ?? true,
        type: `update`,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        collection: this.collection
      };
    }).filter(Boolean);
    if (mutations.length === 0) {
      const emptyTransaction = createTransaction({
        mutationFn: async () => {
        }
      });
      emptyTransaction.commit().catch(() => void 0);
      state.scheduleTransactionCleanup(emptyTransaction);
      return emptyTransaction;
    }
    if (ambientTransaction) {
      ambientTransaction.applyMutations(mutations);
      state.transactions.set(ambientTransaction.id, ambientTransaction);
      state.scheduleTransactionCleanup(ambientTransaction);
      state.recomputeOptimisticState(true);
      return ambientTransaction;
    }
    const directOpTransaction = createTransaction({
      metadata: {
        [DIRECT_TRANSACTION_METADATA_KEY]: true
      },
      mutationFn: async (params) => {
        return this.config.onUpdate({
          transaction: params.transaction,
          collection: this.collection
        });
      }
    });
    directOpTransaction.applyMutations(mutations);
    this.markPendingLocalOrigins(mutations);
    directOpTransaction.commit().catch(() => void 0);
    state.transactions.set(directOpTransaction.id, directOpTransaction);
    state.scheduleTransactionCleanup(directOpTransaction);
    state.recomputeOptimisticState(true);
    return directOpTransaction;
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/collection/events.js
var CollectionEventsManager = class extends EventEmitter {
  constructor() {
    super();
  }
  setDeps(deps) {
    this.collection = deps.collection;
  }
  /**
   * Emit an event to all listeners
   * Public API for emitting collection events
   */
  emit(event, eventPayload) {
    this.emitInner(event, eventPayload);
  }
  emitStatusChange(status, previousStatus) {
    this.emit(`status:change`, {
      type: `status:change`,
      collection: this.collection,
      previousStatus,
      status
    });
    const eventKey = `status:${status}`;
    this.emit(eventKey, {
      type: eventKey,
      collection: this.collection,
      previousStatus,
      status
    });
  }
  emitSubscribersChange(subscriberCount, previousSubscriberCount) {
    this.emit(`subscribers:change`, {
      type: `subscribers:change`,
      collection: this.collection,
      previousSubscriberCount,
      subscriberCount
    });
  }
  emitIndexAdded(index) {
    this.emit(`index:added`, {
      type: `index:added`,
      collection: this.collection,
      index
    });
  }
  emitIndexRemoved(index) {
    this.emit(`index:removed`, {
      type: `index:removed`,
      collection: this.collection,
      index
    });
  }
  cleanup() {
    this.clearListeners();
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/collection/index.js
function createCollection(options) {
  const collection = new CollectionImpl(options);
  if (options.utils) {
    collection.utils = options.utils;
  } else {
    collection.utils = {};
  }
  return collection;
}
var CollectionImpl = class {
  /**
   * Creates a new Collection instance
   *
   * @param config - Configuration object for the collection
   * @throws Error if sync config is missing
   */
  constructor(config) {
    this.utils = {};
    this.deferDataRefresh = null;
    this.insert = (data, config2) => {
      return this._mutations.insert(data, config2);
    };
    this.delete = (keys, config2) => {
      return this._mutations.delete(keys, config2);
    };
    if (!config) {
      throw new CollectionRequiresConfigError();
    }
    if (!config.sync) {
      throw new CollectionRequiresSyncConfigError();
    }
    if (config.id) {
      this.id = config.id;
    } else {
      this.id = safeRandomUUID();
    }
    this.config = {
      ...config,
      autoIndex: config.autoIndex ?? `off`
    };
    if (this.config.autoIndex === `eager` && !config.defaultIndexType) {
      throw new CollectionConfigurationError(`autoIndex: 'eager' requires defaultIndexType to be set. Import an index type and set it:
  import { BasicIndex } from '@tanstack/db'
  createCollection({ defaultIndexType: BasicIndex, autoIndex: 'eager', ... })`);
    }
    this._changes = new CollectionChangesManager();
    this._events = new CollectionEventsManager();
    this._indexes = new CollectionIndexesManager();
    this._lifecycle = new CollectionLifecycleManager(config, this.id);
    this._mutations = new CollectionMutationsManager(config, this.id);
    this._state = new CollectionStateManager(config);
    this._sync = new CollectionSyncManager(config, this.id);
    this.comparisonOpts = buildCompareOptionsFromConfig(config);
    this._changes.setDeps({
      collection: this,
      // Required for passing to CollectionSubscription
      lifecycle: this._lifecycle,
      sync: this._sync,
      events: this._events,
      state: this._state
    });
    this._events.setDeps({
      collection: this
    });
    this._indexes.setDeps({
      state: this._state,
      lifecycle: this._lifecycle,
      defaultIndexType: config.defaultIndexType,
      events: this._events
    });
    this._lifecycle.setDeps({
      changes: this._changes,
      events: this._events,
      indexes: this._indexes,
      state: this._state,
      sync: this._sync
    });
    this._mutations.setDeps({
      collection: this,
      // Required for passing to config.onInsert/onUpdate/onDelete and annotating mutations
      lifecycle: this._lifecycle,
      state: this._state
    });
    this._state.setDeps({
      collection: this,
      // Required for filtering events to only include this collection
      lifecycle: this._lifecycle,
      changes: this._changes,
      indexes: this._indexes,
      events: this._events
    });
    this._sync.setDeps({
      collection: this,
      // Required for passing to config.sync callback
      state: this._state,
      lifecycle: this._lifecycle,
      events: this._events
    });
    if (config.startSync === true) {
      this._sync.startSync();
    }
  }
  /**
   * Gets the current status of the collection
   */
  get status() {
    return this._lifecycle.status;
  }
  /**
   * Get the number of subscribers to the collection
   */
  get subscriberCount() {
    return this._changes.activeSubscribersCount;
  }
  /**
   * Register a callback to be executed when the collection first becomes ready
   * Useful for preloading collections
   * @param callback Function to call when the collection first becomes ready
   * @example
   * collection.onFirstReady(() => {
   *   console.log('Collection is ready for the first time')
   *   // Safe to access collection.state now
   * })
   */
  onFirstReady(callback) {
    return this._lifecycle.onFirstReady(callback);
  }
  /**
   * Check if the collection is ready for use
   * Returns true if the collection has been marked as ready by its sync implementation
   * @returns true if the collection is ready, false otherwise
   * @example
   * if (collection.isReady()) {
   *   console.log('Collection is ready, data is available')
   *   // Safe to access collection.state
   * } else {
   *   console.log('Collection is still loading')
   * }
   */
  isReady() {
    return this._lifecycle.status === `ready`;
  }
  /**
   * Check if the collection is currently loading more data
   * @returns true if the collection has pending load more operations, false otherwise
   */
  get isLoadingSubset() {
    return this._sync.isLoadingSubset;
  }
  /**
   * Start sync immediately - internal method for compiled queries
   * This bypasses lazy loading for special cases like live query results
   */
  startSyncImmediate() {
    this._sync.startSync();
  }
  /**
   * Preload the collection data by starting sync if not already started
   * Multiple concurrent calls will share the same promise
   */
  preload() {
    return this._sync.preload();
  }
  /**
   * Get the current value for a key (virtual derived state)
   */
  get(key) {
    return this._state.getWithVirtualProps(key);
  }
  /**
   * Check if a key exists in the collection (virtual derived state)
   */
  has(key) {
    return this._state.has(key);
  }
  /**
   * Get the current size of the collection (cached)
   */
  get size() {
    return this._state.size;
  }
  /**
   * Get all keys (virtual derived state)
   */
  *keys() {
    yield* this._state.keys();
  }
  /**
   * Get all values (virtual derived state)
   */
  *values() {
    for (const key of this._state.keys()) {
      const value = this.get(key);
      if (value !== void 0) {
        yield value;
      }
    }
  }
  /**
   * Get all entries (virtual derived state)
   */
  *entries() {
    for (const key of this._state.keys()) {
      const value = this.get(key);
      if (value !== void 0) {
        yield [
          key,
          value
        ];
      }
    }
  }
  /**
   * Get all entries (virtual derived state)
   */
  *[Symbol.iterator]() {
    yield* this.entries();
  }
  /**
   * Execute a callback for each entry in the collection
   */
  forEach(callbackfn) {
    let index = 0;
    for (const [key, value] of this.entries()) {
      callbackfn(value, key, index++);
    }
  }
  /**
   * Create a new array with the results of calling a function for each entry in the collection
   */
  map(callbackfn) {
    const result = [];
    let index = 0;
    for (const [key, value] of this.entries()) {
      result.push(callbackfn(value, key, index++));
    }
    return result;
  }
  getKeyFromItem(item) {
    return this.config.getKey(item);
  }
  /**
   * Creates an index on a collection for faster queries.
   * Indexes significantly improve query performance by allowing constant time lookups
   * and logarithmic time range queries instead of full scans.
   *
   * @param indexCallback - Function that extracts the indexed value from each item
   * @param config - Configuration including index type and type-specific options
   * @returns The created index
   *
   * @example
   * ```ts
   * import { BasicIndex } from '@tanstack/db'
   *
   * // Create an index with explicit type
   * const ageIndex = collection.createIndex((row) => row.age, {
   *   indexType: BasicIndex
   * })
   *
   * // Create an index with collection's default type
   * const nameIndex = collection.createIndex((row) => row.name)
   * ```
   */
  createIndex(indexCallback, config = {}) {
    return this._indexes.createIndex(indexCallback, config);
  }
  /**
   * Removes an index created with createIndex.
   * Returns true when an index existed and was removed.
   *
   * Best-effort semantics: removing an index guarantees it is detached from
   * collection query planning. Existing index proxy references should be treated
   * as invalid after removal.
   */
  removeIndex(indexOrId) {
    return this._indexes.removeIndex(indexOrId);
  }
  /**
   * Returns a snapshot of current index metadata sorted by indexId.
   * Persistence wrappers can use this to bootstrap index state if indexes were
   * created before event listeners were attached.
   */
  getIndexMetadata() {
    return this._indexes.getIndexMetadataSnapshot();
  }
  /**
   * Get resolved indexes for query optimization
   */
  get indexes() {
    return this._indexes.indexes;
  }
  /**
   * Validates the data against the schema
   */
  validateData(data, type, key) {
    return this._mutations.validateData(data, type, key);
  }
  get compareOptions() {
    return {
      ...this.comparisonOpts
    };
  }
  update(keys, configOrCallback, maybeCallback) {
    return this._mutations.update(keys, configOrCallback, maybeCallback);
  }
  /**
   * Gets the current state of the collection as a Map
   * @returns Map containing all items in the collection, with keys as identifiers
   * @example
   * const itemsMap = collection.state
   * console.log(`Collection has ${itemsMap.size} items`)
   *
   * for (const [key, item] of itemsMap) {
   *   console.log(`${key}: ${item.title}`)
   * }
   *
   * // Check if specific item exists
   * if (itemsMap.has("todo-1")) {
   *   console.log("Todo 1 exists:", itemsMap.get("todo-1"))
   * }
   */
  get state() {
    const result = /* @__PURE__ */ new Map();
    for (const [key, value] of this.entries()) {
      result.set(key, value);
    }
    return result;
  }
  /**
   * Gets the current state of the collection as a Map, but only resolves when data is available
   * Waits for the first sync commit to complete before resolving
   *
   * @returns Promise that resolves to a Map containing all items in the collection
   */
  stateWhenReady() {
    if (this.size > 0 || this.isReady()) {
      return Promise.resolve(this.state);
    }
    return this.preload().then(() => this.state);
  }
  /**
   * Gets the current state of the collection as an Array
   *
   * @returns An Array containing all items in the collection
   */
  get toArray() {
    return Array.from(this.values());
  }
  /**
   * Gets the current state of the collection as an Array, but only resolves when data is available
   * Waits for the first sync commit to complete before resolving
   *
   * @returns Promise that resolves to an Array containing all items in the collection
   */
  toArrayWhenReady() {
    if (this.size > 0 || this.isReady()) {
      return Promise.resolve(this.toArray);
    }
    return this.preload().then(() => this.toArray);
  }
  /**
   * Returns the current state of the collection as an array of changes
   * @param options - Options including optional where filter
   * @returns An array of changes
   * @example
   * // Get all items as changes
   * const allChanges = collection.currentStateAsChanges()
   *
   * // Get only items matching a condition
   * const activeChanges = collection.currentStateAsChanges({
   *   where: (row) => row.status === 'active'
   * })
   *
   * // Get only items using a pre-compiled expression
   * const activeChanges = collection.currentStateAsChanges({
   *   whereExpression: eq(row.status, 'active')
   * })
   */
  currentStateAsChanges(options = {}) {
    return currentStateAsChanges(this, options);
  }
  /**
   * Subscribe to changes in the collection
   * @param callback - Function called when items change
   * @param options - Subscription options including includeInitialState and where filter
   * @returns Unsubscribe function - Call this to stop listening for changes
   * @example
   * // Basic subscription
   * const subscription = collection.subscribeChanges((changes) => {
   *   changes.forEach(change => {
   *     console.log(`${change.type}: ${change.key}`, change.value)
   *   })
   * })
   *
   * // Later: subscription.unsubscribe()
   *
   * @example
   * // Include current state immediately
   * const subscription = collection.subscribeChanges((changes) => {
   *   updateUI(changes)
   * }, { includeInitialState: true })
   *
   * @example
   * // Subscribe only to changes matching a condition using where callback
   * import { eq } from "@tanstack/db"
   *
   * const subscription = collection.subscribeChanges((changes) => {
   *   updateUI(changes)
   * }, {
   *   includeInitialState: true,
   *   where: (row) => eq(row.status, "active")
   * })
   *
   * @example
   * // Using multiple conditions with and()
   * import { and, eq, gt } from "@tanstack/db"
   *
   * const subscription = collection.subscribeChanges((changes) => {
   *   updateUI(changes)
   * }, {
   *   where: (row) => and(eq(row.status, "active"), gt(row.priority, 5))
   * })
   */
  subscribeChanges(callback, options = {}) {
    return this._changes.subscribeChanges(callback, options);
  }
  /**
   * Subscribe to a collection event
   */
  on(event, callback) {
    return this._events.on(event, callback);
  }
  /**
   * Subscribe to a collection event once
   */
  once(event, callback) {
    return this._events.once(event, callback);
  }
  /**
   * Unsubscribe from a collection event
   */
  off(event, callback) {
    this._events.off(event, callback);
  }
  /**
   * Wait for a collection event
   */
  waitFor(event, timeout) {
    return this._events.waitFor(event, timeout);
  }
  /**
   * Clean up the collection by stopping sync and clearing data
   * This can be called manually or automatically by garbage collection
   */
  async cleanup() {
    this._lifecycle.cleanup();
    return Promise.resolve();
  }
};
function buildCompareOptionsFromConfig(config) {
  if (config.defaultStringCollation) {
    const options = config.defaultStringCollation;
    return {
      stringSort: options.stringSort ?? `locale`,
      locale: options.stringSort === `locale` ? options.locale : void 0,
      localeOptions: options.stringSort === `locale` ? options.localeOptions : void 0
    };
  } else {
    return {
      stringSort: `locale`
    };
  }
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/utils/type-guards.js
function isPromiseLike(value) {
  return !!value && (typeof value === `object` || typeof value === `function`) && typeof value.then === `function`;
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/optimistic-action.js
function createOptimisticAction(options) {
  const { mutationFn, onMutate, ...config } = options;
  return (variables) => {
    const transaction = createTransaction({
      ...config,
      // Wire the mutationFn to use the provided variables
      mutationFn: async (params) => {
        return await mutationFn(variables, params);
      }
    });
    transaction.mutate(() => {
      const maybePromise = onMutate(variables);
      if (isPromiseLike(maybePromise)) {
        throw new OnMutateMustBeSynchronousError();
      }
    });
    return transaction;
  };
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/local-only.js
function localOnlyCollectionOptions(config) {
  const { initialData, onInsert, onUpdate, onDelete, id, ...restConfig } = config;
  const collectionId = id ?? safeRandomUUID();
  const syncResult = createLocalOnlySync(initialData);
  const wrappedOnInsert = async (params) => {
    let handlerResult;
    if (onInsert) {
      handlerResult = await onInsert(params) ?? {};
    }
    syncResult.confirmOperationsSync(params.transaction.mutations);
    return handlerResult;
  };
  const wrappedOnUpdate = async (params) => {
    let handlerResult;
    if (onUpdate) {
      handlerResult = await onUpdate(params) ?? {};
    }
    syncResult.confirmOperationsSync(params.transaction.mutations);
    return handlerResult;
  };
  const wrappedOnDelete = async (params) => {
    let handlerResult;
    if (onDelete) {
      handlerResult = await onDelete(params) ?? {};
    }
    syncResult.confirmOperationsSync(params.transaction.mutations);
    return handlerResult;
  };
  const acceptMutations = (transaction) => {
    const collectionMutations = transaction.mutations.filter((m) => m.collection.id === collectionId);
    if (collectionMutations.length === 0) {
      return;
    }
    syncResult.confirmOperationsSync(collectionMutations);
  };
  return {
    ...restConfig,
    id: collectionId,
    sync: syncResult.sync,
    onInsert: wrappedOnInsert,
    onUpdate: wrappedOnUpdate,
    onDelete: wrappedOnDelete,
    utils: {
      acceptMutations
    },
    startSync: true,
    gcTime: 0
  };
}
function createLocalOnlySync(initialData) {
  let syncBegin = null;
  let syncWrite = null;
  let syncCommit = null;
  let collection = null;
  const sync = {
    /**
     * Sync function that captures sync parameters and applies initial data
     * @param params - Sync parameters containing begin, write, and commit functions
     * @returns Unsubscribe function (empty since no ongoing sync is needed)
     */
    sync: (params) => {
      const { begin, write, commit, markReady } = params;
      syncBegin = begin;
      syncWrite = write;
      syncCommit = commit;
      collection = params.collection;
      params.collection._state.isLocalOnly = true;
      if (initialData && initialData.length > 0) {
        for (const item of initialData) {
          const key = params.collection.getKeyFromItem(item);
          params.collection._state.pendingLocalChanges.add(key);
        }
        begin();
        initialData.forEach((item) => {
          write({
            type: `insert`,
            value: item
          });
        });
        commit();
      }
      markReady();
      return () => {
      };
    },
    /**
     * Get sync metadata - returns empty object for local-only collections
     * @returns Empty metadata object
     */
    getSyncMetadata: () => ({})
  };
  const confirmOperationsSync = (mutations) => {
    if (!syncBegin || !syncWrite || !syncCommit) {
      return;
    }
    syncBegin();
    mutations.forEach((mutation) => {
      if (syncWrite) {
        syncWrite({
          type: mutation.type,
          value: mutation.modified
        });
      }
    });
    syncCommit();
  };
  return {
    sync,
    confirmOperationsSync,
    collection
  };
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/local-storage.js
function validateJsonSerializable(parser, value, operation) {
  try {
    parser.stringify(value);
  } catch (error) {
    throw new SerializationError(operation, error instanceof Error ? error.message : String(error));
  }
}
function generateUuid() {
  return safeRandomUUID();
}
function encodeStorageKey(key) {
  if (typeof key === `number`) {
    return `n:${key}`;
  }
  return `s:${key}`;
}
function decodeStorageKey(encodedKey) {
  if (encodedKey.startsWith(`n:`)) {
    return Number(encodedKey.slice(2));
  }
  if (encodedKey.startsWith(`s:`)) {
    return encodedKey.slice(2);
  }
  return encodedKey;
}
function createInMemoryStorage() {
  const storage = /* @__PURE__ */ new Map();
  return {
    getItem(key) {
      return storage.get(key) ?? null;
    },
    setItem(key, value) {
      storage.set(key, value);
    },
    removeItem(key) {
      storage.delete(key);
    }
  };
}
function createNoOpStorageEventApi() {
  return {
    addEventListener: () => {
    },
    removeEventListener: () => {
    }
  };
}
function localStorageCollectionOptions(config) {
  if (!config.storageKey) {
    throw new StorageKeyRequiredError();
  }
  const storage = config.storage || (typeof window !== `undefined` ? window.localStorage : null) || createInMemoryStorage();
  const storageEventApi = config.storageEventApi || (typeof window !== `undefined` ? window : null) || createNoOpStorageEventApi();
  const parser = config.parser || JSON;
  const lastKnownData = /* @__PURE__ */ new Map();
  const sync = createLocalStorageSync(config.storageKey, storage, storageEventApi, parser, config.getKey, lastKnownData);
  const saveToStorage = (dataMap) => {
    try {
      const objectData = {};
      dataMap.forEach((storedItem, key) => {
        objectData[encodeStorageKey(key)] = storedItem;
      });
      const serialized = parser.stringify(objectData);
      storage.setItem(config.storageKey, serialized);
    } catch (error) {
      console.error(`[LocalStorageCollection] Error saving data to storage key "${config.storageKey}":`, error);
      throw error;
    }
  };
  const clearStorage = () => {
    storage.removeItem(config.storageKey);
  };
  const getStorageSize = () => {
    const data = storage.getItem(config.storageKey);
    return data ? new Blob([
      data
    ]).size : 0;
  };
  const wrappedOnInsert = async (params) => {
    params.transaction.mutations.forEach((mutation) => {
      validateJsonSerializable(parser, mutation.modified, `insert`);
    });
    let handlerResult = {};
    if (config.onInsert) {
      handlerResult = await config.onInsert(params) ?? {};
    }
    params.transaction.mutations.forEach((mutation) => {
      const storedItem = {
        versionKey: generateUuid(),
        data: mutation.modified
      };
      lastKnownData.set(mutation.key, storedItem);
    });
    saveToStorage(lastKnownData);
    sync.confirmOperationsSync(params.transaction.mutations);
    return handlerResult;
  };
  const wrappedOnUpdate = async (params) => {
    params.transaction.mutations.forEach((mutation) => {
      validateJsonSerializable(parser, mutation.modified, `update`);
    });
    let handlerResult = {};
    if (config.onUpdate) {
      handlerResult = await config.onUpdate(params) ?? {};
    }
    params.transaction.mutations.forEach((mutation) => {
      const storedItem = {
        versionKey: generateUuid(),
        data: mutation.modified
      };
      lastKnownData.set(mutation.key, storedItem);
    });
    saveToStorage(lastKnownData);
    sync.confirmOperationsSync(params.transaction.mutations);
    return handlerResult;
  };
  const wrappedOnDelete = async (params) => {
    let handlerResult = {};
    if (config.onDelete) {
      handlerResult = await config.onDelete(params) ?? {};
    }
    params.transaction.mutations.forEach((mutation) => {
      lastKnownData.delete(mutation.key);
    });
    saveToStorage(lastKnownData);
    sync.confirmOperationsSync(params.transaction.mutations);
    return handlerResult;
  };
  const { storageKey: _storageKey, storage: _storage, storageEventApi: _storageEventApi, onInsert: _onInsert, onUpdate: _onUpdate, onDelete: _onDelete, id, ...restConfig } = config;
  const collectionId = id ?? `local-collection:${config.storageKey}`;
  const acceptMutations = (transaction) => {
    const collectionMutations = transaction.mutations.filter((m) => {
      if (sync.collection && m.collection === sync.collection) {
        return true;
      }
      return m.collection.id === collectionId;
    });
    if (collectionMutations.length === 0) {
      return;
    }
    for (const mutation of collectionMutations) {
      switch (mutation.type) {
        case `insert`:
        case `update`:
          validateJsonSerializable(parser, mutation.modified, mutation.type);
          break;
        case `delete`:
          validateJsonSerializable(parser, mutation.original, mutation.type);
          break;
      }
    }
    for (const mutation of collectionMutations) {
      switch (mutation.type) {
        case `insert`:
        case `update`: {
          const storedItem = {
            versionKey: generateUuid(),
            data: mutation.modified
          };
          lastKnownData.set(mutation.key, storedItem);
          break;
        }
        case `delete`: {
          lastKnownData.delete(mutation.key);
          break;
        }
      }
    }
    saveToStorage(lastKnownData);
    sync.confirmOperationsSync(collectionMutations);
  };
  return {
    ...restConfig,
    id: collectionId,
    sync,
    onInsert: wrappedOnInsert,
    onUpdate: wrappedOnUpdate,
    onDelete: wrappedOnDelete,
    utils: {
      clearStorage,
      getStorageSize,
      acceptMutations
    }
  };
}
function loadFromStorage(storageKey, storage, parser) {
  try {
    const rawData = storage.getItem(storageKey);
    if (!rawData) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parser.parse(rawData);
    const dataMap = /* @__PURE__ */ new Map();
    if (typeof parsed === `object` && parsed !== null && !Array.isArray(parsed)) {
      Object.entries(parsed).forEach(([encodedKey, value]) => {
        if (value && typeof value === `object` && `versionKey` in value && `data` in value) {
          const storedItem = value;
          const decodedKey = decodeStorageKey(encodedKey);
          dataMap.set(decodedKey, storedItem);
        } else {
          throw new InvalidStorageDataFormatError(storageKey, encodedKey);
        }
      });
    } else {
      throw new InvalidStorageObjectFormatError(storageKey);
    }
    return dataMap;
  } catch (error) {
    console.warn(`[LocalStorageCollection] Error loading data from storage key "${storageKey}":`, error);
    return /* @__PURE__ */ new Map();
  }
}
function createLocalStorageSync(storageKey, storage, storageEventApi, parser, _getKey, lastKnownData) {
  let syncParams = null;
  let collection = null;
  const findChanges = (oldData, newData) => {
    const changes = [];
    oldData.forEach((oldStoredItem, key) => {
      const newStoredItem = newData.get(key);
      if (!newStoredItem) {
        changes.push({
          type: `delete`,
          key,
          value: oldStoredItem.data
        });
      } else if (oldStoredItem.versionKey !== newStoredItem.versionKey) {
        changes.push({
          type: `update`,
          key,
          value: newStoredItem.data
        });
      }
    });
    newData.forEach((newStoredItem, key) => {
      if (!oldData.has(key)) {
        changes.push({
          type: `insert`,
          key,
          value: newStoredItem.data
        });
      }
    });
    return changes;
  };
  const processStorageChanges = () => {
    if (!syncParams) return;
    const { begin, write, commit } = syncParams;
    const newData = loadFromStorage(storageKey, storage, parser);
    const changes = findChanges(lastKnownData, newData);
    if (changes.length > 0) {
      begin();
      changes.forEach(({ type, value }) => {
        if (value) {
          validateJsonSerializable(parser, value, type);
          write({
            type,
            value
          });
        }
      });
      commit();
      lastKnownData.clear();
      newData.forEach((storedItem, key) => {
        lastKnownData.set(key, storedItem);
      });
    }
  };
  const syncConfig = {
    sync: (params) => {
      const { begin, write, commit, markReady } = params;
      syncParams = params;
      collection = params.collection;
      const initialData = loadFromStorage(storageKey, storage, parser);
      if (initialData.size > 0) {
        begin();
        initialData.forEach((storedItem) => {
          validateJsonSerializable(parser, storedItem.data, `load`);
          write({
            type: `insert`,
            value: storedItem.data
          });
        });
        commit();
      }
      lastKnownData.clear();
      initialData.forEach((storedItem, key) => {
        lastKnownData.set(key, storedItem);
      });
      markReady();
      const handleStorageEvent = (event) => {
        if (event.key !== storageKey || event.storageArea !== storage) {
          return;
        }
        processStorageChanges();
      };
      storageEventApi.addEventListener(`storage`, handleStorageEvent);
    },
    /**
     * Get sync metadata - returns storage key information
     * @returns Object containing storage key and storage type metadata
     */
    getSyncMetadata: () => ({
      storageKey,
      storageType: storage === (typeof window !== `undefined` ? window.localStorage : null) ? `localStorage` : `custom`
    }),
    // Manual trigger function for local updates
    manualTrigger: processStorageChanges,
    // Collection instance reference
    collection
  };
  const confirmOperationsSync = (mutations) => {
    if (!syncParams) {
      return;
    }
    const { begin, write, commit } = syncParams;
    begin();
    mutations.forEach((mutation) => {
      write({
        type: mutation.type,
        value: mutation.type === `delete` ? mutation.original : mutation.modified
      });
    });
    commit();
  };
  return {
    ...syncConfig,
    confirmOperationsSync
  };
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/indexes/base-index.js
var BaseIndex = class {
  constructor(id, expression, name, options) {
    this.lookupCount = 0;
    this.totalLookupTime = 0;
    this.lastUpdated = /* @__PURE__ */ new Date();
    this.hasCustomComparator = false;
    this.id = id;
    this.expression = expression;
    this.compareOptions = DEFAULT_COMPARE_OPTIONS;
    this.name = name;
    this.initialize(options);
  }
  // Common methods
  supports(operation) {
    return this.supportedOperations.has(operation);
  }
  get supportsRangeOptimization() {
    return !this.hasCustomComparator;
  }
  matchesField(fieldPath) {
    return this.expression.type === `ref` && this.expression.path.length === fieldPath.length && this.expression.path.every((part, i) => part === fieldPath[i]);
  }
  /**
   * Checks if the compare options match the index's compare options.
   * The direction is ignored because the index can be reversed if the direction is different.
   */
  matchesCompareOptions(compareOptions) {
    const thisCompareOptionsWithoutDirection = {
      ...this.compareOptions,
      direction: void 0
    };
    const compareOptionsWithoutDirection = {
      ...compareOptions,
      direction: void 0
    };
    return deepEquals(thisCompareOptionsWithoutDirection, compareOptionsWithoutDirection);
  }
  /**
   * Checks if the index matches the provided direction.
   */
  matchesDirection(direction) {
    return this.compareOptions.direction === direction;
  }
  getStats() {
    return {
      entryCount: this.keyCount,
      lookupCount: this.lookupCount,
      averageLookupTime: this.lookupCount > 0 ? this.totalLookupTime / this.lookupCount : 0,
      lastUpdated: this.lastUpdated
    };
  }
  evaluateIndexExpression(item) {
    const evaluator = this.compiledIndexEvaluator ??= compileSingleRowExpression(this.expression);
    return evaluator(item);
  }
  trackLookup(startTime) {
    const duration = performance.now() - startTime;
    this.lookupCount++;
    this.totalLookupTime += duration;
  }
  updateTimestamp() {
    this.lastUpdated = /* @__PURE__ */ new Date();
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/utils/array-utils.js
function findInsertPositionInArray(sortedArray, value, compareFn) {
  let left = 0;
  let right = sortedArray.length;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const comparison = compareFn(sortedArray[mid], value);
    if (comparison < 0) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
}
function deleteInSortedArray(sortedArray, value, compareFn) {
  const idx = findInsertPositionInArray(sortedArray, value, compareFn);
  if (idx < sortedArray.length && compareFn(sortedArray[idx], value) === 0) {
    sortedArray.splice(idx, 1);
    return true;
  }
  return false;
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/indexes/basic-index.js
var BasicIndex = class extends BaseIndex {
  constructor(id, expression, name, options) {
    super(id, expression, name, options);
    this.supportedOperations = /* @__PURE__ */ new Set([
      `eq`,
      `gt`,
      `gte`,
      `lt`,
      `lte`,
      `in`
    ]);
    this.valueMap = /* @__PURE__ */ new Map();
    this.sortedValues = [];
    this.indexedKeys = /* @__PURE__ */ new Set();
    this.compareFn = defaultComparator;
    this.compareFn = options?.compareFn ?? defaultComparator;
    this.hasCustomComparator = options?.compareFn != null;
    if (options?.compareOptions) {
      this.compareOptions = options.compareOptions;
    }
  }
  initialize(_options) {
  }
  /**
   * Adds a value to the index
   */
  add(key, item) {
    let indexedValue2;
    try {
      indexedValue2 = this.evaluateIndexExpression(item);
    } catch (error) {
      throw new Error(`Failed to evaluate index expression for key ${key}: ${error}`, {
        cause: error
      });
    }
    const normalizedValue = normalizeValue(indexedValue2);
    this.addToBucket(key, normalizedValue);
    this.indexedKeys.add(key);
    this.updateTimestamp();
  }
  addToBucket(key, normalizedValue) {
    const keySet = this.valueMap.get(normalizedValue);
    if (keySet) {
      keySet.add(key);
    } else {
      this.valueMap.set(normalizedValue, /* @__PURE__ */ new Set([
        key
      ]));
      const insertIdx = findInsertPositionInArray(this.sortedValues, normalizedValue, this.compareFn);
      this.sortedValues.splice(insertIdx, 0, normalizedValue);
    }
  }
  /**
   * Removes a value from the index
   */
  remove(key, item) {
    let indexedValue2;
    try {
      indexedValue2 = this.evaluateIndexExpression(item);
    } catch (error) {
      console.warn(`Failed to evaluate index expression for key ${key} during removal:`, error);
      this.indexedKeys.delete(key);
      this.updateTimestamp();
      return;
    }
    const normalizedValue = normalizeValue(indexedValue2);
    this.removeFromBucket(key, normalizedValue);
    this.indexedKeys.delete(key);
    this.updateTimestamp();
  }
  removeFromBucket(key, normalizedValue) {
    const keySet = this.valueMap.get(normalizedValue);
    if (keySet) {
      keySet.delete(key);
      if (keySet.size === 0) {
        this.valueMap.delete(normalizedValue);
        deleteInSortedArray(this.sortedValues, normalizedValue, this.compareFn);
      }
    }
  }
  /**
   * Updates a value in the index
   */
  update(key, oldItem, newItem) {
    let oldValue;
    let newValue;
    try {
      oldValue = normalizeValue(this.evaluateIndexExpression(oldItem));
      newValue = normalizeValue(this.evaluateIndexExpression(newItem));
    } catch {
      this.remove(key, oldItem);
      this.add(key, newItem);
      return;
    }
    if (areSameValueZeroEqual(oldValue, newValue) && this.valueMap.get(newValue)?.has(key) && this.indexedKeys.has(key)) {
      return;
    }
    this.removeFromBucket(key, oldValue);
    this.addToBucket(key, newValue);
    this.indexedKeys.add(key);
    this.updateTimestamp();
  }
  /**
   * Builds the index from a collection of entries
   */
  build(entries) {
    this.clear();
    const entriesArray = [];
    for (const [key, item] of entries) {
      let indexedValue2;
      try {
        indexedValue2 = this.evaluateIndexExpression(item);
      } catch (error) {
        throw new Error(`Failed to evaluate index expression for key ${key}: ${error}`, {
          cause: error
        });
      }
      entriesArray.push({
        key,
        value: normalizeValue(indexedValue2)
      });
      this.indexedKeys.add(key);
    }
    for (const { key, value } of entriesArray) {
      if (this.valueMap.has(value)) {
        this.valueMap.get(value).add(key);
      } else {
        this.valueMap.set(value, /* @__PURE__ */ new Set([
          key
        ]));
      }
    }
    this.sortedValues = Array.from(this.valueMap.keys()).sort(this.compareFn);
    this.updateTimestamp();
  }
  /**
   * Clears all data from the index
   */
  clear() {
    this.valueMap.clear();
    this.sortedValues = [];
    this.indexedKeys.clear();
    this.updateTimestamp();
  }
  /**
   * Performs a lookup operation
   */
  lookup(operation, value) {
    const startTime = performance.now();
    let result;
    switch (operation) {
      case `eq`:
        result = this.equalityLookup(value);
        break;
      case `gt`:
        result = this.rangeQuery({
          from: value,
          fromInclusive: false
        });
        break;
      case `gte`:
        result = this.rangeQuery({
          from: value,
          fromInclusive: true
        });
        break;
      case `lt`:
        result = this.rangeQuery({
          to: value,
          toInclusive: false
        });
        break;
      case `lte`:
        result = this.rangeQuery({
          to: value,
          toInclusive: true
        });
        break;
      case `in`:
        result = this.inArrayLookup(value);
        break;
      default:
        throw new Error(`Operation ${operation} not supported by BasicIndex`);
    }
    this.trackLookup(startTime);
    return result;
  }
  /**
   * Gets the number of indexed keys
   */
  get keyCount() {
    return this.indexedKeys.size;
  }
  /**
   * Performs an equality lookup - O(1)
   */
  equalityLookup(value) {
    const normalizedValue = normalizeValue(value);
    return this.valueMap.get(normalizedValue) ?? /* @__PURE__ */ new Set();
  }
  /**
   * Performs a range query using binary search - O(log n + m)
   */
  rangeQuery(options = {}) {
    const { from, to, fromInclusive = true, toInclusive = true } = options;
    const result = /* @__PURE__ */ new Set();
    if (this.sortedValues.length === 0) {
      return result;
    }
    const normalizedFrom = normalizeValue(from);
    const normalizedTo = normalizeValue(to);
    let startIdx = 0;
    if (normalizedFrom !== void 0) {
      startIdx = findInsertPositionInArray(this.sortedValues, normalizedFrom, this.compareFn);
      if (!fromInclusive && startIdx < this.sortedValues.length && this.compareFn(this.sortedValues[startIdx], normalizedFrom) === 0) {
        startIdx++;
      }
    }
    let endIdx = this.sortedValues.length;
    if (normalizedTo !== void 0) {
      endIdx = findInsertPositionInArray(this.sortedValues, normalizedTo, this.compareFn);
      if (toInclusive && endIdx < this.sortedValues.length && this.compareFn(this.sortedValues[endIdx], normalizedTo) === 0) {
        endIdx++;
      }
    }
    for (let i = startIdx; i < endIdx; i++) {
      const keys = this.valueMap.get(this.sortedValues[i]);
      if (keys) {
        keys.forEach((key) => result.add(key));
      }
    }
    return result;
  }
  /**
   * Performs a reversed range query
   */
  rangeQueryReversed(options = {}) {
    const { from, to, fromInclusive = true, toInclusive = true } = options;
    const swappedFrom = to ?? (this.sortedValues.length > 0 ? this.sortedValues[this.sortedValues.length - 1] : void 0);
    const swappedTo = from ?? (this.sortedValues.length > 0 ? this.sortedValues[0] : void 0);
    return this.rangeQuery({
      from: swappedFrom,
      to: swappedTo,
      fromInclusive: toInclusive,
      toInclusive: fromInclusive
    });
  }
  /**
   * Returns the next n items in sorted order
   */
  take(n, from, filterFn) {
    const result = [];
    let startIdx = 0;
    if (from !== void 0) {
      const normalizedFrom = normalizeValue(from);
      startIdx = findInsertPositionInArray(this.sortedValues, normalizedFrom, this.compareFn);
      while (startIdx < this.sortedValues.length && this.compareFn(this.sortedValues[startIdx], normalizedFrom) <= 0) {
        startIdx++;
      }
    }
    for (let i = startIdx; i < this.sortedValues.length && result.length < n; i++) {
      const keys = this.valueMap.get(this.sortedValues[i]);
      if (keys) {
        for (const key of keys) {
          if (result.length >= n) break;
          if (!filterFn || filterFn(key)) {
            result.push(key);
          }
        }
      }
    }
    return result;
  }
  /**
   * Returns the next n items in reverse sorted order
   */
  takeReversed(n, from, filterFn) {
    const result = [];
    let startIdx = this.sortedValues.length - 1;
    if (from !== void 0) {
      const normalizedFrom = normalizeValue(from);
      startIdx = findInsertPositionInArray(this.sortedValues, normalizedFrom, this.compareFn) - 1;
      while (startIdx >= 0 && this.compareFn(this.sortedValues[startIdx], normalizedFrom) >= 0) {
        startIdx--;
      }
    }
    for (let i = startIdx; i >= 0 && result.length < n; i--) {
      const keys = this.valueMap.get(this.sortedValues[i]);
      if (keys) {
        for (const key of keys) {
          if (result.length >= n) break;
          if (!filterFn || filterFn(key)) {
            result.push(key);
          }
        }
      }
    }
    return result;
  }
  /**
   * Returns the first n items in sorted order (from the start)
   */
  takeFromStart(n, filterFn) {
    const result = [];
    for (let i = 0; i < this.sortedValues.length && result.length < n; i++) {
      const keys = this.valueMap.get(this.sortedValues[i]);
      if (keys) {
        for (const key of keys) {
          if (result.length >= n) break;
          if (!filterFn || filterFn(key)) {
            result.push(key);
          }
        }
      }
    }
    return result;
  }
  /**
   * Returns the first n items in reverse sorted order (from the end)
   */
  takeReversedFromEnd(n, filterFn) {
    const result = [];
    for (let i = this.sortedValues.length - 1; i >= 0 && result.length < n; i--) {
      const keys = this.valueMap.get(this.sortedValues[i]);
      if (keys) {
        for (const key of keys) {
          if (result.length >= n) break;
          if (!filterFn || filterFn(key)) {
            result.push(key);
          }
        }
      }
    }
    return result;
  }
  /**
   * Performs an IN array lookup - O(k) where k is values.length
   */
  inArrayLookup(values) {
    const result = /* @__PURE__ */ new Set();
    for (const value of values) {
      const normalizedValue = normalizeValue(value);
      const keys = this.valueMap.get(normalizedValue);
      if (keys) {
        keys.forEach((key) => result.add(key));
      }
    }
    return result;
  }
  // Getter methods for testing/compatibility
  get indexedKeysSet() {
    return this.indexedKeys;
  }
  get orderedEntriesArray() {
    return this.sortedValues.map((value) => [
      value,
      this.valueMap.get(value) ?? /* @__PURE__ */ new Set()
    ]);
  }
  get orderedEntriesArrayReversed() {
    const result = [];
    for (let i = this.sortedValues.length - 1; i >= 0; i--) {
      const value = this.sortedValues[i];
      result.push([
        value,
        this.valueMap.get(value) ?? /* @__PURE__ */ new Set()
      ]);
    }
    return result;
  }
  get valueMapData() {
    return this.valueMap;
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/utils/btree.js
var BTree = class {
  /**
   * Initializes an empty B+ tree.
   * @param compare Custom function to compare pairs of elements in the tree.
   *   If not specified, defaultComparator will be used which is valid as long as K extends DefaultComparable.
   * @param entries A set of key-value pairs to initialize the tree
   * @param maxNodeSize Branching factor (maximum items or children per node)
   *   Must be in range 4..256. If undefined or <4 then default is used; if >256 then 256.
   */
  constructor(compare, entries, maxNodeSize) {
    this._root = EmptyLeaf;
    this._size = 0;
    this._maxNodeSize = maxNodeSize >= 4 ? Math.min(maxNodeSize, 256) : 32;
    this._compare = compare;
    if (entries) this.setPairs(entries);
  }
  // ///////////////////////////////////////////////////////////////////////////
  // ES6 Map<K,V> methods /////////////////////////////////////////////////////
  /** Gets the number of key-value pairs in the tree. */
  get size() {
    return this._size;
  }
  /** Gets the number of key-value pairs in the tree. */
  get length() {
    return this._size;
  }
  /** Returns true iff the tree contains no key-value pairs. */
  get isEmpty() {
    return this._size === 0;
  }
  /** Releases the tree so that its size is 0. */
  clear() {
    this._root = EmptyLeaf;
    this._size = 0;
  }
  /**
   * Finds a pair in the tree and returns the associated value.
   * @param defaultValue a value to return if the key was not found.
   * @returns the value, or defaultValue if the key was not found.
   * @description Computational complexity: O(log size)
   */
  get(key, defaultValue) {
    return this._root.get(key, defaultValue, this);
  }
  /**
   * Adds or overwrites a key-value pair in the B+ tree.
   * @param key the key is used to determine the sort order of
   *        data in the tree.
   * @param value data to associate with the key (optional)
   * @param overwrite Whether to overwrite an existing key-value pair
   *        (default: true). If this is false and there is an existing
   *        key-value pair then this method has no effect.
   * @returns true if a new key-value pair was added.
   * @description Computational complexity: O(log size)
   * Note: when overwriting a previous entry, the key is updated
   * as well as the value. This has no effect unless the new key
   * has data that does not affect its sort order.
   */
  set(key, value, overwrite) {
    if (this._root.isShared) this._root = this._root.clone();
    const result = this._root.set(key, value, overwrite, this);
    if (result === true || result === false) return result;
    this._root = new BNodeInternal([
      this._root,
      result
    ]);
    return true;
  }
  /**
   * Returns true if the key exists in the B+ tree, false if not.
   * Use get() for best performance; use has() if you need to
   * distinguish between "undefined value" and "key not present".
   * @param key Key to detect
   * @description Computational complexity: O(log size)
   */
  has(key) {
    return this.forRange(key, key, true, void 0) !== 0;
  }
  /**
   * Removes a single key-value pair from the B+ tree.
   * @param key Key to find
   * @returns true if a pair was found and removed, false otherwise.
   * @description Computational complexity: O(log size)
   */
  delete(key) {
    return this.editRange(key, key, true, DeleteRange) !== 0;
  }
  // ///////////////////////////////////////////////////////////////////////////
  // Additional methods ///////////////////////////////////////////////////////
  /** Returns the maximum number of children/values before nodes will split. */
  get maxNodeSize() {
    return this._maxNodeSize;
  }
  /** Gets the lowest key in the tree. Complexity: O(log size) */
  minKey() {
    return this._root.minKey();
  }
  /** Gets the highest key in the tree. Complexity: O(1) */
  maxKey() {
    return this._root.maxKey();
  }
  /** Gets an array of all keys, sorted */
  keysArray() {
    const results = [];
    this._root.forRange(this.minKey(), this.maxKey(), true, false, this, 0, (k, _v) => {
      results.push(k);
    });
    return results;
  }
  /** Returns the next pair whose key is larger than the specified key (or undefined if there is none).
   * If key === undefined, this function returns the lowest pair.
   * @param key The key to search for.
   * @param reusedArray Optional array used repeatedly to store key-value pairs, to
   * avoid creating a new array on every iteration.
   */
  nextHigherPair(key, reusedArray) {
    reusedArray = reusedArray || [];
    if (key === void 0) {
      return this._root.minPair(reusedArray);
    }
    return this._root.getPairOrNextHigher(key, this._compare, false, reusedArray);
  }
  /** Returns the next key larger than the specified key, or undefined if there is none.
   *  Also, nextHigherKey(undefined) returns the lowest key.
   */
  nextHigherKey(key) {
    const p = this.nextHigherPair(key, ReusedArray);
    return p && p[0];
  }
  /** Returns the next pair whose key is smaller than the specified key (or undefined if there is none).
   *  If key === undefined, this function returns the highest pair.
   * @param key The key to search for.
   * @param reusedArray Optional array used repeatedly to store key-value pairs, to
   *        avoid creating a new array each time you call this method.
   */
  nextLowerPair(key, reusedArray) {
    reusedArray = reusedArray || [];
    if (key === void 0) {
      return this._root.maxPair(reusedArray);
    }
    return this._root.getPairOrNextLower(key, this._compare, false, reusedArray);
  }
  /** Returns the next key smaller than the specified key, or undefined if there is none.
   *  Also, nextLowerKey(undefined) returns the highest key.
   */
  nextLowerKey(key) {
    const p = this.nextLowerPair(key, ReusedArray);
    return p && p[0];
  }
  /** Adds all pairs from a list of key-value pairs.
   * @param pairs Pairs to add to this tree. If there are duplicate keys,
   *        later pairs currently overwrite earlier ones (e.g. [[0,1],[0,7]]
   *        associates 0 with 7.)
   * @param overwrite Whether to overwrite pairs that already exist (if false,
   *        pairs[i] is ignored when the key pairs[i][0] already exists.)
   * @returns The number of pairs added to the collection.
   * @description Computational complexity: O(pairs.length * log(size + pairs.length))
   */
  setPairs(pairs, overwrite) {
    let added = 0;
    for (const pair of pairs) {
      if (this.set(pair[0], pair[1], overwrite)) added++;
    }
    return added;
  }
  /**
   * Scans the specified range of keys, in ascending order by key.
   * Note: the callback `onFound` must not insert or remove items in the
   * collection. Doing so may cause incorrect data to be sent to the
   * callback afterward.
   * @param low The first key scanned will be greater than or equal to `low`.
   * @param high Scanning stops when a key larger than this is reached.
   * @param includeHigh If the `high` key is present, `onFound` is called for
   *        that final pair if and only if this parameter is true.
   * @param onFound A function that is called for each key-value pair. This
   *        function can return {break:R} to stop early with result R.
   * @param initialCounter Initial third argument of onFound. This value
   *        increases by one each time `onFound` is called. Default: 0
   * @returns The number of values found, or R if the callback returned
   *        `{break:R}` to stop early.
   * @description Computational complexity: O(number of items scanned + log size)
   */
  forRange(low, high, includeHigh, onFound, initialCounter) {
    const r = this._root.forRange(low, high, includeHigh, false, this, initialCounter || 0, onFound);
    return typeof r === `number` ? r : r.break;
  }
  /**
   * Scans and potentially modifies values for a subsequence of keys.
   * Note: the callback `onFound` should ideally be a pure function.
   *   Specfically, it must not insert items, call clone(), or change
   *   the collection except via return value; out-of-band editing may
   *   cause an exception or may cause incorrect data to be sent to
   *   the callback (duplicate or missed items). It must not cause a
   *   clone() of the collection, otherwise the clone could be modified
   *   by changes requested by the callback.
   * @param low The first key scanned will be greater than or equal to `low`.
   * @param high Scanning stops when a key larger than this is reached.
   * @param includeHigh If the `high` key is present, `onFound` is called for
   *        that final pair if and only if this parameter is true.
   * @param onFound A function that is called for each key-value pair. This
   *        function can return `{value:v}` to change the value associated
   *        with the current key, `{delete:true}` to delete the current pair,
   *        `{break:R}` to stop early with result R, or it can return nothing
   *        (undefined or {}) to cause no effect and continue iterating.
   *        `{break:R}` can be combined with one of the other two commands.
   *        The third argument `counter` is the number of items iterated
   *        previously; it equals 0 when `onFound` is called the first time.
   * @returns The number of values scanned, or R if the callback returned
   *        `{break:R}` to stop early.
   * @description
   *   Computational complexity: O(number of items scanned + log size)
   *   Note: if the tree has been cloned with clone(), any shared
   *   nodes are copied before `onFound` is called. This takes O(n) time
   *   where n is proportional to the amount of shared data scanned.
   */
  editRange(low, high, includeHigh, onFound, initialCounter) {
    let root = this._root;
    if (root.isShared) this._root = root = root.clone();
    try {
      const r = root.forRange(low, high, includeHigh, true, this, initialCounter || 0, onFound);
      return typeof r === `number` ? r : r.break;
    } finally {
      let isShared;
      while (root.keys.length <= 1 && !root.isLeaf) {
        isShared ||= root.isShared;
        this._root = root = root.keys.length === 0 ? EmptyLeaf : root.children[0];
      }
      if (isShared) {
        root.isShared = true;
      }
    }
  }
};
var BNode = class _BNode {
  get isLeaf() {
    return this.children === void 0;
  }
  constructor(keys = [], values) {
    this.keys = keys;
    this.values = values || undefVals;
    this.isShared = void 0;
  }
  // /////////////////////////////////////////////////////////////////////////
  // Shared methods /////////////////////////////////////////////////////////
  maxKey() {
    return this.keys[this.keys.length - 1];
  }
  // If key not found, returns i^failXor where i is the insertion index.
  // Callers that don't care whether there was a match will set failXor=0.
  indexOf(key, failXor, cmp) {
    const keys = this.keys;
    let lo = 0, hi = keys.length, mid = hi >> 1;
    while (lo < hi) {
      const c = cmp(keys[mid], key);
      if (c < 0) lo = mid + 1;
      else if (c > 0) hi = mid;
      else if (c === 0) return mid;
      else {
        if (key === key) return keys.length;
        else throw new Error(`BTree: NaN was used as a key`);
      }
      mid = lo + hi >> 1;
    }
    return mid ^ failXor;
  }
  // ///////////////////////////////////////////////////////////////////////////
  // Leaf Node: misc //////////////////////////////////////////////////////////
  minKey() {
    return this.keys[0];
  }
  minPair(reusedArray) {
    if (this.keys.length === 0) return void 0;
    reusedArray[0] = this.keys[0];
    reusedArray[1] = this.values[0];
    return reusedArray;
  }
  maxPair(reusedArray) {
    if (this.keys.length === 0) return void 0;
    const lastIndex = this.keys.length - 1;
    reusedArray[0] = this.keys[lastIndex];
    reusedArray[1] = this.values[lastIndex];
    return reusedArray;
  }
  clone() {
    const v = this.values;
    return new _BNode(this.keys.slice(0), v === undefVals ? v : v.slice(0));
  }
  get(key, defaultValue, tree) {
    const i = this.indexOf(key, -1, tree._compare);
    return i < 0 ? defaultValue : this.values[i];
  }
  getPairOrNextLower(key, compare, inclusive, reusedArray) {
    const i = this.indexOf(key, -1, compare);
    const indexOrLower = i < 0 ? ~i - 1 : inclusive ? i : i - 1;
    if (indexOrLower >= 0) {
      reusedArray[0] = this.keys[indexOrLower];
      reusedArray[1] = this.values[indexOrLower];
      return reusedArray;
    }
    return void 0;
  }
  getPairOrNextHigher(key, compare, inclusive, reusedArray) {
    const i = this.indexOf(key, -1, compare);
    const indexOrLower = i < 0 ? ~i : inclusive ? i : i + 1;
    const keys = this.keys;
    if (indexOrLower < keys.length) {
      reusedArray[0] = keys[indexOrLower];
      reusedArray[1] = this.values[indexOrLower];
      return reusedArray;
    }
    return void 0;
  }
  // ///////////////////////////////////////////////////////////////////////////
  // Leaf Node: set & node splitting //////////////////////////////////////////
  set(key, value, overwrite, tree) {
    let i = this.indexOf(key, -1, tree._compare);
    if (i < 0) {
      i = ~i;
      tree._size++;
      if (this.keys.length < tree._maxNodeSize) {
        return this.insertInLeaf(i, key, value, tree);
      } else {
        const newRightSibling = this.splitOffRightSide();
        let target = this;
        if (i > this.keys.length) {
          i -= this.keys.length;
          target = newRightSibling;
        }
        target.insertInLeaf(i, key, value, tree);
        return newRightSibling;
      }
    } else {
      if (overwrite !== false) {
        if (value !== void 0) this.reifyValues();
        this.keys[i] = key;
        this.values[i] = value;
      }
      return false;
    }
  }
  reifyValues() {
    if (this.values === undefVals) return this.values = this.values.slice(0, this.keys.length);
    return this.values;
  }
  insertInLeaf(i, key, value, tree) {
    this.keys.splice(i, 0, key);
    if (this.values === undefVals) {
      while (undefVals.length < tree._maxNodeSize) undefVals.push(void 0);
      if (value === void 0) {
        return true;
      } else {
        this.values = undefVals.slice(0, this.keys.length - 1);
      }
    }
    this.values.splice(i, 0, value);
    return true;
  }
  takeFromRight(rhs) {
    let v = this.values;
    if (rhs.values === undefVals) {
      if (v !== undefVals) v.push(void 0);
    } else {
      v = this.reifyValues();
      v.push(rhs.values.shift());
    }
    this.keys.push(rhs.keys.shift());
  }
  takeFromLeft(lhs) {
    let v = this.values;
    if (lhs.values === undefVals) {
      if (v !== undefVals) v.unshift(void 0);
    } else {
      v = this.reifyValues();
      v.unshift(lhs.values.pop());
    }
    this.keys.unshift(lhs.keys.pop());
  }
  splitOffRightSide() {
    const half = this.keys.length >> 1, keys = this.keys.splice(half);
    const values = this.values === undefVals ? undefVals : this.values.splice(half);
    return new _BNode(keys, values);
  }
  // ///////////////////////////////////////////////////////////////////////////
  // Leaf Node: scanning & deletions //////////////////////////////////////////
  forRange(low, high, includeHigh, editMode, tree, count6, onFound) {
    const cmp = tree._compare;
    let iLow, iHigh;
    if (high === low) {
      if (!includeHigh) return count6;
      iHigh = (iLow = this.indexOf(low, -1, cmp)) + 1;
      if (iLow < 0) return count6;
    } else {
      iLow = this.indexOf(low, 0, cmp);
      iHigh = this.indexOf(high, -1, cmp);
      if (iHigh < 0) iHigh = ~iHigh;
      else if (includeHigh === true) iHigh++;
    }
    const keys = this.keys, values = this.values;
    if (onFound !== void 0) {
      for (let i = iLow; i < iHigh; i++) {
        const key = keys[i];
        const result = onFound(key, values[i], count6++);
        if (result !== void 0) {
          if (editMode === true) {
            if (key !== keys[i] || this.isShared === true) throw new Error(`BTree illegally changed or cloned in editRange`);
            if (result.delete) {
              this.keys.splice(i, 1);
              if (this.values !== undefVals) this.values.splice(i, 1);
              tree._size--;
              i--;
              iHigh--;
            } else if (result.hasOwnProperty(`value`)) {
              values[i] = result.value;
            }
          }
          if (result.break !== void 0) return result;
        }
      }
    } else count6 += iHigh - iLow;
    return count6;
  }
  /** Adds entire contents of right-hand sibling (rhs is left unchanged) */
  mergeSibling(rhs, _) {
    this.keys.push.apply(this.keys, rhs.keys);
    if (this.values === undefVals) {
      if (rhs.values === undefVals) return;
      this.values = this.values.slice(0, this.keys.length);
    }
    this.values.push.apply(this.values, rhs.reifyValues());
  }
};
var BNodeInternal = class _BNodeInternal extends BNode {
  /**
   * This does not mark `children` as shared, so it is the responsibility of the caller
   * to ensure children are either marked shared, or aren't included in another tree.
   */
  constructor(children, keys) {
    if (!keys) {
      keys = [];
      for (let i = 0; i < children.length; i++) keys[i] = children[i].maxKey();
    }
    super(keys);
    this.children = children;
  }
  minKey() {
    return this.children[0].minKey();
  }
  minPair(reusedArray) {
    return this.children[0].minPair(reusedArray);
  }
  maxPair(reusedArray) {
    return this.children[this.children.length - 1].maxPair(reusedArray);
  }
  get(key, defaultValue, tree) {
    const i = this.indexOf(key, 0, tree._compare), children = this.children;
    return i < children.length ? children[i].get(key, defaultValue, tree) : void 0;
  }
  getPairOrNextLower(key, compare, inclusive, reusedArray) {
    const i = this.indexOf(key, 0, compare), children = this.children;
    if (i >= children.length) return this.maxPair(reusedArray);
    const result = children[i].getPairOrNextLower(key, compare, inclusive, reusedArray);
    if (result === void 0 && i > 0) {
      return children[i - 1].maxPair(reusedArray);
    }
    return result;
  }
  getPairOrNextHigher(key, compare, inclusive, reusedArray) {
    const i = this.indexOf(key, 0, compare), children = this.children, length2 = children.length;
    if (i >= length2) return void 0;
    const result = children[i].getPairOrNextHigher(key, compare, inclusive, reusedArray);
    if (result === void 0 && i < length2 - 1) {
      return children[i + 1].minPair(reusedArray);
    }
    return result;
  }
  // ///////////////////////////////////////////////////////////////////////////
  // Internal Node: set & node splitting //////////////////////////////////////
  set(key, value, overwrite, tree) {
    const c = this.children, max4 = tree._maxNodeSize, cmp = tree._compare;
    let i = Math.min(this.indexOf(key, 0, cmp), c.length - 1), child = c[i];
    if (child.isShared) c[i] = child = child.clone();
    if (child.keys.length >= max4) {
      let other;
      if (i > 0 && (other = c[i - 1]).keys.length < max4 && cmp(child.keys[0], key) < 0) {
        if (other.isShared) c[i - 1] = other = other.clone();
        other.takeFromRight(child);
        this.keys[i - 1] = other.maxKey();
      } else if ((other = c[i + 1]) !== void 0 && other.keys.length < max4 && cmp(child.maxKey(), key) < 0) {
        if (other.isShared) c[i + 1] = other = other.clone();
        other.takeFromLeft(child);
        this.keys[i] = c[i].maxKey();
      }
    }
    const result = child.set(key, value, overwrite, tree);
    if (result === false) return false;
    this.keys[i] = child.maxKey();
    if (result === true) return true;
    if (this.keys.length < max4) {
      this.insert(i + 1, result);
      return true;
    } else {
      const newRightSibling = this.splitOffRightSide();
      let target = this;
      if (cmp(result.maxKey(), this.maxKey()) > 0) {
        target = newRightSibling;
        i -= this.keys.length;
      }
      target.insert(i + 1, result);
      return newRightSibling;
    }
  }
  /**
   * Inserts `child` at index `i`.
   * This does not mark `child` as shared, so it is the responsibility of the caller
   * to ensure that either child is marked shared, or it is not included in another tree.
   */
  insert(i, child) {
    this.children.splice(i, 0, child);
    this.keys.splice(i, 0, child.maxKey());
  }
  /**
   * Split this node.
   * Modifies this to remove the second half of the items, returning a separate node containing them.
   */
  splitOffRightSide() {
    const half = this.children.length >> 1;
    return new _BNodeInternal(this.children.splice(half), this.keys.splice(half));
  }
  takeFromRight(rhs) {
    this.keys.push(rhs.keys.shift());
    this.children.push(rhs.children.shift());
  }
  takeFromLeft(lhs) {
    this.keys.unshift(lhs.keys.pop());
    this.children.unshift(lhs.children.pop());
  }
  // ///////////////////////////////////////////////////////////////////////////
  // Internal Node: scanning & deletions //////////////////////////////////////
  // Note: `count` is the next value of the third argument to `onFound`.
  //       A leaf node's `forRange` function returns a new value for this counter,
  //       unless the operation is to stop early.
  forRange(low, high, includeHigh, editMode, tree, count6, onFound) {
    const cmp = tree._compare;
    const keys = this.keys, children = this.children;
    let iLow = this.indexOf(low, 0, cmp), i = iLow;
    const iHigh = Math.min(high === low ? iLow : this.indexOf(high, 0, cmp), keys.length - 1);
    if (!editMode) {
      for (; i <= iHigh; i++) {
        const result = children[i].forRange(low, high, includeHigh, editMode, tree, count6, onFound);
        if (typeof result !== `number`) return result;
        count6 = result;
      }
    } else if (i <= iHigh) {
      try {
        for (; i <= iHigh; i++) {
          if (children[i].isShared) children[i] = children[i].clone();
          const result = children[i].forRange(low, high, includeHigh, editMode, tree, count6, onFound);
          keys[i] = children[i].maxKey();
          if (typeof result !== `number`) return result;
          count6 = result;
        }
      } finally {
        const half = tree._maxNodeSize >> 1;
        if (iLow > 0) iLow--;
        for (i = iHigh; i >= iLow; i--) {
          if (children[i].keys.length <= half) {
            if (children[i].keys.length !== 0) {
              this.tryMerge(i, tree._maxNodeSize);
            } else {
              keys.splice(i, 1);
              children.splice(i, 1);
            }
          }
        }
        if (children.length !== 0 && children[0].keys.length === 0) check(false, `emptiness bug`);
      }
    }
    return count6;
  }
  /** Merges child i with child i+1 if their combined size is not too large */
  tryMerge(i, maxSize) {
    const children = this.children;
    if (i >= 0 && i + 1 < children.length) {
      if (children[i].keys.length + children[i + 1].keys.length <= maxSize) {
        if (children[i].isShared) children[i] = children[i].clone();
        children[i].mergeSibling(children[i + 1], maxSize);
        children.splice(i + 1, 1);
        this.keys.splice(i + 1, 1);
        this.keys[i] = children[i].maxKey();
        return true;
      }
    }
    return false;
  }
  /**
   * Move children from `rhs` into this.
   * `rhs` must be part of this tree, and be removed from it after this call
   * (otherwise isShared for its children could be incorrect).
   */
  mergeSibling(rhs, maxNodeSize) {
    const oldLength = this.keys.length;
    this.keys.push.apply(this.keys, rhs.keys);
    const rhsChildren = rhs.children;
    this.children.push.apply(this.children, rhsChildren);
    if (rhs.isShared && !this.isShared) {
      for (const child of rhsChildren) child.isShared = true;
    }
    this.tryMerge(oldLength - 1, maxNodeSize);
  }
};
var undefVals = [];
var Delete = {
  delete: true
};
var DeleteRange = () => Delete;
var EmptyLeaf = function() {
  const n = new BNode();
  n.isShared = true;
  return n;
}();
var ReusedArray = [];
function check(fact, ...args) {
  {
    args.unshift(`B+ tree`);
    throw new Error(args.join(` `));
  }
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/indexes/btree-index.js
var BTreeIndex = class extends BaseIndex {
  constructor(id, expression, name, options) {
    super(id, expression, name, options);
    this.supportedOperations = /* @__PURE__ */ new Set([
      `eq`,
      `gt`,
      `gte`,
      `lt`,
      `lte`,
      `in`
    ]);
    this.valueMap = /* @__PURE__ */ new Map();
    this.indexedKeys = /* @__PURE__ */ new Set();
    this.compareFn = defaultComparator;
    const baseCompareFn = options?.compareFn ?? defaultComparator;
    this.hasCustomComparator = options?.compareFn != null;
    this.compareFn = (a, b) => baseCompareFn(denormalizeUndefined(a), denormalizeUndefined(b));
    if (options?.compareOptions) {
      this.compareOptions = options.compareOptions;
    }
    this.orderedEntries = new BTree(this.compareFn);
  }
  initialize(_options) {
  }
  /**
   * Adds a value to the index
   */
  add(key, item) {
    let indexedValue2;
    try {
      indexedValue2 = this.evaluateIndexExpression(item);
    } catch (error) {
      throw new Error(`Failed to evaluate index expression for key ${key}: ${error}`);
    }
    const normalizedValue = normalizeForBTree(indexedValue2);
    this.addToBucket(key, normalizedValue);
    this.indexedKeys.add(key);
    this.updateTimestamp();
  }
  addToBucket(key, normalizedValue) {
    const keySet = this.valueMap.get(normalizedValue);
    if (keySet) {
      keySet.add(key);
    } else {
      const newKeySet = /* @__PURE__ */ new Set([
        key
      ]);
      this.valueMap.set(normalizedValue, newKeySet);
      this.orderedEntries.set(normalizedValue, void 0);
    }
  }
  /**
   * Removes a value from the index
   */
  remove(key, item) {
    let indexedValue2;
    try {
      indexedValue2 = this.evaluateIndexExpression(item);
    } catch (error) {
      console.warn(`Failed to evaluate index expression for key ${key} during removal:`, error);
      return;
    }
    const normalizedValue = normalizeForBTree(indexedValue2);
    this.removeFromBucket(key, normalizedValue);
    this.indexedKeys.delete(key);
    this.updateTimestamp();
  }
  removeFromBucket(key, normalizedValue) {
    const keySet = this.valueMap.get(normalizedValue);
    if (keySet) {
      keySet.delete(key);
      if (keySet.size === 0) {
        this.valueMap.delete(normalizedValue);
        this.orderedEntries.delete(normalizedValue);
      }
    }
  }
  /**
   * Updates a value in the index
   */
  update(key, oldItem, newItem) {
    let oldValue;
    let newValue;
    try {
      oldValue = normalizeForBTree(this.evaluateIndexExpression(oldItem));
      newValue = normalizeForBTree(this.evaluateIndexExpression(newItem));
    } catch {
      this.remove(key, oldItem);
      this.add(key, newItem);
      return;
    }
    if (areSameValueZeroEqual(oldValue, newValue) && this.valueMap.get(newValue)?.has(key)) {
      return;
    }
    this.removeFromBucket(key, oldValue);
    this.addToBucket(key, newValue);
    this.indexedKeys.add(key);
    this.updateTimestamp();
  }
  /**
   * Builds the index from a collection of entries
   */
  build(entries) {
    this.clear();
    for (const [key, item] of entries) {
      this.add(key, item);
    }
  }
  /**
   * Clears all data from the index
   */
  clear() {
    this.orderedEntries.clear();
    this.valueMap.clear();
    this.indexedKeys.clear();
    this.updateTimestamp();
  }
  /**
   * Performs a lookup operation
   */
  lookup(operation, value) {
    const startTime = performance.now();
    let result;
    switch (operation) {
      case `eq`:
        result = this.equalityLookup(value);
        break;
      case `gt`:
        result = this.rangeQuery({
          from: value,
          fromInclusive: false
        });
        break;
      case `gte`:
        result = this.rangeQuery({
          from: value,
          fromInclusive: true
        });
        break;
      case `lt`:
        result = this.rangeQuery({
          to: value,
          toInclusive: false
        });
        break;
      case `lte`:
        result = this.rangeQuery({
          to: value,
          toInclusive: true
        });
        break;
      case `in`:
        result = this.inArrayLookup(value);
        break;
      default:
        throw new Error(`Operation ${operation} not supported by BTreeIndex`);
    }
    this.trackLookup(startTime);
    return result;
  }
  /**
   * Gets the number of indexed keys
   */
  get keyCount() {
    return this.indexedKeys.size;
  }
  // Public methods for backward compatibility (used by tests)
  /**
   * Performs an equality lookup
   */
  equalityLookup(value) {
    const normalizedValue = normalizeForBTree(value);
    return new Set(this.valueMap.get(normalizedValue) ?? []);
  }
  /**
   * Performs a range query with options
   * This is more efficient for compound queries like "WHERE a > 5 AND a < 10"
   */
  rangeQuery(options = {}) {
    const { from, to, fromInclusive = true, toInclusive = true } = options;
    const result = /* @__PURE__ */ new Set();
    const hasFrom = `from` in options;
    const hasTo = `to` in options;
    const fromKey = hasFrom ? normalizeForBTree(from) : this.orderedEntries.minKey();
    const toKey = hasTo ? normalizeForBTree(to) : this.orderedEntries.maxKey();
    this.orderedEntries.forRange(fromKey, toKey, toInclusive, (indexedValue2, _) => {
      if (hasFrom && !fromInclusive && this.compareFn(indexedValue2, fromKey) === 0) {
        return;
      }
      const keys = this.valueMap.get(indexedValue2);
      if (keys) {
        keys.forEach((key) => result.add(key));
      }
    });
    return result;
  }
  /**
   * Performs a reversed range query
   */
  rangeQueryReversed(options = {}) {
    const { from, to, fromInclusive = true, toInclusive = true } = options;
    const hasFrom = `from` in options;
    const hasTo = `to` in options;
    return this.rangeQuery({
      from: hasTo ? to : this.orderedEntries.maxKey(),
      to: hasFrom ? from : this.orderedEntries.minKey(),
      fromInclusive: toInclusive,
      toInclusive: fromInclusive
    });
  }
  /**
   * Internal method for taking items from the index.
   * @param n - The number of items to return
   * @param nextPair - Function to get the next pair from the BTree
   * @param from - Already normalized! undefined means "start from beginning/end", sentinel means "start from the key undefined"
   * @param filterFn - Optional filter function
   * @param reversed - Whether to reverse the order of keys within each value
   */
  takeInternal(n, nextPair, from, filterFn, reversed = false) {
    const keysInResult = /* @__PURE__ */ new Set();
    const result = [];
    let pair;
    let key = from;
    while ((pair = nextPair(key)) !== void 0 && result.length < n) {
      key = pair[0];
      const keys = this.valueMap.get(key);
      if (keys && keys.size > 0) {
        const sorted = Array.from(keys).sort(compareKeys);
        if (reversed) sorted.reverse();
        for (const ks of sorted) {
          if (result.length >= n) break;
          if (!keysInResult.has(ks) && (filterFn?.(ks) ?? true)) {
            result.push(ks);
            keysInResult.add(ks);
          }
        }
      }
    }
    return result;
  }
  /**
   * Returns the next n items after the provided item.
   * @param n - The number of items to return
   * @param from - The item to start from (exclusive).
   * @returns The next n items after the provided key.
   */
  take(n, from, filterFn) {
    const nextPair = (k) => this.orderedEntries.nextHigherPair(k);
    const normalizedFrom = normalizeForBTree(from);
    return this.takeInternal(n, nextPair, normalizedFrom, filterFn);
  }
  /**
   * Returns the first n items from the beginning.
   * @param n - The number of items to return
   * @param filterFn - Optional filter function
   * @returns The first n items
   */
  takeFromStart(n, filterFn) {
    const nextPair = (k) => this.orderedEntries.nextHigherPair(k);
    return this.takeInternal(n, nextPair, void 0, filterFn);
  }
  /**
   * Returns the next n items **before** the provided item (in descending order).
   * @param n - The number of items to return
   * @param from - The item to start from (exclusive). Required.
   * @returns The next n items **before** the provided key.
   */
  takeReversed(n, from, filterFn) {
    const nextPair = (k) => this.orderedEntries.nextLowerPair(k);
    const normalizedFrom = normalizeForBTree(from);
    return this.takeInternal(n, nextPair, normalizedFrom, filterFn, true);
  }
  /**
   * Returns the last n items from the end.
   * @param n - The number of items to return
   * @param filterFn - Optional filter function
   * @returns The last n items
   */
  takeReversedFromEnd(n, filterFn) {
    const nextPair = (k) => this.orderedEntries.nextLowerPair(k);
    return this.takeInternal(n, nextPair, void 0, filterFn, true);
  }
  /**
   * Performs an IN array lookup
   */
  inArrayLookup(values) {
    const result = /* @__PURE__ */ new Set();
    for (const value of values) {
      const normalizedValue = normalizeForBTree(value);
      const keys = this.valueMap.get(normalizedValue);
      if (keys) {
        keys.forEach((key) => result.add(key));
      }
    }
    return result;
  }
  // Getter methods for testing compatibility
  get indexedKeysSet() {
    return this.indexedKeys;
  }
  get orderedEntriesArray() {
    return this.orderedEntries.keysArray().map((key) => [
      denormalizeUndefined(key),
      this.valueMap.get(key) ?? /* @__PURE__ */ new Set()
    ]);
  }
  get orderedEntriesArrayReversed() {
    return this.takeReversedFromEnd(this.orderedEntries.size).map((key) => [
      denormalizeUndefined(key),
      this.valueMap.get(key) ?? /* @__PURE__ */ new Set()
    ]);
  }
  get valueMapData() {
    const result = /* @__PURE__ */ new Map();
    for (const [key, value] of this.valueMap) {
      result.set(denormalizeUndefined(key), value);
    }
    return result;
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/query/optimizer.js
function optimizeQuery(query) {
  if (query.from.type === `unionAll`) {
    return {
      optimizedQuery: {
        ...query,
        from: new UnionAll(query.from.queries.map((branch) => optimizeQuery(branch).optimizedQuery))
      },
      sourceWhereClauses: /* @__PURE__ */ new Map()
    };
  }
  const sourceWhereClauses = extractSourceWhereClauses(query);
  let optimized = query;
  let previousOptimized;
  let iterations = 0;
  const maxIterations = 10;
  while (iterations < maxIterations && !deepEquals(optimized, previousOptimized)) {
    previousOptimized = optimized;
    optimized = applyRecursiveOptimization(optimized);
    iterations++;
  }
  const cleaned = removeRedundantSubqueries(optimized);
  return {
    optimizedQuery: cleaned,
    sourceWhereClauses
  };
}
function extractSourceWhereClauses(query) {
  const sourceWhereClauses = /* @__PURE__ */ new Map();
  if (!query.where || query.where.length === 0) {
    return sourceWhereClauses;
  }
  const splitWhereClauses = splitAndClauses(query.where);
  const analyzedClauses = splitWhereClauses.map((clause) => analyzeWhereClause(clause));
  const groupedClauses = groupWhereClauses(analyzedClauses);
  const nullableSources = getNullableJoinSources(query);
  for (const [sourceAlias, whereClause] of groupedClauses.singleSource) {
    if (isCollectionReference(query, sourceAlias) && !nullableSources.has(sourceAlias)) {
      sourceWhereClauses.set(sourceAlias, whereClause);
    }
  }
  return sourceWhereClauses;
}
function isCollectionReference(query, sourceAlias) {
  for (const source of getFromSources(query.from)) {
    if (source.alias === sourceAlias) {
      return source.type === `collectionRef`;
    }
  }
  if (query.join) {
    for (const joinClause of query.join) {
      if (joinClause.from.alias === sourceAlias) {
        return joinClause.from.type === `collectionRef`;
      }
    }
  }
  return false;
}
function getNullableJoinSources(query) {
  const nullable = /* @__PURE__ */ new Set();
  if (query.join) {
    const leftAliases = new Set(getFromSources(query.from).map((source) => source.alias));
    for (const join2 of query.join) {
      const joinedAlias = join2.from.alias;
      if (join2.type === `left` || join2.type === `full`) {
        nullable.add(joinedAlias);
      }
      if (join2.type === `right` || join2.type === `full`) {
        for (const leftAlias of leftAliases) {
          nullable.add(leftAlias);
        }
      }
      leftAliases.add(joinedAlias);
    }
  }
  return nullable;
}
function applyRecursiveOptimization(query) {
  const subqueriesOptimized = {
    ...query,
    from: optimizeNestedFrom(query.from),
    join: query.join?.map((joinClause) => ({
      ...joinClause,
      from: joinClause.from.type === `queryRef` ? new QueryRef(applyRecursiveOptimization(joinClause.from.query), joinClause.from.alias) : joinClause.from
    }))
  };
  return applySingleLevelOptimization(subqueriesOptimized);
}
function applySingleLevelOptimization(query) {
  if (!query.where || query.where.length === 0) {
    return query;
  }
  if (query.from.type === `unionFrom`) {
    return query;
  }
  if (!query.join || query.join.length === 0) {
    if (query.where.length > 1) {
      const splitWhereClauses2 = splitAndClauses(query.where);
      const combinedWhere = combineWithAnd(splitWhereClauses2);
      return {
        ...query,
        where: [
          combinedWhere
        ]
      };
    }
    return query;
  }
  const nonResidualWhereClauses = query.where.filter((where) => !isResidualWhere(where));
  const splitWhereClauses = splitAndClauses(nonResidualWhereClauses);
  const analyzedClauses = splitWhereClauses.map((clause) => analyzeWhereClause(clause));
  const groupedClauses = groupWhereClauses(analyzedClauses);
  const optimizedQuery = applyOptimizations(query, groupedClauses);
  const residualWhereClauses = query.where.filter((where) => isResidualWhere(where));
  if (residualWhereClauses.length > 0) {
    optimizedQuery.where = [
      ...optimizedQuery.where || [],
      ...residualWhereClauses
    ];
  }
  return optimizedQuery;
}
function removeRedundantSubqueries(query) {
  return {
    ...query,
    from: removeRedundantFromClause(query.from),
    join: query.join?.map((joinClause) => ({
      ...joinClause,
      from: removeRedundantJoinFromClause(joinClause.from)
    }))
  };
}
function removeRedundantFromClause(from) {
  if (from.type === `unionFrom`) {
    return new UnionFrom(from.sources.map((source) => removeRedundantFromClause(source)));
  }
  if (from.type === `unionAll`) {
    return new UnionAll(from.queries.map((branch) => removeRedundantSubqueries(branch)));
  }
  if (from.type === `collectionRef`) {
    return from;
  }
  const processedQuery = removeRedundantSubqueries(from.query);
  if (isRedundantSubquery(processedQuery)) {
    const innerFrom = removeRedundantFromClause(processedQuery.from);
    if (innerFrom.type === `collectionRef`) {
      return new CollectionRef(innerFrom.collection, from.alias);
    } else if (innerFrom.type === `queryRef`) {
      return new QueryRef(innerFrom.query, from.alias);
    }
  }
  return new QueryRef(processedQuery, from.alias);
}
function removeRedundantJoinFromClause(from) {
  return removeRedundantFromClause(from);
}
function isRedundantSubquery(query) {
  return (!query.where || query.where.length === 0) && !query.select && (!query.groupBy || query.groupBy.length === 0) && (!query.having || query.having.length === 0) && (!query.orderBy || query.orderBy.length === 0) && (!query.join || query.join.length === 0) && query.limit === void 0 && query.offset === void 0 && !query.fnSelect && (!query.fnWhere || query.fnWhere.length === 0) && (!query.fnHaving || query.fnHaving.length === 0);
}
function splitAndClauses(whereClauses) {
  const result = [];
  for (const whereClause of whereClauses) {
    const clause = getWhereExpression(whereClause);
    result.push(...splitAndClausesRecursive(clause));
  }
  return result;
}
function splitAndClausesRecursive(clause) {
  if (clause.type === `func` && clause.name === `and`) {
    const result = [];
    for (const arg of clause.args) {
      result.push(...splitAndClausesRecursive(arg));
    }
    return result;
  } else {
    return [
      clause
    ];
  }
}
function analyzeWhereClause(clause) {
  const touchedSources = /* @__PURE__ */ new Set();
  let hasNamespaceOnlyRef = false;
  function collectSources(expr) {
    switch (expr.type) {
      case `ref`:
        if (expr.path && expr.path.length > 0) {
          const firstElement = expr.path[0];
          if (firstElement) {
            touchedSources.add(firstElement);
            if (expr.path.length === 1) {
              hasNamespaceOnlyRef = true;
            }
          }
        }
        break;
      case `func`:
        if (expr.args) {
          expr.args.forEach(collectSources);
        }
        break;
      case `val`:
        break;
      case `agg`:
        if (expr.args) {
          expr.args.forEach(collectSources);
        }
        break;
    }
  }
  collectSources(clause);
  return {
    expression: clause,
    touchedSources,
    hasNamespaceOnlyRef
  };
}
function groupWhereClauses(analyzedClauses) {
  const singleSource = /* @__PURE__ */ new Map();
  const multiSource = [];
  for (const clause of analyzedClauses) {
    if (clause.touchedSources.size === 1 && !clause.hasNamespaceOnlyRef) {
      const source = Array.from(clause.touchedSources)[0];
      if (!singleSource.has(source)) {
        singleSource.set(source, []);
      }
      singleSource.get(source).push(clause.expression);
    } else if (clause.touchedSources.size > 1 || clause.hasNamespaceOnlyRef) {
      multiSource.push(clause.expression);
    }
  }
  const combinedSingleSource = /* @__PURE__ */ new Map();
  for (const [source, clauses] of singleSource) {
    combinedSingleSource.set(source, combineWithAnd(clauses));
  }
  const combinedMultiSource = multiSource.length > 0 ? combineWithAnd(multiSource) : void 0;
  return {
    singleSource: combinedSingleSource,
    multiSource: combinedMultiSource
  };
}
function applyOptimizations(query, groupedClauses) {
  const actuallyOptimized = /* @__PURE__ */ new Set();
  const nullableSources = getNullableJoinSources(query);
  const pushableSingleSource = /* @__PURE__ */ new Map();
  for (const [source, clause] of groupedClauses.singleSource) {
    if (!nullableSources.has(source)) {
      pushableSingleSource.set(source, clause);
    }
  }
  const optimizedFrom = optimizeFromWithTracking(query.from, pushableSingleSource, actuallyOptimized);
  const optimizedJoins = query.join ? query.join.map((joinClause) => ({
    ...joinClause,
    from: optimizeJoinFromWithTracking(joinClause.from, pushableSingleSource, actuallyOptimized)
  })) : void 0;
  const remainingWhereClauses = [];
  if (groupedClauses.multiSource) {
    remainingWhereClauses.push(groupedClauses.multiSource);
  }
  const hasOuterJoins = nullableSources.size > 0;
  for (const [source, clause] of groupedClauses.singleSource) {
    if (!actuallyOptimized.has(source)) {
      remainingWhereClauses.push(clause);
    } else if (hasOuterJoins) {
      remainingWhereClauses.push(createResidualWhere(clause));
    }
  }
  const finalWhere = remainingWhereClauses.length > 1 ? [
    combineWithAnd(remainingWhereClauses.flatMap((clause) => splitAndClausesRecursive(getWhereExpression(clause))))
  ] : remainingWhereClauses;
  const optimizedQuery = {
    // Copy all non-optimized fields as-is
    select: query.select,
    groupBy: query.groupBy ? [
      ...query.groupBy
    ] : void 0,
    having: query.having ? [
      ...query.having
    ] : void 0,
    orderBy: query.orderBy ? [
      ...query.orderBy
    ] : void 0,
    limit: query.limit,
    offset: query.offset,
    distinct: query.distinct,
    fnSelect: query.fnSelect,
    fnWhere: query.fnWhere ? [
      ...query.fnWhere
    ] : void 0,
    fnHaving: query.fnHaving ? [
      ...query.fnHaving
    ] : void 0,
    // Use the optimized FROM and JOIN clauses
    from: optimizedFrom,
    join: optimizedJoins,
    // Include combined WHERE clauses
    where: finalWhere.length > 0 ? finalWhere : []
  };
  return optimizedQuery;
}
function deepCopyQuery(query) {
  return {
    // Recursively copy the FROM clause
    from: deepCopyFrom(query.from),
    // Copy all other fields, creating new arrays where necessary
    select: query.select,
    join: query.join ? query.join.map((joinClause) => ({
      type: joinClause.type,
      left: joinClause.left,
      right: joinClause.right,
      from: deepCopyJoinFrom(joinClause.from)
    })) : void 0,
    where: query.where ? [
      ...query.where
    ] : void 0,
    groupBy: query.groupBy ? [
      ...query.groupBy
    ] : void 0,
    having: query.having ? [
      ...query.having
    ] : void 0,
    orderBy: query.orderBy ? [
      ...query.orderBy
    ] : void 0,
    limit: query.limit,
    offset: query.offset,
    fnSelect: query.fnSelect,
    fnWhere: query.fnWhere ? [
      ...query.fnWhere
    ] : void 0,
    fnHaving: query.fnHaving ? [
      ...query.fnHaving
    ] : void 0
  };
}
function deepCopyFrom(from) {
  if (from.type === `collectionRef`) {
    return new CollectionRef(from.collection, from.alias);
  }
  if (from.type === `queryRef`) {
    return new QueryRef(deepCopyQuery(from.query), from.alias);
  }
  if (from.type === `unionAll`) {
    return new UnionAll(from.queries.map((branch) => deepCopyQuery(branch)));
  }
  return new UnionFrom(from.sources.map((source) => deepCopyFrom(source)));
}
function deepCopyJoinFrom(from) {
  return deepCopyFrom(from);
}
function optimizeNestedFrom(from) {
  if (from.type === `queryRef`) {
    return new QueryRef(applyRecursiveOptimization(from.query), from.alias);
  }
  if (from.type === `unionFrom`) {
    return new UnionFrom(from.sources.map((source) => optimizeNestedFrom(source)));
  }
  if (from.type === `unionAll`) {
    return new UnionAll(from.queries.map((branch) => applyRecursiveOptimization(branch)));
  }
  return from;
}
function getFromSources(from) {
  if (from.type === `unionFrom`) {
    return from.sources;
  }
  if (from.type === `unionAll`) {
    return [];
  }
  return [
    from
  ];
}
function getFirstFromAlias(query) {
  return getFromSources(query.from)[0]?.alias;
}
function optimizeFromWithTracking(from, singleSourceClauses, actuallyOptimized) {
  if (from.type === `unionFrom`) {
    return new UnionFrom(from.sources.map((source) => optimizeJoinFromWithTracking(source, singleSourceClauses, actuallyOptimized)));
  }
  if (from.type === `unionAll`) {
    return new UnionAll(from.queries.map((branch) => deepCopyQuery(branch)));
  }
  const whereClause = singleSourceClauses.get(from.alias);
  if (!whereClause) {
    if (from.type === `collectionRef`) {
      return new CollectionRef(from.collection, from.alias);
    }
    return new QueryRef(deepCopyQuery(from.query), from.alias);
  }
  if (from.type === `collectionRef`) {
    const subQuery = {
      from: new CollectionRef(from.collection, from.alias),
      where: [
        whereClause
      ]
    };
    actuallyOptimized.add(from.alias);
    return new QueryRef(subQuery, from.alias);
  }
  if (!isSafeToPushIntoExistingSubquery(from.query, whereClause, from.alias)) {
    return new QueryRef(deepCopyQuery(from.query), from.alias);
  }
  if (referencesAliasWithRemappedSelect(from.query, whereClause, from.alias)) {
    return new QueryRef(deepCopyQuery(from.query), from.alias);
  }
  const existingWhere = from.query.where || [];
  const optimizedSubQuery = {
    ...deepCopyQuery(from.query),
    where: [
      ...existingWhere,
      whereClause
    ]
  };
  actuallyOptimized.add(from.alias);
  return new QueryRef(optimizedSubQuery, from.alias);
}
function optimizeJoinFromWithTracking(from, singleSourceClauses, actuallyOptimized) {
  return optimizeFromWithTracking(from, singleSourceClauses, actuallyOptimized);
}
function unsafeSelect(query, whereClause, outerAlias) {
  if (!query.select) return false;
  return selectHasAggregates(query.select) || whereReferencesComputedSelectFields(query.select, whereClause, outerAlias);
}
function unsafeGroupBy(query) {
  return query.groupBy && query.groupBy.length > 0;
}
function unsafeHaving(query) {
  return query.having && query.having.length > 0;
}
function unsafeOrderBy(query) {
  return query.orderBy && query.orderBy.length > 0 && (query.limit !== void 0 || query.offset !== void 0);
}
function unsafeFnSelect(query) {
  return query.fnSelect || query.fnWhere && query.fnWhere.length > 0 || query.fnHaving && query.fnHaving.length > 0;
}
function isSafeToPushIntoExistingSubquery(query, whereClause, outerAlias) {
  return !(unsafeSelect(query, whereClause, outerAlias) || unsafeGroupBy(query) || unsafeHaving(query) || unsafeOrderBy(query) || unsafeFnSelect(query));
}
function selectHasAggregates(select) {
  for (const value of Object.values(select)) {
    if (typeof value === `object`) {
      const v = value;
      if (v.type === `agg`) return true;
      if (!(`type` in v)) {
        if (selectHasAggregates(v)) return true;
      }
    }
  }
  return false;
}
function collectRefs(expr) {
  const refs = [];
  if (expr == null || typeof expr !== `object`) return refs;
  switch (expr.type) {
    case `ref`:
      refs.push(expr);
      break;
    case `func`:
    case `agg`:
      for (const arg of expr.args ?? []) {
        refs.push(...collectRefs(arg));
      }
      break;
  }
  return refs;
}
function whereReferencesComputedSelectFields(select, whereClause, outerAlias) {
  const computed = /* @__PURE__ */ new Set();
  for (const [key, value] of Object.entries(select)) {
    if (key.startsWith(`__SPREAD_SENTINEL__`)) continue;
    if (value instanceof PropRef) continue;
    computed.add(key);
  }
  const refs = collectRefs(whereClause);
  for (const ref of refs) {
    const path = ref.path;
    if (!Array.isArray(path) || path.length < 2) continue;
    const alias = path[0];
    const field = path[1];
    if (alias !== outerAlias) continue;
    if (computed.has(field)) return true;
  }
  return false;
}
function referencesAliasWithRemappedSelect(subquery, whereClause, outerAlias) {
  const refs = collectRefs(whereClause);
  if (refs.every((ref) => ref.path[0] !== outerAlias)) {
    return false;
  }
  if (subquery.fnSelect) {
    return true;
  }
  const select = subquery.select;
  if (!select) {
    return false;
  }
  for (const ref of refs) {
    const path = ref.path;
    if (path.length < 2) continue;
    if (path[0] !== outerAlias) continue;
    const projected = select[path[1]];
    if (!projected) continue;
    if (!(projected instanceof PropRef)) {
      return true;
    }
    if (projected.path.length < 2) {
      return true;
    }
    const [innerAlias, innerField] = projected.path;
    const firstFromAlias = getFirstFromAlias(subquery);
    if (innerAlias !== outerAlias && innerAlias !== firstFromAlias) {
      return true;
    }
    if (innerField !== path[1]) {
      return true;
    }
  }
  return false;
}
function combineWithAnd(expressions) {
  if (expressions.length === 0) {
    throw new CannotCombineEmptyExpressionListError();
  }
  if (expressions.length === 1) {
    return expressions[0];
  }
  return new Func(`and`, expressions);
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/query/compiler/lazy-targets.js
function getLazyLoadTargets(rawQuery, lazyFrom, lazyAlias, lazySourceExpr, lazySource, aliasRemapping) {
  if (lazyFrom.type === `unionFrom`) {
    return getTargetsFromExpression(rawQuery, lazySourceExpr);
  }
  if (lazyFrom.type === `queryRef` && containsUnionFrom(lazyFrom.query.from)) {
    const targets = getTargetsFromQueryRef(lazyFrom.query, lazyAlias, lazySourceExpr);
    return dedupeLazyLoadTargets(targets);
  }
  if (!lazySource) {
    return [];
  }
  const lazySourceRef = toPropRef(lazySourceExpr);
  if (!lazySourceRef) {
    return [];
  }
  const followRefResult = followRef(rawQuery, lazySourceRef, lazySource);
  if (!followRefResult) {
    return [];
  }
  return [
    {
      alias: followRefResult.alias || aliasRemapping[lazyAlias] || lazyAlias,
      collection: followRefResult.collection,
      path: followRefResult.path
    }
  ];
}
function containsUnionFrom(from) {
  if (from.type === `unionFrom`) {
    return true;
  }
  if (from.type === `queryRef`) {
    return containsUnionFrom(from.query.from);
  }
  if (from.type === `unionAll`) {
    return from.queries.some((query) => containsUnionFrom(query.from));
  }
  return false;
}
function getTargetsFromQueryRef(query, outerAlias, expr) {
  if (!expr || typeof expr !== `object` || !(`type` in expr)) {
    return [];
  }
  const expression = expr;
  if (expression.type === `func` && expression.name === `coalesce`) {
    return dedupeLazyLoadTargets(expression.args.flatMap((arg) => getTargetsFromQueryRef(query, outerAlias, arg)));
  }
  const ref = toPropRef(expression);
  if (!ref || ref.path[0] !== outerAlias) {
    return [];
  }
  return getTargetsFromPropRef(query, new PropRef(ref.path.slice(1)));
}
function getTargetsFromExpression(query, expr) {
  if (!expr || typeof expr !== `object` || !(`type` in expr)) {
    return [];
  }
  const expression = expr;
  if (expression.type === `ref`) {
    return getTargetsFromPropRef(query, expression);
  }
  if (expression.type === `func` && expression.name === `coalesce`) {
    return dedupeLazyLoadTargets(expression.args.flatMap((arg) => getTargetsFromExpression(query, arg)));
  }
  return [];
}
function getTargetsFromPropRef(query, ref) {
  if (ref.path.length === 0) {
    return [];
  }
  if (ref.path.length === 1) {
    const field = ref.path[0];
    const selectedField = query.select?.[field];
    if (selectedField) {
      return getTargetsFromExpression(query, selectedField);
    }
    return [];
  }
  const [alias, ...path] = ref.path;
  const source = getSourceFromAlias(query, alias);
  if (!source) {
    return [];
  }
  if (source.type === `collectionRef`) {
    return [
      {
        alias: source.alias,
        collection: source.collection,
        path
      }
    ];
  }
  if (source.query.limit || source.query.offset) {
    return [];
  }
  return getTargetsFromQueryRef(source.query, source.alias, ref);
}
function getSourceFromAlias(query, alias) {
  if (query.join) {
    for (const join2 of query.join) {
      if (join2.from.alias === alias) {
        return join2.from;
      }
    }
  }
  const from = query.from;
  const sources = from.type === `unionFrom` ? from.sources : from.type === `unionAll` ? [] : [
    from
  ];
  return sources.find((source) => source.alias === alias);
}
function dedupeLazyLoadTargets(targets) {
  const seen = /* @__PURE__ */ new Set();
  const deduped = [];
  for (const target of targets) {
    const key = `${target.alias}:${target.path.join(`.`)}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(target);
    }
  }
  return deduped;
}
function toPropRef(expr) {
  if (expr instanceof PropRef) {
    return expr;
  }
  if (expr && typeof expr === `object` && `type` in expr && expr.type === `ref` && Array.isArray(expr.path)) {
    return new PropRef(expr.path);
  }
  return void 0;
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/query/compiler/joins.js
function processJoins(pipeline, joinClauses, sources, mainCollectionId, mainSource, allInputs, cache, queryMapping, collections, subscriptions, callbacks, lazySources, optimizableOrderByCollections, setWindowFn, rawQuery, onCompileSubquery, aliasToCollectionId, aliasRemapping, sourceWhereClauses) {
  let resultPipeline = pipeline;
  for (const joinClause of joinClauses) {
    resultPipeline = processJoin(resultPipeline, joinClause, sources, mainCollectionId, mainSource, allInputs, cache, queryMapping, collections, subscriptions, callbacks, lazySources, optimizableOrderByCollections, setWindowFn, rawQuery, onCompileSubquery, aliasToCollectionId, aliasRemapping, sourceWhereClauses);
  }
  return resultPipeline;
}
function processJoin(pipeline, joinClause, sources, mainCollectionId, mainSource, allInputs, cache, queryMapping, collections, subscriptions, callbacks, lazySources, optimizableOrderByCollections, setWindowFn, rawQuery, onCompileSubquery, aliasToCollectionId, aliasRemapping, sourceWhereClauses) {
  const isCollectionRef = joinClause.from.type === `collectionRef`;
  const { alias: joinedSource, input: joinedInput, collectionId: joinedCollectionId } = processJoinSource(joinClause.from, allInputs, collections, subscriptions, callbacks, lazySources, optimizableOrderByCollections, setWindowFn, cache, queryMapping, onCompileSubquery, aliasToCollectionId, aliasRemapping, sourceWhereClauses);
  sources[joinedSource] = joinedInput;
  if (isCollectionRef) {
    aliasToCollectionId[joinedSource] = joinedCollectionId;
  }
  const mainCollection = collections[mainCollectionId];
  const joinedCollection = collections[joinedCollectionId];
  if (!mainCollection) {
    throw new JoinCollectionNotFoundError(mainCollectionId);
  }
  if (!joinedCollection) {
    throw new JoinCollectionNotFoundError(joinedCollectionId);
  }
  const { activeSource, lazySource } = getActiveAndLazySources(joinClause.type, mainCollection, joinedCollection);
  const availableSources = Object.keys(sources);
  const { mainExpr, joinedExpr } = analyzeJoinExpressions(joinClause.left, joinClause.right, availableSources, joinedSource, rawQuery.from.type === `unionAll`);
  const compiledMainExpr = compileExpression(mainExpr);
  const compiledJoinedExpr = compileExpression(joinedExpr);
  let mainPipeline = pipeline.pipe(map(([currentKey, namespacedRow]) => {
    const mainKey = normalizeValue(compiledMainExpr(namespacedRow));
    return [
      mainKey,
      [
        currentKey,
        namespacedRow
      ]
    ];
  }));
  let joinedPipeline = joinedInput.pipe(map(([currentKey, row]) => {
    const namespacedRow = {
      [joinedSource]: row
    };
    const joinedKey = normalizeValue(compiledJoinedExpr(namespacedRow));
    return [
      joinedKey,
      [
        currentKey,
        namespacedRow
      ]
    ];
  }));
  if (![
    `inner`,
    `left`,
    `right`,
    `full`
  ].includes(joinClause.type)) {
    throw new UnsupportedJoinTypeError(joinClause.type);
  }
  if (activeSource) {
    const lazyFrom = activeSource === `main` ? joinClause.from : rawQuery.from;
    const limitedSubquery = lazyFrom.type === `queryRef` && (lazyFrom.query.limit || lazyFrom.query.offset);
    const resultUnionLazySide = lazyFrom.type === `unionAll`;
    const lazySourceJoinExpr = activeSource === `main` ? joinedExpr : mainExpr;
    const lazyAlias = activeSource === `main` ? joinedSource : mainSource;
    const lazyTargets = resultUnionLazySide ? [] : getLazyLoadTargets(rawQuery, lazyFrom, lazyAlias, lazySourceJoinExpr, lazySource, aliasRemapping);
    if (!limitedSubquery && lazyTargets.length > 0) {
      for (const target of lazyTargets) {
        lazySources.add(target.alias);
      }
      const activePipeline = activeSource === `main` ? mainPipeline : joinedPipeline;
      for (const target of lazyTargets) {
        const fieldName = target.path[0];
        if (fieldName) {
          ensureIndexForField(fieldName, target.path, target.collection);
        }
      }
      const activePipelineWithLoading = activePipeline.pipe(tap((data) => {
        const joinKeys = [
          ...new Set(data.getInner().map(([[joinKey]]) => joinKey).filter((key) => key != null))
        ];
        if (joinKeys.length === 0) {
          return;
        }
        for (const target of lazyTargets) {
          const lazySourceSubscription = subscriptions[target.alias];
          if (!lazySourceSubscription) {
            throw new SubscriptionNotFoundError(target.alias, lazyAlias, target.collection.id, Object.keys(subscriptions));
          }
          if (lazySourceSubscription.hasLoadedInitialState()) {
            continue;
          }
          const lazyJoinRef = new PropRef(target.path);
          const loaded = lazySourceSubscription.requestSnapshot({
            where: inArray(lazyJoinRef, joinKeys),
            optimizedOnly: true
          });
          if (!loaded) {
            const collectionId = target.collection.id;
            const fieldPath = target.path.join(`.`);
            console.warn(`[TanStack DB]${collectionId ? ` [${collectionId}]` : ``} Join requires an index on "${fieldPath}" for efficient loading. Falling back to loading all data. Consider creating an index on the collection with collection.createIndex((row) => row.${fieldPath}) or enable auto-indexing with autoIndex: 'eager' and a defaultIndexType.`);
            lazySourceSubscription.requestSnapshot();
          }
        }
      }));
      if (activeSource === `main`) {
        mainPipeline = activePipelineWithLoading;
      } else {
        joinedPipeline = activePipelineWithLoading;
      }
    }
  }
  return mainPipeline.pipe(join(joinedPipeline, joinClause.type), processJoinResults(joinClause.type));
}
function analyzeJoinExpressions(left, right, allAvailableSourceAliases, joinedSource, allowResultFields = false) {
  const availableSources = allAvailableSourceAliases.filter((alias) => alias !== joinedSource);
  const leftSourceAliases = getSourceAliasesFromExpression(left);
  const rightSourceAliases = getSourceAliasesFromExpression(right);
  const leftReferencesJoined = leftSourceAliases.has(joinedSource);
  const rightReferencesJoined = rightSourceAliases.has(joinedSource);
  const leftAvailableAliases = [
    ...leftSourceAliases
  ].filter((alias) => availableSources.includes(alias) || allowResultFields && alias !== joinedSource);
  const rightAvailableAliases = [
    ...rightSourceAliases
  ].filter((alias) => availableSources.includes(alias) || allowResultFields && alias !== joinedSource);
  if (leftAvailableAliases.length > 0 && !leftReferencesJoined && rightReferencesJoined && rightAvailableAliases.length === 0) {
    return {
      mainExpr: left,
      joinedExpr: right
    };
  }
  if (leftReferencesJoined && leftAvailableAliases.length === 0 && rightAvailableAliases.length > 0 && !rightReferencesJoined) {
    return {
      mainExpr: right,
      joinedExpr: left
    };
  }
  if (leftSourceAliases.size === 0 || rightSourceAliases.size === 0) {
    throw new InvalidJoinConditionSourceMismatchError();
  }
  if (leftSourceAliases.size === 1 && rightSourceAliases.size === 1 && [
    ...leftSourceAliases
  ][0] === [
    ...rightSourceAliases
  ][0]) {
    throw new InvalidJoinConditionSameSourceError([
      ...leftSourceAliases
    ][0]);
  }
  if (leftAvailableAliases.length === 0) {
    throw new InvalidJoinConditionLeftSourceError([
      ...leftSourceAliases
    ][0]);
  }
  if (!rightReferencesJoined) {
    throw new InvalidJoinConditionRightSourceError(joinedSource);
  }
  throw new InvalidJoinCondition();
}
function getSourceAliasesFromExpression(expr) {
  switch (expr.type) {
    case `ref`:
      return new Set(expr.path[0] ? [
        expr.path[0]
      ] : []);
    case `func`: {
      const sourceAliases = /* @__PURE__ */ new Set();
      for (const arg of expr.args) {
        for (const alias of getSourceAliasesFromExpression(arg)) {
          sourceAliases.add(alias);
        }
      }
      return sourceAliases;
    }
    default:
      return /* @__PURE__ */ new Set();
  }
}
function processJoinSource(from, allInputs, collections, subscriptions, callbacks, lazySources, optimizableOrderByCollections, setWindowFn, cache, queryMapping, onCompileSubquery, aliasToCollectionId, aliasRemapping, sourceWhereClauses) {
  switch (from.type) {
    case `collectionRef`: {
      const input = allInputs[from.alias];
      if (!input) {
        throw new CollectionInputNotFoundError(from.alias, from.collection.id, Object.keys(allInputs));
      }
      aliasToCollectionId[from.alias] = from.collection.id;
      return {
        alias: from.alias,
        input,
        collectionId: from.collection.id
      };
    }
    case `queryRef`: {
      const originalQuery = queryMapping.get(from.query) || from.query;
      const subQueryResult = onCompileSubquery(originalQuery, allInputs, collections, subscriptions, callbacks, lazySources, optimizableOrderByCollections, setWindowFn, cache, queryMapping);
      Object.assign(aliasToCollectionId, subQueryResult.aliasToCollectionId);
      Object.assign(aliasRemapping, subQueryResult.aliasRemapping);
      const isUserDefinedSubquery = queryMapping.has(from.query);
      const fromInnerAlias = getFirstFromAlias2(from.query);
      const isOptimizerCreated = !isUserDefinedSubquery && fromInnerAlias !== void 0 && from.alias === fromInnerAlias;
      if (!isOptimizerCreated) {
        for (const [alias, whereClause] of subQueryResult.sourceWhereClauses) {
          sourceWhereClauses.set(alias, whereClause);
        }
      }
      const innerAlias = Object.keys(subQueryResult.aliasToCollectionId).find((alias) => subQueryResult.aliasToCollectionId[alias] === subQueryResult.collectionId);
      if (innerAlias && innerAlias !== from.alias) {
        aliasRemapping[from.alias] = innerAlias;
      }
      const subQueryInput = subQueryResult.pipeline;
      const extractedInput = subQueryInput.pipe(map((data) => {
        const [key, [value, _orderByIndex]] = data;
        return [
          key,
          value
        ];
      }));
      return {
        alias: from.alias,
        input: extractedInput,
        collectionId: subQueryResult.collectionId
      };
    }
    default:
      throw new UnsupportedJoinSourceTypeError(from.type);
  }
}
function getFirstFromAlias2(query) {
  if (query.from.type === `unionFrom`) {
    return query.from.sources[0]?.alias;
  }
  if (query.from.type === `unionAll`) {
    return void 0;
  }
  return query.from.alias;
}
function processJoinResults(joinType) {
  return function(pipeline) {
    return pipeline.pipe(
      // Process the join result and handle nulls
      filter((result) => {
        const [_key, [main, joined]] = result;
        const mainNamespacedRow = main?.[1];
        const joinedNamespacedRow = joined?.[1];
        if (joinType === `inner`) {
          return !!(mainNamespacedRow && joinedNamespacedRow);
        }
        if (joinType === `left`) {
          return !!mainNamespacedRow;
        }
        if (joinType === `right`) {
          return !!joinedNamespacedRow;
        }
        return true;
      }),
      map((result) => {
        const [_key, [main, joined]] = result;
        const mainKey = main?.[0];
        const mainNamespacedRow = main?.[1];
        const joinedKey = joined?.[0];
        const joinedNamespacedRow = joined?.[1];
        const mergedNamespacedRow = {};
        if (mainNamespacedRow) {
          Object.assign(mergedNamespacedRow, mainNamespacedRow);
        }
        if (joinedNamespacedRow) {
          Object.assign(mergedNamespacedRow, joinedNamespacedRow);
        }
        const resultKey = `[${mainKey},${joinedKey}]`;
        return [
          resultKey,
          mergedNamespacedRow
        ];
      })
    );
  };
}
function getActiveAndLazySources(joinType, leftCollection, rightCollection) {
  switch (joinType) {
    case `left`:
      return {
        activeSource: `main`,
        lazySource: rightCollection
      };
    case `right`:
      return {
        activeSource: `joined`,
        lazySource: leftCollection
      };
    case `inner`:
      return leftCollection.size < rightCollection.size ? {
        activeSource: `main`,
        lazySource: rightCollection
      } : {
        activeSource: `joined`,
        lazySource: leftCollection
      };
    default:
      return {
        activeSource: void 0,
        lazySource: void 0
      };
  }
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/query/compiler/select.js
function unwrapVal(input) {
  if (input instanceof Value) return input.value;
  return input;
}
var UNSAFE_ALIAS_SEGMENTS = /* @__PURE__ */ new Set([
  `__proto__`,
  `prototype`,
  `constructor`
]);
function assertSafeAliasSegments(segments) {
  for (const seg of segments) {
    if (UNSAFE_ALIAS_SEGMENTS.has(seg)) {
      throw new UnsafeAliasPathError(seg);
    }
  }
}
function processMerge(op, namespacedRow, selectResults) {
  assertSafeAliasSegments(op.targetPath);
  const value = op.source(namespacedRow);
  if (value && typeof value === `object`) {
    let cursor = selectResults;
    const path = op.targetPath;
    if (path.length === 0) {
      for (const [k, v] of Object.entries(value)) {
        selectResults[k] = unwrapVal(v);
      }
    } else {
      for (let i = 0; i < path.length; i++) {
        const seg = path[i];
        if (i === path.length - 1) {
          const dest = cursor[seg] ??= {};
          if (typeof dest === `object`) {
            for (const [k, v] of Object.entries(value)) {
              dest[k] = unwrapVal(v);
            }
          }
        } else {
          const next = cursor[seg];
          if (next == null || typeof next !== `object`) {
            cursor[seg] = {};
          }
          cursor = cursor[seg];
        }
      }
    }
  }
}
function processNonMergeOp(op, namespacedRow, selectResults) {
  const path = op.alias.split(`.`);
  assertSafeAliasSegments(path);
  if (path.length === 1) {
    selectResults[op.alias] = op.compiled(namespacedRow);
  } else {
    let cursor = selectResults;
    for (let i = 0; i < path.length - 1; i++) {
      const seg = path[i];
      const next = cursor[seg];
      if (next == null || typeof next !== `object`) {
        cursor[seg] = {};
      }
      cursor = cursor[seg];
    }
    cursor[path[path.length - 1]] = unwrapVal(op.compiled(namespacedRow));
  }
}
function processRow([key, namespacedRow], ops) {
  const selectResults = {};
  for (const op of ops) {
    if (op.kind === `merge`) {
      processMerge(op, namespacedRow, selectResults);
    } else {
      processNonMergeOp(op, namespacedRow, selectResults);
    }
  }
  return [
    key,
    {
      ...namespacedRow,
      $selected: selectResults
    }
  ];
}
function processSelect(pipeline, select, _allInputs) {
  const ops = [];
  addFromObject([], select, ops);
  return pipeline.pipe(map((row) => processRow(row, ops)));
}
function compileSelectObject(obj) {
  const ops = [];
  addFromObject([], obj, ops);
  return (row) => {
    const selectResults = {};
    for (const op of ops) {
      if (op.kind === `merge`) {
        processMerge(op, row, selectResults);
      } else {
        processNonMergeOp(op, row, selectResults);
      }
    }
    return selectResults;
  };
}
function compileSelectValue(value) {
  if (value == null) {
    return () => value;
  }
  if (isConditionalSelectValue(value)) {
    if (containsAggregate(value)) {
      return () => null;
    }
    return compileConditionalSelect(value);
  }
  if (value instanceof Value) {
    return () => value.value;
  }
  if (value.type === `includesSubquery`) {
    return () => null;
  }
  if (isNestedSelectObject2(value)) {
    return compileSelectObject(value);
  }
  if (isAggregateExpression(value) || containsAggregate(value)) {
    return () => null;
  }
  if (!isExpressionLike(value)) {
    return () => value;
  }
  return compileExpression(value);
}
function compileConditionalSelect(conditional) {
  const branches = conditional.branches.map((branch) => ({
    condition: compileExpression(branch.condition),
    value: compileSelectValue(branch.value)
  }));
  const defaultFn = conditional.defaultValue === void 0 ? void 0 : compileSelectValue(conditional.defaultValue);
  return (row) => {
    for (const branch of branches) {
      if (isCaseWhenConditionTrue(branch.condition(row))) {
        return branch.value(row);
      }
    }
    return defaultFn !== void 0 ? defaultFn(row) : null;
  };
}
function isAggregateExpression(expr) {
  return expr.type === `agg`;
}
function isNestedSelectObject2(obj) {
  return obj && typeof obj === `object` && !isExpressionLike(obj);
}
function addFromObject(prefixPath, obj, ops) {
  for (const [key, value] of Object.entries(obj)) {
    if (!key.startsWith(`__SPREAD_SENTINEL__`)) {
      assertSafeAliasSegments(key.split(`.`));
    }
    if (key.startsWith(`__SPREAD_SENTINEL__`)) {
      const rest = key.slice(`__SPREAD_SENTINEL__`.length);
      const splitIndex = rest.lastIndexOf(`__`);
      const pathStr = splitIndex >= 0 ? rest.slice(0, splitIndex) : rest;
      const isRefExpr = value && typeof value === `object` && `type` in value && value.type === `ref`;
      if (pathStr.includes(`.`) || isRefExpr) {
        const targetPath = [
          ...prefixPath
        ];
        const expr = isRefExpr ? value : new PropRef(pathStr.split(`.`));
        const compiled = compileExpression(expr);
        ops.push({
          kind: `merge`,
          targetPath,
          source: compiled
        });
      } else {
        const tableAlias = pathStr;
        const targetPath = [
          ...prefixPath
        ];
        ops.push({
          kind: `merge`,
          targetPath,
          source: (row) => row[tableAlias]
        });
      }
      continue;
    }
    const expression = value;
    if (isConditionalSelectValue(expression)) {
      if (containsAggregate(expression)) {
        ops.push({
          kind: `field`,
          alias: [
            ...prefixPath,
            key
          ].join(`.`),
          compiled: () => null
        });
        continue;
      }
      ops.push({
        kind: `field`,
        alias: [
          ...prefixPath,
          key
        ].join(`.`),
        compiled: compileConditionalSelect(expression)
      });
      continue;
    }
    if (expression && expression.type === `includesSubquery`) {
      ops.push({
        kind: `field`,
        alias: [
          ...prefixPath,
          key
        ].join(`.`),
        compiled: () => null
      });
      continue;
    }
    if (isNestedSelectObject2(expression)) {
      addFromObject([
        ...prefixPath,
        key
      ], expression, ops);
      continue;
    }
    if (isAggregateExpression(expression) || containsAggregate(expression)) {
      ops.push({
        kind: `field`,
        alias: [
          ...prefixPath,
          key
        ].join(`.`),
        compiled: () => null
      });
    } else {
      if (expression === void 0 || !isExpressionLike(expression)) {
        ops.push({
          kind: `field`,
          alias: [
            ...prefixPath,
            key
          ].join(`.`),
          compiled: () => expression
        });
        continue;
      }
      if (expression instanceof Value) {
        const val = expression.value;
        ops.push({
          kind: `field`,
          alias: [
            ...prefixPath,
            key
          ].join(`.`),
          compiled: () => val
        });
      } else {
        ops.push({
          kind: `field`,
          alias: [
            ...prefixPath,
            key
          ].join(`.`),
          compiled: compileExpression(expression)
        });
      }
    }
  }
}
function isConditionalSelectValue(value) {
  return value instanceof ConditionalSelect || value != null && typeof value === `object` && value.type === `conditionalSelect` && Array.isArray(value.branches);
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/query/compiler/index.js
var INCLUDES_ROUTING = /* @__PURE__ */ Symbol(`includesRouting`);
var FN_SELECT_STATE = /* @__PURE__ */ Symbol(`fnSelectState`);
var SKIP_INCLUDE = /* @__PURE__ */ Symbol(`skipInclude`);
function compileQuery(rawQuery, inputs, collections, subscriptions, callbacks, lazySources, optimizableOrderByCollections, setWindowFn, cache = /* @__PURE__ */ new WeakMap(), queryMapping = /* @__PURE__ */ new WeakMap(), parentKeyStream, childCorrelationField) {
  const cachedResult = cache.get(rawQuery);
  if (cachedResult) {
    return cachedResult;
  }
  validateQueryStructure(rawQuery);
  const { optimizedQuery, sourceWhereClauses } = optimizeQuery(rawQuery);
  let query = optimizedQuery;
  queryMapping.set(query, rawQuery);
  mapNestedQueries(query, rawQuery, queryMapping);
  const allInputs = {
    ...inputs
  };
  const aliasToCollectionId = {};
  const aliasRemapping = {};
  const sources = {};
  const { alias: mainSource, collectionId: mainCollectionId, pipeline: initialPipeline, sources: fromSources, sourceIncludes, directIncludes, isUnionFrom } = processFromClause(query.from, allInputs, collections, subscriptions, callbacks, lazySources, optimizableOrderByCollections, setWindowFn, cache, queryMapping, aliasToCollectionId, aliasRemapping, sourceWhereClauses);
  Object.assign(sources, fromSources);
  let pipeline = initialPipeline;
  if (!isUnionFrom && parentKeyStream && childCorrelationField) {
    const mainInput = sources[mainSource];
    let filteredMainInput = mainInput;
    const childFieldPath = childCorrelationField.path.slice(1);
    const childRekeyed = mainInput.pipe(map(([key, row]) => {
      const correlationValue = getNestedValue(row, childFieldPath);
      return [
        correlationValue,
        [
          key,
          row
        ]
      ];
    }));
    const joined = childRekeyed.pipe(join(parentKeyStream, `inner`));
    filteredMainInput = joined.pipe(filter(([_correlationValue, [childSide]]) => {
      return childSide != null;
    }), map(([correlationValue, [childSide, parentSide]]) => {
      const [childKey, childRow] = childSide;
      const tagged = {
        ...childRow,
        __correlationKey: correlationValue
      };
      if (parentSide != null) {
        tagged.__parentContext = parentSide;
      }
      const effectiveKey = parentSide != null ? `${String(childKey)}::${JSON.stringify(parentSide)}` : childKey;
      return [
        effectiveKey,
        tagged
      ];
    }));
    sources[mainSource] = filteredMainInput;
    pipeline = wrapInputWithAlias(filteredMainInput, mainSource);
  }
  if (query.join && query.join.length > 0) {
    pipeline = processJoins(pipeline, query.join, sources, mainCollectionId, mainSource, allInputs, cache, queryMapping, collections, subscriptions, callbacks, lazySources, optimizableOrderByCollections, setWindowFn, rawQuery, compileQuery, aliasToCollectionId, aliasRemapping, sourceWhereClauses);
  }
  if (query.where && query.where.length > 0) {
    for (const where of query.where) {
      const whereExpression = getWhereExpression(where);
      const compiledWhere = compileExpression(whereExpression);
      pipeline = pipeline.pipe(filter(([_key, namespacedRow]) => {
        return toBooleanPredicate(compiledWhere(namespacedRow));
      }));
    }
  }
  if (query.fnWhere && query.fnWhere.length > 0) {
    for (const fnWhere of query.fnWhere) {
      pipeline = pipeline.pipe(filter(([_key, namespacedRow]) => {
        return toBooleanPredicate(fnWhere(namespacedRow));
      }));
    }
  }
  const includesResults = !query.select ? [
    ...directIncludes
  ] : [];
  const includesRoutingFns = [];
  for (const { sourceAlias, include } of sourceIncludes) {
    const projectedPaths = query.select != null ? findProjectedSourceIncludePaths(query.select, sourceAlias, include.resultPath) : query.fnSelect ? [] : [
      {
        path: [
          sourceAlias,
          ...include.resultPath
        ],
        guards: []
      }
    ];
    if (projectedPaths.length === 0) {
      continue;
    }
    for (const { path: resultPath, guards } of projectedPaths) {
      const fieldName = getUniqueIncludesRoutingKey(`${sourceAlias}.${resultPath.join(`.`)}`, includesRoutingFns);
      const compiledGuards = guards.map((guard) => ({
        condition: compileExpression(guard.condition),
        expected: guard.expected
      }));
      includesResults.push({
        ...include,
        fieldName,
        resultPath
      });
      includesRoutingFns.push({
        fieldName,
        getRouting: (nsRow) => {
          if (!matchesConditionalSelectGuards(compiledGuards, nsRow)) {
            return {
              correlationKey: null,
              parentContext: null
            };
          }
          return nsRow[sourceAlias]?.[INCLUDES_ROUTING]?.[include.fieldName] ?? {
            correlationKey: null,
            parentContext: null
          };
        }
      });
    }
  }
  if (query.select && directIncludes.length > 0) {
    for (const include of directIncludes) {
      const projectedPaths = findProjectedResultIncludePaths(query.select, include.resultPath);
      for (const { path: resultPath, guards } of projectedPaths) {
        const fieldName = getUniqueIncludesRoutingKey(resultPath.join(`.`), includesRoutingFns);
        const compiledGuards = guards.map((guard) => ({
          condition: compileExpression(guard.condition),
          expected: guard.expected
        }));
        includesResults.push({
          ...include,
          fieldName,
          resultPath
        });
        includesRoutingFns.push({
          fieldName,
          getRouting: (nsRow) => {
            if (!matchesConditionalSelectGuards(compiledGuards, nsRow)) {
              return {
                correlationKey: null,
                parentContext: null
              };
            }
            return nsRow[INCLUDES_ROUTING]?.[include.fieldName] ?? {
              correlationKey: null,
              parentContext: null
            };
          }
        });
      }
    }
  }
  if (query.select) {
    const includesEntries = extractIncludesFromSelect(query.select);
    if (includesEntries.length > 0) {
      query = {
        ...query,
        select: {
          ...query.select
        }
      };
    }
    for (const { key, path, subquery, guards } of includesEntries) {
      const fieldName = getUniqueIncludesRoutingKey(key, includesRoutingFns);
      const compiledCorrelation = compileExpression(subquery.correlationField);
      const compiledGuards = guards.map((guard) => ({
        condition: compileExpression(guard.condition),
        expected: guard.expected
      }));
      let parentKeys;
      if (subquery.parentProjection && subquery.parentProjection.length > 0) {
        const compiledProjections = subquery.parentProjection.map((ref) => ({
          alias: ref.path[0],
          field: ref.path.slice(1),
          compiled: compileExpression(ref)
        }));
        parentKeys = pipeline.pipe(map(([_key, nsRow]) => {
          if (!matchesConditionalSelectGuards(compiledGuards, nsRow)) {
            return [
              SKIP_INCLUDE,
              null
            ];
          }
          const parentContext = {};
          for (const proj of compiledProjections) {
            if (!parentContext[proj.alias]) {
              parentContext[proj.alias] = {};
            }
            const value = proj.compiled(nsRow);
            let target = parentContext[proj.alias];
            for (let i = 0; i < proj.field.length - 1; i++) {
              if (!target[proj.field[i]]) {
                target[proj.field[i]] = {};
              }
              target = target[proj.field[i]];
            }
            target[proj.field[proj.field.length - 1]] = value;
          }
          return [
            compiledCorrelation(nsRow),
            parentContext
          ];
        }));
      } else {
        parentKeys = pipeline.pipe(map(([_key, nsRow]) => {
          if (!matchesConditionalSelectGuards(compiledGuards, nsRow)) {
            return [
              SKIP_INCLUDE,
              null
            ];
          }
          return [
            compiledCorrelation(nsRow),
            null
          ];
        }));
      }
      parentKeys = parentKeys.pipe(filter(([correlationValue]) => correlationValue !== SKIP_INCLUDE));
      parentKeys = parentKeys.pipe(reduce((values) => values.map(([v, mult]) => [
        v,
        mult > 0 ? 1 : 0
      ])));
      const childCorrelationAlias = subquery.childCorrelationField.path[0];
      const directChildCollection = subquery.query.from.type === `collectionRef` ? subquery.query.from.collection : void 0;
      const lazyTargets = getLazyLoadTargets(subquery.query, subquery.query.from, childCorrelationAlias, subquery.childCorrelationField, directChildCollection, aliasRemapping);
      if (lazyTargets.length > 0) {
        for (const target of lazyTargets) {
          lazySources.add(target.alias);
        }
        for (const target of lazyTargets) {
          const targetFieldName = target.path[0];
          if (targetFieldName) {
            ensureIndexForField(targetFieldName, target.path, target.collection);
          }
        }
        parentKeys = parentKeys.pipe(tap((data) => {
          const joinKeys = [
            ...new Set(data.getInner().map(([[correlationValue]]) => correlationValue).filter((joinKey) => joinKey != null))
          ];
          if (joinKeys.length === 0) {
            return;
          }
          for (const target of lazyTargets) {
            const lazySourceSubscription = subscriptions[target.alias];
            if (!lazySourceSubscription) {
              continue;
            }
            if (lazySourceSubscription.hasLoadedInitialState()) {
              continue;
            }
            const lazyJoinRef = new PropRef(target.path);
            lazySourceSubscription.requestSnapshot({
              where: inArray(lazyJoinRef, joinKeys)
            });
          }
        }));
      }
      const childQuery = subquery.parentFilters && subquery.parentFilters.length > 0 ? {
        ...subquery.query,
        where: [
          ...subquery.query.where || [],
          ...subquery.parentFilters
        ]
      } : subquery.query;
      const childResult = compileQuery(childQuery, allInputs, collections, subscriptions, callbacks, lazySources, optimizableOrderByCollections, setWindowFn, cache, queryMapping, parentKeys, subquery.childCorrelationField);
      Object.assign(aliasToCollectionId, childResult.aliasToCollectionId);
      Object.assign(aliasRemapping, childResult.aliasRemapping);
      for (const [alias, whereClause] of childResult.sourceWhereClauses) {
        sourceWhereClauses.set(alias, whereClause);
      }
      includesResults.push({
        pipeline: childResult.pipeline,
        fieldName,
        resultPath: path,
        correlationField: subquery.correlationField,
        childCorrelationField: subquery.childCorrelationField,
        hasOrderBy: !!(subquery.query.orderBy && subquery.query.orderBy.length > 0),
        childCompilationResult: childResult,
        parentProjection: subquery.parentProjection,
        materialization: subquery.materialization,
        scalarField: subquery.scalarField
      });
      if (subquery.parentProjection && subquery.parentProjection.length > 0) {
        const compiledProjs = subquery.parentProjection.map((ref) => ({
          alias: ref.path[0],
          field: ref.path.slice(1),
          compiled: compileExpression(ref)
        }));
        const compiledCorr = compiledCorrelation;
        const compiledRoutingGuards = compiledGuards;
        includesRoutingFns.push({
          fieldName,
          getRouting: (nsRow) => {
            if (!matchesConditionalSelectGuards(compiledRoutingGuards, nsRow)) {
              return {
                correlationKey: null,
                parentContext: null
              };
            }
            const parentContext = {};
            for (const proj of compiledProjs) {
              if (!parentContext[proj.alias]) {
                parentContext[proj.alias] = {};
              }
              const value = proj.compiled(nsRow);
              let target = parentContext[proj.alias];
              for (let i = 0; i < proj.field.length - 1; i++) {
                if (!target[proj.field[i]]) {
                  target[proj.field[i]] = {};
                }
                target = target[proj.field[i]];
              }
              target[proj.field[proj.field.length - 1]] = value;
            }
            return {
              correlationKey: compiledCorr(nsRow),
              parentContext
            };
          }
        });
      } else {
        const compiledRoutingGuards = compiledGuards;
        includesRoutingFns.push({
          fieldName,
          getRouting: (nsRow) => {
            if (!matchesConditionalSelectGuards(compiledRoutingGuards, nsRow)) {
              return {
                correlationKey: null,
                parentContext: null
              };
            }
            return {
              correlationKey: compiledCorrelation(nsRow),
              parentContext: null
            };
          }
        });
      }
      query = {
        ...query,
        select: replaceIncludesInSelect(query.select, path)
      };
    }
  }
  if (query.distinct && !query.fnSelect && !query.select && query.from.type !== `unionAll`) {
    throw new DistinctRequiresSelectError();
  }
  if (query.fnSelect && query.groupBy && query.groupBy.length > 0) {
    throw new FnSelectWithGroupByError();
  }
  if (query.fnSelect) {
    pipeline = pipeline.pipe(map(([key, namespacedRow]) => {
      const selectResults = query.fnSelect(namespacedRow);
      if (selectResults && typeof selectResults === `object`) {
        const routing = namespacedRow[INCLUDES_ROUTING];
        if (routing) {
          selectResults[INCLUDES_ROUTING] = routing;
        }
        if (directIncludes.length > 0) {
          Object.defineProperty(selectResults, FN_SELECT_STATE, {
            value: {
              sourceRow: namespacedRow,
              fnSelect: query.fnSelect
            },
            enumerable: true,
            configurable: true
          });
        }
      }
      return [
        key,
        {
          ...namespacedRow,
          $selected: selectResults
        }
      ];
    }));
  } else if (query.select) {
    pipeline = processSelect(pipeline, query.select);
  } else {
    pipeline = pipeline.pipe(map(([key, namespacedRow]) => {
      const selectResults = !isUnionFrom && !query.join && !query.groupBy ? namespacedRow[mainSource] : namespacedRow;
      return [
        key,
        {
          ...namespacedRow,
          $selected: selectResults
        }
      ];
    }));
  }
  if (includesRoutingFns.length > 0) {
    pipeline = pipeline.pipe(map(([key, namespacedRow]) => {
      const routing = {};
      for (const { fieldName, getRouting } of includesRoutingFns) {
        routing[fieldName] = getRouting(namespacedRow);
      }
      namespacedRow.$selected[INCLUDES_ROUTING] = routing;
      return [
        key,
        namespacedRow
      ];
    }));
  }
  const groupByMainSource = parentKeyStream ? mainSource : void 0;
  if (query.groupBy && query.groupBy.length > 0) {
    pipeline = processGroupBy(pipeline, query.groupBy, query.having, query.select, query.fnHaving, mainCollectionId, groupByMainSource);
  } else if (query.select) {
    const hasAggregates = Object.values(query.select).some((expr) => expr.type === `agg` || containsAggregate(expr));
    if (hasAggregates) {
      pipeline = processGroupBy(
        pipeline,
        [],
        // Empty group by means single group
        query.having,
        query.select,
        query.fnHaving,
        mainCollectionId,
        groupByMainSource
      );
    }
  }
  if (query.having && (!query.groupBy || query.groupBy.length === 0)) {
    const hasAggregates = query.select ? Object.values(query.select).some((expr) => expr.type === `agg`) : false;
    if (!hasAggregates) {
      throw new HavingRequiresGroupByError();
    }
  }
  if (query.fnHaving && query.fnHaving.length > 0 && (!query.groupBy || query.groupBy.length === 0)) {
    for (const fnHaving of query.fnHaving) {
      pipeline = pipeline.pipe(filter(([_key, namespacedRow]) => {
        return fnHaving(namespacedRow);
      }));
    }
  }
  if (query.distinct) {
    pipeline = pipeline.pipe(distinct(([_key, row]) => row.$selected));
  }
  if (query.orderBy && query.orderBy.length > 0) {
    const includesGroupKeyFn = parentKeyStream && (query.limit !== void 0 || query.offset !== void 0) ? (_key, row) => {
      const correlationKey = row?.[mainSource]?.__correlationKey;
      const parentContext = row?.__parentContext;
      if (parentContext != null) {
        return JSON.stringify([
          correlationKey,
          parentContext
        ]);
      }
      return correlationKey;
    } : void 0;
    const orderedPipeline = processOrderBy(rawQuery, pipeline, query.orderBy, query.select || {}, collections[mainCollectionId], optimizableOrderByCollections, setWindowFn, query.limit, query.offset, includesGroupKeyFn);
    const resultPipeline2 = orderedPipeline.pipe(map(([key, [row, orderByIndex]]) => {
      const raw = row.$selected;
      const finalResults = attachVirtualPropsToSelected(unwrapValue(raw), row);
      if (parentKeyStream) {
        const correlationKey = row[mainSource]?.__correlationKey;
        const parentContext = row.__parentContext ?? null;
        delete finalResults.__correlationKey;
        delete finalResults.__parentContext;
        return [
          key,
          [
            finalResults,
            orderByIndex,
            correlationKey,
            parentContext
          ]
        ];
      }
      return [
        key,
        [
          finalResults,
          orderByIndex
        ]
      ];
    }));
    const result2 = resultPipeline2;
    const compilationResult2 = {
      collectionId: mainCollectionId,
      pipeline: result2,
      sourceWhereClauses,
      aliasToCollectionId,
      aliasRemapping,
      includes: includesResults.length > 0 ? includesResults : void 0
    };
    cache.set(rawQuery, compilationResult2);
    return compilationResult2;
  } else if (query.limit !== void 0 || query.offset !== void 0) {
    throw new LimitOffsetRequireOrderByError();
  }
  const resultPipeline = pipeline.pipe(map(([key, row]) => {
    const raw = row.$selected;
    const finalResults = attachVirtualPropsToSelected(unwrapValue(raw), row);
    if (parentKeyStream) {
      const correlationKey = row[mainSource]?.__correlationKey;
      const parentContext = row.__parentContext ?? null;
      delete finalResults.__correlationKey;
      delete finalResults.__parentContext;
      return [
        key,
        [
          finalResults,
          void 0,
          correlationKey,
          parentContext
        ]
      ];
    }
    return [
      key,
      [
        finalResults,
        void 0
      ]
    ];
  }));
  const result = resultPipeline;
  const compilationResult = {
    collectionId: mainCollectionId,
    pipeline: result,
    sourceWhereClauses,
    aliasToCollectionId,
    aliasRemapping,
    includes: includesResults.length > 0 ? includesResults : void 0
  };
  cache.set(rawQuery, compilationResult);
  return compilationResult;
}
function collectDirectCollectionAliases(query) {
  const aliases = /* @__PURE__ */ new Set();
  for (const source of getFromSources2(query.from)) {
    if (source.type === `collectionRef`) {
      aliases.add(source.alias);
    }
  }
  if (query.join) {
    for (const joinClause of query.join) {
      if (joinClause.from.type === `collectionRef`) {
        aliases.add(joinClause.from.alias);
      }
    }
  }
  return aliases;
}
function validateQueryStructure(query, parentCollectionAliases = /* @__PURE__ */ new Set()) {
  const currentLevelAliases = collectDirectCollectionAliases(query);
  for (const alias of currentLevelAliases) {
    if (parentCollectionAliases.has(alias)) {
      throw new DuplicateAliasInSubqueryError(alias, Array.from(parentCollectionAliases));
    }
  }
  const combinedAliases = /* @__PURE__ */ new Set([
    ...parentCollectionAliases,
    ...currentLevelAliases
  ]);
  if (query.from.type === `unionAll`) {
    for (const branch of query.from.queries) {
      validateQueryStructure(branch, combinedAliases);
    }
  } else {
    for (const source of getFromSources2(query.from)) {
      if (source.type === `queryRef`) {
        validateQueryStructure(source.query, combinedAliases);
      }
    }
  }
  if (query.join) {
    for (const joinClause of query.join) {
      if (joinClause.from.type === `queryRef`) {
        validateQueryStructure(joinClause.from.query, combinedAliases);
      }
    }
  }
}
function processFromClause(from, allInputs, collections, subscriptions, callbacks, lazySources, optimizableOrderByCollections, setWindowFn, cache, queryMapping, aliasToCollectionId, aliasRemapping, sourceWhereClauses) {
  if (from.type === `unionAll`) {
    return processUnionAll(from, allInputs, collections, subscriptions, callbacks, lazySources, optimizableOrderByCollections, setWindowFn, cache, queryMapping, aliasToCollectionId, aliasRemapping, sourceWhereClauses);
  }
  if (from.type !== `unionFrom`) {
    const { alias, input, collectionId, sourceIncludes: sourceIncludes2 } = processFrom(from, allInputs, collections, subscriptions, callbacks, lazySources, optimizableOrderByCollections, setWindowFn, cache, queryMapping, aliasToCollectionId, aliasRemapping, sourceWhereClauses);
    return {
      alias,
      pipeline: wrapInputWithAlias(input, alias),
      collectionId,
      sources: {
        [alias]: input
      },
      sourceIncludes: sourceIncludes2,
      directIncludes: [],
      isUnionFrom: false
    };
  }
  if (from.sources.length === 0) {
    throw new UnsupportedFromTypeError(`empty unionFrom`);
  }
  const sources = {};
  const sourceIncludes = [];
  let pipeline;
  let mainAlias = ``;
  let mainCollectionId = ``;
  for (const source of from.sources) {
    const { alias, input, collectionId, sourceIncludes: childSourceIncludes } = processFrom(source, allInputs, collections, subscriptions, callbacks, lazySources, optimizableOrderByCollections, setWindowFn, cache, queryMapping, aliasToCollectionId, aliasRemapping, sourceWhereClauses);
    if (!mainAlias) {
      mainAlias = alias;
      mainCollectionId = collectionId;
    }
    sources[alias] = input;
    sourceIncludes.push(...childSourceIncludes);
    const branch = wrapInputWithAlias(input, alias).pipe(map(([key, row]) => {
      return [
        `${alias}:${encodeKeyForUnionBranch(key)}`,
        row
      ];
    }));
    pipeline = pipeline ? pipeline.pipe(concat(branch)) : branch;
  }
  return {
    alias: mainAlias,
    pipeline,
    collectionId: mainCollectionId,
    sources,
    sourceIncludes,
    directIncludes: [],
    isUnionFrom: true
  };
}
function processUnionAll(from, allInputs, collections, subscriptions, callbacks, lazySources, optimizableOrderByCollections, setWindowFn, cache, queryMapping, aliasToCollectionId, aliasRemapping, sourceWhereClauses) {
  if (from.queries.length === 0) {
    throw new UnsupportedFromTypeError(`empty unionAll`);
  }
  const sources = {};
  const sourceIncludes = [];
  const directIncludes = [];
  let pipeline;
  let mainCollectionId = ``;
  const branchAliases = /* @__PURE__ */ new Set();
  for (let index = 0; index < from.queries.length; index++) {
    const branch = from.queries[index];
    for (const source of getAllSources(branch)) {
      if (branchAliases.has(source.alias)) {
        throw new Error(`Duplicate source alias "${source.alias}" in unionAll query branches. Use distinct aliases in each branch before passing them to unionAll().`);
      }
      branchAliases.add(source.alias);
    }
    const branchResult = compileQuery(branch, allInputs, collections, subscriptions, callbacks, lazySources, optimizableOrderByCollections, setWindowFn, cache, queryMapping);
    if (!mainCollectionId) {
      mainCollectionId = branchResult.collectionId;
    }
    Object.assign(aliasToCollectionId, branchResult.aliasToCollectionId);
    Object.assign(aliasRemapping, branchResult.aliasRemapping);
    directIncludes.push(...branchResult.includes ?? []);
    Object.assign(sources, allInputs);
    for (const [alias, where] of branchResult.sourceWhereClauses) {
      sourceWhereClauses.set(alias, where);
    }
    const branchPipeline = branchResult.pipeline.pipe(map(([key, [row]]) => {
      return [
        `${index}:${encodeKeyForUnionBranch(key)}`,
        row
      ];
    }));
    pipeline = pipeline ? pipeline.pipe(concat(branchPipeline)) : branchPipeline;
  }
  return {
    alias: ``,
    pipeline,
    collectionId: mainCollectionId,
    sources,
    sourceIncludes,
    directIncludes,
    isUnionFrom: true
  };
}
function wrapInputWithAlias(input, alias) {
  return input.pipe(map(([key, row]) => {
    const { __parentContext, ...cleanRow } = row;
    const nsRow = {
      [alias]: cleanRow
    };
    if (__parentContext) {
      Object.assign(nsRow, __parentContext);
      nsRow.__parentContext = __parentContext;
    }
    return [
      key,
      nsRow
    ];
  }));
}
function encodeKeyForUnionBranch(key) {
  if (typeof key === `string`) {
    return `string:${key}`;
  }
  if (typeof key === `number`) {
    return `number:${String(key)}`;
  }
  if (typeof key === `bigint`) {
    return `bigint:${String(key)}`;
  }
  return `${typeof key}:${JSON.stringify(key)}`;
}
function processFrom(from, allInputs, collections, subscriptions, callbacks, lazySources, optimizableOrderByCollections, setWindowFn, cache, queryMapping, aliasToCollectionId, aliasRemapping, sourceWhereClauses) {
  switch (from.type) {
    case `collectionRef`: {
      const input = allInputs[from.alias];
      if (!input) {
        throw new CollectionInputNotFoundError(from.alias, from.collection.id, Object.keys(allInputs));
      }
      aliasToCollectionId[from.alias] = from.collection.id;
      return {
        alias: from.alias,
        input,
        collectionId: from.collection.id,
        sourceIncludes: []
      };
    }
    case `queryRef`: {
      const originalQuery = queryMapping.get(from.query) || from.query;
      const subQueryResult = compileQuery(originalQuery, allInputs, collections, subscriptions, callbacks, lazySources, optimizableOrderByCollections, setWindowFn, cache, queryMapping);
      Object.assign(aliasToCollectionId, subQueryResult.aliasToCollectionId);
      Object.assign(aliasRemapping, subQueryResult.aliasRemapping);
      const isUserDefinedSubquery = queryMapping.has(from.query);
      const subqueryFromAlias = getFirstFromAlias3(from.query.from);
      const isOptimizerCreated = !isUserDefinedSubquery && from.alias === subqueryFromAlias;
      if (!isOptimizerCreated) {
        for (const [alias, whereClause] of subQueryResult.sourceWhereClauses) {
          sourceWhereClauses.set(alias, whereClause);
        }
      }
      const innerAlias = Object.keys(subQueryResult.aliasToCollectionId).find((alias) => subQueryResult.aliasToCollectionId[alias] === subQueryResult.collectionId);
      if (innerAlias && innerAlias !== from.alias) {
        aliasRemapping[from.alias] = innerAlias;
      }
      const subQueryInput = subQueryResult.pipeline;
      const extractedInput = subQueryInput.pipe(map((data) => {
        const [key, [value, _orderByIndex]] = data;
        const unwrapped = unwrapValue(value);
        return [
          key,
          unwrapped
        ];
      }));
      return {
        alias: from.alias,
        input: extractedInput,
        collectionId: subQueryResult.collectionId,
        sourceIncludes: subQueryResult.includes?.map((include) => ({
          sourceAlias: from.alias,
          include
        })) ?? []
      };
    }
    default:
      throw new UnsupportedFromTypeError(from.type);
  }
}
function isValue(raw) {
  return raw instanceof Value || raw && typeof raw === `object` && `type` in raw && raw.type === `val`;
}
function unwrapValue(value) {
  return isValue(value) ? value.value : value;
}
function attachVirtualPropsToSelected(selected, row) {
  if (!selected || typeof selected !== `object`) {
    return selected;
  }
  let needsMerge = false;
  for (const prop of VIRTUAL_PROP_NAMES) {
    if (selected[prop] == null && prop in row) {
      needsMerge = true;
      break;
    }
  }
  if (!needsMerge) {
    return selected;
  }
  for (const prop of VIRTUAL_PROP_NAMES) {
    if (selected[prop] == null && prop in row) {
      selected[prop] = row[prop];
    }
  }
  return selected;
}
function mapNestedQueries(optimizedQuery, originalQuery, queryMapping) {
  mapNestedFromQueries(optimizedQuery.from, originalQuery.from, queryMapping);
  if (optimizedQuery.join && originalQuery.join) {
    for (let i = 0; i < optimizedQuery.join.length && i < originalQuery.join.length; i++) {
      const optimizedJoin = optimizedQuery.join[i];
      const originalJoin = originalQuery.join[i];
      if (optimizedJoin.from.type === `queryRef` && originalJoin.from.type === `queryRef`) {
        queryMapping.set(optimizedJoin.from.query, originalJoin.from.query);
        mapNestedQueries(optimizedJoin.from.query, originalJoin.from.query, queryMapping);
      }
    }
  }
}
function getFromSources2(from) {
  if (from.type === `unionFrom`) {
    return from.sources;
  }
  if (from.type === `unionAll`) {
    return [];
  }
  return [
    from
  ];
}
function getAllSources(query) {
  return [
    ...getFromSources2(query.from),
    ...query.join?.map((join2) => join2.from) ?? []
  ];
}
function getFirstFromAlias3(from) {
  return getFromSources2(from)[0]?.alias ?? ``;
}
function findProjectedSourceIncludePaths(select, sourceAlias, sourcePath) {
  const targetPath = [
    sourceAlias,
    ...sourcePath
  ];
  return findProjectedIncludePaths(select, targetPath);
}
function findProjectedResultIncludePaths(select, resultPath) {
  return findProjectedIncludePaths(select, resultPath);
}
function findProjectedIncludePaths(select, targetPath) {
  const resultPaths = [];
  const visitSelectObject = (obj, prefix, guards) => {
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith(`__SPREAD_SENTINEL__`)) {
        visitSpreadSentinel(key, value, prefix, guards);
        continue;
      }
      visitSelectValue(value, [
        ...prefix,
        key
      ], guards);
    }
  };
  const visitSpreadSentinel = (key, value, path, guards) => {
    const rest = key.slice(`__SPREAD_SENTINEL__`.length);
    const splitIndex = rest.lastIndexOf(`__`);
    const pathStr = splitIndex >= 0 ? rest.slice(0, splitIndex) : rest;
    const isRefExpr = value && typeof value === `object` && `type` in value && value.type === `ref`;
    const sourcePath = isRefExpr ? value.path : pathStr.split(`.`).filter(Boolean);
    if (pathStartsWith(targetPath, sourcePath)) {
      resultPaths.push({
        path: [
          ...path,
          ...targetPath.slice(sourcePath.length)
        ],
        guards
      });
    }
  };
  const visitSelectValue = (value, path, guards) => {
    if (value instanceof PropRef && pathStartsWith(targetPath, value.path)) {
      resultPaths.push({
        path: [
          ...path,
          ...targetPath.slice(value.path.length)
        ],
        guards
      });
      return;
    }
    if (value instanceof ConditionalSelect) {
      const previousBranchGuards = [];
      for (const branch of value.branches) {
        visitSelectValue(branch.value, path, [
          ...guards,
          ...previousBranchGuards,
          {
            condition: branch.condition,
            expected: true
          }
        ]);
        previousBranchGuards.push({
          condition: branch.condition,
          expected: false
        });
      }
      if (value.defaultValue !== void 0) {
        visitSelectValue(value.defaultValue, path, [
          ...guards,
          ...previousBranchGuards
        ]);
      }
      return;
    }
    if (isNestedSelectObject3(value)) {
      visitSelectObject(value, path, guards);
    }
  };
  visitSelectObject(select, [], []);
  return resultPaths;
}
function pathStartsWith(path, prefix) {
  return prefix.length <= path.length && prefix.every((part, i) => path[i] === part);
}
function mapNestedFromQueries(optimizedFrom, originalFrom, queryMapping) {
  if (optimizedFrom.type === `unionAll` && originalFrom.type === `unionAll`) {
    for (let i = 0; i < optimizedFrom.queries.length && i < originalFrom.queries.length; i++) {
      const optimizedBranch = optimizedFrom.queries[i];
      const originalBranch = originalFrom.queries[i];
      queryMapping.set(optimizedBranch, originalBranch);
      mapNestedQueries(optimizedBranch, originalBranch, queryMapping);
    }
    return;
  }
  const optimizedSources = getFromSources2(optimizedFrom);
  const originalSources = getFromSources2(originalFrom);
  for (let i = 0; i < optimizedSources.length && i < originalSources.length; i++) {
    const optimizedSource = optimizedSources[i];
    const originalSource = originalSources[i];
    if (optimizedSource.type === `queryRef` && originalSource.type === `queryRef`) {
      queryMapping.set(optimizedSource.query, originalSource.query);
      mapNestedQueries(optimizedSource.query, originalSource.query, queryMapping);
    }
  }
}
function extractIncludesFromSelect(select) {
  const results = [];
  for (const [key, value] of Object.entries(select)) {
    if (key.startsWith(`__SPREAD_SENTINEL__`)) continue;
    if (value instanceof IncludesSubquery) {
      results.push({
        key: getIncludesRoutingKey([
          key
        ], results),
        path: [
          key
        ],
        subquery: value,
        guards: []
      });
    } else if (value instanceof ConditionalSelect) {
      collectIncludesFromConditionalSelect(value, [
        key
      ], [], results);
    } else if (isNestedSelectObject3(value)) {
      assertNoNestedIncludes(value, key);
    }
  }
  return results;
}
function collectIncludesFromConditionalSelect(conditional, prefixPath, guards, results) {
  const previousBranchGuards = [];
  for (const branch of conditional.branches) {
    collectIncludesFromSelectValue(branch.value, prefixPath, [
      ...guards,
      ...previousBranchGuards,
      {
        condition: branch.condition,
        expected: true
      }
    ], results);
    previousBranchGuards.push({
      condition: branch.condition,
      expected: false
    });
  }
  if (conditional.defaultValue !== void 0) {
    collectIncludesFromSelectValue(conditional.defaultValue, prefixPath, [
      ...guards,
      ...previousBranchGuards
    ], results);
  }
}
function collectIncludesFromSelectValue(value, prefixPath, guards, results) {
  if (value instanceof IncludesSubquery) {
    const key = getIncludesRoutingKey(prefixPath, results);
    results.push({
      key,
      path: prefixPath,
      subquery: value,
      guards
    });
    return;
  }
  if (value instanceof ConditionalSelect) {
    collectIncludesFromConditionalSelect(value, prefixPath, guards, results);
    return;
  }
  if (!isNestedSelectObject3(value)) {
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (key.startsWith(`__SPREAD_SENTINEL__`)) continue;
    collectIncludesFromSelectValue(child, [
      ...prefixPath,
      key
    ], guards, results);
  }
}
function getIncludesRoutingKey(path, entries) {
  return getUniqueIncludesRoutingKey(path.join(`.`), entries);
}
function getUniqueIncludesRoutingKey(baseKey, entries) {
  const hasKey = (key2) => entries.some((entry) => (entry.key ?? entry.fieldName) === key2);
  if (!hasKey(baseKey)) {
    return baseKey;
  }
  let suffix = entries.length;
  let key = `${baseKey}#${suffix}`;
  while (hasKey(key)) {
    suffix++;
    key = `${baseKey}#${suffix}`;
  }
  return key;
}
function isNestedSelectObject3(value) {
  return value != null && typeof value === `object` && !Array.isArray(value) && !isExpressionLike(value);
}
function assertNoNestedIncludes(obj, parentPath) {
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith(`__SPREAD_SENTINEL__`)) continue;
    if (value instanceof IncludesSubquery) {
      throw new Error(`Includes subqueries must be at the top level of select(). Found nested includes at "${parentPath}.${key}".`);
    }
    if (isNestedSelectObject3(value)) {
      assertNoNestedIncludes(value, `${parentPath}.${key}`);
    }
  }
}
function replaceIncludesInSelect(select, path) {
  return replaceIncludesInSelectValue(select, path, new Value(null)).value;
}
function replaceIncludesInSelectValue(value, path, replacement) {
  if (path.length === 0) {
    return replaceIncludesValue(value, replacement);
  }
  if (value instanceof ConditionalSelect) {
    return replaceIncludesInConditionalSelect(value, path, replacement);
  }
  if (!isNestedSelectObject3(value)) {
    return {
      value,
      replaced: false
    };
  }
  if (path.length === 1) {
    const field = path[0];
    const result2 = replaceIncludesValue(value[field], replacement);
    if (!result2.replaced) {
      return {
        value,
        replaced: false
      };
    }
    return {
      value: {
        ...value,
        [field]: result2.value
      },
      replaced: true
    };
  }
  const [head, ...rest] = path;
  const result = replaceIncludesInSelectValue(value[head], rest, replacement);
  if (!result.replaced) {
    return {
      value,
      replaced: false
    };
  }
  return {
    value: {
      ...value,
      [head]: result.value
    },
    replaced: true
  };
}
function replaceIncludesValue(value, replacement) {
  if (value instanceof IncludesSubquery) {
    return {
      value: replacement,
      replaced: true
    };
  }
  if (value instanceof ConditionalSelect) {
    return replaceIncludesInConditionalSelect(value, [], replacement);
  }
  return {
    value,
    replaced: false
  };
}
function replaceIncludesInConditionalSelect(conditional, path, replacement) {
  let replaced = false;
  const branches = conditional.branches.map((branch) => {
    const result = path.length === 0 ? replaceIncludesValue(branch.value, replacement) : replaceIncludesInSelectValue(branch.value, path, replacement);
    if (!result.replaced) {
      return branch;
    }
    replaced = true;
    return {
      ...branch,
      value: result.value
    };
  });
  let defaultValue = conditional.defaultValue;
  if (conditional.defaultValue !== void 0) {
    const result = path.length === 0 ? replaceIncludesValue(conditional.defaultValue, replacement) : replaceIncludesInSelectValue(conditional.defaultValue, path, replacement);
    if (result.replaced) {
      replaced = true;
      defaultValue = result.value;
    }
  }
  if (!replaced) {
    return {
      value: conditional,
      replaced: false
    };
  }
  return {
    value: new ConditionalSelect(branches, defaultValue),
    replaced: true
  };
}
function getNestedValue(obj, path) {
  let value = obj;
  for (const segment of path) {
    if (value == null) return value;
    value = value[segment];
  }
  return value;
}
function matchesConditionalSelectGuards(guards, row) {
  return guards.every((guard) => isCaseWhenConditionTrue(guard.condition(row)) === guard.expected);
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/query/compiler/expressions.js
function normalizeExpressionPaths(whereClause, collectionAlias) {
  const tpe = whereClause.type;
  if (tpe === `val`) {
    return new Value(whereClause.value);
  } else if (tpe === `ref`) {
    const path = whereClause.path;
    if (Array.isArray(path)) {
      if (path[0] === collectionAlias && path.length > 1) {
        return new PropRef(path.slice(1));
      } else if (path.length === 1 && path[0] !== void 0) {
        return new PropRef([
          path[0]
        ]);
      }
    }
    return new PropRef(Array.isArray(path) ? path : [
      String(path)
    ]);
  } else {
    const args = [];
    for (const arg of whereClause.args) {
      const convertedArg = normalizeExpressionPaths(arg, collectionAlias);
      args.push(convertedArg);
    }
    return new Func(whereClause.name, args);
  }
}
function normalizeOrderByPaths(orderBy2, collectionAlias) {
  const normalizedOrderBy = orderBy2.map((clause) => {
    const basicExp = normalizeExpressionPaths(clause.expression, collectionAlias);
    return {
      ...clause,
      expression: basicExp
    };
  });
  return normalizedOrderBy;
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/query/live/collection-registry.js
var collectionBuilderRegistry = /* @__PURE__ */ new WeakMap();
function getBuilderFromConfig(config) {
  return config.utils?.[LIVE_QUERY_INTERNAL]?.getBuilder?.();
}
function registerCollectionBuilder(collection, builder) {
  collectionBuilderRegistry.set(collection, builder);
}
function getCollectionBuilder(collection) {
  return collectionBuilderRegistry.get(collection);
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/query/builder/index.js
var UNION_ALL_SOURCE_CONTEXT = `unionAll clause`;
var BaseQueryBuilder = class _BaseQueryBuilder {
  constructor(query = {}) {
    this.query = {};
    this.query = {
      ...query
    };
  }
  /**
   * Creates a CollectionRef or QueryRef from a source object
   * @param source - An object with a single key-value pair
   * @param context - Context string for error messages (e.g., "from clause", "join clause")
   * @returns A tuple of [alias, ref] where alias is the source key and ref is the created reference
   */
  _createRefForSource(source, context) {
    const refs = this._createRefsForSource(source, context);
    if (refs.length !== 1) {
      throw new OnlyOneSourceAllowedError(context);
    }
    return refs[0];
  }
  _createRefsForSource(source, context) {
    if (typeof source === `string`) {
      throw new InvalidSourceTypeError(context, `string`);
    }
    let keys;
    try {
      keys = Object.keys(source);
    } catch {
      const type = source === null ? `null` : `undefined`;
      throw new InvalidSourceTypeError(context, type);
    }
    if (Array.isArray(source)) {
      throw new InvalidSourceTypeError(context, `array`);
    }
    if (keys.length === 0) {
      throw new InvalidSourceTypeError(context, `empty object`);
    }
    if (context !== UNION_ALL_SOURCE_CONTEXT && keys.length !== 1) {
      throw new OnlyOneSourceAllowedError(context);
    }
    const refs = [];
    for (const alias of keys) {
      const sourceValue = source[alias];
      let ref;
      if (sourceValue instanceof CollectionImpl) {
        ref = new CollectionRef(sourceValue, alias);
      } else if (sourceValue instanceof _BaseQueryBuilder) {
        const subQuery = sourceValue._getQuery();
        if (!subQuery.from) {
          throw new SubQueryMustHaveFromClauseError(context);
        }
        ref = new QueryRef(subQuery, alias);
      } else {
        throw new InvalidSourceError(alias);
      }
      refs.push([
        alias,
        ref
      ]);
    }
    return refs;
  }
  /**
   * Specify the source table or subquery for the query
   *
   * @param source - An object with a single key-value pair where the key is the table alias and the value is a Collection or subquery
   * @returns A QueryBuilder with the specified source
   *
   * @example
   * ```ts
   * // Query from a collection
   * query.from({ users: usersCollection })
   *
   * // Query from a subquery
   * const activeUsers = query.from({ u: usersCollection }).where(({u}) => u.active)
   * query.from({ activeUsers })
   * ```
   */
  from(source) {
    const [, from] = this._createRefForSource(source, `from clause`);
    return new _BaseQueryBuilder({
      ...this.query,
      from
    });
  }
  unionAll(sourceOrBranch, ...branches) {
    if (sourceOrBranch instanceof _BaseQueryBuilder) {
      return new _BaseQueryBuilder({
        ...this.query,
        from: new UnionAll([
          sourceOrBranch,
          ...branches
        ].map((branch) => branch._getQuery()))
      });
    }
    const refs = this._createRefsForSource(sourceOrBranch, UNION_ALL_SOURCE_CONTEXT);
    const from = refs.length === 1 ? refs[0][1] : new UnionFrom(refs.map((r) => r[1]));
    return new _BaseQueryBuilder({
      ...this.query,
      from
    });
  }
  /**
   * Join another table or subquery to the current query
   *
   * @param source - An object with a single key-value pair where the key is the table alias and the value is a Collection or subquery
   * @param onCallback - A function that receives table references and returns the join condition
   * @param type - The type of join: 'inner', 'left', 'right', or 'full' (defaults to 'left')
   * @returns A QueryBuilder with the joined table available
   *
   * @example
   * ```ts
   * // Left join users with posts
   * query
   *   .from({ users: usersCollection })
   *   .join({ posts: postsCollection }, ({users, posts}) => eq(users.id, posts.userId))
   *
   * // Inner join with explicit type
   * query
   *   .from({ u: usersCollection })
   *   .join({ p: postsCollection }, ({u, p}) => eq(u.id, p.userId), 'inner')
   * ```
   *
   * // Join with a subquery
   * const activeUsers = query.from({ u: usersCollection }).where(({u}) => u.active)
   * query
   *   .from({ activeUsers })
   *   .join({ p: postsCollection }, ({u, p}) => eq(u.id, p.userId))
   */
  join(source, onCallback, type = `left`) {
    const [alias, from] = this._createRefForSource(source, `join clause`);
    const currentAliases = this._getCurrentAliases();
    const newAliases = [
      ...currentAliases,
      alias
    ];
    const refProxy = createRefProxy(newAliases);
    const onExpression = onCallback(refProxy);
    let left;
    let right;
    if (onExpression.type === `func` && onExpression.name === `eq` && onExpression.args.length === 2) {
      left = onExpression.args[0];
      right = onExpression.args[1];
    } else {
      throw new JoinConditionMustBeEqualityError();
    }
    const joinClause = {
      from,
      type,
      left,
      right
    };
    const existingJoins = this.query.join || [];
    return new _BaseQueryBuilder({
      ...this.query,
      join: [
        ...existingJoins,
        joinClause
      ]
    });
  }
  /**
   * Perform a LEFT JOIN with another table or subquery
   *
   * @param source - An object with a single key-value pair where the key is the table alias and the value is a Collection or subquery
   * @param onCallback - A function that receives table references and returns the join condition
   * @returns A QueryBuilder with the left joined table available
   *
   * @example
   * ```ts
   * // Left join users with posts
   * query
   *   .from({ users: usersCollection })
   *   .leftJoin({ posts: postsCollection }, ({users, posts}) => eq(users.id, posts.userId))
   * ```
   */
  leftJoin(source, onCallback) {
    return this.join(source, onCallback, `left`);
  }
  /**
   * Perform a RIGHT JOIN with another table or subquery
   *
   * @param source - An object with a single key-value pair where the key is the table alias and the value is a Collection or subquery
   * @param onCallback - A function that receives table references and returns the join condition
   * @returns A QueryBuilder with the right joined table available
   *
   * @example
   * ```ts
   * // Right join users with posts
   * query
   *   .from({ users: usersCollection })
   *   .rightJoin({ posts: postsCollection }, ({users, posts}) => eq(users.id, posts.userId))
   * ```
   */
  rightJoin(source, onCallback) {
    return this.join(source, onCallback, `right`);
  }
  /**
   * Perform an INNER JOIN with another table or subquery
   *
   * @param source - An object with a single key-value pair where the key is the table alias and the value is a Collection or subquery
   * @param onCallback - A function that receives table references and returns the join condition
   * @returns A QueryBuilder with the inner joined table available
   *
   * @example
   * ```ts
   * // Inner join users with posts
   * query
   *   .from({ users: usersCollection })
   *   .innerJoin({ posts: postsCollection }, ({users, posts}) => eq(users.id, posts.userId))
   * ```
   */
  innerJoin(source, onCallback) {
    return this.join(source, onCallback, `inner`);
  }
  /**
   * Perform a FULL JOIN with another table or subquery
   *
   * @param source - An object with a single key-value pair where the key is the table alias and the value is a Collection or subquery
   * @param onCallback - A function that receives table references and returns the join condition
   * @returns A QueryBuilder with the full joined table available
   *
   * @example
   * ```ts
   * // Full join users with posts
   * query
   *   .from({ users: usersCollection })
   *   .fullJoin({ posts: postsCollection }, ({users, posts}) => eq(users.id, posts.userId))
   * ```
   */
  fullJoin(source, onCallback) {
    return this.join(source, onCallback, `full`);
  }
  /**
   * Filter rows based on a condition
   *
   * @param callback - A function that receives table references and returns an expression
   * @returns A QueryBuilder with the where condition applied
   *
   * @example
   * ```ts
   * // Simple condition
   * query
   *   .from({ users: usersCollection })
   *   .where(({users}) => gt(users.age, 18))
   *
   * // Multiple conditions
   * query
   *   .from({ users: usersCollection })
   *   .where(({users}) => and(
   *     gt(users.age, 18),
   *     eq(users.active, true)
   *   ))
   *
   * // Multiple where calls are ANDed together
   * query
   *   .from({ users: usersCollection })
   *   .where(({users}) => gt(users.age, 18))
   *   .where(({users}) => eq(users.active, true))
   * ```
   */
  where(callback) {
    const aliases = this._getCurrentAliases();
    const refProxy = createRefProxy(aliases);
    const rawExpression = callback(refProxy);
    const expression = isRefProxy(rawExpression) ? toExpression(rawExpression) : rawExpression;
    if (!isExpressionLike(expression)) {
      throw new InvalidWhereExpressionError(getValueTypeName(expression));
    }
    const existingWhere = this.query.where || [];
    return new _BaseQueryBuilder({
      ...this.query,
      where: [
        ...existingWhere,
        expression
      ]
    });
  }
  /**
   * Filter grouped rows based on aggregate conditions
   *
   * @param callback - A function that receives table references and returns an expression
   * @returns A QueryBuilder with the having condition applied
   *
   * @example
   * ```ts
   * // Filter groups by count
   * query
   *   .from({ posts: postsCollection })
   *   .groupBy(({posts}) => posts.userId)
   *   .having(({posts}) => gt(count(posts.id), 5))
   *
   * // Filter by average
   * query
   *   .from({ orders: ordersCollection })
   *   .groupBy(({orders}) => orders.customerId)
   *   .having(({orders}) => gt(avg(orders.total), 100))
   *
   * // Multiple having calls are ANDed together
   * query
   *   .from({ orders: ordersCollection })
   *   .groupBy(({orders}) => orders.customerId)
   *   .having(({orders}) => gt(count(orders.id), 5))
   *   .having(({orders}) => gt(avg(orders.total), 100))
   * ```
   */
  having(callback) {
    const aliases = this._getCurrentAliases();
    const refProxy = this.query.select || this.query.fnSelect ? createRefProxyWithSelected(aliases) : createRefProxy(aliases);
    const rawExpression = callback(refProxy);
    const expression = isRefProxy(rawExpression) ? toExpression(rawExpression) : rawExpression;
    if (!isExpressionLike(expression)) {
      throw new InvalidWhereExpressionError(getValueTypeName(expression));
    }
    const existingHaving = this.query.having || [];
    return new _BaseQueryBuilder({
      ...this.query,
      having: [
        ...existingHaving,
        expression
      ]
    });
  }
  select(callback) {
    const aliases = this._getCurrentAliases();
    const refProxy = createRefProxy(aliases);
    let selectObject = callback(refProxy);
    if (isRefProxy(selectObject) && selectObject.__path.length === 1) {
      const sentinelKey = `__SPREAD_SENTINEL__${selectObject.__path[0]}__0`;
      selectObject = {
        [sentinelKey]: true
      };
    }
    const select = buildNestedSelect(selectObject, aliases);
    return new _BaseQueryBuilder({
      ...this.query,
      select,
      fnSelect: void 0
    });
  }
  /**
   * Sort the query results by one or more columns
   *
   * @param callback - A function that receives table references and returns the field to sort by
   * @param direction - Sort direction: 'asc' for ascending, 'desc' for descending (defaults to 'asc')
   * @returns A QueryBuilder with the ordering applied
   *
   * @example
   * ```ts
   * // Sort by a single column
   * query
   *   .from({ users: usersCollection })
   *   .orderBy(({users}) => users.name)
   *
   * // Sort descending
   * query
   *   .from({ users: usersCollection })
   *   .orderBy(({users}) => users.createdAt, 'desc')
   *
   * // Multiple sorts (chain orderBy calls)
   * query
   *   .from({ users: usersCollection })
   *   .orderBy(({users}) => users.lastName)
   *   .orderBy(({users}) => users.firstName)
   * ```
   */
  orderBy(callback, options = `asc`) {
    const aliases = this._getCurrentAliases();
    const refProxy = this.query.select || this.query.fnSelect ? createRefProxyWithSelected(aliases) : createRefProxy(aliases);
    const result = callback(refProxy);
    const opts = typeof options === `string` ? {
      direction: options,
      nulls: `first`
    } : {
      direction: options.direction ?? `asc`,
      nulls: options.nulls ?? `first`,
      stringSort: options.stringSort,
      locale: options.stringSort === `locale` ? options.locale : void 0,
      localeOptions: options.stringSort === `locale` ? options.localeOptions : void 0
    };
    const makeOrderByClause = (res) => {
      return {
        expression: toExpression(res),
        compareOptions: opts
      };
    };
    const orderByClauses = Array.isArray(result) ? result.map((r) => makeOrderByClause(r)) : [
      makeOrderByClause(result)
    ];
    const existingOrderBy = this.query.orderBy || [];
    return new _BaseQueryBuilder({
      ...this.query,
      orderBy: [
        ...existingOrderBy,
        ...orderByClauses
      ]
    });
  }
  /**
   * Group rows by one or more columns for aggregation
   *
   * @param callback - A function that receives table references and returns the field(s) to group by
   * @returns A QueryBuilder with grouping applied (enables aggregate functions in SELECT and HAVING)
   *
   * @example
   * ```ts
   * // Group by a single column
   * query
   *   .from({ posts: postsCollection })
   *   .groupBy(({posts}) => posts.userId)
   *   .select(({posts, count}) => ({
   *     userId: posts.userId,
   *     postCount: count()
   *   }))
   *
   * // Group by multiple columns
   * query
   *   .from({ sales: salesCollection })
   *   .groupBy(({sales}) => [sales.region, sales.category])
   *   .select(({sales, sum}) => ({
   *     region: sales.region,
   *     category: sales.category,
   *     totalSales: sum(sales.amount)
   *   }))
   * ```
   */
  groupBy(callback) {
    const aliases = this._getCurrentAliases();
    const refProxy = createRefProxy(aliases);
    const result = callback(refProxy);
    const newExpressions = Array.isArray(result) ? result.map((r) => toExpression(r)) : [
      toExpression(result)
    ];
    const existingGroupBy = this.query.groupBy || [];
    return new _BaseQueryBuilder({
      ...this.query,
      groupBy: [
        ...existingGroupBy,
        ...newExpressions
      ]
    });
  }
  /**
   * Limit the number of rows returned by the query
   * `orderBy` is required for `limit`
   *
   * @param count - Maximum number of rows to return
   * @returns A QueryBuilder with the limit applied
   *
   * @example
   * ```ts
   * // Get top 5 posts by likes
   * query
   *   .from({ posts: postsCollection })
   *   .orderBy(({posts}) => posts.likes, 'desc')
   *   .limit(5)
   * ```
   */
  limit(count6) {
    return new _BaseQueryBuilder({
      ...this.query,
      limit: count6
    });
  }
  /**
   * Skip a number of rows before returning results
   * `orderBy` is required for `offset`
   *
   * @param count - Number of rows to skip
   * @returns A QueryBuilder with the offset applied
   *
   * @example
   * ```ts
   * // Get second page of results
   * query
   *   .from({ posts: postsCollection })
   *   .orderBy(({posts}) => posts.createdAt, 'desc')
   *   .offset(page * pageSize)
   *   .limit(pageSize)
   * ```
   */
  offset(count6) {
    return new _BaseQueryBuilder({
      ...this.query,
      offset: count6
    });
  }
  /**
   * Specify that the query should return distinct rows.
   * Deduplicates rows based on the selected columns.
   * @returns A QueryBuilder with distinct enabled
   *
   * @example
   * ```ts
   * // Get countries our users are from
   * query
   *   .from({ users: usersCollection })
   *   .select(({users}) => ({ country: users.country }))
   *   .distinct()
   * ```
   */
  distinct() {
    return new _BaseQueryBuilder({
      ...this.query,
      distinct: true
    });
  }
  /**
   * Specify that the query should return a single result
   * @returns A QueryBuilder that returns the first result
   *
   * @example
   * ```ts
   * // Get the user matching the query
   * query
   *   .from({ users: usersCollection })
   *   .where(({users}) => eq(users.id, 1))
   *   .findOne()
   *```
   */
  findOne() {
    return new _BaseQueryBuilder({
      ...this.query,
      // TODO: enforcing return only one result with also a default orderBy if none is specified
      // limit: 1,
      singleResult: true
    });
  }
  // Helper methods
  _getCurrentAliases() {
    const aliases = [];
    if (this.query.from) {
      if (this.query.from.type === `unionFrom`) {
        aliases.push(...this.query.from.sources.map((source) => source.alias));
      } else if (this.query.from.type === `unionAll`) {
        aliases.push(`*`);
      } else {
        aliases.push(this.query.from.alias);
      }
    }
    if (this.query.join) {
      for (const join2 of this.query.join) {
        aliases.push(join2.from.alias);
      }
    }
    return aliases;
  }
  /**
   * Functional variants of the query builder
   * These are imperative function that are called for ery row.
   * Warning: that these cannot be optimized by the query compiler, and may prevent
   * some type of optimizations being possible.
   * @example
   * ```ts
   * q.fn.select((row) => ({
   *   name: row.user.name.toUpperCase(),
   *   age: row.user.age + 1,
   * }))
   * ```
   */
  get fn() {
    const builder = this;
    return {
      /**
       * Select fields using a function that operates on each row
       * Warning: This cannot be optimized by the query compiler
       *
       * @param callback - A function that receives a row and returns the selected value
       * @returns A QueryBuilder with functional selection applied
       *
       * @example
       * ```ts
       * // Functional select (not optimized)
       * query
       *   .from({ users: usersCollection })
       *   .fn.select(row => ({
       *     name: row.users.name.toUpperCase(),
       *     age: row.users.age + 1,
       *   }))
       * ```
       */
      select(callback) {
        return new _BaseQueryBuilder({
          ...builder.query,
          select: void 0,
          // remove the select clause if it exists
          fnSelect: callback
        });
      },
      /**
       * Filter rows using a function that operates on each row
       * Warning: This cannot be optimized by the query compiler
       *
       * @param callback - A function that receives a row and returns a boolean
       * @returns A QueryBuilder with functional filtering applied
       *
       * @example
       * ```ts
       * // Functional where (not optimized)
       * query
       *   .from({ users: usersCollection })
       *   .fn.where(row => row.users.name.startsWith('A'))
       * ```
       */
      where(callback) {
        return new _BaseQueryBuilder({
          ...builder.query,
          fnWhere: [
            ...builder.query.fnWhere || [],
            callback
          ]
        });
      },
      /**
       * Filter grouped rows using a function that operates on each aggregated row
       * Warning: This cannot be optimized by the query compiler
       *
       * @param callback - A function that receives an aggregated row (with $selected when select() was called) and returns a boolean
       * @returns A QueryBuilder with functional having filter applied
       *
       * @example
       * ```ts
       * // Functional having (not optimized)
       * query
       *   .from({ posts: postsCollection })
       *   .groupBy(({posts}) => posts.userId)
       *   .select(({posts}) => ({ userId: posts.userId, count: count(posts.id) }))
       *   .fn.having(({ $selected }) => $selected.count > 5)
       * ```
       */
      having(callback) {
        return new _BaseQueryBuilder({
          ...builder.query,
          fnHaving: [
            ...builder.query.fnHaving || [],
            callback
          ]
        });
      }
    };
  }
  _getQuery() {
    if (!this.query.from) {
      throw new QueryMustHaveFromClauseError();
    }
    return this.query;
  }
};
function getValueTypeName(value) {
  if (value === null) return `null`;
  if (value === void 0) return `undefined`;
  if (typeof value === `object`) return `object`;
  return typeof value;
}
function toExpr(value) {
  if (value === void 0) return toExpression(null);
  if (value instanceof Aggregate || value instanceof Func || value instanceof PropRef || value instanceof Value) {
    return value;
  }
  return toExpression(value);
}
function isPlainObject(value) {
  return value !== null && typeof value === `object` && !isExpressionLike(value) && !value.__refProxy;
}
function buildNestedSelect(obj, parentAliases = [], fieldName) {
  if (obj instanceof BaseQueryBuilder) {
    if (!fieldName) {
      throw new Error(`Conditional include branch is missing a field name`);
    }
    return buildIncludesSubquery(obj, fieldName, parentAliases, `collection`);
  }
  if (obj instanceof ToArrayWrapper) {
    if (!(obj.query instanceof BaseQueryBuilder)) {
      throw new Error(`toArray() must wrap a subquery builder`);
    }
    if (!fieldName) {
      throw new Error(`Conditional toArray() branch is missing a field name`);
    }
    return buildIncludesSubquery(obj.query, fieldName, parentAliases, `array`);
  }
  if (obj instanceof ConcatToArrayWrapper) {
    if (!(obj.query instanceof BaseQueryBuilder)) {
      throw new Error(`concat(toArray(...)) must wrap a subquery builder`);
    }
    if (!fieldName) {
      throw new Error(`Conditional concat(toArray(...)) branch is missing a field name`);
    }
    return buildIncludesSubquery(obj.query, fieldName, parentAliases, `concat`);
  }
  if (obj instanceof CaseWhenWrapper) {
    return buildConditionalSelect(obj, parentAliases, fieldName);
  }
  if (!isPlainObject(obj)) return toExpr(obj);
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof k === `string` && k.startsWith(`__SPREAD_SENTINEL__`)) {
      out[k] = v;
      continue;
    }
    if (v instanceof BaseQueryBuilder) {
      out[k] = buildIncludesSubquery(v, k, parentAliases, `collection`);
      continue;
    }
    if (v instanceof ToArrayWrapper) {
      if (!(v.query instanceof BaseQueryBuilder)) {
        throw new Error(`toArray() must wrap a subquery builder`);
      }
      out[k] = buildIncludesSubquery(v.query, k, parentAliases, `array`);
      continue;
    }
    if (v instanceof ConcatToArrayWrapper) {
      if (!(v.query instanceof BaseQueryBuilder)) {
        throw new Error(`concat(toArray(...)) must wrap a subquery builder`);
      }
      out[k] = buildIncludesSubquery(v.query, k, parentAliases, `concat`);
      continue;
    }
    if (v instanceof MaterializeWrapper) {
      if (!(v.query instanceof BaseQueryBuilder)) {
        throw new Error(`materialize() must wrap a subquery builder`);
      }
      const childQuery = v.query._getQuery();
      const materialization = childQuery.singleResult ? `singleton` : `array`;
      out[k] = buildIncludesSubquery(v.query, k, parentAliases, materialization);
      continue;
    }
    if (v instanceof CaseWhenWrapper) {
      out[k] = buildConditionalSelect(v, parentAliases, k);
      continue;
    }
    out[k] = buildNestedSelect(v, parentAliases, k);
  }
  return out;
}
function buildConditionalSelect(wrapper, parentAliases, fieldName) {
  const args = wrapper.args;
  if (args.length < 2) {
    throw new Error(`caseWhen() requires at least two arguments`);
  }
  const hasDefaultValue = args.length % 2 === 1;
  const pairCount = Math.floor(args.length / 2);
  const branches = [];
  for (let i = 0; i < pairCount; i++) {
    branches.push({
      condition: toExpression(args[i * 2]),
      value: buildNestedSelect(args[i * 2 + 1], parentAliases, fieldName)
    });
  }
  const defaultValue = hasDefaultValue ? buildNestedSelect(args[args.length - 1], parentAliases, fieldName) : void 0;
  return new ConditionalSelect(branches, defaultValue);
}
function collectRefsFromExpression(expr) {
  const refs = [];
  switch (expr.type) {
    case `ref`:
      refs.push(expr);
      break;
    case `func`:
      for (const arg of expr.args ?? []) {
        refs.push(...collectRefsFromExpression(arg));
      }
      break;
  }
  return refs;
}
function referencesParent(where, parentAliases) {
  const expr = typeof where === `object` && `expression` in where ? where.expression : where;
  return collectRefsFromExpression(expr).some((ref) => ref.path[0] != null && parentAliases.includes(ref.path[0]));
}
function buildIncludesSubquery(childBuilder, fieldName, parentAliases, materialization) {
  const childQuery = childBuilder._getQuery();
  const childAliases = collectQueryAliases(childQuery);
  let parentRef;
  let childRef;
  let correlationWhereIndex = -1;
  let correlationAndArgIndex = -1;
  if (childQuery.where) {
    for (let i = 0; i < childQuery.where.length; i++) {
      const where = childQuery.where[i];
      const expr = typeof where === `object` && `expression` in where ? where.expression : where;
      if (expr.type === `func` && expr.name === `eq` && expr.args.length === 2) {
        const result = extractCorrelation(expr.args[0], expr.args[1], parentAliases, childAliases);
        if (result) {
          parentRef = result.parentRef;
          childRef = result.childRef;
          correlationWhereIndex = i;
          break;
        }
      }
      if (expr.type === `func` && expr.name === `and` && expr.args.length >= 2) {
        for (let j = 0; j < expr.args.length; j++) {
          const arg = expr.args[j];
          if (arg.type === `func` && arg.name === `eq` && arg.args.length === 2) {
            const result = extractCorrelation(arg.args[0], arg.args[1], parentAliases, childAliases);
            if (result) {
              parentRef = result.parentRef;
              childRef = result.childRef;
              correlationWhereIndex = i;
              correlationAndArgIndex = j;
              break;
            }
          }
        }
        if (parentRef) break;
      }
    }
  }
  if (!parentRef || !childRef || correlationWhereIndex === -1) {
    throw new Error(`Includes subquery for "${fieldName}" must have a WHERE clause with an eq() condition that correlates a parent field with a child field. Example: .where(({child}) => eq(child.parentId, parent.id))`);
  }
  const modifiedWhere = [
    ...childQuery.where
  ];
  if (correlationAndArgIndex >= 0) {
    const where = modifiedWhere[correlationWhereIndex];
    const expr = typeof where === `object` && `expression` in where ? where.expression : where;
    const remainingArgs = expr.args.filter((_, idx) => idx !== correlationAndArgIndex);
    if (remainingArgs.length === 1) {
      const isResidual = typeof where === `object` && `expression` in where && where.residual;
      modifiedWhere[correlationWhereIndex] = isResidual ? {
        expression: remainingArgs[0],
        residual: true
      } : remainingArgs[0];
    } else {
      const newAnd = new Func(`and`, remainingArgs);
      const isResidual = typeof where === `object` && `expression` in where && where.residual;
      modifiedWhere[correlationWhereIndex] = isResidual ? {
        expression: newAnd,
        residual: true
      } : newAnd;
    }
  } else {
    modifiedWhere.splice(correlationWhereIndex, 1);
  }
  const pureChildWhere = [];
  const parentFilters = [];
  for (const w of modifiedWhere) {
    if (referencesParent(w, parentAliases)) {
      parentFilters.push(w);
    } else {
      pureChildWhere.push(w);
    }
  }
  let parentProjection;
  if (parentFilters.length > 0) {
    const seen = /* @__PURE__ */ new Set();
    parentProjection = [];
    for (const w of parentFilters) {
      const expr = typeof w === `object` && `expression` in w ? w.expression : w;
      for (const ref of collectRefsFromExpression(expr)) {
        if (ref.path[0] != null && parentAliases.includes(ref.path[0]) && !seen.has(ref.path.join(`.`))) {
          seen.add(ref.path.join(`.`));
          parentProjection.push(ref);
        }
      }
    }
  }
  const modifiedQuery = {
    ...childQuery,
    where: pureChildWhere.length > 0 ? pureChildWhere : void 0
  };
  const rawChildSelect = modifiedQuery.select;
  const hasObjectSelect = rawChildSelect === void 0 || isPlainObject(rawChildSelect);
  let includesQuery = modifiedQuery;
  let scalarField;
  if (materialization === `concat`) {
    if (rawChildSelect === void 0 || hasObjectSelect) {
      throw new Error(`concat(toArray(...)) for "${fieldName}" requires the subquery to select a scalar value`);
    }
  }
  if (!hasObjectSelect) {
    if (materialization === `collection`) {
      throw new Error(`Includes subquery for "${fieldName}" must select an object when materializing as a Collection`);
    }
    scalarField = INCLUDES_SCALAR_FIELD;
    includesQuery = {
      ...modifiedQuery,
      select: {
        [scalarField]: rawChildSelect
      }
    };
  }
  return new IncludesSubquery(includesQuery, parentRef, childRef, fieldName, parentFilters.length > 0 ? parentFilters : void 0, parentProjection, materialization, scalarField);
}
function collectQueryAliases(query) {
  const aliases = new Set(collectFromAliases(query.from));
  if (query.join) {
    for (const join2 of query.join) {
      aliases.add(join2.from.alias);
    }
  }
  return [
    ...aliases
  ];
}
function collectFromAliases(from) {
  if (from.type === `unionFrom`) {
    return from.sources.map((source) => source.alias);
  }
  if (from.type === `unionAll`) {
    return from.queries.flatMap((branch) => collectQueryAliases(branch));
  }
  return [
    from.alias
  ];
}
function extractCorrelation(argA, argB, parentAliases, childAliases) {
  if (argA.type === `ref` && argB.type === `ref`) {
    const aAlias = argA.path[0];
    const bAlias = argB.path[0];
    if (aAlias && bAlias && parentAliases.includes(aAlias) && childAliases.includes(bAlias)) {
      return {
        parentRef: argA,
        childRef: argB
      };
    }
    if (aAlias && bAlias && parentAliases.includes(bAlias) && childAliases.includes(aAlias)) {
      return {
        parentRef: argB,
        childRef: argA
      };
    }
  }
  return void 0;
}
function buildQuery(fn) {
  const result = fn(new BaseQueryBuilder());
  return getQueryIR(result);
}
function getQueryIR(builder) {
  return builder._getQuery();
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/query/live/utils.js
function extractCollectionsFromQuery(query) {
  const collections = {};
  function extractFromSource(source) {
    if (source.type === `collectionRef`) {
      collections[source.collection.id] = source.collection;
    } else if (source.type === `queryRef`) {
      extractFromQuery(source.query);
    } else if (source.type === `unionFrom`) {
      for (const childSource of source.sources) {
        extractFromSource(childSource);
      }
    } else if (source.type === `unionAll`) {
      for (const branch of source.queries) {
        extractFromQuery(branch);
      }
    }
  }
  function extractFromQuery(q) {
    if (q.from) {
      extractFromSource(q.from);
    }
    if (q.join && Array.isArray(q.join)) {
      for (const joinClause of q.join) {
        if (joinClause.from) {
          extractFromSource(joinClause.from);
        }
      }
    }
    if (q.select) {
      extractFromSelect(q.select);
    }
  }
  function extractFromSelect(select) {
    for (const [key, value] of Object.entries(select)) {
      if (typeof key === `string` && key.startsWith(`__SPREAD_SENTINEL__`)) {
        continue;
      }
      if (value instanceof IncludesSubquery) {
        extractFromQuery(value.query);
      } else if (value instanceof ConditionalSelect) {
        extractFromConditionalSelect(value);
      } else if (isNestedSelectObject4(value)) {
        extractFromSelect(value);
      }
    }
  }
  function extractFromConditionalSelect(conditional) {
    for (const branch of conditional.branches) {
      extractFromSelectValue(branch.value);
    }
    if (conditional.defaultValue !== void 0) {
      extractFromSelectValue(conditional.defaultValue);
    }
  }
  function extractFromSelectValue(value) {
    if (value instanceof IncludesSubquery) {
      extractFromQuery(value.query);
    } else if (value instanceof ConditionalSelect) {
      extractFromConditionalSelect(value);
    } else if (isNestedSelectObject4(value)) {
      extractFromSelect(value);
    }
  }
  extractFromQuery(query);
  return collections;
}
function extractCollectionFromSource(query) {
  const from = query.from;
  if (from.type === `collectionRef`) {
    return from.collection;
  } else if (from.type === `queryRef`) {
    return extractCollectionFromSource(from.query);
  } else if (from.type === `unionFrom`) {
    return extractCollectionFromSource({
      from: from.sources[0]
    });
  } else if (from.type === `unionAll`) {
    return extractCollectionFromSource(from.queries[0]);
  }
  throw new Error(`Failed to extract collection. Invalid FROM clause: ${JSON.stringify(query)}`);
}
function extractCollectionAliases(query) {
  const aliasesById = /* @__PURE__ */ new Map();
  function recordAlias(source) {
    if (!source) return;
    if (source.type === `collectionRef`) {
      const { id } = source.collection;
      const existing = aliasesById.get(id);
      if (existing) {
        existing.add(source.alias);
      } else {
        aliasesById.set(id, /* @__PURE__ */ new Set([
          source.alias
        ]));
      }
    } else if (source.type === `queryRef`) {
      traverse(source.query);
    } else if (source.type === `unionFrom`) {
      for (const childSource of source.sources) {
        recordAlias(childSource);
      }
    } else if (source.type === `unionAll`) {
      for (const branch of source.queries) {
        traverse(branch);
      }
    }
  }
  function traverseSelect(select) {
    for (const [key, value] of Object.entries(select)) {
      if (typeof key === `string` && key.startsWith(`__SPREAD_SENTINEL__`)) {
        continue;
      }
      if (value instanceof IncludesSubquery) {
        traverse(value.query);
      } else if (value instanceof ConditionalSelect) {
        traverseConditionalSelect(value);
      } else if (isNestedSelectObject4(value)) {
        traverseSelect(value);
      }
    }
  }
  function traverseConditionalSelect(conditional) {
    for (const branch of conditional.branches) {
      traverseSelectValue(branch.value);
    }
    if (conditional.defaultValue !== void 0) {
      traverseSelectValue(conditional.defaultValue);
    }
  }
  function traverseSelectValue(value) {
    if (value instanceof IncludesSubquery) {
      traverse(value.query);
    } else if (value instanceof ConditionalSelect) {
      traverseConditionalSelect(value);
    } else if (isNestedSelectObject4(value)) {
      traverseSelect(value);
    }
  }
  function traverse(q) {
    if (!q) return;
    recordAlias(q.from);
    if (q.join) {
      for (const joinClause of q.join) {
        recordAlias(joinClause.from);
      }
    }
    if (q.select) {
      traverseSelect(q.select);
    }
  }
  traverse(query);
  return aliasesById;
}
function isNestedSelectObject4(obj) {
  if (obj === null || typeof obj !== `object`) return false;
  if (obj instanceof IncludesSubquery) return false;
  if (isExpressionLike(obj)) return false;
  if (obj.__refProxy) return false;
  return true;
}
function buildQueryFromConfig(config) {
  const query = typeof config.query === `function` ? buildQuery(config.query) : getQueryIR(config.query);
  if (config.requireObjectResult && query.select && !isNestedSelectObject4(query.select)) {
    throw new UnsupportedRootScalarSelectError();
  }
  return query;
}
function sendChangesToInput(input, changes) {
  const multiSetArray = [];
  for (const change of changes) {
    const key = change.key;
    if (change.type === `insert`) {
      multiSetArray.push([
        [
          key,
          change.value
        ],
        1
      ]);
    } else if (change.type === `update`) {
      multiSetArray.push([
        [
          key,
          change.previousValue
        ],
        -1
      ]);
      multiSetArray.push([
        [
          key,
          change.value
        ],
        1
      ]);
    } else {
      multiSetArray.push([
        [
          key,
          change.value
        ],
        -1
      ]);
    }
  }
  if (multiSetArray.length !== 0) {
    input.sendData(new MultiSet(multiSetArray));
  }
  return multiSetArray.length;
}
function* splitUpdates(changes) {
  for (const change of changes) {
    if (change.type === `update`) {
      yield {
        type: `delete`,
        key: change.key,
        value: change.previousValue
      };
      yield {
        type: `insert`,
        key: change.key,
        value: change.value
      };
    } else {
      yield change;
    }
  }
}
function filterDuplicateInserts(changes, sentKeys) {
  const filtered = [];
  for (const change of changes) {
    if (change.type === `insert`) {
      if (sentKeys.has(change.key)) {
        continue;
      }
      sentKeys.add(change.key);
    } else if (change.type === `delete`) {
      sentKeys.delete(change.key);
    }
    filtered.push(change);
  }
  return filtered;
}
function trackBiggestSentValue(changes, current, sentKeys, comparator) {
  let biggest = current;
  let shouldResetLoadKey = false;
  for (const change of changes) {
    if (change.type === `delete`) continue;
    const isNewKey = !sentKeys.has(change.key);
    if (biggest === void 0) {
      biggest = change.value;
      shouldResetLoadKey = true;
    } else if (comparator(biggest, change.value) < 0) {
      biggest = change.value;
      shouldResetLoadKey = true;
    } else if (isNewKey) {
      shouldResetLoadKey = true;
    }
  }
  return {
    biggest,
    shouldResetLoadKey
  };
}
function computeSubscriptionOrderByHints(query, alias) {
  const { orderBy: orderBy2, limit, offset } = query;
  const effectiveLimit = limit !== void 0 && offset !== void 0 ? limit + offset : limit;
  const normalizedOrderBy = orderBy2 ? normalizeOrderByPaths(orderBy2, alias) : void 0;
  const canPassOrderBy = normalizedOrderBy?.every((clause) => {
    const exp = clause.expression;
    if (exp.type !== `ref`) return false;
    const path = exp.path;
    return Array.isArray(path) && path.length === 1;
  }) ?? false;
  return {
    orderBy: canPassOrderBy ? normalizedOrderBy : void 0,
    limit: canPassOrderBy ? effectiveLimit : void 0
  };
}
function computeOrderedLoadCursor(orderByInfo, biggestSentRow, lastLoadRequestKey, alias, limit) {
  const { orderBy: orderBy2, valueExtractorForRawRow, offset } = orderByInfo;
  const extractedValues = biggestSentRow ? valueExtractorForRawRow(biggestSentRow) : void 0;
  let minValues;
  if (extractedValues !== void 0) {
    minValues = Array.isArray(extractedValues) ? extractedValues : [
      extractedValues
    ];
  }
  const loadRequestKey = serializeValue({
    minValues: minValues ?? null,
    offset,
    limit
  });
  if (lastLoadRequestKey === loadRequestKey) {
    return void 0;
  }
  const normalizedOrderBy = normalizeOrderByPaths(orderBy2, alias);
  return {
    minValues,
    normalizedOrderBy,
    loadRequestKey
  };
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/query/live/collection-subscriber.js
var loadMoreCallbackSymbol = /* @__PURE__ */ Symbol.for(`@tanstack/db.collection-config-builder`);
var CollectionSubscriber = class {
  constructor(alias, collectionId, collection, collectionConfigBuilder) {
    this.alias = alias;
    this.collectionId = collectionId;
    this.collection = collection;
    this.collectionConfigBuilder = collectionConfigBuilder;
    this.biggest = void 0;
    this.subscriptionLoadingPromises = /* @__PURE__ */ new Map();
    this.sentToD2Keys = /* @__PURE__ */ new Set();
  }
  subscribe() {
    const whereClause = this.getWhereClauseForAlias();
    if (whereClause) {
      const whereExpression = normalizeExpressionPaths(whereClause, this.alias);
      return this.subscribeToChanges(whereExpression);
    }
    return this.subscribeToChanges();
  }
  subscribeToChanges(whereExpression) {
    const orderByInfo = this.getOrderByInfo();
    const trackLoadResult = (result) => {
      if (result instanceof Promise) {
        this.collectionConfigBuilder.liveQueryCollection._sync.trackLoadPromise(result);
      }
    };
    const onStatusChange = (event) => {
      const subscription2 = event.subscription;
      if (event.status === `loadingSubset`) {
        this.ensureLoadingPromise(subscription2);
      } else {
        const deferred = this.subscriptionLoadingPromises.get(subscription2);
        if (deferred) {
          this.subscriptionLoadingPromises.delete(subscription2);
          deferred.resolve();
        }
      }
    };
    let subscription;
    if (orderByInfo) {
      subscription = this.subscribeToOrderedChanges(whereExpression, orderByInfo, onStatusChange, trackLoadResult);
    } else {
      const includeInitialState = !this.collectionConfigBuilder.isLazyAlias(this.alias);
      subscription = this.subscribeToMatchingChanges(whereExpression, includeInitialState, onStatusChange);
    }
    if (subscription.status === `loadingSubset`) {
      this.ensureLoadingPromise(subscription);
    }
    const unsubscribe = () => {
      const deferred = this.subscriptionLoadingPromises.get(subscription);
      if (deferred) {
        this.subscriptionLoadingPromises.delete(subscription);
        deferred.resolve();
      }
      subscription.unsubscribe();
    };
    this.collectionConfigBuilder.currentSyncState.unsubscribeCallbacks.add(unsubscribe);
    return subscription;
  }
  sendChangesToPipeline(changes, callback) {
    const changesArray = Array.isArray(changes) ? changes : [
      ...changes
    ];
    const filteredChanges = filterDuplicateInserts(changesArray, this.sentToD2Keys);
    const input = this.collectionConfigBuilder.currentSyncState.inputs[this.alias];
    const sentChanges = sendChangesToInput(input, filteredChanges);
    const dataLoader = sentChanges > 0 ? callback : void 0;
    this.collectionConfigBuilder.scheduleGraphRun(dataLoader, {
      alias: this.alias
    });
  }
  subscribeToMatchingChanges(whereExpression, includeInitialState, onStatusChange) {
    const sendChanges = (changes) => {
      this.sendChangesToPipeline(changes);
    };
    const hints = computeSubscriptionOrderByHints(this.collectionConfigBuilder.query, this.alias);
    const onLoadSubsetResult = includeInitialState ? (result) => {
      if (result instanceof Promise) {
        this.collectionConfigBuilder.liveQueryCollection._sync.trackLoadPromise(result);
      }
    } : void 0;
    const subscription = this.collection.subscribeChanges(sendChanges, {
      ...includeInitialState && {
        includeInitialState
      },
      whereExpression,
      onStatusChange,
      orderBy: hints.orderBy,
      limit: hints.limit,
      onLoadSubsetResult
    });
    return subscription;
  }
  subscribeToOrderedChanges(whereExpression, orderByInfo, onStatusChange, onLoadSubsetResult) {
    const { orderBy: orderBy2, offset, limit, index } = orderByInfo;
    const handleLoadSubsetResult = (result) => {
      if (result instanceof Promise) {
        this.pendingOrderedLoadPromise = result;
        result.finally(() => {
          if (this.pendingOrderedLoadPromise === result) {
            this.pendingOrderedLoadPromise = void 0;
          }
        });
      }
      onLoadSubsetResult(result);
    };
    this.orderedLoadSubsetResult = handleLoadSubsetResult;
    const subscriptionHolder = {};
    const sendChangesInRange = (changes) => {
      const changesArray = Array.isArray(changes) ? changes : [
        ...changes
      ];
      this.trackSentValues(changesArray, orderByInfo.comparator);
      const splittedChanges = splitUpdates(changesArray);
      this.sendChangesToPipelineWithTracking(splittedChanges, subscriptionHolder.current);
    };
    const subscription = this.collection.subscribeChanges(sendChangesInRange, {
      whereExpression,
      onStatusChange
    });
    subscriptionHolder.current = subscription;
    const truncateUnsubscribe = this.collection.on(`truncate`, () => {
      this.biggest = void 0;
      this.lastLoadRequestKey = void 0;
      this.pendingOrderedLoadPromise = void 0;
      this.sentToD2Keys.clear();
    });
    subscription.on(`unsubscribed`, () => {
      truncateUnsubscribe();
    });
    const normalizedOrderBy = normalizeOrderByPaths(orderBy2, this.alias);
    if (index) {
      subscription.setOrderByIndex(index);
      subscription.requestLimitedSnapshot({
        limit: offset + limit,
        orderBy: normalizedOrderBy,
        trackLoadSubsetPromise: false,
        onLoadSubsetResult: handleLoadSubsetResult
      });
    } else {
      subscription.requestSnapshot({
        orderBy: normalizedOrderBy,
        limit: offset + limit,
        trackLoadSubsetPromise: false,
        onLoadSubsetResult: handleLoadSubsetResult
      });
    }
    return subscription;
  }
  // This function is called by maybeRunGraph
  // after each iteration of the query pipeline
  // to ensure that the orderBy operator has enough data to work with
  loadMoreIfNeeded(subscription) {
    const orderByInfo = this.getOrderByInfo();
    if (!orderByInfo) {
      return true;
    }
    const { dataNeeded, index } = orderByInfo;
    if (!dataNeeded || !index) {
      return true;
    }
    if (this.pendingOrderedLoadPromise) {
      return true;
    }
    const n = dataNeeded();
    if (n > 0) {
      this.loadNextItems(n, subscription);
    }
    return true;
  }
  sendChangesToPipelineWithTracking(changes, subscription) {
    const orderByInfo = this.getOrderByInfo();
    if (!orderByInfo) {
      this.sendChangesToPipeline(changes);
      return;
    }
    const subscriptionWithLoader = subscription;
    subscriptionWithLoader[loadMoreCallbackSymbol] ??= this.loadMoreIfNeeded.bind(this, subscription);
    this.sendChangesToPipeline(changes, subscriptionWithLoader[loadMoreCallbackSymbol]);
  }
  // Loads the next `n` items from the collection
  // starting from the biggest item it has sent
  loadNextItems(n, subscription) {
    const orderByInfo = this.getOrderByInfo();
    if (!orderByInfo) {
      return;
    }
    const cursor = computeOrderedLoadCursor(orderByInfo, this.biggest, this.lastLoadRequestKey, this.alias, n);
    if (!cursor) return;
    this.lastLoadRequestKey = cursor.loadRequestKey;
    subscription.requestLimitedSnapshot({
      orderBy: cursor.normalizedOrderBy,
      limit: n,
      minValues: cursor.minValues,
      trackLoadSubsetPromise: false,
      onLoadSubsetResult: this.orderedLoadSubsetResult
    });
  }
  getWhereClauseForAlias() {
    const sourceWhereClausesCache = this.collectionConfigBuilder.sourceWhereClausesCache;
    if (!sourceWhereClausesCache) {
      return void 0;
    }
    return sourceWhereClausesCache.get(this.alias);
  }
  getOrderByInfo() {
    const info = this.collectionConfigBuilder.optimizableOrderByCollections[this.collectionId];
    if (info && info.alias === this.alias) {
      return info;
    }
    return void 0;
  }
  trackSentValues(changes, comparator) {
    const result = trackBiggestSentValue(changes, this.biggest, this.sentToD2Keys, comparator);
    this.biggest = result.biggest;
    if (result.shouldResetLoadKey) {
      this.lastLoadRequestKey = void 0;
    }
  }
  ensureLoadingPromise(subscription) {
    if (this.subscriptionLoadingPromises.has(subscription)) {
      return;
    }
    let resolve;
    const promise = new Promise((res) => {
      resolve = res;
    });
    this.subscriptionLoadingPromises.set(subscription, {
      resolve
    });
    this.collectionConfigBuilder.liveQueryCollection._sync.trackLoadPromise(promise);
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/query/live/collection-config-builder.js
var liveQueryCollectionCounter = 0;
var CollectionConfigBuilder = class {
  constructor(config) {
    this.config = config;
    this.compiledAliasToCollectionId = {};
    this.resultKeys = /* @__PURE__ */ new WeakMap();
    this.orderByIndices = /* @__PURE__ */ new WeakMap();
    this.isGraphRunning = false;
    this.runCount = 0;
    this.isInErrorState = false;
    this.aliasDependencies = {};
    this.builderDependencies = /* @__PURE__ */ new Set();
    this.pendingGraphRuns = /* @__PURE__ */ new Map();
    this.subscriptions = {};
    this.lazySourcesCallbacks = {};
    this.lazySources = /* @__PURE__ */ new Set();
    this.optimizableOrderByCollections = {};
    this.id = config.id || `live-query-${++liveQueryCollectionCounter}`;
    this.query = buildQueryFromConfig({
      query: config.query,
      requireObjectResult: true
    });
    this.collections = extractCollectionsFromQuery(this.query);
    const collectionAliasesById = extractCollectionAliases(this.query);
    this.collectionByAlias = {};
    for (const [collectionId, aliases] of collectionAliasesById.entries()) {
      const collection = this.collections[collectionId];
      if (!collection) continue;
      for (const alias of aliases) {
        this.collectionByAlias[alias] = collection;
      }
    }
    if (this.query.orderBy && this.query.orderBy.length > 0) {
      this.compare = createOrderByComparator(this.orderByIndices);
    }
    this.compareOptions = this.config.defaultStringCollation ?? extractCollectionFromSource(this.query).compareOptions;
    this.compileBasePipeline();
  }
  /**
   * Recursively checks if a query or any of its subqueries contains joins
   */
  hasJoins(query) {
    if (query.join && query.join.length > 0) {
      return true;
    }
    if (query.from.type === `queryRef`) {
      if (this.hasJoins(query.from.query)) {
        return true;
      }
    } else if (query.from.type === `unionFrom`) {
      for (const source of query.from.sources) {
        if (source.type === `queryRef` && this.hasJoins(source.query)) {
          return true;
        }
      }
    } else if (query.from.type === `unionAll`) {
      for (const branch of query.from.queries) {
        if (this.hasJoins(branch)) {
          return true;
        }
      }
    }
    return false;
  }
  getConfig() {
    return {
      id: this.id,
      getKey: this.config.getKey || ((item) => this.resultKeys.get(item) ?? item.$key),
      sync: this.getSyncConfig(),
      compare: this.compare,
      defaultStringCollation: this.compareOptions,
      gcTime: this.config.gcTime ?? 5e3,
      // 5 seconds by default for live queries
      schema: this.config.schema,
      onInsert: this.config.onInsert,
      onUpdate: this.config.onUpdate,
      onDelete: this.config.onDelete,
      startSync: this.config.startSync,
      singleResult: this.query.singleResult,
      utils: {
        getRunCount: this.getRunCount.bind(this),
        setWindow: this.setWindow.bind(this),
        getWindow: this.getWindow.bind(this),
        [LIVE_QUERY_INTERNAL]: {
          getBuilder: () => this,
          hasCustomGetKey: !!this.config.getKey,
          hasJoins: this.hasJoins(this.query),
          hasDistinct: !!this.query.distinct
        }
      }
    };
  }
  setWindow(options) {
    if (!this.windowFn) {
      throw new SetWindowRequiresOrderByError();
    }
    this.currentWindow = options;
    this.windowFn(options);
    this.maybeRunGraphFn?.();
    if (this.liveQueryCollection?.isLoadingSubset) {
      return new Promise((resolve) => {
        const unsubscribe = this.liveQueryCollection.on(`loadingSubset:change`, (event) => {
          if (!event.isLoadingSubset) {
            unsubscribe();
            resolve();
          }
        });
      });
    }
    return true;
  }
  getWindow() {
    if (!this.windowFn || !this.currentWindow) {
      return void 0;
    }
    return {
      offset: this.currentWindow.offset ?? 0,
      limit: this.currentWindow.limit ?? 0
    };
  }
  /**
   * Resolves a collection alias to its collection ID.
   *
   * Uses a two-tier lookup strategy:
   * 1. First checks compiled aliases (includes subquery inner aliases)
   * 2. Falls back to declared aliases from the query's from/join clauses
   *
   * @param alias - The alias to resolve (e.g., "employee", "manager")
   * @returns The collection ID that the alias references
   * @throws {Error} If the alias is not found in either lookup
   */
  getCollectionIdForAlias(alias) {
    const compiled = this.compiledAliasToCollectionId[alias];
    if (compiled) {
      return compiled;
    }
    const collection = this.collectionByAlias[alias];
    if (collection) {
      return collection.id;
    }
    throw new Error(`Unknown source alias "${alias}"`);
  }
  isLazyAlias(alias) {
    return this.lazySources.has(alias);
  }
  // The callback function is called after the graph has run.
  // This gives the callback a chance to load more data if needed,
  // that's used to optimize orderBy operators that set a limit,
  // in order to load some more data if we still don't have enough rows after the pipeline has run.
  // That can happen because even though we load N rows, the pipeline might filter some of these rows out
  // causing the orderBy operator to receive less than N rows or even no rows at all.
  // So this callback would notice that it doesn't have enough rows and load some more.
  // The callback returns a boolean, when it's true it's done loading data and we can mark the collection as ready.
  maybeRunGraph(callback) {
    if (this.isGraphRunning) {
      return;
    }
    if (!this.currentSyncConfig || !this.currentSyncState) {
      throw new Error(`maybeRunGraph called without active sync session. This should not happen.`);
    }
    this.isGraphRunning = true;
    try {
      const { begin, commit } = this.currentSyncConfig;
      const syncState = this.currentSyncState;
      if (this.isInErrorState) {
        return;
      }
      if (syncState.subscribedToAllCollections) {
        let callbackCalled = false;
        while (syncState.graph.pendingWork()) {
          syncState.graph.run();
          syncState.flushPendingChanges?.();
          callback?.();
          callbackCalled = true;
        }
        if (!callbackCalled) {
          callback?.();
        }
        if (syncState.messagesCount === 0) {
          begin();
          commit();
        }
        this.updateLiveQueryStatus(this.currentSyncConfig);
      }
    } finally {
      this.isGraphRunning = false;
    }
  }
  /**
   * Schedules a graph run with the transaction-scoped scheduler.
   * Ensures each builder runs at most once per transaction, with automatic dependency tracking
   * to run parent queries before child queries. Outside a transaction, runs immediately.
   *
   * Multiple calls during a transaction are coalesced into a single execution.
   * Dependencies are auto-discovered from subscribed live queries, or can be overridden.
   * Load callbacks are combined when entries merge.
   *
   * Uses the current sync session's config and syncState from instance properties.
   *
   * @param callback - Optional callback to load more data if needed (returns true when done)
   * @param options - Optional scheduling configuration
   * @param options.contextId - Transaction ID to group work; defaults to active transaction
   * @param options.jobId - Unique identifier for this job; defaults to this builder instance
   * @param options.alias - Source alias that triggered this schedule; adds alias-specific dependencies
   * @param options.dependencies - Explicit dependency list; overrides auto-discovered dependencies
   */
  scheduleGraphRun(callback, options) {
    const contextId = options?.contextId ?? getActiveTransaction()?.id;
    const jobId = options?.jobId ?? this;
    const dependentBuilders = (() => {
      if (options?.dependencies) {
        return options.dependencies;
      }
      const deps = new Set(this.builderDependencies);
      if (options?.alias) {
        const aliasDeps = this.aliasDependencies[options.alias];
        if (aliasDeps) {
          for (const dep of aliasDeps) {
            deps.add(dep);
          }
        }
      }
      deps.delete(this);
      return Array.from(deps);
    })();
    if (contextId) {
      for (const dep of dependentBuilders) {
        if (typeof dep.scheduleGraphRun === `function`) {
          dep.scheduleGraphRun(void 0, {
            contextId
          });
        }
      }
    }
    if (!this.currentSyncConfig || !this.currentSyncState) {
      throw new Error(`scheduleGraphRun called without active sync session. This should not happen.`);
    }
    let pending = contextId ? this.pendingGraphRuns.get(contextId) : void 0;
    if (!pending) {
      pending = {
        loadCallbacks: /* @__PURE__ */ new Set()
      };
      if (contextId) {
        this.pendingGraphRuns.set(contextId, pending);
      }
    }
    if (callback) {
      pending.loadCallbacks.add(callback);
    }
    const pendingToPass = contextId ? void 0 : pending;
    transactionScopedScheduler.schedule({
      contextId,
      jobId,
      dependencies: dependentBuilders,
      run: () => this.executeGraphRun(contextId, pendingToPass)
    });
  }
  /**
   * Clears pending graph run state for a specific context.
   * Called when the scheduler clears a context (e.g., transaction rollback/abort).
   */
  clearPendingGraphRun(contextId) {
    this.pendingGraphRuns.delete(contextId);
  }
  /**
   * Returns true if this builder has a pending graph run for the given context.
   */
  hasPendingGraphRun(contextId) {
    return this.pendingGraphRuns.has(contextId);
  }
  /**
   * Executes a pending graph run. Called by the scheduler when dependencies are satisfied.
   * Clears the pending state BEFORE execution so that any re-schedules during the run
   * create fresh state and don't interfere with the current execution.
   * Uses instance sync state - if sync has ended, gracefully returns without executing.
   *
   * @param contextId - Optional context ID to look up pending state
   * @param pendingParam - For immediate execution (no context), pending state is passed directly
   */
  executeGraphRun(contextId, pendingParam) {
    const pending = pendingParam ?? (contextId ? this.pendingGraphRuns.get(contextId) : void 0);
    if (contextId) {
      this.pendingGraphRuns.delete(contextId);
    }
    if (!pending) {
      return;
    }
    if (!this.currentSyncConfig || !this.currentSyncState) {
      return;
    }
    this.incrementRunCount();
    const combinedLoader = () => {
      let allDone = true;
      let firstError;
      pending.loadCallbacks.forEach((loader) => {
        try {
          allDone = loader() && allDone;
        } catch (error) {
          allDone = false;
          firstError ??= error;
        }
      });
      if (firstError) {
        throw firstError;
      }
      return allDone;
    };
    this.maybeRunGraph(combinedLoader);
  }
  getSyncConfig() {
    return {
      rowUpdateMode: `full`,
      sync: this.syncFn.bind(this)
    };
  }
  incrementRunCount() {
    this.runCount++;
  }
  getRunCount() {
    return this.runCount;
  }
  syncFn(config) {
    this.liveQueryCollection = config.collection;
    this.isInErrorState = false;
    this.currentSyncConfig = config;
    const syncState = {
      messagesCount: 0,
      subscribedToAllCollections: false,
      unsubscribeCallbacks: /* @__PURE__ */ new Set()
    };
    const fullSyncState = this.extendPipelineWithChangeProcessing(config, syncState);
    this.currentSyncState = fullSyncState;
    this.unsubscribeFromSchedulerClears = transactionScopedScheduler.onClear((contextId) => {
      this.clearPendingGraphRun(contextId);
    });
    const loadingSubsetUnsubscribe = config.collection.on(`loadingSubset:change`, (event) => {
      if (!event.isLoadingSubset) {
        this.updateLiveQueryStatus(config);
      }
    });
    syncState.unsubscribeCallbacks.add(loadingSubsetUnsubscribe);
    const loadSubsetDataCallbacks = this.subscribeToAllCollections(config, fullSyncState);
    this.maybeRunGraphFn = () => this.scheduleGraphRun(loadSubsetDataCallbacks);
    this.scheduleGraphRun(loadSubsetDataCallbacks);
    return () => {
      syncState.unsubscribeCallbacks.forEach((unsubscribe) => unsubscribe());
      this.currentSyncConfig = void 0;
      this.currentSyncState = void 0;
      this.pendingGraphRuns.clear();
      this.graphCache = void 0;
      this.inputsCache = void 0;
      this.pipelineCache = void 0;
      this.sourceWhereClausesCache = void 0;
      this.includesCache = void 0;
      this.lazySources.clear();
      this.optimizableOrderByCollections = {};
      this.lazySourcesCallbacks = {};
      Object.keys(this.subscriptions).forEach((key) => delete this.subscriptions[key]);
      this.compiledAliasToCollectionId = {};
      this.unsubscribeFromSchedulerClears?.();
      this.unsubscribeFromSchedulerClears = void 0;
    };
  }
  /**
   * Compiles the query pipeline with all declared aliases.
   */
  compileBasePipeline() {
    this.graphCache = new D2();
    this.inputsCache = Object.fromEntries(Object.keys(this.collectionByAlias).map((alias) => [
      alias,
      this.graphCache.newInput()
    ]));
    const compilation = compileQuery(this.query, this.inputsCache, this.collections, this.subscriptions, this.lazySourcesCallbacks, this.lazySources, this.optimizableOrderByCollections, (windowFn) => {
      this.windowFn = windowFn;
    });
    this.pipelineCache = compilation.pipeline;
    this.sourceWhereClausesCache = compilation.sourceWhereClauses;
    this.compiledAliasToCollectionId = compilation.aliasToCollectionId;
    this.includesCache = compilation.includes;
    const missingAliases = Object.keys(this.compiledAliasToCollectionId).filter((alias) => !Object.hasOwn(this.inputsCache, alias));
    if (missingAliases.length > 0) {
      throw new MissingAliasInputsError(missingAliases);
    }
  }
  maybeCompileBasePipeline() {
    if (!this.graphCache || !this.inputsCache || !this.pipelineCache) {
      this.compileBasePipeline();
    }
    return {
      graph: this.graphCache,
      inputs: this.inputsCache,
      pipeline: this.pipelineCache
    };
  }
  extendPipelineWithChangeProcessing(config, syncState) {
    const { begin, commit } = config;
    const { graph, inputs, pipeline } = this.maybeCompileBasePipeline();
    let pendingChanges = /* @__PURE__ */ new Map();
    pipeline.pipe(output((data) => {
      const messages = data.getInner();
      syncState.messagesCount += messages.length;
      messages.reduce(accumulateChanges, pendingChanges);
    }));
    const includesState = this.setupIncludesOutput(this.includesCache, syncState);
    syncState.flushPendingChanges = () => {
      const hasParentChanges = pendingChanges.size > 0;
      const hasChildChanges = hasPendingIncludesChanges(includesState);
      if (!hasParentChanges && !hasChildChanges) {
        return;
      }
      let changesToApply = pendingChanges;
      if (this.config.getKey) {
        const merged = /* @__PURE__ */ new Map();
        for (const [, changes] of pendingChanges) {
          const customKey = this.config.getKey(changes.value);
          const existing = merged.get(customKey);
          if (existing) {
            existing.inserts += changes.inserts;
            existing.deletes += changes.deletes;
            if (changes.inserts > 0) {
              existing.value = changes.value;
              if (changes.orderByIndex !== void 0) {
                existing.orderByIndex = changes.orderByIndex;
              }
            }
          } else {
            merged.set(customKey, {
              ...changes
            });
          }
        }
        changesToApply = merged;
      }
      if (hasParentChanges) {
        begin();
        changesToApply.forEach(this.applyChanges.bind(this, config));
        commit();
      }
      pendingChanges = /* @__PURE__ */ new Map();
      flushIncludesState(includesState, config.collection, this.id, hasParentChanges ? changesToApply : null, config);
    };
    graph.finalize();
    syncState.graph = graph;
    syncState.inputs = inputs;
    syncState.pipeline = pipeline;
    return syncState;
  }
  /**
   * Sets up output callbacks for includes child pipelines.
   * Each includes entry gets its own output callback that accumulates child changes,
   * and a child registry that maps correlation key → child Collection.
   */
  setupIncludesOutput(includesEntries, syncState) {
    if (!includesEntries || includesEntries.length === 0) {
      return [];
    }
    return includesEntries.map((entry) => {
      const state = {
        fieldName: entry.fieldName,
        resultPath: entry.resultPath,
        childCorrelationField: entry.childCorrelationField,
        hasOrderBy: entry.hasOrderBy,
        materialization: entry.materialization,
        scalarField: entry.scalarField,
        childRegistry: /* @__PURE__ */ new Map(),
        pendingChildChanges: /* @__PURE__ */ new Map(),
        correlationToParentKeys: /* @__PURE__ */ new Map()
      };
      entry.pipeline.pipe(output((data) => {
        const messages = data.getInner();
        syncState.messagesCount += messages.length;
        for (const [[childKey, tupleData], multiplicity] of messages) {
          const [childResult, _orderByIndex, correlationKey, parentContext] = tupleData;
          const routingKey = computeRoutingKey(correlationKey, parentContext);
          let byChild = state.pendingChildChanges.get(routingKey);
          if (!byChild) {
            byChild = /* @__PURE__ */ new Map();
            state.pendingChildChanges.set(routingKey, byChild);
          }
          const existing = byChild.get(childKey) || {
            deletes: 0,
            inserts: 0,
            value: childResult,
            orderByIndex: _orderByIndex
          };
          if (multiplicity < 0) {
            existing.deletes += Math.abs(multiplicity);
          } else if (multiplicity > 0) {
            existing.inserts += multiplicity;
            existing.value = childResult;
          }
          byChild.set(childKey, existing);
        }
      }));
      if (entry.childCompilationResult.includes) {
        state.nestedSetups = setupNestedPipelines(entry.childCompilationResult.includes, syncState);
      }
      return state;
    });
  }
  applyChanges(config, changes, key) {
    const { write, collection } = config;
    const { deletes, inserts, value, orderByIndex } = changes;
    this.resultKeys.set(value, key);
    if (orderByIndex !== void 0) {
      this.orderByIndices.set(value, orderByIndex);
    }
    if (inserts && deletes === 0) {
      write({
        value,
        type: `insert`
      });
    } else if (
      // Insert & update(s) (updates are a delete & insert)
      inserts > deletes || // Just update(s) but the item is already in the collection (so
      // was inserted previously).
      inserts === deletes && collection.has(collection.getKeyFromItem(value))
    ) {
      write({
        value,
        type: `update`
      });
    } else if (deletes > 0) {
      write({
        value,
        type: `delete`
      });
    } else {
      throw new Error(`Could not apply changes: ${JSON.stringify(changes)}. This should never happen.`);
    }
  }
  /**
   * Handle status changes from source collections
   */
  handleSourceStatusChange(config, collectionId, event) {
    const { status } = event;
    if (status === `error`) {
      this.transitionToError(`Source collection '${collectionId}' entered error state`);
      return;
    }
    if (status === `cleaned-up`) {
      this.transitionToError(`Source collection '${collectionId}' was manually cleaned up while live query '${this.id}' depends on it. Live queries prevent automatic GC, so this was likely a manual cleanup() call.`);
      return;
    }
    this.updateLiveQueryStatus(config);
  }
  /**
   * Update the live query status based on source collection statuses
   */
  updateLiveQueryStatus(config) {
    const { markReady } = config;
    if (this.isInErrorState) {
      return;
    }
    const subscribedToAll = this.currentSyncState?.subscribedToAllCollections;
    const allReady = this.allCollectionsReady();
    const isLoading = this.liveQueryCollection?.isLoadingSubset;
    if (subscribedToAll && allReady && !isLoading) {
      markReady();
    }
  }
  /**
   * Transition the live query to error state
   */
  transitionToError(message) {
    this.isInErrorState = true;
    console.error(`[Live Query Error] ${message}`);
    this.liveQueryCollection?._lifecycle.setStatus(`error`);
  }
  allCollectionsReady() {
    return Object.values(this.collections).every((collection) => collection.isReady());
  }
  /**
   * Creates per-alias subscriptions enabling self-join support.
   * Each alias gets its own subscription with independent filters, even for the same collection.
   * Example: `{ employee: col, manager: col }` creates two separate subscriptions.
   */
  subscribeToAllCollections(config, syncState) {
    const compiledAliases = Object.entries(this.compiledAliasToCollectionId);
    if (compiledAliases.length === 0) {
      throw new Error(`Compiler returned no alias metadata for query '${this.id}'. This should not happen; please report.`);
    }
    const loaders = compiledAliases.map(([alias, collectionId]) => {
      const collection = this.collectionByAlias[alias] ?? this.collections[collectionId];
      const dependencyBuilder = getCollectionBuilder(collection);
      if (dependencyBuilder && dependencyBuilder !== this) {
        this.aliasDependencies[alias] = [
          dependencyBuilder
        ];
        this.builderDependencies.add(dependencyBuilder);
      } else {
        this.aliasDependencies[alias] = [];
      }
      const collectionSubscriber = new CollectionSubscriber(alias, collectionId, collection, this);
      const statusUnsubscribe = collection.on(`status:change`, (event) => {
        this.handleSourceStatusChange(config, collectionId, event);
      });
      syncState.unsubscribeCallbacks.add(statusUnsubscribe);
      const subscription = collectionSubscriber.subscribe();
      this.subscriptions[alias] = subscription;
      const loadMore = collectionSubscriber.loadMoreIfNeeded.bind(collectionSubscriber, subscription);
      return loadMore;
    });
    const loadSubsetDataCallbacks = () => {
      loaders.map((loader) => loader());
      return true;
    };
    syncState.subscribedToAllCollections = true;
    return loadSubsetDataCallbacks;
  }
};
function createOrderByComparator(orderByIndices) {
  return (val1, val2) => {
    const index1 = orderByIndices.get(val1);
    const index2 = orderByIndices.get(val2);
    if (index1 && index2) {
      if (index1 < index2) {
        return -1;
      } else if (index1 > index2) {
        return 1;
      } else {
        return 0;
      }
    }
    return 0;
  };
}
function materializesInline(state) {
  return state.materialization !== `collection`;
}
function materializeIncludedValue(state, entry) {
  if (!entry) {
    if (state.materialization === `array`) {
      return [];
    }
    if (state.materialization === `concat`) {
      return ``;
    }
    return void 0;
  }
  if (state.materialization === `collection`) {
    return entry.collection;
  }
  const rows = [
    ...entry.collection.toArray
  ];
  const values = state.scalarField ? rows.map((row) => row?.[state.scalarField]) : rows;
  if (state.materialization === `array`) {
    return values;
  }
  if (state.materialization === `singleton`) {
    return values[0];
  }
  return values.map((value) => String(value ?? ``)).join(``);
}
function setupNestedPipelines(includes, syncState) {
  return includes.map((entry) => {
    const buffer = /* @__PURE__ */ new Map();
    entry.pipeline.pipe(output((data) => {
      const messages = data.getInner();
      syncState.messagesCount += messages.length;
      for (const [[childKey, tupleData], multiplicity] of messages) {
        const [childResult, _orderByIndex, correlationKey, parentContext] = tupleData;
        const routingKey = computeRoutingKey(correlationKey, parentContext);
        let byChild = buffer.get(routingKey);
        if (!byChild) {
          byChild = /* @__PURE__ */ new Map();
          buffer.set(routingKey, byChild);
        }
        const existing = byChild.get(childKey) || {
          deletes: 0,
          inserts: 0,
          value: childResult,
          orderByIndex: _orderByIndex
        };
        if (multiplicity < 0) {
          existing.deletes += Math.abs(multiplicity);
        } else if (multiplicity > 0) {
          existing.inserts += multiplicity;
          existing.value = childResult;
        }
        byChild.set(childKey, existing);
      }
    }));
    const setup = {
      compilationResult: entry,
      buffer,
      snapshot: /* @__PURE__ */ new Map(),
      routingIndex: /* @__PURE__ */ new Map(),
      routingReverseIndex: /* @__PURE__ */ new Map(),
      routingChildToNested: /* @__PURE__ */ new Map()
    };
    if (entry.childCompilationResult.includes) {
      setup.nestedSetups = setupNestedPipelines(entry.childCompilationResult.includes, syncState);
    }
    return setup;
  });
}
function createPerEntryIncludesStates(setups) {
  return setups.map((setup) => {
    const state = {
      fieldName: setup.compilationResult.fieldName,
      resultPath: setup.compilationResult.resultPath,
      childCorrelationField: setup.compilationResult.childCorrelationField,
      hasOrderBy: setup.compilationResult.hasOrderBy,
      materialization: setup.compilationResult.materialization,
      scalarField: setup.compilationResult.scalarField,
      childRegistry: /* @__PURE__ */ new Map(),
      pendingChildChanges: /* @__PURE__ */ new Map(),
      correlationToParentKeys: /* @__PURE__ */ new Map()
    };
    if (setup.nestedSetups) {
      state.nestedSetups = setup.nestedSetups;
    }
    return state;
  });
}
function cloneSnapshotValue(value) {
  if (value == null || typeof value !== `object`) {
    return value;
  }
  return Array.isArray(value) ? [
    ...value
  ] : {
    ...value
  };
}
function accumulateSnapshot(setup, nestedCorrelationKey, childChanges) {
  let snap = setup.snapshot.get(nestedCorrelationKey);
  if (!snap) {
    snap = /* @__PURE__ */ new Map();
    setup.snapshot.set(nestedCorrelationKey, snap);
  }
  for (const [childKey, changes] of childChanges) {
    let row = snap.get(childKey);
    if (!row) {
      row = {
        value: cloneSnapshotValue(changes.value),
        orderByIndex: changes.orderByIndex,
        count: 0
      };
      snap.set(childKey, row);
    }
    row.count += changes.inserts - changes.deletes;
    if (changes.inserts > 0) {
      row.value = cloneSnapshotValue(changes.value);
      if (changes.orderByIndex !== void 0) {
        row.orderByIndex = changes.orderByIndex;
      }
    }
    if (row.count <= 0) {
      snap.delete(childKey);
    }
  }
  if (snap.size === 0) {
    setup.snapshot.delete(nestedCorrelationKey);
  }
}
function seedParentFromSnapshot(state, setupIndex, parentCorrelationKey, nestedCorrelationKey) {
  const setup = state.nestedSetups[setupIndex];
  const snap = setup.snapshot.get(nestedCorrelationKey);
  if (!snap || snap.size === 0) return;
  const entry = state.childRegistry.get(parentCorrelationKey);
  if (!entry || !entry.includesStates) return;
  const entryState = entry.includesStates[setupIndex];
  let byChild = entryState.pendingChildChanges.get(nestedCorrelationKey);
  if (!byChild) {
    byChild = /* @__PURE__ */ new Map();
    entryState.pendingChildChanges.set(nestedCorrelationKey, byChild);
  }
  for (const [childKey, row] of snap) {
    if (byChild.has(childKey)) continue;
    byChild.set(childKey, {
      deletes: 0,
      inserts: row.count,
      value: cloneSnapshotValue(row.value),
      orderByIndex: row.orderByIndex
    });
  }
}
function drainNestedBuffers(state) {
  const dirtyCorrelationKeys = /* @__PURE__ */ new Set();
  if (!state.nestedSetups) return dirtyCorrelationKeys;
  for (const setup of state.nestedSetups) {
    const toDelete = [];
    for (const [nestedCorrelationKey, childChanges] of setup.buffer) {
      const stateRoutes = setup.routingIndex.get(nestedCorrelationKey);
      if (stateRoutes === void 0 || stateRoutes.size === 0) {
        continue;
      }
      let routedToAny = false;
      for (const [targetState, parentRoutes] of stateRoutes) {
        const targetSetupIndex = targetState.nestedSetups?.indexOf(setup) ?? -1;
        if (targetSetupIndex < 0) continue;
        for (const parentCorrelationKey of parentRoutes.keys()) {
          const entry = targetState.childRegistry.get(parentCorrelationKey);
          if (!entry || !entry.includesStates) {
            continue;
          }
          const entryState = entry.includesStates[targetSetupIndex];
          for (const [childKey, changes] of childChanges) {
            let byChild = entryState.pendingChildChanges.get(nestedCorrelationKey);
            if (!byChild) {
              byChild = /* @__PURE__ */ new Map();
              entryState.pendingChildChanges.set(nestedCorrelationKey, byChild);
            }
            const existing = byChild.get(childKey);
            if (existing) {
              existing.inserts += changes.inserts;
              existing.deletes += changes.deletes;
              if (changes.inserts > 0) {
                existing.value = changes.value;
                if (changes.orderByIndex !== void 0) {
                  existing.orderByIndex = changes.orderByIndex;
                }
              }
            } else {
              byChild.set(childKey, {
                ...changes
              });
            }
          }
          if (targetState === state) {
            dirtyCorrelationKeys.add(parentCorrelationKey);
          }
          routedToAny = true;
        }
      }
      if (routedToAny) {
        accumulateSnapshot(setup, nestedCorrelationKey, childChanges);
        toDelete.push(nestedCorrelationKey);
      }
    }
    for (const key of toDelete) {
      setup.buffer.delete(key);
    }
  }
  return dirtyCorrelationKeys;
}
function removeChildKeyFromRoute(setup, state, correlationKey, nestedRoutingKey, childKey) {
  const stateRoutes = setup.routingIndex.get(nestedRoutingKey);
  const parents = stateRoutes?.get(state);
  const childKeys = parents?.get(correlationKey);
  if (!parents || !childKeys) return;
  childKeys.delete(childKey);
  if (childKeys.size === 0) {
    parents.delete(correlationKey);
    if (parents.size === 0) {
      stateRoutes.delete(state);
      if (stateRoutes.size === 0) {
        setup.routingIndex.delete(nestedRoutingKey);
      }
    }
    const reverse = setup.routingReverseIndex.get(state);
    const reverseSet = reverse?.get(correlationKey);
    if (reverseSet) {
      reverseSet.delete(nestedRoutingKey);
      if (reverseSet.size === 0) {
        reverse.delete(correlationKey);
        if (reverse.size === 0) {
          setup.routingReverseIndex.delete(state);
        }
      }
    }
  }
}
function updateRoutingIndex(state, correlationKey, childChanges) {
  if (!state.nestedSetups) return;
  for (let i = 0; i < state.nestedSetups.length; i++) {
    const setup = state.nestedSetups[i];
    let childToNested = setup.routingChildToNested.get(state);
    if (!childToNested) {
      childToNested = /* @__PURE__ */ new Map();
      setup.routingChildToNested.set(state, childToNested);
    }
    for (const [childKey, change] of childChanges) {
      if (change.inserts > 0) {
        const nestedRouting = change.value[INCLUDES_ROUTING]?.[setup.compilationResult.fieldName];
        const nestedCorrelationKey = nestedRouting?.correlationKey;
        const nestedParentContext = nestedRouting?.parentContext ?? null;
        const nestedRoutingKey = computeRoutingKey(nestedCorrelationKey, nestedParentContext);
        const perParent = childToNested.get(correlationKey);
        const prevNestedKey = perParent?.get(childKey);
        if (prevNestedKey !== void 0 && prevNestedKey !== nestedRoutingKey) {
          removeChildKeyFromRoute(setup, state, correlationKey, prevNestedKey, childKey);
          perParent.delete(childKey);
        }
        if (nestedCorrelationKey != null) {
          let stateRoutes = setup.routingIndex.get(nestedRoutingKey);
          if (!stateRoutes) {
            stateRoutes = /* @__PURE__ */ new Map();
            setup.routingIndex.set(nestedRoutingKey, stateRoutes);
          }
          let parents = stateRoutes.get(state);
          if (!parents) {
            parents = /* @__PURE__ */ new Map();
            stateRoutes.set(state, parents);
          }
          let childKeys = parents.get(correlationKey);
          const isNewParent = !childKeys || childKeys.size === 0;
          if (!childKeys) {
            childKeys = /* @__PURE__ */ new Set();
            parents.set(correlationKey, childKeys);
          }
          childKeys.add(childKey);
          let reverse = setup.routingReverseIndex.get(state);
          if (!reverse) {
            reverse = /* @__PURE__ */ new Map();
            setup.routingReverseIndex.set(state, reverse);
          }
          let reverseSet = reverse.get(correlationKey);
          if (!reverseSet) {
            reverseSet = /* @__PURE__ */ new Set();
            reverse.set(correlationKey, reverseSet);
          }
          reverseSet.add(nestedRoutingKey);
          let recorded = perParent;
          if (!recorded) {
            recorded = /* @__PURE__ */ new Map();
            childToNested.set(correlationKey, recorded);
          }
          recorded.set(childKey, nestedRoutingKey);
          if (isNewParent) {
            seedParentFromSnapshot(state, i, correlationKey, nestedRoutingKey);
          }
        } else if (perParent && perParent.size === 0) {
          childToNested.delete(correlationKey);
        }
      } else if (change.deletes > 0 && change.inserts === 0) {
        const nestedRouting2 = change.value[INCLUDES_ROUTING]?.[setup.compilationResult.fieldName];
        const nestedCorrelationKey = nestedRouting2?.correlationKey;
        const nestedParentContext2 = nestedRouting2?.parentContext ?? null;
        const nestedRoutingKey = computeRoutingKey(nestedCorrelationKey, nestedParentContext2);
        if (nestedCorrelationKey != null) {
          removeChildKeyFromRoute(setup, state, correlationKey, nestedRoutingKey, childKey);
        }
        const perParent = childToNested.get(correlationKey);
        if (perParent) {
          perParent.delete(childKey);
          if (perParent.size === 0) childToNested.delete(correlationKey);
        }
      }
    }
  }
}
function cleanRoutingIndexOnDelete(state, correlationKey) {
  if (!state.nestedSetups) return;
  for (const setup of state.nestedSetups) {
    const reverseIndex = setup.routingReverseIndex.get(state);
    const nestedKeys = reverseIndex?.get(correlationKey);
    if (!nestedKeys) continue;
    for (const nestedKey of nestedKeys) {
      const stateRoutes = setup.routingIndex.get(nestedKey);
      const parents = stateRoutes?.get(state);
      if (parents) {
        parents.delete(correlationKey);
        if (parents.size === 0) {
          stateRoutes.delete(state);
          if (stateRoutes.size === 0) {
            setup.routingIndex.delete(nestedKey);
          }
        }
      }
    }
    reverseIndex.delete(correlationKey);
    if (reverseIndex.size === 0) {
      setup.routingReverseIndex.delete(state);
    }
    const childToNested = setup.routingChildToNested.get(state);
    if (childToNested) {
      childToNested.delete(correlationKey);
      if (childToNested.size === 0) {
        setup.routingChildToNested.delete(state);
      }
    }
  }
}
function hasNestedBufferChanges(setups) {
  for (const setup of setups) {
    if (setup.buffer.size > 0) return true;
    if (setup.nestedSetups && hasNestedBufferChanges(setup.nestedSetups)) return true;
  }
  return false;
}
function computeRoutingKey(correlationKey, parentContext) {
  if (parentContext == null) return correlationKey;
  return JSON.stringify([
    correlationKey,
    parentContext
  ]);
}
function createChildCollectionEntry(parentId, fieldName, correlationKey, hasOrderBy, nestedSetups) {
  const resultKeys = /* @__PURE__ */ new WeakMap();
  const orderByIndices = hasOrderBy ? /* @__PURE__ */ new WeakMap() : null;
  let syncMethods = null;
  const compare = orderByIndices ? createOrderByComparator(orderByIndices) : void 0;
  const collection = createCollection({
    id: `__child-collection:${parentId}-${fieldName}-${serializeValue(correlationKey)}`,
    getKey: (item) => resultKeys.get(item),
    compare,
    sync: {
      rowUpdateMode: `full`,
      sync: (methods) => {
        syncMethods = methods;
        return () => {
          syncMethods = null;
        };
      }
    },
    startSync: true,
    gcTime: 0
  });
  const entry = {
    collection,
    get syncMethods() {
      return syncMethods;
    },
    resultKeys,
    orderByIndices
  };
  if (nestedSetups) {
    entry.includesStates = createPerEntryIncludesStates(nestedSetups);
  }
  return entry;
}
function flushIncludesState(includesState, parentCollection, parentId, parentChanges, parentSyncMethods) {
  for (const state of includesState) {
    if (parentChanges) {
      for (const [parentKey, changes] of parentChanges) {
        if (changes.inserts > 0) {
          const parentResult = changes.value;
          const routing = parentResult[INCLUDES_ROUTING]?.[state.fieldName];
          const correlationKey = routing?.correlationKey;
          const parentContext = routing?.parentContext ?? null;
          const routingKey = computeRoutingKey(correlationKey, parentContext);
          if (correlationKey != null) {
            if (!state.childRegistry.has(routingKey)) {
              const entry = createChildCollectionEntry(parentId, state.fieldName, routingKey, state.hasOrderBy, state.nestedSetups);
              state.childRegistry.set(routingKey, entry);
            }
            let parentKeys = state.correlationToParentKeys.get(routingKey);
            if (!parentKeys) {
              parentKeys = /* @__PURE__ */ new Set();
              state.correlationToParentKeys.set(routingKey, parentKeys);
            }
            parentKeys.add(parentKey);
            const childValue = materializeIncludedValue(state, state.childRegistry.get(routingKey));
            setIncludedValue(parentResult, state.resultPath, childValue);
            const storedParent = parentCollection.get(parentKey);
            if (storedParent && storedParent !== parentResult) {
              setIncludedValue(storedParent, state.resultPath, childValue);
            }
          }
        }
      }
    }
    const affectedCorrelationKeys = materializesInline(state) ? new Set(state.pendingChildChanges.keys()) : null;
    const entriesWithChildChanges = /* @__PURE__ */ new Map();
    if (state.pendingChildChanges.size > 0) {
      for (const [correlationKey, childChanges] of state.pendingChildChanges) {
        let entry = state.childRegistry.get(correlationKey);
        if (!entry) {
          entry = createChildCollectionEntry(parentId, state.fieldName, correlationKey, state.hasOrderBy, state.nestedSetups);
          state.childRegistry.set(correlationKey, entry);
        }
        if (state.materialization === `collection`) {
          attachChildCollectionToParent(parentCollection, state.resultPath, correlationKey, state.correlationToParentKeys, entry.collection);
        }
        if (entry.syncMethods) {
          entry.syncMethods.begin();
          for (const [childKey, change] of childChanges) {
            entry.resultKeys.set(change.value, childKey);
            if (entry.orderByIndices && change.orderByIndex !== void 0) {
              entry.orderByIndices.set(change.value, change.orderByIndex);
            }
            const key = entry.syncMethods.collection.getKeyFromItem(change.value);
            const childAlreadyExists = entry.syncMethods.collection.has(key);
            if (change.inserts > 0 && change.deletes === 0) {
              entry.syncMethods.write({
                value: change.value,
                type: childAlreadyExists ? `update` : `insert`
              });
            } else if (change.inserts > change.deletes || change.inserts === change.deletes && childAlreadyExists) {
              entry.syncMethods.write({
                value: change.value,
                type: `update`
              });
            } else if (change.deletes > 0) {
              entry.syncMethods.write({
                value: change.value,
                type: `delete`
              });
            }
          }
          entry.syncMethods.commit();
        }
        updateRoutingIndex(state, correlationKey, childChanges);
        entriesWithChildChanges.set(correlationKey, {
          entry,
          childChanges
        });
      }
      state.pendingChildChanges.clear();
    }
    const dirtyFromBuffers = drainNestedBuffers(state);
    for (const [, { entry, childChanges }] of entriesWithChildChanges) {
      if (entry.includesStates) {
        flushIncludesState(entry.includesStates, entry.collection, entry.collection.id, childChanges, entry.syncMethods);
      }
    }
    for (const correlationKey of dirtyFromBuffers) {
      if (entriesWithChildChanges.has(correlationKey)) continue;
      const entry = state.childRegistry.get(correlationKey);
      if (entry?.includesStates) {
        flushIncludesState(entry.includesStates, entry.collection, entry.collection.id, null, entry.syncMethods);
      }
    }
    const deepBufferDirty = /* @__PURE__ */ new Set();
    if (state.nestedSetups) {
      for (const [correlationKey, entry] of state.childRegistry) {
        if (entriesWithChildChanges.has(correlationKey)) continue;
        if (dirtyFromBuffers.has(correlationKey)) continue;
        if (entry.includesStates && hasPendingIncludesChanges(entry.includesStates)) {
          flushIncludesState(entry.includesStates, entry.collection, entry.collection.id, null, entry.syncMethods);
          deepBufferDirty.add(correlationKey);
        }
      }
    }
    const inlineReEmitKeys = materializesInline(state) ? /* @__PURE__ */ new Set([
      ...affectedCorrelationKeys || [],
      ...dirtyFromBuffers,
      ...deepBufferDirty
    ]) : null;
    if (parentSyncMethods && inlineReEmitKeys && inlineReEmitKeys.size > 0) {
      const events = [];
      for (const correlationKey of inlineReEmitKeys) {
        const parentKeys = state.correlationToParentKeys.get(correlationKey);
        if (!parentKeys) continue;
        const entry = state.childRegistry.get(correlationKey);
        for (const parentKey of parentKeys) {
          const item = parentCollection.get(parentKey);
          if (item) {
            const previousValue = cloneForIncludesUpdate(item, state.resultPath);
            setIncludedValue(item, state.resultPath, materializeIncludedValue(state, entry));
            const nextValue = cloneForIncludesUpdate(item, state.resultPath);
            events.push({
              type: `update`,
              key: parentKey,
              value: nextValue,
              previousValue
            });
          }
        }
      }
      if (events.length > 0) {
        const changesManager = parentCollection._changes;
        changesManager.emitEvents(events, true);
      }
    }
    if (parentChanges) {
      for (const [parentKey, changes] of parentChanges) {
        if (changes.deletes > 0 && changes.inserts === 0) {
          const routing = changes.value[INCLUDES_ROUTING]?.[state.fieldName];
          const correlationKey = routing?.correlationKey;
          const parentContext = routing?.parentContext ?? null;
          const routingKey = computeRoutingKey(correlationKey, parentContext);
          if (correlationKey != null) {
            const parentKeys = state.correlationToParentKeys.get(routingKey);
            if (parentKeys) {
              parentKeys.delete(parentKey);
              if (parentKeys.size === 0) {
                cleanRoutingIndexOnDelete(state, routingKey);
                state.childRegistry.delete(routingKey);
                state.correlationToParentKeys.delete(routingKey);
              }
            }
          }
        }
      }
    }
  }
  if (parentChanges) {
    for (const [, changes] of parentChanges) {
      delete changes.value[INCLUDES_ROUTING];
    }
  }
}
function hasPendingIncludesChanges(states) {
  for (const state of states) {
    if (state.pendingChildChanges.size > 0) return true;
    if (state.nestedSetups && hasNestedBufferChanges(state.nestedSetups)) return true;
    for (const entry of state.childRegistry.values()) {
      if (entry.includesStates && hasPendingIncludesChanges(entry.includesStates)) return true;
    }
  }
  return false;
}
function attachChildCollectionToParent(parentCollection, resultPath, correlationKey, correlationToParentKeys, childCollection) {
  const parentKeys = correlationToParentKeys.get(correlationKey);
  if (!parentKeys) return;
  for (const parentKey of parentKeys) {
    const item = parentCollection.get(parentKey);
    if (item) {
      setIncludedValue(item, resultPath, childCollection);
    }
  }
}
function setIncludedValue(target, path, value) {
  const state = getFnSelectState(target);
  if (!state) {
    setNestedValue(target, path, value);
    return;
  }
  setNestedValue(state.sourceRow, path, value);
  refreshFnSelectResult(target, state);
}
function getFnSelectState(target) {
  return target[FN_SELECT_STATE];
}
function refreshFnSelectResult(target, state) {
  const targetRecord = target;
  const sourceRecord = state.sourceRow;
  const routing = targetRecord[INCLUDES_ROUTING] ?? sourceRecord[INCLUDES_ROUTING];
  const nextValue = state.fnSelect(state.sourceRow);
  if (!nextValue || typeof nextValue !== `object`) {
    return;
  }
  for (const key of Object.keys(target)) {
    delete target[key];
  }
  Object.assign(target, nextValue);
  if (routing) {
    targetRecord[INCLUDES_ROUTING] = routing;
  }
  Object.defineProperty(target, FN_SELECT_STATE, {
    value: state,
    enumerable: true,
    configurable: true
  });
}
function setNestedValue(target, path, value) {
  if (path.length === 0) {
    return;
  }
  let cursor = target;
  for (let i = 0; i < path.length - 1; i++) {
    const segment = path[i];
    const next = cursor[segment];
    if (next == null || typeof next !== `object`) {
      cursor[segment] = {};
    }
    cursor = cursor[segment];
  }
  cursor[path[path.length - 1]] = value;
}
function cloneForIncludesUpdate(target, path) {
  return getFnSelectState(target) ? {
    ...target
  } : clonePathForUpdate(target, path);
}
function clonePathForUpdate(target, path) {
  const root = {
    ...target
  };
  let sourceCursor = target;
  let cloneCursor = root;
  for (let i = 0; i < path.length - 1; i++) {
    const segment = path[i];
    const sourceValue = sourceCursor?.[segment];
    if (sourceValue == null || typeof sourceValue !== `object`) {
      return root;
    }
    const clonedValue = Array.isArray(sourceValue) ? [
      ...sourceValue
    ] : {
      ...sourceValue
    };
    cloneCursor[segment] = clonedValue;
    sourceCursor = sourceValue;
    cloneCursor = clonedValue;
  }
  return root;
}
function accumulateChanges(acc, [[key, tupleData], multiplicity]) {
  const [value, orderByIndex] = tupleData;
  const changes = acc.get(key) || {
    deletes: 0,
    inserts: 0,
    value,
    orderByIndex
  };
  if (multiplicity < 0) {
    changes.deletes += Math.abs(multiplicity);
  } else if (multiplicity > 0) {
    changes.inserts += multiplicity;
    changes.value = value;
    if (orderByIndex !== void 0) {
      changes.orderByIndex = orderByIndex;
    }
  }
  acc.set(key, changes);
  return acc;
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/query/live-query-collection.js
function liveQueryCollectionOptions(config) {
  const collectionConfigBuilder = new CollectionConfigBuilder(config);
  return collectionConfigBuilder.getConfig();
}
function createLiveQueryCollection(configOrQuery) {
  if (typeof configOrQuery === `function`) {
    const config = {
      query: configOrQuery
    };
    const options = liveQueryCollectionOptions(config);
    return bridgeToCreateCollection(options);
  } else {
    const config = configOrQuery;
    const options = liveQueryCollectionOptions(config);
    if (config.utils) {
      options.utils = {
        ...options.utils,
        ...config.utils
      };
    }
    return bridgeToCreateCollection(options);
  }
}
function bridgeToCreateCollection(options) {
  const collection = createCollection(options);
  const builder = getBuilderFromConfig(options);
  if (builder) {
    registerCollectionBuilder(collection, builder);
  }
  return collection;
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/query/predicate-utils.js
function isWhereSubset(subset, superset) {
  if (subset === void 0 && superset === void 0) {
    return true;
  }
  if (subset === void 0 && superset !== void 0) {
    return false;
  }
  if (superset === void 0 && subset !== void 0) {
    return true;
  }
  return isWhereSubsetInternal(subset, superset);
}
function makeDisjunction(preds) {
  if (preds.length === 0) {
    return new Value(false);
  }
  if (preds.length === 1) {
    return preds[0];
  }
  return new Func(`or`, preds);
}
function convertInToOr(inField) {
  const equalities = inField.values.map((value) => new Func(`eq`, [
    inField.ref,
    new Value(value)
  ]));
  return makeDisjunction(equalities);
}
function isWhereSubsetInternal(subset, superset) {
  if (subset.type === `val` && subset.value === false) {
    return true;
  }
  if (areExpressionsEqual(subset, superset)) {
    return true;
  }
  if (superset.type === `func` && superset.name === `and`) {
    return superset.args.every((arg) => isWhereSubsetInternal(subset, arg));
  }
  if (subset.type === `func` && subset.name === `or`) {
    return subset.args.every((arg) => isWhereSubsetInternal(arg, superset));
  }
  if (superset.type === `func` && superset.name === `or`) {
    return superset.args.some((arg) => isWhereSubsetInternal(subset, arg));
  }
  if (subset.type === `func` && subset.name === `and`) {
    return subset.args.some((arg) => isWhereSubsetInternal(arg, superset));
  }
  if (subset.type === `func` && subset.name === `in`) {
    const inField = extractInField(subset);
    if (inField) {
      return isWhereSubsetInternal(convertInToOr(inField), superset);
    }
  }
  if (superset.type === `func` && superset.name === `in`) {
    const inField = extractInField(superset);
    if (inField) {
      return isWhereSubsetInternal(subset, convertInToOr(inField));
    }
  }
  if (subset.type === `func` && superset.type === `func`) {
    const subsetFunc = subset;
    const supersetFunc = superset;
    const subsetField = extractComparisonField(subsetFunc);
    const supersetField = extractComparisonField(supersetFunc);
    if (subsetField && supersetField && areRefsEqual(subsetField.ref, supersetField.ref)) {
      return isComparisonSubset(subsetFunc, subsetField.value, supersetFunc, supersetField.value);
    }
  }
  return false;
}
function combineWherePredicates(predicates, operation, simplifyFn) {
  const emptyValue = operation === `and` ? true : false;
  const identityValue = operation === `and` ? true : false;
  if (predicates.length === 0) {
    return {
      type: `val`,
      value: emptyValue
    };
  }
  if (predicates.length === 1) {
    return predicates[0];
  }
  const flatPredicates = [];
  for (const pred of predicates) {
    if (pred.type === `func` && pred.name === operation) {
      flatPredicates.push(...pred.args);
    } else {
      flatPredicates.push(pred);
    }
  }
  const grouped = groupPredicatesByField(flatPredicates);
  const simplified = [];
  for (const [field, preds] of grouped.entries()) {
    if (field === null) {
      simplified.push(...preds);
    } else {
      const result = simplifyFn(preds);
      if (result) {
        simplified.push(result);
      }
    }
  }
  if (simplified.length === 0) {
    return {
      type: `val`,
      value: identityValue
    };
  }
  if (simplified.length === 1) {
    return simplified[0];
  }
  return {
    type: `func`,
    name: operation,
    args: simplified
  };
}
function unionWherePredicates(predicates) {
  return combineWherePredicates(predicates, `or`, unionSameFieldPredicates);
}
function minusWherePredicates(fromPredicate, subtractPredicate) {
  if (subtractPredicate === void 0) {
    return fromPredicate ?? {
      type: `val`,
      value: true
    };
  }
  if (fromPredicate === void 0) {
    return {
      type: `func`,
      name: `not`,
      args: [
        subtractPredicate
      ]
    };
  }
  if (isWhereSubset(fromPredicate, subtractPredicate)) {
    return {
      type: `val`,
      value: false
    };
  }
  const commonConditions = findCommonConditions(fromPredicate, subtractPredicate);
  if (commonConditions.length > 0) {
    const fromWithoutCommon = removeConditions(fromPredicate, commonConditions);
    const subtractWithoutCommon = removeConditions(subtractPredicate, commonConditions);
    const simplifiedDifference = minusWherePredicates(fromWithoutCommon, subtractWithoutCommon);
    if (simplifiedDifference !== null) {
      return combineConditions([
        ...commonConditions,
        simplifiedDifference
      ]);
    }
  }
  if (fromPredicate.type === `func` && subtractPredicate.type === `func`) {
    const result = minusSameFieldPredicates(fromPredicate, subtractPredicate);
    if (result !== null) {
      return result;
    }
  }
  return null;
}
function minusSameFieldPredicates(fromPred, subtractPred) {
  const fromField = extractComparisonField(fromPred) || extractEqualityField(fromPred) || extractInField(fromPred);
  const subtractField = extractComparisonField(subtractPred) || extractEqualityField(subtractPred) || extractInField(subtractPred);
  if (!fromField || !subtractField || !areRefsEqual(fromField.ref, subtractField.ref)) {
    return null;
  }
  if (fromPred.name === `in` && subtractPred.name === `in`) {
    const fromInField = fromField;
    const subtractInField = subtractField;
    const remainingValues = fromInField.values.filter((v) => !arrayIncludesWithSet(subtractInField.values, v, subtractInField.primitiveSet ?? null, subtractInField.areAllPrimitives));
    if (remainingValues.length === 0) {
      return {
        type: `val`,
        value: false
      };
    }
    if (remainingValues.length === 1) {
      return {
        type: `func`,
        name: `eq`,
        args: [
          fromField.ref,
          {
            type: `val`,
            value: remainingValues[0]
          }
        ]
      };
    }
    return {
      type: `func`,
      name: `in`,
      args: [
        fromField.ref,
        {
          type: `val`,
          value: remainingValues
        }
      ]
    };
  }
  if (fromPred.name === `in` && subtractPred.name === `eq`) {
    const fromInField = fromField;
    const subtractValue = subtractField.value;
    const remainingValues = fromInField.values.filter((v) => !areValuesEqual2(v, subtractValue));
    if (remainingValues.length === 0) {
      return {
        type: `val`,
        value: false
      };
    }
    if (remainingValues.length === 1) {
      return {
        type: `func`,
        name: `eq`,
        args: [
          fromField.ref,
          {
            type: `val`,
            value: remainingValues[0]
          }
        ]
      };
    }
    return {
      type: `func`,
      name: `in`,
      args: [
        fromField.ref,
        {
          type: `val`,
          value: remainingValues
        }
      ]
    };
  }
  if (fromPred.name === `eq` && subtractPred.name === `eq`) {
    const fromValue = fromField.value;
    const subtractValue = subtractField.value;
    if (areValuesEqual2(fromValue, subtractValue)) {
      return {
        type: `val`,
        value: false
      };
    }
    return fromPred;
  }
  const fromComp = extractComparisonField(fromPred);
  const subtractComp = extractComparisonField(subtractPred);
  if (fromComp && subtractComp && areRefsEqual(fromComp.ref, subtractComp.ref)) {
    const result = minusRangePredicates(fromPred, fromComp.value, subtractPred, subtractComp.value);
    return result;
  }
  return null;
}
function minusRangePredicates(fromFunc, fromValue, subtractFunc, subtractValue) {
  const fromOp = fromFunc.name;
  const subtractOp = subtractFunc.name;
  const ref = (extractComparisonField(fromFunc) || extractEqualityField(fromFunc)).ref;
  if (fromOp === `gt` && subtractOp === `gt`) {
    if (fromValue < subtractValue) {
      return {
        type: `func`,
        name: `and`,
        args: [
          fromFunc,
          {
            type: `func`,
            name: `lte`,
            args: [
              ref,
              {
                type: `val`,
                value: subtractValue
              }
            ]
          }
        ]
      };
    }
    return fromFunc;
  }
  if (fromOp === `gte` && subtractOp === `gte`) {
    if (fromValue < subtractValue) {
      return {
        type: `func`,
        name: `and`,
        args: [
          fromFunc,
          {
            type: `func`,
            name: `lt`,
            args: [
              ref,
              {
                type: `val`,
                value: subtractValue
              }
            ]
          }
        ]
      };
    }
    return fromFunc;
  }
  if (fromOp === `gt` && subtractOp === `gte`) {
    if (fromValue < subtractValue) {
      return {
        type: `func`,
        name: `and`,
        args: [
          fromFunc,
          {
            type: `func`,
            name: `lt`,
            args: [
              ref,
              {
                type: `val`,
                value: subtractValue
              }
            ]
          }
        ]
      };
    }
    return fromFunc;
  }
  if (fromOp === `gte` && subtractOp === `gt`) {
    if (fromValue <= subtractValue) {
      return {
        type: `func`,
        name: `and`,
        args: [
          fromFunc,
          {
            type: `func`,
            name: `lte`,
            args: [
              ref,
              {
                type: `val`,
                value: subtractValue
              }
            ]
          }
        ]
      };
    }
    return fromFunc;
  }
  if (fromOp === `lt` && subtractOp === `lt`) {
    if (fromValue > subtractValue) {
      return {
        type: `func`,
        name: `and`,
        args: [
          {
            type: `func`,
            name: `gte`,
            args: [
              ref,
              {
                type: `val`,
                value: subtractValue
              }
            ]
          },
          fromFunc
        ]
      };
    }
    return fromFunc;
  }
  if (fromOp === `lte` && subtractOp === `lte`) {
    if (fromValue > subtractValue) {
      return {
        type: `func`,
        name: `and`,
        args: [
          {
            type: `func`,
            name: `gt`,
            args: [
              ref,
              {
                type: `val`,
                value: subtractValue
              }
            ]
          },
          fromFunc
        ]
      };
    }
    return fromFunc;
  }
  if (fromOp === `lt` && subtractOp === `lte`) {
    if (fromValue > subtractValue) {
      return {
        type: `func`,
        name: `and`,
        args: [
          {
            type: `func`,
            name: `gt`,
            args: [
              ref,
              {
                type: `val`,
                value: subtractValue
              }
            ]
          },
          fromFunc
        ]
      };
    }
    return fromFunc;
  }
  if (fromOp === `lte` && subtractOp === `lt`) {
    if (fromValue >= subtractValue) {
      return {
        type: `func`,
        name: `and`,
        args: [
          {
            type: `func`,
            name: `gte`,
            args: [
              ref,
              {
                type: `val`,
                value: subtractValue
              }
            ]
          },
          fromFunc
        ]
      };
    }
    return fromFunc;
  }
  return null;
}
function isOrderBySubset(subset, superset) {
  if (!subset || subset.length === 0) {
    return true;
  }
  if (!superset || superset.length === 0) {
    return false;
  }
  if (subset.length > superset.length) {
    return false;
  }
  for (let i = 0; i < subset.length; i++) {
    const subClause = subset[i];
    const superClause = superset[i];
    if (!areExpressionsEqual(subClause.expression, superClause.expression)) {
      return false;
    }
    if (!areCompareOptionsEqual(subClause.compareOptions, superClause.compareOptions)) {
      return false;
    }
  }
  return true;
}
function isOffsetLimitSubset(subset, superset) {
  const subsetOffset = subset.offset ?? 0;
  const supersetOffset = superset.offset ?? 0;
  if (supersetOffset > subsetOffset) {
    return false;
  }
  if (superset.limit === void 0) {
    return true;
  }
  if (subset.limit === void 0) {
    return false;
  }
  const subsetEnd = subsetOffset + subset.limit;
  const supersetEnd = supersetOffset + superset.limit;
  return subsetEnd <= supersetEnd;
}
function isPredicateSubset(subset, superset) {
  if (superset.limit !== void 0) {
    if (!areWhereClausesEqual(subset.where, superset.where)) {
      return false;
    }
    return isOrderBySubset(subset.orderBy, superset.orderBy) && isOffsetLimitSubset(subset, superset);
  }
  return isWhereSubset(subset.where, superset.where) && isOrderBySubset(subset.orderBy, superset.orderBy) && isOffsetLimitSubset(subset, superset);
}
function areWhereClausesEqual(a, b) {
  if (a === void 0 && b === void 0) {
    return true;
  }
  if (a === void 0 || b === void 0) {
    return false;
  }
  return areExpressionsEqual(a, b);
}
function findCommonConditions(predicate1, predicate2) {
  const conditions1 = extractAllConditions(predicate1);
  const conditions2 = extractAllConditions(predicate2);
  const common = [];
  for (const cond1 of conditions1) {
    for (const cond2 of conditions2) {
      if (areExpressionsEqual(cond1, cond2)) {
        if (!common.some((c) => areExpressionsEqual(c, cond1))) {
          common.push(cond1);
        }
        break;
      }
    }
  }
  return common;
}
function extractAllConditions(predicate) {
  if (predicate.type === `func` && predicate.name === `and`) {
    const conditions = [];
    for (const arg of predicate.args) {
      conditions.push(...extractAllConditions(arg));
    }
    return conditions;
  }
  return [
    predicate
  ];
}
function removeConditions(predicate, conditionsToRemove) {
  if (predicate.type === `func` && predicate.name === `and`) {
    const remainingArgs = predicate.args.filter((arg) => !conditionsToRemove.some((cond) => areExpressionsEqual(arg, cond)));
    if (remainingArgs.length === 0) {
      return void 0;
    } else if (remainingArgs.length === 1) {
      return remainingArgs[0];
    } else {
      return {
        type: `func`,
        name: `and`,
        args: remainingArgs
      };
    }
  }
  return predicate;
}
function combineConditions(conditions) {
  if (conditions.length === 0) {
    return {
      type: `val`,
      value: true
    };
  } else if (conditions.length === 1) {
    return conditions[0];
  } else {
    const flattenedConditions = [];
    for (const condition of conditions) {
      if (condition.type === `func` && condition.name === `and`) {
        flattenedConditions.push(...condition.args);
      } else {
        flattenedConditions.push(condition);
      }
    }
    if (flattenedConditions.length === 1) {
      return flattenedConditions[0];
    } else {
      return {
        type: `func`,
        name: `and`,
        args: flattenedConditions
      };
    }
  }
}
function findPredicateWithOperator(predicates, operator, value) {
  return predicates.find((p) => {
    if (p.type === `func`) {
      const f = p;
      const field = extractComparisonField(f);
      return f.name === operator && field && areValuesEqual2(field.value, value);
    }
    return false;
  });
}
function areExpressionsEqual(a, b) {
  if (a.type !== b.type) {
    return false;
  }
  if (a.type === `val` && b.type === `val`) {
    return areValuesEqual2(a.value, b.value);
  }
  if (a.type === `ref` && b.type === `ref`) {
    return areRefsEqual(a, b);
  }
  if (a.type === `func` && b.type === `func`) {
    const aFunc = a;
    const bFunc = b;
    if (aFunc.name !== bFunc.name) {
      return false;
    }
    if (aFunc.args.length !== bFunc.args.length) {
      return false;
    }
    return aFunc.args.every((arg, i) => areExpressionsEqual(arg, bFunc.args[i]));
  }
  return false;
}
function areValuesEqual2(a, b) {
  if (a === b) {
    return true;
  }
  if (typeof a === `number` && typeof b === `number` && isNaN(a) && isNaN(b)) {
    return true;
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  if (typeof a === `object` && typeof b === `object` && a !== null && b !== null) {
    return a === b;
  }
  return false;
}
function areRefsEqual(a, b) {
  if (a.path.length !== b.path.length) {
    return false;
  }
  return a.path.every((segment, i) => segment === b.path[i]);
}
function isPrimitive(value) {
  return value === null || value === void 0 || typeof value === `string` || typeof value === `number` || typeof value === `boolean`;
}
function areAllPrimitives(values) {
  return values.every(isPrimitive);
}
function arrayIncludesWithSet(array, value, primitiveSet, arrayIsAllPrimitives) {
  if (primitiveSet) {
    if (arrayIsAllPrimitives || isPrimitive(value)) {
      return primitiveSet.has(value);
    }
    return false;
  }
  return array.some((v) => areValuesEqual2(v, value));
}
function maxValue(a, b) {
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() > b.getTime() ? a : b;
  }
  return Math.max(a, b);
}
function minValue(a, b) {
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() < b.getTime() ? a : b;
  }
  return Math.min(a, b);
}
function areCompareOptionsEqual(a, b) {
  return a.direction === b.direction;
}
function extractComparisonField(func) {
  if ([
    `eq`,
    `gt`,
    `gte`,
    `lt`,
    `lte`
  ].includes(func.name)) {
    const firstArg = func.args[0];
    const secondArg = func.args[1];
    if (firstArg?.type === `ref` && secondArg?.type === `val`) {
      return {
        ref: firstArg,
        value: secondArg.value
      };
    }
  }
  return null;
}
function extractEqualityField(func) {
  if (func.name === `eq`) {
    const firstArg = func.args[0];
    const secondArg = func.args[1];
    if (firstArg?.type === `ref` && secondArg?.type === `val`) {
      return {
        ref: firstArg,
        value: secondArg.value
      };
    }
  }
  return null;
}
function extractInField(func) {
  if (func.name === `in`) {
    const firstArg = func.args[0];
    const secondArg = func.args[1];
    if (firstArg?.type === `ref` && secondArg?.type === `val` && Array.isArray(secondArg.value)) {
      let values = secondArg.value;
      const allPrimitives = areAllPrimitives(values);
      let primitiveSet = null;
      if (allPrimitives && values.length > 10) {
        primitiveSet = new Set(values);
        if (primitiveSet.size < values.length) {
          values = Array.from(primitiveSet);
        }
      }
      return {
        ref: firstArg,
        values,
        areAllPrimitives: allPrimitives,
        primitiveSet
      };
    }
  }
  return null;
}
function isComparisonSubset(subsetFunc, subsetValue, supersetFunc, supersetValue) {
  const subOp = subsetFunc.name;
  const superOp = supersetFunc.name;
  if (subOp === superOp) {
    if (subOp === `eq`) {
      if (isPrimitive(subsetValue) && isPrimitive(supersetValue)) {
        return subsetValue === supersetValue;
      }
      return areValuesEqual2(subsetValue, supersetValue);
    } else if (subOp === `gt`) {
      return subsetValue >= supersetValue;
    } else if (subOp === `gte`) {
      return subsetValue >= supersetValue;
    } else if (subOp === `lt`) {
      return subsetValue <= supersetValue;
    } else if (subOp === `lte`) {
      return subsetValue <= supersetValue;
    }
  }
  if (subOp === `eq` && superOp === `gt`) {
    return subsetValue > supersetValue;
  }
  if (subOp === `eq` && superOp === `gte`) {
    return subsetValue >= supersetValue;
  }
  if (subOp === `eq` && superOp === `lt`) {
    return subsetValue < supersetValue;
  }
  if (subOp === `eq` && superOp === `lte`) {
    return subsetValue <= supersetValue;
  }
  if (subOp === `gt` && superOp === `gte`) {
    return subsetValue >= supersetValue;
  }
  if (subOp === `gte` && superOp === `gt`) {
    return subsetValue > supersetValue;
  }
  if (subOp === `lt` && superOp === `lte`) {
    return subsetValue <= supersetValue;
  }
  if (subOp === `lte` && superOp === `lt`) {
    return subsetValue < supersetValue;
  }
  return false;
}
function groupPredicatesByField(predicates) {
  const groups = /* @__PURE__ */ new Map();
  for (const pred of predicates) {
    let fieldKey = null;
    if (pred.type === `func`) {
      const func = pred;
      const field = extractComparisonField(func) || extractEqualityField(func) || extractInField(func);
      if (field) {
        fieldKey = field.ref.path.join(`.`);
      }
    }
    const group = groups.get(fieldKey) || [];
    group.push(pred);
    groups.set(fieldKey, group);
  }
  return groups;
}
function unionSameFieldPredicates(predicates) {
  if (predicates.length === 1) {
    return predicates[0];
  }
  let maxGt = null;
  let maxGte = null;
  let minLt = null;
  let minLte = null;
  const eqValues = /* @__PURE__ */ new Set();
  const inValues = /* @__PURE__ */ new Set();
  const otherPredicates = [];
  for (const pred of predicates) {
    if (pred.type === `func`) {
      const func = pred;
      const field = extractComparisonField(func);
      if (field) {
        const value = field.value;
        if (func.name === `gt`) {
          maxGt = maxGt === null ? value : minValue(maxGt, value);
        } else if (func.name === `gte`) {
          maxGte = maxGte === null ? value : minValue(maxGte, value);
        } else if (func.name === `lt`) {
          minLt = minLt === null ? value : maxValue(minLt, value);
        } else if (func.name === `lte`) {
          minLte = minLte === null ? value : maxValue(minLte, value);
        } else if (func.name === `eq`) {
          eqValues.add(value);
        } else {
          otherPredicates.push(pred);
        }
      } else {
        const inField = extractInField(func);
        if (inField) {
          for (const val of inField.values) {
            inValues.add(val);
          }
        } else {
          otherPredicates.push(pred);
        }
      }
    } else {
      otherPredicates.push(pred);
    }
  }
  if (eqValues.size > 1 || eqValues.size > 0 && inValues.size > 0) {
    const allValues = [
      ...eqValues,
      ...inValues
    ];
    const ref = predicates.find((p) => {
      if (p.type === `func`) {
        const field = extractComparisonField(p) || extractInField(p);
        return field !== null;
      }
      return false;
    });
    if (ref && ref.type === `func`) {
      const field = extractComparisonField(ref) || extractInField(ref);
      if (field) {
        return {
          type: `func`,
          name: `in`,
          args: [
            field.ref,
            {
              type: `val`,
              value: allValues
            }
          ]
        };
      }
    }
  }
  const result = [];
  if (maxGt !== null && maxGte !== null) {
    const pred = maxGte <= maxGt ? findPredicateWithOperator(predicates, `gte`, maxGte) : findPredicateWithOperator(predicates, `gt`, maxGt);
    if (pred) result.push(pred);
  } else if (maxGt !== null) {
    const pred = findPredicateWithOperator(predicates, `gt`, maxGt);
    if (pred) result.push(pred);
  } else if (maxGte !== null) {
    const pred = findPredicateWithOperator(predicates, `gte`, maxGte);
    if (pred) result.push(pred);
  }
  if (minLt !== null && minLte !== null) {
    const pred = minLte >= minLt ? findPredicateWithOperator(predicates, `lte`, minLte) : findPredicateWithOperator(predicates, `lt`, minLt);
    if (pred) result.push(pred);
  } else if (minLt !== null) {
    const pred = findPredicateWithOperator(predicates, `lt`, minLt);
    if (pred) result.push(pred);
  } else if (minLte !== null) {
    const pred = findPredicateWithOperator(predicates, `lte`, minLte);
    if (pred) result.push(pred);
  }
  if (eqValues.size === 1 && inValues.size === 0) {
    const pred = findPredicateWithOperator(predicates, `eq`, [
      ...eqValues
    ][0]);
    if (pred) result.push(pred);
  }
  if (eqValues.size === 0 && inValues.size > 0) {
    result.push(predicates.find((p) => {
      if (p.type === `func`) {
        return p.name === `in`;
      }
      return false;
    }));
  }
  result.push(...otherPredicates);
  if (result.length === 0) {
    return {
      type: `val`,
      value: true
    };
  }
  if (result.length === 1) {
    return result[0];
  }
  return {
    type: `func`,
    name: `or`,
    args: result
  };
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+db@0.6.17/node_modules/@tanstack/db/dist/esm/query/subset-dedupe.js
var DeduplicatedLoadSubset = class {
  constructor(opts) {
    this.unlimitedWhere = void 0;
    this.hasLoadedAllData = false;
    this.limitedCalls = [];
    this.inflightCalls = [];
    this.generation = 0;
    this.loadSubset = (options) => {
      if (this.hasLoadedAllData) {
        this.onDeduplicate?.(options);
        return true;
      }
      if (this.unlimitedWhere !== void 0 && options.where !== void 0) {
        if (isWhereSubset(options.where, this.unlimitedWhere)) {
          this.onDeduplicate?.(options);
          return true;
        }
      }
      if (options.limit !== void 0) {
        const alreadyLoaded = this.limitedCalls.some((loaded) => isPredicateSubset(options, loaded));
        if (alreadyLoaded) {
          this.onDeduplicate?.(options);
          return true;
        }
      }
      const matchingInflight = this.inflightCalls.find((inflight) => isPredicateSubset(options, inflight.options));
      if (matchingInflight !== void 0) {
        const prom = matchingInflight.promise;
        prom.then(() => this.onDeduplicate?.(options)).catch();
        return prom;
      }
      const trackingOptions = cloneOptions(options);
      const loadOptions = cloneOptions(options);
      if (this.unlimitedWhere !== void 0 && options.limit === void 0) {
        loadOptions.where = minusWherePredicates(loadOptions.where, this.unlimitedWhere) ?? loadOptions.where;
      }
      const resultPromise = this._loadSubset(loadOptions);
      if (resultPromise === true) {
        this.updateTracking(trackingOptions);
        return true;
      } else {
        const capturedGeneration = this.generation;
        const inflightEntry = {
          options: trackingOptions,
          promise: resultPromise.then((result) => {
            if (capturedGeneration === this.generation) {
              this.updateTracking(trackingOptions);
            }
            return result;
          }).finally(() => {
            const index = this.inflightCalls.indexOf(inflightEntry);
            if (index !== -1) {
              this.inflightCalls.splice(index, 1);
            }
          })
        };
        this.inflightCalls.push(inflightEntry);
        return inflightEntry.promise;
      }
    };
    this._loadSubset = opts.loadSubset;
    this.onDeduplicate = opts.onDeduplicate;
  }
  /**
   * Reset all tracking state.
   * Clears the history of loaded predicates and in-flight calls.
   * Use this when you want to start fresh, for example after clearing the underlying data store.
   *
   * Note: Any in-flight requests will still complete, but they will not update the tracking
   * state after the reset. This prevents old requests from repopulating cleared state.
   */
  reset() {
    this.unlimitedWhere = void 0;
    this.hasLoadedAllData = false;
    this.limitedCalls = [];
    this.inflightCalls = [];
    this.generation++;
  }
  updateTracking(options) {
    if (options.limit === void 0) {
      if (options.where === void 0) {
        this.hasLoadedAllData = true;
        this.unlimitedWhere = void 0;
        this.limitedCalls = [];
        this.inflightCalls = [];
      } else if (this.unlimitedWhere === void 0) {
        this.unlimitedWhere = options.where;
      } else {
        this.unlimitedWhere = unionWherePredicates([
          this.unlimitedWhere,
          options.where
        ]);
      }
    } else {
      this.limitedCalls.push(options);
    }
  }
};
function cloneOptions(options) {
  return {
    ...options,
    orderBy: options.orderBy?.map((clause) => ({
      ...clause,
      compareOptions: {
        ...clause.compareOptions
      }
    })),
    cursor: options.cursor ? {
      ...options.cursor
    } : void 0
  };
}

// ../../libraries/mecha/packages/node_modules/.deno/@electric-sql+client@1.5.24/node_modules/@electric-sql/client/dist/chunk-QLA7LEQI.mjs
var __defProp2 = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp2 = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp2(obj, key, {
  enumerable: true,
  configurable: true,
  writable: true,
  value
}) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {})) if (__hasOwnProp2.call(b, prop)) __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols) for (var prop of __getOwnPropSymbols(b)) {
    if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop]);
  }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source) if (__hasOwnProp2.call(source, prop) && exclude.indexOf(prop) < 0) target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols) for (var prop of __getOwnPropSymbols(source)) {
    if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop)) target[prop] = source[prop];
  }
  return target;
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var __privateWrapper = (obj, member, setter, getter) => ({
  set _(value) {
    __privateSet(obj, member, value, setter);
  },
  get _() {
    return __privateGet(obj, member, getter);
  }
});
var FetchError = class _FetchError extends Error {
  constructor(status, text, json, headers, url, message) {
    super(message || `HTTP Error ${status} at ${url}: ${text != null ? text : JSON.stringify(json)}`);
    this.url = url;
    this.name = `FetchError`;
    this.status = status;
    this.text = text;
    this.json = json;
    this.headers = headers;
  }
  static async fromResponse(response, url) {
    const status = response.status;
    const headers = Object.fromEntries([
      ...response.headers.entries()
    ]);
    let text = void 0;
    let json = void 0;
    const contentType = response.headers.get(`content-type`);
    if (!response.bodyUsed) {
      if (contentType && contentType.includes(`application/json`)) {
        json = await response.json();
      } else {
        text = await response.text();
      }
    }
    return new _FetchError(status, text, json, headers, url);
  }
};
var FetchBackoffAbortError = class extends Error {
  constructor() {
    super(`Fetch with backoff aborted`);
    this.name = `FetchBackoffAbortError`;
  }
};
var InvalidShapeOptionsError = class extends Error {
  constructor(message) {
    super(message);
    this.name = `InvalidShapeOptionsError`;
  }
};
var MissingShapeUrlError = class extends Error {
  constructor() {
    super(`Invalid shape options: missing required url parameter`);
    this.name = `MissingShapeUrlError`;
  }
};
var InvalidSignalError = class extends Error {
  constructor() {
    super(`Invalid signal option. It must be an instance of AbortSignal.`);
    this.name = `InvalidSignalError`;
  }
};
var MissingShapeHandleError = class extends Error {
  constructor() {
    super(`shapeHandle is required if this isn't an initial fetch (i.e. offset > -1)`);
    this.name = `MissingShapeHandleError`;
  }
};
var ReservedParamError = class extends Error {
  constructor(reservedParams) {
    super(`Cannot use reserved Electric parameter names in custom params: ${reservedParams.join(`, `)}`);
    this.name = `ReservedParamError`;
  }
};
var ParserNullValueError = class extends Error {
  constructor(columnName) {
    super(`Column "${columnName != null ? columnName : `unknown`}" does not allow NULL values`);
    this.name = `ParserNullValueError`;
  }
};
var MissingHeadersError = class extends Error {
  constructor(url, missingHeaders) {
    let msg = `The response for the shape request to ${url} didn't include the following required headers:
`;
    missingHeaders.forEach((h) => {
      msg += `- ${h}
`;
    });
    msg += `
This is often due to a proxy not setting CORS correctly so that all Electric headers can be read by the client.`;
    msg += `
For more information visit the troubleshooting guide: /docs/guides/troubleshooting/missing-headers`;
    super(msg);
  }
};
var StaleCacheError = class extends Error {
  constructor(message) {
    super(message);
    this.name = `StaleCacheError`;
  }
};
var parseNumber = (value) => Number(value);
var parseBool = (value) => value === `true` || value === `t`;
var parseBigInt = (value) => BigInt(value);
var parseJson = (value) => JSON.parse(value);
var identityParser = (v) => v;
var defaultParser = {
  int2: parseNumber,
  int4: parseNumber,
  int8: parseBigInt,
  bool: parseBool,
  float4: parseNumber,
  float8: parseNumber,
  json: parseJson,
  jsonb: parseJson
};
function pgArrayParser(value, parser) {
  let i = 0;
  let char = null;
  let str = ``;
  let quoted = false;
  let last = 0;
  let p = void 0;
  function extractValue2(x, start, end) {
    let val = x.slice(start, end);
    val = val === `NULL` ? null : val;
    return parser ? parser(val) : val;
  }
  function loop(x) {
    const xs = [];
    for (; i < x.length; i++) {
      char = x[i];
      if (quoted) {
        if (char === `\\`) {
          str += x[++i];
        } else if (char === `"`) {
          xs.push(parser ? parser(str) : str);
          str = ``;
          quoted = x[i + 1] === `"`;
          last = i + 2;
        } else {
          str += char;
        }
      } else if (char === `"`) {
        quoted = true;
      } else if (char === `{`) {
        last = ++i;
        xs.push(loop(x));
      } else if (char === `}`) {
        quoted = false;
        last < i && xs.push(extractValue2(x, last, i));
        last = i + 1;
        break;
      } else if (char === `,` && p !== `}` && p !== `"`) {
        xs.push(extractValue2(x, last, i));
        last = i + 1;
      }
      p = char;
    }
    last < i && xs.push(xs.push(extractValue2(x, last, i + 1)));
    return xs;
  }
  return loop(value)[0];
}
var MessageParser = class {
  constructor(parser, transformer) {
    this.parser = __spreadValues(__spreadValues({}, defaultParser), parser);
    this.transformer = transformer;
  }
  parse(messages, schema) {
    return JSON.parse(messages, (key, value) => {
      if ((key === `value` || key === `old_value`) && typeof value === `object` && value !== null) {
        return this.transformMessageValue(value, schema);
      }
      return value;
    });
  }
  /**
   * Parse an array of ChangeMessages from a snapshot response.
   * Applies type parsing and transformations to the value and old_value properties.
   */
  parseSnapshotData(messages, schema) {
    return messages.map((message) => {
      const msg = message;
      if (msg.value && typeof msg.value === `object` && msg.value !== null) {
        msg.value = this.transformMessageValue(msg.value, schema);
      }
      if (msg.old_value && typeof msg.old_value === `object` && msg.old_value !== null) {
        msg.old_value = this.transformMessageValue(msg.old_value, schema);
      }
      return msg;
    });
  }
  /**
   * Transform a message value or old_value object by parsing its columns.
   */
  transformMessageValue(value, schema) {
    const row = value;
    Object.keys(row).forEach((key) => {
      row[key] = this.parseRow(key, row[key], schema);
    });
    return this.transformer ? this.transformer(row) : row;
  }
  // Parses the message values using the provided parser based on the schema information
  parseRow(key, value, schema) {
    var _b;
    const columnInfo = schema[key];
    if (!columnInfo) {
      return value;
    }
    const _a = columnInfo, { type: typ, dims: dimensions } = _a, additionalInfo = __objRest(_a, [
      "type",
      "dims"
    ]);
    const typeParser = (_b = this.parser[typ]) != null ? _b : identityParser;
    const parser = makeNullableParser(typeParser, columnInfo, key);
    if (dimensions && dimensions > 0) {
      const nullablePgArrayParser = makeNullableParser((value2, _) => pgArrayParser(value2, parser), columnInfo, key);
      return nullablePgArrayParser(value);
    }
    return parser(value, additionalInfo);
  }
};
function makeNullableParser(parser, columnInfo, columnName) {
  var _a;
  const isNullable = !((_a = columnInfo.not_null) != null ? _a : false);
  return (value) => {
    if (value === null) {
      if (!isNullable) {
        throw new ParserNullValueError(columnName != null ? columnName : `unknown`);
      }
      return null;
    }
    return parser(value, columnInfo);
  };
}
function quoteIdentifier(identifier) {
  const escaped = identifier.replace(/"/g, `""`);
  return `"${escaped}"`;
}
function encodeWhereClause(whereClause, encode) {
  if (!whereClause || !encode) return whereClause != null ? whereClause : ``;
  const sqlKeywords = /* @__PURE__ */ new Set([
    `SELECT`,
    `FROM`,
    `WHERE`,
    `AND`,
    `OR`,
    `NOT`,
    `IN`,
    `IS`,
    `NULL`,
    `NULLS`,
    `FIRST`,
    `LAST`,
    `TRUE`,
    `FALSE`,
    `LIKE`,
    `ILIKE`,
    `BETWEEN`,
    `ASC`,
    `DESC`,
    `LIMIT`,
    `OFFSET`,
    `ORDER`,
    `BY`,
    `GROUP`,
    `HAVING`,
    `DISTINCT`,
    `AS`,
    `ON`,
    `JOIN`,
    `LEFT`,
    `RIGHT`,
    `INNER`,
    `OUTER`,
    `CROSS`,
    `CASE`,
    `WHEN`,
    `THEN`,
    `ELSE`,
    `END`,
    `CAST`,
    `LOWER`,
    `UPPER`,
    `COALESCE`,
    `NULLIF`
  ]);
  const quotedRanges = [];
  let pos = 0;
  while (pos < whereClause.length) {
    const ch = whereClause[pos];
    if (ch === `'` || ch === `"`) {
      const start = pos;
      const quoteChar = ch;
      pos++;
      while (pos < whereClause.length) {
        if (whereClause[pos] === quoteChar) {
          if (whereClause[pos + 1] === quoteChar) {
            pos += 2;
          } else {
            pos++;
            break;
          }
        } else {
          pos++;
        }
      }
      quotedRanges.push({
        start,
        end: pos
      });
    } else {
      pos++;
    }
  }
  const isInQuotedString = (pos2) => {
    return quotedRanges.some((range2) => pos2 >= range2.start && pos2 < range2.end);
  };
  const identifierPattern = new RegExp("(?<![a-zA-Z0-9_])([a-zA-Z_][a-zA-Z0-9_]*)(?![a-zA-Z0-9_])", "g");
  return whereClause.replace(identifierPattern, (match, _p1, offset) => {
    if (isInQuotedString(offset)) {
      return match;
    }
    if (sqlKeywords.has(match.toUpperCase())) {
      return match;
    }
    if (match.startsWith(`$`)) {
      return match;
    }
    const encoded = encode(match);
    return encoded;
  });
}
function isChangeMessage(message) {
  return message != null && `key` in message;
}
function isControlMessage(message) {
  return message != null && `headers` in message && `control` in message.headers;
}
function isUpToDateMessage(message) {
  return isControlMessage(message) && message.headers.control === `up-to-date`;
}
function getOffset(message) {
  if (message.headers.control != `up-to-date`) return;
  const lsn = message.headers.global_last_seen_lsn;
  return lsn ? `${lsn}_0` : void 0;
}
function bigintReplacer(_key, value) {
  return typeof value === `bigint` ? value.toString() : value;
}
function bigintSafeStringify(value) {
  return JSON.stringify(value, bigintReplacer);
}
function isVisibleInSnapshot(txid, snapshot) {
  const xid = BigInt(txid);
  const xmin = BigInt(snapshot.xmin);
  const xmax = BigInt(snapshot.xmax);
  const xip = snapshot.xip_list.map(BigInt);
  return xid < xmin || xid < xmax && !xip.includes(xid);
}
var LIVE_CACHE_BUSTER_HEADER = `electric-cursor`;
var SHAPE_HANDLE_HEADER = `electric-handle`;
var CHUNK_LAST_OFFSET_HEADER = `electric-offset`;
var SHAPE_SCHEMA_HEADER = `electric-schema`;
var CHUNK_UP_TO_DATE_HEADER = `electric-up-to-date`;
var COLUMNS_QUERY_PARAM = `columns`;
var LIVE_CACHE_BUSTER_QUERY_PARAM = `cursor`;
var EXPIRED_HANDLE_QUERY_PARAM = `expired_handle`;
var SHAPE_HANDLE_QUERY_PARAM = `handle`;
var LIVE_QUERY_PARAM = `live`;
var OFFSET_QUERY_PARAM = `offset`;
var TABLE_QUERY_PARAM = `table`;
var WHERE_QUERY_PARAM = `where`;
var REPLICA_PARAM = `replica`;
var WHERE_PARAMS_PARAM = `params`;
var EXPERIMENTAL_LIVE_SSE_QUERY_PARAM = `experimental_live_sse`;
var LIVE_SSE_QUERY_PARAM = `live_sse`;
var FORCE_DISCONNECT_AND_REFRESH = `force-disconnect-and-refresh`;
var PAUSE_STREAM = `pause-stream`;
var SYSTEM_WAKE = `system-wake`;
var LIVE_REQUEST_TIMEOUT = `live-request-timeout`;
var LOG_MODE_QUERY_PARAM = `log`;
var SUBSET_PARAM_WHERE = `subset__where`;
var SUBSET_PARAM_LIMIT = `subset__limit`;
var SUBSET_PARAM_OFFSET = `subset__offset`;
var SUBSET_PARAM_ORDER_BY = `subset__order_by`;
var SUBSET_PARAM_WHERE_PARAMS = `subset__params`;
var SUBSET_PARAM_WHERE_EXPR = `subset__where_expr`;
var SUBSET_PARAM_ORDER_BY_EXPR = `subset__order_by_expr`;
var CACHE_BUSTER_QUERY_PARAM = `cache-buster`;
var ELECTRIC_PROTOCOL_QUERY_PARAMS = [
  LIVE_QUERY_PARAM,
  LIVE_SSE_QUERY_PARAM,
  EXPERIMENTAL_LIVE_SSE_QUERY_PARAM,
  SHAPE_HANDLE_QUERY_PARAM,
  OFFSET_QUERY_PARAM,
  LIVE_CACHE_BUSTER_QUERY_PARAM,
  EXPIRED_HANDLE_QUERY_PARAM,
  LOG_MODE_QUERY_PARAM,
  SUBSET_PARAM_WHERE,
  SUBSET_PARAM_LIMIT,
  SUBSET_PARAM_OFFSET,
  SUBSET_PARAM_ORDER_BY,
  SUBSET_PARAM_WHERE_PARAMS,
  SUBSET_PARAM_WHERE_EXPR,
  SUBSET_PARAM_ORDER_BY_EXPR,
  CACHE_BUSTER_QUERY_PARAM
];
var HTTP_RETRY_STATUS_CODES = [
  429
];
var BackoffDefaults = {
  initialDelay: 1e3,
  maxDelay: 32e3,
  multiplier: 2,
  maxRetries: Infinity
};
function parseRetryAfterHeader(retryAfter) {
  if (!retryAfter) return 0;
  const retryAfterSec = Number(retryAfter);
  if (Number.isFinite(retryAfterSec) && retryAfterSec > 0) {
    return retryAfterSec * 1e3;
  }
  const retryDate = Date.parse(retryAfter);
  if (!isNaN(retryDate)) {
    const deltaMs = retryDate - Date.now();
    return Math.max(0, Math.min(deltaMs, 36e5));
  }
  return 0;
}
async function abortableSleep(waitMs, signal) {
  if (waitMs <= 0) return;
  if (signal == null ? void 0 : signal.aborted) throw new FetchBackoffAbortError();
  await new Promise((resolve, reject) => {
    let settled = false;
    const done = (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal == null ? void 0 : signal.removeEventListener(`abort`, onAbort);
      err ? reject(err) : resolve();
    };
    const onAbort = () => done(new FetchBackoffAbortError());
    const timer = setTimeout(() => done(), waitMs);
    signal == null ? void 0 : signal.addEventListener(`abort`, onAbort, {
      once: true
    });
    if (signal == null ? void 0 : signal.aborted) onAbort();
  });
}
function createFetchWithBackoff(fetchClient, backoffOptions = BackoffDefaults) {
  const { initialDelay, maxDelay, multiplier, debug: debug3 = false, onFailedAttempt, maxRetries = Infinity } = backoffOptions;
  return async (...args) => {
    var _a, _b;
    const url = args[0];
    const options = args[1];
    let delay = initialDelay;
    let attempt = 0;
    while (true) {
      try {
        const result = await fetchClient(...args);
        if (result.ok) {
          return result;
        }
        const err = await FetchError.fromResponse(result, url.toString());
        throw err;
      } catch (e) {
        onFailedAttempt == null ? void 0 : onFailedAttempt();
        if ((_a = options == null ? void 0 : options.signal) == null ? void 0 : _a.aborted) {
          throw new FetchBackoffAbortError();
        } else if (e instanceof FetchError && !HTTP_RETRY_STATUS_CODES.includes(e.status) && e.status >= 400 && e.status < 500) {
          throw e;
        } else {
          attempt++;
          if (attempt > maxRetries) {
            if (debug3) {
              console.log(`Max retries reached (${attempt}/${maxRetries}), giving up`);
            }
            throw e;
          }
          const serverMinimumMs = e instanceof FetchError && e.headers ? parseRetryAfterHeader(e.headers[`retry-after`]) : 0;
          const jitter = Math.random() * delay;
          const clientBackoffMs = Math.min(jitter, maxDelay);
          const waitMs = Math.max(serverMinimumMs, clientBackoffMs);
          if (debug3) {
            const source = serverMinimumMs > 0 ? `server+client` : `client`;
            console.log(`Retry attempt #${attempt} after ${waitMs}ms (${source}, serverMin=${serverMinimumMs}ms, clientBackoff=${clientBackoffMs}ms)`);
          }
          await abortableSleep(waitMs, (_b = options == null ? void 0 : options.signal) != null ? _b : void 0);
          delay = Math.min(delay * multiplier, maxDelay);
        }
      }
    }
  };
}
var NO_BODY_STATUS_CODES = [
  201,
  204,
  205
];
async function consumeResponseBody(res, url, signal) {
  try {
    if (res.status < 200 || NO_BODY_STATUS_CODES.includes(res.status)) {
      return res;
    }
    const text = await res.text();
    return new Response(text, res);
  } catch (err) {
    if (signal == null ? void 0 : signal.aborted) {
      throw new FetchBackoffAbortError();
    }
    throw new FetchError(res.status, void 0, void 0, Object.fromEntries([
      ...res.headers.entries()
    ]), url, err instanceof Error ? err.message : typeof err === `string` ? err : `failed to read body`);
  }
}
function createFetchWithConsumedMessages(fetchClient) {
  return async (...args) => {
    var _a, _b;
    const url = args[0];
    const res = await fetchClient(...args);
    return consumeResponseBody(res, url.toString(), (_b = (_a = args[1]) == null ? void 0 : _a.signal) != null ? _b : void 0);
  };
}
var ChunkPrefetchDefaults = {
  maxChunksToPrefetch: 2
};
function createFetchWithChunkBuffer(fetchClient, prefetchOptions = ChunkPrefetchDefaults) {
  const { maxChunksToPrefetch } = prefetchOptions;
  let prefetchQueue;
  const prefetchClient = async (...args) => {
    const url = args[0].toString();
    const method = getRequestMethod(args[0], args[1]);
    if (method !== `GET`) {
      prefetchQueue == null ? void 0 : prefetchQueue.abort();
      prefetchQueue = void 0;
      return fetchClient(...args);
    }
    const prefetchedRequest = prefetchQueue == null ? void 0 : prefetchQueue.consume(...args);
    if (prefetchedRequest) {
      return prefetchedRequest;
    }
    prefetchQueue == null ? void 0 : prefetchQueue.abort();
    prefetchQueue = void 0;
    const response = await fetchClient(...args);
    const nextUrl = getNextChunkUrl(url, response);
    if (nextUrl) {
      prefetchQueue = new PrefetchQueue({
        fetchClient,
        maxPrefetchedRequests: maxChunksToPrefetch,
        url: nextUrl,
        requestInit: args[1]
      });
    }
    return response;
  };
  return prefetchClient;
}
var requiredElectricResponseHeaders = [
  CHUNK_LAST_OFFSET_HEADER,
  SHAPE_HANDLE_HEADER
];
var requiredLiveResponseHeaders = [
  LIVE_CACHE_BUSTER_HEADER
];
var requiredNonLiveResponseHeaders = [
  SHAPE_SCHEMA_HEADER
];
function createFetchWithResponseHeadersCheck(fetchClient) {
  return async (...args) => {
    const response = await fetchClient(...args);
    if (response.ok) {
      const headers = response.headers;
      const missingHeaders = [];
      const addMissingHeaders = (requiredHeaders) => missingHeaders.push(...requiredHeaders.filter((h) => !headers.has(h)));
      const input = args[0];
      const urlString = input.toString();
      const url = new URL(urlString);
      const isSnapshotRequest = [
        SUBSET_PARAM_WHERE,
        SUBSET_PARAM_WHERE_PARAMS,
        SUBSET_PARAM_LIMIT,
        SUBSET_PARAM_OFFSET,
        SUBSET_PARAM_ORDER_BY
      ].some((p) => url.searchParams.has(p));
      if (isSnapshotRequest) {
        return response;
      }
      addMissingHeaders(requiredElectricResponseHeaders);
      if (url.searchParams.get(LIVE_QUERY_PARAM) === `true`) {
        addMissingHeaders(requiredLiveResponseHeaders);
      }
      if (!url.searchParams.has(LIVE_QUERY_PARAM) || url.searchParams.get(LIVE_QUERY_PARAM) === `false`) {
        addMissingHeaders(requiredNonLiveResponseHeaders);
      }
      if (missingHeaders.length > 0) {
        throw new MissingHeadersError(urlString, missingHeaders);
      }
    }
    return response;
  };
}
var _fetchClient;
var _maxPrefetchedRequests;
var _prefetchQueue;
var _queueHeadUrl;
var _queueTailUrl;
var _PrefetchQueue_instances;
var prefetch_fn;
var PrefetchQueue = class {
  constructor(options) {
    __privateAdd(this, _PrefetchQueue_instances);
    __privateAdd(this, _fetchClient);
    __privateAdd(this, _maxPrefetchedRequests);
    __privateAdd(this, _prefetchQueue, /* @__PURE__ */ new Map());
    __privateAdd(this, _queueHeadUrl);
    __privateAdd(this, _queueTailUrl);
    var _a;
    __privateSet(this, _fetchClient, (_a = options.fetchClient) != null ? _a : (...args) => fetch(...args));
    __privateSet(this, _maxPrefetchedRequests, options.maxPrefetchedRequests);
    __privateSet(this, _queueHeadUrl, options.url.toString());
    __privateSet(this, _queueTailUrl, __privateGet(this, _queueHeadUrl));
    __privateMethod(this, _PrefetchQueue_instances, prefetch_fn).call(this, options.url, options.requestInit);
  }
  abort() {
    __privateGet(this, _prefetchQueue).forEach(([_, aborter]) => aborter.abort());
    __privateGet(this, _prefetchQueue).clear();
  }
  consume(...args) {
    const url = args[0].toString();
    const entry = __privateGet(this, _prefetchQueue).get(url);
    if (!entry || url !== __privateGet(this, _queueHeadUrl)) return;
    const [request, aborter] = entry;
    if (aborter.signal.aborted) {
      __privateGet(this, _prefetchQueue).delete(url);
      return;
    }
    __privateGet(this, _prefetchQueue).delete(url);
    request.then((response) => {
      const nextUrl = getNextChunkUrl(url, response);
      __privateSet(this, _queueHeadUrl, nextUrl);
      if (__privateGet(this, _queueTailUrl) && !__privateGet(this, _prefetchQueue).has(__privateGet(this, _queueTailUrl))) {
        __privateMethod(this, _PrefetchQueue_instances, prefetch_fn).call(this, __privateGet(this, _queueTailUrl), args[1]);
      }
    }).catch(() => {
    });
    return request;
  }
};
_fetchClient = /* @__PURE__ */ new WeakMap();
_maxPrefetchedRequests = /* @__PURE__ */ new WeakMap();
_prefetchQueue = /* @__PURE__ */ new WeakMap();
_queueHeadUrl = /* @__PURE__ */ new WeakMap();
_queueTailUrl = /* @__PURE__ */ new WeakMap();
_PrefetchQueue_instances = /* @__PURE__ */ new WeakSet();
prefetch_fn = function(...args) {
  var _a, _b;
  const url = args[0].toString();
  if (__privateGet(this, _prefetchQueue).size >= __privateGet(this, _maxPrefetchedRequests)) return;
  const aborter = new AbortController();
  try {
    const { signal, cleanup } = chainAborter(aborter, (_a = args[1]) == null ? void 0 : _a.signal);
    const request = __privateGet(this, _fetchClient).call(this, url, __spreadProps(__spreadValues({}, (_b = args[1]) != null ? _b : {}), {
      signal
    }));
    __privateGet(this, _prefetchQueue).set(url, [
      request,
      aborter
    ]);
    request.then((response) => {
      if (!response.ok || aborter.signal.aborted) return;
      const nextUrl = getNextChunkUrl(url, response);
      if (!nextUrl || nextUrl === url) {
        __privateSet(this, _queueTailUrl, void 0);
        return;
      }
      __privateSet(this, _queueTailUrl, nextUrl);
      return __privateMethod(this, _PrefetchQueue_instances, prefetch_fn).call(this, nextUrl, args[1]);
    }).catch(() => {
    }).finally(cleanup);
  } catch (_) {
  }
};
function getNextChunkUrl(url, res) {
  const shapeHandle = res.headers.get(SHAPE_HANDLE_HEADER);
  const lastOffset = res.headers.get(CHUNK_LAST_OFFSET_HEADER);
  const isUpToDate = res.headers.has(CHUNK_UP_TO_DATE_HEADER);
  if (!shapeHandle || !lastOffset || isUpToDate) return;
  const nextUrl = new URL(url);
  if (nextUrl.searchParams.has(LIVE_QUERY_PARAM)) return;
  const expiredHandle = nextUrl.searchParams.get(EXPIRED_HANDLE_QUERY_PARAM);
  if (expiredHandle && shapeHandle === expiredHandle) {
    console.warn(`[Electric] Received stale cached response with expired shape handle. This should not happen and indicates a proxy/CDN caching misconfiguration. The response contained handle "${shapeHandle}" which was previously marked as expired. Check that your proxy includes all query parameters (especially 'handle' and 'offset') in its cache key. Skipping prefetch to prevent infinite 409 loop.`);
    return;
  }
  nextUrl.searchParams.set(SHAPE_HANDLE_QUERY_PARAM, shapeHandle);
  nextUrl.searchParams.set(OFFSET_QUERY_PARAM, lastOffset);
  nextUrl.searchParams.sort();
  return nextUrl.toString();
}
function chainAborter(aborter, sourceSignal) {
  let cleanup = noop;
  if (!sourceSignal) {
  } else if (sourceSignal.aborted) {
    aborter.abort();
  } else {
    const abortParent = () => aborter.abort();
    sourceSignal.addEventListener(`abort`, abortParent, {
      once: true,
      signal: aborter.signal
    });
    cleanup = () => sourceSignal.removeEventListener(`abort`, abortParent);
  }
  return {
    signal: aborter.signal,
    cleanup
  };
}
function noop() {
}
function getRequestMethod(input, init) {
  if (init == null ? void 0 : init.method) {
    return init.method.toUpperCase();
  }
  if (typeof Request !== `undefined` && input instanceof Request) {
    return input.method.toUpperCase();
  }
  return `GET`;
}
function compileExpression2(expr, columnMapper) {
  switch (expr.type) {
    case `ref`: {
      const mappedColumn = columnMapper ? columnMapper(expr.column) : expr.column;
      return quoteIdentifier(mappedColumn);
    }
    case `val`:
      return `$${expr.paramIndex}`;
    case `func`:
      return compileFunction2(expr, columnMapper);
    default: {
      const _exhaustive = expr;
      throw new Error(`Unknown expression type: ${JSON.stringify(_exhaustive)}`);
    }
  }
}
function compileFunction2(expr, columnMapper) {
  const args = expr.args.map((arg) => compileExpression2(arg, columnMapper));
  switch (expr.name) {
    // Binary comparison operators
    case `eq`:
      return `${args[0]} = ${args[1]}`;
    case `gt`:
      return `${args[0]} > ${args[1]}`;
    case `gte`:
      return `${args[0]} >= ${args[1]}`;
    case `lt`:
      return `${args[0]} < ${args[1]}`;
    case `lte`:
      return `${args[0]} <= ${args[1]}`;
    // Logical operators
    case `and`:
      return args.map((a) => `(${a})`).join(` AND `);
    case `or`:
      return args.map((a) => `(${a})`).join(` OR `);
    case `not`:
      return `NOT (${args[0]})`;
    // Special operators
    case `in`:
      return `${args[0]} = ANY(${args[1]})`;
    case `like`:
      return `${args[0]} LIKE ${args[1]}`;
    case `ilike`:
      return `${args[0]} ILIKE ${args[1]}`;
    case `isNull`:
    case `isUndefined`:
      return `${args[0]} IS NULL`;
    // String functions
    case `upper`:
      return `UPPER(${args[0]})`;
    case `lower`:
      return `LOWER(${args[0]})`;
    case `length`:
      return `LENGTH(${args[0]})`;
    case `concat`:
      return `CONCAT(${args.join(`, `)})`;
    // Other functions
    case `coalesce`:
      return `COALESCE(${args.join(`, `)})`;
    default:
      throw new Error(`Unknown function: ${expr.name}`);
  }
}
function compileOrderBy(clauses, columnMapper) {
  return clauses.map((clause) => {
    const mappedColumn = columnMapper ? columnMapper(clause.column) : clause.column;
    let sql = quoteIdentifier(mappedColumn);
    if (clause.direction === `desc`) sql += ` DESC`;
    if (clause.nulls === `first`) sql += ` NULLS FIRST`;
    if (clause.nulls === `last`) sql += ` NULLS LAST`;
    return sql;
  }).join(`, `);
}
async function getBytes(stream, onChunk) {
  const reader = stream.getReader();
  let result;
  while (!(result = await reader.read()).done) {
    onChunk(result.value);
  }
}
function getLines(onLine) {
  let buffer;
  let position;
  let fieldLength;
  let discardTrailingNewline = false;
  return function onChunk(arr) {
    if (buffer === void 0) {
      buffer = arr;
      position = 0;
      fieldLength = -1;
    } else {
      buffer = concat3(buffer, arr);
    }
    const bufLength = buffer.length;
    let lineStart = 0;
    while (position < bufLength) {
      if (discardTrailingNewline) {
        if (buffer[position] === 10) {
          lineStart = ++position;
        }
        discardTrailingNewline = false;
      }
      let lineEnd = -1;
      for (; position < bufLength && lineEnd === -1; ++position) {
        switch (buffer[position]) {
          case 58:
            if (fieldLength === -1) {
              fieldLength = position - lineStart;
            }
            break;
          case 13:
            discardTrailingNewline = true;
          case 10:
            lineEnd = position;
            break;
        }
      }
      if (lineEnd === -1) {
        break;
      }
      onLine(buffer.subarray(lineStart, lineEnd), fieldLength);
      lineStart = position;
      fieldLength = -1;
    }
    if (lineStart === bufLength) {
      buffer = void 0;
    } else if (lineStart !== 0) {
      buffer = buffer.subarray(lineStart);
      position -= lineStart;
    }
  };
}
function getMessages(onId, onRetry, onMessage) {
  let message = newMessage();
  const decoder = new TextDecoder();
  return function onLine(line, fieldLength) {
    if (line.length === 0) {
      onMessage === null || onMessage === void 0 ? void 0 : onMessage(message);
      message = newMessage();
    } else if (fieldLength > 0) {
      const field = decoder.decode(line.subarray(0, fieldLength));
      const valueOffset = fieldLength + (line[fieldLength + 1] === 32 ? 2 : 1);
      const value = decoder.decode(line.subarray(valueOffset));
      switch (field) {
        case "data":
          message.data = message.data ? message.data + "\n" + value : value;
          break;
        case "event":
          message.event = value;
          break;
        case "id":
          onId(message.id = value);
          break;
        case "retry":
          const retry = parseInt(value, 10);
          if (!isNaN(retry)) {
            onRetry(message.retry = retry);
          }
          break;
      }
    }
  };
}
function concat3(a, b) {
  const res = new Uint8Array(a.length + b.length);
  res.set(a);
  res.set(b, a.length);
  return res;
}
function newMessage() {
  return {
    data: "",
    event: "",
    id: "",
    retry: void 0
  };
}
var __rest = function(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
var EventStreamContentType = "text/event-stream";
var DefaultRetryInterval = 1e3;
var LastEventId = "last-event-id";
function fetchEventSource(input, _a) {
  var { signal: inputSignal, headers: inputHeaders, onopen: inputOnOpen, onmessage, onclose, onerror, openWhenHidden, fetch: inputFetch } = _a, rest = __rest(_a, [
    "signal",
    "headers",
    "onopen",
    "onmessage",
    "onclose",
    "onerror",
    "openWhenHidden",
    "fetch"
  ]);
  return new Promise((resolve, reject) => {
    const headers = Object.assign({}, inputHeaders);
    if (!headers.accept) {
      headers.accept = EventStreamContentType;
    }
    let curRequestController;
    function onVisibilityChange() {
      curRequestController.abort();
      if (typeof document !== "undefined" && !document.hidden) {
        create();
      }
    }
    if (typeof document !== "undefined" && !openWhenHidden) {
      document.addEventListener("visibilitychange", onVisibilityChange);
    }
    let retryInterval = DefaultRetryInterval;
    let retryTimer = 0;
    function dispose() {
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
      clearTimeout(retryTimer);
      curRequestController.abort();
    }
    inputSignal === null || inputSignal === void 0 ? void 0 : inputSignal.addEventListener("abort", () => {
      dispose();
    });
    const fetch2 = inputFetch !== null && inputFetch !== void 0 ? inputFetch : window.fetch;
    const onopen = inputOnOpen !== null && inputOnOpen !== void 0 ? inputOnOpen : defaultOnOpen;
    async function create() {
      var _a2;
      curRequestController = new AbortController();
      const sig = inputSignal.aborted ? inputSignal : curRequestController.signal;
      try {
        const response = await fetch2(input, Object.assign(Object.assign({}, rest), {
          headers,
          signal: sig
        }));
        await onopen(response);
        await getBytes(response.body, getLines(getMessages((id) => {
          if (id) {
            headers[LastEventId] = id;
          } else {
            delete headers[LastEventId];
          }
        }, (retry) => {
          retryInterval = retry;
        }, onmessage)));
        onclose === null || onclose === void 0 ? void 0 : onclose();
        dispose();
        resolve();
      } catch (err) {
        if (sig.aborted) {
          dispose();
          reject(err);
        } else if (!curRequestController.signal.aborted) {
          try {
            const interval = (_a2 = onerror === null || onerror === void 0 ? void 0 : onerror(err)) !== null && _a2 !== void 0 ? _a2 : retryInterval;
            clearTimeout(retryTimer);
            retryTimer = setTimeout(create, interval);
          } catch (innerErr) {
            dispose();
            reject(innerErr);
          }
        }
      }
    }
    create();
  });
}
function defaultOnOpen(response) {
  const contentType = response.headers.get("content-type");
  if (!(contentType === null || contentType === void 0 ? void 0 : contentType.startsWith(EventStreamContentType))) {
    throw new Error(`Expected content-type to be ${EventStreamContentType}, Actual: ${contentType}`);
  }
}
var ExpiredShapesCache = class {
  constructor() {
    this.data = {};
    this.max = 250;
    this.storageKey = `electric_expired_shapes`;
    this.load();
  }
  getExpiredHandle(shapeUrl) {
    const entry = this.data[shapeUrl];
    if (entry) {
      entry.lastUsed = Date.now();
      this.save();
      return entry.expiredHandle;
    }
    return null;
  }
  markExpired(shapeUrl, handle) {
    this.data[shapeUrl] = {
      expiredHandle: handle,
      lastUsed: Date.now()
    };
    const keys = Object.keys(this.data);
    if (keys.length > this.max) {
      const oldest = keys.reduce((min4, k) => this.data[k].lastUsed < this.data[min4].lastUsed ? k : min4);
      delete this.data[oldest];
    }
    this.save();
  }
  save() {
    if (typeof localStorage === `undefined`) return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
    }
  }
  load() {
    if (typeof localStorage === `undefined`) return;
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.data = JSON.parse(stored);
      }
    } catch (e) {
      this.data = {};
    }
  }
  clear() {
    this.data = {};
    this.save();
  }
  delete(shapeUrl) {
    delete this.data[shapeUrl];
    this.save();
  }
};
var expiredShapesCache = new ExpiredShapesCache();
var UpToDateTracker = class {
  constructor() {
    this.data = {};
    this.storageKey = `electric_up_to_date_tracker`;
    this.cacheTTL = 6e4;
    this.maxEntries = 250;
    this.writeThrottleMs = 6e4;
    this.lastWriteTime = 0;
    this.load();
    this.cleanup();
  }
  /**
   * Records that a shape received an up-to-date message with a specific cursor.
   * This timestamp and cursor are used to detect cache replay scenarios.
   * Updates in-memory immediately, but throttles localStorage writes.
   */
  recordUpToDate(shapeKey, cursor) {
    this.data[shapeKey] = {
      timestamp: Date.now(),
      cursor
    };
    const keys = Object.keys(this.data);
    if (keys.length > this.maxEntries) {
      const oldest = keys.reduce((min4, k) => this.data[k].timestamp < this.data[min4].timestamp ? k : min4);
      delete this.data[oldest];
    }
    this.scheduleSave();
  }
  /**
   * Schedules a throttled save to localStorage.
   * Writes immediately if enough time has passed, otherwise schedules for later.
   */
  scheduleSave() {
    const now = Date.now();
    const timeSinceLastWrite = now - this.lastWriteTime;
    if (timeSinceLastWrite >= this.writeThrottleMs) {
      this.lastWriteTime = now;
      this.save();
    } else if (!this.pendingSaveTimer) {
      const delay = this.writeThrottleMs - timeSinceLastWrite;
      this.pendingSaveTimer = setTimeout(() => {
        this.lastWriteTime = Date.now();
        this.pendingSaveTimer = void 0;
        this.save();
      }, delay);
    }
  }
  /**
   * Checks if we should enter replay mode for this shape.
   * Returns the last seen cursor if there's a recent up-to-date (< 60s),
   * which means we'll likely be replaying cached responses.
   * Returns null if no recent up-to-date exists.
   */
  shouldEnterReplayMode(shapeKey) {
    const entry = this.data[shapeKey];
    if (!entry) {
      return null;
    }
    const age = Date.now() - entry.timestamp;
    if (age >= this.cacheTTL) {
      return null;
    }
    return entry.cursor;
  }
  /**
   * Cleans up expired entries from the cache.
   * Called on initialization and can be called periodically.
   */
  cleanup() {
    const now = Date.now();
    const keys = Object.keys(this.data);
    let modified = false;
    for (const key of keys) {
      const age = now - this.data[key].timestamp;
      if (age > this.cacheTTL) {
        delete this.data[key];
        modified = true;
      }
    }
    if (modified) {
      this.save();
    }
  }
  save() {
    if (typeof localStorage === `undefined`) return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
    }
  }
  load() {
    if (typeof localStorage === `undefined`) return;
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.data = JSON.parse(stored);
      }
    } catch (e) {
      this.data = {};
    }
  }
  /**
   * Clears all tracked up-to-date timestamps.
   * Useful for testing or manual cache invalidation.
   */
  clear() {
    this.data = {};
    if (this.pendingSaveTimer) {
      clearTimeout(this.pendingSaveTimer);
      this.pendingSaveTimer = void 0;
    }
    this.save();
  }
  delete(shapeKey) {
    delete this.data[shapeKey];
    this.save();
  }
};
var upToDateTracker = new UpToDateTracker();
var _SnapshotTracker_instances;
var detachFromReverseIndexes_fn;
var addToSet_fn;
var removeFromSet_fn;
var SnapshotTracker = class {
  constructor() {
    __privateAdd(this, _SnapshotTracker_instances);
    this.activeSnapshots = /* @__PURE__ */ new Map();
    this.xmaxSnapshots = /* @__PURE__ */ new Map();
    this.snapshotsByDatabaseLsn = /* @__PURE__ */ new Map();
  }
  /**
   * Add a new snapshot for tracking
   */
  addSnapshot(metadata, keys) {
    __privateMethod(this, _SnapshotTracker_instances, detachFromReverseIndexes_fn).call(this, metadata.snapshot_mark);
    const xmax = BigInt(metadata.xmax);
    const databaseLsn = BigInt(metadata.database_lsn);
    this.activeSnapshots.set(metadata.snapshot_mark, {
      xmin: BigInt(metadata.xmin),
      xmax,
      xip_list: metadata.xip_list.map(BigInt),
      keys,
      databaseLsn
    });
    __privateMethod(this, _SnapshotTracker_instances, addToSet_fn).call(this, this.xmaxSnapshots, xmax, metadata.snapshot_mark);
    __privateMethod(this, _SnapshotTracker_instances, addToSet_fn).call(this, this.snapshotsByDatabaseLsn, databaseLsn, metadata.snapshot_mark);
  }
  /**
   * Remove a snapshot from tracking
   */
  removeSnapshot(snapshotMark) {
    __privateMethod(this, _SnapshotTracker_instances, detachFromReverseIndexes_fn).call(this, snapshotMark);
    this.activeSnapshots.delete(snapshotMark);
  }
  /**
   * Check if a change message should be filtered because its already in an active snapshot
   * Returns true if the message should be filtered out (not processed)
   */
  shouldRejectMessage(message) {
    const txids = message.headers.txids || [];
    if (txids.length === 0) return false;
    const xid = Math.max(...txids);
    for (const [xmax, snapshots] of this.xmaxSnapshots.entries()) {
      if (xid >= xmax) {
        for (const snapshot of snapshots) {
          this.removeSnapshot(snapshot);
        }
      }
    }
    return [
      ...this.activeSnapshots.values()
    ].some((x) => x.keys.has(message.key) && isVisibleInSnapshot(xid, x));
  }
  lastSeenUpdate(newDatabaseLsn) {
    for (const [dbLsn, snapshots] of this.snapshotsByDatabaseLsn.entries()) {
      if (dbLsn <= newDatabaseLsn) {
        for (const snapshot of snapshots) {
          this.removeSnapshot(snapshot);
        }
      }
    }
  }
};
_SnapshotTracker_instances = /* @__PURE__ */ new WeakSet();
detachFromReverseIndexes_fn = function(snapshotMark) {
  const existing = this.activeSnapshots.get(snapshotMark);
  if (!existing) return;
  __privateMethod(this, _SnapshotTracker_instances, removeFromSet_fn).call(this, this.xmaxSnapshots, existing.xmax, snapshotMark);
  __privateMethod(this, _SnapshotTracker_instances, removeFromSet_fn).call(this, this.snapshotsByDatabaseLsn, existing.databaseLsn, snapshotMark);
};
addToSet_fn = function(map2, key, value) {
  const set = map2.get(key);
  if (set) {
    set.add(value);
  } else {
    map2.set(key, /* @__PURE__ */ new Set([
      value
    ]));
  }
};
removeFromSet_fn = function(map2, key, value) {
  const set = map2.get(key);
  if (!set) return;
  set.delete(value);
  if (set.size === 0) map2.delete(key);
};
var ShapeStreamState = class {
  // --- Derived booleans ---
  get isUpToDate() {
    return false;
  }
  // --- Per-state field defaults ---
  get staleCacheBuster() {
    return void 0;
  }
  get staleCacheRetryCount() {
    return 0;
  }
  get sseFallbackToLongPolling() {
    return false;
  }
  get consecutiveShortSseConnections() {
    return 0;
  }
  get replayCursor() {
    return void 0;
  }
  // --- Default no-op methods ---
  canEnterReplayMode() {
    return false;
  }
  enterReplayMode(_cursor) {
    return this;
  }
  shouldUseSse(_opts) {
    return false;
  }
  handleSseConnectionClosed(_input) {
    return {
      state: this,
      fellBackToLongPolling: false,
      wasShortConnection: false
    };
  }
  // --- URL param application ---
  /** Adds state-specific query parameters to the fetch URL. */
  applyUrlParams(_url, _context) {
  }
  // --- Default response/message handlers (Paused/Error never receive these) ---
  handleResponseMetadata(_input) {
    return {
      action: `ignored`,
      state: this
    };
  }
  handleMessageBatch(_input) {
    return {
      state: this,
      suppressBatch: false,
      becameUpToDate: false
    };
  }
  pause() {
    return new PausedState(this);
  }
  toErrorState(error) {
    return new ErrorState(this, error);
  }
  markMustRefetch(handle) {
    return new InitialState({
      handle,
      offset: `-1`,
      liveCacheBuster: ``,
      lastSyncedAt: this.lastSyncedAt,
      schema: void 0
    });
  }
};
var _shared;
var ActiveState = class extends ShapeStreamState {
  constructor(shared) {
    super();
    __privateAdd(this, _shared);
    __privateSet(this, _shared, shared);
  }
  get handle() {
    return __privateGet(this, _shared).handle;
  }
  get offset() {
    return __privateGet(this, _shared).offset;
  }
  get schema() {
    return __privateGet(this, _shared).schema;
  }
  get liveCacheBuster() {
    return __privateGet(this, _shared).liveCacheBuster;
  }
  get lastSyncedAt() {
    return __privateGet(this, _shared).lastSyncedAt;
  }
  /** Expose shared fields to subclasses for spreading into new instances. */
  get currentFields() {
    return __privateGet(this, _shared);
  }
  // --- URL param application ---
  applyUrlParams(url, _context) {
    url.searchParams.set(OFFSET_QUERY_PARAM, __privateGet(this, _shared).offset);
    if (__privateGet(this, _shared).handle) {
      url.searchParams.set(SHAPE_HANDLE_QUERY_PARAM, __privateGet(this, _shared).handle);
    }
  }
  // --- Helpers for subclass handleResponseMetadata implementations ---
  /** Extracts updated SharedStateFields from response headers. */
  parseResponseFields(input) {
    var _a, _b, _c;
    const responseHandle = input.responseHandle;
    const handle = responseHandle && responseHandle !== input.expiredHandle ? responseHandle : __privateGet(this, _shared).handle;
    const offset = (_a = input.responseOffset) != null ? _a : __privateGet(this, _shared).offset;
    const liveCacheBuster = (_b = input.responseCursor) != null ? _b : __privateGet(this, _shared).liveCacheBuster;
    const schema = (_c = __privateGet(this, _shared).schema) != null ? _c : input.responseSchema;
    const lastSyncedAt = input.status === 204 ? input.now : __privateGet(this, _shared).lastSyncedAt;
    return {
      handle,
      offset,
      schema,
      liveCacheBuster,
      lastSyncedAt
    };
  }
  /**
   * Stale detection. Returns a transition if the response is stale,
   * or null if it is not stale and the caller should proceed normally.
   */
  checkStaleResponse(input) {
    const responseHandle = input.responseHandle;
    const expiredHandle = input.expiredHandle;
    if (!responseHandle || responseHandle !== expiredHandle) {
      return null;
    }
    const retryCount = this.staleCacheRetryCount + 1;
    return {
      action: `stale-retry`,
      state: new StaleRetryState(__spreadProps(__spreadValues({}, this.currentFields), {
        staleCacheBuster: input.createCacheBuster(),
        staleCacheRetryCount: retryCount
      })),
      exceededMaxRetries: retryCount > input.maxStaleCacheRetries
    };
  }
  // --- handleMessageBatch: template method with onUpToDate override point ---
  handleMessageBatch(input) {
    if (!input.hasMessages || !input.hasUpToDateMessage) {
      return {
        state: this,
        suppressBatch: false,
        becameUpToDate: false
      };
    }
    let offset = __privateGet(this, _shared).offset;
    if (input.isSse && input.upToDateOffset) {
      offset = input.upToDateOffset;
    }
    const shared = {
      handle: __privateGet(this, _shared).handle,
      offset,
      schema: __privateGet(this, _shared).schema,
      liveCacheBuster: __privateGet(this, _shared).liveCacheBuster,
      lastSyncedAt: input.now
    };
    return this.onUpToDate(shared, input);
  }
  /** Override point for up-to-date handling. Default → LiveState. */
  onUpToDate(shared, _input) {
    return {
      state: new LiveState(shared),
      suppressBatch: false,
      becameUpToDate: true
    };
  }
};
_shared = /* @__PURE__ */ new WeakMap();
var FetchingState = class extends ActiveState {
  handleResponseMetadata(input) {
    const staleResult = this.checkStaleResponse(input);
    if (staleResult) return staleResult;
    const shared = this.parseResponseFields(input);
    if (input.status === 204) {
      return {
        action: `accepted`,
        state: new LiveState(shared, {
          sseFallbackToLongPolling: true
        })
      };
    }
    return {
      action: `accepted`,
      state: new SyncingState(shared)
    };
  }
  canEnterReplayMode() {
    return true;
  }
  enterReplayMode(cursor) {
    return new ReplayingState(__spreadProps(__spreadValues({}, this.currentFields), {
      replayCursor: cursor
    }));
  }
};
var InitialState = class _InitialState extends FetchingState {
  constructor(shared) {
    super(shared);
    this.kind = `initial`;
  }
  withHandle(handle) {
    return new _InitialState(__spreadProps(__spreadValues({}, this.currentFields), {
      handle
    }));
  }
};
var SyncingState = class _SyncingState extends FetchingState {
  constructor(shared) {
    super(shared);
    this.kind = `syncing`;
  }
  withHandle(handle) {
    return new _SyncingState(__spreadProps(__spreadValues({}, this.currentFields), {
      handle
    }));
  }
};
var _staleCacheBuster;
var _staleCacheRetryCount;
var _StaleRetryState = class _StaleRetryState2 extends FetchingState {
  constructor(fields) {
    const _a = fields, { staleCacheBuster, staleCacheRetryCount } = _a, shared = __objRest(_a, [
      "staleCacheBuster",
      "staleCacheRetryCount"
    ]);
    super(shared);
    this.kind = `stale-retry`;
    __privateAdd(this, _staleCacheBuster);
    __privateAdd(this, _staleCacheRetryCount);
    __privateSet(this, _staleCacheBuster, staleCacheBuster);
    __privateSet(this, _staleCacheRetryCount, staleCacheRetryCount);
  }
  get staleCacheBuster() {
    return __privateGet(this, _staleCacheBuster);
  }
  get staleCacheRetryCount() {
    return __privateGet(this, _staleCacheRetryCount);
  }
  // StaleRetryState must not enter replay mode — it would lose the retry count
  canEnterReplayMode() {
    return false;
  }
  withHandle(handle) {
    return new _StaleRetryState2(__spreadProps(__spreadValues({}, this.currentFields), {
      handle,
      staleCacheBuster: __privateGet(this, _staleCacheBuster),
      staleCacheRetryCount: __privateGet(this, _staleCacheRetryCount)
    }));
  }
  applyUrlParams(url, context) {
    super.applyUrlParams(url, context);
    url.searchParams.set(CACHE_BUSTER_QUERY_PARAM, __privateGet(this, _staleCacheBuster));
  }
};
_staleCacheBuster = /* @__PURE__ */ new WeakMap();
_staleCacheRetryCount = /* @__PURE__ */ new WeakMap();
var StaleRetryState = _StaleRetryState;
var _consecutiveShortSseConnections;
var _sseFallbackToLongPolling;
var _LiveState = class _LiveState2 extends ActiveState {
  constructor(shared, sseState) {
    var _a, _b;
    super(shared);
    this.kind = `live`;
    __privateAdd(this, _consecutiveShortSseConnections);
    __privateAdd(this, _sseFallbackToLongPolling);
    __privateSet(this, _consecutiveShortSseConnections, (_a = sseState == null ? void 0 : sseState.consecutiveShortSseConnections) != null ? _a : 0);
    __privateSet(this, _sseFallbackToLongPolling, (_b = sseState == null ? void 0 : sseState.sseFallbackToLongPolling) != null ? _b : false);
  }
  get isUpToDate() {
    return true;
  }
  get consecutiveShortSseConnections() {
    return __privateGet(this, _consecutiveShortSseConnections);
  }
  get sseFallbackToLongPolling() {
    return __privateGet(this, _sseFallbackToLongPolling);
  }
  withHandle(handle) {
    return new _LiveState2(__spreadProps(__spreadValues({}, this.currentFields), {
      handle
    }), this.sseState);
  }
  applyUrlParams(url, context) {
    super.applyUrlParams(url, context);
    if (!context.isSnapshotRequest) {
      url.searchParams.set(LIVE_CACHE_BUSTER_QUERY_PARAM, this.liveCacheBuster);
      if (context.canLongPoll) {
        url.searchParams.set(LIVE_QUERY_PARAM, `true`);
      }
    }
  }
  get sseState() {
    return {
      consecutiveShortSseConnections: __privateGet(this, _consecutiveShortSseConnections),
      sseFallbackToLongPolling: __privateGet(this, _sseFallbackToLongPolling)
    };
  }
  handleResponseMetadata(input) {
    const staleResult = this.checkStaleResponse(input);
    if (staleResult) return staleResult;
    const shared = this.parseResponseFields(input);
    return {
      action: `accepted`,
      state: new _LiveState2(shared, this.sseState)
    };
  }
  onUpToDate(shared, _input) {
    return {
      state: new _LiveState2(shared, this.sseState),
      suppressBatch: false,
      becameUpToDate: true
    };
  }
  shouldUseSse(opts) {
    return opts.liveSseEnabled && !opts.isRefreshing && !opts.resumingFromPause && !__privateGet(this, _sseFallbackToLongPolling);
  }
  handleSseConnectionClosed(input) {
    let nextConsecutiveShort = __privateGet(this, _consecutiveShortSseConnections);
    let nextFallback = __privateGet(this, _sseFallbackToLongPolling);
    let fellBackToLongPolling = false;
    let wasShortConnection = false;
    if (input.connectionDuration < input.minConnectionDuration && !input.wasAborted) {
      wasShortConnection = true;
      nextConsecutiveShort = nextConsecutiveShort + 1;
      if (nextConsecutiveShort >= input.maxShortConnections) {
        nextFallback = true;
        fellBackToLongPolling = true;
      }
    } else if (input.connectionDuration >= input.minConnectionDuration) {
      nextConsecutiveShort = 0;
    }
    return {
      state: new _LiveState2(this.currentFields, {
        consecutiveShortSseConnections: nextConsecutiveShort,
        sseFallbackToLongPolling: nextFallback
      }),
      fellBackToLongPolling,
      wasShortConnection
    };
  }
};
_consecutiveShortSseConnections = /* @__PURE__ */ new WeakMap();
_sseFallbackToLongPolling = /* @__PURE__ */ new WeakMap();
var LiveState = _LiveState;
var _replayCursor;
var _ReplayingState = class _ReplayingState2 extends ActiveState {
  constructor(fields) {
    const _a = fields, { replayCursor } = _a, shared = __objRest(_a, [
      "replayCursor"
    ]);
    super(shared);
    this.kind = `replaying`;
    __privateAdd(this, _replayCursor);
    __privateSet(this, _replayCursor, replayCursor);
  }
  get replayCursor() {
    return __privateGet(this, _replayCursor);
  }
  withHandle(handle) {
    return new _ReplayingState2(__spreadProps(__spreadValues({}, this.currentFields), {
      handle,
      replayCursor: __privateGet(this, _replayCursor)
    }));
  }
  handleResponseMetadata(input) {
    const staleResult = this.checkStaleResponse(input);
    if (staleResult) return staleResult;
    const shared = this.parseResponseFields(input);
    return {
      action: `accepted`,
      state: new _ReplayingState2(__spreadProps(__spreadValues({}, shared), {
        replayCursor: __privateGet(this, _replayCursor)
      }))
    };
  }
  onUpToDate(shared, input) {
    const suppressBatch = !input.isSse && __privateGet(this, _replayCursor) === input.currentCursor;
    return {
      state: new LiveState(shared),
      suppressBatch,
      becameUpToDate: true
    };
  }
};
_replayCursor = /* @__PURE__ */ new WeakMap();
var ReplayingState = _ReplayingState;
var PausedState = class _PausedState extends ShapeStreamState {
  constructor(previousState) {
    super();
    this.kind = `paused`;
    this.previousState = previousState instanceof _PausedState ? previousState.previousState : previousState;
  }
  get handle() {
    return this.previousState.handle;
  }
  get offset() {
    return this.previousState.offset;
  }
  get schema() {
    return this.previousState.schema;
  }
  get liveCacheBuster() {
    return this.previousState.liveCacheBuster;
  }
  get lastSyncedAt() {
    return this.previousState.lastSyncedAt;
  }
  get isUpToDate() {
    return this.previousState.isUpToDate;
  }
  get staleCacheBuster() {
    return this.previousState.staleCacheBuster;
  }
  get staleCacheRetryCount() {
    return this.previousState.staleCacheRetryCount;
  }
  get sseFallbackToLongPolling() {
    return this.previousState.sseFallbackToLongPolling;
  }
  get consecutiveShortSseConnections() {
    return this.previousState.consecutiveShortSseConnections;
  }
  get replayCursor() {
    return this.previousState.replayCursor;
  }
  handleResponseMetadata(input) {
    const transition = this.previousState.handleResponseMetadata(input);
    if (transition.action === `accepted`) {
      return {
        action: `accepted`,
        state: new _PausedState(transition.state)
      };
    }
    if (transition.action === `ignored`) {
      return {
        action: `ignored`,
        state: this
      };
    }
    if (transition.action === `stale-retry`) {
      return {
        action: `stale-retry`,
        state: new _PausedState(transition.state),
        exceededMaxRetries: transition.exceededMaxRetries
      };
    }
    const _exhaustive = transition;
    throw new Error(`PausedState.handleResponseMetadata: unhandled transition action "${_exhaustive.action}"`);
  }
  withHandle(handle) {
    return new _PausedState(this.previousState.withHandle(handle));
  }
  applyUrlParams(url, context) {
    this.previousState.applyUrlParams(url, context);
  }
  pause() {
    return this;
  }
  resume() {
    return this.previousState;
  }
};
var ErrorState = class _ErrorState extends ShapeStreamState {
  constructor(previousState, error) {
    super();
    this.kind = `error`;
    this.previousState = previousState instanceof _ErrorState ? previousState.previousState : previousState;
    this.error = error;
  }
  get handle() {
    return this.previousState.handle;
  }
  get offset() {
    return this.previousState.offset;
  }
  get schema() {
    return this.previousState.schema;
  }
  get liveCacheBuster() {
    return this.previousState.liveCacheBuster;
  }
  get lastSyncedAt() {
    return this.previousState.lastSyncedAt;
  }
  get isUpToDate() {
    return this.previousState.isUpToDate;
  }
  get staleCacheBuster() {
    return this.previousState.staleCacheBuster;
  }
  get staleCacheRetryCount() {
    return this.previousState.staleCacheRetryCount;
  }
  get sseFallbackToLongPolling() {
    return this.previousState.sseFallbackToLongPolling;
  }
  get consecutiveShortSseConnections() {
    return this.previousState.consecutiveShortSseConnections;
  }
  get replayCursor() {
    return this.previousState.replayCursor;
  }
  withHandle(handle) {
    return new _ErrorState(this.previousState.withHandle(handle), this.error);
  }
  applyUrlParams(url, context) {
    this.previousState.applyUrlParams(url, context);
  }
  retry() {
    return this.previousState;
  }
  reset(handle) {
    return this.previousState.markMustRefetch(handle);
  }
};
function createInitialState(opts) {
  return new InitialState({
    handle: opts.handle,
    offset: opts.offset,
    liveCacheBuster: ``,
    lastSyncedAt: void 0,
    schema: void 0
  });
}
var _holders;
var _onAcquired;
var _onReleased;
var PauseLock = class {
  constructor(callbacks) {
    __privateAdd(this, _holders, /* @__PURE__ */ new Set());
    __privateAdd(this, _onAcquired);
    __privateAdd(this, _onReleased);
    __privateSet(this, _onAcquired, callbacks.onAcquired);
    __privateSet(this, _onReleased, callbacks.onReleased);
  }
  /**
   * Acquire the lock for a given reason. Idempotent — acquiring the same
   * reason twice is a no-op (but logs a warning since it likely indicates
   * a caller bug).
   *
   * Fires `onAcquired` when the first reason is acquired (transition from
   * unlocked to locked).
   */
  acquire(reason) {
    if (__privateGet(this, _holders).has(reason)) {
      console.warn(`[Electric] PauseLock: "${reason}" already held \u2014 ignoring duplicate acquire`);
      return;
    }
    const wasUnlocked = __privateGet(this, _holders).size === 0;
    __privateGet(this, _holders).add(reason);
    if (wasUnlocked) {
      __privateGet(this, _onAcquired).call(this);
    }
  }
  /**
   * Release the lock for a given reason. Releasing a reason that isn't
   * held logs a warning (likely indicates an acquire/release mismatch).
   *
   * Fires `onReleased` when the last reason is released (transition from
   * locked to unlocked).
   */
  release(reason) {
    if (!__privateGet(this, _holders).delete(reason)) {
      console.warn(`[Electric] PauseLock: "${reason}" not held \u2014 ignoring release (possible acquire/release mismatch)`);
      return;
    }
    if (__privateGet(this, _holders).size === 0) {
      __privateGet(this, _onReleased).call(this);
    }
  }
  /**
   * Whether the lock is currently held by any reason.
   */
  get isPaused() {
    return __privateGet(this, _holders).size > 0;
  }
  /**
   * Check if a specific reason is holding the lock.
   */
  isHeldBy(reason) {
    return __privateGet(this, _holders).has(reason);
  }
  /**
   * Release all reasons matching a prefix. Does NOT fire `onReleased` —
   * this is for cleanup/reset paths where the stream state is being
   * managed separately.
   *
   * This preserves reasons with different prefixes (e.g., 'visibility'
   * is preserved when clearing 'snapshot-*' reasons).
   */
  releaseAllMatching(prefix) {
    for (const reason of __privateGet(this, _holders)) {
      if (reason.startsWith(prefix)) {
        __privateGet(this, _holders).delete(reason);
      }
    }
  }
};
_holders = /* @__PURE__ */ new WeakMap();
_onAcquired = /* @__PURE__ */ new WeakMap();
_onReleased = /* @__PURE__ */ new WeakMap();
var defaultRuntimeVisibilityAdapterFactory;
function getDefaultRuntimeVisibilityAdapterFactory() {
  return defaultRuntimeVisibilityAdapterFactory;
}
var RESERVED_PARAMS = /* @__PURE__ */ new Set([
  LIVE_CACHE_BUSTER_QUERY_PARAM,
  SHAPE_HANDLE_QUERY_PARAM,
  LIVE_QUERY_PARAM,
  OFFSET_QUERY_PARAM,
  CACHE_BUSTER_QUERY_PARAM
]);
var TROUBLESHOOTING_URL = `https://electric-sql.com/docs/guides/troubleshooting`;
function createCacheBuster() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
async function resolveValue(value) {
  if (typeof value === `function`) {
    return value();
  }
  return value;
}
async function toInternalParams(params) {
  const entries = Object.entries(params);
  const resolvedEntries = await Promise.all(entries.map(async ([key, value]) => {
    if (value === void 0) return [
      key,
      void 0
    ];
    const resolvedValue = await resolveValue(value);
    return [
      key,
      Array.isArray(resolvedValue) ? resolvedValue.join(`,`) : resolvedValue
    ];
  }));
  return Object.fromEntries(resolvedEntries.filter(([_, value]) => value !== void 0));
}
async function resolveHeaders(headers) {
  if (!headers) return {};
  const entries = Object.entries(headers);
  const resolvedEntries = await Promise.all(entries.map(async ([key, value]) => [
    key,
    await resolveValue(value)
  ]));
  return Object.fromEntries(resolvedEntries);
}
function getDefaultRuntimeVisibilityAdapter() {
  var _a;
  return (_a = getDefaultRuntimeVisibilityAdapterFactory()) == null ? void 0 : _a();
}
function canonicalShapeKey(url) {
  const cleanUrl = new URL(url.origin + url.pathname);
  for (const [key, value] of url.searchParams) {
    if (!ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
      cleanUrl.searchParams.append(key, value);
    }
  }
  cleanUrl.searchParams.sort();
  return cleanUrl.toString();
}
var _error;
var _fetchClient2;
var _sseFetchClient;
var _messageParser;
var _subscribers;
var _started;
var _syncState;
var _connected;
var _mode;
var _onError;
var _requestAbortController;
var _restartAbortControllers;
var _refreshCount;
var _refreshCatchUpWatchdogActive;
var _snapshotCounter;
var _ShapeStream_instances;
var isRefreshing_get;
var _tickPromise;
var _tickPromiseResolver;
var _tickPromiseRejecter;
var _messageChain;
var _isPublishing;
var _snapshotTracker;
var _pauseLock;
var _currentFetchUrl;
var _lastSseConnectionStartTime;
var _minSseConnectionDuration;
var _maxShortSseConnections;
var _sseBackoffBaseDelay;
var _sseBackoffMaxDelay;
var _liveRequestTimeoutMs;
var _unsubscribeFromVisibilityChanges;
var _unsubscribeFromWakeDetection;
var _maxStaleCacheRetries;
var _recentRequestEntries;
var _fastLoopWindowMs;
var _fastLoopThreshold;
var _fastLoopBackoffBaseMs;
var _fastLoopBackoffMaxMs;
var _fastLoopConsecutiveCount;
var _fastLoopMaxCount;
var _pendingRequestShapeCacheBuster;
var _maxSnapshotRetries;
var _expiredShapeRecoveryKey;
var _pendingSelfHealCheck;
var _consecutiveErrorRetries;
var _maxConsecutiveErrorRetries;
var _onErrorBackoff;
var start_fn;
var teardown_fn;
var backoffOnErrorRetry_fn;
var requestShape_fn;
var checkFastLoop_fn;
var constructUrl_fn;
var createAbortListener_fn;
var onInitialResponse_fn;
var onMessages_fn;
var fetchShape_fn;
var withRequestTimeout_fn;
var requestShapeLongPoll_fn;
var requestShapeSSE_fn;
var nextTick_fn;
var publish_fn;
var sendErrorToSubscribers_fn;
var hasBrowserVisibilityAPI_fn;
var setVisibilityPaused_fn;
var subscribeToVisibilityChanges_fn;
var forceDisconnectAndRefreshFromWake_fn;
var subscribeToWakeDetection_fn;
var reset_fn;
var fetchSnapshotWithRetry_fn;
var buildSubsetBody_fn;
var ShapeStream = class {
  constructor(options) {
    __privateAdd(this, _ShapeStream_instances);
    __privateAdd(this, _error, null);
    __privateAdd(this, _fetchClient2);
    __privateAdd(this, _sseFetchClient);
    __privateAdd(this, _messageParser);
    __privateAdd(this, _subscribers, /* @__PURE__ */ new Map());
    __privateAdd(this, _started, false);
    __privateAdd(this, _syncState);
    __privateAdd(this, _connected, false);
    __privateAdd(this, _mode);
    __privateAdd(this, _onError);
    __privateAdd(this, _requestAbortController);
    __privateAdd(this, _restartAbortControllers, /* @__PURE__ */ new WeakSet());
    __privateAdd(this, _refreshCount, 0);
    __privateAdd(this, _refreshCatchUpWatchdogActive, false);
    __privateAdd(this, _snapshotCounter, 0);
    __privateAdd(this, _tickPromise);
    __privateAdd(this, _tickPromiseResolver);
    __privateAdd(this, _tickPromiseRejecter);
    __privateAdd(this, _messageChain, Promise.resolve([]));
    __privateAdd(this, _isPublishing, false);
    __privateAdd(this, _snapshotTracker, new SnapshotTracker());
    __privateAdd(this, _pauseLock);
    __privateAdd(this, _currentFetchUrl);
    __privateAdd(this, _lastSseConnectionStartTime);
    __privateAdd(this, _minSseConnectionDuration, 1e3);
    __privateAdd(this, _maxShortSseConnections, 3);
    __privateAdd(this, _sseBackoffBaseDelay, 100);
    __privateAdd(this, _sseBackoffMaxDelay, 5e3);
    __privateAdd(this, _liveRequestTimeoutMs);
    __privateAdd(this, _unsubscribeFromVisibilityChanges);
    __privateAdd(this, _unsubscribeFromWakeDetection);
    __privateAdd(this, _maxStaleCacheRetries, 3);
    __privateAdd(this, _recentRequestEntries, []);
    __privateAdd(this, _fastLoopWindowMs, 500);
    __privateAdd(this, _fastLoopThreshold, 5);
    __privateAdd(this, _fastLoopBackoffBaseMs, 100);
    __privateAdd(this, _fastLoopBackoffMaxMs, 5e3);
    __privateAdd(this, _fastLoopConsecutiveCount, 0);
    __privateAdd(this, _fastLoopMaxCount, 5);
    __privateAdd(this, _pendingRequestShapeCacheBuster);
    __privateAdd(this, _maxSnapshotRetries, 5);
    __privateAdd(this, _expiredShapeRecoveryKey, null);
    __privateAdd(this, _pendingSelfHealCheck, null);
    __privateAdd(this, _consecutiveErrorRetries, 0);
    __privateAdd(this, _maxConsecutiveErrorRetries, 50);
    __privateAdd(this, _onErrorBackoff);
    var _a, _b, _c, _d, _e;
    this.options = __spreadValues({
      subscribe: true
    }, options);
    validateOptions(this.options);
    __privateSet(this, _syncState, createInitialState({
      offset: (_a = this.options.offset) != null ? _a : `-1`,
      handle: this.options.handle
    }));
    __privateSet(this, _pauseLock, new PauseLock({
      onAcquired: () => {
        var _a2;
        __privateSet(this, _syncState, __privateGet(this, _syncState).pause());
        if (__privateGet(this, _started)) {
          (_a2 = __privateGet(this, _requestAbortController)) == null ? void 0 : _a2.abort(PAUSE_STREAM);
        }
      },
      onReleased: () => {
        var _a2;
        if (!__privateGet(this, _started)) return;
        if ((_a2 = this.options.signal) == null ? void 0 : _a2.aborted) return;
        __privateMethod(this, _ShapeStream_instances, start_fn).call(this).catch(() => {
        });
      }
    }));
    let transformer;
    if (options.columnMapper) {
      const applyColumnMapper = (row) => {
        const result = {};
        for (const [dbKey, value] of Object.entries(row)) {
          const appKey = options.columnMapper.decode(dbKey);
          result[appKey] = value;
        }
        return result;
      };
      transformer = options.transformer ? (row) => options.transformer(applyColumnMapper(row)) : applyColumnMapper;
    } else {
      transformer = options.transformer;
    }
    __privateSet(this, _messageParser, new MessageParser(options.parser, transformer));
    __privateSet(this, _onError, this.options.onError);
    __privateSet(this, _mode, (_b = this.options.log) != null ? _b : `full`);
    __privateSet(this, _liveRequestTimeoutMs, (_c = this.options.liveRequestTimeoutMs) != null ? _c : 45e3);
    const baseFetchClient = (_d = options.fetchClient) != null ? _d : (...args) => fetch(...args);
    const backOffOpts = __spreadProps(__spreadValues({}, (_e = options.backoffOptions) != null ? _e : BackoffDefaults), {
      onFailedAttempt: () => {
        var _a2, _b2;
        __privateSet(this, _connected, false);
        (_b2 = (_a2 = options.backoffOptions) == null ? void 0 : _a2.onFailedAttempt) == null ? void 0 : _b2.call(_a2);
      }
    });
    __privateSet(this, _onErrorBackoff, {
      initialDelay: backOffOpts.initialDelay,
      maxDelay: backOffOpts.maxDelay,
      multiplier: backOffOpts.multiplier
    });
    const fetchWithBackoffClient = createFetchWithBackoff(baseFetchClient, backOffOpts);
    __privateSet(this, _sseFetchClient, createFetchWithResponseHeadersCheck(createFetchWithChunkBuffer(fetchWithBackoffClient)));
    __privateSet(this, _fetchClient2, createFetchWithConsumedMessages(__privateGet(this, _sseFetchClient)));
    __privateMethod(this, _ShapeStream_instances, subscribeToVisibilityChanges_fn).call(this);
  }
  get shapeHandle() {
    return __privateGet(this, _syncState).handle;
  }
  get error() {
    return __privateGet(this, _error);
  }
  get isUpToDate() {
    return __privateGet(this, _syncState).isUpToDate;
  }
  get lastOffset() {
    return __privateGet(this, _syncState).offset;
  }
  get mode() {
    return __privateGet(this, _mode);
  }
  subscribe(callback, onError = () => {
  }) {
    const subscriptionId = {};
    __privateGet(this, _subscribers).set(subscriptionId, [
      callback,
      onError
    ]);
    if (!__privateGet(this, _started)) __privateMethod(this, _ShapeStream_instances, start_fn).call(this);
    return () => {
      __privateGet(this, _subscribers).delete(subscriptionId);
    };
  }
  unsubscribeAll() {
    var _a, _b;
    __privateGet(this, _subscribers).clear();
    (_a = __privateGet(this, _unsubscribeFromVisibilityChanges)) == null ? void 0 : _a.call(this);
    (_b = __privateGet(this, _unsubscribeFromWakeDetection)) == null ? void 0 : _b.call(this);
  }
  /** Unix time at which we last synced. Undefined until first successful up-to-date. */
  lastSyncedAt() {
    return __privateGet(this, _syncState).lastSyncedAt;
  }
  /** Time elapsed since last sync (in ms). Infinity if we did not yet sync. */
  lastSynced() {
    if (__privateGet(this, _syncState).lastSyncedAt === void 0) return Infinity;
    return Date.now() - __privateGet(this, _syncState).lastSyncedAt;
  }
  /** Indicates if we are connected to the Electric sync service. */
  isConnected() {
    return __privateGet(this, _connected);
  }
  /** True during initial fetch. False afterwards.  */
  isLoading() {
    return !__privateGet(this, _syncState).isUpToDate;
  }
  hasStarted() {
    return __privateGet(this, _started);
  }
  isPaused() {
    return __privateGet(this, _pauseLock).isPaused;
  }
  /**
   * Refreshes the shape stream.
   * This preemptively aborts any ongoing long poll and reconnects without
   * long polling, ensuring that the stream receives an up to date message with the
   * latest LSN from Postgres at that point in time.
   */
  async forceDisconnectAndRefresh() {
    __privateWrapper(this, _refreshCount)._++;
    __privateSet(this, _refreshCatchUpWatchdogActive, true);
    try {
      const requestAbortController = __privateGet(this, _requestAbortController);
      if (__privateGet(this, _syncState).isUpToDate && requestAbortController && !requestAbortController.signal.aborted) {
        __privateGet(this, _restartAbortControllers).add(requestAbortController);
        requestAbortController.abort(FORCE_DISCONNECT_AND_REFRESH);
      }
      await __privateMethod(this, _ShapeStream_instances, nextTick_fn).call(this);
    } finally {
      __privateWrapper(this, _refreshCount)._--;
    }
  }
  /**
   * Request a snapshot for subset of data and inject it into the subscribed data stream.
   *
   * Only available when mode is `changes_only`.
   * Returns the insertion point & the data, but more importantly injects the data
   * into the subscribed data stream. Returned value is unlikely to be useful for the caller,
   * unless the caller has complicated additional logic.
   *
   * Data will be injected in a way that's also tracking further incoming changes, and it'll
   * skip the ones that are already in the snapshot.
   *
   * @param opts - The options for the snapshot request.
   * @returns The metadata and the data for the snapshot.
   */
  async requestSnapshot(opts) {
    if (__privateGet(this, _mode) === `full`) {
      throw new Error(`Snapshot requests are not supported in ${__privateGet(this, _mode)} mode, as the consumer is guaranteed to observe all data`);
    }
    if (!__privateGet(this, _started)) {
      __privateMethod(this, _ShapeStream_instances, start_fn).call(this).catch(() => {
      });
    }
    const snapshotReason = `snapshot-${++__privateWrapper(this, _snapshotCounter)._}`;
    __privateGet(this, _pauseLock).acquire(snapshotReason);
    const snapshotWarnTimer = setTimeout(() => {
      console.warn(`[Electric] Snapshot "${snapshotReason}" has held the pause lock for 30s \u2014 possible hung request or leaked lock. Current holders: ${[
        .../* @__PURE__ */ new Set([
          snapshotReason
        ])
      ].join(`, `)}`, new Error(`stack trace`));
    }, 3e4);
    try {
      const { metadata, data, responseOffset, responseHandle } = await this.fetchSnapshot(opts);
      const dataWithEndBoundary = data.concat([
        {
          headers: __spreadValues({
            control: `snapshot-end`
          }, metadata)
        },
        {
          headers: __spreadValues({
            control: `subset-end`
          }, opts)
        }
      ]);
      __privateGet(this, _snapshotTracker).addSnapshot(metadata, new Set(data.map((message) => message.key)));
      await __privateMethod(this, _ShapeStream_instances, onMessages_fn).call(this, dataWithEndBoundary, false, {
        allowReentrantPublishBypass: true
      });
      if (responseOffset !== null || responseHandle !== null) {
        const transition = __privateGet(this, _syncState).handleResponseMetadata({
          status: 200,
          responseHandle,
          responseOffset,
          responseCursor: null,
          expiredHandle: null,
          now: Date.now(),
          maxStaleCacheRetries: __privateGet(this, _maxStaleCacheRetries),
          createCacheBuster
        });
        if (transition.action === `accepted`) {
          __privateSet(this, _syncState, transition.state);
        } else {
          console.warn(`[Electric] Snapshot response metadata was not accepted by state "${__privateGet(this, _syncState).kind}" (action: ${transition.action}). Stream offset was not advanced from snapshot.`, new Error(`stack trace`));
        }
      }
      return {
        metadata,
        data
      };
    } finally {
      clearTimeout(snapshotWarnTimer);
      __privateGet(this, _pauseLock).release(snapshotReason);
    }
  }
  /**
   * Fetch a snapshot for subset of data.
   * Returns the metadata and the data, but does not inject it into the subscribed data stream.
   *
   * By default, uses GET to send subset parameters as query parameters. This may hit URL length
   * limits (HTTP 414) with large WHERE clauses or many parameters. Set `method: 'POST'` or use
   * `subsetMethod: 'POST'` on the stream to send parameters in the request body instead.
   *
   * @param opts - The options for the snapshot request.
   * @returns The metadata, data, and the response's offset/handle for state advancement.
   */
  async fetchSnapshot(opts) {
    return __privateMethod(this, _ShapeStream_instances, fetchSnapshotWithRetry_fn).call(this, opts, 0);
  }
};
_error = /* @__PURE__ */ new WeakMap();
_fetchClient2 = /* @__PURE__ */ new WeakMap();
_sseFetchClient = /* @__PURE__ */ new WeakMap();
_messageParser = /* @__PURE__ */ new WeakMap();
_subscribers = /* @__PURE__ */ new WeakMap();
_started = /* @__PURE__ */ new WeakMap();
_syncState = /* @__PURE__ */ new WeakMap();
_connected = /* @__PURE__ */ new WeakMap();
_mode = /* @__PURE__ */ new WeakMap();
_onError = /* @__PURE__ */ new WeakMap();
_requestAbortController = /* @__PURE__ */ new WeakMap();
_restartAbortControllers = /* @__PURE__ */ new WeakMap();
_refreshCount = /* @__PURE__ */ new WeakMap();
_refreshCatchUpWatchdogActive = /* @__PURE__ */ new WeakMap();
_snapshotCounter = /* @__PURE__ */ new WeakMap();
_ShapeStream_instances = /* @__PURE__ */ new WeakSet();
isRefreshing_get = function() {
  return __privateGet(this, _refreshCount) > 0;
};
_tickPromise = /* @__PURE__ */ new WeakMap();
_tickPromiseResolver = /* @__PURE__ */ new WeakMap();
_tickPromiseRejecter = /* @__PURE__ */ new WeakMap();
_messageChain = /* @__PURE__ */ new WeakMap();
_isPublishing = /* @__PURE__ */ new WeakMap();
_snapshotTracker = /* @__PURE__ */ new WeakMap();
_pauseLock = /* @__PURE__ */ new WeakMap();
_currentFetchUrl = /* @__PURE__ */ new WeakMap();
_lastSseConnectionStartTime = /* @__PURE__ */ new WeakMap();
_minSseConnectionDuration = /* @__PURE__ */ new WeakMap();
_maxShortSseConnections = /* @__PURE__ */ new WeakMap();
_sseBackoffBaseDelay = /* @__PURE__ */ new WeakMap();
_sseBackoffMaxDelay = /* @__PURE__ */ new WeakMap();
_liveRequestTimeoutMs = /* @__PURE__ */ new WeakMap();
_unsubscribeFromVisibilityChanges = /* @__PURE__ */ new WeakMap();
_unsubscribeFromWakeDetection = /* @__PURE__ */ new WeakMap();
_maxStaleCacheRetries = /* @__PURE__ */ new WeakMap();
_recentRequestEntries = /* @__PURE__ */ new WeakMap();
_fastLoopWindowMs = /* @__PURE__ */ new WeakMap();
_fastLoopThreshold = /* @__PURE__ */ new WeakMap();
_fastLoopBackoffBaseMs = /* @__PURE__ */ new WeakMap();
_fastLoopBackoffMaxMs = /* @__PURE__ */ new WeakMap();
_fastLoopConsecutiveCount = /* @__PURE__ */ new WeakMap();
_fastLoopMaxCount = /* @__PURE__ */ new WeakMap();
_pendingRequestShapeCacheBuster = /* @__PURE__ */ new WeakMap();
_maxSnapshotRetries = /* @__PURE__ */ new WeakMap();
_expiredShapeRecoveryKey = /* @__PURE__ */ new WeakMap();
_pendingSelfHealCheck = /* @__PURE__ */ new WeakMap();
_consecutiveErrorRetries = /* @__PURE__ */ new WeakMap();
_maxConsecutiveErrorRetries = /* @__PURE__ */ new WeakMap();
_onErrorBackoff = /* @__PURE__ */ new WeakMap();
start_fn = async function() {
  var _a, _b, _c;
  __privateSet(this, _started, true);
  __privateMethod(this, _ShapeStream_instances, subscribeToWakeDetection_fn).call(this);
  try {
    await __privateMethod(this, _ShapeStream_instances, requestShape_fn).call(this);
  } catch (err) {
    __privateSet(this, _error, err);
    if (err instanceof Error) {
      __privateSet(this, _syncState, __privateGet(this, _syncState).toErrorState(err));
    }
    if (__privateGet(this, _onError)) {
      const retryOpts = await __privateGet(this, _onError).call(this, err);
      const isRetryable = !(err instanceof MissingHeadersError);
      if (retryOpts && typeof retryOpts === `object` && isRetryable) {
        if (retryOpts.params) {
          this.options.params = __spreadValues(__spreadValues({}, (_a = this.options.params) != null ? _a : {}), retryOpts.params);
        }
        if (retryOpts.headers) {
          this.options.headers = __spreadValues(__spreadValues({}, (_b = this.options.headers) != null ? _b : {}), retryOpts.headers);
        }
        __privateWrapper(this, _consecutiveErrorRetries)._++;
        if (__privateGet(this, _consecutiveErrorRetries) > __privateGet(this, _maxConsecutiveErrorRetries)) {
          console.warn(`[Electric] onError retry loop exhausted after ${__privateGet(this, _maxConsecutiveErrorRetries)} consecutive retries. The error was never resolved by the onError handler. Error: ${err instanceof Error ? err.message : String(err)}`, new Error(`stack trace`));
          if (err instanceof Error) {
            __privateMethod(this, _ShapeStream_instances, sendErrorToSubscribers_fn).call(this, err);
          }
          __privateMethod(this, _ShapeStream_instances, teardown_fn).call(this);
          return;
        }
        __privateSet(this, _error, null);
        if (__privateGet(this, _syncState) instanceof ErrorState) {
          __privateSet(this, _syncState, __privateGet(this, _syncState).retry());
        }
        __privateSet(this, _fastLoopConsecutiveCount, 0);
        __privateSet(this, _recentRequestEntries, []);
        await __privateMethod(this, _ShapeStream_instances, backoffOnErrorRetry_fn).call(this, __privateGet(this, _consecutiveErrorRetries));
        if ((_c = this.options.signal) == null ? void 0 : _c.aborted) {
          __privateMethod(this, _ShapeStream_instances, teardown_fn).call(this);
          return;
        }
        __privateSet(this, _started, false);
        return __privateMethod(this, _ShapeStream_instances, start_fn).call(this);
      }
      if (err instanceof Error) {
        __privateMethod(this, _ShapeStream_instances, sendErrorToSubscribers_fn).call(this, err);
      }
      __privateMethod(this, _ShapeStream_instances, teardown_fn).call(this);
      return;
    }
    if (err instanceof Error) {
      __privateMethod(this, _ShapeStream_instances, sendErrorToSubscribers_fn).call(this, err);
    }
    __privateMethod(this, _ShapeStream_instances, teardown_fn).call(this);
    throw err;
  }
  __privateMethod(this, _ShapeStream_instances, teardown_fn).call(this);
};
teardown_fn = function() {
  var _a, _b;
  __privateSet(this, _connected, false);
  (_a = __privateGet(this, _tickPromiseRejecter)) == null ? void 0 : _a.call(this);
  (_b = __privateGet(this, _unsubscribeFromWakeDetection)) == null ? void 0 : _b.call(this);
};
backoffOnErrorRetry_fn = async function(retryAttempt) {
  const { initialDelay, maxDelay, multiplier } = __privateGet(this, _onErrorBackoff);
  const cappedDelay = Math.min(maxDelay, initialDelay * Math.pow(multiplier, retryAttempt - 1));
  const delayMs = Math.floor(Math.random() * cappedDelay);
  const signal = this.options.signal;
  if (delayMs <= 0 || (signal == null ? void 0 : signal.aborted)) return;
  await new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal == null ? void 0 : signal.removeEventListener(`abort`, done);
      resolve();
    };
    const timer = setTimeout(done, delayMs);
    signal == null ? void 0 : signal.addEventListener(`abort`, done, {
      once: true
    });
    if (signal == null ? void 0 : signal.aborted) done();
  });
};
requestShape_fn = async function(requestShapeCacheBuster) {
  var _a, _b, _c;
  if ((_a = this.options.signal) == null ? void 0 : _a.aborted) {
    __privateMethod(this, _ShapeStream_instances, teardown_fn).call(this);
    return;
  }
  if (__privateGet(this, _syncState) instanceof ErrorState) {
    throw __privateGet(this, _syncState).error;
  }
  const activeCacheBuster = requestShapeCacheBuster != null ? requestShapeCacheBuster : __privateGet(this, _pendingRequestShapeCacheBuster);
  if (__privateGet(this, _pauseLock).isPaused) {
    if (activeCacheBuster) {
      __privateSet(this, _pendingRequestShapeCacheBuster, activeCacheBuster);
    }
    return;
  }
  if (!this.options.subscribe && (((_b = this.options.signal) == null ? void 0 : _b.aborted) || __privateGet(this, _syncState).isUpToDate)) {
    return;
  }
  if (!__privateGet(this, _syncState).isUpToDate) {
    await __privateMethod(this, _ShapeStream_instances, checkFastLoop_fn).call(this);
  } else {
    __privateSet(this, _fastLoopConsecutiveCount, 0);
    __privateSet(this, _recentRequestEntries, []);
  }
  let resumingFromPause = false;
  if (__privateGet(this, _syncState) instanceof PausedState) {
    resumingFromPause = true;
    __privateSet(this, _syncState, __privateGet(this, _syncState).resume());
  }
  const { url, signal } = this.options;
  const { fetchUrl, requestHeaders } = await __privateMethod(this, _ShapeStream_instances, constructUrl_fn).call(this, url, resumingFromPause);
  if (activeCacheBuster) {
    fetchUrl.searchParams.set(CACHE_BUSTER_QUERY_PARAM, activeCacheBuster);
    fetchUrl.searchParams.sort();
  }
  const abortListener = await __privateMethod(this, _ShapeStream_instances, createAbortListener_fn).call(this, signal);
  const requestAbortController = __privateGet(this, _requestAbortController);
  if (__privateGet(this, _pauseLock).isPaused) {
    if (abortListener && signal) {
      signal.removeEventListener(`abort`, abortListener);
    }
    if (activeCacheBuster) {
      __privateSet(this, _pendingRequestShapeCacheBuster, activeCacheBuster);
    }
    __privateSet(this, _requestAbortController, void 0);
    return;
  }
  __privateSet(this, _pendingRequestShapeCacheBuster, void 0);
  try {
    await __privateMethod(this, _ShapeStream_instances, fetchShape_fn).call(this, {
      fetchUrl,
      requestAbortController,
      headers: requestHeaders,
      resumingFromPause
    });
  } catch (e) {
    const abortReason = requestAbortController.signal.reason;
    const isMarkedRestartAbort = __privateGet(this, _restartAbortControllers).delete(requestAbortController);
    const isRestartAbort = requestAbortController.signal.aborted && (isMarkedRestartAbort || abortReason === FORCE_DISCONNECT_AND_REFRESH || abortReason === SYSTEM_WAKE || abortReason === LIVE_REQUEST_TIMEOUT);
    if ((e instanceof FetchError || e instanceof FetchBackoffAbortError) && isRestartAbort) {
      return __privateMethod(this, _ShapeStream_instances, requestShape_fn).call(this);
    }
    if (e instanceof FetchBackoffAbortError) {
      return;
    }
    if (e instanceof StaleCacheError) {
      return __privateMethod(this, _ShapeStream_instances, requestShape_fn).call(this);
    }
    if (!(e instanceof FetchError)) throw e;
    if (e.status == 409) {
      if (__privateGet(this, _syncState).handle) {
        const shapeKey = canonicalShapeKey(fetchUrl);
        expiredShapesCache.markExpired(shapeKey, __privateGet(this, _syncState).handle);
      }
      const newShapeHandle = e.headers[SHAPE_HANDLE_HEADER];
      if (!newShapeHandle) {
        console.warn(`[Electric] Received 409 response without a shape handle header. This likely indicates a proxy or CDN stripping required headers.`);
      }
      const nextRequestShapeCacheBuster = createCacheBuster();
      __privateMethod(this, _ShapeStream_instances, reset_fn).call(this, newShapeHandle);
      await __privateMethod(this, _ShapeStream_instances, publish_fn).call(this, [
        {
          headers: {
            control: `must-refetch`
          }
        }
      ]);
      return __privateMethod(this, _ShapeStream_instances, requestShape_fn).call(this, nextRequestShapeCacheBuster);
    } else {
      throw e;
    }
  } finally {
    if (abortListener && signal) {
      signal.removeEventListener(`abort`, abortListener);
    }
    __privateSet(this, _requestAbortController, void 0);
  }
  (_c = __privateGet(this, _tickPromiseResolver)) == null ? void 0 : _c.call(this);
  return __privateMethod(this, _ShapeStream_instances, requestShape_fn).call(this);
};
checkFastLoop_fn = async function() {
  const now = Date.now();
  const currentOffset = __privateGet(this, _syncState).offset;
  __privateSet(this, _recentRequestEntries, __privateGet(this, _recentRequestEntries).filter((e) => now - e.timestamp < __privateGet(this, _fastLoopWindowMs)));
  __privateGet(this, _recentRequestEntries).push({
    timestamp: now,
    offset: currentOffset
  });
  const sameOffsetCount = __privateGet(this, _recentRequestEntries).filter((e) => e.offset === currentOffset).length;
  if (sameOffsetCount < __privateGet(this, _fastLoopThreshold)) return;
  __privateWrapper(this, _fastLoopConsecutiveCount)._++;
  if (__privateGet(this, _fastLoopConsecutiveCount) >= __privateGet(this, _fastLoopMaxCount)) {
    throw new FetchError(502, void 0, void 0, {}, this.options.url, `Client is stuck in a fast retry loop (${__privateGet(this, _fastLoopThreshold)} requests in ${__privateGet(this, _fastLoopWindowMs)}ms at the same offset, repeated ${__privateGet(this, _fastLoopMaxCount)} times). Client-side caches were cleared automatically on first detection, but the loop persists. This usually indicates a proxy or CDN misconfiguration. Common causes:
  - Proxy is not including query parameters (handle, offset) in its cache key
  - CDN is serving stale 409 responses
  - Proxy is stripping required Electric headers from responses
For more information visit the troubleshooting guide: ${TROUBLESHOOTING_URL}`);
  }
  if (__privateGet(this, _fastLoopConsecutiveCount) === 1) {
    console.warn(`[Electric] Detected fast retry loop (${__privateGet(this, _fastLoopThreshold)} requests in ${__privateGet(this, _fastLoopWindowMs)}ms at the same offset). Clearing client-side caches and resetting stream to recover. If this persists, check that your proxy includes all query parameters (especially 'handle' and 'offset') in its cache key, and that required Electric headers are forwarded to the client. For more information visit the troubleshooting guide: ${TROUBLESHOOTING_URL}`, new Error(`stack trace`));
    if (__privateGet(this, _currentFetchUrl)) {
      const shapeKey = canonicalShapeKey(__privateGet(this, _currentFetchUrl));
      expiredShapesCache.delete(shapeKey);
      upToDateTracker.delete(shapeKey);
    } else {
      expiredShapesCache.clear();
      upToDateTracker.clear();
    }
    __privateMethod(this, _ShapeStream_instances, reset_fn).call(this);
    __privateSet(this, _recentRequestEntries, []);
    return;
  }
  const maxDelay = Math.min(__privateGet(this, _fastLoopBackoffMaxMs), __privateGet(this, _fastLoopBackoffBaseMs) * Math.pow(2, __privateGet(this, _fastLoopConsecutiveCount)));
  const delayMs = Math.floor(Math.random() * maxDelay);
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  __privateSet(this, _recentRequestEntries, []);
};
constructUrl_fn = async function(url, resumingFromPause, subsetParams) {
  var _a, _b, _c, _d, _e, _f;
  const [requestHeaders, params] = await Promise.all([
    resolveHeaders(this.options.headers),
    this.options.params ? toInternalParams(convertWhereParamsToObj(this.options.params)) : void 0
  ]);
  if (params) validateParams(params);
  const fetchUrl = new URL(url);
  if (params) {
    if (params.table) setQueryParam(fetchUrl, TABLE_QUERY_PARAM, params.table);
    if (params.where && typeof params.where === `string`) {
      const encodedWhere = encodeWhereClause(params.where, (_a = this.options.columnMapper) == null ? void 0 : _a.encode);
      setQueryParam(fetchUrl, WHERE_QUERY_PARAM, encodedWhere);
    }
    if (params.columns) {
      const originalColumns = await resolveValue((_b = this.options.params) == null ? void 0 : _b.columns);
      if (Array.isArray(originalColumns)) {
        let encodedColumns = originalColumns.map(String);
        if (this.options.columnMapper) {
          encodedColumns = encodedColumns.map(this.options.columnMapper.encode);
        }
        const serializedColumns = encodedColumns.map(quoteIdentifier).join(`,`);
        setQueryParam(fetchUrl, COLUMNS_QUERY_PARAM, serializedColumns);
      } else {
        setQueryParam(fetchUrl, COLUMNS_QUERY_PARAM, params.columns);
      }
    }
    if (params.replica) setQueryParam(fetchUrl, REPLICA_PARAM, params.replica);
    if (params.params) setQueryParam(fetchUrl, WHERE_PARAMS_PARAM, params.params);
    const customParams = __spreadValues({}, params);
    delete customParams.table;
    delete customParams.where;
    delete customParams.columns;
    delete customParams.replica;
    delete customParams.params;
    for (const [key, value] of Object.entries(customParams)) {
      setQueryParam(fetchUrl, key, value);
    }
  }
  if (subsetParams) {
    if (subsetParams.whereExpr) {
      const compiledWhere = compileExpression2(subsetParams.whereExpr, (_c = this.options.columnMapper) == null ? void 0 : _c.encode);
      setQueryParam(fetchUrl, SUBSET_PARAM_WHERE, compiledWhere);
      fetchUrl.searchParams.set(SUBSET_PARAM_WHERE_EXPR, JSON.stringify(subsetParams.whereExpr));
    } else if (subsetParams.where && typeof subsetParams.where === `string`) {
      const encodedWhere = encodeWhereClause(subsetParams.where, (_d = this.options.columnMapper) == null ? void 0 : _d.encode);
      setQueryParam(fetchUrl, SUBSET_PARAM_WHERE, encodedWhere);
    }
    if (subsetParams.params) fetchUrl.searchParams.set(SUBSET_PARAM_WHERE_PARAMS, bigintSafeStringify(subsetParams.params));
    if (subsetParams.limit !== void 0) setQueryParam(fetchUrl, SUBSET_PARAM_LIMIT, subsetParams.limit);
    if (subsetParams.offset !== void 0) setQueryParam(fetchUrl, SUBSET_PARAM_OFFSET, subsetParams.offset);
    if (subsetParams.orderByExpr) {
      const compiledOrderBy = compileOrderBy(subsetParams.orderByExpr, (_e = this.options.columnMapper) == null ? void 0 : _e.encode);
      setQueryParam(fetchUrl, SUBSET_PARAM_ORDER_BY, compiledOrderBy);
      fetchUrl.searchParams.set(SUBSET_PARAM_ORDER_BY_EXPR, JSON.stringify(subsetParams.orderByExpr));
    } else if (subsetParams.orderBy && typeof subsetParams.orderBy === `string`) {
      const encodedOrderBy = encodeWhereClause(subsetParams.orderBy, (_f = this.options.columnMapper) == null ? void 0 : _f.encode);
      setQueryParam(fetchUrl, SUBSET_PARAM_ORDER_BY, encodedOrderBy);
    }
  }
  __privateGet(this, _syncState).applyUrlParams(fetchUrl, {
    isSnapshotRequest: subsetParams !== void 0,
    // Don't long-poll when resuming from pause or refreshing — avoids
    // a 20s hold during which `isConnected` would be false
    canLongPoll: !__privateGet(this, _ShapeStream_instances, isRefreshing_get) && !resumingFromPause
  });
  fetchUrl.searchParams.set(LOG_MODE_QUERY_PARAM, __privateGet(this, _mode));
  const shapeKey = canonicalShapeKey(fetchUrl);
  const expiredHandle = expiredShapesCache.getExpiredHandle(shapeKey);
  if (expiredHandle) {
    fetchUrl.searchParams.set(EXPIRED_HANDLE_QUERY_PARAM, expiredHandle);
  }
  fetchUrl.searchParams.sort();
  return {
    fetchUrl,
    requestHeaders
  };
};
createAbortListener_fn = async function(signal) {
  var _a;
  __privateSet(this, _requestAbortController, new AbortController());
  if (signal) {
    const abortListener = () => {
      var _a2;
      (_a2 = __privateGet(this, _requestAbortController)) == null ? void 0 : _a2.abort(signal.reason);
    };
    signal.addEventListener(`abort`, abortListener, {
      once: true
    });
    if (signal.aborted) {
      (_a = __privateGet(this, _requestAbortController)) == null ? void 0 : _a.abort(signal.reason);
    }
    return abortListener;
  }
};
onInitialResponse_fn = async function(response) {
  var _a, _b, _c;
  const { headers, status } = response;
  const shapeHandle = headers.get(SHAPE_HANDLE_HEADER);
  const shapeKey = __privateGet(this, _currentFetchUrl) ? canonicalShapeKey(__privateGet(this, _currentFetchUrl)) : null;
  const expiredHandle = shapeKey ? expiredShapesCache.getExpiredHandle(shapeKey) : null;
  if (__privateGet(this, _pendingSelfHealCheck)) {
    const { shapeKey: healedKey, staleHandle } = __privateGet(this, _pendingSelfHealCheck);
    __privateSet(this, _pendingSelfHealCheck, null);
    if (shapeKey === healedKey && shapeHandle === staleHandle) {
      console.warn(`[Electric] Self-healing retry received the same handle "${staleHandle}" that was just marked expired. This means your proxy/CDN is serving a stale cached response and ignoring cache-buster query params. The client will proceed with this stale data to avoid a permanent failure, but it may be out of date until the cache refreshes. Fix: configure your proxy/CDN to include all query parameters (especially 'handle' and 'offset') in its cache key. For more information visit the troubleshooting guide: ${TROUBLESHOOTING_URL}`, new Error(`stack trace`));
    }
  }
  const transition = __privateGet(this, _syncState).handleResponseMetadata({
    status,
    responseHandle: shapeHandle,
    responseOffset: headers.get(CHUNK_LAST_OFFSET_HEADER),
    responseCursor: headers.get(LIVE_CACHE_BUSTER_HEADER),
    responseSchema: getSchemaFromHeaders(headers),
    expiredHandle,
    now: Date.now(),
    maxStaleCacheRetries: __privateGet(this, _maxStaleCacheRetries),
    createCacheBuster
  });
  __privateSet(this, _syncState, transition.state);
  if (status === 204) {
    __privateSet(this, _expiredShapeRecoveryKey, null);
  }
  if (transition.action === `accepted` && status === 204) {
    __privateSet(this, _consecutiveErrorRetries, 0);
  }
  if (transition.action === `stale-retry`) {
    await ((_a = response.body) == null ? void 0 : _a.cancel());
    if (transition.exceededMaxRetries) {
      if (shapeKey) {
        expiredShapesCache.delete(shapeKey);
        if (__privateGet(this, _expiredShapeRecoveryKey) !== shapeKey) {
          console.warn(`[Electric] Stale cache retries exhausted (${__privateGet(this, _maxStaleCacheRetries)} attempts). Clearing expired handle entry and attempting self-healing retry without the expired_handle parameter. For more information visit the troubleshooting guide: ${TROUBLESHOOTING_URL}`, new Error(`stack trace`));
          __privateSet(this, _expiredShapeRecoveryKey, shapeKey);
          if (shapeHandle) {
            __privateSet(this, _pendingSelfHealCheck, {
              shapeKey,
              staleHandle: shapeHandle
            });
          }
          __privateMethod(this, _ShapeStream_instances, reset_fn).call(this);
          throw new StaleCacheError(`Expired handle entry evicted for self-healing retry`);
        }
      }
      throw new FetchError(502, void 0, void 0, {}, (_c = (_b = __privateGet(this, _currentFetchUrl)) == null ? void 0 : _b.toString()) != null ? _c : ``, `CDN continues serving stale cached responses after ${__privateGet(this, _maxStaleCacheRetries)} retry attempts. This indicates a severe proxy/CDN misconfiguration. Check that your proxy includes all query parameters (especially 'handle' and 'offset') in its cache key. For more information visit the troubleshooting guide: ${TROUBLESHOOTING_URL}`);
    }
    console.warn(`[Electric] Received stale cached response with expired shape handle. This should not happen and indicates a proxy/CDN caching misconfiguration. The response contained handle "${shapeHandle}" which was previously marked as expired. Check that your proxy includes all query parameters (especially 'handle' and 'offset') in its cache key. For more information visit the troubleshooting guide: ${TROUBLESHOOTING_URL} Retrying with a random cache buster to bypass the stale cache (attempt ${__privateGet(this, _syncState).staleCacheRetryCount}/${__privateGet(this, _maxStaleCacheRetries)}).`, new Error(`stack trace`));
    throw new StaleCacheError(`Received stale cached response with expired handle "${shapeHandle}". This indicates a proxy/CDN caching misconfiguration. Check that your proxy includes all query parameters (especially 'handle' and 'offset') in its cache key.`);
  }
  if (transition.action === `ignored`) {
    console.warn(`[Electric] Response was ignored by state "${__privateGet(this, _syncState).kind}". The response body will be skipped. This may indicate a proxy/CDN caching issue or a client state machine bug.`, new Error(`stack trace`));
    return false;
  }
  return true;
};
onMessages_fn = async function(batch2, isSseMessage = false, opts = {}) {
  if (!Array.isArray(batch2)) {
    console.warn(`[Electric] #onMessages called with non-array argument (${typeof batch2}). This is a client bug \u2014 please report it.`, new Error(`stack trace`));
    return;
  }
  if (batch2.length === 0) return;
  __privateSet(this, _consecutiveErrorRetries, 0);
  const lastMessage = batch2[batch2.length - 1];
  const hasUpToDateMessage = isUpToDateMessage(lastMessage);
  const upToDateOffset = hasUpToDateMessage ? getOffset(lastMessage) : void 0;
  const transition = __privateGet(this, _syncState).handleMessageBatch({
    hasMessages: true,
    hasUpToDateMessage,
    isSse: isSseMessage,
    upToDateOffset,
    now: Date.now(),
    currentCursor: __privateGet(this, _syncState).liveCacheBuster
  });
  __privateSet(this, _syncState, transition.state);
  if (hasUpToDateMessage) {
    __privateSet(this, _refreshCatchUpWatchdogActive, false);
    if (transition.suppressBatch) {
      return;
    }
    if (__privateGet(this, _currentFetchUrl)) {
      const shapeKey = canonicalShapeKey(__privateGet(this, _currentFetchUrl));
      upToDateTracker.recordUpToDate(shapeKey, __privateGet(this, _syncState).liveCacheBuster);
      __privateSet(this, _expiredShapeRecoveryKey, null);
    }
  }
  const messagesToProcess = batch2.filter((message) => {
    if (isChangeMessage(message)) {
      return !__privateGet(this, _snapshotTracker).shouldRejectMessage(message);
    }
    return true;
  });
  await __privateMethod(this, _ShapeStream_instances, publish_fn).call(this, messagesToProcess, {
    allowReentrantBypass: opts.allowReentrantPublishBypass
  });
};
fetchShape_fn = async function(opts) {
  var _a;
  __privateSet(this, _currentFetchUrl, opts.fetchUrl);
  if (!__privateGet(this, _syncState).isUpToDate && __privateGet(this, _syncState).canEnterReplayMode()) {
    const shapeKey = canonicalShapeKey(opts.fetchUrl);
    const lastSeenCursor = upToDateTracker.shouldEnterReplayMode(shapeKey);
    if (lastSeenCursor) {
      __privateSet(this, _syncState, __privateGet(this, _syncState).enterReplayMode(lastSeenCursor));
    }
  }
  const useSse = (_a = this.options.liveSse) != null ? _a : this.options.experimentalLiveSse;
  if (__privateGet(this, _syncState).shouldUseSse({
    liveSseEnabled: !!useSse,
    isRefreshing: __privateGet(this, _ShapeStream_instances, isRefreshing_get),
    resumingFromPause: !!opts.resumingFromPause
  })) {
    opts.fetchUrl.searchParams.set(EXPERIMENTAL_LIVE_SSE_QUERY_PARAM, `true`);
    opts.fetchUrl.searchParams.set(LIVE_SSE_QUERY_PARAM, `true`);
    return __privateMethod(this, _ShapeStream_instances, requestShapeSSE_fn).call(this, opts);
  }
  return __privateMethod(this, _ShapeStream_instances, requestShapeLongPoll_fn).call(this, opts);
};
withRequestTimeout_fn = async function(promise, requestAbortController, fetchUrl) {
  const timeoutMs = __privateGet(this, _liveRequestTimeoutMs);
  const isLiveRequest = fetchUrl.searchParams.get(LIVE_QUERY_PARAM) === `true`;
  const isRefreshCatchUpRequest = __privateGet(this, _ShapeStream_instances, isRefreshing_get) || __privateGet(this, _refreshCatchUpWatchdogActive);
  if (timeoutMs === false || !isLiveRequest && !isRefreshCatchUpRequest) {
    return promise;
  }
  let timeout;
  const timeoutPromise = new Promise((_, reject) => {
    timeout = setTimeout(() => {
      if (!requestAbortController.signal.aborted) {
        __privateGet(this, _restartAbortControllers).add(requestAbortController);
        requestAbortController.abort(LIVE_REQUEST_TIMEOUT);
      }
      reject(new FetchBackoffAbortError());
    }, timeoutMs);
  });
  try {
    return await Promise.race([
      promise,
      timeoutPromise
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
};
requestShapeLongPoll_fn = async function(opts) {
  var _a;
  const { fetchUrl, requestAbortController, headers } = opts;
  const fetchUrlString = fetchUrl.toString();
  const rawResponse = await __privateMethod(this, _ShapeStream_instances, withRequestTimeout_fn).call(this, __privateGet(this, _sseFetchClient).call(this, fetchUrlString, {
    signal: requestAbortController.signal,
    headers
  }), requestAbortController, fetchUrl);
  const response = await consumeResponseBody(rawResponse, fetchUrlString, requestAbortController.signal);
  __privateSet(this, _connected, true);
  const shouldProcessBody = await __privateMethod(this, _ShapeStream_instances, onInitialResponse_fn).call(this, response);
  if (!shouldProcessBody) return;
  const schema = __privateGet(this, _syncState).schema;
  const res = await response.text();
  const messages = res || `[]`;
  const batch2 = __privateGet(this, _messageParser).parse(messages, schema);
  if (!Array.isArray(batch2)) {
    const preview = (_a = bigintSafeStringify(batch2)) == null ? void 0 : _a.slice(0, 200);
    throw new FetchError(response.status, `Received non-array response body from shape endpoint. This may indicate a proxy or CDN is returning an unexpected response. Expected a JSON array, got ${typeof batch2}: ${preview}`, void 0, Object.fromEntries(response.headers.entries()), fetchUrl.toString());
  }
  await __privateMethod(this, _ShapeStream_instances, onMessages_fn).call(this, batch2);
};
requestShapeSSE_fn = async function(opts) {
  const { fetchUrl, requestAbortController, headers } = opts;
  const fetch2 = __privateGet(this, _sseFetchClient);
  __privateSet(this, _lastSseConnectionStartTime, Date.now());
  const sseHeaders = __spreadProps(__spreadValues({}, headers), {
    Accept: `text/event-stream`
  });
  let ignoredStaleResponse = false;
  try {
    let buffer = [];
    await fetchEventSource(fetchUrl.toString(), {
      headers: sseHeaders,
      fetch: fetch2,
      onopen: async (response) => {
        __privateSet(this, _connected, true);
        const shouldProcessBody = await __privateMethod(this, _ShapeStream_instances, onInitialResponse_fn).call(this, response);
        if (!shouldProcessBody) {
          ignoredStaleResponse = true;
          throw new Error(`stale response ignored`);
        }
      },
      onmessage: (event) => {
        if (event.data) {
          const schema = __privateGet(this, _syncState).schema;
          const message = __privateGet(this, _messageParser).parse(event.data, schema);
          buffer.push(message);
          if (isUpToDateMessage(message)) {
            __privateMethod(this, _ShapeStream_instances, onMessages_fn).call(this, buffer, true);
            buffer = [];
          }
        }
      },
      onerror: (error) => {
        throw error;
      },
      signal: requestAbortController.signal
    });
  } catch (error) {
    if (ignoredStaleResponse) {
      return;
    }
    if (requestAbortController.signal.aborted) {
      throw new FetchBackoffAbortError();
    }
    if (error instanceof FetchError || error instanceof StaleCacheError || error instanceof MissingHeadersError) {
      throw error;
    }
  } finally {
    const connectionDuration = Date.now() - __privateGet(this, _lastSseConnectionStartTime);
    const wasAborted = requestAbortController.signal.aborted;
    const transition = __privateGet(this, _syncState).handleSseConnectionClosed({
      connectionDuration,
      wasAborted,
      minConnectionDuration: __privateGet(this, _minSseConnectionDuration),
      maxShortConnections: __privateGet(this, _maxShortSseConnections)
    });
    __privateSet(this, _syncState, transition.state);
    if (transition.fellBackToLongPolling) {
      console.warn(`[Electric] SSE connections are closing immediately (possibly due to proxy buffering or misconfiguration). Falling back to long polling. Your proxy must support streaming SSE responses (not buffer the complete response). Configuration: Nginx add 'X-Accel-Buffering: no', Caddy add 'flush_interval -1' to reverse_proxy. Note: Do NOT disable caching entirely - Electric uses cache headers to enable request collapsing for efficiency.`, new Error(`stack trace`));
    } else if (transition.wasShortConnection) {
      const maxDelay = Math.min(__privateGet(this, _sseBackoffMaxDelay), __privateGet(this, _sseBackoffBaseDelay) * Math.pow(2, __privateGet(this, _syncState).consecutiveShortSseConnections));
      const delayMs = Math.floor(Math.random() * maxDelay);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};
nextTick_fn = async function() {
  if (__privateGet(this, _pauseLock).isPaused) {
    throw new Error(`Cannot wait for next tick while PauseLock is held \u2014 this would deadlock because the request loop is paused`);
  }
  if (__privateGet(this, _tickPromise)) {
    return __privateGet(this, _tickPromise);
  }
  __privateSet(this, _tickPromise, new Promise((resolve, reject) => {
    __privateSet(this, _tickPromiseResolver, resolve);
    __privateSet(this, _tickPromiseRejecter, reject);
  }));
  __privateGet(this, _tickPromise).finally(() => {
    __privateSet(this, _tickPromise, void 0);
    __privateSet(this, _tickPromiseResolver, void 0);
    __privateSet(this, _tickPromiseRejecter, void 0);
  }).catch(() => {
  });
  return __privateGet(this, _tickPromise);
};
publish_fn = async function(messages, opts = {}) {
  const deliver = () => Promise.all(Array.from(__privateGet(this, _subscribers).values()).map(async ([callback, __]) => {
    try {
      await callback(messages);
    } catch (err) {
      queueMicrotask(() => {
        throw err;
      });
    }
  }));
  if (__privateGet(this, _isPublishing) && opts.allowReentrantBypass) {
    return deliver();
  }
  __privateSet(this, _messageChain, __privateGet(this, _messageChain).then(async () => {
    __privateSet(this, _isPublishing, true);
    try {
      return await deliver();
    } finally {
      __privateSet(this, _isPublishing, false);
    }
  }));
  return __privateGet(this, _messageChain);
};
sendErrorToSubscribers_fn = function(error) {
  __privateGet(this, _subscribers).forEach(([_, errorFn]) => {
    errorFn == null ? void 0 : errorFn(error);
  });
};
hasBrowserVisibilityAPI_fn = function() {
  return typeof document === `object` && typeof document.hidden === `boolean` && typeof document.addEventListener === `function`;
};
setVisibilityPaused_fn = function(isHidden) {
  if (isHidden) {
    __privateGet(this, _pauseLock).acquire(`visibility`);
  } else if (__privateGet(this, _pauseLock).isHeldBy(`visibility`)) {
    __privateGet(this, _pauseLock).release(`visibility`);
  }
};
subscribeToVisibilityChanges_fn = function() {
  var _a, _b;
  const runtimeVisibility = (_a = this.options.runtimeVisibility) != null ? _a : getDefaultRuntimeVisibilityAdapter();
  if (runtimeVisibility) {
    __privateMethod(this, _ShapeStream_instances, setVisibilityPaused_fn).call(this, ((_b = runtimeVisibility.getCurrentState) == null ? void 0 : _b.call(runtimeVisibility)) === `hidden`);
    const unsubscribe = runtimeVisibility.subscribe((state) => {
      __privateMethod(this, _ShapeStream_instances, setVisibilityPaused_fn).call(this, state === `hidden`);
    });
    __privateSet(this, _unsubscribeFromVisibilityChanges, () => {
      unsubscribe();
      __privateSet(this, _unsubscribeFromVisibilityChanges, void 0);
    });
    return;
  }
  if (__privateMethod(this, _ShapeStream_instances, hasBrowserVisibilityAPI_fn).call(this)) {
    const visibilityHandler = () => {
      __privateMethod(this, _ShapeStream_instances, setVisibilityPaused_fn).call(this, document.hidden);
    };
    visibilityHandler();
    document.addEventListener(`visibilitychange`, visibilityHandler);
    __privateSet(this, _unsubscribeFromVisibilityChanges, () => {
      document.removeEventListener(`visibilitychange`, visibilityHandler);
      __privateSet(this, _unsubscribeFromVisibilityChanges, void 0);
    });
  }
};
forceDisconnectAndRefreshFromWake_fn = function() {
  var _a;
  const requestAbortController = __privateGet(this, _requestAbortController);
  if (__privateGet(this, _pauseLock).isPaused || !requestAbortController || requestAbortController.signal.aborted || ((_a = this.options.signal) == null ? void 0 : _a.aborted)) {
    return;
  }
  __privateWrapper(this, _refreshCount)._++;
  __privateSet(this, _refreshCatchUpWatchdogActive, true);
  __privateGet(this, _restartAbortControllers).add(requestAbortController);
  requestAbortController.abort(SYSTEM_WAKE);
  __privateMethod(this, _ShapeStream_instances, nextTick_fn).call(this).catch(() => {
  }).finally(() => {
    __privateWrapper(this, _refreshCount)._--;
  });
};
subscribeToWakeDetection_fn = function() {
  if (__privateMethod(this, _ShapeStream_instances, hasBrowserVisibilityAPI_fn).call(this)) return;
  if (__privateGet(this, _unsubscribeFromWakeDetection)) return;
  const INTERVAL_MS = 2e3;
  const WAKE_THRESHOLD_MS = 4e3;
  let lastTickTime = Date.now();
  const timer = setInterval(() => {
    const now = Date.now();
    const elapsed = now - lastTickTime;
    lastTickTime = now;
    if (elapsed > INTERVAL_MS + WAKE_THRESHOLD_MS) {
      __privateMethod(this, _ShapeStream_instances, forceDisconnectAndRefreshFromWake_fn).call(this);
    }
  }, INTERVAL_MS);
  if (typeof timer === `object` && `unref` in timer) {
    timer.unref();
  }
  __privateSet(this, _unsubscribeFromWakeDetection, () => {
    clearInterval(timer);
    __privateSet(this, _unsubscribeFromWakeDetection, void 0);
  });
};
reset_fn = function(handle) {
  __privateSet(this, _syncState, __privateGet(this, _syncState).markMustRefetch(handle));
  __privateSet(this, _connected, false);
  __privateGet(this, _pauseLock).releaseAllMatching(`snapshot`);
};
fetchSnapshotWithRetry_fn = async function(opts, retryCount, cacheBuster) {
  var _a, _b, _c;
  const method = (_b = (_a = opts.method) != null ? _a : this.options.subsetMethod) != null ? _b : `GET`;
  const usePost = method === `POST`;
  let fetchUrl;
  let fetchOptions;
  if (usePost) {
    const result = await __privateMethod(this, _ShapeStream_instances, constructUrl_fn).call(this, this.options.url, true);
    fetchUrl = result.fetchUrl;
    fetchOptions = {
      method: `POST`,
      headers: __spreadProps(__spreadValues({}, result.requestHeaders), {
        "Content-Type": `application/json`
      }),
      body: bigintSafeStringify(__privateMethod(this, _ShapeStream_instances, buildSubsetBody_fn).call(this, opts))
    };
  } else {
    const result = await __privateMethod(this, _ShapeStream_instances, constructUrl_fn).call(this, this.options.url, true, opts);
    fetchUrl = result.fetchUrl;
    fetchOptions = {
      headers: result.requestHeaders
    };
  }
  if (cacheBuster) {
    fetchUrl.searchParams.set(CACHE_BUSTER_QUERY_PARAM, cacheBuster);
    fetchUrl.searchParams.sort();
  }
  const usedHandle = __privateGet(this, _syncState).handle;
  let response;
  try {
    response = await __privateGet(this, _fetchClient2).call(this, fetchUrl.toString(), fetchOptions);
  } catch (e) {
    if (e instanceof FetchError && e.status === 409) {
      const nextRetryCount = retryCount + 1;
      if (nextRetryCount > __privateGet(this, _maxSnapshotRetries)) {
        throw new FetchError(502, void 0, void 0, {}, fetchUrl.toString(), `Snapshot request stuck in 409 retry loop after ${__privateGet(this, _maxSnapshotRetries)} attempts. This indicates a proxy/CDN misconfiguration. For more information visit the troubleshooting guide: ${TROUBLESHOOTING_URL}`);
      }
      if (usedHandle) {
        const shapeKey = canonicalShapeKey(fetchUrl);
        expiredShapesCache.markExpired(shapeKey, usedHandle);
      }
      const nextHandle = e.headers[SHAPE_HANDLE_HEADER];
      if (nextHandle) {
        __privateSet(this, _syncState, __privateGet(this, _syncState).withHandle(nextHandle));
      } else {
        console.warn(`[Electric] Received 409 response without a shape handle header. This likely indicates a proxy or CDN stripping required headers.`);
      }
      const nextCacheBuster = createCacheBuster();
      return __privateMethod(this, _ShapeStream_instances, fetchSnapshotWithRetry_fn).call(this, opts, nextRetryCount, nextCacheBuster);
    }
    throw e;
  }
  if (!response.ok) {
    throw await FetchError.fromResponse(response, fetchUrl.toString());
  }
  const schema = (_c = __privateGet(this, _syncState).schema) != null ? _c : getSchemaFromHeaders(response.headers, {
    required: true,
    url: fetchUrl.toString()
  });
  const { metadata, data: rawData } = await response.json();
  const data = __privateGet(this, _messageParser).parseSnapshotData(rawData, schema);
  const responseOffset = response.headers.get(CHUNK_LAST_OFFSET_HEADER) || null;
  const responseHandle = response.headers.get(SHAPE_HANDLE_HEADER);
  return {
    metadata,
    data,
    responseOffset,
    responseHandle
  };
};
buildSubsetBody_fn = function(opts) {
  var _a, _b, _c, _d;
  const body = {};
  if (opts.whereExpr) {
    body.where = compileExpression2(opts.whereExpr, (_a = this.options.columnMapper) == null ? void 0 : _a.encode);
    body.where_expr = opts.whereExpr;
  } else if (opts.where && typeof opts.where === `string`) {
    body.where = encodeWhereClause(opts.where, (_b = this.options.columnMapper) == null ? void 0 : _b.encode);
  }
  if (opts.params) {
    body.params = opts.params;
  }
  if (opts.limit !== void 0) {
    body.limit = opts.limit;
  }
  if (opts.offset !== void 0) {
    body.offset = opts.offset;
  }
  if (opts.orderByExpr) {
    body.order_by = compileOrderBy(opts.orderByExpr, (_c = this.options.columnMapper) == null ? void 0 : _c.encode);
    body.order_by_expr = opts.orderByExpr;
  } else if (opts.orderBy && typeof opts.orderBy === `string`) {
    body.order_by = encodeWhereClause(opts.orderBy, (_d = this.options.columnMapper) == null ? void 0 : _d.encode);
  }
  return body;
};
ShapeStream.Replica = {
  FULL: `full`,
  DEFAULT: `default`
};
function getSchemaFromHeaders(headers, options) {
  const schemaHeader = headers.get(SHAPE_SCHEMA_HEADER);
  if (!schemaHeader) {
    if ((options == null ? void 0 : options.required) && (options == null ? void 0 : options.url)) {
      throw new MissingHeadersError(options.url, [
        SHAPE_SCHEMA_HEADER
      ]);
    }
    return {};
  }
  return JSON.parse(schemaHeader);
}
function validateParams(params) {
  if (!params) return;
  const reservedParams = Object.keys(params).filter((key) => RESERVED_PARAMS.has(key));
  if (reservedParams.length > 0) {
    throw new ReservedParamError(reservedParams);
  }
}
var didWarnOnHttp = false;
function getNodeEnvSafely() {
  var _a;
  return typeof process !== `undefined` ? (_a = process.env) == null ? void 0 : _a.NODE_ENV : void 0;
}
function resolveUrlMaybe(url, base) {
  try {
    return new URL(url, base);
  } catch (e) {
    return void 0;
  }
}
function isBrowserEnvironment() {
  return typeof window !== `undefined`;
}
function getWindowLocationHref() {
  if (isBrowserEnvironment() && typeof window.location !== `undefined`) {
    return window.location.href;
  }
  return void 0;
}
function validateOptions(options) {
  var _a;
  if (!options.url) {
    throw new MissingShapeUrlError();
  }
  if (options.signal && !(options.signal instanceof AbortSignal)) {
    throw new InvalidSignalError();
  }
  if (options.liveRequestTimeoutMs !== void 0 && options.liveRequestTimeoutMs !== false && (!Number.isFinite(options.liveRequestTimeoutMs) || options.liveRequestTimeoutMs <= 0)) {
    throw new InvalidShapeOptionsError(`Invalid shape options: liveRequestTimeoutMs must be a positive finite number or false`);
  }
  if (options.offset !== void 0 && options.offset !== `-1` && options.offset !== `now` && !options.handle) {
    throw new MissingShapeHandleError();
  }
  validateParams(options.params);
  const nodeEnv = getNodeEnvSafely();
  const warnOnHttp = (_a = options.warnOnHttp) != null ? _a : nodeEnv !== `test`;
  if (warnOnHttp && !didWarnOnHttp && isBrowserEnvironment()) {
    if (typeof console !== `undefined`) {
      const baseUrl = getWindowLocationHref();
      const resolvedUrl = resolveUrlMaybe(options.url, baseUrl);
      const isHttp = (resolvedUrl == null ? void 0 : resolvedUrl.protocol) === `http:`;
      if (isHttp) {
        didWarnOnHttp = true;
        console.warn(`[Electric] Using HTTP (not HTTPS) typically limits browsers to ~6 concurrent connections per origin under HTTP/1.1. This can cause slow shapes and app freezes with multiple shapes. Use HTTPS for HTTP/2 support. See: https://electric-sql.com/r/electric-http2`);
      }
    }
  }
  return;
}
function setQueryParam(url, key, value) {
  if (value === void 0 || value == null) {
    return;
  } else if (typeof value === `string`) {
    url.searchParams.set(key, value);
  } else if (typeof value === `object`) {
    for (const [k, v] of Object.entries(value)) {
      url.searchParams.set(`${key}[${k}]`, v);
    }
  } else {
    url.searchParams.set(key, value.toString());
  }
}
function convertWhereParamsToObj(allPgParams) {
  if (Array.isArray(allPgParams.params)) {
    return __spreadProps(__spreadValues({}, allPgParams), {
      params: Object.fromEntries(allPgParams.params.map((v, i) => [
        i + 1,
        v
      ]))
    });
  }
  return allPgParams;
}
var _data;
var _subscribers2;
var _insertedKeys;
var _requestedSubSnapshots;
var _reexecuteSnapshotsPending;
var _status;
var _error2;
var _Shape_instances;
var process_fn;
var reexecuteSnapshots_fn;
var surfaceReexecuteError_fn;
var awaitUpToDate_fn;
var updateShapeStatus_fn;
var handleError_fn;
var notify_fn;
_data = /* @__PURE__ */ new WeakMap();
_subscribers2 = /* @__PURE__ */ new WeakMap();
_insertedKeys = /* @__PURE__ */ new WeakMap();
_requestedSubSnapshots = /* @__PURE__ */ new WeakMap();
_reexecuteSnapshotsPending = /* @__PURE__ */ new WeakMap();
_status = /* @__PURE__ */ new WeakMap();
_error2 = /* @__PURE__ */ new WeakMap();
_Shape_instances = /* @__PURE__ */ new WeakSet();
process_fn = function(messages) {
  let shouldNotify = false;
  messages.forEach((message) => {
    if (isChangeMessage(message)) {
      const wasUpToDate = __privateGet(this, _status) === `up-to-date`;
      __privateMethod(this, _Shape_instances, updateShapeStatus_fn).call(this, `syncing`);
      if (this.mode === `full`) {
        switch (message.headers.operation) {
          case `insert`:
            __privateGet(this, _data).set(message.key, message.value);
            if (wasUpToDate) shouldNotify = true;
            break;
          case `update`:
            __privateGet(this, _data).set(message.key, __spreadValues(__spreadValues({}, __privateGet(this, _data).get(message.key)), message.value));
            if (wasUpToDate) shouldNotify = true;
            break;
          case `delete`:
            __privateGet(this, _data).delete(message.key);
            if (wasUpToDate) shouldNotify = true;
            break;
        }
      } else {
        switch (message.headers.operation) {
          case `insert`:
            __privateGet(this, _insertedKeys).add(message.key);
            __privateGet(this, _data).set(message.key, message.value);
            if (wasUpToDate) shouldNotify = true;
            break;
          case `update`:
            if (__privateGet(this, _insertedKeys).has(message.key)) {
              __privateGet(this, _data).set(message.key, __spreadValues(__spreadValues({}, __privateGet(this, _data).get(message.key)), message.value));
              if (wasUpToDate) shouldNotify = true;
            }
            break;
          case `delete`:
            if (__privateGet(this, _insertedKeys).has(message.key)) {
              __privateGet(this, _data).delete(message.key);
              __privateGet(this, _insertedKeys).delete(message.key);
              if (wasUpToDate) shouldNotify = true;
            }
            break;
        }
      }
    }
    if (isControlMessage(message)) {
      switch (message.headers.control) {
        case `up-to-date`:
          if (__privateMethod(this, _Shape_instances, updateShapeStatus_fn).call(this, `up-to-date`)) shouldNotify = true;
          if (__privateGet(this, _reexecuteSnapshotsPending)) {
            __privateSet(this, _reexecuteSnapshotsPending, false);
            void __privateMethod(this, _Shape_instances, reexecuteSnapshots_fn).call(this);
          }
          break;
        case `must-refetch`:
          __privateGet(this, _data).clear();
          __privateGet(this, _insertedKeys).clear();
          __privateSet(this, _error2, false);
          __privateMethod(this, _Shape_instances, updateShapeStatus_fn).call(this, `syncing`);
          __privateSet(this, _reexecuteSnapshotsPending, true);
          break;
      }
    }
  });
  if (shouldNotify) __privateMethod(this, _Shape_instances, notify_fn).call(this);
};
reexecuteSnapshots_fn = async function() {
  try {
    await __privateMethod(this, _Shape_instances, awaitUpToDate_fn).call(this);
  } catch (e) {
    __privateMethod(this, _Shape_instances, surfaceReexecuteError_fn).call(this, e);
    return;
  }
  const results = await Promise.all(Array.from(__privateGet(this, _requestedSubSnapshots)).map(async (jsonParams) => {
    try {
      const snapshot = JSON.parse(jsonParams);
      await this.stream.requestSnapshot(snapshot);
      return void 0;
    } catch (e) {
      return e;
    }
  }));
  const firstError = results.find((e) => e !== void 0);
  if (firstError !== void 0) __privateMethod(this, _Shape_instances, surfaceReexecuteError_fn).call(this, firstError);
};
surfaceReexecuteError_fn = function(e) {
  if (e instanceof FetchError) {
    __privateSet(this, _error2, e);
  } else if (e instanceof Error) {
    __privateSet(this, _error2, new FetchError(0, e.message, void 0, {}, ``, e.message));
  } else {
    __privateSet(this, _error2, new FetchError(0, String(e), void 0, {}, ``, String(e)));
  }
  __privateMethod(this, _Shape_instances, notify_fn).call(this);
};
awaitUpToDate_fn = async function() {
  if (__privateGet(this, _error2)) throw __privateGet(this, _error2);
  if (this.stream.isUpToDate) return;
  if (this.stream.error) throw this.stream.error;
  await new Promise((resolve, reject) => {
    let settled = false;
    let interval;
    let unsub;
    const done = (action) => {
      if (settled) return;
      settled = true;
      clearInterval(interval);
      unsub == null ? void 0 : unsub();
      action();
    };
    const check2 = () => {
      if (this.stream.isUpToDate) return done(resolve);
      const streamError = this.stream.error;
      if (streamError) return done(() => reject(streamError));
      if (__privateGet(this, _error2)) {
        const err = __privateGet(this, _error2);
        return done(() => reject(err));
      }
    };
    interval = setInterval(check2, 10);
    unsub = this.stream.subscribe(() => check2(), (err) => done(() => reject(err)));
    check2();
  });
};
updateShapeStatus_fn = function(status) {
  const stateChanged = __privateGet(this, _status) !== status;
  __privateSet(this, _status, status);
  return stateChanged && status === `up-to-date`;
};
handleError_fn = function(e) {
  if (e instanceof FetchError) {
    __privateSet(this, _error2, e);
    __privateMethod(this, _Shape_instances, notify_fn).call(this);
  }
};
notify_fn = function() {
  __privateGet(this, _subscribers2).forEach((callback) => {
    callback({
      value: this.currentValue,
      rows: this.currentRows
    });
  });
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+store@0.9.3/node_modules/@tanstack/store/dist/esm/alien.js
var ReactiveFlags = /* @__PURE__ */ ((ReactiveFlags2) => {
  ReactiveFlags2[ReactiveFlags2["None"] = 0] = "None";
  ReactiveFlags2[ReactiveFlags2["Mutable"] = 1] = "Mutable";
  ReactiveFlags2[ReactiveFlags2["Watching"] = 2] = "Watching";
  ReactiveFlags2[ReactiveFlags2["RecursedCheck"] = 4] = "RecursedCheck";
  ReactiveFlags2[ReactiveFlags2["Recursed"] = 8] = "Recursed";
  ReactiveFlags2[ReactiveFlags2["Dirty"] = 16] = "Dirty";
  ReactiveFlags2[ReactiveFlags2["Pending"] = 32] = "Pending";
  return ReactiveFlags2;
})(ReactiveFlags || {});
// @__NO_SIDE_EFFECTS__
function createReactiveSystem({ update, notify, unwatched }) {
  return {
    link: link2,
    unlink: unlink2,
    propagate: propagate2,
    checkDirty: checkDirty2,
    shallowPropagate: shallowPropagate2
  };
  function link2(dep, sub, version) {
    const prevDep = sub.depsTail;
    if (prevDep !== void 0 && prevDep.dep === dep) {
      return;
    }
    const nextDep = prevDep !== void 0 ? prevDep.nextDep : sub.deps;
    if (nextDep !== void 0 && nextDep.dep === dep) {
      nextDep.version = version;
      sub.depsTail = nextDep;
      return;
    }
    const prevSub = dep.subsTail;
    if (prevSub !== void 0 && prevSub.version === version && prevSub.sub === sub) {
      return;
    }
    const newLink = sub.depsTail = dep.subsTail = {
      version,
      dep,
      sub,
      prevDep,
      nextDep,
      prevSub,
      nextSub: void 0
    };
    if (nextDep !== void 0) {
      nextDep.prevDep = newLink;
    }
    if (prevDep !== void 0) {
      prevDep.nextDep = newLink;
    } else {
      sub.deps = newLink;
    }
    if (prevSub !== void 0) {
      prevSub.nextSub = newLink;
    } else {
      dep.subs = newLink;
    }
  }
  function unlink2(link22, sub = link22.sub) {
    const dep = link22.dep;
    const prevDep = link22.prevDep;
    const nextDep = link22.nextDep;
    const nextSub = link22.nextSub;
    const prevSub = link22.prevSub;
    if (nextDep !== void 0) {
      nextDep.prevDep = prevDep;
    } else {
      sub.depsTail = prevDep;
    }
    if (prevDep !== void 0) {
      prevDep.nextDep = nextDep;
    } else {
      sub.deps = nextDep;
    }
    if (nextSub !== void 0) {
      nextSub.prevSub = prevSub;
    } else {
      dep.subsTail = prevSub;
    }
    if (prevSub !== void 0) {
      prevSub.nextSub = nextSub;
    } else if ((dep.subs = nextSub) === void 0) {
      unwatched(dep);
    }
    return nextDep;
  }
  function propagate2(link22) {
    let next = link22.nextSub;
    let stack;
    top: do {
      const sub = link22.sub;
      let flags = sub.flags;
      if (!(flags & (4 | 8 | 16 | 32))) {
        sub.flags = flags | 32;
      } else if (!(flags & (4 | 8))) {
        flags = 0;
      } else if (!(flags & 4)) {
        sub.flags = flags & -9 | 32;
      } else if (!(flags & (16 | 32)) && isValidLink(link22, sub)) {
        sub.flags = flags | (8 | 32);
        flags &= 1;
      } else {
        flags = 0;
      }
      if (flags & 2) {
        notify(sub);
      }
      if (flags & 1) {
        const subSubs = sub.subs;
        if (subSubs !== void 0) {
          const nextSub = (link22 = subSubs).nextSub;
          if (nextSub !== void 0) {
            stack = {
              value: next,
              prev: stack
            };
            next = nextSub;
          }
          continue;
        }
      }
      if ((link22 = next) !== void 0) {
        next = link22.nextSub;
        continue;
      }
      while (stack !== void 0) {
        link22 = stack.value;
        stack = stack.prev;
        if (link22 !== void 0) {
          next = link22.nextSub;
          continue top;
        }
      }
      break;
    } while (true);
  }
  function checkDirty2(link22, sub) {
    let stack;
    let checkDepth = 0;
    let dirty = false;
    top: do {
      const dep = link22.dep;
      const flags = dep.flags;
      if (sub.flags & 16) {
        dirty = true;
      } else if ((flags & (1 | 16)) === (1 | 16)) {
        if (update(dep)) {
          const subs = dep.subs;
          if (subs.nextSub !== void 0) {
            shallowPropagate2(subs);
          }
          dirty = true;
        }
      } else if ((flags & (1 | 32)) === (1 | 32)) {
        if (link22.nextSub !== void 0 || link22.prevSub !== void 0) {
          stack = {
            value: link22,
            prev: stack
          };
        }
        link22 = dep.deps;
        sub = dep;
        ++checkDepth;
        continue;
      }
      if (!dirty) {
        const nextDep = link22.nextDep;
        if (nextDep !== void 0) {
          link22 = nextDep;
          continue;
        }
      }
      while (checkDepth--) {
        const firstSub = sub.subs;
        const hasMultipleSubs = firstSub.nextSub !== void 0;
        if (hasMultipleSubs) {
          link22 = stack.value;
          stack = stack.prev;
        } else {
          link22 = firstSub;
        }
        if (dirty) {
          if (update(sub)) {
            if (hasMultipleSubs) {
              shallowPropagate2(firstSub);
            }
            sub = link22.sub;
            continue;
          }
          dirty = false;
        } else {
          sub.flags &= -33;
        }
        sub = link22.sub;
        const nextDep = link22.nextDep;
        if (nextDep !== void 0) {
          link22 = nextDep;
          continue top;
        }
      }
      return dirty;
    } while (true);
  }
  function shallowPropagate2(link22) {
    do {
      const sub = link22.sub;
      const flags = sub.flags;
      if ((flags & (32 | 16)) === 32) {
        sub.flags = flags | 16;
        if ((flags & (2 | 4)) === 2) {
          notify(sub);
        }
      }
    } while ((link22 = link22.nextSub) !== void 0);
  }
  function isValidLink(checkLink, sub) {
    let link22 = sub.depsTail;
    while (link22 !== void 0) {
      if (link22 === checkLink) {
        return true;
      }
      link22 = link22.prevDep;
    }
    return false;
  }
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+store@0.9.3/node_modules/@tanstack/store/dist/esm/atom.js
function toObserver(nextHandler, errorHandler, completionHandler) {
  const isObserver = typeof nextHandler === "object";
  const self = isObserver ? nextHandler : void 0;
  return {
    next: (isObserver ? nextHandler.next : nextHandler)?.bind(self),
    error: (isObserver ? nextHandler.error : errorHandler)?.bind(self),
    complete: (isObserver ? nextHandler.complete : completionHandler)?.bind(self)
  };
}
var queuedEffects = [];
var cycle = 0;
var { link, unlink, propagate, checkDirty, shallowPropagate } = createReactiveSystem({
  update(atom) {
    return atom._update();
  },
  // eslint-disable-next-line no-shadow
  notify(effect2) {
    queuedEffects[queuedEffectsLength++] = effect2;
    effect2.flags &= ~ReactiveFlags.Watching;
  },
  unwatched(atom) {
    if (atom.depsTail !== void 0) {
      atom.depsTail = void 0;
      atom.flags = ReactiveFlags.Mutable | ReactiveFlags.Dirty;
      purgeDeps(atom);
    }
  }
});
var notifyIndex = 0;
var queuedEffectsLength = 0;
var activeSub;
var batchDepth = 0;
function purgeDeps(sub) {
  const depsTail = sub.depsTail;
  let dep = depsTail !== void 0 ? depsTail.nextDep : sub.deps;
  while (dep !== void 0) {
    dep = unlink(dep, sub);
  }
}
function flush() {
  if (batchDepth > 0) {
    return;
  }
  while (notifyIndex < queuedEffectsLength) {
    const effect2 = queuedEffects[notifyIndex];
    queuedEffects[notifyIndex++] = void 0;
    effect2.notify();
  }
  notifyIndex = 0;
  queuedEffectsLength = 0;
}
function createAtom(valueOrFn, options) {
  const isComputed = typeof valueOrFn === "function";
  const getter = valueOrFn;
  const atom = {
    _snapshot: isComputed ? void 0 : valueOrFn,
    subs: void 0,
    subsTail: void 0,
    deps: void 0,
    depsTail: void 0,
    flags: isComputed ? ReactiveFlags.None : ReactiveFlags.Mutable,
    get() {
      if (activeSub !== void 0) {
        link(atom, activeSub, cycle);
      }
      return atom._snapshot;
    },
    subscribe(observerOrFn) {
      const obs = toObserver(observerOrFn);
      const observed = {
        current: false
      };
      const e = effect(() => {
        atom.get();
        if (!observed.current) {
          observed.current = true;
        } else {
          obs.next?.(atom._snapshot);
        }
      });
      return {
        unsubscribe: () => {
          e.stop();
        }
      };
    },
    _update(getValue3) {
      const prevSub = activeSub;
      const compare = options?.compare ?? Object.is;
      if (isComputed) {
        activeSub = atom;
        ++cycle;
        atom.depsTail = void 0;
      } else if (getValue3 === void 0) {
        return false;
      }
      if (isComputed) {
        atom.flags = ReactiveFlags.Mutable | ReactiveFlags.RecursedCheck;
      }
      try {
        const oldValue = atom._snapshot;
        const newValue = typeof getValue3 === "function" ? getValue3(oldValue) : getValue3 === void 0 && isComputed ? getter(oldValue) : getValue3;
        if (oldValue === void 0 || !compare(oldValue, newValue)) {
          atom._snapshot = newValue;
          return true;
        }
        return false;
      } finally {
        activeSub = prevSub;
        if (isComputed) {
          atom.flags &= ~ReactiveFlags.RecursedCheck;
        }
        purgeDeps(atom);
      }
    }
  };
  if (isComputed) {
    atom.flags = ReactiveFlags.Mutable | ReactiveFlags.Dirty;
    atom.get = function() {
      const flags = atom.flags;
      if (flags & ReactiveFlags.Dirty || flags & ReactiveFlags.Pending && checkDirty(atom.deps, atom)) {
        if (atom._update()) {
          const subs = atom.subs;
          if (subs !== void 0) {
            shallowPropagate(subs);
          }
        }
      } else if (flags & ReactiveFlags.Pending) {
        atom.flags = flags & ~ReactiveFlags.Pending;
      }
      if (activeSub !== void 0) {
        link(atom, activeSub, cycle);
      }
      return atom._snapshot;
    };
  } else {
    atom.set = function(valueOrFn2) {
      if (atom._update(valueOrFn2)) {
        const subs = atom.subs;
        if (subs !== void 0) {
          propagate(subs);
          shallowPropagate(subs);
          flush();
        }
      }
    };
  }
  return atom;
}
function effect(fn) {
  const run = () => {
    const prevSub = activeSub;
    activeSub = effectObj;
    ++cycle;
    effectObj.depsTail = void 0;
    effectObj.flags = ReactiveFlags.Watching | ReactiveFlags.RecursedCheck;
    try {
      return fn();
    } finally {
      activeSub = prevSub;
      effectObj.flags &= ~ReactiveFlags.RecursedCheck;
      purgeDeps(effectObj);
    }
  };
  const effectObj = {
    deps: void 0,
    depsTail: void 0,
    subs: void 0,
    subsTail: void 0,
    flags: ReactiveFlags.Watching | ReactiveFlags.RecursedCheck,
    notify() {
      const flags = this.flags;
      if (flags & ReactiveFlags.Dirty || flags & ReactiveFlags.Pending && checkDirty(this.deps, this)) {
        run();
      } else {
        this.flags = ReactiveFlags.Watching;
      }
    },
    stop() {
      this.flags = ReactiveFlags.None;
      this.depsTail = void 0;
      purgeDeps(this);
    }
  };
  run();
  return effectObj;
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+store@0.9.3/node_modules/@tanstack/store/dist/esm/store.js
var Store = class {
  constructor(valueOrFn) {
    this.atom = createAtom(valueOrFn);
  }
  setState(updater) {
    this.atom.set(updater);
  }
  get state() {
    return this.atom.get();
  }
  get() {
    return this.state;
  }
  subscribe(observerOrFn) {
    return this.atom.subscribe(toObserver(observerOrFn));
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+electric-db-collection@0.3.15/node_modules/@tanstack/electric-db-collection/dist/esm/electric.js
var import_debug2 = __toESM(require_browser());

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+electric-db-collection@0.3.15/node_modules/@tanstack/electric-db-collection/dist/esm/errors.js
var ElectricDBCollectionError = class extends TanStackDBError {
  constructor(message, collectionId) {
    super(`${collectionId ? `[${collectionId}] ` : ``}${message}`);
    this.name = `ElectricDBCollectionError`;
  }
};
var ExpectedNumberInAwaitTxIdError = class extends ElectricDBCollectionError {
  constructor(txIdType, collectionId) {
    super(`Expected number in awaitTxId, received ${txIdType}`, collectionId);
    this.name = `ExpectedNumberInAwaitTxIdError`;
  }
};
var TimeoutWaitingForTxIdError = class extends ElectricDBCollectionError {
  constructor(txId, collectionId) {
    super(`Timeout waiting for txId: ${txId}`, collectionId);
    this.name = `TimeoutWaitingForTxIdError`;
  }
};
var TimeoutWaitingForMatchError = class extends ElectricDBCollectionError {
  constructor(collectionId) {
    super(`Timeout waiting for custom match function`, collectionId);
    this.name = `TimeoutWaitingForMatchError`;
  }
};
var StreamAbortedError = class extends ElectricDBCollectionError {
  constructor(collectionId) {
    super(`Stream aborted`, collectionId);
    this.name = `StreamAbortedError`;
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+electric-db-collection@0.3.15/node_modules/@tanstack/electric-db-collection/dist/esm/pg-serializer.js
function serialize(value) {
  if (value === null || value === void 0) {
    return ``;
  }
  if (typeof value === `string`) {
    return value;
  }
  if (typeof value === `number`) {
    return value.toString();
  }
  if (typeof value === `bigint`) {
    return value.toString();
  }
  if (typeof value === `boolean`) {
    return value ? `true` : `false`;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    const elements = value.map((item) => {
      if (item === null || item === void 0) {
        return `NULL`;
      }
      if (typeof item === `string`) {
        const escaped = item.replace(/\\/g, `\\\\`).replace(/"/g, `\\"`);
        return `"${escaped}"`;
      }
      return serialize(item);
    });
    return `{${elements.join(`,`)}}`;
  }
  let valueStr;
  try {
    valueStr = JSON.stringify(value);
  } catch {
    valueStr = String(value);
  }
  throw new Error(`Cannot serialize value: ${valueStr}`);
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+electric-db-collection@0.3.15/node_modules/@tanstack/electric-db-collection/dist/esm/sql-compiler.js
function compileSQL(options, compileOptions) {
  const { where, orderBy: orderBy2, limit } = options;
  const encodeColumnName = compileOptions?.encodeColumnName;
  const params = [];
  const compiledSQL = {
    params
  };
  if (where) {
    compiledSQL.where = compileBasicExpression(where, params, encodeColumnName);
  }
  if (orderBy2) {
    compiledSQL.orderBy = compileOrderBy2(orderBy2, params, encodeColumnName);
  }
  if (limit) {
    compiledSQL.limit = limit;
  }
  if (!where) {
    compiledSQL.where = `true = true`;
  }
  const paramsRecord = params.reduce((acc, param, index) => {
    const serialized = serialize(param);
    if (param != null) {
      acc[`${index + 1}`] = serialized;
    }
    return acc;
  }, {});
  return {
    ...compiledSQL,
    params: paramsRecord
  };
}
function quoteIdentifier2(name, encodeColumnName) {
  const columnName = encodeColumnName ? encodeColumnName(name) : name;
  return `"${columnName}"`;
}
function compileBasicExpression(exp, params, encodeColumnName) {
  switch (exp.type) {
    case `val`:
      params.push(exp.value);
      return `$${params.length}`;
    case `ref`:
      if (exp.path.length !== 1) {
        throw new Error(`Compiler can't handle nested properties: ${exp.path.join(`.`)}`);
      }
      return quoteIdentifier2(exp.path[0], encodeColumnName);
    case `func`:
      return compileFunction3(exp, params, encodeColumnName);
    default:
      throw new Error(`Unknown expression type`);
  }
}
function compileOrderBy2(orderBy2, params, encodeColumnName) {
  const compiledOrderByClauses = orderBy2.map((clause) => compileOrderByClause(clause, params, encodeColumnName));
  return compiledOrderByClauses.join(`,`);
}
function compileOrderByClause(clause, params, encodeColumnName) {
  const { expression, compareOptions } = clause;
  let sql = compileBasicExpression(expression, params, encodeColumnName);
  if (compareOptions.direction === `desc`) {
    sql = `${sql} DESC`;
  }
  if (compareOptions.nulls === `first`) {
    sql = `${sql} NULLS FIRST`;
  }
  if (compareOptions.nulls === `last`) {
    sql = `${sql} NULLS LAST`;
  }
  return sql;
}
function isNullValue(exp) {
  return exp.type === `val` && (exp.value === null || exp.value === void 0);
}
function compileFunction3(exp, params = [], encodeColumnName) {
  const { name, args } = exp;
  const opName = getOpName(name);
  if (isComparisonOp(name)) {
    const nullArgIndex = args.findIndex((arg) => isNullValue(arg));
    if (nullArgIndex !== -1) {
      throw new Error(`Cannot use null/undefined value with '${name}' operator. Comparisons with null always evaluate to UNKNOWN in SQL. Use isNull() or isUndefined() to check for null values, or filter out null values before building the query.`);
    }
  }
  const compiledArgs = args.map((arg) => compileBasicExpression(arg, params, encodeColumnName));
  if (name === `isNull` || name === `isUndefined`) {
    if (compiledArgs.length !== 1) {
      throw new Error(`${name} expects 1 argument`);
    }
    return `${compiledArgs[0]} ${opName}`;
  }
  if (name === `not`) {
    if (compiledArgs.length !== 1) {
      throw new Error(`NOT expects 1 argument`);
    }
    const arg = args[0];
    if (arg && arg.type === `func`) {
      const funcArg = arg;
      if (funcArg.name === `isNull` || funcArg.name === `isUndefined`) {
        const innerArg = compileBasicExpression(funcArg.args[0], params, encodeColumnName);
        return `${innerArg} IS NOT NULL`;
      }
    }
    return `${opName} (${compiledArgs[0]})`;
  }
  if (isBinaryOp(name)) {
    if ((name === `and` || name === `or`) && compiledArgs.length > 2) {
      return compiledArgs.map((arg) => `(${arg})`).join(` ${opName} `);
    }
    if (compiledArgs.length !== 2) {
      throw new Error(`Binary operator ${name} expects 2 arguments`);
    }
    const [lhs, rhs] = compiledArgs;
    if (isBooleanComparisonOp(name)) {
      const lhsArg = args[0];
      const rhsArg = args[1];
      if (rhsArg && rhsArg.type === `val` && typeof rhsArg.value === `boolean`) {
        const boolValue = rhsArg.value;
        params.pop();
        if (name === `lt`) {
          if (boolValue === true) {
            params.push(false);
            return `${lhs} = $${params.length}`;
          } else {
            return `false`;
          }
        } else if (name === `gt`) {
          if (boolValue === false) {
            params.push(true);
            return `${lhs} = $${params.length}`;
          } else {
            return `false`;
          }
        } else if (name === `lte`) {
          if (boolValue === true) {
            return `true`;
          } else {
            params.push(false);
            return `${lhs} = $${params.length}`;
          }
        } else if (name === `gte`) {
          if (boolValue === false) {
            return `true`;
          } else {
            params.push(true);
            return `${lhs} = $${params.length}`;
          }
        }
      }
      if (lhsArg && lhsArg.type === `val` && typeof lhsArg.value === `boolean`) {
        const boolValue = lhsArg.value;
        params.pop();
        params.pop();
        const rhsCompiled = compileBasicExpression(rhsArg, params, encodeColumnName);
        if (name === `lt`) {
          if (boolValue === true) {
            return `false`;
          } else {
            params.push(true);
            return `${rhsCompiled} = $${params.length}`;
          }
        } else if (name === `gt`) {
          if (boolValue === true) {
            params.push(false);
            return `${rhsCompiled} = $${params.length}`;
          } else {
            return `false`;
          }
        } else if (name === `lte`) {
          if (boolValue === false) {
            return `true`;
          } else {
            params.push(true);
            return `${rhsCompiled} = $${params.length}`;
          }
        } else if (name === `gte`) {
          if (boolValue === true) {
            return `true`;
          } else {
            params.push(false);
            return `${rhsCompiled} = $${params.length}`;
          }
        }
      }
    }
    if (name === `in`) {
      return `${lhs} ${opName}(${rhs})`;
    }
    return `${lhs} ${opName} ${rhs}`;
  }
  return `${opName}(${compiledArgs.join(`,`)})`;
}
function isBinaryOp(name) {
  const binaryOps = [
    `eq`,
    `gt`,
    `gte`,
    `lt`,
    `lte`,
    `and`,
    `or`,
    `in`,
    `like`,
    `ilike`
  ];
  return binaryOps.includes(name);
}
function isComparisonOp(name) {
  const comparisonOps = [
    `eq`,
    `gt`,
    `gte`,
    `lt`,
    `lte`,
    `like`,
    `ilike`
  ];
  return comparisonOps.includes(name);
}
function isBooleanComparisonOp(name) {
  return [
    `gt`,
    `gte`,
    `lt`,
    `lte`
  ].includes(name);
}
function getOpName(name) {
  const opNames = {
    eq: `=`,
    gt: `>`,
    gte: `>=`,
    lt: `<`,
    lte: `<=`,
    add: `+`,
    and: `AND`,
    or: `OR`,
    not: `NOT`,
    isUndefined: `IS NULL`,
    isNull: `IS NULL`,
    in: `= ANY`,
    // Use = ANY syntax for array parameters
    like: `LIKE`,
    ilike: `ILIKE`,
    upper: `UPPER`,
    lower: `LOWER`,
    length: `LENGTH`,
    concat: `CONCAT`,
    coalesce: `COALESCE`
  };
  const opName = opNames[name];
  if (!opName) {
    throw new Error(`Unknown operator/function: ${name}`);
  }
  return opName;
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+electric-db-collection@0.3.15/node_modules/@tanstack/electric-db-collection/dist/esm/tag-index.js
var NON_PARTICIPATING = null;
function parseTag(tag) {
  return tag.split(`/`).map((s) => s === `` ? NON_PARTICIPATING : s);
}
function getValue2(tag, position) {
  if (position >= tag.length) {
    throw new Error(`Position out of bounds`);
  }
  return tag[position];
}
function getPositionalValue(pattern) {
  return pattern;
}
function getTagLength(tag) {
  return tag.length;
}
function tagMatchesPattern(tag, pattern) {
  const { pos, value } = getPositionalValue(pattern);
  const tagValue = getValue2(tag, pos);
  return tagValue === value;
}
function addTagToIndex(tag, rowId, index, tagLength) {
  for (let i = 0; i < tagLength; i++) {
    const value = getValue2(tag, i);
    if (value !== NON_PARTICIPATING) {
      const positionIndex = index[i];
      if (!positionIndex.has(value)) {
        positionIndex.set(value, /* @__PURE__ */ new Set());
      }
      const tags = positionIndex.get(value);
      tags.add(rowId);
    }
  }
}
function removeTagFromIndex(tag, rowId, index, tagLength) {
  for (let i = 0; i < tagLength; i++) {
    const value = getValue2(tag, i);
    if (value !== NON_PARTICIPATING) {
      const positionIndex = index[i];
      if (positionIndex) {
        const rowSet = positionIndex.get(value);
        if (rowSet) {
          rowSet.delete(rowId);
          if (rowSet.size === 0) {
            positionIndex.delete(value);
          }
        }
      }
    }
  }
}
function findRowsMatchingPattern(pattern, index) {
  const { pos, value } = getPositionalValue(pattern);
  const positionIndex = index[pos];
  const rowSet = positionIndex?.get(value);
  return rowSet ?? /* @__PURE__ */ new Set();
}
function deriveDisjunctPositions(tags) {
  return tags.map((tag) => {
    const positions = [];
    for (let i = 0; i < tag.length; i++) {
      if (tag[i] !== NON_PARTICIPATING) {
        positions.push(i);
      }
    }
    return positions;
  });
}
function rowVisible(activeConditions, disjunctPositions) {
  return disjunctPositions.some((positions) => positions.every((pos) => activeConditions[pos]));
}
function isMoveOutMessage(message) {
  return message.headers.event === `move-out`;
}
function isMoveInMessage(message) {
  return message.headers.event === `move-in`;
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+electric-db-collection@0.3.15/node_modules/@tanstack/electric-db-collection/dist/esm/electric.js
var debug2 = import_debug2.default.debug(`ts/db:electric`);
var FORCE_DISCONNECT_AND_REFRESH_TIMEOUT_MS = 250;
var ELECTRIC_TEST_HOOKS = /* @__PURE__ */ Symbol(`electricTestHooks`);
function isUpToDateMessage2(message) {
  return isControlMessage(message) && message.headers.control === `up-to-date`;
}
function isMustRefetchMessage(message) {
  return isControlMessage(message) && message.headers.control === `must-refetch`;
}
function isSnapshotEndMessage(message) {
  return isControlMessage(message) && message.headers.control === `snapshot-end`;
}
function isSubsetEndMessage(message) {
  return isControlMessage(message) && message.headers.control === `subset-end`;
}
function parseSnapshotMessage(message) {
  return {
    xmin: message.headers.xmin,
    xmax: message.headers.xmax,
    xip_list: message.headers.xip_list
  };
}
function toStableSerializable(value) {
  if (value == null) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => toStableSerializable(entry));
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === `object`) {
    const record = value;
    const stableRecord = {};
    const keys = Object.keys(record).sort((left, right) => left < right ? -1 : left > right ? 1 : 0);
    for (const key of keys) {
      stableRecord[key] = toStableSerializable(record[key]);
    }
    return stableRecord;
  }
  return value;
}
function getStableShapeIdentity(shapeOptions) {
  return JSON.stringify(toStableSerializable({
    url: shapeOptions.url,
    params: shapeOptions.params ?? null
  }));
}
function hasTxids(message) {
  return `txids` in message.headers && Array.isArray(message.headers.txids);
}
function createLoadSubsetDedupe({ stream, syncMode, isBufferingInitialSync, begin, write, commit, collectionId, encodeColumnName, signal }) {
  if (syncMode === `eager`) {
    return null;
  }
  const compileOptions = encodeColumnName ? {
    encodeColumnName
  } : void 0;
  const logPrefix = collectionId ? `[${collectionId}] ` : ``;
  function handleSnapshotError(error, operation) {
    if (signal.aborted) {
      debug2(`${logPrefix}Ignoring ${operation} error during cleanup: %o`, error);
      return true;
    }
    debug2(`${logPrefix}Error in ${operation}: %o`, error);
    return false;
  }
  const loadSubset = async (opts) => {
    if (isBufferingInitialSync()) {
      const snapshotParams = compileSQL(opts, compileOptions);
      try {
        const { data: rows } = await stream.fetchSnapshot(snapshotParams);
        if (!isBufferingInitialSync()) {
          debug2(`${logPrefix}Ignoring snapshot - sync completed while fetching`);
          return;
        }
        if (rows.length > 0) {
          begin();
          for (const row of rows) {
            write({
              type: `insert`,
              value: row.value,
              metadata: {
                ...row.headers
              }
            });
          }
          commit();
          debug2(`${logPrefix}Applied snapshot with ${rows.length} rows`);
        }
      } catch (error) {
        if (handleSnapshotError(error, `fetchSnapshot`)) {
          return;
        }
        throw error;
      }
      return;
    }
    if (syncMode === `progressive`) {
      return;
    }
    const { cursor, where, orderBy: orderBy2, limit } = opts;
    if (stream.isUpToDate) {
      let timeoutId;
      try {
        await Promise.race([
          stream.forceDisconnectAndRefresh(),
          new Promise((resolve) => {
            timeoutId = setTimeout(resolve, FORCE_DISCONNECT_AND_REFRESH_TIMEOUT_MS);
          })
        ]);
      } catch (error) {
        if (handleSnapshotError(error, `forceDisconnectAndRefresh`)) {
          return;
        }
        debug2(`${logPrefix}forceDisconnectAndRefresh failed, proceeding to requestSnapshot: %o`, error);
      } finally {
        clearTimeout(timeoutId);
      }
    }
    try {
      if (cursor) {
        const whereCurrentOpts = {
          where: where ? and(where, cursor.whereCurrent) : cursor.whereCurrent,
          orderBy: orderBy2
        };
        const whereCurrentParams = compileSQL(whereCurrentOpts, compileOptions);
        const whereFromOpts = {
          where: where ? and(where, cursor.whereFrom) : cursor.whereFrom,
          orderBy: orderBy2,
          limit
        };
        const whereFromParams = compileSQL(whereFromOpts, compileOptions);
        debug2(`${logPrefix}Requesting cursor.whereCurrent snapshot (all ties)`);
        debug2(`${logPrefix}Requesting cursor.whereFrom snapshot (with limit ${limit})`);
        await Promise.all([
          stream.requestSnapshot(whereCurrentParams),
          stream.requestSnapshot(whereFromParams)
        ]);
      } else {
        const snapshotParams = compileSQL(opts, compileOptions);
        await stream.requestSnapshot(snapshotParams);
      }
    } catch (error) {
      if (handleSnapshotError(error, `requestSnapshot`)) {
        return;
      }
      throw error;
    }
  };
  return new DeduplicatedLoadSubset({
    loadSubset
  });
}
function electricCollectionOptions(config) {
  const seenTxids = new Store(/* @__PURE__ */ new Set([]));
  const seenSnapshots = new Store([]);
  const internalSyncMode = config.syncMode ?? `eager`;
  const finalSyncMode = internalSyncMode === `progressive` ? `on-demand` : internalSyncMode;
  const pendingMatches = new Store(/* @__PURE__ */ new Map());
  const currentBatchMessages = new Store([]);
  const batchCommitted = new Store(false);
  const removePendingMatches = (matchIds) => {
    if (matchIds.length > 0) {
      pendingMatches.setState((current) => {
        const newMatches = new Map(current);
        matchIds.forEach((id) => newMatches.delete(id));
        return newMatches;
      });
    }
  };
  const resolveMatchedPendingMatches = () => {
    const matchesToResolve = [];
    pendingMatches.state.forEach((match, matchId) => {
      if (match.matched) {
        clearTimeout(match.timeoutId);
        match.resolve(true);
        matchesToResolve.push(matchId);
        debug2(`${config.id ? `[${config.id}] ` : ``}awaitMatch resolved on up-to-date for match %s`, matchId);
      }
    });
    removePendingMatches(matchesToResolve);
  };
  const sync = createElectricSync(config.shapeOptions, {
    seenTxids,
    seenSnapshots,
    syncMode: internalSyncMode,
    pendingMatches,
    currentBatchMessages,
    batchCommitted,
    removePendingMatches,
    resolveMatchedPendingMatches,
    collectionId: config.id,
    testHooks: config[ELECTRIC_TEST_HOOKS]
  });
  const awaitTxId = async (txId, timeout = 5e3) => {
    debug2(`${config.id ? `[${config.id}] ` : ``}awaitTxId called with txid %d`, txId);
    if (typeof txId !== `number`) {
      throw new ExpectedNumberInAwaitTxIdError(typeof txId, config.id);
    }
    const hasTxid = seenTxids.state.has(txId);
    if (hasTxid) return true;
    const hasSnapshot = seenSnapshots.state.some((snapshot) => isVisibleInSnapshot(txId, snapshot));
    if (hasSnapshot) return true;
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timeoutId);
        subSeenTxids.unsubscribe();
        subSeenSnapshots.unsubscribe();
      };
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new TimeoutWaitingForTxIdError(txId, config.id));
      }, timeout);
      const subSeenTxids = seenTxids.subscribe(() => {
        if (seenTxids.state.has(txId)) {
          debug2(`${config.id ? `[${config.id}] ` : ``}awaitTxId found match for txid %o`, txId);
          cleanup();
          resolve(true);
        }
      });
      const subSeenSnapshots = seenSnapshots.subscribe(() => {
        const visibleSnapshot = seenSnapshots.state.find((snapshot) => isVisibleInSnapshot(txId, snapshot));
        if (visibleSnapshot) {
          debug2(`${config.id ? `[${config.id}] ` : ``}awaitTxId found match for txid %o in snapshot %o`, txId, visibleSnapshot);
          cleanup();
          resolve(true);
        }
      });
    });
  };
  const awaitMatch = async (matchFn, timeout = 3e3) => {
    debug2(`${config.id ? `[${config.id}] ` : ``}awaitMatch called with custom function`);
    return new Promise((resolve, reject) => {
      const matchId = Math.random().toString(36);
      const cleanupMatch = () => {
        pendingMatches.setState((current) => {
          const newMatches = new Map(current);
          newMatches.delete(matchId);
          return newMatches;
        });
      };
      const onTimeout = () => {
        cleanupMatch();
        reject(new TimeoutWaitingForMatchError(config.id));
      };
      const timeoutId = setTimeout(onTimeout, timeout);
      const checkMatch = (message) => {
        if (matchFn(message)) {
          debug2(`${config.id ? `[${config.id}] ` : ``}awaitMatch found matching message, waiting for up-to-date`);
          pendingMatches.setState((current) => {
            const newMatches = new Map(current);
            const existing = newMatches.get(matchId);
            if (existing) {
              newMatches.set(matchId, {
                ...existing,
                matched: true
              });
            }
            return newMatches;
          });
          return true;
        }
        return false;
      };
      for (const message of currentBatchMessages.state) {
        if (matchFn(message)) {
          if (batchCommitted.state) {
            debug2(`${config.id ? `[${config.id}] ` : ``}awaitMatch found immediate match in committed batch, resolving immediately`);
            clearTimeout(timeoutId);
            resolve(true);
            return;
          }
          debug2(`${config.id ? `[${config.id}] ` : ``}awaitMatch found immediate match in current batch, waiting for up-to-date`);
          pendingMatches.setState((current) => {
            const newMatches = new Map(current);
            newMatches.set(matchId, {
              matchFn: checkMatch,
              resolve,
              reject,
              timeoutId,
              matched: true
            });
            return newMatches;
          });
          return;
        }
      }
      pendingMatches.setState((current) => {
        const newMatches = new Map(current);
        newMatches.set(matchId, {
          matchFn: checkMatch,
          resolve,
          reject,
          timeoutId,
          matched: false
        });
        return newMatches;
      });
    });
  };
  const processMatchingStrategy = async (result) => {
    if (result && `txid` in result) {
      const timeout = result.timeout;
      if (Array.isArray(result.txid)) {
        await Promise.all(result.txid.map((txid) => awaitTxId(txid, timeout)));
      } else {
        await awaitTxId(result.txid, timeout);
      }
    }
  };
  const wrappedOnInsert = config.onInsert ? async (params) => {
    const handlerResult = await config.onInsert(params);
    await processMatchingStrategy(handlerResult);
    return handlerResult;
  } : void 0;
  const wrappedOnUpdate = config.onUpdate ? async (params) => {
    const handlerResult = await config.onUpdate(params);
    await processMatchingStrategy(handlerResult);
    return handlerResult;
  } : void 0;
  const wrappedOnDelete = config.onDelete ? async (params) => {
    const handlerResult = await config.onDelete(params);
    await processMatchingStrategy(handlerResult);
    return handlerResult;
  } : void 0;
  const { shapeOptions: _shapeOptions, onInsert: _onInsert, onUpdate: _onUpdate, onDelete: _onDelete, ...restConfig } = config;
  return {
    ...restConfig,
    syncMode: finalSyncMode,
    sync,
    onInsert: wrappedOnInsert,
    onUpdate: wrappedOnUpdate,
    onDelete: wrappedOnDelete,
    utils: {
      awaitTxId,
      awaitMatch
    }
  };
}
function createElectricSync(shapeOptions, options) {
  const { seenTxids, seenSnapshots, syncMode, pendingMatches, currentBatchMessages, batchCommitted, removePendingMatches, resolveMatchedPendingMatches, collectionId, testHooks } = options;
  const MAX_BATCH_MESSAGES = 1e3;
  const relationSchema = new Store(void 0);
  const tagCache = /* @__PURE__ */ new Map();
  const parseTag$1 = (tag) => {
    const cachedTag = tagCache.get(tag);
    if (cachedTag) {
      return cachedTag;
    }
    const parsedTag = parseTag(tag);
    tagCache.set(tag, parsedTag);
    return parsedTag;
  };
  const rowTagSets = /* @__PURE__ */ new Map();
  const tagIndex = [];
  let tagLength = void 0;
  const rowActiveConditions = /* @__PURE__ */ new Map();
  let disjunctPositions = void 0;
  const initializeTagIndex = (length2) => {
    if (tagIndex.length < length2) {
      for (let i = tagIndex.length; i < length2; i++) {
        tagIndex[i] = /* @__PURE__ */ new Map();
      }
    }
  };
  const addTagsToRow = (tags, rowId, rowTagSet) => {
    for (const tag of tags) {
      const parsedTag = parseTag$1(tag);
      if (tagLength === void 0) {
        tagLength = getTagLength(parsedTag);
        initializeTagIndex(tagLength);
      }
      const currentTagLength = getTagLength(parsedTag);
      if (currentTagLength !== tagLength) {
        debug2(`${collectionId ? `[${collectionId}] ` : ``}Tag length mismatch: expected ${tagLength}, got ${currentTagLength}`);
        continue;
      }
      rowTagSet.add(tag);
      addTagToIndex(parsedTag, rowId, tagIndex, tagLength);
    }
  };
  const removeTagsFromRow = (removedTags, rowId, rowTagSet) => {
    if (tagLength === void 0) {
      return;
    }
    for (const tag of removedTags) {
      const parsedTag = parseTag$1(tag);
      rowTagSet.delete(tag);
      removeTagFromIndex(parsedTag, rowId, tagIndex, tagLength);
      tagCache.delete(tag);
    }
  };
  const processTagsForChangeMessage = (tags, removedTags, rowId, activeConditions) => {
    if (!rowTagSets.has(rowId)) {
      rowTagSets.set(rowId, /* @__PURE__ */ new Set());
    }
    const rowTagSet = rowTagSets.get(rowId);
    if (tags) {
      addTagsToRow(tags, rowId, rowTagSet);
      if (disjunctPositions === void 0) {
        const parsedTags = tags.map(parseTag$1);
        disjunctPositions = deriveDisjunctPositions(parsedTags);
      }
    }
    if (removedTags) {
      removeTagsFromRow(removedTags, rowId, rowTagSet);
    }
    if (activeConditions && activeConditions.length > 0) {
      rowActiveConditions.set(rowId, [
        ...activeConditions
      ]);
    }
    return rowTagSet;
  };
  const clearTagTrackingState = () => {
    rowTagSets.clear();
    tagIndex.length = 0;
    tagLength = void 0;
    rowActiveConditions.clear();
    disjunctPositions = void 0;
  };
  const clearTagsForRow = (rowId) => {
    if (tagLength === void 0) {
      return;
    }
    const rowTagSet = rowTagSets.get(rowId);
    if (!rowTagSet) {
      return;
    }
    for (const tag of rowTagSet) {
      const parsedTag = parseTag$1(tag);
      const currentTagLength = getTagLength(parsedTag);
      if (currentTagLength === tagLength) {
        removeTagFromIndex(parsedTag, rowId, tagIndex, tagLength);
      }
      tagCache.delete(tag);
    }
    rowTagSets.delete(rowId);
    rowActiveConditions.delete(rowId);
  };
  const removeMatchingTagsFromRow = (rowId, pattern) => {
    const rowTagSet = rowTagSets.get(rowId);
    if (!rowTagSet) {
      return false;
    }
    const activeConditions = rowActiveConditions.get(rowId);
    if (activeConditions && disjunctPositions) {
      activeConditions[pattern.pos] = false;
      if (!rowVisible(activeConditions, disjunctPositions)) {
        for (const tag of rowTagSet) {
          const parsedTag = parseTag$1(tag);
          removeTagFromIndex(parsedTag, rowId, tagIndex, tagLength);
          tagCache.delete(tag);
        }
        rowTagSets.delete(rowId);
        rowActiveConditions.delete(rowId);
        return true;
      }
      return false;
    }
    for (const tag of rowTagSet) {
      const parsedTag = parseTag$1(tag);
      if (tagMatchesPattern(parsedTag, pattern)) {
        rowTagSet.delete(tag);
        removeTagFromIndex(parsedTag, rowId, tagIndex, tagLength);
      }
    }
    if (rowTagSet.size === 0) {
      rowTagSets.delete(rowId);
      return true;
    }
    return false;
  };
  const processMoveOutEvent = (patterns, begin, write, transactionStarted) => {
    if (tagLength === void 0) {
      debug2(`${collectionId ? `[${collectionId}] ` : ``}Received move-out message but no tag length set yet, ignoring`);
      return transactionStarted;
    }
    let txStarted = transactionStarted;
    for (const pattern of patterns) {
      const affectedRowIds = findRowsMatchingPattern(pattern, tagIndex);
      for (const rowId of affectedRowIds) {
        if (removeMatchingTagsFromRow(rowId, pattern)) {
          if (!txStarted) {
            begin();
            txStarted = true;
          }
          write({
            type: `delete`,
            key: rowId
          });
        }
      }
    }
    return txStarted;
  };
  const processMoveInEvent = (patterns) => {
    if (tagLength === void 0) {
      debug2(`${collectionId ? `[${collectionId}] ` : ``}Received move-in message but no tag length set yet, ignoring`);
      return;
    }
    for (const pattern of patterns) {
      const affectedRowIds = findRowsMatchingPattern(pattern, tagIndex);
      for (const rowId of affectedRowIds) {
        const activeConditions = rowActiveConditions.get(rowId);
        if (activeConditions) {
          activeConditions[pattern.pos] = true;
        }
      }
    }
  };
  const getSyncMetadata = () => {
    const schema = relationSchema.state || `public`;
    return {
      relation: shapeOptions.params?.table ? [
        schema,
        shapeOptions.params.table
      ] : void 0
    };
  };
  let unsubscribeStream;
  return {
    sync: (params) => {
      const { begin, write, commit, markReady, truncate, collection, metadata } = params;
      const readPersistedResumeState = () => {
        const persistedResumeState2 = metadata?.collection.get(`electric:resume`);
        if (!persistedResumeState2 || typeof persistedResumeState2 !== `object`) {
          return void 0;
        }
        const record = persistedResumeState2;
        if (record.kind === `resume` && typeof record.offset === `string` && typeof record.handle === `string` && typeof record.shapeId === `string` && typeof record.updatedAt === `number`) {
          return {
            kind: `resume`,
            offset: record.offset,
            handle: record.handle,
            shapeId: record.shapeId,
            updatedAt: record.updatedAt
          };
        }
        if (record.kind === `reset` && typeof record.updatedAt === `number`) {
          return {
            kind: `reset`,
            updatedAt: record.updatedAt
          };
        }
        return void 0;
      };
      const persistedResumeState = readPersistedResumeState();
      const shapeIdentity = getStableShapeIdentity({
        url: shapeOptions.url,
        params: shapeOptions.params
      });
      const hasIncompatiblePersistedResume = persistedResumeState?.kind === `resume` && persistedResumeState.shapeId !== shapeIdentity;
      const canUsePersistedResume = shapeOptions.offset === void 0 && shapeOptions.handle === void 0 && persistedResumeState?.kind === `resume` && !hasIncompatiblePersistedResume;
      let progressiveReadyGate = null;
      const wrappedMarkReady = (isBuffering) => {
        if (isBuffering && syncMode === `progressive` && testHooks?.beforeMarkingReady) {
          progressiveReadyGate = testHooks.beforeMarkingReady();
          progressiveReadyGate.then(() => {
            markReady();
          });
        } else {
          markReady();
        }
      };
      const abortController = new AbortController();
      if (shapeOptions.signal) {
        shapeOptions.signal.addEventListener(`abort`, () => {
          abortController.abort();
        }, {
          once: true
        });
        if (shapeOptions.signal.aborted) {
          abortController.abort();
        }
      }
      abortController.signal.addEventListener(`abort`, () => {
        pendingMatches.setState((current) => {
          current.forEach((match) => {
            clearTimeout(match.timeoutId);
            match.reject(new StreamAbortedError());
          });
          return /* @__PURE__ */ new Map();
        });
      });
      const stream = new ShapeStream({
        ...shapeOptions,
        // In on-demand mode, we only want to sync changes, so we set the log to `changes_only`
        log: syncMode === `on-demand` ? `changes_only` : void 0,
        // In on-demand mode, we only need the changes from the point of time the collection was created
        // so we default to `now` when there is no saved offset.
        offset: shapeOptions.offset ?? (canUsePersistedResume ? persistedResumeState.offset : syncMode === `on-demand` ? `now` : void 0),
        handle: shapeOptions.handle ?? (canUsePersistedResume ? persistedResumeState.handle : void 0),
        signal: abortController.signal,
        onError: (errorParams) => {
          markReady();
          if (shapeOptions.onError) {
            return shapeOptions.onError(errorParams);
          } else {
            console.error(`An error occurred while syncing collection: ${collection.id}, 
it has been marked as ready to avoid blocking apps waiting for '.preload()' to finish. 
You can provide an 'onError' handler on the shapeOptions to handle this error, and this message will not be logged.`, errorParams);
          }
          return;
        }
      });
      let transactionStarted = false;
      const newTxids = /* @__PURE__ */ new Set();
      const newSnapshots = [];
      let hasReceivedUpToDate = syncMode === `progressive` && canUsePersistedResume;
      const isBufferingInitialSync = () => syncMode === `progressive` && !hasReceivedUpToDate;
      const bufferedMessages = [];
      const syncedKeys = /* @__PURE__ */ new Set();
      const stageResumeMetadata = () => {
        if (!metadata) {
          return;
        }
        const shapeHandle = stream.shapeHandle;
        const lastOffset = stream.lastOffset;
        if (!shapeHandle || lastOffset === `-1`) {
          return;
        }
        metadata.collection.set(`electric:resume`, {
          kind: `resume`,
          offset: lastOffset,
          handle: shapeHandle,
          shapeId: shapeIdentity,
          updatedAt: Date.now()
        });
      };
      const commitResetResumeMetadataImmediately = () => {
        if (!metadata) {
          return;
        }
        begin({
          immediate: true
        });
        metadata.collection.set(`electric:resume`, {
          kind: `reset`,
          updatedAt: Date.now()
        });
        commit();
      };
      if (hasIncompatiblePersistedResume) {
        commitResetResumeMetadataImmediately();
      }
      const processChangeMessage = (changeMessage) => {
        if (!isChangeMessage(changeMessage)) {
          return;
        }
        const tags = changeMessage.headers.tags;
        const removedTags = changeMessage.headers.removed_tags;
        const hasTags = tags || removedTags;
        const activeConditions = changeMessage.headers.active_conditions;
        const rowId = collection.getKeyFromItem(changeMessage.value);
        const operation = changeMessage.headers.operation;
        const isDelete = operation === `delete`;
        const isDuplicateInsert = operation === `insert` && syncedKeys.has(rowId);
        if (isDelete) {
          syncedKeys.delete(rowId);
        } else {
          syncedKeys.add(rowId);
        }
        if (isDelete) {
          clearTagsForRow(rowId);
        } else if (hasTags) {
          processTagsForChangeMessage(tags, removedTags, rowId, activeConditions);
        }
        write({
          type: isDuplicateInsert ? `update` : operation,
          value: changeMessage.value,
          // Include the primary key and relation info in the metadata
          metadata: {
            ...changeMessage.headers
          }
        });
      };
      const loadSubsetDedupe = createLoadSubsetDedupe({
        stream,
        syncMode,
        isBufferingInitialSync,
        begin,
        write,
        commit,
        collectionId,
        // Pass the columnMapper's encode function to transform column names
        // (e.g., camelCase to snake_case) when compiling SQL for subset queries
        encodeColumnName: shapeOptions.columnMapper?.encode,
        // Pass abort signal so requestSnapshot errors can be ignored during cleanup
        signal: abortController.signal
      });
      unsubscribeStream = stream.subscribe((messages) => {
        let commitPoint = null;
        batchCommitted.setState(() => false);
        for (const message of messages) {
          if (isChangeMessage(message) || isMoveOutMessage(message) || isMoveInMessage(message)) {
            currentBatchMessages.setState((currentBuffer) => {
              const newBuffer = [
                ...currentBuffer,
                message
              ];
              if (newBuffer.length > MAX_BATCH_MESSAGES) {
                newBuffer.splice(0, newBuffer.length - MAX_BATCH_MESSAGES);
              }
              return newBuffer;
            });
          }
          if (hasTxids(message) && (!isBufferingInitialSync() || transactionStarted)) {
            message.headers.txids?.forEach((txid) => newTxids.add(txid));
          }
          const matchesToRemove = [];
          pendingMatches.state.forEach((match, matchId) => {
            if (!match.matched) {
              try {
                match.matchFn(message);
              } catch (err) {
                clearTimeout(match.timeoutId);
                match.reject(err instanceof Error ? err : new Error(String(err)));
                matchesToRemove.push(matchId);
                debug2(`matchFn error: %o`, err);
              }
            }
          });
          removePendingMatches(matchesToRemove);
          if (isChangeMessage(message)) {
            const schema = message.headers.schema;
            if (schema && typeof schema === `string`) {
              relationSchema.setState(() => schema);
            }
            if (isBufferingInitialSync() && !transactionStarted) {
              bufferedMessages.push(message);
            } else {
              if (!transactionStarted) {
                begin();
                transactionStarted = true;
              }
              processChangeMessage(message);
            }
          } else if (isSnapshotEndMessage(message)) {
            if (!isBufferingInitialSync() || transactionStarted) {
              newSnapshots.push(parseSnapshotMessage(message));
            }
          } else if (isUpToDateMessage2(message)) {
            commitPoint = `up-to-date`;
          } else if (isSubsetEndMessage(message)) {
            if (commitPoint !== `up-to-date`) {
              commitPoint = `subset-end`;
            }
          } else if (isMoveOutMessage(message)) {
            if (isBufferingInitialSync() && !transactionStarted) {
              bufferedMessages.push(message);
            } else {
              transactionStarted = processMoveOutEvent(message.headers.patterns, begin, write, transactionStarted);
            }
          } else if (isMoveInMessage(message)) {
            if (isBufferingInitialSync() && !transactionStarted) {
              bufferedMessages.push(message);
            } else {
              processMoveInEvent(message.headers.patterns);
            }
          } else if (isMustRefetchMessage(message)) {
            debug2(`${collectionId ? `[${collectionId}] ` : ``}Received must-refetch message, starting transaction with truncate`);
            commitResetResumeMetadataImmediately();
            if (!transactionStarted) {
              begin();
              transactionStarted = true;
            }
            truncate();
            clearTagTrackingState();
            syncedKeys.clear();
            loadSubsetDedupe?.reset();
            commitPoint = null;
            hasReceivedUpToDate = false;
            bufferedMessages.length = 0;
          }
        }
        if (commitPoint !== null) {
          if (isBufferingInitialSync() && commitPoint === `up-to-date` && !transactionStarted) {
            debug2(`${collectionId ? `[${collectionId}] ` : ``}Progressive mode: Performing atomic swap with ${bufferedMessages.length} buffered messages`);
            begin();
            truncate();
            clearTagTrackingState();
            syncedKeys.clear();
            for (const bufferedMsg of bufferedMessages) {
              if (isChangeMessage(bufferedMsg)) {
                processChangeMessage(bufferedMsg);
                if (hasTxids(bufferedMsg)) {
                  bufferedMsg.headers.txids?.forEach((txid) => newTxids.add(txid));
                }
              } else if (isSnapshotEndMessage(bufferedMsg)) {
                newSnapshots.push(parseSnapshotMessage(bufferedMsg));
              } else if (isMoveOutMessage(bufferedMsg)) {
                processMoveOutEvent(bufferedMsg.headers.patterns, begin, write, transactionStarted);
              } else if (isMoveInMessage(bufferedMsg)) {
                processMoveInEvent(bufferedMsg.headers.patterns);
              }
            }
            stageResumeMetadata();
            commit();
            bufferedMessages.length = 0;
            debug2(`${collectionId ? `[${collectionId}] ` : ``}Progressive mode: Atomic swap complete, now in normal sync mode`);
          } else {
            if (transactionStarted) {
              stageResumeMetadata();
              commit();
              transactionStarted = false;
            } else if (commitPoint === `up-to-date` && metadata) {
              begin();
              stageResumeMetadata();
              commit();
            }
          }
          wrappedMarkReady(isBufferingInitialSync());
          if (commitPoint === `up-to-date`) {
            hasReceivedUpToDate = true;
          }
          seenTxids.setState((currentTxids) => {
            const clonedSeen = new Set(currentTxids);
            if (newTxids.size > 0) {
              debug2(`${collectionId ? `[${collectionId}] ` : ``}new txids synced from pg %O`, Array.from(newTxids));
            }
            newTxids.forEach((txid) => clonedSeen.add(txid));
            newTxids.clear();
            return clonedSeen;
          });
          seenSnapshots.setState((currentSnapshots) => {
            const seen = [
              ...currentSnapshots,
              ...newSnapshots
            ];
            newSnapshots.forEach((snapshot) => debug2(`${collectionId ? `[${collectionId}] ` : ``}new snapshot synced from pg %o`, snapshot));
            newSnapshots.length = 0;
            return seen;
          });
          batchCommitted.setState(() => true);
          resolveMatchedPendingMatches();
        }
      });
      return {
        loadSubset: loadSubsetDedupe?.loadSubset,
        cleanup: () => {
          unsubscribeStream();
          abortController.abort();
          loadSubsetDedupe?.reset();
        }
      };
    },
    // Expose the getSyncMetadata function
    getSyncMetadata
  };
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+offline-transactions@1.0.42/node_modules/@tanstack/offline-transactions/dist/esm/storage/StorageAdapter.js
var BaseStorageAdapter = class {
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+offline-transactions@1.0.42/node_modules/@tanstack/offline-transactions/dist/esm/storage/IndexedDBAdapter.js
var IndexedDBAdapter = class extends BaseStorageAdapter {
  constructor(dbName = `offline-transactions`, storeName = `transactions`) {
    super();
    this.db = null;
    this.dbName = dbName;
    this.storeName = storeName;
  }
  /**
   * Probe IndexedDB availability by attempting to open a test database.
   * This catches private mode and other restrictions that block IndexedDB.
   */
  static async probe() {
    if (typeof indexedDB === `undefined`) {
      return {
        available: false,
        error: new Error(`IndexedDB is not available in this environment`)
      };
    }
    try {
      const testDbName = `__offline-tx-probe__`;
      const request = indexedDB.open(testDbName, 1);
      return new Promise((resolve) => {
        request.onerror = () => {
          const error = request.error || new Error(`IndexedDB open failed`);
          resolve({
            available: false,
            error
          });
        };
        request.onsuccess = () => {
          const db = request.result;
          db.close();
          indexedDB.deleteDatabase(testDbName);
          resolve({
            available: true
          });
        };
        request.onblocked = () => {
          resolve({
            available: false,
            error: new Error(`IndexedDB is blocked`)
          });
        };
      });
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }
  async openDB() {
    if (this.db) {
      return this.db;
    }
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }
  async getStore(mode2 = `readonly`) {
    const db = await this.openDB();
    const transaction = db.transaction([
      this.storeName
    ], mode2);
    return transaction.objectStore(this.storeName);
  }
  async get(key) {
    try {
      const store = await this.getStore(`readonly`);
      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result ?? null);
      });
    } catch (error) {
      console.warn(`IndexedDB get failed:`, error);
      return null;
    }
  }
  async set(key, value) {
    try {
      const store = await this.getStore(`readwrite`);
      return new Promise((resolve, reject) => {
        const request = store.put(value, key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === `QuotaExceededError`) {
        throw new Error(`Storage quota exceeded. Consider clearing old transactions.`);
      }
      throw error;
    }
  }
  async delete(key) {
    try {
      const store = await this.getStore(`readwrite`);
      return new Promise((resolve, reject) => {
        const request = store.delete(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.warn(`IndexedDB delete failed:`, error);
    }
  }
  async keys() {
    try {
      const store = await this.getStore(`readonly`);
      return new Promise((resolve, reject) => {
        const request = store.getAllKeys();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    } catch (error) {
      console.warn(`IndexedDB keys failed:`, error);
      return [];
    }
  }
  async clear() {
    try {
      const store = await this.getStore(`readwrite`);
      return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.warn(`IndexedDB clear failed:`, error);
    }
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+offline-transactions@1.0.42/node_modules/@tanstack/offline-transactions/dist/esm/storage/LocalStorageAdapter.js
var LocalStorageAdapter = class extends BaseStorageAdapter {
  constructor(prefix = `offline-tx:`) {
    super();
    this.prefix = prefix;
  }
  /**
   * Probe localStorage availability by attempting a test write.
   * This catches private mode and other restrictions that block localStorage.
   */
  static probe() {
    if (typeof localStorage === `undefined`) {
      return {
        available: false,
        error: new Error(`localStorage is not available in this environment`)
      };
    }
    try {
      const testKey = `__offline-tx-probe__`;
      const testValue = `test`;
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      if (retrieved !== testValue) {
        return {
          available: false,
          error: new Error(`localStorage read/write verification failed`)
        };
      }
      return {
        available: true
      };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }
  getKey(key) {
    return `${this.prefix}${key}`;
  }
  get(key) {
    try {
      return Promise.resolve(localStorage.getItem(this.getKey(key)));
    } catch (error) {
      console.warn(`localStorage get failed:`, error);
      return Promise.resolve(null);
    }
  }
  set(key, value) {
    try {
      localStorage.setItem(this.getKey(key), value);
      return Promise.resolve();
    } catch (error) {
      if (error instanceof DOMException && error.name === `QuotaExceededError`) {
        return Promise.reject(new Error(`Storage quota exceeded. Consider clearing old transactions.`));
      }
      return Promise.reject(error);
    }
  }
  delete(key) {
    try {
      localStorage.removeItem(this.getKey(key));
      return Promise.resolve();
    } catch (error) {
      console.warn(`localStorage delete failed:`, error);
      return Promise.resolve();
    }
  }
  keys() {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.slice(this.prefix.length));
        }
      }
      return Promise.resolve(keys);
    } catch (error) {
      console.warn(`localStorage keys failed:`, error);
      return Promise.resolve([]);
    }
  }
  async clear() {
    try {
      const keys = await this.keys();
      for (const key of keys) {
        localStorage.removeItem(this.getKey(key));
      }
    } catch (error) {
      console.warn(`localStorage clear failed:`, error);
    }
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+offline-transactions@1.0.42/node_modules/@tanstack/offline-transactions/dist/esm/telemetry/tracer.js
var noopSpan = {
  setAttribute: () => {
  },
  setAttributes: () => {
  },
  setStatus: () => {
  },
  recordException: () => {
  },
  end: () => {
  }
};
async function withSpan(name, attrs, fn, _options) {
  return await fn(noopSpan);
}
async function withNestedSpan(name, attrs, fn, _options) {
  return await fn(noopSpan);
}
function withSyncSpan(name, attrs, fn, _options) {
  return fn(noopSpan);
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+offline-transactions@1.0.42/node_modules/@tanstack/offline-transactions/dist/esm/outbox/TransactionSerializer.js
var TransactionSerializer = class {
  constructor(collections) {
    this.collections = collections;
    this.collectionIdToKey = /* @__PURE__ */ new Map();
    for (const [key, collection] of Object.entries(collections)) {
      this.collectionIdToKey.set(collection.id, key);
    }
  }
  serialize(transaction) {
    const serialized = {
      ...transaction,
      createdAt: transaction.createdAt.toISOString(),
      mutations: transaction.mutations.map((mutation) => this.serializeMutation(mutation))
    };
    return JSON.stringify(serialized);
  }
  deserialize(data) {
    const parsed = JSON.parse(data);
    const createdAt = new Date(parsed.createdAt);
    if (isNaN(createdAt.getTime())) {
      throw new Error(`Failed to deserialize transaction: invalid createdAt value "${parsed.createdAt}"`);
    }
    return {
      ...parsed,
      createdAt,
      mutations: parsed.mutations.map((mutationData) => this.deserializeMutation(mutationData))
    };
  }
  serializeMutation(mutation) {
    const registryKey = this.collectionIdToKey.get(mutation.collection.id);
    if (!registryKey) {
      throw new Error(`Collection with id ${mutation.collection.id} not found in registry`);
    }
    return {
      globalKey: mutation.globalKey,
      type: mutation.type,
      modified: this.serializeValue(mutation.modified),
      original: this.serializeValue(mutation.original),
      changes: this.serializeValue(mutation.changes),
      collectionId: registryKey
    };
  }
  deserializeMutation(data) {
    const collection = this.collections[data.collectionId];
    if (!collection) {
      throw new Error(`Collection with id ${data.collectionId} not found`);
    }
    const modified = this.deserializeValue(data.modified);
    const key = modified ? collection.getKeyFromItem(modified) : null;
    return {
      globalKey: data.globalKey,
      type: data.type,
      modified,
      original: this.deserializeValue(data.original),
      changes: this.deserializeValue(data.changes) ?? {},
      collection,
      // These fields would need to be reconstructed by the executor
      mutationId: ``,
      // Will be regenerated
      key,
      metadata: void 0,
      syncMetadata: {},
      optimistic: true,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
  }
  serializeValue(value) {
    if (value === null || value === void 0) {
      return value;
    }
    if (value instanceof Date) {
      return {
        __type: `Date`,
        value: value.toISOString()
      };
    }
    if (typeof value === `object`) {
      const result = Array.isArray(value) ? [] : {};
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          result[key] = this.serializeValue(value[key]);
        }
      }
      return result;
    }
    return value;
  }
  deserializeValue(value) {
    if (value === null || value === void 0) {
      return value;
    }
    if (typeof value === `object` && value.__type === `Date`) {
      if (value.value === void 0 || value.value === null) {
        throw new Error(`Corrupted Date marker: missing value field`);
      }
      const date = new Date(value.value);
      if (isNaN(date.getTime())) {
        throw new Error(`Failed to deserialize Date marker: invalid date value "${value.value}"`);
      }
      return date;
    }
    if (typeof value === `object`) {
      const result = Array.isArray(value) ? [] : {};
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          result[key] = this.deserializeValue(value[key]);
        }
      }
      return result;
    }
    return value;
  }
  serializeError(error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }
  deserializeError(data) {
    const error = new Error(data.message);
    error.name = data.name;
    error.stack = data.stack;
    return error;
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+offline-transactions@1.0.42/node_modules/@tanstack/offline-transactions/dist/esm/outbox/OutboxManager.js
var OutboxManager = class {
  constructor(storage, collections) {
    this.keyPrefix = `tx:`;
    this.storage = storage;
    this.serializer = new TransactionSerializer(collections);
  }
  getStorageKey(id) {
    return `${this.keyPrefix}${id}`;
  }
  async add(transaction) {
    return withSpan(`outbox.add`, {
      "transaction.id": transaction.id,
      "transaction.mutationFnName": transaction.mutationFnName,
      "transaction.keyCount": transaction.keys.length
    }, async () => {
      const key = this.getStorageKey(transaction.id);
      const serialized = this.serializer.serialize(transaction);
      await this.storage.set(key, serialized);
    });
  }
  async get(id) {
    return withSpan(`outbox.get`, {}, async (span) => {
      const key = this.getStorageKey(id);
      const data = await this.storage.get(key);
      if (!data) {
        span.setAttribute(`result`, `not_found`);
        return null;
      }
      try {
        const transaction = this.serializer.deserialize(data);
        span.setAttribute(`result`, `found`);
        return transaction;
      } catch (error) {
        console.warn(`Failed to deserialize transaction ${id}:`, error);
        span.setAttribute(`result`, `deserialize_error`);
        return null;
      }
    });
  }
  async getAll() {
    return withSpan(`outbox.getAll`, {}, async (span) => {
      const keys = await this.storage.keys();
      const transactionKeys = keys.filter((key) => key.startsWith(this.keyPrefix));
      span.setAttribute(`transactionCount`, transactionKeys.length);
      const transactions2 = [];
      for (const key of transactionKeys) {
        const data = await this.storage.get(key);
        if (data) {
          try {
            const transaction = this.serializer.deserialize(data);
            transactions2.push(transaction);
          } catch (error) {
            console.warn(`Failed to deserialize transaction from key ${key}:`, error);
          }
        }
      }
      return transactions2.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    });
  }
  async getByKeys(keys) {
    const allTransactions = await this.getAll();
    const keySet = new Set(keys);
    return allTransactions.filter((transaction) => transaction.keys.some((key) => keySet.has(key)));
  }
  async update(id, updates) {
    return withSpan(`outbox.update`, {}, async () => {
      const existing = await this.get(id);
      if (!existing) {
        throw new Error(`Transaction ${id} not found`);
      }
      const updated = {
        ...existing,
        ...updates
      };
      await this.add(updated);
    });
  }
  async remove(id) {
    return withSpan(`outbox.remove`, {}, async () => {
      const key = this.getStorageKey(id);
      await this.storage.delete(key);
    });
  }
  async removeMany(ids) {
    return withSpan(`outbox.removeMany`, {
      count: ids.length
    }, async () => {
      await Promise.all(ids.map((id) => this.remove(id)));
    });
  }
  async clear() {
    const keys = await this.storage.keys();
    const transactionKeys = keys.filter((key) => key.startsWith(this.keyPrefix));
    await Promise.all(transactionKeys.map((key) => this.storage.delete(key)));
  }
  async count() {
    const keys = await this.storage.keys();
    return keys.filter((key) => key.startsWith(this.keyPrefix)).length;
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+offline-transactions@1.0.42/node_modules/@tanstack/offline-transactions/dist/esm/executor/KeyScheduler.js
var KeyScheduler = class {
  constructor() {
    this.pendingTransactions = [];
    this.isRunning = false;
  }
  schedule(transaction) {
    withSyncSpan(`scheduler.schedule`, {
      "transaction.id": transaction.id,
      queueLength: this.pendingTransactions.length
    }, () => {
      this.pendingTransactions.push(transaction);
      this.pendingTransactions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    });
  }
  getNext() {
    return withSyncSpan(`scheduler.getNext`, {
      pendingCount: this.pendingTransactions.length
    }, (span) => {
      if (this.isRunning || this.pendingTransactions.length === 0) {
        span.setAttribute(`result`, `empty`);
        return void 0;
      }
      const firstTransaction = this.pendingTransactions[0];
      if (!this.isReadyToRun(firstTransaction)) {
        span.setAttribute(`result`, `waiting_for_first`);
        span.setAttribute(`transaction.id`, firstTransaction.id);
        return void 0;
      }
      span.setAttribute(`result`, `found`);
      span.setAttribute(`transaction.id`, firstTransaction.id);
      return firstTransaction;
    });
  }
  isReadyToRun(transaction) {
    return Date.now() >= transaction.nextAttemptAt;
  }
  markStarted(_transaction) {
    this.isRunning = true;
  }
  markCompleted(transaction) {
    this.removeTransaction(transaction);
    this.isRunning = false;
  }
  markFailed(_transaction) {
    this.isRunning = false;
  }
  removeTransaction(transaction) {
    const index = this.pendingTransactions.findIndex((tx) => tx.id === transaction.id);
    if (index >= 0) {
      this.pendingTransactions.splice(index, 1);
    }
  }
  updateTransaction(transaction) {
    const index = this.pendingTransactions.findIndex((tx) => tx.id === transaction.id);
    if (index >= 0) {
      this.pendingTransactions[index] = transaction;
      this.pendingTransactions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }
  }
  getPendingCount() {
    return this.pendingTransactions.length;
  }
  getRunningCount() {
    return this.isRunning ? 1 : 0;
  }
  clear() {
    this.pendingTransactions = [];
    this.isRunning = false;
  }
  getAllPendingTransactions() {
    return [
      ...this.pendingTransactions
    ];
  }
  updateTransactions(updatedTransactions) {
    for (const updatedTx of updatedTransactions) {
      const index = this.pendingTransactions.findIndex((tx) => tx.id === updatedTx.id);
      if (index >= 0) {
        this.pendingTransactions[index] = updatedTx;
      }
    }
    this.pendingTransactions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+offline-transactions@1.0.42/node_modules/@tanstack/offline-transactions/dist/esm/types.js
var NonRetriableError2 = class extends Error {
  constructor(message) {
    super(message);
    this.name = `NonRetriableError`;
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+offline-transactions@1.0.42/node_modules/@tanstack/offline-transactions/dist/esm/retry/BackoffCalculator.js
var BackoffCalculator = class {
  constructor(jitter = true) {
    this.jitter = jitter;
  }
  calculate(retryCount) {
    const baseDelay = Math.min(1e3 * Math.pow(2, retryCount), 6e4);
    const jitterMultiplier = this.jitter ? Math.random() * 0.3 : 0;
    return Math.floor(baseDelay * (1 + jitterMultiplier));
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+offline-transactions@1.0.42/node_modules/@tanstack/offline-transactions/dist/esm/retry/RetryPolicy.js
var DefaultRetryPolicy = class {
  constructor(maxRetries = Number.POSITIVE_INFINITY, jitter = true) {
    this.backoffCalculator = new BackoffCalculator(jitter);
    this.maxRetries = maxRetries;
  }
  calculateDelay(retryCount) {
    return this.backoffCalculator.calculate(retryCount);
  }
  shouldRetry(error, retryCount) {
    if (retryCount >= this.maxRetries) {
      return false;
    }
    if (error instanceof NonRetriableError2) {
      return false;
    }
    if (error.name === `AbortError`) {
      return false;
    }
    if (error.message.includes(`401`) || error.message.includes(`403`)) {
      return false;
    }
    if (error.message.includes(`422`) || error.message.includes(`400`)) {
      return false;
    }
    return true;
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+offline-transactions@1.0.42/node_modules/@tanstack/offline-transactions/dist/esm/executor/TransactionExecutor.js
var HANDLED_EXECUTION_ERROR = /* @__PURE__ */ Symbol(`HandledExecutionError`);
var TransactionExecutor = class {
  constructor(scheduler, outbox, config, offlineExecutor) {
    this.isExecuting = false;
    this.executionPromise = null;
    this.retryTimer = null;
    this.scheduler = scheduler;
    this.outbox = outbox;
    this.config = config;
    this.retryPolicy = new DefaultRetryPolicy(Number.POSITIVE_INFINITY, config.jitter ?? true);
    this.offlineExecutor = offlineExecutor;
  }
  async execute(transaction) {
    this.scheduler.schedule(transaction);
    await this.executeAll();
  }
  async executeAll() {
    if (this.isExecuting) {
      return this.executionPromise;
    }
    this.isExecuting = true;
    this.executionPromise = this.runExecution();
    try {
      await this.executionPromise;
    } finally {
      this.isExecuting = false;
      this.executionPromise = null;
    }
  }
  async runExecution() {
    while (this.scheduler.getPendingCount() > 0) {
      if (!this.isOnline()) {
        break;
      }
      const transaction = this.scheduler.getNext();
      if (!transaction) {
        break;
      }
      await this.executeTransaction(transaction);
    }
    this.scheduleNextRetry();
  }
  async executeTransaction(transaction) {
    try {
      await withNestedSpan(`transaction.execute`, {
        "transaction.id": transaction.id,
        "transaction.mutationFnName": transaction.mutationFnName,
        "transaction.retryCount": transaction.retryCount,
        "transaction.keyCount": transaction.keys.length
      }, async (span) => {
        this.scheduler.markStarted(transaction);
        if (transaction.retryCount > 0) {
          span.setAttribute(`retry.attempt`, transaction.retryCount);
        }
        try {
          const result = await this.runMutationFn(transaction);
          this.scheduler.markCompleted(transaction);
          await this.outbox.remove(transaction.id);
          span.setAttribute(`result`, `success`);
          this.offlineExecutor.resolveTransaction(transaction.id, result);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          span.setAttribute(`result`, `error`);
          await this.handleError(transaction, err);
          err[HANDLED_EXECUTION_ERROR] = true;
          throw err;
        }
      });
    } catch (error) {
      if (error instanceof Error && error[HANDLED_EXECUTION_ERROR] === true) {
        return;
      }
      throw error;
    }
  }
  async runMutationFn(transaction) {
    const mutationFn = this.config.mutationFns[transaction.mutationFnName];
    if (!mutationFn) {
      const errorMessage = `Unknown mutation function: ${transaction.mutationFnName}`;
      if (this.config.onUnknownMutationFn) {
        this.config.onUnknownMutationFn(transaction.mutationFnName, transaction);
      }
      throw new NonRetriableError2(errorMessage);
    }
    const transactionWithMutations = {
      id: transaction.id,
      mutations: transaction.mutations,
      metadata: transaction.metadata ?? {}
    };
    await mutationFn({
      transaction: transactionWithMutations,
      idempotencyKey: transaction.idempotencyKey
    });
  }
  async handleError(transaction, error) {
    return withNestedSpan(`transaction.handleError`, {
      "transaction.id": transaction.id,
      "error.name": error.name,
      "error.message": error.message
    }, async (span) => {
      const shouldRetry = this.retryPolicy.shouldRetry(error, transaction.retryCount);
      span.setAttribute(`shouldRetry`, shouldRetry);
      if (!shouldRetry) {
        this.scheduler.markCompleted(transaction);
        await this.outbox.remove(transaction.id);
        console.warn(`Transaction ${transaction.id} failed permanently:`, error);
        span.setAttribute(`result`, `permanent_failure`);
        this.offlineExecutor.rejectTransaction(transaction.id, error);
        return;
      }
      const delay = Math.max(0, this.retryPolicy.calculateDelay(transaction.retryCount));
      const updatedTransaction = {
        ...transaction,
        retryCount: transaction.retryCount + 1,
        nextAttemptAt: Date.now() + delay,
        lastError: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      };
      span.setAttribute(`retryDelay`, delay);
      span.setAttribute(`nextRetryCount`, updatedTransaction.retryCount);
      this.scheduler.markFailed(transaction);
      this.scheduler.updateTransaction(updatedTransaction);
      try {
        await this.outbox.update(transaction.id, updatedTransaction);
        span.setAttribute(`result`, `scheduled_retry`);
      } catch (persistError) {
        span.recordException(persistError);
        span.setAttribute(`result`, `persist_failed`);
        throw persistError;
      }
      this.scheduleNextRetry();
    });
  }
  async loadPendingTransactions() {
    const transactions2 = await this.outbox.getAll();
    let filteredTransactions = transactions2;
    if (this.config.beforeRetry) {
      filteredTransactions = this.config.beforeRetry(transactions2);
    }
    for (const transaction of filteredTransactions) {
      this.scheduler.schedule(transaction);
    }
    this.restoreOptimisticState(filteredTransactions);
    this.resetRetryDelays();
    this.scheduleNextRetry();
    const removedTransactions = transactions2.filter((tx) => !filteredTransactions.some((filtered) => filtered.id === tx.id));
    if (removedTransactions.length > 0) {
      await this.outbox.removeMany(removedTransactions.map((tx) => tx.id));
    }
  }
  /**
   * Restore optimistic state from loaded transactions.
   * Creates internal transactions to hold the mutations so the collection's
   * state manager can show optimistic data while waiting for sync.
   */
  restoreOptimisticState(transactions2) {
    for (const offlineTx of transactions2) {
      if (offlineTx.mutations.length === 0) {
        continue;
      }
      try {
        const restorationTx = createTransaction({
          id: offlineTx.id,
          autoCommit: false,
          mutationFn: async () => {
          }
        });
        restorationTx.isPersisted.promise.catch(() => {
        });
        restorationTx.applyMutations(offlineTx.mutations);
        const touchedCollections = /* @__PURE__ */ new Set();
        for (const mutation of offlineTx.mutations) {
          if (!mutation.collection) {
            continue;
          }
          const collectionId = mutation.collection.id;
          if (touchedCollections.has(collectionId)) {
            continue;
          }
          touchedCollections.add(collectionId);
          mutation.collection._state.transactions.set(restorationTx.id, restorationTx);
          mutation.collection._state.recomputeOptimisticState(true);
        }
        this.offlineExecutor.registerRestorationTransaction(offlineTx.id, restorationTx);
      } catch (error) {
        console.warn(`Failed to restore optimistic state for transaction ${offlineTx.id}:`, error);
      }
    }
  }
  clear() {
    this.scheduler.clear();
    this.clearRetryTimer();
  }
  getPendingCount() {
    return this.scheduler.getPendingCount();
  }
  scheduleNextRetry() {
    this.clearRetryTimer();
    if (!this.isOnline()) {
      return;
    }
    const earliestRetryTime = this.getEarliestRetryTime();
    if (earliestRetryTime === null) {
      return;
    }
    const delay = Math.max(0, earliestRetryTime - Date.now());
    this.retryTimer = setTimeout(() => {
      this.executeAll().catch((error) => {
        console.warn(`Failed to execute retry batch:`, error);
      });
    }, delay);
  }
  getEarliestRetryTime() {
    const allTransactions = this.scheduler.getAllPendingTransactions();
    if (allTransactions.length === 0) {
      return null;
    }
    return Math.min(...allTransactions.map((tx) => tx.nextAttemptAt));
  }
  clearRetryTimer() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }
  isOnline() {
    return this.offlineExecutor.isOnline();
  }
  getRunningCount() {
    return this.scheduler.getRunningCount();
  }
  resetRetryDelays() {
    const allTransactions = this.scheduler.getAllPendingTransactions();
    const updatedTransactions = allTransactions.map((transaction) => ({
      ...transaction,
      nextAttemptAt: Date.now()
    }));
    this.scheduler.updateTransactions(updatedTransactions);
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+offline-transactions@1.0.42/node_modules/@tanstack/offline-transactions/dist/esm/coordination/LeaderElection.js
var BaseLeaderElection = class {
  constructor() {
    this.isLeaderState = false;
    this.listeners = /* @__PURE__ */ new Set();
  }
  isLeader() {
    return this.isLeaderState;
  }
  onLeadershipChange(callback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
  notifyLeadershipChange(isLeader) {
    if (this.isLeaderState !== isLeader) {
      this.isLeaderState = isLeader;
      for (const listener of this.listeners) {
        try {
          listener(isLeader);
        } catch (error) {
          console.warn(`Leadership change listener error:`, error);
        }
      }
    }
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+offline-transactions@1.0.42/node_modules/@tanstack/offline-transactions/dist/esm/coordination/WebLocksLeader.js
var WebLocksLeader = class extends BaseLeaderElection {
  constructor(lockName = `offline-executor-leader`) {
    super();
    this.releaseLock = null;
    this.lockName = lockName;
  }
  async requestLeadership() {
    if (!this.isWebLocksSupported()) {
      return false;
    }
    if (this.isLeaderState) {
      return true;
    }
    try {
      const available = await navigator.locks.request(this.lockName, {
        mode: `exclusive`,
        ifAvailable: true
      }, (lock) => {
        return lock !== null;
      });
      if (!available) {
        return false;
      }
      this.isLeaderState = true;
      navigator.locks.request(this.lockName, {
        mode: `exclusive`
      }, async (lock) => {
        if (lock) {
          this.notifyLeadershipChange(true);
          return new Promise((resolve) => {
            this.releaseLock = () => {
              this.notifyLeadershipChange(false);
              resolve();
            };
          });
        }
      });
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === `AbortError`) {
        return false;
      }
      console.warn(`Web Locks leadership request failed:`, error);
      return false;
    }
  }
  releaseLeadership() {
    if (this.releaseLock) {
      this.releaseLock();
      this.releaseLock = null;
    }
  }
  isWebLocksSupported() {
    return typeof navigator !== `undefined` && `locks` in navigator;
  }
  static isSupported() {
    return typeof navigator !== `undefined` && `locks` in navigator;
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+offline-transactions@1.0.42/node_modules/@tanstack/offline-transactions/dist/esm/coordination/BroadcastChannelLeader.js
var BroadcastChannelLeader = class extends BaseLeaderElection {
  constructor(channelName = `offline-executor-leader`) {
    super();
    this.channel = null;
    this.heartbeatInterval = null;
    this.electionTimeout = null;
    this.lastLeaderHeartbeat = 0;
    this.heartbeatIntervalMs = 5e3;
    this.electionTimeoutMs = 1e4;
    this.handleMessage = (event) => {
      const { type, tabId, timestamp } = event.data;
      if (tabId === this.tabId) {
        return;
      }
      switch (type) {
        case `heartbeat`:
          if (this.isLeaderState && tabId < this.tabId) {
            this.releaseLeadership();
          } else if (!this.isLeaderState) {
            this.lastLeaderHeartbeat = timestamp;
            this.cancelElection();
          }
          break;
        case `election`:
          if (this.isLeaderState) {
            this.sendHeartbeat();
          } else if (tabId > this.tabId) {
            this.startElection();
          }
          break;
        case `leadership-claim`:
          if (this.isLeaderState && tabId < this.tabId) {
            this.releaseLeadership();
          }
          break;
      }
    };
    this.channelName = channelName;
    this.tabId = safeRandomUUID();
    this.setupChannel();
  }
  setupChannel() {
    if (!this.isBroadcastChannelSupported()) {
      return;
    }
    this.channel = new BroadcastChannel(this.channelName);
    this.channel.addEventListener(`message`, this.handleMessage);
  }
  async requestLeadership() {
    if (!this.isBroadcastChannelSupported()) {
      return false;
    }
    if (this.isLeaderState) {
      return true;
    }
    this.startElection();
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.isLeaderState);
      }, 1e3);
    });
  }
  startElection() {
    if (this.electionTimeout) {
      return;
    }
    this.sendMessage({
      type: `election`,
      tabId: this.tabId,
      timestamp: Date.now()
    });
    this.electionTimeout = window.setTimeout(() => {
      const timeSinceLastHeartbeat = Date.now() - this.lastLeaderHeartbeat;
      if (timeSinceLastHeartbeat > this.electionTimeoutMs) {
        this.claimLeadership();
      }
      this.electionTimeout = null;
    }, this.electionTimeoutMs);
  }
  cancelElection() {
    if (this.electionTimeout) {
      clearTimeout(this.electionTimeout);
      this.electionTimeout = null;
    }
  }
  claimLeadership() {
    this.notifyLeadershipChange(true);
    this.sendMessage({
      type: `leadership-claim`,
      tabId: this.tabId,
      timestamp: Date.now()
    });
    this.startHeartbeat();
  }
  startHeartbeat() {
    if (this.heartbeatInterval) {
      return;
    }
    this.sendHeartbeat();
    this.heartbeatInterval = window.setInterval(() => {
      this.sendHeartbeat();
    }, this.heartbeatIntervalMs);
  }
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
  sendHeartbeat() {
    this.sendMessage({
      type: `heartbeat`,
      tabId: this.tabId,
      timestamp: Date.now()
    });
  }
  sendMessage(message) {
    if (this.channel) {
      this.channel.postMessage(message);
    }
  }
  releaseLeadership() {
    this.stopHeartbeat();
    this.cancelElection();
    this.notifyLeadershipChange(false);
  }
  isBroadcastChannelSupported() {
    return typeof BroadcastChannel !== `undefined`;
  }
  static isSupported() {
    return typeof BroadcastChannel !== `undefined`;
  }
  dispose() {
    this.releaseLeadership();
    if (this.channel) {
      this.channel.removeEventListener(`message`, this.handleMessage);
      this.channel.close();
      this.channel = null;
    }
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+offline-transactions@1.0.42/node_modules/@tanstack/offline-transactions/dist/esm/connectivity/OnlineDetector.js
var WebOnlineDetector = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Set();
    this.isListening = false;
    this.handleOnline = () => {
      this.notifyListeners();
    };
    this.handleVisibilityChange = () => {
      if (document.visibilityState === `visible`) {
        this.notifyListeners();
      }
    };
    this.startListening();
  }
  startListening() {
    if (this.isListening) {
      return;
    }
    this.isListening = true;
    if (typeof window !== `undefined`) {
      window.addEventListener(`online`, this.handleOnline);
      document.addEventListener(`visibilitychange`, this.handleVisibilityChange);
    }
  }
  stopListening() {
    if (!this.isListening) {
      return;
    }
    this.isListening = false;
    if (typeof window !== `undefined`) {
      window.removeEventListener(`online`, this.handleOnline);
      document.removeEventListener(`visibilitychange`, this.handleVisibilityChange);
    }
  }
  notifyListeners() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (error) {
        console.warn(`OnlineDetector listener error:`, error);
      }
    }
  }
  subscribe(callback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
      if (this.listeners.size === 0) {
        this.stopListening();
      }
    };
  }
  notifyOnline() {
    this.notifyListeners();
  }
  isOnline() {
    if (typeof navigator !== `undefined`) {
      return navigator.onLine;
    }
    return true;
  }
  dispose() {
    this.stopListening();
    this.listeners.clear();
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+offline-transactions@1.0.42/node_modules/@tanstack/offline-transactions/dist/esm/api/OfflineTransaction.js
var OfflineTransaction = class {
  // Will be typed properly - reference to OfflineExecutor
  constructor(options, mutationFn, persistTransaction, executor) {
    this.transaction = null;
    this.offlineId = safeRandomUUID();
    this.mutationFnName = options.mutationFnName;
    this.autoCommit = options.autoCommit ?? true;
    this.idempotencyKey = options.idempotencyKey ?? safeRandomUUID();
    this.metadata = options.metadata ?? {};
    this.persistTransaction = persistTransaction;
    this.executor = executor;
  }
  mutate(callback) {
    this.transaction = createTransaction({
      id: this.offlineId,
      autoCommit: false,
      mutationFn: async () => {
        const offlineTransaction = {
          id: this.offlineId,
          mutationFnName: this.mutationFnName,
          mutations: this.transaction.mutations,
          keys: this.extractKeys(this.transaction.mutations),
          idempotencyKey: this.idempotencyKey,
          createdAt: /* @__PURE__ */ new Date(),
          retryCount: 0,
          nextAttemptAt: Date.now(),
          metadata: this.metadata,
          spanContext: void 0,
          version: 1
        };
        const completionPromise = this.executor.waitForTransactionCompletion(this.offlineId);
        try {
          await this.persistTransaction(offlineTransaction);
          await completionPromise;
        } catch (error) {
          const normalizedError = error instanceof Error ? error : new Error(String(error));
          this.executor.rejectTransaction(this.offlineId, normalizedError);
          throw error;
        }
        return;
      },
      metadata: this.metadata
    });
    this.transaction.mutate(() => {
      callback();
    });
    if (this.autoCommit) {
      this.commit().catch((error) => {
        console.error(`Auto-commit failed:`, error);
        throw error;
      });
    }
    return this.transaction;
  }
  async commit() {
    if (!this.transaction) {
      throw new Error(`No mutations to commit. Call mutate() first.`);
    }
    try {
      await this.transaction.commit();
      return this.transaction;
    } catch (error) {
      if (error instanceof NonRetriableError2) {
        this.transaction.rollback();
      }
      throw error;
    }
  }
  rollback() {
    if (this.transaction) {
      this.transaction.rollback();
    }
  }
  extractKeys(mutations) {
    return mutations.map((mutation) => mutation.globalKey);
  }
  get id() {
    return this.offlineId;
  }
};

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+offline-transactions@1.0.42/node_modules/@tanstack/offline-transactions/dist/esm/api/OfflineAction.js
function isPromiseLike2(value) {
  return !!value && (typeof value === `object` || typeof value === `function`) && typeof value.then === `function`;
}
function createOfflineAction(options, mutationFn, persistTransaction, executor) {
  const { mutationFnName, onMutate } = options;
  console.log(`createOfflineAction 2`, options);
  return (variables) => {
    const offlineTransaction = new OfflineTransaction({
      mutationFnName,
      autoCommit: false
    }, mutationFn, persistTransaction, executor);
    const transaction = offlineTransaction.mutate(() => {
      console.log(`mutate`);
      const maybePromise = onMutate(variables);
      if (isPromiseLike2(maybePromise)) {
        throw new OnMutateMustBeSynchronousError();
      }
    });
    const commitPromise = (async () => {
      try {
        await transaction.commit();
        console.log(`offlineAction committed - success`);
      } catch {
        console.log(`offlineAction commit failed - error`);
      }
    })();
    commitPromise.catch(() => {
    });
    return transaction;
  };
}

// ../../libraries/mecha/packages/node_modules/.deno/@tanstack+offline-transactions@1.0.42/node_modules/@tanstack/offline-transactions/dist/esm/OfflineExecutor.js
var OfflineExecutor$1 = class OfflineExecutor {
  constructor(config) {
    this.isLeaderState = false;
    this.unsubscribeOnline = null;
    this.unsubscribeLeadership = null;
    this.pendingTransactionPromises = /* @__PURE__ */ new Map();
    this.restorationTransactions = /* @__PURE__ */ new Map();
    this.config = config;
    this.scheduler = new KeyScheduler();
    this.onlineDetector = config.onlineDetector ?? new WebOnlineDetector();
    this.storage = null;
    this.outbox = null;
    this.executor = null;
    this.leaderElection = null;
    this.mode = `offline`;
    this.storageDiagnostic = {
      code: `STORAGE_AVAILABLE`,
      mode: `offline`,
      message: `Initializing storage...`
    };
    this.initPromise = new Promise((resolve, reject) => {
      this.initResolve = resolve;
      this.initReject = reject;
    });
    this.initialize();
  }
  /**
   * Probe storage availability and create appropriate adapter.
   * Returns null if no storage is available (online-only mode).
   */
  async createStorage() {
    if (this.config.storage) {
      return {
        storage: this.config.storage,
        diagnostic: {
          code: `STORAGE_AVAILABLE`,
          mode: `offline`,
          message: `Using custom storage adapter`
        }
      };
    }
    const idbProbe = await IndexedDBAdapter.probe();
    if (idbProbe.available) {
      return {
        storage: new IndexedDBAdapter(),
        diagnostic: {
          code: `STORAGE_AVAILABLE`,
          mode: `offline`,
          message: `Using IndexedDB for offline storage`
        }
      };
    }
    const lsProbe = LocalStorageAdapter.probe();
    if (lsProbe.available) {
      return {
        storage: new LocalStorageAdapter(),
        diagnostic: {
          code: `INDEXEDDB_UNAVAILABLE`,
          mode: `offline`,
          message: `IndexedDB unavailable, using localStorage fallback`,
          error: idbProbe.error
        }
      };
    }
    const isSecurityError = idbProbe.error?.name === `SecurityError` || lsProbe.error?.name === `SecurityError`;
    const isQuotaError = idbProbe.error?.name === `QuotaExceededError` || lsProbe.error?.name === `QuotaExceededError`;
    let code;
    let message;
    if (isSecurityError) {
      code = `STORAGE_BLOCKED`;
      message = `Storage blocked (private mode or security restrictions). Running in online-only mode.`;
    } else if (isQuotaError) {
      code = `QUOTA_EXCEEDED`;
      message = `Storage quota exceeded. Running in online-only mode.`;
    } else {
      code = `UNKNOWN_ERROR`;
      message = `Storage unavailable due to unknown error. Running in online-only mode.`;
    }
    return {
      storage: null,
      diagnostic: {
        code,
        mode: `online-only`,
        message,
        error: idbProbe.error || lsProbe.error
      }
    };
  }
  createLeaderElection() {
    if (this.config.leaderElection) {
      return this.config.leaderElection;
    }
    if (WebLocksLeader.isSupported()) {
      return new WebLocksLeader();
    } else if (BroadcastChannelLeader.isSupported()) {
      return new BroadcastChannelLeader();
    } else {
      return {
        requestLeadership: () => Promise.resolve(true),
        releaseLeadership: () => {
        },
        isLeader: () => true,
        onLeadershipChange: () => () => {
        }
      };
    }
  }
  setupEventListeners() {
    if (this.leaderElection) {
      this.unsubscribeLeadership = this.leaderElection.onLeadershipChange((isLeader) => {
        this.isLeaderState = isLeader;
        if (this.config.onLeadershipChange) {
          this.config.onLeadershipChange(isLeader);
        }
        if (isLeader) {
          this.loadAndReplayTransactions();
        }
      });
    }
    this.unsubscribeOnline = this.onlineDetector.subscribe(() => {
      if (this.isOfflineEnabled && this.executor) {
        this.executor.resetRetryDelays();
        if (this.scheduler.getPendingCount() > 0) {
          const barrierPromise = this.executor.executeAll();
          for (const collection of Object.values(this.config.collections)) {
            collection.deferDataRefresh = barrierPromise;
          }
          barrierPromise.catch((error) => {
            console.warn(`Failed to execute transactions on connectivity change:`, error);
          }).finally(() => {
            for (const collection of Object.values(this.config.collections)) {
              if (collection.deferDataRefresh === barrierPromise) {
                collection.deferDataRefresh = null;
              }
            }
          });
        } else {
          this.executor.executeAll().catch((error) => {
            console.warn(`Failed to execute transactions on connectivity change:`, error);
          });
        }
      }
    });
  }
  async initialize() {
    return withSpan(`executor.initialize`, {}, async (span) => {
      try {
        const { storage, diagnostic } = await this.createStorage();
        this.storage = storage;
        this.storageDiagnostic = diagnostic;
        this.mode = diagnostic.mode;
        span.setAttribute(`storage.mode`, diagnostic.mode);
        span.setAttribute(`storage.code`, diagnostic.code);
        if (!storage) {
          if (this.config.onStorageFailure) {
            this.config.onStorageFailure(diagnostic);
          }
          span.setAttribute(`result`, `online-only`);
          this.initResolve();
          return;
        }
        this.outbox = new OutboxManager(storage, this.config.collections);
        this.executor = new TransactionExecutor(this.scheduler, this.outbox, this.config, this);
        this.leaderElection = this.createLeaderElection();
        const isLeader = await this.leaderElection.requestLeadership();
        this.isLeaderState = isLeader;
        span.setAttribute(`isLeader`, isLeader);
        this.setupEventListeners();
        if (this.config.onLeadershipChange) {
          this.config.onLeadershipChange(isLeader);
        }
        if (isLeader) {
          await this.loadAndReplayTransactions();
        }
        span.setAttribute(`result`, `offline-enabled`);
        this.initResolve();
      } catch (error) {
        console.warn(`Failed to initialize offline executor:`, error);
        span.setAttribute(`result`, `failed`);
        this.initReject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }
  async loadAndReplayTransactions() {
    if (!this.executor) {
      return;
    }
    try {
      await this.executor.loadPendingTransactions();
      this.executor.executeAll().catch((error) => {
        console.warn(`Failed to execute transactions:`, error);
      });
    } catch (error) {
      console.warn(`Failed to load and replay transactions:`, error);
    }
  }
  get isOfflineEnabled() {
    return this.mode === `offline` && this.isLeaderState;
  }
  /**
   * Wait for the executor to fully initialize.
   * This ensures that pending transactions are loaded and optimistic state is restored.
   */
  async waitForInit() {
    return this.initPromise;
  }
  createOfflineTransaction(options) {
    const mutationFn = this.config.mutationFns[options.mutationFnName];
    if (!mutationFn) {
      throw new Error(`Unknown mutation function: ${options.mutationFnName}`);
    }
    if (!this.isOfflineEnabled) {
      return createTransaction({
        autoCommit: options.autoCommit ?? true,
        mutationFn: (params) => mutationFn({
          ...params,
          idempotencyKey: options.idempotencyKey || safeRandomUUID()
        }),
        metadata: options.metadata
      });
    }
    return new OfflineTransaction(options, mutationFn, this.persistTransaction.bind(this), this);
  }
  createOfflineAction(options) {
    const mutationFn = this.config.mutationFns[options.mutationFnName];
    if (!mutationFn) {
      throw new Error(`Unknown mutation function: ${options.mutationFnName}`);
    }
    return (variables) => {
      if (!this.isOfflineEnabled) {
        const action2 = createOptimisticAction({
          mutationFn: (vars, params) => mutationFn({
            ...vars,
            ...params,
            idempotencyKey: safeRandomUUID()
          }),
          onMutate: options.onMutate
        });
        return action2(variables);
      }
      const action = createOfflineAction(options, mutationFn, this.persistTransaction.bind(this), this);
      return action(variables);
    };
  }
  async persistTransaction(transaction) {
    await this.initPromise;
    return withNestedSpan(`executor.persistTransaction`, {
      "transaction.id": transaction.id,
      "transaction.mutationFnName": transaction.mutationFnName
    }, async (span) => {
      if (!this.isOfflineEnabled || !this.outbox || !this.executor) {
        span.setAttribute(`result`, `skipped_not_leader`);
        this.resolveTransaction(transaction.id, void 0);
        return;
      }
      try {
        await this.outbox.add(transaction);
        await this.executor.execute(transaction);
        span.setAttribute(`result`, `persisted`);
      } catch (error) {
        console.error(`Failed to persist offline transaction ${transaction.id}:`, error);
        span.setAttribute(`result`, `failed`);
        throw error;
      }
    });
  }
  // Method for OfflineTransaction to wait for completion
  async waitForTransactionCompletion(transactionId) {
    const existing = this.pendingTransactionPromises.get(transactionId);
    if (existing) {
      return existing.promise;
    }
    const deferred = {};
    deferred.promise = new Promise((resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });
    this.pendingTransactionPromises.set(transactionId, deferred);
    return deferred.promise;
  }
  // Method for TransactionExecutor to signal completion
  resolveTransaction(transactionId, result) {
    const deferred = this.pendingTransactionPromises.get(transactionId);
    if (deferred) {
      deferred.resolve(result);
      this.pendingTransactionPromises.delete(transactionId);
    }
    this.cleanupRestorationTransaction(transactionId);
  }
  // Method for TransactionExecutor to signal failure
  rejectTransaction(transactionId, error) {
    const deferred = this.pendingTransactionPromises.get(transactionId);
    if (deferred) {
      deferred.reject(error);
      this.pendingTransactionPromises.delete(transactionId);
    }
    this.cleanupRestorationTransaction(transactionId, true);
  }
  // Method for TransactionExecutor to register restoration transactions
  registerRestorationTransaction(offlineTransactionId, restorationTransaction) {
    this.restorationTransactions.set(offlineTransactionId, restorationTransaction);
  }
  cleanupRestorationTransaction(transactionId, shouldRollback = false) {
    const restorationTx = this.restorationTransactions.get(transactionId);
    if (!restorationTx) {
      return;
    }
    this.restorationTransactions.delete(transactionId);
    if (shouldRollback) {
      restorationTx.rollback();
      return;
    }
    restorationTx.setState(`completed`);
    const touchedCollections = /* @__PURE__ */ new Set();
    for (const mutation of restorationTx.mutations) {
      if (!mutation.collection) {
        continue;
      }
      const collectionId = mutation.collection.id;
      if (touchedCollections.has(collectionId)) {
        continue;
      }
      touchedCollections.add(collectionId);
      mutation.collection._state.transactions.delete(restorationTx.id);
      mutation.collection._state.recomputeOptimisticState(false);
    }
  }
  async removeFromOutbox(id) {
    if (!this.outbox) {
      return;
    }
    await this.outbox.remove(id);
  }
  async peekOutbox() {
    if (!this.outbox) {
      return [];
    }
    return this.outbox.getAll();
  }
  async clearOutbox() {
    if (!this.outbox || !this.executor) {
      return;
    }
    await this.outbox.clear();
    this.executor.clear();
  }
  getPendingCount() {
    if (!this.executor) {
      return 0;
    }
    return this.executor.getPendingCount();
  }
  getRunningCount() {
    if (!this.executor) {
      return 0;
    }
    return this.executor.getRunningCount();
  }
  getOnlineDetector() {
    return this.onlineDetector;
  }
  isOnline() {
    return this.onlineDetector.isOnline();
  }
  dispose() {
    for (const collection of Object.values(this.config.collections)) {
      collection.deferDataRefresh = null;
    }
    if (this.unsubscribeOnline) {
      this.unsubscribeOnline();
      this.unsubscribeOnline = null;
    }
    if (this.unsubscribeLeadership) {
      this.unsubscribeLeadership();
      this.unsubscribeLeadership = null;
    }
    if (this.leaderElection) {
      this.leaderElection.releaseLeadership();
      if (`dispose` in this.leaderElection) {
        this.leaderElection.dispose();
      }
    }
    this.onlineDetector.dispose();
  }
};
function startOfflineExecutor(config) {
  return new OfflineExecutor$1(config);
}

// ../../libraries/mecha/packages/client/src/mecha-client.ts
var DELETE_CONFIRM_TIMEOUT_MS = 3e4;
var SHAPE_IDLE_MS = 5e3;
function resolveUrl(raw) {
  if (raw.startsWith("/") && typeof window !== "undefined") {
    return window.location.origin + raw;
  }
  return raw;
}
function createMechaClient(config) {
  const electricUrl = resolveUrl(config.electricUrl ?? "/electric");
  const crudUrl = config.crudUrl ?? "/crud";
  const doFetch = config.fetcher ?? fetch;
  const maxAge = config.maxTransactionAgeMs ?? 7 * 24 * 60 * 60 * 1e3;
  const byId = /* @__PURE__ */ new Map();
  for (const t of config.tables) {
    byId.set(t.id, {
      id: t.id,
      table: t.table,
      key: t.key ?? "id",
      durability: t.durability ?? "crud"
    });
  }
  const phases = /* @__PURE__ */ new Map();
  const phaseListeners = /* @__PURE__ */ new Set();
  function setPhase(k, phase) {
    if (phase === null) phases.delete(k);
    else phases.set(k, phase);
    phaseListeners.forEach((fn) => fn());
  }
  const collections = {};
  const isLocal = (t) => t.durability === "tab" || t.durability === "device";
  for (const t of byId.values()) {
    if (isLocal(t)) {
      collections[t.id] = createCollection(t.durability === "device" ? localStorageCollectionOptions({
        id: `mecha:${t.id}`,
        storageKey: `mecha:${t.id}`,
        getKey: (item) => item[t.key]
      }) : localOnlyCollectionOptions({
        id: `mecha:${t.id}`,
        getKey: (item) => item[t.key]
      }));
      continue;
    }
    collections[t.id] = createCollection({
      // Never startSync: true. Sync begins on the first subscriber, so a
      // screen opens only the shapes its regions actually read.
      gcTime: config.shapeIdleMs ?? SHAPE_IDLE_MS,
      ...electricCollectionOptions({
        id: `mecha:${t.id}`,
        getKey: (item) => item[t.key],
        shapeOptions: {
          url: `${electricUrl}/v1/shape`,
          params: {
            table: t.table
          },
          // int8 (every mecha table's txid) must land as Number, not the
          // client default BigInt: synced rows become mutation originals in
          // the offline outbox, whose JSON serialization has no BigInt path
          // and would throw on every update/delete of a synced row. txids
          // stay far below 2^53, so Number is lossless here.
          parser: {
            int8: (value) => Number(value)
          }
        }
      })
    });
  }
  function headers(extra = {}) {
    const token = config.token?.();
    return {
      "Content-Type": "application/json",
      ...token ? {
        Authorization: `Bearer ${token}`
      } : {},
      ...extra
    };
  }
  async function requireOk(res, what) {
    if (res.ok) return res;
    const body = await res.text().catch(() => "");
    const message = `${what} failed: ${res.status} ${body.slice(0, 200)}`;
    if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) {
      throw new NonRetriableError2(message);
    }
    throw new Error(message);
  }
  async function confirmTxid(collectionId, rows) {
    const txid = rows?.[0]?.txid;
    if (txid === void 0 || txid === null) return;
    await collections[collectionId].utils.awaitTxId(Number(txid));
  }
  async function confirmDelete(collectionId, keyColumn, key) {
    const utils = collections[collectionId].utils;
    await utils.awaitMatch((message) => message?.headers?.operation === "delete" && String(message?.value?.[keyColumn] ?? message?.key ?? "") === String(key), DELETE_CONFIRM_TIMEOUT_MS);
  }
  const mutationFns = {};
  for (const t of byId.values()) {
    if (isLocal(t)) continue;
    mutationFns[`insert:${t.id}`] = async ({ transaction, idempotencyKey }) => {
      const row = transaction.mutations[0].modified;
      const res = await doFetch(`${crudUrl}/${t.table}`, {
        method: "POST",
        headers: headers({
          Prefer: "return=representation",
          "Idempotency-Key": idempotencyKey
        }),
        body: JSON.stringify(row)
      });
      await requireOk(res, `insert ${t.table}`);
      await confirmTxid(t.id, await res.json().catch(() => []));
      setPhase(`${t.id}:${row[t.key]}`, null);
    };
    mutationFns[`update:${t.id}`] = async ({ transaction }) => {
      const m = transaction.mutations[0];
      const key = m.key ?? m.original?.[t.key];
      const res = await doFetch(`${crudUrl}/${t.table}?${t.key}=eq.${encodeURIComponent(key)}`, {
        method: "PATCH",
        headers: headers({
          Prefer: "return=representation"
        }),
        body: JSON.stringify(m.changes)
      });
      await requireOk(res, `update ${t.table}`);
      await confirmTxid(t.id, await res.json().catch(() => []));
      setPhase(`${t.id}:${key}`, null);
    };
    mutationFns[`delete:${t.id}`] = async ({ transaction }) => {
      const m = transaction.mutations[0];
      const key = m.key ?? m.original?.[t.key];
      const res = await doFetch(`${crudUrl}/${t.table}?${t.key}=eq.${encodeURIComponent(key)}`, {
        method: "DELETE",
        headers: headers()
      });
      await requireOk(res, `delete ${t.table}`);
      await confirmDelete(t.id, t.key, key);
      setPhase(`${t.id}:${key}`, null);
    };
  }
  const executor = startOfflineExecutor({
    collections,
    mutationFns,
    jitter: true,
    beforeRetry: (txs) => {
      const cutoff = Date.now() - maxAge;
      return txs.filter((tx) => tx.createdAt.getTime() > cutoff);
    }
  });
  function run(mutationFnName, phaseKey, mutate) {
    setPhase(phaseKey, "queued");
    const tx = executor.createOfflineTransaction({
      mutationFnName,
      autoCommit: false
    });
    tx.mutate(mutate);
    return tx.commit().then(() => void 0);
  }
  return {
    collections,
    ready: executor.waitForInit().then(() => void 0),
    insert(tableId, row) {
      const t = byId.get(tableId);
      if (!t) throw new Error(`unknown table id: ${tableId}`);
      if (row[t.key] === void 0) throw new Error(`insert ${tableId}: caller must mint '${t.key}' \u2014 retries depend on it`);
      if (isLocal(t)) return Promise.resolve(void collections[tableId].insert(row));
      return run(`insert:${tableId}`, `${tableId}:${row[t.key]}`, () => collections[tableId].insert(row));
    },
    update(tableId, key, changes) {
      const t = byId.get(tableId);
      if (!t) throw new Error(`unknown table id: ${tableId}`);
      const apply = () => collections[tableId].update(key, (draft) => {
        Object.assign(draft, changes);
      });
      if (isLocal(t)) return Promise.resolve(void apply());
      return run(`update:${tableId}`, `${tableId}:${key}`, apply);
    },
    remove(tableId, key) {
      const t = byId.get(tableId);
      if (!t) throw new Error(`unknown table id: ${tableId}`);
      if (isLocal(t)) return Promise.resolve(void collections[tableId].delete(key));
      return run(`delete:${tableId}`, `${tableId}:${key}`, () => collections[tableId].delete(key));
    },
    syncPhase(tableId, key) {
      return phases.get(`${tableId}:${key}`);
    },
    subscribeSyncPhases(listener) {
      phaseListeners.add(listener);
      return () => phaseListeners.delete(listener);
    }
  };
}
export {
  BTreeIndex,
  BasicIndex,
  and,
  createLiveQueryCollection,
  createMechaClient,
  eq,
  gt,
  gte,
  inArray,
  isNull,
  liveQueryCollectionOptions,
  lt,
  lte,
  not,
  or
};
