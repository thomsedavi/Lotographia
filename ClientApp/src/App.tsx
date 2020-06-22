import * as React from "react";
import { Route } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./components/Home";
import { About } from "./categories/About";
import { Lotophagia } from "./categories/Lotophagia";
import { Photographia } from "./categories/Photographia";
import { CapitalParty } from "./pictures/CapitalParty";
import { MeticulousSkeleton } from "./pictures/MeticulousSkeleton";
import { LayersTool } from "./pictures/LayersTool";
import { Mistletoe } from "./mistletoe/Mistletoe";
import { Style } from "./components/Style";

import "./custom.css"

export default class App extends React.Component {
  render () {
    return (
      <Layout>
        <Route exact path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/lotophagia" component={Lotophagia} />
        <Route path="/photographia" component={Photographia} />
        <Route path="/capital-party" component={CapitalParty} />
        <Route path="/meticulous-skeleton" component={MeticulousSkeleton} />
        <Route path="/layers-tool" component={LayersTool} />
        <Route path="/mistletoe" component={Mistletoe} />
        <Route path="/style" component={Style} />
      </Layout>
    );
  }
}
