import React, { Component } from 'react';
import '../App.css';
import AppNavbar from './AppNavbar';
import 'bootstrap/dist/css/bootstrap.css';
import { Link, withRouter } from 'react-router-dom';
import { Row, Col, Input, Form, FormGroup, Label, Button, Container } from 'reactstrap';
import Api from '../api/Api'

class RegisterAuktioner extends Component{
    constructor(props){
        super(props);
        this.state = {

        }
        this.cancel = this.cancel.bind(this);
        this.checkAuth = this.checkAuth.bind(this)
    }
    cancel() {
        //Husk at få fikset så den bare går en side tilbage
        this.props.history.push('/')
    }
  
    componentDidMount() {
        this.checkAuth();
    }

    checkAuth() {

        const auth = Api.getAuth()
        auth.then((result) => {

            if (result) {

                if (result.role === 'admin') {
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

    render(){
        return (
            <div>
              <AppNavbar />
              <Container fluid>
               <p>Hello, World!</p>
               <Link className='btn btn-primary' to='/register'>Register</Link>
               <Button className='btn btn-primary' onClick={this.getCookie}>Cookie</Button>
               <Link className='btn btn-primary' to='/login'>Login</Link>
              </Container>
            </div>
          );
    }
}
export default withRouter(RegisterAuktioner);