import { IAsset, IRegisteredUser} from './AppModels';

export default class AppAssetService {
    apiUrlEndPoint: string = "http://localhost:4080/";
    getMethodCall: any;
    postMethodCall: any;

    constructor() {
        this.getMethodCall = {
            method: 'GET',
            headers: { 'Content-type': 'application/json;charset=UTF-8' }
        };
        this.postMethodCall = {
            method: 'POST',
            headers: { 'Content-type': 'application/json;charset=UTF-8' }
        }
        if(this.apiUrlEndPoint===""){
            fetch('config.json', {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }).then(data=>{return data.json()}).then(j=>{this.apiUrlEndPoint=j.SERVER_URL;})
        }
    }
    public async getUserInfo(): Promise<IRegisteredUser[]> {
        let returnVal: IRegisteredUser[] = [];
        let rawResponse = await fetch(this.apiUrlEndPoint + 'users', this.getMethodCall);
        
        if (rawResponse.ok === true) {
            returnVal = await rawResponse.json();
        }
        return new Promise<IRegisteredUser[]>((resolve) => { resolve(returnVal) });
    }
    public async getAllRegisteredAsset(): Promise<IAsset[]> {
        let jsonReturnContent:IAsset[]
        let rawResponse = await fetch(this.apiUrlEndPoint, this.getMethodCall);
        if (rawResponse.ok === true) {
            jsonReturnContent = await rawResponse.json();
        }
        return new Promise<IAsset[]>((resolve) => { resolve(jsonReturnContent) });
    }
    public async registerNewAsset(newAsset: IAsset) {
        
        let reqContent = {
            method: 'POST',
            headers: { 'Content-type': 'application/json;charset=UTF-8' },
            body: JSON.stringify({
                "assetTitle": newAsset.AssetTitle,
                "assetDesc": newAsset.AssetDescription,
                "assetUrl": newAsset.AssetPicUrl,
                "salePrice": newAsset.AssetPrice,
                "ownerAddress":newAsset.AssetOwnerAccount
            })
        }
        let createApiEndPoint = this.apiUrlEndPoint + 'createregistration';
        let rawResponse = await fetch(createApiEndPoint, reqContent);
        let returnContent = await rawResponse.json();
        return returnContent;
    }
    public async getAccountEscrowBalance(accountID: string): Promise<number> {
        let returnVal: number;
        let rawResponse = await fetch(this.apiUrlEndPoint + "escrow/" + accountID, this.getMethodCall);
       
        if (rawResponse.ok=== true) {
            returnVal = await rawResponse.json();
        }
        return new Promise<number>((resolve) => { resolve(returnVal) });
    }
    public async getAccountEtherBalance(accountID: string): Promise<number> {
        let returnVal: number;
        let rawResponse = await fetch(this.apiUrlEndPoint + "ether/" + accountID, this.getMethodCall);
       
        if (rawResponse.ok=== true) {
            returnVal = await rawResponse.json();
        }
        return new Promise<number>((resolve) => { resolve(returnVal) });
    }
    public async makeAssetPurchase(fromAddress: string, toAddress: string, assetID: number): Promise<string> {
        //console.log(fromAddress);
        let returnVal: string = "";
        
        let reqContent = {
            method: 'POST',
            headers: { 'Content-type': 'application/json;charset=UTF-8' },
            body: JSON.stringify({
                "fromAccount": fromAddress,
                "toAccount": toAddress,
                "assetID": assetID
            })
        }
        let createApiEndPoint = this.apiUrlEndPoint + 'transfer';
        let rawResponse = await fetch(createApiEndPoint, reqContent);
        let returnContent = await rawResponse.json();
        if (returnContent.status === 'Token Transfered') {
            returnVal = "Purchase of property was successful"
        }
        else {
            let x: string = JSON.stringify(returnContent.ErrorMsg.data);
            x = x.substring(x.indexOf('\"reason\":') + 9);
            returnVal = x.substring(0, x.indexOf('\"}'));
        }

        return new Promise<string>((resolve) => { resolve(returnVal) });
    }
    public async listAssetForSale(fromAddress: string,salePrice: string, assetID: number): Promise<string> {
        let returnVal: string = "";
        let reqContent = {
            method: 'POST',
            headers: { 'Content-type': 'application/json;charset=UTF-8' },
            body: JSON.stringify({
                "fromAccount": fromAddress,
                "salePrice": Number(salePrice),
                "assetID": assetID
            })
        }
        let createApiEndPoint = this.apiUrlEndPoint + 'assetonmarket';
        let rawResponse = await fetch(createApiEndPoint, reqContent);
        let returnContent = await rawResponse.json();
        if (returnContent.status === 'Error') {
            returnVal =returnContent.ErrorMsg;
        }
        else {
            returnVal = "Purchase was put on market"
        }

        return new Promise<string>((resolve) => { resolve(returnVal) });
    }
    public async addNewUser():Promise<string>{
        //let returnMsg:Promise<string>;
        let returnVal: string;
        let rawResponse = await fetch(this.apiUrlEndPoint + "addbuyer/", this.getMethodCall);
        if (rawResponse.ok === true) {
            let jsonReturn = await rawResponse.json();
            returnVal=jsonReturn.status;
            return new Promise<string>((resolve) => { resolve(returnVal) });
        }
        else
            return new Promise<string>((resolve) => { resolve(rawResponse.statusText) });
    }
    public async sendEscrowToContract(addressKey:string,escrowAmount:string){
        let reqContent = {
            method: 'POST',
            headers: { 'Content-type': 'application/json;charset=UTF-8' },
            body: JSON.stringify({
                "actPrivateKey": addressKey,
                "escrowAmount": escrowAmount
            })   
        }
        let createApiEndPoint = this.apiUrlEndPoint + 'sendEscrow';
        let rawResponse = await fetch(createApiEndPoint, reqContent);
        let returnContent = await rawResponse.json();
        return returnContent;
    }
}