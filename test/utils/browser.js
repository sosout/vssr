import puppeteer from 'puppeteer'

export default class Browser {
  async start(options = {}) {
    // https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions
    this.browser = await puppeteer.launch(
      Object.assign(
        {
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
        },
        options
      )
    )
  }

  async close() {
    if (!this.browser) return
    await this.browser.close()
  }

  async page(url) {
    if (!this.browser) throw new Error('Please call start() before page(url)')
    const page = await this.browser.newPage()
    await page.goto(url)
    await page.waitForFunction('!!window.$vssr')
    page.html = () =>
      page.evaluate(() => window.document.documentElement.outerHTML)
    page.$text = selector => page.$eval(selector, el => el.textContent)
    page.$$text = selector =>
      page.$$eval(selector, els => els.map(el => el.textContent))
    page.$attr = (selector, attr) =>
      page.$eval(selector, (el, attr) => el.getAttribute(attr), attr)
    page.$$attr = (selector, attr) =>
      page.$$eval(
        selector,
        (els, attr) => els.map(el => el.getAttribute(attr)),
        attr
      )
    page.$vssr = await page.evaluateHandle('window.$vssr')

    page.vssr = {
      async navigate(path, waitEnd = true) {
        const hook = page.evaluate(() => {
          return new Promise(resolve =>
            window.$vssr.$once('routeChanged', resolve)
          ).then(() => new Promise(resolve => setTimeout(resolve, 50)))
        })
        await page.evaluate(
          ($vssr, path) => $vssr.$router.push(path),
          page.$vssr,
          path
        )
        if (waitEnd) await hook
        return { hook }
      },
      routeData() {
        return page.evaluate(($vssr) => {
          return {
            path: $vssr.$route.path,
            query: $vssr.$route.query
          }
        }, page.$vssr)
      },
      loadingData() {
        return page.evaluate($vssr => $vssr.$loading.$data, page.$vssr)
      },
      errorData() {
        return page.evaluate($vssr => $vssr.vssr.err, page.$vssr)
      },
      storeState() {
        return page.evaluate($vssr => $vssr.$store.state, page.$vssr)
      }
    }
    return page
  }
}
