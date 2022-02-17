import React from "react";
import AppAssetService from "../services/AppAssetService";
import { IAsset, IGlobalContextState, IRegisteredUser, UserTypes } from "../services/AppModels";
import {
  Container,
  Row,
  Col,
  ButtonGroup,
  Button
} from "react-bootstrap/";
import UserView from "./UserView";

export default class GlobalContext extends React.Component<
  {},
  IGlobalContextState
> {
  appService: AppAssetService;

  constructor(props: any) {
    super(props);
    this.appService = new AppAssetService();
    this.state = { userInfo: [], assetInfo: [], currentuserindex: 0, dataRefreshTimestamp: Date.now().toLocaleString() }; //
    this.userButtonClicked = this.userButtonClicked.bind(this);
    this.refreshApp = this.refreshApp.bind(this);
    this.updateEtherEscrowBalance = this.updateEtherEscrowBalance.bind(this);
    this.storeAccountPrivateKey = this.storeAccountPrivateKey.bind(this);
    this.updateRegisteredAssetStatus = this.updateRegisteredAssetStatus.bind(this);
    this.newUserIsAdded = this.newUserIsAdded.bind(this);
  }
  userButtonClicked(userIndex: number, e: any) {
    this.setState({ currentuserindex: userIndex });
  }

  refreshApp() {
    this.setState({
      dataRefreshTimestamp: Date.now().toLocaleString()
    });
  }

  updateEtherEscrowBalance(ethAccount: string) {
    this.appService.getAccountEtherBalance(ethAccount).then(ethBal => {
      this.appService.getAccountEscrowBalance(ethAccount).then(escBal => {
        let stateUsers = this.state.userInfo.map(user => {
          if (user.EthereumID === ethAccount) {
            let tempuser: IRegisteredUser = {
              Name: user.Name,
              LoginName: user.LoginName,
              EthereumID: ethAccount,
              EtherBalance: ethBal,
              EscrowBalance: escBal
            };
            if (user.ActPrivateKey)
              tempuser.ActPrivateKey = user.ActPrivateKey;
            return tempuser
          }
          else
            return user;
        });
        this.setState({
          userInfo: stateUsers
        });
      });
    });
  }
  storeAccountPrivateKey(ethAccount: string, privateKey: string) {
    let stateUsers = this.state.userInfo.map(user => {
      if (user.EthereumID === ethAccount) {
        let tempuser: IRegisteredUser = {
          Name: user.Name,
          LoginName: user.LoginName,
          EthereumID: ethAccount,
          EtherBalance: user.EtherBalance,
          EscrowBalance: user.EscrowBalance,
          ActPrivateKey: privateKey
        };
        if (user.ActPrivateKey)
          tempuser.ActPrivateKey = user.ActPrivateKey;
        return tempuser
      }
      else
        return user;
    });
    this.setState({
      userInfo: stateUsers
    });
  }
  updateRegisteredAssetStatus() {
    this.appService.getAllRegisteredAsset().then(data => {
      this.setState({
        assetInfo: data
      })
    });
  }
  componentDidMount() {
    if (this.state.userInfo.length === 0) {

      this.appService.getUserInfo().then((data) => {
        this.setState({
          userInfo: data,
          currentuserindex: 0
        });
      });
      this.appService.getAllRegisteredAsset().then(data => {
        this.setState({
          assetInfo: data
        })
      });
    }
  }
  newUserIsAdded(responseText:string) {
    this.appService.getUserInfo().then((data) => {
      this.setState({
        userInfo: data
      });
    });
  }
  render(): React.ReactElement {
    const renderUserView = () => {
      if (this.state.userInfo[this.state.currentuserindex] !== undefined) {

        let currentUser = this.state.userInfo[this.state.currentuserindex];
        if (this.state.currentuserindex === 0)
          currentUser.AppUserType = UserTypes.Admin;
        else
          currentUser.AppUserType = UserTypes.Buyer;

        return <UserView updateUserList={this.newUserIsAdded} updatePrivateKey={this.storeAccountPrivateKey} updateBalance={this.updateEtherEscrowBalance} updateAssets={this.updateRegisteredAssetStatus} registeredAssets={this.state.assetInfo} appServiceObj={this.appService} ethUser={currentUser}></UserView>
      }
      else {
        return <></>;
      }
    }
    const renderUserButton = () => {
      return this.state.userInfo.map((item, index) => {
        return (
          <>
          <ButtonGroup size="sm" className="mb-2">
            <Button variant={this.state.currentuserindex === index ? "primary" : "secondary"} onClick={(e) => this.userButtonClicked(index, e)}>{item.Name}</Button>
          </ButtonGroup>{' '}
          </>
          
        );
      })
    }
    return (
      <Container fluid>
        <Row className="justify-content-md-center">
          <h1 className="display-4 App-header">Welcome to ShareToWin NFT Demo</h1>
        </Row>
        <Row>
          <Col>
            {renderUserButton()}
          </Col>
        </Row>
        <Row>
          <Col>
            {renderUserView()}
          </Col>
        </Row>
      </Container>
    );
  }
}
