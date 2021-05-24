import React, { Component } from 'react';
import '../App.css';
import AppNavbar from './AppNavbar';
import 'bootstrap/dist/css/bootstrap.css';
import { Container } from 'reactstrap';

class Home extends Component {

  render() {
    
    return (
      <div>
        <AppNavbar />
        <Container fluid>
         <p>Hello, World!</p>
        </Container>
      </div>
    );
  }

}

export default Home;