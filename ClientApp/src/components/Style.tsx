import * as React from 'react';
import { StatusGood } from '../common/Assets';

export class Style extends React.Component {
  render () {
    return (
      <div>
        <div className="component">
          <div className="title">This Is What The Title Looks Like</div>
        </div>
        <div className="component">
          <div className="error-message">Oh no but also an error</div>
        </div>
        <div className="component">
          <div className="subtitle">This Is What The Subtitle Looks Like</div>
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
          <div className="information">Here is a bunch if informations that are probably a bit too many words, lorem ipsum and so forth. Do I have a full stop at the end? I don't know</div>
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
