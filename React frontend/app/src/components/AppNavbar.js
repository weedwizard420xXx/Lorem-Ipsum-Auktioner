import React, { Component } from 'react';
import { Nav, Navbar, NavbarBrand, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';
import Api from '../api/Api';
import { withRouter } from 'react-router-dom'

class AppNavbar extends Component {

  constructor(props) {

    super(props)
    this.state = {
      token: false,
      role: ""
    };
    this.checkAuth = this.checkAuth.bind(this);

  }

  componentDidMount() {
    this.checkAuth();
  }

  checkAuth() {

    const auth = Api.getAuth()
    auth.then( (result) => {

      if(result) {
        
        if(result.token) {
          this.setState({token: result.token, role:result.role});
        }
        else {
          this.setState({token: false});
        }

      }

    });

  }


  render() {

    const {token,role} = this.state

    return (
      <div>
        <Navbar color="dark" dark expand="md">
          <NavbarBrand tag={Link} to="/">Home</NavbarBrand>
            <Nav className="ml-auto" navbar>
              <NavItem>
                {
                role === "admin" ? 
                <NavItem className='text-light'>Admin</NavItem>
                : role === "auktionarius"? 
                <NavItem className='text-light'>Auktionarius</NavItem>: 
                ''}  
              </NavItem>
              {token ? <NavItem>
               <Link className='btn btn-primary' style={{position: 'absolute', right: 20}} to='/logout'>Logout</Link>
            </NavItem> : ''}
          </Nav>
      </Navbar>
    </div>
    );

  }
  
}

export default withRouter(AppNavbar);
