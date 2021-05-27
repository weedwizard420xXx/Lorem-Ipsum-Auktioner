import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';
import Logout from './components/Logout'
import RegisterAukt from './components/RegisterAukt'
import CreatePassword from './components/CreatePassword'
import Login from './components/Login';
import Brugerside from './components/Brugerside';


class App extends Component {

  render() {

    return (
      <Router>
        <Switch>
          <Route path='/' exact={true} component={Home} />
          <Route path='/register' exact={true} component={Register} />
          <Route path='/logout' exact={true} component={Logout} />
          <Route path='/registerAukt' exact={true} component={RegisterAukt} />
          <Route path='/setPassword/:token' exact={true} component={CreatePassword} />
          <Route path='/login' exact={true} component={Login}/>
          <Route path='/brugerside' exact={true} component={Brugerside}/>
        </Switch>  
      </Router>
    );
    
  }

}

export default App;
