import * as React from 'react';
import { Nav, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';

export class Lotophagia extends React.Component {
  render () {
    return (
      <div>
        <div>Games</div>
        <Nav>
          <NavLink tag={Link} to="/capital-party">Capital Party</NavLink>
        </Nav>
      </div>
    );
  }
}
