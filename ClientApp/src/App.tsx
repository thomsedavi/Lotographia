import * as React from "react";
import { Route, Switch } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./components/Home";
import { About } from "./categories/About";
import { Lotophagia } from "./categories/Lotophagia";
import { Photographia } from "./categories/Photographia";
import { CapitalParty } from "./pictures/CapitalParty";
import { Capricotta } from "./pictures/Capricotta";
import { LayersTool } from "./pictures/LayersTool";
import { PaperFollies } from "./paperFollies/PaperFollies";
import { WordGameTest } from "./pictures/WordGameTest";
import { LexicologerNew, LexicologerGame } from "./lexicologer/Lexicologer";
import { Tovelund } from "./tovelund/TovelundGame";
import { TovelundAdmin } from "./tovelund/TovelundAdmin";
import { Style } from "./components/Style";

import "./custom.css"

export default class App extends React.Component {
  render() {
    const route = <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/lotophagia" component={Lotophagia} />
      <Route path="/photographia" component={Photographia} />
      <Route path="/capital-party" component={CapitalParty} />
      <Route path="/capricotta" component={Capricotta} />
      <Route path="/layers-tool" component={LayersTool} />
      <Route path="/paper-follies" component={PaperFollies} />
      <Route path="/word-game-test" component={WordGameTest} />
      <Route path="/lexicologer/:gameId" component={LexicologerGame} />
      <Route path="/lexicologer" component={LexicologerNew} />
      <Route path="/tovelund" component={Tovelund} />
      <Route path="/tovelund-admin" component={TovelundAdmin} />
      <Route path="/style" component={Style} />
    </Switch>;

    return (
      <Layout>
        {route}
      </Layout>
    );
  }
}
