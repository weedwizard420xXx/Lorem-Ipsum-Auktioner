import React, { Component } from 'react';
import '../App.css';
import AppNavbar from './AppNavbar';
import 'bootstrap/dist/css/bootstrap.css';
import { Link, withRouter } from 'react-router-dom';
import { Container, Button } from 'reactstrap';
import Api from '../api/Api'

class Home extends Component {


  constructor(props) {

    super(props)
    this.state = {
      token: false
    };



  }

  componentDidMount() {
    this.checkAuth();
  }

  checkAuth() {

    const auth = Api.getAuth()
    auth.then( (result) => {

      if(result) {

        if(result.token) {
          this.setState({token: result.token});
        }
        else {
          this.props.history.push('/')
          this.setState({token: false});
        }
        
      }

    });

  }

  async getCookie() {
    await fetch('/api/example', {

      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include'

    })
    .then(res => res.json())
    .then(data => {
      console.log(data)
    });
  }

  render() {
    
    return (
      <div>
        <AppNavbar />
        <Container fluid>
         <Link className='btn btn-primary' to='/register'>Register</Link>
         <Button className='btn btn-primary' onClick={this.getCookie}>Cookie</Button>
         <Link className='btn btn-primary' to='/login'>Login</Link>
        </Container>
      </div>
    );
  }

}

export default withRouter(Home);