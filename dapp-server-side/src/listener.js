import { Contract, WebSocketProvider } from 'ethers';
import details from './lib/deployed_addresses.json' assert { type: 'json' };
import Cert from './lib/Cert.json' assert { type: 'json' };

const provider = new WebSocketProvider('ws://127.0.0.1:8545');
const signer = await provider.getSigner();
const instance = new Contract(details['CertModule#Cert'], Cert.abi, signer);

(() => {
  console.log('Listening for Issue Events...');
  instance.on('Issued', (course, id, grade, event) => {
    console.log('**** EVENT OCCURED ****');
    console.log('course:', course);
    console.log('id:', id);
    console.log('grade:', grade);
    console.log('event:', event);
    console.log('***********************');
  });
})();
