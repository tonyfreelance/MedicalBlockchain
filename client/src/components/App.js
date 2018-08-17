import React from 'react';
import { Link, IndexLink } from 'react-router';
import Auth from '../Auth';

let App = (props) => {
	return (
		<div className="App">
			<div className="ui fluid container">
				<div className="App-menu row">
					<div className="column">
						<IndexLink className="App-logo-text" to="/">MedBlock</IndexLink>
						{
							Auth.isUserAuthenticated() ? (
								<div className="right-aligned top-bar-link">
									<Link to="/logout">Logout</Link>
								</div>
							) : (
								<div></div>
							)
						}
					</div>
				</div>
				<div className="ui container">
					{props.children}
				</div>

			</div>
		</div>
	);
}

export default App;
