
import queue from './util/queue'

const jobs = queue('job-crawl')

export const crawl = async (job) => {
  await jobs.push(job)
}

export const quit = jobs.quit

export default crawl