
import queue from './util/queue'
import { CRAWL } from './util/types'

const jobs = queue('job-crawl')

export const crawl = (type) => async (job) => {
  job.type = type  // param type is reserved
  await jobs.push(job)
}

export const quit = jobs.quit

export default {
  website: crawl(CRAWL.WEBSITE),
  timeline: crawl(CRAWL.TIMELINE),
}