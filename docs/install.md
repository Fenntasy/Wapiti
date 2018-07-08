---
id: install
title: Installation
---

```shell
npm install --save-dev wapiti
```

If you want to use it with [Jest](https://facebook.github.io/jest/), you will need to add it as a dependency as well but you're free to use any test runner that will let you run tests with promises.

You then just have to _require_ it in your tests.

```javascript
const Wapiti = require("wapiti");

test("it should get the content of elements of the page", () => {
  return Wapiti().goto("http://localhost:3000/index.html")
    .capture(() => document.querySelector("h1").textContent)
    .capture(() => document.querySelector("h2").textContent)
    .run()
    .then(result => {
      expect(result).toEqual(["content of h1", "content of h2"]);
    });
});
```

Or if you prefer _async/await_

```javascript
const Wapiti = require("wapiti");

test("it should get the content of elements of the page", async () => {
  const result = await Wapiti().goto("http://localhost:3000/index.html")
    .capture(() => document.querySelector("h1").textContent)
    .capture(() => document.querySelector("h2").textContent)
    .run();
  expect(result).toEqual(["content of h1", "content of h2"]);
});
```
