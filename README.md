Payloader
=========

Load your JS & CSS in a sane, performant way.

![(Unlike this spectacular display)](https://i.imgur.com/1srMrZh.jpg)

Draws inspiration from [melchior.js](http://labs.voronianski.com/melchior.js/) as well as other popular loaders.

The main difference from existing module loaders is how files are loaded and configured. Instead of loading every declared module all at once each one will be retrieved on-demand. This provides for a faster startup of your page, one of the most important metrics in terms of perceived performance. In order to efficiently retrieve files on-demand Payloader needs to know all of the requirements up front. This is where the `config()` method comes in.

You *can* hand-maintain the config object if you wish, but it isn't recommended. Instead you should install `payloader-cli` and run it from within your application. See the [CLI section](#cli) of this document for more details.

## Examples

Declare a module w/ requirements

```js
payloader("example")
.requires("router")
.requires("template")
.body(function() {
    // router & template modules were downloaded & executed
    // before this function was invoked, so they're fully
    // ready at this point
    router.get("/fooga", ... );
});
```

Example simple module config

```js
payloader.config({
    // router module has no dependencies, so it is a simple string
    router : "https://cdn.payloader.com/router.js",
    
    // template does require things, so it's more complex
    template : {
        url : "https://cdn.payloader.com/template.js",
        requires : [ "escape-html" ]
    },
    
    // This is identical to what the module declares
    example : {
        url : "https://cdn.payloader.com/example.js",
        requires : [ "example", "router" ]
    }
});
```

Repetition within the config does make it larger on disk, but that is trivially made up with gzip.

## CLI

In order to improve loading performance and prevent you from pulling out your hair debugging meta-data differences we **strongly** recommend using the `payloader-cli` tool to generate your config.

### Example
```json
...
"scripts" : {
    "payloader" : "payloader . --url=\"https://cdn.payloader.com\" --output=\"./config.js\""
}
...
```

Then from the CLI you can run `npm run payloader` and it will generate a new config for you based on the files on your local disk.

### Watching

`payloader-cli` also supports watching the file system for changes and re-generating the config. Simply call the `watch` command with the same arguments you would use for a non-watching invocation and it will monitor your files for changes, re-generating the config file when necessary.

```json
...
"scripts" : {
    "payloader" : "payloader watch . --url=\"https://cdn.payloader.com\" --output=\"./config.js\""
}
...
```

## API

### `payloader("<module>")`

The main entrypoint for Payloader is a function that takes a single string argument representing the name of the module and returns a module instance ready to be decorated with more metadata.

```js
payloader("module"); // Returns a module named "module"
```

#### `module.requires("<dependency>", ["<alias>"])`

Make the target module require that `dependency` be loaded before it runs. Optionally accepts alias for the dependency to change the name of the local variable the dependency's exports are bound to.

```js
payloader("test-alias")
.requires("fooga")
.requires("booga", "b")
.bound(function() {
    // fooga, booga, and b are available. b is a reference to booga
});
```

#### `module.body(<function>)`

The function argument passed to body will be executed when this module is required by any other module. Its return value will be used as the exports.

```js
payloader("append-a")
.body(function() {
    return function(str) {
        return str + "a";
    }
});

payloader("test-append")
.requires("append-a", "append")
.body(function() {
    append("abcdefg"); //"abcdefga"
});
```

### `payloader.config(<object>)`

The `config()` method takes a simple object that defines information about all the available modules. Modules w/o dependencies can be simple `key:value` pairs. Modules with dependencies are an object with a `url` and `requires` property.

```js
payloader.config({
    "fooga" : "/fooga.js",
    "booga" : "/wooga/looga/booga.js",
    "append-a" : "/append-a.js"
    
    "test-append" : {
        url : "/test.js",
        requires : [ "append-a" ]
    },
    
    "test-alias" : {
        url : "/test-alias.js",
        requires : [ "fooga", "booga" ]
    }
});
```
