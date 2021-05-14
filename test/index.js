
import queue from '../util/queue'
import wait from 'wait'
import words from 'random-words'

const jobs = queue('job-test')

const loop = async () => {
  while(true) {
    const username = words(1)[0]
    jobs.push({ username })
    console.log(`pushed ${username}`)
    await wait(2000)
  }
}

jobs.process(({
  username
}, done) => {
  console.log(`processing ${username}`)
  done()
})

try {
  loop()
} catch (e) {
  console.error(e)
}