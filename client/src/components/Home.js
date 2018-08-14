import React, {Component} from 'react';
import { Button } from 'semantic-ui-react';

class Home extends Component {
	state = {

  }

	handleAdmin = () => {
    this.props.router.push('/admin');
  }

	handleDoctor = () => {
    this.props.router.push('/doctor');
  }


  handlePatient = () => {
    this.props.router.push('/patient');
  }

	render() {
		return (
			<div className="ui center aligned container mainScreen">
        <h1>Choose your role:</h1>
        <div className="row mainScreen-buttons">
          <Button color="orange huge" onClick={this.handleAdmin}>Admin</Button>
				</div>
				<div className="row mainScreen-buttons">
          <Button color="orange huge" onClick={this.handleDoctor}>Doctor</Button>
				</div>
				<div className="row mainScreen-buttons">
          <Button color="orange huge" onClick={this.handlePatient}>Patient</Button>
				</div>
			</div>
		);
	}
}

export default Home;
