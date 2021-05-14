
import queue from './util/queue'

queue('job-crawl').process(({
  username
}, done) => {
  console.log(username)
  done()
})