import * as React from 'react';

export class About extends React.Component {
  render () {
    return (
      <div>
        <div className="component">
          <div className="title">
            About
          </div>
        </div>
        <div className="component">
          <div className="information">Hello! My name is David Thomsen.</div>
        </div>
        <div className="component">
          <div className="information">I called my website 'Lotographia'.</div>
        </div>
        <div className="component">
          <div className="information">I intend to make games and put photography on this website.</div>
        </div>
        <div className="component">
          <div className="information">I like bumblebees and having a nap.</div>
        </div>
        <div className="component">
          <div className="information">There will be more content on this website soon.</div>
        </div>
      </div>
    );
  }
}
