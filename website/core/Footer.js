/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react");

class Footer extends React.Component {
  render() {
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <a href={this.props.config.baseUrl} className="nav-home">
            <img
              src={this.props.config.baseUrl + this.props.config.footerIcon}
              alt={this.props.config.title}
              width="66"
              height="58"
            />
          </a>
          <div>
            <h5>Docs</h5>
            <a
              href={
                this.props.config.baseUrl +
                "docs/" +
                // this.props.language +
                "install.html"
              }
            >
              Getting Started
            </a>
            <a href={this.props.config.baseUrl + "docs/vcr.html"}>Guides</a>
            <a
              href={
                this.props.config.baseUrl +
                "docs/" +
                // this.props.language +
                "api.html"
              }
            >
              API Reference
            </a>
          </div>
          <div>
            <h5>More</h5>
            {/* <a href={this.props.config.baseUrl + "blog"}>Blog</a> */}
            <a href={`https://github.com/${this.props.config.repo}`}>GitHub</a>
            <a
              className="github-button"
              href={`https://github.com/${this.props.config.repo}`}
              data-icon="octicon-star"
              data-count-href="/Fenntasy/Wapiti/stargazers"
              data-show-count={true}
              data-count-aria-label="# stargazers on GitHub"
              aria-label="Star Wapiti on GitHub"
            >
              Star
            </a>
          </div>
        </section>
      </footer>
    );
  }
}

module.exports = Footer;
