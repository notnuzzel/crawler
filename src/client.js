
import { websiteQueue, timelineQueue } from './queue/'

export const crawlWebsite = async (job) => {
  return await websiteQueue.createJob(job).save()
}

export const crawlTimeline = async (job) => {
  return await timelineQueue.createJob(job).save()
}

export default {
  website: crawlWebsite,
  timeline: crawlTimeline
}