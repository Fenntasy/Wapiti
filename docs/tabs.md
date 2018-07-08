---
id: tabs
title: Multiple tabs
---

When dealing with a link that opens a new tab, you may want to navigate between tabs for your tests.

Like with a true browser, clicking on a link that opens a new tab will work but, in order for tests to work, you will want to wait for the page in the new tab to load, that's the goal of `clickAndWaitForNewTab`.

In this example, we have a link with an id `link` and a `target="_blank"`.
We click on it via `clickAndWaitForNewTab` and we can then use `nextTab()` and `previousTabs()` to change the current page where we can capture what we want.

```javascript
const path = require("path");
const Wapiti = require("wapiti");

test("it should get the content of elements of the page", async () => {
  expect.assertions(1);
  return Wapiti().goto("http://localhost:3000")
    .clickAndWaitForNewTab("#link")
    .nextTab()
    .capture(() => document.querySelector("h1").textContent)
    .previousTab()
    .capture(() => document.querySelector("h1").textContent)
    .run(result => {
      expect(result).toEqual(["blank page", "first page"]);
    });
});
```

Or if you prefer _async/await_

```javascript
const path = require("path");
const Wapiti = require("wapiti");

test("it should get the content of elements of the page", async () => {
  expect.assertions(1);
  const result = await Wapiti().goto("http://localhost:3000")
    .clickAndWaitForNewTab("#link")
    .nextTab()
    .capture(() => document.querySelector("h1").textContent)
    .previousTab()
    .capture(() => document.querySelector("h1").textContent)
    .run();
  expect(result).toEqual(["blank page", "first page"]);
});
```
