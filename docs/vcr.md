---
id: vcr
title: Use with APIs
---

Wapiti has a built-in replacement of `fetch` that use the VCR pattern but it must be activated with the `setupVCR` method.
The idea is that running your test locally a first time will record all calls made with fetch to any API and store the results in a fixture directory.

When you run your test after that, the recorded calls will be played back.
That way, you can safely commit you fixtures and have you tests run on your continous integration without having to launch your APIs.

> ⚠️ Note that by default, the headers `authorization` and `user-agent` are ignored but URL parameters are saved in the fixtures files.
> Take care to not set API key or access tokens in the URL.
>
> See [the setupVCR method](/wapiti/docs/api.html#wapitisetupvcroptions) for more information


```javascript
const Wapiti = require("wapiti");

test("it should use the Wapiti fetch", () => {
  return Wapiti.setupVCR()
    .goto("http://localhost:3000") // will try to fetch "https://api.github.com/users/github"
    .capture(() => document.querySelector("#result").textContent)
    .run()
    .then(result => {
      expect(result).toEqual("9919"); // ID of github user on github
    });
});
```

Or if you prefer _async/await_

```javascript
const Wapiti = require("wapiti");

test("it should use the Wapiti fetch", async () => {
  const result = await Wapiti.setupVCR()
    .goto("http://localhost:3000") // will try to fetch "https://api.github.com/users/github"
    .capture(() => document.querySelector("#result").textContent)
    .run();

  expect(result).toEqual("9919"); // ID of github user on github
});
```
