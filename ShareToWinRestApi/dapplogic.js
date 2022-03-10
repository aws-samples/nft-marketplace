import Web3 from 'web3';
//import Contract from 'web3-eth-contract';
import jsonInterface from "./contractAbi.js";
import providerGenerator from './contractProvider.js';
import DbLogicObject from './dblogic.js';


export default class DAppObject {

    constructor() {
        this.web3obj = new Web3(providerGenerator());

        let AdminAccount;
        this.db = new DbLogicObject();
        this.registeredUsers = [];
        this.ethereumAddress = [];
        this.NetworkID="";
        this.ChainID="";

        if (process.env.APPNETWORK === 'AWS') {
            this.assetTokenContract = new this.web3obj.eth.Contract(jsonInterface.abi, process.env.CONTRACTADDRESS);
        }
        else {
            this.web3obj.eth.getAccounts((err, accRes) => {
                this.ethereumAddress = accRes;
                this.registeredUsers.push({
                    'Name': "MarketPlace Admin",
                    'LoginName': "Admin",
                    'EthereumID': this.ethereumAddress[0], //the first account will be used by marketplace admin
                    'EtherBalance': 0,
                    'EscrowBalance': 0
                });
                this.assetTokenContract = new this.web3obj.eth.Contract(jsonInterface.abi, process.env.CONTRACTADDRESS); 
                
                this.updateRegisteredUserBalance();
            });
        }
        this.web3obj.eth.net.getId().then(netid=>{this.NetworkID=netid});
        this.web3obj.eth.getChainId().then(chainid=>{this.ChainID=chainid});

        //bind all the functions "this" to the class. Without doing the bind, the "this" reference
        //inside the function will refer to the function rather then the class that contains the function.

        this.registerNewAsset = this.registerNewAsset.bind(this);
        this.transferAsset = this.transferAsset.bind(this);
        this.listAssetForSale = this.listAssetForSale.bind(this);
        this.putAssetOnSale = this.putAssetOnSale.bind(this);
        this.showAccountEscrowBalance = this.getAccountEscrowBalance.bind(this);
        this.getAllRegisteredAsset = this.getAllRegisteredAsset.bind(this);
        this.getAllUserInfo = this.getAllUserInfo.bind(this);
        this.showAccountAssets = this.showAccountAssets.bind(this);
        this.addUserToMarketPlace = this.addUserToMarketPlace.bind(this);
        this.updateRegisteredUserBalance=this.updateRegisteredUserBalance.bind(this);
        this.getAccountEscrowBalance=this.getAccountEscrowBalance.bind(this);
        this.getAccountEtherBalance=this.getAccountEtherBalance.bind(this);
        this.sendEscrowBalance=this.sendEscrowBalance.bind(this);
        this.getAssetDetail=this.getAssetDetail.bind(this);
    }

