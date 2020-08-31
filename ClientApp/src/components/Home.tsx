import * as React from 'react';
import { NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';
import { PaperFolliesIcon, CapricottaIcon, CapitalPartyIcon } from '../common/Assets';

interface HomeState {
  folliesSegment1: string,
  folliesSegment2: string,
  folliesSegment3: string,
  folliesColor1: string,
  folliesColor2: string,
  folliesColor3: string,
  capricottaSegment1: string,
  capricottaSegment2: string,
  capricottaSegment3: string,
  capricottaHover: boolean
}

export class Home extends React.Component<any, HomeState> {
  constructor(props: any) {
    super(props);

    this.state = {
      folliesSegment1: "Some kids lived in rural France...",
      folliesSegment2: "...the kids escaped from a school...",
      folliesSegment3: "...causing the school to expel them",
      folliesColor1: "#c9f",
      folliesColor2: "#dbf",
      folliesColor3: "#9cf",
      capricottaSegment1: "The clouds floated majestically above the mountains...",
      capricottaSegment2: "...and the forests hugged the base of the mountains...",
      capricottaSegment3: "...while the river abandoned the mountains for the sea",
      capricottaHover: false
    };
  }

  onMouseEvent = () => {
    const heroes: string = Math.random() < 0.5 ? "kids" : "fish";
    const noun: string = Math.random() < 0.5 ? "tank" : "school";

    let location: string;
    let result: string;

    if (heroes === "kids") {
      if (noun === "school") {
        location = Math.random() < 0.5 ? "in rural France" : "for excitement";
        result = Math.random() < 0.5 ? "close down" : "expel them";
      } else {
        location = Math.random() < 0.5 ? "during wartime" : "in the far future";
        result = Math.random() < 0.5 ? "chase them" : "send for help";
      }
    } else {
      if (noun === "school") {
        location = Math.random() < 0.5 ? "in a huge ocean" : "in a small pond";
        result = Math.random() < 0.5 ? "lose meaning" : "get confused";
      } else {
        location = Math.random() < 0.5 ? "in an old pet shop" : "at a dentist office";
        result = Math.random() < 0.5 ? "be empty" : "need more fish";
      }
    }


    this.setState({
      folliesSegment1: `Some ${heroes} lived ${location}...`,
      folliesSegment2: `...the ${heroes} escaped from a ${noun}...`,
      folliesSegment3: `...causing the ${noun} to ${result}`,
      folliesColor1: Math.random() < 0.5 ? "#c9f" : "#9cf",
      folliesColor2: Math.random() < 0.5 ? "#dbf" : "#fbd",
      folliesColor3: Math.random() < 0.5 ? "#c9f" : "#9cf"
    })
  }

  onMouseEnter = () => {
    this.setState({
      capricottaSegment1: "The zeppelin floated majestically above the mountains...",
      capricottaSegment2: "...and the train hugged the base of the mountains...",
      capricottaSegment3: "...while the barge abandoned the mountains for the sea",
      capricottaHover: true
    })
  } 

  onMouseLeave = () => {
    this.setState({
      capricottaSegment1: "The clouds floated majestically above the mountains...",
      capricottaSegment2: "...and the forests hugged the base of the mountains...",
      capricottaSegment3: "...while the river abandoned the mountains for the sea",
      capricottaHover: false
    })
  } 

  render () {
    return (
      <div>
        <div className="section">
          <div className="component">
            <div className="title">
              Lotographia Games
            </div>
          </div>
        </div>
        <div className="section">
          <div className="component">
            <NavLink tag={Link} to="/paper-follies" style={{ width: "24em", margin: "auto" }}><PaperFolliesIcon
              onMouseEvent={this.onMouseEvent}
              segment1={this.state.folliesSegment1}
              segment2={this.state.folliesSegment2}
              segment3={this.state.folliesSegment3}
              color1={this.state.folliesColor1}
              color2={this.state.folliesColor2}
              color3={this.state.folliesColor3}
            /></NavLink>
          </div>
          <div className="component">
            <div className="emphasis">Paper Follies is a creative writing game for three or more players where all players are writing on the same piece but can only see what one or two of the other players are writing.</div>
          </div>
        </div>
        <div className="section">
          <div className="component">
            <NavLink tag={Link} to="/capricotta" style={{ width: "24em", margin: "auto" }}><CapricottaIcon
              onMouseEnter={this.onMouseEnter}
              onMouseLeave={this.onMouseLeave}
              segment1={this.state.capricottaSegment1}
              segment2={this.state.capricottaSegment2}
              segment3={this.state.capricottaSegment3}
              showVehicles={this.state.capricottaHover}
            /></NavLink>
          </div>
          <div className="component">
            <div className="emphasis">Capricotta is a quick writing game for one person. Given a set of words, write a thing containing those words and have your input modified and placed against a picture. New material added occasionally.</div>
          </div>
        </div>
        <div className="section">
          <div className="component">
            <NavLink tag={Link} to="/capital-party" style={{ width: "24em", margin: "auto" }}>{CapitalPartyIcon}</NavLink>
          </div>
          <div className="component">
            <div className="emphasis">Capital Party is a simple game I created to develop the tools used by the other games. Describe a Party in the capital city of New Zealand.</div>
          </div>
        </div>
        <div className="component">
          <div className="emphasis">Follow me on Twitter at <a href="https://twitter.com/lotographia" target="_blank">@lotographia</a> for occasional updates on this website and/or other general observations about life in Wellington, New Zealand.</div>
        </div>
      </div>
    );
  }
}
