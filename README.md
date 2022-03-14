# Full Stack NFT Marketplace Application


This repo contains the demo code from the NFT marketplace application discussed on the blogs:

- https://aws.amazon.com/blogs/database/part-1-develop-a-full-stack-serverless-nft-application-with-amazon-managed-blockchain/

- https://aws.amazon.com/blogs/database/part-2-develop-a-full-stack-serverless-nft-application-with-amazon-managed-blockchain/ 

## Prerequisites

1. [Node.js](https://nodejs.org)
2. An active AWS account
3. AWS CLI (https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)

## Setup

Clone the repository and run the following commands to setup the code ($ is not part of the command):

```console
$ npm install -g ganache-cli truffle
$ cd ShareToWinContract
$ npm install
$ ../cd ShareToWinRestApi
$ npm install
$ ../cd ShareToWinWeb
$ npm install
$ aws dynamodb create-table --table-name ShareToWin --attribute-definitions AttributeName=AssetID,AttributeType=N --key-schema AttributeName=Artist,KeyType=HASH --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 --table-class STANDARD
```

## Run

Open four terminal windows. 

1. On the first terminal window make sure you are in the ShareToWinContract folder. Run the following command to start Ganache development server by running the ganache-cli

```console
npx ganache-cli  --acctKeys ../ShareToWinRestApi/ethaccounts.json
```
2. On the second terminal window make sure you are in the ShareToWinContract folder. Run the following command to start truffle console.

```console
truffle console --network development
```
Once connected to truffle console, issue the migrate command. 

```console
migrate
```

The migrate command will deploy the smart contract on ganache development network and display the deployed contract address 

        Deploying 'AssetToken'
   ----------------------
    transaction hash:    0xd20be4f8f7126f40ab66d11efac49ec260db251375bd11e729dd658373ecebe8
    Blocks: 0            Seconds: 0
    contract address:    0x0b10d5619d36aeF3ab9eD509196D7937F842a882
    block number:        3
    block timestamp:     1644449968
    account:             0x3d46282D895a9e4Ba8Cb081fbcd6fA2Dd2844e62
    balance:             99.91223912
    gas used:            4096677 (0x3e82a5)
    gas price:           20 gwei
    value sent:          0 ETH
    total cost:          0.08193354 ETH

3. On the third terminal window make sure you are in the ShareToWinRestApi folder. Copy the contract address that is displayed on the second terminal when you ran the migrate truffle command into the envExport.sh file and run the following commands

```console
source envExport.sh
npx nodemon --delay 1000ms index.js
```

This will start the express web server and listen on port 4080

4. On the fourth window make sure you are in the ShareToWinWeb folder. Start the react web front end by entering the command

```console
npm run start
```

## License Summary

This sample code is made available under a modified MIT license. See the LICENSE file.
