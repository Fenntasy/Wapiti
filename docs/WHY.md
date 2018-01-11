---
id: why
title: Why Wapiti?
sidebar_label: Why Wapiti?
---

There is a lot of projects that do integration tests that are really more mature than Wapiti and maybe you should look them up (not exhaustive list: [Nightwatch.js](http://nightwatchjs.org/), [Nightmare](http://www.nightmarejs.org/), [CasperJS](http://casperjs.org/), [Protractor](http://www.protractortest.org/#/)).

**Wapiti aim to be used when you need to test a web app that rely on more API than you care to mock.**

This is done by using the VCR Pattern which is named after an [old way of recording and seeing movies](https://en.wikipedia.org/wiki/Videocassette_recorder) that is now in par with the [floppy disk](https://en.wikipedia.org/wiki/Floppy_disk) (aka "the save button").
What that mean is that you will really do the API calls the first time and that request will be recorded on files and replayed from that recording on the subsequent tests.

This can be useful in that kind of scenario: you have a project that is separated in two github repositories, one for the API and one for the frontend that consumes it.
You want to do continuous integration, how do you test your frontend independantly?
Do you really want to get your backend launched during your tests? Or maybe test it with an external server (maybe a staging)?

That's what Wapiti aim to be good at!
Record on your laptop the calls to your API during your development, add the recordings to your repository with your tests and you can rely on that to run tests during your continous integration testing.

That being said, **Wapiti is not here to test your code on every browser on the market**.
The asumption is that working on Chrome is a good indicator of the global working of your application.
That's why it depends only on Puppeteer and does not have any link to Selenium which you could find not suited for your projects.
