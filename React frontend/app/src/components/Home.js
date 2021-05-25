import React, { Component } from 'react';
import '../App.css';
import AppNavbar from './AppNavbar';
import 'bootstrap/dist/css/bootstrap.css';
import { Link } from 'react-router-dom';
import { Container } from 'reactstrap';

class Home extends Component {

  render() {
    
    return (
      <div>
        <AppNavbar />
        <Container fluid>
         <p>Hello, World!</p>
         <Link className='btn btn-primary' to='/register'>Register</Link>
        </Container>
      </div>
    );
  }

}

export default Home;