    //route '/users'
    getAllUserInfo(req, res) {
        //for each registered user, update the ether and escrow balance before returning the user list  
        this.updateRegisteredUserBalance()
        res.send(this.registeredUsers);
    }
    updateRegisteredUserBalance(){
        this.registeredUsers.forEach((item)=>{
            this.web3obj.eth.getBalance(item.EthereumID).then(etherbal=>{
                this.assetTokenContract.methods.getAccountEscrowMoney(item.EthereumID).call().then((returnObj) => {
                    item.EtherBalance=this.web3obj.utils.fromWei(etherbal,'ether');
                    //item.EscrowBalance=this.web3obj.utils.fromWei(parseFloat(returnObj).toString(),'ether');
                    item.EscrowBalance=returnObj;
                });
            });
        });
    }
    //route '/createregistration'
    registerNewAsset(req, res) {
        var assetId = Math.floor((Math.random() * 10000));
        var metadataUri = "http://value-to-come.com";
        this.assetTokenContract.methods.registerAsset(assetId, req.body["salePrice"], metadataUri).send({ from: req.body["ownerAddress"], gasPrice: '20000000000', gas: 5000000 }).then((returnObj) => {
            //create record in the db
            this.db.createItemInDb(assetId, req.body["assetTitle"], req.body["assetDesc"], req.body["assetUrl"], returnObj.events.AssetRegistered.returnValues.tokenId, (result) => {
                if (result.status == 'Success') {
                    var tranSummary = { 'TransactionHash': returnObj.transactionHash, 'BlockHash': returnObj.blockHash, 'TokenID': returnObj.events.AssetRegistered.returnValues.tokenId };
                    res.send({ 'status': 'Asset Registered', 'TranSummary': tranSummary });
                }
                else {
                    res.send({ 'status': 'Error', 'ErrorMsg': result.Msg });
                }
            })

        }).catch(err => {
            res.send({ 'status': 'Error', 'ErrorMsg': err });
        });
    };
    //Not routed method
    getAssetDetail(assetid){
        return new Promise((resolve,reject)=>{
            this.assetTokenContract.methods.getAssetByID(assetid).call().then(assetInfo=>{
                resolve({salePrice:assetInfo[0],IsAvailable:assetInfo[1],AssetOwnerAddress:assetInfo[3]});
            }).catch(e=>{
                reject(e);
            });
        })
    }
    //route '/'
    getAllRegisteredAsset(req, res) {
        this.db.getAllItems((result) => {
            if (result.status == 'Success') {
                //for each given assetid, get its latest owner, price, and if it is on sale or not
                
                let promises=result.Items.map(item=>{
                    return this.getAssetDetail(item.AssetID).then(assetInfo=>{
                        item.AssetPrice=assetInfo.salePrice;
                        item.IsAssetOnSale=assetInfo.IsAvailable;
                        item.AssetOwnerAccount=assetInfo.AssetOwnerAddress;
                        return item
                    }).catch(e=>{
                        throw e;
                    })
                })
                
                Promise.all(promises).then(registeredAssets=>{
                    res.send(JSON.stringify(registeredAssets));
                }).catch(e=>{
                    res.send(JSON.stringify({ 'Error': e}));
                });
            }
            else {
                res.send(JSON.stringify({ 'Error': result.Msg }));
            }
        })
    }
    //route '/sendEscrow'
    sendEscrowBalance(req,res){
        var actPrivateKey=req.body["actPrivateKey"];
        var numberofEther=req.body["escrowAmount"];

        console.log(actPrivateKey);
        let tx={to:process.env.CONTRACTADDRESS,value:numberofEther * 1000000000000000000,gas: "5000000",common:{customChain:{name:"Ganache",networkId:this.NetworkID,chainId:this.ChainID}}};
        this.web3obj.eth.accounts.signTransaction(tx,actPrivateKey).then(signTx=>{
            if(signTx.rawTransaction){
                this.web3obj.eth.sendSignedTransaction(signTx.rawTransaction).then(txResult=>{
                    res.send(txResult);
                });
            }; 
        });   
    }
    //route '/escrow/:accountid'
    getAccountEscrowBalance(req, res) {

        this.assetTokenContract.methods.getAccountEscrowMoney(req.params["accountid"]).call().then((returnObj) => {
            let x = parseFloat(returnObj);
            res.send(JSON.stringify(x));
        }).catch(err => {
            res.send(err);
            console.log(err);
        });
    }
    //route '/ether/:accountid'
    getAccountEtherBalance(req,res){
        this.web3obj.eth.getBalance(req.params["accountid"]).then(bal=>{
            res.send(this.web3obj.utils.fromWei(bal,'ether'));
        }).catch(err =>{
            res.send(err);
            console.log(err);
        })
    }
    //route '/assetsforsale'
    listAssetForSale(req, res) {
        this.assetTokenContract.methods.getAllAssetOnSale().call().then((returnObj) => {
            let tempArr = Array.from(returnObj[0]);
            if (tempArr.length > 0) {
                let dbKeys = [];
                tempArr.forEach(item => {
                    dbKeys.push(parseInt(item));
                });
                this.db.getAllItemsByKeys(dbKeys, (result) => {
                    if (result.status == 'Success') {

                        let assetWithPrice = result.Items.map((dbreturnItem, index) => {
                            dbreturnItem['price'] = returnObj[1][index];
                            dbreturnItem['owner'] = returnObj[2][index];
                            return dbreturnItem;
                        })
                        res.send(assetWithPrice);
                    }
                    else {
                        res.send(JSON.stringify({ 'Error': result.Msg }));
                    }
                });
            }
            else {
                res.send([]);
            }
            //res.send(returnObj);
        });

    }
    //route '/assets/:accountid'
    showAccountAssets(req, res) {
        this.assetTokenContract.methods.getAssetsOwnedByAccount(req.params['accountid']).call().then((returnObj) => {
            let tempArr = Array.from(returnObj);
            if (tempArr.length > 0) {
                let dbKeys = [];
                tempArr.forEach(item => {
                    dbKeys.push(parseInt(item));
                })
                this.db.getAllItemsByKeys(dbKeys, (result) => {
                    if (result.status == 'Success') {
                        res.send(JSON.stringify(result.Items));
                    }
                    else {
                        res.send(JSON.stringify({ 'Error': result.Msg }));
                    }
                });
            }
            else {
                res.send([]);
            }

        }).catch(err => {
            res.send(err);
        });
    }
    //route '/transfer'
    transferAsset(req, res) {
        var sendOption = { from: req.body["fromAccount"], gasPrice: '20000000000', gas: 5000000 };
        this.assetTokenContract.methods.transferAsset(req.body["toAccount"], req.body["assetID"],true).send(sendOption).then(() => {
            res.send({ 'status': 'Token Transfered' });
        }).catch(err => {
            res.send({ 'status': 'Error', 'ErrorMsg': err });

        });
    }
    //route '/assetonmarket'
    putAssetOnSale(req, res) {
       
        var sendOption = { from: req.body["fromAccount"],gasPrice: '20000000000', gas: 5000000 };
        this.assetTokenContract.methods.putAssetOnMarket(req.body["salePrice"], req.body["assetID"]).send(sendOption).then(() => {
            res.send({ 'status': 'Property put on market' });
        }).catch(err => {
            res.send({ 'status': 'Error', 'ErrorMsg': JSON.stringify(err) });
        });

    }
    //route '/addbuyer'
    addUserToMarketPlace(req, res) {
        if (this.registeredUsers.length < this.ethereumAddress.length) {
            this.registeredUsers.push({
                'Name': `Buyer${this.registeredUsers.length}`,
                'LoginName': `buyer${this.registeredUsers.length}`,
                'EthereumID': this.ethereumAddress[this.registeredUsers.length], //the first account will be used by marketplace admin
                'EtherBalance': 0,
                'EscrowBalance': 0
            });
            this.updateRegisteredUserBalance();
            res.send({ 'status': 'New Buyer is added to marketplace'});
        }
        else{
            res.send({ 'status': 'Error', 'ErrorMsg': "User Limit Reached" });
        }
    }
    
}