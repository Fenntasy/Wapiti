/* global test expect document */

const Wapiti = require("../../index");
const liveServer = require("live-server");

// using the todomvc react app from http://todomvc.com/examples/react/
test("should be able to add a todo", async () => {
  const params = {
    port: 8181, // Set the server port. Defaults to 8080.
    host: "localhost", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
    root: "./tests/todomvc/server", // Set root directory that's being served. Defaults to cwd.
    open: false, // When false, it won't load your browser by default.
    logLevel: 0
  };
  liveServer.start(params);
  const result = await Wapiti.goto("http://localhost:8181/")
    .typeIn(".new-todo", "first todo")
    .puppeteer(page => {
      return page.content().then(console.log);
      return page
        .waitFor(".new-todo")
        .then(() =>
          page.focus(".new-todo").then(() => page.keyboard.press("Enter"))
        );
    })
    .capture(() => document.querySelector(".view label").textContent)
    .click(".toggle-all")
    .capture(() => document.querySelector(".toggle").checked)
    .run();
  expect(result).toEqual(["first todo", true]);
  liveServer.shutdown();
});
