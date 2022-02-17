import React from "react";
import AppAssetService from "../services/AppAssetService";
import { IAsset, IMyAssetComponentState,IGlobalProp} from "../services/AppModels";
import { Card, ListGroup, Media, Row, Col,Button,Modal, Form } from "react-bootstrap";

export default class MyAssets extends React.Component<IGlobalProp,IMyAssetComponentState
> {
  appService: AppAssetService;

  constructor(props: IGlobalProp) {
    super(props);
    this.appService = this.props.appServiceObj;

    this.state = {
      showModal:false,
      assetToSale:0,
      assetPrice: ""
      //accountid:props.ethAccount
    };
    this.onSubmitClick = this.onSubmitClick.bind(this);
    this.onModalToggle = this.onModalToggle.bind(this);
    this.formDataChanged = this.formDataChanged.bind(this);
    this.sellButtonClicked=this.sellButtonClicked.bind(this);
  }
  onSubmitClick(){
    
    if(this.state.assetPrice==="" || isNaN(Number(this.state.assetPrice))){
      alert("Please enter sale price");
    }
    else
    {
      let newSalePrice=this.state.assetPrice;
      let newAssetOnMarket=this.state.assetToSale;
      
      this.appService.listAssetForSale(this.props.ethUser.EthereumID,newSalePrice, newAssetOnMarket).then(result => {
        this.setState({assetPrice:"",assetToSale:0});
        alert(result);
        this.onModalToggle();
        this.props.updateAssets();
        this.props.updateBalance(this.props.ethUser.EthereumID);
      });
    }
  }
  onModalToggle() {
    let returnVal={};
    this.setState((prevState, props) => {
      if(prevState.showModal==true && prevState.assetToSale>0){
        returnVal={ 
          showModal: !prevState.showModal,
          assetToSale:0
        };
          
      }
      else{
        returnVal={ showModal: !prevState.showModal };
      }
      return returnVal;
    });
    
  }
  formDataChanged(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    switch (event.target.id) {
      case "assetprice":
        this.setState({assetPrice:event.target.value});
        break;
    }
  }
  sellButtonClicked(assetid:number,e:any)
  {
    this.setState({assetToSale:assetid});
    this.onModalToggle();
  }
  public render(): React.ReactElement {
    const renderSaleButton=(assetItem:IAsset)=>{
      if(assetItem.IsAssetOnSale===false){
        return <Button
        variant="primary"
        size="sm"
        onClick={(e) => this.sellButtonClicked(assetItem.AssetID,e)}
      >
        Sell
      </Button>
      }
      else{
        return <></>
      }
    }
    return (
      <>
      <Card border="primary">
        <Card.Header className="text-center">My Assets</Card.Header>
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
                      <Col xs={8}>
                        <h5>{item.AssetTitle}</h5>
                        <p>{item.AssetDescription}</p>
                      </Col>
                      <Col>
                        {renderSaleButton(item)}
                      </Col>
                    </Row>
                  </Media.Body>
                </Media>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Card>
      <Modal show={this.state.showModal} onHide={this.onModalToggle}>
          <Modal.Header closeButton>
            <Modal.Title>Sell Asset</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="assetprice">
                <Form.Label>Asset Price</Form.Label>
                <Form.Control
                  placeholder="Enter Property Price"
                  htmlSize={30}
                  onChange={this.formDataChanged}
                />
                <Form.Text>Enter sale price of asset in Ether</Form.Text>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.onModalToggle}>
              Close
            </Button>
            <Button variant="primary" onClick={this.onSubmitClick}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
