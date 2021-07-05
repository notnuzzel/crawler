
import Queue from 'bee-queue'
import { CrawlType } from './types'

const options = { }

export const websiteQueue = new Queue(CrawlType.Website, options)

export const timelineQueue = new Queue(CrawlType.Timeline, options)