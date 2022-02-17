var expect = require('chai').expect;
var faker = require('faker');
var web3util = require('web3-utils');

const AssetToken = artifacts.require("AssetToken");

contract("AssetToken", (accounts) => {
    let assetTokenContract;
    let registeredasset;
    let assetOwnerAccount

    before(async () => {
        //create a new registration from using faker data
        let propertyName = faker.commerce.productName();
        let propertyDesc = faker.commerce.productDescription();
        let propertyImgUrl = faker.internet.url();
        let nftmetadatauri = faker.internet.url();
        let propertyEther = faker.datatype.number({ min: 1, max: 10 });
        let assetid = faker.datatype.number({ min: 1000, max: 10000 });

        assetOwnerAccount = 3//faker.datatype.number({min: 0,max: 4});
        assetTokenContract = await AssetToken.deployed();
        registeredasset = await assetTokenContract.registerAsset(assetid, propertyEther, nftmetadatauri, { from: accounts[assetOwnerAccount] });
    });
    describe('AssetRegistration', function () {
        it('total nft supply should be one', async function () {
            let totalNFT = (await assetTokenContract.totalSupply()).toString();
            let expected = web3util.toBN('1')
            expect(totalNFT).to.eql("1");
        });
        it('for accounts[3] it should show he owns a token', async function () {
            let NFTBalance = (await assetTokenContract.balanceOf(accounts[assetOwnerAccount])).toString();
            expect(NFTBalance).to.eql("1");
        });
    });
    describe('AssetTransfer',function (){
        it('transfer without escrow balance')
    });
})
