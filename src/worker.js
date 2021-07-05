
import Queue from 'bee-queue'
import { CrawlType } from './queue/types'
import crawlUserTimeline from './crawl/timeline'
import crawlWebsite from './crawl/website'

const options = {
  removeOnSuccess: true,
  isWorker: true
}

const main = () => {
  const timelineQueue = new Queue(CrawlType.Timeline, options)
  timelineQueue.process(crawlUserTimeline)
  const websiteQueue = new Queue(CrawlType.Website, options)
  websiteQueue.process(crawlWebsite)
  console.log('listening for crawling jobs')
}

main()