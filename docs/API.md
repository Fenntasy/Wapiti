# API

##### Table of Contents

* [Wapiti.prepare()](#wapitiprepare)
* [Wapiti.setupVCR(options)](#wapitisetupvcroptions)
* [Wapiti.goto(url)](#wapitigotourl)
* [Wapiti.click(selector)](#wapiticlickselector)
* [Wapiti.typeIn(selector, value)](#wapititypeinselector-value)
* [Wapiti.fillForm(data)](#wapitifillformdata)
* [Wapiti.capture(func)](#wapiticapturefunc)
* [Wapiti.captureUrl()](#wapiticaptureurl)
* [Wapiti.puppeteer(func)](#wapitipuppeteerfunc)
* [Wapiti.run()](#wapitirun)

#### Wapiti.prepare()

Start the chain of events you want to send for your test.

#### Wapiti.setupVCR(options)

Use the VCR for this test.

`options` can be omited and defaults to `{fixturePath: "./_fixtures", mode: "cache"}`.
The `fixturePath` will be created if it does not exists and can be an absolute or relative path (starting from where you launch your tests).
`mode` can be either `cache` (attempts to read from the VCR and fetch it if not present), `record` (always fetch and record) or `playback` (always read from the VCR).

The VCR mode is still in development and will only work with calls done with `fetch` in your web app.
Furthermore, the promise produced by `fetch` can only use the `json` and `text` function in the ensuing `then`.
Please make an issue if you need something else.

#### Wapiti.goto(url)

Go to a URL and resolve when there is no more network requests.

#### Wapiti.click(selector)

Click on the first result returned by `document.querySelector(selector)`.

#### Wapiti.typeIn(selector, value)

Will insert `value` in the input found by `selector`.

#### Wapiti.fillForm(data)

Handle the work of filling a form and submiting it.
`data` is an object with input selectors as key and the desired input value as value.


```javascript
Wapiti.goto("http://localhost"))
  .fillForm({
    "#firstInput": "test1", // will result in <input id="firstInput" value="test1" />
    ".secondInput": "test2" // will result in <input class="secondInput" value="test2" />
  })
```

The form in which these input belong will then be submitted and the resulting page will be waited for.
Please note that this function will only work if there is a real navigation occuring, if the submit event is hijacked, you will need to use `Wapiti.insert` and `Wapiti.click` instead.

#### Wapiti.capture(func)

Execute `func` on the current page and add an entry to the end result.
If only one `capture` call is done, the end result will be its value.
If several calls are made, the end result will be an array with all captures.

#### Wapiti.captureUrl()

Convenience function for getting the URL of the page and adding it to the captures.
Functionnally equivalent to `Wapiti.capture(() => document.location.href)`

#### Wapiti.puppeteer(func)

Allows you to use the puppeteer API yourself.
`func` will be passed the `page` object and you can use any method of the [puppeteer API](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md).

In most cases, you should not need to wait for something with Wapiti (the defaults try to be enough) but if you need it, you can do it like this:

```javascript
Wapiti.goto("http://localhost"))
  .puppeteer(page => page.waitFor(2000))
```

#### Wapiti.run()

Really start the chain of events and return a promise with that should resolve with either the result of the `capture` call or an array with the results of the `capture` calls.
