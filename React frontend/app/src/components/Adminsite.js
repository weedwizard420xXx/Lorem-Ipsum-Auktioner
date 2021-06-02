import React, { Component } from 'react';
import '../App.css';
import AppNavbar from './AppNavbar';
import 'bootstrap/dist/css/bootstrap.css';
import { Link, withRouter } from 'react-router-dom';
import { Container } from 'reactstrap';

class Adminsite extends Component {

  render() {

    return (
      <div>
        <AppNavbar />
        <Container fluid>
         <p>Admin</p>
         <Link className='btn btn-primary' to=''>Auktioner</Link>
         <Link className='btn btn-primary' to=''>Indsend vare til vurdering</Link>
        </Container>
      </div>
    );
  }

}

export default withRouter(Adminsite); 