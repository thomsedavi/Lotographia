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
          <div className="information">I called my website 'Lotographia'. Also, my Twitter username is <a href="https://twitter.com/lotographia" target="_blank">@lotographia</a>. They are the same word. I was inspired by the term 'lotophagi' but made my website 'study of lotuses' instead of 'eater of lotuses'.</div>
        </div>
        <div className="component">
          <div className="information">I like bumblebees and having a nap.</div>
        </div>
        <div className="component">
          <div className="information">The game here are free to play. In the future I might add some kind of tip jar, but in the meantime you can support me by voting for <a href="https://ideas.lego.com/projects/ac984a2f-45b5-4bda-ae11-37a68ba7d736" target="_blank">my LEGO Ideas project</a>.</div>
        </div>
      </div>
    );
  }
}
