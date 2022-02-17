import AppAssetService from "./AppAssetService";

export enum UserTypes{
    Admin=1,
    Buyer=2
}
export interface IRegisteredUser{
    Name:string,
    LoginName:string,
    EthereumID:string,
    EtherBalance:number,
    EscrowBalance:number,
    ActPrivateKey?:string,
    AppUserType?:UserTypes

}
export interface IAsset{
    AssetID:number,
    AssetTitle:string,
    AssetDescription:string,
    AssetPicUrl:string,
    IsAssetOnSale:boolean,
    AssetPrice:string,
    AssetOwnerAccount:string
}
/* export interface IAssetWithPrice{
    AssetProps:IAsset,
    AssetPrice:string,
    AssetOwnerAccount:string
} */

export interface IGlobalContextState{
    userInfo:IRegisteredUser[],
    assetInfo:IAsset[],
    currentuserindex:number,
    dataRefreshTimestamp:string
}
export interface IUserViewState{
    showModal:boolean,
    modelHeading:string,
    modelDesc:string,
    modelButtonTitle:string,
    modelTextValue:string
}
export interface IRegisterComponentState{
    //propertyAssets:IAsset[],
    showModal:boolean;
    assetTitle:string;
    assetDescription:string;
    assetUrl:string;
    assetPrice:string;
}
export interface IMyAssetComponentState{
    //propertyAssets:IAsset[],
    showModal:boolean;
    assetToSale:number;
    assetPrice:string;
    //accountid:string
}
export interface IAssetOnSaleComponentState{
    //propertyAssets:IAssetWithPrice[],
    //accountid:string;
    toastShow:boolean;
    toastMsg:string;
    //assetToBuy:number,
}
export interface IGlobalProp{
    appServiceObj:AppAssetService;
    registeredAssets:IAsset[];
    ethUser:IRegisteredUser;
    updateBalance(ethAccount:string):void;
    updateAssets():void;
    
}
export interface IUserProp extends IGlobalProp{
    updatePrivateKey(ethAccount:string,privateKey:string):void;
    updateUserList(statusMsg:string):void;
}
