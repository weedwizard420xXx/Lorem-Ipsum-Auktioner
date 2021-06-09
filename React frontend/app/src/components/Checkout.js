import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import { Col, Form, Row, FormGroup, Label, Input, Container, Button } from 'reactstrap';
import Api from '../api/Api'

class Checkout extends Component { 

  constructor(props) {

    super(props);
    this.state = {
      token: '',
      message: '',
      id: '',
      message: '',
      vareListe: [],
      prices: [],
      countdown: 6
    };

    this.confirmToken = this.confirmToken.bind(this);
    this.customerPayment = this.customerPayment.bind(this);

  }

  componentDidMount() {
    this.confirmToken();
  }

  confirmToken() {

    const { match: { params }} = this.props
    const confirm = Api.confirmToken(params.token)

    confirm.then( (result) => {

      if(result) {
        
        if(result.token) {
          this.setState({token: result.token, id: result.id});
          fetch('/api/getOrders', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({id: this.state.id}),
            credentials: 'include'
          })
          .then(res => res.json())
          .then(data => this.setState({vareListe: data}));
        }
        else {
          this.setState({message: result.message});
        }

      }

    });

  }

  customerPayment(userId) {

    fetch('/api/confirmPayment', {

      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({userId: userId}),
      credentials: 'include'

    })
    .then(res => res.json())
    .then(data => this.setState({message: data}));

  }

  redirectTimer() {

    let countdown = this.state.countdown;

    setTimeout( () => {
      let i = countdown - 1;
      this.setState({countdown: i})

      if(countdown === 0) {
        this.props.history.push('/')
      }

    }, 1000);

  }


  render() {
    
    const { vareListe, id, token, countdown } = this.state;
    
    let prices = []
    const varer = vareListe.map( items => {
      
      prices.push(Number(items.price))
      

      return(
        
        <Row key={items.item}>
          <Col>
            <h6>{items.vareName}</h6>
          </Col>
          <Col xs={3}>
            <p>{items.price} DKK</p>
          </Col>
        </Row>

      );
      
    });

    return(
      <div>
        <br />
        { token.length > 0 ?
          <Container>
            <Row>
              <Col md={7} >
                <Form>
                  <Row>
                    <h2>Leveringsinfo</h2>
                    <Col md={4}>
                      <FormGroup>
                        <Label>Fornavn</Label>
                        <Input />
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label>Efternavn</Label>
                        <Input />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={3}>
                      <FormGroup>
                        <Label>Adresse</Label>
                        <Input />
                      </FormGroup>
                    </Col>
                    <Col md={2}>
                      <FormGroup>
                        <Label>Postnummer</Label>
                        <Input />
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label>By</Label>
                        <Input />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={4}>
                      <FormGroup>
                        <Label>Email</Label>
                        <Input />
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label>Telefonnummer</Label>
                        <Input />
                      </FormGroup>
                    </Col>
                  </Row>
                  <br />
                  <h1>*UNDER KONSTRUKTION*</h1>
                  <h2>Betaling</h2>
                  <Row>
                    <Col md={4}>
                      <FormGroup>
                        <Label>Kortnummer</Label>
                        <Input disabled='disabled' placeholder='Kortnummer'/>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={4}>
                      <FormGroup>
                        <Label>Udløbsdato</Label>
                        <Input disabled='disabled' placeholder='MM / AA'/>
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label>Kontrolcifre</Label>
                        <Input disabled='disabled'  placeholder='CVC'/>
                      </FormGroup>
                    </Col>
                  </Row>
                  <br />
                  <Row>
                    <Col md={3}>
                      <FormGroup>
                        <Button color='success' onClick={() => this.customerPayment(id)}>Betal</Button>
                      </FormGroup>
                    </Col>
                  </Row>
                </Form>
              </Col>
              <Col className='border rounded'>
                <br/>
                <h2 className='text-center'>Indkøbskurv</h2>
                <br/>
                {varer}
                <hr/>
                <Row>
                  <Col>
                    <h6>Total pris:</h6>
                  </Col>
                  <Col xs={3}>
                    <p>{prices.reduce((a, b) => a + b, 0)} DKK</p>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
          : [this.redirectTimer(), 
            <Container key={1} fluid >
              <Row className='fix-header'>
                <Col style={{backgroundColor: '#F8F8F8'}} ></Col>
                <Col xs={2} ></Col>
                <Col xs={4}>
                  <br />
                  <h2>Link has expired. <br /> Redirecting you in: {countdown}</h2>
                </Col>
                <Col xs={2} ></Col>
                <Col style={{backgroundColor: '#F8F8F8'}}></Col>
              </Row>
            </Container>
          ]
        }
      </div>
    );
  }

}


export default withRouter(Checkout);