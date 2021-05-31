import React, { Component } from 'react';
import '../App.css';
import AppNavbar from './AppNavbar';
import 'bootstrap/dist/css/bootstrap.css';
import { withRouter } from 'react-router-dom'
import { Row, Col, Input, Form, FormGroup, Label, Button, Container } from 'reactstrap';

class Register extends Component {

  constructor(props) {

    super(props);
    this.state = {
      name: '',
      lastname: '',
      username: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      userExists: false,
      isFocused: false
    };
    this.inputHandler = this.inputHandler.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.cancel = this.cancel.bind(this);

  }

  async handleRegister() {

    const { name, lastname, username, email, password, confirmPassword, phoneNumber } = this.state;

    if(name !== '' && lastname !== '' && username !== '' && email !== '' && phoneNumber !== '' && password !== '' && confirmPassword !== '') {

      if(password === confirmPassword) {

        await fetch('/api/register', {

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
          if(data.message === 'Successful') {
            alert('USER CREATED')
            this.props.history.push('/');
          }
          else if(data.message === 'User already exists') {
            this.setState({userExists: true});
          }
        });

      }

    }

  }

  inputHandler(e) {
    this.setState({[e.target.name] : e.target.value});
  }

  cancel() {
    this.props.history.push('/')
  }

  render() {

    let { name, lastname, username, email, phoneNumber, password, confirmPassword, userExists, isFocused } = this.state
    
    return (
      <div>
        <AppNavbar />
        <Container fluid >
          <Row className='fix-header'>
            <Col style={{backgroundColor: '#F8F8F8'}} ></Col>
            <Col xs={2} ></Col>
            <Col xs={4}>
              <br />
              <Form>
                <h2>Brugerinfo</h2>
                <FormGroup>
                  <Label>Navn</Label>
                  <Input 
                    name='name'
                    required='required'
                    placeholder='Navn'
                    onChange={this.inputHandler}
                    onFocus={() => this.setState({isFocused: true})}

                  />
                </FormGroup>
                <Col md={12}>
                  {name === '' && isFocused === true ? <Label style={{color: 'red'}}>Skal være udfyldt</Label> : ''}
                </Col>
                <FormGroup>
                  <Label>Efternavn</Label>
                  <Input 
                    name='lastname'
                    required='required'
                    placeholder='Efternavn'
                    onChange={this.inputHandler}
                    onFocus={() => this.setState({isFocused: true})}

                  />
                </FormGroup>
                <Col md={12}>
                  {lastname === '' && isFocused === true ? <Label style={{color: 'red'}}>Skal være udfyldt</Label> : ''}
                </Col>
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
                  {userExists ? <Label style={{color: 'red'}}>Sorry, that username is taken</Label> : '' }
                </Col>
                <FormGroup>
                  <Label>E-Mail</Label>
                  <Input 
                    name='email'
                    required='required'
                    placeholder='E-Mail'
                    type='email'
                    onChange={this.inputHandler}
                    onFocus={() => this.setState({isFocused: true})}

                  />
                </FormGroup>
                <Col  md={12}>
                  {email === '' && isFocused === true ? <Label style={{color: 'red'}}>Skal være udfyldt</Label> : ''}
                </Col>
                <FormGroup>
                  <Label>Tlf. Nummer</Label>
                  <Input 
                    name='phoneNumber'
                    required='required'
                    placeholder='Tlf. Nummer'
                    onChange={this.inputHandler}
                    onFocus={() => this.setState({isFocused: true})}

                  />
                </FormGroup>
                <Col  md={12}>
                  {phoneNumber === '' && isFocused === true ? <Label style={{color: 'red'}}>Skal være udfyldt</Label> : ''}
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
                <FormGroup>
                  <Label>Confirm Password</Label>
                  <Input 
                    name='confirmPassword'
                    required='required'
                    placeholder='Confirm Password'
                    type='password'
                    onChange={this.inputHandler}
                    onFocus={() => this.setState({isFocused: true})}

                  />
                </FormGroup>
                <Col md={12}>
                  {password === confirmPassword ? '' : [<Label key={1} style={{color: 'red'}}>Password matcher ikke</Label>,<br key={2}/>]}
                  {confirmPassword === '' && isFocused === true ? <Label style={{color: 'red'}}>Skal være udfyldt</Label> : ''}
                </Col>
                <br />
                <FormGroup>
                  <Button
                    className='btn btn-primary'
                    color='primary'
                    onClick={this.handleRegister}
                  >Opret Bruger</Button>
                  <Button
                    className='btn btn-primary'
                    color='primary'
                    style={{marginLeft: '10px'}}
                    onClick={this.cancel}
                  >Cancel</Button>
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

export default withRouter(Register);