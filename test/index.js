
import queue from '../src/util/queue'
import wait from 'wait'
import words from 'random-words'

const jobHook = async ({
  type, word
}, done) => {
  console.log(`processing ${type}:${word}`)
  done()
}


const errorHook = async (err, msg, next, id) => {
  console.error(err)
  next()
}

const TYPE = 'word'

const jobs = queue('job-test', {
  [TYPE]: jobHook
})

jobs.process(errorHook)

const enqueue = async () => {
  while(true) {
    const word = words(1)[0]
    jobs.push({ type: TYPE, word })
    console.log(`pushed ${TYPE}:${word}`)
    await wait(2000)
  }
}

try {
  enqueue()
} catch (e) {
  console.error(e)
}