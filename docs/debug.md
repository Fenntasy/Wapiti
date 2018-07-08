---
id: debug
title: Debug your pages
---

Sometimes, you don't really know what happens during your test.

Here are two useful tips to see more of what happens:

## See the logs from the tested page

```javascript
Wapiti()
  .puppeteer(page =>
    page.on("console", event => {
      Promise.all(event.args.map(JSHandle => JSHandle.jsonValue()))
        .then(console.log)
        .catch(() => console.warn("tried to display an object with a circular reference"));
    })
  )
  .goto("http://localhost"))
  // rest of your test
```

## See the current HTML of your page

```javascript
Wapiti()
  .goto("http://localhost"))
  .puppeteer(page => page.content().then(console.log))
  // rest of your test
```
