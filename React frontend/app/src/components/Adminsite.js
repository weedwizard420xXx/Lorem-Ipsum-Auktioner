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
         <Link className='btn btn-primary' to='/RegisterAuktioner'>Register auktioner</Link>
         <Link className='btn btn-primary' to='/RegisterAukt'>Register auktionarius</Link>
        </Container>
      </div>
    );
  }

}

export default withRouter(Adminsite);
