import { Component } from 'react';
import { withRouter } from 'react-router-dom'
import { Row, Col, Input, Form, FormGroup, Label, Button, Container } from 'reactstrap';
import Api from '../api/Api'

class CreatePassword extends Component {

  constructor(props) {

    super(props);
    this.state = {
      password: '',
      confirmPassword: '',
      token: '',
      message: '',
      countdown: 6
    };

    this.confirmToken = this.confirmToken.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.redirectTimer = this.redirectTimer.bind(this);

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
          this.setState({token: result.token});
        }
        else {
          this.setState({message: result.message});
        }

      }

    });

  }

  handleInput(e) {
    this.setState({[e.target.name] : e.target.value});
  }

  async handleRegister() {

    const { password, confirmPassword, token } = this.state;

    if(password !== '' && confirmPassword !== '') {

      if(password === confirmPassword) {

        await fetch('/api/setPassword', {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            password: password, 
            token: token
          }),
          credentials: 'include'
    
        })
        .then(res => res.json())
        .then(data => {
    
          console.log(data)
        
        }).catch(err => {
          console.log(err);
        })
    
      }

    }

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

    let { password, confirmPassword, token, countdown } = this.state

    return(
      <div>
        { token.length > 0 ?
          <Container fluid >
            <Row className='fix-header'>
              <Col style={{backgroundColor: '#F8F8F8'}} ></Col>
              <Col xs={2} ></Col>
              <Col xs={4}>
                <br />
                <Form>
                  <h2>Lav Password</h2>
                  <FormGroup>
                    <Label>Password</Label>
                    <Input 
                      name='password'
                      required='required'
                      placeholder='Password'
                      type='password'
                      onChange={this.handleInput}

                    />
                  </FormGroup>
                  <Col md={12}>
                  </Col>
                  <FormGroup>
                    <Label>Confirm Password</Label>
                    <Input 
                      name='confirmPassword'
                      required='required'
                      placeholder='Confirm Password'
                      type='password'
                      onChange={this.handleInput}

                    />
                  </FormGroup>
                  <Col md={12}>
                    {password === confirmPassword ? '' : <Label style={{color: 'red'}}>Password matcher ikke</Label>}
                  </Col>
                  <br />
                  <FormGroup>
                    <Button
                      className='btn btn-primary'
                      color='primary'
                      onClick={this.handleRegister}
                    >Opret Password</Button>
                  </FormGroup>
                </Form>
              </Col>
              <Col xs={2} ></Col>
              <Col style={{backgroundColor: '#F8F8F8'}}></Col>
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

export default withRouter(CreatePassword);