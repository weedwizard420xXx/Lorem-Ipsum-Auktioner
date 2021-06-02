import React, { Component } from 'react';
import '../App.css';
import AppNavbar from './AppNavbar';
import 'bootstrap/dist/css/bootstrap.css';
import { withRouter } from 'react-router-dom'
import { Row, Col, Input, Form, FormGroup, Label, Button, Container } from 'reactstrap';
import Api from '../api/Api'

class SendVurdering extends Component {
    constructor(props) {

        super(props);
        this.state = {
            name: '',
            category: '',
            description: '',
            picture: null,
            username: '',
            isFocused: false,
            data: null
        };
        this.inputHandler = this.inputHandler.bind(this);
        this.handleVurdering = this.handleVurdering.bind(this);
        this.cancel = this.cancel.bind(this);
        this.checkAuth = this.checkAuth.bind(this);
        this.fileSelectHandler = this.fileSelectHandler.bind(this)
        this.onChangeHandler = this.onChangeHandler.bind(this)

    }

    cancel() {
      //Husk at få fikset så den bare går en side tilbage
        this.props.history.push('/')
    }

    componentDidMount() {
        this.checkAuth();
    }

    inputHandler(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    checkAuth() {

        const auth = Api.getAuth()
        auth.then((result) => {

            if (result) {

                if (result.role === 'byder') {
                    this.setState({ 
                        token: result.token,
                        username: result.username
                    });
                }
                else {
                    this.props.history.push('/')
                    this.setState({ token: false });
                }

            }

        });

    }

    fileSelectHandler(event){
      this.setState({
        picture:event.target.files,
        data : new FormData()
      })
    }

    onChangeHandler(){
      //looper igennem antallet af filer pg ligger dem i formdata
      // this.state.data = new FormData()
      this.setState({data: new FormData()}); // mente du det her??
      for(var x=0; x<this.state.picture.lenght; x++)
      {
        this.state.data.append('file',this.state.picture[x])
      }
    }

    async handleVurdering(){
      const { name, category, description, picture, username, data } = this.state;

      if(name !== '' && category !== '' && description !== '' && username !== '' ) {
        //looper igennem antallet af filer pg ligger dem i formdata

        for(var x=0; x<picture.lenght; x++)
        {
          data.append('file',picture[x])
        }
          await fetch('/api/SendVurdering', {
              method: 'POST',
              headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
              },
              body: JSON.stringify(this.state), data,
              credentials: 'include'

          })
          .then(res => res.json())
          .then(data => {
            if(data.message === 'Successful') {
              alert('Varen er indsendt')
              this.cancel()
            }
            else if(data.message === 'Someting went wrong...') {
              alert('Noget gik galt')
            }
          });

      }
    }

    render() {

    let { name, category, description, username, isFocused } = this.state

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
                <h2>Send til Vurdering</h2>
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
                  <Label>kategori</Label>
                  <Input 
                    name='category'
                    required='required'
                    placeholder='kategori'
                    onChange={this.inputHandler}
                    onFocus={() => this.setState({isFocused: true})}

                  />
                </FormGroup>
                <Col md={12}>
                  {category === '' && isFocused === true ? <Label style={{color: 'red'}}>Skal være udfyldt</Label> : ''}
                </Col>
                <FormGroup>
                  <Label>Beskrivelse</Label>
                  <Input 
                    name='description'
                    required='required'
                    placeholder='Beskrivelse'
                    onChange={this.inputHandler}
                    onFocus={() => this.setState({isFocused: true})}

                  />
                </FormGroup>
                <Col md={12}>
                  {description === '' && isFocused === true ? <Label style={{ color: 'red' }}>Skal være udfyldt</Label> : ''}
                </Col>
                <FormGroup>
                  <label>Upload billede</label>
                  <input type='file' multiple onChange={this.fileSelectHandler}></input>
                </FormGroup>
                <br />
                <FormGroup>
                  <Button
                    className='btn btn-primary'
                    color='primary'
                    onClick={this.handleVurdering}
                  >Indsend vare</Button>
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
export default withRouter(SendVurdering); 