import { render } from '@testing-library/react';
import { Component } from 'react';
import { withRouter } from 'react-router-dom'
import {  } from 'reactstrap';
import Api from '../api/Api'

class Checkout extends Component { 

  constructor(props) {

    super(props);
    this.state = {
      token: '',
      message: '',
    };

  }

  componentDidMount() {
    this.confirmToken();
  }

  confirmToken() {

    const { match: { params }} = this.props
    const confirm = Api.confirmToken(params.token)

    confirm.then( (result) => {

      if(result) {
        
        if(result.token) {
          this.setState({token: result.token});
        }
        else {
          this.setState({message: result.message});
        }

      }

    });

  }

  render() {
    return(
      <div></div>
    );
  }

}


export default withRouter(Checkout);