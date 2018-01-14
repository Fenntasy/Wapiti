/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* List of projects/orgs using your project for the users page */
const users = [
  {
    caption: "Fenntasy",
    image: "/test-site/img/docusaurus.svg",
    infoLink: "https://vincent.billey.me",
    pinned: true
  }
];

const siteConfig = {
  title: "Wapiti" /* title for your website */,
  tagline: "Integration tests for API based frontend",
  url: "https://Fenntasy.github.io" /* your website url */,
  baseUrl: "/Wapiti/" /* base url for your project */,
  organizationName: "Fenntasy",
  projectName: "wapiti",
  headerLinks: [
    { doc: "install", label: "Docs" },
    { doc: "api", label: "API" },
    { blog: true, label: "Blog" }
  ],
  users,
  /* path to images for header/footer */
  headerIcon: "img/favicon.png",
  footerIcon: "img/favicon.png",
  favicon: "img/favicon.png",
  /* colors for website */
  colors: {
    primaryColor: "#db810a",
    secondaryColor: "#205C3B"
  },
  // This copyright info is used in /core/Footer.js and blog rss/atom feeds.
  copyright:
    "Copyright © " +
    new Date().getFullYear() +
    " Your Name or Your Company Name",
  // organizationName: 'deltice', // or set an env variable ORGANIZATION_NAME
  // projectName: 'test-site', // or set an env variable PROJECT_NAME
  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks
    theme: "tomorrow"
  },
  scripts: ["https://buttons.github.io/buttons.js"],
  // You may provide arbitrary config keys to be used as needed by your template.
  repoUrl: "git@github.com:Fenntasy/Wapiti.git"
};

module.exports = siteConfig;
