import React from "react";
import AppAssetService from "../services/AppAssetService";
import { IAsset, IRegisterComponentState, IGlobalProp, UserTypes } from "../services/AppModels";

import { Card, ListGroup, Media, Button, Modal, Form } from "react-bootstrap";

export default class RegisterAssets extends React.Component<
IGlobalProp,
  IRegisterComponentState
> {
  appService: AppAssetService;

  constructor(props: IGlobalProp) {
    super(props);
    this.appService = this.props.appServiceObj;

    this.state = {
      showModal: false,
      assetTitle: "",
      assetDescription: "",
      assetUrl: "",
      assetPrice: ""
    };
    this.onSubmitClick = this.onSubmitClick.bind(this);
    this.onModalToggle = this.onModalToggle.bind(this);
    this.formDataChanged = this.formDataChanged.bind(this);
    this.refreshData = this.refreshData.bind(this);

  }
  componentDidMount() {
    //this.refreshData();
  }
  refreshData() {
    /* this.appService.getAllRegisteredAsset().then(data => {
      this.setState({ propertyAssets: data });
    }); */
  }
  onSubmitClick() {
    let _newAsset: IAsset = {
      AssetTitle: this.state.assetTitle,
      AssetDescription: this.state.assetDescription,
      AssetPicUrl: this.state.assetUrl,
      AssetPrice:this.state.assetPrice,
      AssetOwnerAccount:this.props.ethUser.EthereumID,
      AssetID: 0,
      IsAssetOnSale:true
    };
    this.appService.registerNewAsset(_newAsset)
      .then(a => {
        this.setState({ assetTitle: "", assetDescription: "", assetUrl: "", assetPrice: "" });
        //this.refreshData();
        //this.props.refreshView();
        this.onModalToggle();
        this.props.updateBalance(this.props.ethUser.EthereumID);
        this.props.updateAssets();
      });
  }

  onModalToggle() {
    this.setState((prevState, props) => {
      return { showModal: !prevState.showModal };
    });
  }
  formDataChanged(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    switch (event.target.id) {
      case "assettitle":
        this.setState({ assetTitle: event.target.value });
        break;
      case "assetdesc":
        this.setState({ assetDescription: event.target.value });
        break;
      case "assetpicurl":
        this.setState({ assetUrl: event.target.value });
        break;
      case "assetprice":
        this.setState({ assetPrice: event.target.value });
        break;
    }
  }
  render(): React.ReactElement {
    const renderRegisterButton = () => {
      return <Button variant="primary" size="sm" onClick={this.onModalToggle} >
        Register New Asset
      </Button>
    }
    const renderRegisteredAssetList = () => {
      if (this.props.ethUser.AppUserType === UserTypes.Admin)
        return <Card border="primary">
          <Card.Header className="text-center">All Registered Assets</Card.Header>
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
                      <h5>{item.AssetTitle}</h5>
                      <p>{item.AssetDescription}</p>
                    </Media.Body>
                  </Media>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
          <Card.Body className="text-center">
            {renderRegisterButton()}
          </Card.Body>
        </Card>
      else
        return <div className="text-center RegisterButtonSpacing">
          {renderRegisterButton()}
        </div>
    };
    return (
      <>
        {renderRegisteredAssetList()}
        <Modal show={this.state.showModal} onHide={this.onModalToggle}>
          <Modal.Header closeButton>
            <Modal.Title>New Registration</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="assettitle">
                <Form.Label>Asset Name</Form.Label>
                <Form.Control
                  placeholder="Enter Asset Title"
                  htmlSize={30}
                  onChange={this.formDataChanged}
                />
              </Form.Group>
              <Form.Group controlId="assetdesc">
                <Form.Label>Asst Description</Form.Label>
                <Form.Control
                  as="textarea"
                  placeholder="Enter Asset Description"
                  onChange={this.formDataChanged}
                />
              </Form.Group>
              <Form.Group controlId="assetpicurl">
                <Form.Label>Asset Media Url</Form.Label>
                <Form.Control
                  type="url"
                  placeholder="Enter Asset Media Url"
                  htmlSize={30}
                  onChange={this.formDataChanged}
                />
              </Form.Group>
              <Form.Group controlId="assetprice">
                <Form.Label>Asset Price</Form.Label>
                <Form.Control
                  placeholder="Enter Asset Price"
                  htmlSize={30}
                  onChange={this.formDataChanged}
                />
                <Form.Text>Enter initial price of asset in Ether</Form.Text>
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
