---
id: api
title: API
sidebar_label: All methods
---

## Methods

* [Wapiti.capture(func)](#wapiticapturefunc)
* [Wapiti.captureUrl()](#wapiticaptureurl)
* [Wapiti.click(selector)](#wapiticlickselector)
* [Wapiti.clickAndWaitForNewTab(selector)](#wapiticlickandwaitfornewtabselector)
* [Wapiti.fillForm(data, options)](#wapitifillformdata-options)
* [Wapiti.goto(url)](#wapitigotourl)
* [Wapiti.nextTab()](#wapitinexttab)
* [Wapiti.previousTab()](#wapitiprevioustab)
* [Wapiti.puppeteer(func)](#wapitipuppeteerfunc)
* [Wapiti.run()](#wapitirun)
* [Wapiti.setupVCR(options)](#wapitisetupvcroptions)
* [Wapiti.typeIn(selector, value)](#wapititypeinselector-value)

---

#### Wapiti.capture(func)

Execute `func` on the current page and add an entry to the end result.
If only one `capture` call is done, the end result will be its value.
If several calls are made, the end result will be an array with all captures.

---

#### Wapiti.captureUrl()

Convenience function for getting the URL of the page and adding it to the captures.
Functionnally equivalent to `Wapiti.capture(() => document.location.href)`.

---

#### Wapiti.click(selector)

Click on the first result returned by `document.querySelector(selector)`.

---

#### Wapiti.clickAndWaitForNewTab(selector)

Click on the first result returned by `document.querySelector(selector)` and wait for a tab to be opened before doing the rest of operations.
Beware that it will wait until your test timeout if no new tab is opened.

---

#### Wapiti.fillForm(data, options)

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

`fillForm` has a second optional parameter which is an object with these options:

| parameter       | type    | description                      | default |
|-----------------|---------|----------------------------------|---------|
| submitForm      | Boolean | will the form be submitted       | true    |
| waitForPageLoad | Boolean | will wait for a new page load    | true    |

So if you want to fill in a form where the submit is prevented from JavaScript ([more in-depth explanation](/Wapiti/blog/2018/01/13/hijacked-forms.html)):

```javascript
Wapiti.goto("http://localhost"))
  .fillForm({
    "#firstInput": "test1",
    ".secondInput": "test2"
  }, { waitForPageLoad: false })
```

> ⚠️  `waitForPageLoad` depends on `submitForm` and will be ignored if `submitForm` is false.

---


#### Wapiti.goto(url)

Go to a URL and resolve when there is no more network requests.

---

#### Wapiti.nextTab()

Change tab by going to the next one.
If the browser was already on the last tab, it will go back to the first one.
If there is only one tab open, it will not do anything but display a warning.

---

#### Wapiti.previousTab()

Change tab by going to the previous one.
If the browser was already on the first tab, it will go to the last one.
If there is only one tab open, it will not do anything but display a warning.

---

#### Wapiti.puppeteer(func)

Allows you to use the puppeteer API yourself.
`func` will be passed the `page` object and the `browser` and you can use any method of the [puppeteer API](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md).

In most cases, you should not need to wait for something with Wapiti (the defaults try to be enough) but if you need it, you can do it like this:

```javascript
Wapiti.goto("http://localhost"))
  .puppeteer(page => page.waitFor(2000))
```

---

#### Wapiti.run()

Really start the chain of events and return a promise with that should resolve with either the result of the `capture` call or an array with the results of the `capture` calls.

---

#### Wapiti.setupVCR(options)

Use the VCR for this test.

`options` can be omited and defaults to:

```javascript
{
  fixturePath: "./_fixtures",
  mode: "cache",
  headerBlacklist: ["authorization", "user-agent"]
}
```

The `fixturePath` will be created if it does not exists and can be an absolute or relative path (starting from where you launch your tests).
`mode` can be either `cache` (attempts to read from the VCR and fetch it if not present), `record` (always fetch and record) or `playback` (always read from the VCR).

The VCR mode is still in development and will only work with calls done with `fetch` in your web app.
Furthermore, the promise produced by `fetch` can only use the `json` and `text` function in the ensuing `then`.
Please make an issue if you need something else.

`headerBlacklist` is an array of keys that will be ignored in the fixtures and the request (whichever value they have will not be taken into account). These keys must be lowercase.

---

#### Wapiti.typeIn(selector, value)

Will insert `value` in the input found by `selector`.
