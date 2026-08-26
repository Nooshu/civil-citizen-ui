# Accessibility (a11y) tests with HTML mocks

Pa11y (`yarn tests:a11y`) visits citizen GET paths from `src/main/routes/urls.ts` and checks captured HTML under `src/test/utils/mocks/a11y/`. That is **evidence**, not a full Web Content Accessibility Guidelines (WCAG) **2.2 AA** audit. Official GOV.UK Frontend macros are the UI source of truth: if HTML_CodeSniffer or axe disagrees with Design System output, ignore the **scanner code** in `pa11y-options.ts` — do not drop the page or rewrite macros.

### Contents:
- [Ignoring a url](#ignoring-a-url)
- [Creating a new mock](#creating-a-new-mock)
- [Running the a11y test](#running-the-a11y-test)

## Ignoring a url

Accessibility tests visit all urls specified in:
```bash
src/main/routes/urls.ts
```
except those listed in `src/test/a11y/ignored-urls.ts`.

Add a URL to the ignore list only when it has **no citizen GET view**, is **external**, is a **hash fragment** of a page already scanned, is **developer-only** (UI Preview catalogue, testing support), still has **no matching mock**, or the mock is an Express **redirect stub** (not a page).

If the page has a mock, **un-ignore it**. Do not ignore it because a scanner flags official GOV.UK table captions or headings.

A Jest guard (`src/test/unit/a11y/ignoredUrlsMocks.test.ts`) fails if a mocked citizen GET is ignored without being listed in `A11Y_IGNORED_URLS_WITH_MOCKS`.

## Creating a new mock

When your url does have a view, you'll have to take an extra step of adding a mock of it.

### 1. Manual grab

#### Go to webpage

You will need to visit the new URL to render the view in the browser.
Go to inspector, and copy the <html> element.

#### Save to  a mock file

The copied element will need to be pasted into a mock file in:
```bash
src/test/utils/mocks/a11y
```
The names of the file use the url, and follow the format:
1. starts with: 'mock-'
2. every '/' becomes '-'
3. ':id' becomes '1645882162449409'
4. ':appId' becomes '1720536653906339'
5. 'documentId' becomes '2'
6. 'uniqueId' becomes '3'
7. ends in .html

As an example
```bash
case/:id/case-progression/apply-help-with-fees
```
becomes
```bash
mock-case-1645882162449409-case-progression-apply-help-with-fees.html
```

### 2. Scraper

#### If you have a lot of pages, scraping might be more worthwhile. Scraping is done through:
```bash
src/test/a11y/a11y.scrape.ts
```
#### Check the URL
In a11y.scrape.ts, the scrape method is fed an array of urls to scrape. It is currently set to scrape a variable urlsList, but you can put in another array for your purposes.
#### Change the Jest config
Adapt the Jest config to use the a11y.scrape.ts class.
Change the text '(test|spec)' to '(scrape|spec)' at the top of the config:
```bash
jest.a11y.config.js
```
#### Optional: Turn off guards on any pages to scrape
If you have a guard on your page, or are intending to rescrape all views. Make sure you disable any guards, or the pages will redirect rather than render a view.

#### Change package.json
In package.json, to use the Jest config, change test:a11y to:
```bash
jest -c jest.a11y.config.js
```
Click the green arrow to run the config, and the scraper will start running.
Files do not show immediately upon finish. You might have to wait a few seconds and close/reopen the folder with mocks before they appear.

## Running the a11y test

Run `yarn tests:a11y` (alias `yarn test:a11y`). Jenkins Cloud Native Platform (CNP) uses `yarn tests:a11y:parallel`. This suite is **not** part of `yarn cichecks`.

If your mock does not load, or your mock only shows a redirect, rather than a view, errors will show.

Check each error. If it is inherent to official GOV.UK Frontend markup, add the HTML_CodeSniffer / axe **code** to `GOVUK_MACRO_HTMLCS_IGNORES` in `pa11y-options.ts`. Otherwise update the mock or, only if there is still no GET view, ignore the url.
