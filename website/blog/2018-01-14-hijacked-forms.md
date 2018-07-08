---
title: v2.0.0 Better form support
author: Vincent Billey
authorURL: http://twitter.com/Fenntasy
---

A major update that updates the API for `fillForm` and updates Puppeteer to 1.0.0.

<!--truncate-->

## TL;DR;

* `fillForm` has a new optional parameter to cancel submit or not wait for a new page (if the submit event is `preventDefault()`)
* Updated to Puppeteer 1.0.0
* Wapiti should be able to run on CI or inside Docker with the environnement variables IN_CI or IN_DOCKER
* Docs are improved

> Warning: This code in this article is valid only for the 2.0 branch

## What happened and why

It was recently pointed to me (by the creator of the new logo) that there is a problem with the `fillForm` API.

My original intent was to make it easier for forms to be filled out, by passing an object with selectors as keys and values as what was going in those field and submiting the form.

All that is good and all, but I forgot something, or more accurately, I assumed that a form would always trigger a new page so I used a `waitForNavigation` internally.

Aside from that, I used to have a method called `insert` that would correct something I found tedious in the old Puppeteer API: to fill an input, you first had to `focus` on it then use `type`.
So I made `insert` that was doing the combination of the two with just a selector and a value.
But Puppeteer updated itself to have the `type` function do just that so I renamed it `typeIn` to match the naming of Puppeteer.

And then I made two mistakes:
* Assuming that the form would trigger a new page when you could want your form to be submitted but without going to another page (like a lot of SPA nowadays) and assuming on top of that that in that case, you wouldn't want to use the `fillForm` function.
* Not changing the documentation to reflect the renaming of `insert` and still referencing it for `fillForm`.

With this new version, I intend to change a bit the `fillForm` API to add a new optional parameter.

### fillForm options

There is now an optional object that you can pass as a second parameter to `fillForm` where you can decide if the form will be submitted or not and if Wapiti needs to wait for a new page to load.

I thought of three scenarios.
The first one is the one I had in mind first: you want to fill in a form that will be submitted on a new page, nothing change here, this is still the default:

```javascript
Wapiti.goto("http://localhost"))
  .fillForm({
    "#firstInput": "test1",
    ".secondInput": "test2"
  })
```

The second one is when you want the form to be submitted but the event will be prevented (by `event.preventDefault()`), be it from a React/Vue/Angular/jQuery app.
You just need to set the `waitForPageLoad` parameter to `false`:

```javascript
Wapiti.goto("http://localhost"))
  .fillForm({
    "#firstInput": "test1",
    ".secondInput": "test2"
  }, { waitForPageLoad: false })
```

The last scenario I can see is that you just want to fill in some inputs and have nothing else done afterwards.
You need to set `submitForm` to `false` and there will no need to wait for any page load.

```javascript
Wapiti.goto("http://localhost"))
  .fillForm({
    "#firstInput": "test1",
    ".secondInput": "test2"
  }, { submitForm: false })
```

### How to submit a form

I learned a lot of things coding this.

My previous approach for sending forms was to select the first input I was given with `document.querySelector` and then getting its `form` property to finally calll `.submit()` on it.
I am sad to see that this method does not trigger the `onSubmit` event from the form.

This method could not be used anymore to manage controlled forms.

The simple solution is then to query for something to submit, like `[type="submit"]` and then click on it.
This works for (I think) a lot of cases but there is the case where you don't have an explicit button or input with a `type="submit"` attribute.

What then? Well, I tried adding a button I created myself to the form to click on it.
I thought I was clever but then I remembered it would not work for frameworks with a virtual DOM (I know it would not work for React or Elm at least).

So I researched how to simulate a press of the Enter key.
And... I couldn't do it!
Believe me, I tried to find a way of doing that myself inside of Chrome (using Puppeteer, I don't need an all browser solution) but I really don't know how to use [KeyBoardEvent](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/KeyboardEvent).
At least not inside an input.

If you have done this feat, please contact me with an example on [twitter](https://twitter.com/Fenntasy), I would love to know!

So... No way?
Well, yeah, but not a perfect one: Puppeteer gives us a function to press the Enter key so the only difficulty was to get the right input to use it on.

So my approach is now to check if there is a `[type="submit"]` to click and do it if I found one, then I try to find a text input and then a password input.
If I find one of these two, I press Enter on it and it should submit the form, otherwise I display a warning.

I'll try to do better in the future if I find a new way but for the moment, it passes my tests.

## Updating Puppeteer to 1.0.0

This is just a formality but what drove me to bump Wapiti version to 2.0.0.
Because it's a major upgrade of Puppeteer, so using the `.puppeteer` method could be broken on some tests.

Other than that, nothing broke on my part because I don't use a lot of internals of Puppeteer at the moment.

## CI and Docker

Running Chrome headless on some environment needs to use a flag for Puppeteer.
I don't pretend to know all that is done but Chrome need to be run with the `--no-sandbox` flag.

So I added it if either `IN_CI` or `IN_DOCKER` are found in the environement variables when running the tests.

## Improved Documentation

As you can see here, Wapiti is now using Docusaurus for its documentation and I added some guides to be more friendly to newcomers.

The last addition is a guide to [debug your pages](/Wapiti/docs/debug.html), namely to see the `console.log` calls from inside the tested pages and see the HTML of your page.

---

I hope this helps everyone who would want to use Wapiti 🙂.
