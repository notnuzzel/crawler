
import { CRAWL } from '../util/types'
import queue from '../util/queue'
import crawlUserTimeline from './timeline'
import crawlWebsite from './website'

const errorHook = async (err, msg, next, id) => {
  console.error(err)
  next()
}

queue('job-crawl', {
  [CRAWL.TIMELINE]: crawlUserTimeline,
  [CRAWL.WEBSITE]: crawlWebsite
}).process(errorHook)