// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract AssetToken is ERC721Enumerable,Ownable{
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    string private _baseuri;
    Counters.Counter private _lasttokenID;
    mapping(address=>uint256) _EscrowMoney; //This will hold account of everyone who has put the money in escrow.
    mapping(uint256=>Asset) _AssetIdToAssetMap; //map asset sales data with asset id
    uint256[] public registeredAssets; //array to keep track of all registered assets. Each element of this array contains assetid passed at the time of registration
    mapping(uint256=>uint256) _TokenToAssetMap; //for each token holds the asset id it points to
    
    constructor() ERC721("ShareToWin","STW"){}

    struct Asset{
        uint256 currentSalePrice;
        bool isAvailableForSale;
        uint256 AssetTokenID;
    }

    //This function will mint a new NFT. For each AssetID that is passed from the rest api, there is a NFT, represented by the token id,
    //that is associated.  
    function registerAsset(uint256 assetID,uint256 salePrice,string calldata _uri) public returns(uint256 newTokenID) {
        _lasttokenID.increment();
        newTokenID=_lasttokenID.current();

        _safeMint(msg.sender, newTokenID);
        _baseuri=_uri;
        
        Asset memory newAsset;
        newAsset.currentSalePrice=salePrice;
        newAsset.isAvailableForSale=true;
        newAsset.AssetTokenID=newTokenID;
        
        _AssetIdToAssetMap[assetID]=newAsset;
        registeredAssets.push(assetID);
        _TokenToAssetMap[newTokenID]=assetID;

        emit AssetRegistered(newTokenID);
        return newTokenID;
    }

    //This function is part of the smart contract for convenience. This information can also be queried from the dynamoDb. 
    function getAllRegisteredAsset() view public returns(uint256[] memory r){
        return registeredAssets;
    }

    //For a given asset id, it will return asset last/current sale price,boolean to indicate if it is on sale, NFT id and the address of the current owner
    function getAssetByID(uint256 assetID) view public returns(uint256,bool,uint256,address){
        return (_AssetIdToAssetMap[assetID].currentSalePrice,_AssetIdToAssetMap[assetID].isAvailableForSale,_AssetIdToAssetMap[assetID].AssetTokenID,ownerOf(_AssetIdToAssetMap[assetID].AssetTokenID));
    }

    // Return the count of NFT token whose owner has indicated that they are willing to exchange these NFT.
    function getAssetOnSaleCount() view public returns(uint256){
        uint totalAssetonMarket;
        for(uint i=0;i<registeredAssets.length;i++){
            if(_AssetIdToAssetMap[registeredAssets[i]].isAvailableForSale==true){
                totalAssetonMarket++;
            }
        }
        return totalAssetonMarket;
    }

    //this function return all asset id ownerd by this account
    function getAssetsOwnedByAccount(address tokenOwnerAddress) view public returns(uint256[] memory){
        uint totalToken=balanceOf(tokenOwnerAddress);
        uint256[] memory assetIDs=new uint256[](totalToken);

        for(uint i=0;i<totalToken;i++){
            uint256 accountNftTokenId=tokenOfOwnerByIndex(tokenOwnerAddress, i);
            assetIDs[i]=_TokenToAssetMap[accountNftTokenId];
        }
        return assetIDs;
    }

    //this function will return all the asset that are on sale and the sale price at which they are in the market
    function getAllAssetOnSale() view public returns(uint256[] memory,uint256[] memory,address[] memory){
        uint saleCounter=getAssetOnSaleCount();
        uint256[] memory assetIDs=new uint256[](saleCounter);
        uint256[] memory assetPrice=new uint256[](saleCounter);
        address[] memory assetOwnerAddress=new address[](saleCounter);
        uint counter=0;
        for(uint i=0;i<registeredAssets.length;i++){      
            if(_AssetIdToAssetMap[registeredAssets[i]].isAvailableForSale==true){
                assetIDs[counter]=registeredAssets[i];
                assetPrice[counter]=_AssetIdToAssetMap[registeredAssets[i]].currentSalePrice;
                assetOwnerAddress[counter]=this.ownerOf(_AssetIdToAssetMap[registeredAssets[i]].AssetTokenID);
                counter++;
            }
        }
        return (assetIDs,assetPrice,assetOwnerAddress);
    }

    //return the escrow amount in Ether that the contract holds for the given address
    function getAccountEscrowMoney(address escrowAccount) view public returns(uint256 moneyInEscrow){
        return _EscrowMoney[escrowAccount]/1000000000000000000;
    }

    //list the NFT to be available for sale
    function putAssetOnMarket(uint256 salePrice,uint256 assetID) public{
        _AssetIdToAssetMap[assetID].currentSalePrice=salePrice;
        _AssetIdToAssetMap[assetID].isAvailableForSale=true;
    }

    //transfer the NFT from one address to another and adjust the escrow balance
    function transferAsset(address _to, uint256 assetID,bool withEscrow) public {
        uint256 assetTokenID=_AssetIdToAssetMap[assetID].AssetTokenID;
        uint256 ethSalesAmount=_AssetIdToAssetMap[assetID].currentSalePrice;
        address currentOwner=ownerOf(assetTokenID);

        //owner can't transfer his own asset
        if(_to==currentOwner) {
            revert("Cannot purchase one's own asset");
        }
        require(ethSalesAmount<=_EscrowMoney[_to],"Cannot transfer token. Not sufficient fund");

        //cannot transfer asset if it is not for sale
        require(_AssetIdToAssetMap[assetID].isAvailableForSale==true,"Cannot transfer asset as it is not for sale");

        //first transfer the token and then send ether to seller and and adjust the escrow balance
        safeTransferFrom(currentOwner, _to, assetTokenID);
        if(withEscrow==true){
            payable(currentOwner).transfer(ethSalesAmount * 1000000000000000000);
            _EscrowMoney[_to] = _EscrowMoney[_to]-(ethSalesAmount * 1000000000000000000);
        }
        //approve(this.owner(), assetTokenID);
        
        //remove the asset from market
        _AssetIdToAssetMap[assetID].isAvailableForSale=false;
    }
    //this function should return the metadata base uri
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseuri;
    }

    receive() external payable
    {
        uint256 amount = msg.value;
        _EscrowMoney[msg.sender] = _EscrowMoney[msg.sender].add(amount);
    }

    event AssetRegistered(uint256 tokenId);

    //event AssetTransfered(address from, address to, uint256 tokenid);
}