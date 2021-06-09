
import twit from 'twit'
import urlparse from 'url-parse'
import reduce from 'awaity/reduce.js'
import BigNumber from 'bignumber.js'
import prisma from '@notnuzzel/prisma'

const twitPromise = (t, crud, endpoint, params) => new Promise((resolve, reject) => {
  t[crud](endpoint, params, (err, data, response) => {
    if (err) reject(err)
    else resolve({ data, response })
  })
})

const structureShare = ({
  accountId,
  userId,
  crawlId,
  tweet,
  href
}) => {
  const article = { href }
  const share = {
    accountId,
    userId,
    crawlId,
    tweet: {
      id: tweet.id_str,
      fullText: tweet.full_text,
      publishedAt: tweet.created_at,
      author: {
        id: tweet.user.id_str,
        displayName: tweet.user.name,
        handle: tweet.user.screen_name,
        protected: tweet.user.protected,
        profileImage: tweet.user.profile_image_url_https,
      },
      article
    },
    article
  }
  return share
}

//await crawl.website({ href }) // queue crawl

const timelineReducer = (accumulator, tweet) => {
  const { entities } = tweet
  const { urls } = entities
  const shares = reduce(urls, (accumulator, { expanded_url }) => {
    const urlparts = urlparse(expanded_url)
    const { hostname, href } = urlparts
    console.log(href)
    const isTwitter = (hostname === 'twitter.com')
    if (!isTwitter) accumulator.push({ href, tweet })
    return accumulator
  }, [])
  return accumulator.concat(shares)
}

const structureShares = ({ 
  tweets, 
  accountId,
  userId,
  crawlId
}) => {
  const hrefs = reduce(tweets, timelineReducer, [])
  console.log(hrefs.length)
  const shares = reduce(hrefs, (accumulator, { tweet, href }) => {
    console.log(tweet)
    console.log(href)
    const share = structureShare({ accountId, userId, crawlId, tweet, href })
    accumulator.push(share)
    return accumulator
  }, [])
  return shares
}

const sortTweets = (tweets) => {
  const bigSort = (a, b) => BigNumber(a.id_str).comparedTo(BigNumber(b.id_str))
  const sorted = tweets.sort(bigSort)
  const lowest = sorted[0].id_str
  const highest = sorted[sorted.length-1].id_str
  return { sorted, lowest, highest }
}

const recursiveQueryTimeline = async (meta, {
  since_id,
  max_id
} = {}, nextSinceId, shares = []) => {
  const { userId, accountId, crawlId, t } = meta
  //console.log(`querying since_id ${since_id} max_id ${max_id}`)
  const { data } = await twitPromise(t, 'get', 'statuses/home_timeline', {
    tweet_mode: 'extended',
    count: 200,
    since_id,
    max_id
  })
  if (data.length !== 0) {
    //console.log(`found ${data.length}`)
    const { sorted, lowest, highest } = sortTweets(data)
    const nextMaxId = BigNumber(lowest).minus(1).toString()
    const newShares = structureShares({ 
      tweets: sorted,
      userId, 
      accountId, 
      crawlId
    })
    //console.log(`next page max_id ${nextMaxId}`)
    return await recursiveQueryTimeline(meta, { // paginate older tweets
      since_id,
      max_id: nextMaxId
    }, nextSinceId||highest, shares.concat(newShares))
  } else {
    //console.log(`new since_id ${nextSinceId}`)
    return { shares, sinceId: nextSinceId }
  }
}

export default async ({
  accessToken,
  accessTokenSecret,
  cursors,
  userId,
  accountId
}, done) => {
  const t = new twit({
    consumer_key: process.env.TWITTER_CLIENT_ID,
    consumer_secret: process.env.TWITTER_CLIENT_SECRET,
    access_token: accessToken,
    access_token_secret: accessTokenSecret
  })
  const crawl = await prisma.crawl.create({ data: { accountId, userId } })
  const { shares, sinceId } = await recursiveQueryTimeline({
    userId, accountId, crawlId: crawl.id, t
  }, cursors)
  //console.log(shares)
  console.log(shares.length)
  console.log(sinceId)
  //await prisma.share.createMany({ data: shares, skipDuplicates: true }) 
  await prisma.crawl.update({ where: { id: crawl.id }, data: { sinceId } })
  done()
}