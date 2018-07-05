/* global document */

const submitFormAndWait = (page, selectors, submitForm, waitForPageLoad) =>
  submitForm
    ? page
        .evaluateHandle(firstInput => {
          const form = document.querySelector(firstInput).form;
          const submitButton = form.querySelector('[type="submit"]');
          if (submitButton) {
            // submitButton.click();
            return submitButton;
          } else {
            const input = form.querySelector('input[type="text"]');
            if (input) {
              return input;
            }
            const password = form.querySelector('input[type="password"]');
            if (password) {
              return password;
            }
            return "nothing";
          }
        }, selectors[0])
        .then(async result => {
          return result
            .getProperty("type")
            .then(property => property.jsonValue())
            .then(type => {
              if (type === "submit") {
                return Promise.all([
                  waitForPageLoad
                    ? page.waitForNavigation({
                        waitUntil: "networkidle0"
                      })
                    : page.waitFor(200),
                  result
                    .asElement()
                    .click()
                    .then(() => result.dispose())
                ]);
              } else if (waitForPageLoad) {
                // eslint-disable-next-line no-console
                console.warn("Warning: found no way to submit the form");
              }
              return null;
            });
        })
    : page.waitFor(200);

module.exports = {
  submitFormAndWait
};
