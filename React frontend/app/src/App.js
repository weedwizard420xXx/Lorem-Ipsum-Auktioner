import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from'./components/Home';
import Register from'./components/Register';


class App extends Component {

  render() {

    return (
      <Router>
        <Switch>
          <Route path='/' exact={true} component={Home} />
          <Route path='/register' exact={true} component={Register} />
        </Switch>  
      </Router>
    );
    
  }

}

export default App;
