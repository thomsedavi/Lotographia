import * as React from 'react';
import { Nav, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';

export class Home extends React.Component {
  render () {
    return (
      <div>
        <div className="component">
          <div>Hello! Welcome to the front page of my website.</div>
          <div>It still needs a lot of development.</div>
          <div>I intend to put games/distractions and photography here.</div>
          <div>So far I have one game:</div>
        </div>
        <div className="component">
          <NavLink tag={Link} to="/capital-party">Capital Party</NavLink>
        </div>
      </div>
    );
  }
}
