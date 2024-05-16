import { Router } from 'express';
import { id, Interface } from 'ethers';
import { provider } from '../lib/instance.js';
import details from '../lib/deployed_addresses.json' assert { type: 'json' };
import Cert from '../lib/Cert.json' assert { type: 'json' };
const router = Router();

const eventTopic = id('Issued(string,uint256,string)');
const iface = new Interface(Cert.abi);

router.get('/', async (req, res) => {
  try {
    const courseTopic = id(req.query.course);
    let eventlogs = [];

    BigInt.prototype.toJSON = function () {
      return this.toString();
    };

    await provider
      .getLogs({
        fromBlock: 0,
        toBlock: 'latest',
        address: details['CertModule#Cert'],
        topics: [eventTopic, courseTopic],
      })
      .then((logs) => {
        logs.forEach((log) => {
          eventlogs.push(iface.parseLog(log));
        });
      });

    res.json(eventlogs);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

export default router;
