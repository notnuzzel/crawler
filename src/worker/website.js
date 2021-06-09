
import { https } from 'follow-redirects'
import metascraper from 'metascraper'
import metascraperAuthor from 'metascraper-author'
import metascraperDate from 'metascraper-date'
import metascraperDescription from 'metascraper-description'
import metascraperImage from 'metascraper-image'
import metascraperPublisher from 'metascraper-publisher'
import metascraperTitle from 'metascraper-title'
import prisma from '@notnuzzel/prisma'
import * as urls from '../util/url'

const metascrape = metascraper([
  metascraperAuthor(),
  metascraperDate(),
  metascraperDescription(),
  metascraperImage(),
  metascraperPublisher(),
  metascraperTitle()
])

const fetchHTML = (options) => new Promise((resolve, reject) => {
  const req = https.request(options, res => {
    let html = ""
    res.on('data', (chunk) => { html += chunk })
    res.on('end', () => resolve({ url: res.responseUrl, html }))
  })
  req.on('error', reject)
  req.end()
})

const scrapeURL = async (targetURL) => {
  const { host, path } = urls.parse(targetURL)
  const { url, html } = await fetchHTML({ host, path }) // returns redirect URL
  const results = await metascrape({ html, url })
  return { url: urls.standardized(url), ...results }
}

const findArticle = async (href) => {
  return await prisma.article.findUnique({
    where: { href }
  })
}

const findRedirect = async (href) => {
  return await prisma.articleRedirect.findUnique({
    where: { href },
    include: { article: true }
  })
}

const createRedirect = async ({
  href, articleId
}) => {
  return await prisma.articleRedirect.create({
    data: { href, articleId }
  })
}

const createArticle = async ({
  url,
  title,
  description,
  publisher,
  author,
  image,
  date
}) => {
  return await prisma.article.create({
    data: { 
      href: url,
      title,
      description,
      publisher,
      byline: author,
      heroImage: image,
      publishedAt: date
    }
  })
}

const findOrCreateArticle = async ({ sURL, rURL }) => {
  const article = await findArticle(sURL)
  if (article) return article
  const redirect = await findRedirect(sURL)
  if (redirect) return redirect.article
  const metadata = await scrapeURL(rURL)
  const { url } = metadata
  if (url === sURL) { // if not redirect
    return await createArticle(metadata)
  } else { // redirect
    let redirectedArticle = await findArticle(url)
    if (!redirectedArticle) redirectedArticle = await createArticle(metadata)
    await createRedirect({ href: sURL, articleId: redirectedArticle.id })
    return redirectedArticle
  }
}

const crawlWebsite = async ({
  href
}, done) => {
  const rURL = urls.reachable(href)
  const sURL = urls.standardized(href)
  await findOrCreateArticle({ sURL, rURL })
  done()
}

export default crawlWebsite