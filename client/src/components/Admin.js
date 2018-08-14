import React, {Component} from 'react';
import { Button } from 'semantic-ui-react';
import { CountryDropdown} from 'react-country-region-selector';
import axios from 'axios';
import {browserHistory} from 'react-router';

class Admin extends Component {

  state = {
    email: '',
    password: ''
  }

  handleSubmit = (e) => {
    e.preventDefault();

    let user = {
      email: this.state.email,
      password: this.state.password
    };

    console.log(user);

    axios.post('/api/login', user)
    .then((response) => {
      // Redirect users to next screen
      console.log(response);
      // localStorage.setItem('fullName', response.data.fullName);
      // localStorage.setItem('publicKey', response.data.publicKey);
      browserHistory.push('/admin/dashboard');
    })
    .catch(error => {
      // Show error notification
      console.log(error);
      // const failedNotification = {
      //   title: 'Error!',
      //   message: 'Could not process the form.',
      //   level: 'error'
      // };
      // this.addNotification(failedNotification);
    });
  }

  render() {
    let {email, password} = this.state;
    return (
      <div className="ui center aligned container patient">
        <h2>Login</h2>
        <div className="ui one column stackable center aligned grid container">
          <div className="column five wide">
            <form className="ui form">
              <div className="required field">
                <label className="left-aligned">Your Email</label>
                <input
                  className="border-bottom-only"
                  type="email"
                  tabIndex="1"
                  value={email}
                  placeholder="Your Email"
                  onChange={e => this.setState({email: e.target.value})}
                />
              </div>
              <br/>
              <br/>
              <div className="required field">
                <label className="left-aligned">Password</label>
                <input
                  className="border-bottom-only"
                  type="password"
                  tabIndex="2"
                  value={password}
                  placeholder="Your Password"
                  onChange={e => this.setState({password: e.target.value})}
                />
              </div>
              <br/>
              <br/>
              <button className="ui fluid blue large button" type="submit" disabled={!(email && password)} onClick={this.handleSubmit}>Login</button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default Admin;
