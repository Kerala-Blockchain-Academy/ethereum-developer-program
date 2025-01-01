import { Contract, WebSocketProvider } from 'ethers'
import details from './lib/deployed_addresses.json'
import Cert from './lib/Cert.json'

const provider = new WebSocketProvider(process.env.WS_URL!)
const instance = new Contract(details.contract, Cert.abi, provider)

;(() => {
  console.log('Listening for Issue Events...')
  instance.on('Issued', (course, id, grade, event) => {
    console.log('**** EVENT OCCURED ****')
    console.log('course:', course)
    console.log('id:', id)
    console.log('grade:', grade)
    console.log('event:', event)
    console.log('***********************')
  })
})()
