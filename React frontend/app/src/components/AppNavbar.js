import React, { Component } from 'react';
import { Nav, Navbar, NavbarBrand, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';

class AppNavbar extends Component {

  render() {

    return (
      <div>
        <Navbar color="dark" dark expand="md">
        <NavbarBrand tag={Link} to="/a">Home</NavbarBrand>
          <Nav className="ml-auto" navbar>
            <NavItem>
              <NavLink href="https://github.com/weedwizard420xXx/Lorem-Ipsum-Auktioner">GitHub</NavLink>
            </NavItem>
          </Nav>
      </Navbar>
    </div>
    );

  }
  
}

export default AppNavbar
