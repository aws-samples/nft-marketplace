import Web3 from 'web3';
import AWSHttpProvider from './awsHttpProvider.js';

export default function providerGenerator(){
    if(process.env.APPNETWORK==='AWS'){
        return new Web3(new AWSHttpProvider(process.env.AMB_HTTP_ENDPOINT));
    }
    else{
        return new Web3.providers.HttpProvider(process.env.GANACHE_ENDPOINT);
    }
    
};