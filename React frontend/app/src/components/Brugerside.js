import React, { Component } from 'react';
import '../App.css';
import AppNavbar from './AppNavbar';
import 'bootstrap/dist/css/bootstrap.css';
import { Link, withRouter } from 'react-router-dom';
import Api from '../api/Api';

class Brugerside extends Component {
  
  constructor(props) {
    
    super(props);
    this.state = {
      username: ''
    }
    
  }
  
  componentDidMount() {
    this.checkAuth();
  }

  checkAuth() {

    const auth = Api.getAuth()
    auth.then( (result) => {

      if(result) {

        if(result.role === 'byder') {
          this.setState({username: result.username});
        }
        else {
          this.props.history.push('/')
          this.setState({token: false});
        }

      }

    });

  }


  render() {

    return (
      <div>
        <AppNavbar />
          <p>Velkommen {this.state.username}</p>
          <Link className='btn btn-primary' to='/UserAuktioner'>Auktioner</Link>
          <Link className='btn btn-primary' to='/SendVurdering'>Indsend vare til vurdering</Link>
      </div>
    );
  }

}

export default withRouter(Brugerside);
