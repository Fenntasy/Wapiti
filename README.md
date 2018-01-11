# Wapiti

[![Build Status](https://travis-ci.org/Fenntasy/Wapiti.svg?branch=master)](https://travis-ci.org/Fenntasy/Wapiti)

![](https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/The_deer_of_all_lands_%281898%29_Altai_wapiti.png/207px-The_deer_of_all_lands_%281898%29_Altai_wapiti.png)

Integration testing based on [Puppeteer](https://github.com/GoogleChrome/puppeteer).

Wapiti is aimed at single page apps that rely on APIs.
The goal is to be able to use the [VCR pattern](https://github.com/vcr/vcr) in order to first mock the API on your local tests and then be able to commit the results and test it on your continuous integration.
VCR is optional and can be setup for each tests.

You can also read more on [why this project exists](docs/WHY.md)

## Installation

`npm install --save-dev wapiti`

## Documentation

You can read all documentation on the [website](https://Fenntasy.github.io/Wapiti).

You can also check the [tests folder](tests/) for more examples.

## Example

In theory, you could use Wapiti with any test framework, here is an example with [Jest](https://facebook.github.io/jest/)

```javascript
const path = require("path");
const Wapiti = require("wapiti");

test("it should get the content of elements of the page", async () => {
  const result = await Wapiti.goto("file://" + path.join(__dirname, "getH1.html"))
    .capture(() => document.querySelector("h1").textContent)
    .capture(() => document.querySelector("h2").textContent)
    .run();
  expect(result).toEqual(["content of h1", "content of h2"]);
});

// And with VCR
test("it should use the Wapiti fetch", async () => {
  const result = await Wapiti.setupVCR()
    .goto("file://" + path.join(__dirname, "fetch.html")) // will try to fetch "https://api.github.com/users/github"
    .capture(() => document.querySelector("#result").textContent)
    .run();

  expect(result).toEqual("9919"); // ID of github user on github
});
```

## Thanks

This project could not have seen the light of day without the work of the talented people at Google on [Puppeteer](https://github.com/GoogleChrome/puppeteer).
