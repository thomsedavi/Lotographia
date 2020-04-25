import * as React from 'react';
import { Nav, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';

export class Home extends React.Component {
  render () {
    return (
      <div>
        <div className="component">
          <div className="title">
            Lotographia
          </div>
        </div>
        <div className="component">
          <div className="information">Hello! Welcome to the front page of my website.</div>
        </div>
        <div className="component">
          <div className="information">It still needs a lot of development. Particularly on this page.</div>
        </div>
        <div className="component">
          <div className="information">I intend to put games/distractions and photography here.</div>
        </div>
        <div className="component">
          <div className="information">Here are some short creative writing games, which I intend to add to every week:</div>
        </div>
        <div className="component">
          <NavLink tag={Link} to="/meticulous-skeleton">Meticulous Skeleton</NavLink>
        </div>
        <div className="component">
          <div className="information">Here is a single game I used to develop the Technology on this website:</div>
        </div>
        <div className="component">
          <NavLink tag={Link} to="/capital-party">Capital Party</NavLink>
        </div>
      </div>
    );
  }
}