import React from "react";
import AppAssetService from "../services/AppAssetService";
import { IAssetOnSaleComponentState, IGlobalProp, IAsset } from "../services/AppModels";
import { Card, ListGroup, Media, Row, Col, Button } from "react-bootstrap";

export default class AssetsOnMarket extends React.Component<
  IGlobalProp,
  IAssetOnSaleComponentState
> {
  appService: AppAssetService;
  constructor(props: IGlobalProp) {
    super(props);
    this.appService = this.props.appServiceObj;
    //this.state = { accountid: props.ethUser.EthereumID, toastShow: false, toastMsg: "" };
    this.state = { toastShow: false, toastMsg: "" };
    this.buyButtonClicked = this.buyButtonClicked.bind(this);
  }
  buyButtonClicked(assetid: number, assetOwner: string, e: any) {
    this.appService.makeAssetPurchase(assetOwner, this.props.ethUser.EthereumID, assetid).then(result => {
      this.setState({ toastShow: true, toastMsg: result });
      alert(result);
      this.props.updateAssets();
      this.props.updateBalance(this.props.ethUser.EthereumID);
    });
  }
  render() {
    const renderBuyButton = (assetItem: IAsset) => {
      if (assetItem.AssetOwnerAccount !== this.props.ethUser.EthereumID) {
        return <Button
          variant="primary"
          size="sm"
          onClick={(e) =>
            this.buyButtonClicked(
              assetItem.AssetID,
              assetItem.AssetOwnerAccount,
              e
            )
          }
        >
          Buy
        </Button>
      }
      else{
        return <></>
      }
    }
    return (
      <>
        <Card border="primary">
          <Card.Header className="text-center">Assets on Sale</Card.Header>
          <ListGroup>
            {this.props.registeredAssets.map((item, index) => {
              return (
                <ListGroup.Item key={index}>
                  <Media>
                    <img
                      width={80}
                      height={64}
                      className="mr-3"
                      src={item.AssetPicUrl}
                      alt="Generic placeholder"
                    />
                    <Media.Body>
                      <Row>
                        <Col>
                          <h5>{item.AssetTitle}</h5>
                          <p>{item.AssetDescription}</p>
                        </Col>
                        <Col>
                          <p>
                            Price:{" "}
                            <Button variant="danger" size="sm" disabled>
                              {item.AssetPrice}
                            </Button>
                            &nbsp;&nbsp;&nbsp;
                            {renderBuyButton(item)}
                          </p>
                        </Col>
                      </Row>
                    </Media.Body>
                  </Media>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </Card>
        {/* <Toast style={{position: 'absolute',top: 200,right: 200,}} onClose={() => this.setState({toastShow:false,toastMsg:""})} show={this.state.toastShow} delay={3000} autohide>
          <Toast.Header>
            <img
              src="holder.js/20x20?text=%20"
              className="rounded mr-2"
              alt=""
            />
            <strong className="mr-auto">Property Purchase</strong>
            <small>few seconds ago</small>
          </Toast.Header>
          <Toast.Body>{this.state.toastMsg}</Toast.Body>
        </Toast> */}
      </>
    );
  }
}
