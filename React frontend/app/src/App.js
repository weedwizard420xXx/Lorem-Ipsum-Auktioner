import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Register from './components/Register';
import Logout from './components/Logout'
import RegisterAukt from './components/RegisterAukt'
import CreatePassword from './components/CreatePassword'
import Login from './components/Login';
import Brugerside from './components/Brugerside';
import Adminsite from './components/Adminsite';
import Auktsite from './components/Auktsite';
import SendVurdering from './components/SendVurdering';
import RegisterAuktioner from './components/RegisterAuktioner';
import EditAuk from './components/EditAuk';
import Checkout from './components/Checkout';
import UserAuktioner from './components/UserAuktioner';

class App extends Component {

  render() {

    return (
      <Router>
        <Switch>
          <Route path='/' exact={true} component={Login} />
          <Route path='/register' exact={true} component={Register} />
          <Route path='/logout' exact={true} component={Logout} />
          <Route path='/registerAukt' exact={true} component={RegisterAukt} />
          <Route path='/setPassword/:token' exact={true} component={CreatePassword} />
          <Route path='/login' exact={true} component={Login}/>
          <Route path='/brugerside' exact={true} component={Brugerside}/>
          <Route path='/adminsite' exact={true} component={Adminsite}/>
          <Route path='/auktsite' exact={true} component={Auktsite}/>
          <Route path='/SendVurdering' exact={true} component={SendVurdering}/>
          <Route path='/RegisterAuktioner' exact={true} component={RegisterAuktioner}/>
          <Route path='/EditAuk/:id' exact={true} component={EditAuk} />
          <Route path='/betaling/:token' exact={true} component={Checkout}/>
          <Route path='/UserAuktioner' exact={true} component={UserAuktioner}/>
        </Switch>  
      </Router>
    );
    
  }

}

export default App;
