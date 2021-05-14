
import redis from 'redis'
import RSMQPromise from 'rsmq-promise'
import RSMQWorker from 'rsmq-worker'

const client = redis.createClient(process.env.REDIS_URI)

export default (queue) => {
  const worker = new RSMQWorker(queue, { redis: client })
  const start = () => worker.start()
  const stop = () => worker.stop()
  const process = (func) => {
    worker.on("message", (msg, next, id) => {
      const job = JSON.parse(msg)
      func(job, next, id)
    })
    worker.start()
  }
  const rsmq = new RSMQPromise({ client })
  const push = async (job) => {
    const message = JSON.stringify(job)
    await rsmq.sendMessage({ qname: queue, message })
  }
  const quit = async () => worker.quit() && await rsmq.quit()
  return { process, start, stop, push, quit }
}