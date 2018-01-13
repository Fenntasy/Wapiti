/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react");

const CompLibrary = require("../../core/CompLibrary.js");
const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(process.cwd() + "/siteConfig.js");

class Button extends React.Component {
  render() {
    return (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={this.props.href} target={this.props.target}>
          {this.props.children}
        </a>
      </div>
    );
  }
}

Button.defaultProps = {
  target: "_self"
};

class HomeSplash extends React.Component {
  render() {
    return (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">
            <div className="inner">
              <h2 className="projectTitle">
                <img src={siteConfig.baseUrl + "img/wapiti.png"} />
                <small>{siteConfig.tagline}</small>
              </h2>

              <a
                className="github-button"
                href={siteConfig.repoUrl}
                data-icon="octicon-star"
                data-count-href="/Fenntasy/Wapiti/stargazers"
                data-show-count={true}
                data-count-aria-label="# stargazers on GitHub"
                aria-label="Star this project on GitHub"
              >
                Star
              </a>
              <div className="section promoSection">
                <div className="promoRow">
                  <div className="pluginRowBlock">
                    <Button href={siteConfig.baseUrl + "docs/install.html"}>
                      Documentation
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class Index extends React.Component {
  render() {
    let language = this.props.language || "en";

    return (
      <div>
        <HomeSplash language={language} />
        <div className="mainContainer">
          <Container padding={["bottom", "top"]}>
            <GridBlock
              align="center"
              contents={[
                {
                  content: `Integration testing should not be hard to do. It should just be
                    able to say that you broke nothing and that your website is still
                    running ok. Leave the error testing to your unit tests.`,
                  image: siteConfig.baseUrl + "img/sunglasses.png",
                  imageAlign: "top",
                  title: "Test the happy path!"
                },
                {
                  content:
                    "Wapiti is running with Chrome headless browser, meaning you don't have to configure anything: if it runs on Chrome, it run on Wapiti",
                  image: siteConfig.baseUrl + "img/puppeteer.png",
                  imageAlign: "top",
                  title: "Powered by Puppeteer"
                },
                {
                  content:
                    "Nothing to configure, no Java-based dependency, just install Wapiti and run your tests",
                  image: siteConfig.baseUrl + "img/selenium.png",
                  imageAlign: "top",
                  title: "No need for Selenium"
                }
              ]}
              layout="threeColumn"
            />
          </Container>

          <Container padding={["bottom", "top"]} background="light">
            <div
              className="productShowcaseSection paddingBottom"
              style={{ textAlign: "center" }}
            >
              <h2 style={{ textAlign: "center" }}>
                Integration testing made easy
              </h2>
              <MarkdownBlock>
                Integration testing has long been a nightmare, it is time to
                change that. Wapiti leverage the power of Puppeteer to let you
                easily write your tests, hassle free!
              </MarkdownBlock>
            </div>
          </Container>
        </div>
      </div>
    );
  }
}

module.exports = Index;
