import * as React from 'react';
import { StatusGood } from '../common/Assets';

export class Style extends React.Component {
  render () {
    return (
      <div>
        <div className="component headers">
          <button className="left">Home</button>
          <button className="left">About</button>
          <button className="right">Exit</button>
        </div>
        <div className="component">
          <div className="title">This Is What The Title Looks Like</div>
        </div>
        <div className="component">
          <div className="error-message">Oh no but also an error</div>
        </div>
        <div className="component">
          <div className="subtitle">This Is What The Subtitle Looks Like</div>
        </div>
        <div className="component guides">
          <button className="highlight">First</button>
          <button disabled={true}>Previous</button>
          <button>You</button>
        </div>
        <div className="component guides">
          <button className="highlight">1/5</button>
          <div className="divider">...</div>
          <button disabled={true}>4/5</button>
          <button>5/5 (You)</button>
        </div>
        <div className="component">
          <label htmlFor="password">Password</label>
          <br />
          <input type="password" id="password" />
          <br />
          <div className="note">Here is a note about the password</div>
        </div>
        <div className="component">
          <label htmlFor="name">Name</label>
          <br />
          <input type="text" id="name" className="error" />
        </div>
        <div className="component">
          <label htmlFor="occupation">Occupation</label>
          <br />
          <input type="text" id="occupation"disabled />
        </div>
        <div className="component">
          <input type="checkbox" id="doSomething" />
          <label htmlFor="doSomething">Do Something</label>
          <br />
          <div className="note">A label for the checkbox</div>
        </div>
        <div className="component">
          <div className="information">Here is a bunch of lorem ipsums. Words words words and other words, lorem ipsum words. The End.</div>
        </div>
        <div className="component">
          <div className="text">This is called 'text' and is used for fixed text</div>
        </div>
        <div className="component">
          <label htmlFor="document">Document</label>
          <br />
          <textarea placeholder="placeholder" id="document" rows={2} cols={32} />
        </div>
        <div className="component">
          <select>
            <option value="basic">Basic Select</option>
            <option value="verybasic">Very Basic Select</option>
          </select>
        </div>
        <div className="component">
          <div className="option">
            <div className="name">
              Inactive Option
            </div>
            <div className="description">
              This is an inactive option
            </div>
          </div>
          <div className="option active">
            <img className="image left" src="./CapitalParty/lizards.png" />
            <div className="name">
              Active Option
            </div>
            <div className="description">
              This is an active option with a lizard on the left
            </div>
          </div>
          <div className="option active selected">
            <img className="image right" src="./CapitalParty/aliens.png" />
            <div className="name">
              Selected Option
            </div>
            <div className="description">
              This is a selected option with an alien on the right
            </div>
          </div>
        </div>
        <div className="component box-container">
          <div className="box-header">
            Some text
          </div>
          <div className="box-view">
            <div className="box-item" title="hover">Yaks and ducks</div>
            <div className="box-item selected" title="hover">Some new things</div>
          </div>
        </div>
        <div className="component box-container">
          <div className="box-header">
            Some text
          </div>
          <div className="box-view">
            <div className="box-item" title="hover">Yaks and ducks</div>
            <div className="box-item selected" title="hover">Some new things</div>
          </div>
        </div>
        <div className="component box-container">
          <div className="box-header">
            Some text
          </div>
          <div className="box-view">
            <div className="box-item" title="hover">Yaks and ducks</div>
            <div className="box-item" title="hover">Some new things</div>
            <div className="box-item" title="hover">Potato</div>
            <div className="box-item selected" title="hover">Happy Days</div>
            <div className="box-item" title="hover">Smith</div>
            <div className="box-item" title="hover">Jones</div>
            <div className="box-item" title="hover">Jeff</div>
            <div className="box-item" title="hover">Toni</div>
            <div className="box-item" title="hover">This line is really long which causes it to overflow onto a new line to see how this situation is handled</div>
          </div>
          <div className="box-footer">
            <div>Some text</div>
            <div>Some more</div>
            <div>Even more</div>
            <div>This line is really long which causes it to overflow onto a new line to see how this situation is handled</div>
          </div>
        </div>
        <div className="component">
          {StatusGood}
        </div>
        <div className="component buttons">
          <button className="action">Enabled Action Button</button>
          <button className="action" disabled>Disabled Action Button</button>
        </div>
        <div className="component buttons">
          <button className="navigation">Enabled Navigation Button</button>
          <button className="navigation" disabled>Disabled Navigation Button</button>
        </div>
      </div>
    );
  }
}
