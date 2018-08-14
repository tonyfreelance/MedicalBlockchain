import React, {Component} from 'react';
import { Button } from 'semantic-ui-react';
import { CountryDropdown} from 'react-country-region-selector';
import axios from 'axios';
import {browserHistory} from 'react-router';

class Doctor extends Component {

  state = {
    page: 0
  }

  handleLogin = () => {
    this.setState({page: 1});
  }

  handleRegister = () => {
    this.setState({page: 2});
  }


  render() {
    let {page} = this.state;
    let showPage = () => {
      if (page == 0) {
        return (<div></div>);
      } else if (page == 1) {
        return (<DoctorLogin/>);
      } else {
        return (<DoctorRegister/>);
      }
    }
    return (
      <div className="ui center aligned container patient">
        <h2>Choose Login or Register</h2>
        <Button.Group size='huge' color="orange">
          <Button onClick={this.handleLogin}>Login</Button>
          <Button.Or />
          <Button onClick={this.handleRegister}>Register</Button>
        </Button.Group>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        {showPage()}
      </div>
    );
  }
}

class DoctorLogin extends Component {

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
      localStorage.setItem('fullName', response.data.fullName);
      localStorage.setItem('publicKey', response.data.publicKey);
      browserHistory.push('/doctor/dashboard');
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
      <div>
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

class DoctorRegister extends Component {
  state = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    postalCode: '',
    city: '',
    country: '',
    phone: ''
  }

  onSubmit = () => {


    let {firstName, lastName, password, confirmPassword, phone, address, postalCode, city, country, email} = this.state;

    let passToServer = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      phone,
      address,
      postalCode,
      city,
      country,
      role: 'doctor'
    };



    axios.post('/api/register', passToServer)
    .then((response) => {

      console.log(passToServer);

      // Redirect users to next screen
        browserHistory.push('/doctor/dashboard');
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
    let {firstName, lastName, password, confirmPassword, phone, address, postalCode, city, country, email} = this.state;

    return (
      <div className="ui stackable center aligned grid container">
        <div className="seven wide column">
          <form className="ui form register-form">

            <div className="two fields">
              <div className="required field">
                <label>First Name</label>
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={e => this.setState({firstName: e.target.value})}
                />
              </div>

              <div className="required field">
                <label>Last Name</label>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={e => this.setState({lastName: e.target.value})}
                />
              </div>
            </div>

            <div className="required field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={e => this.setState({email: e.target.value})}
              />
            </div>

            <div className="two fields">
              <div className="required field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => this.setState({password: e.target.value})}
                />
              </div>

              <div className="required field">
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={e => this.setState({confirmPassword: e.target.value})}
                />
              </div>
            </div>

            <div className="required field">
              <label>Address</label>
              <input
                type="text"
                name="address"
                placeholder="Street Address"
                value={address}
                onChange={e => this.setState({address: e.target.value})}
              />
            </div>

            <div className="two fields">
              <div className="required field">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={city}
                  onChange={e => this.setState({city: e.target.value})}
                />
              </div>

              <div className="required field">
                <label>Zip code</label>
                <input
                  type="text"
                  name="zipcode"
                  placeholder="Zip code"
                  value={postalCode}
                  onChange={e => this.setState({postalCode: e.target.value})}/>
              </div>
            </div>

            <div className="required field">
              <label>Country</label>
              <CountryDropdown
                classes="country-state"
                tabIndex="6"
                value={country}
                defaultOptionLabel={country || 'Select Country'}
                valueType="short"
                onChange={country => this.setState({country})}
              />
            </div>

            <div className="required field">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={phone}
                onChange={e => this.setState({phone: e.target.value})}
              />
            </div>

            <button
              className="fluid ui blue large button"
              type="submit"
              onClick={this.onSubmit}
              disabled={!(firstName && lastName && password && confirmPassword && phone && address && postalCode && city && country && email)}
            >
              Register
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default Doctor;
