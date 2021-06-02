import React, { Component } from 'react';
import '../App.css';
import { withRouter } from 'react-router';
import 'bootstrap/dist/css/bootstrap.css';
import { Row, Col, Input, Form, FormGroup, Label, Button, Container } from 'reactstrap';

class Login extends Component {

  constructor(props) {

    super(props)
    this.state = {
      username: '',
      password: '',
    }
    this.inputHandler = this.inputHandler.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.register = this.register.bind(this);

  }

  async handleLogin() {

    const {username,password} = this.state;

    if(username !== '' && password !== '') {
      console.log(JSON.stringify(this.state));

        await fetch('/api/login', {

          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.state),
          credentials: 'include'

        })
        .then(res => res.json())
        .then(data => {
          console.log(data);
          if(data.message === 'Success')
          {
            switch(data.role){
              case "admin":
                this.props.history.push('/adminsite');
                break;
              case "auktionarius":
                this.props.history.push('/auktsite');
                break;
              case "byder":
                this.props.history.push('/brugerside');
                break;
              default:
                break;
            }
          }
          else
          {
            alert('Ikke korrekt information')
          }
        });

      }

  }

  inputHandler(e) {
    this.setState({[e.target.name] : e.target.value});
  }

  register() {
    this.props.history.push('/register')
  }

  render() {

    console.log(this.state)
    let {username, password, isFocused } = this.state

    return (
      <div>
        <Container fluid >
          <Row className='fix-header'>
            <Col style={{backgroundColor: '#F8F8F8'}} ></Col>
            <Col xs={2} ></Col>
            <Col xs={4}>
              <br />
              <Form>
                <h2>Log Ind</h2>
                <FormGroup>
                  <Label>Brugernavn</Label>
                  <Input 
                    name='username'
                    required='required'
                    placeholder='Brugernavn'
                    onChange={this.inputHandler}
                    onFocus={() => this.setState({isFocused: true})}
                  />
                </FormGroup>
                <Col md={12}>
                  {username === '' && isFocused === true ? <Label style={{color: 'red'}}>Skal være udfyldt</Label> : ''}
                </Col>

                <FormGroup>
                  <Label>Password</Label>
                  <Input 
                    name='password'
                    required='required'
                    placeholder='Password'
                    type='password'
                    onChange={this.inputHandler}
                    onFocus={() => this.setState({isFocused: true})}
                  />
                </FormGroup>
                <Col md={12}>
                  {password === '' && isFocused === true ? <Label style={{color: 'red'}}>Skal være udfyldt</Label> : ''}
                </Col>

                <br />

                <FormGroup>
                  <Button
                    className='btn btn-primary'
                    color='primary'
                    onClick={this.handleLogin}
                  >Log ind</Button>
                  <Button
                    className='btn btn-primary'
                    color='primary'
                    style={{marginLeft: '10px'}}
                    onClick={this.register}
                  >Register</Button>
                </FormGroup>
              </Form>
            </Col>
            <Col xs={2} ></Col>
            <Col style={{backgroundColor: '#F8F8F8'}}></Col>
          </Row>
        </Container>
      </div>
    );
  }

}

export default withRouter(Login); 