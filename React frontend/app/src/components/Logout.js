import { Component } from 'react';
import { withRouter } from 'react-router-dom'

class Logout extends Component {

  componentDidMount() {
    this.handleLogout();
  }

  async handleLogout() {
    
    await fetch('api/logout', {
      
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
      
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      this.props.history.push('/');
    });
    
  }

  render() {
    return(<div></div>);
  }
  
}

export default withRouter(Logout);