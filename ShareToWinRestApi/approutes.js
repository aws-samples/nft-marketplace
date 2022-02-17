import express from 'express';
import DAppObject from './dapplogic.js';

var router = express.Router();
var dapp=new DAppObject();

router.get('/', dapp.getAllRegisteredAsset);
router.post('/createregistration', dapp.registerNewAsset);
router.post('/transfer', dapp.transferAsset);
router.get('/assetsforsale', dapp.listAssetForSale);
router.post('/assetonmarket', dapp.putAssetOnSale);
router.get('/escrow/:accountid', dapp.getAccountEscrowBalance);
router.get('/assets/:accountid', dapp.showAccountAssets);
router.get('/ether/:accountid',dapp.getAccountEtherBalance);
router.get('/users',dapp.getAllUserInfo);
router.get('/addbuyer',dapp.addUserToMarketPlace);
router.post('/sendEscrow',dapp.sendEscrowBalance);

//export this router to use in our index.js
export default router;