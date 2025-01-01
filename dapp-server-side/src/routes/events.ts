import { Router } from 'express'
import { id, Interface, LogDescription } from 'ethers'
import { provider } from '../lib/instance.js'
import details from '../lib/deployed_addresses.json'
import Cert from '../lib/Cert.json'
const router = Router()

const eventTopic = id('Issued(string,uint256,string)')
const iface = new Interface(Cert.abi)

declare global {
  interface BigInt {
    toJSON(): string
  }
}

BigInt.prototype.toJSON = function (): string {
  return this.toString()
}

router.get('/', async (req, res) => {
  try {
    let eventlogs: any = []
    if (req.query.course) {
      const courseTopic = id(req.query.course.toString())

      await provider
        .getLogs({
          fromBlock: 0,
          toBlock: 'latest',
          address: details.contract,
          topics: [eventTopic, courseTopic],
        })
        .then((logs) => {
          logs.forEach((log) => {
            eventlogs.push(iface.parseLog(log))
          })
        })
    }

    res.json(eventlogs)
  } catch (error) {
    console.log(error)
    res.json(error)
  }
})

export default router
