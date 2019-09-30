import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as uuid from 'uuid';
import * as invariant from 'invariant';

import { Component, Input, OnInit, OnDestroy, OnChanges, AfterViewInit } from '@angular/core';
import { HexGrid, Layout, Hexagon, Text, GridGenerator, HexUtils, Pattern  } from 'react-hexgrid';
import configs from './configurations.json';

interface HexmapProps {
    onLoadingChanged?: (any);
    onError?: (any);
}

@Component({
  selector: 'app-hexmap',
  template: '<span></span>',
  styleUrls: ['./hexmap.component.css']
})
export class HexmapComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
 
    private rootDomID: string;
     
    protected getRootDomNode() {
        const node = document.getElementById(this.rootDomID);
        invariant(node, `Node '${this.rootDomID} not found!`);
        return node;
    }
 
    private isMounted(): boolean {
        return !!this.rootDomID;
    }
 
    protected render() {
      const config = configs['denari'];
      const generator = GridGenerator.getGenerator(config.map);
      const hexagons = generator.apply(this, config.mapProps);
      var hexes = [];

      hexagons.map((hex, i) => (
        hexes.push(
          React.createElement(Hexagon, {"key":config.mapProps+i, "q":hex.q, "r":hex.r, "s":0, "pattern":config.hexType[hex.r + Math.floor(hex.q/2)][hex.q], "className":config.hexType[hex.r + Math.floor(hex.q/2)][hex.q]},
            React.createElement(Text, null, config.hexType[hex.r + Math.floor(hex.q/2)][hex.q] == "ocean" ? "" : hex.q + "." + ((hex.r+7) + Math.floor(hex.q/2)) )
          )
      )));

      if (this.isMounted()) {
          ReactDOM.render(
            React.createElement(HexGrid, { "width":config.width, "height":config.height, "viewBox":"-5 20 100 100"},
              [
                React.createElement(Layout, { "size":{"x": config.layout.width, "y": config.layout.height}, "flat":config.layout.flat, "spacing":config.layout.spacing },
                  [
                    hexes
                  ]  
                ),
                React.createElement(Pattern, {"key":0, "id":"green", "link":"http://lorempixel.com/400/400/cats/2/", "size":{"x": config.layout.width, "y": config.layout.height}})
              ]
            ), this.getRootDomNode()
          );
      }
    }
 
    ngOnInit() {
        this.rootDomID = uuid.v1();
    }
 
    ngOnChanges() {
        this.render();
    }
 
    ngAfterViewInit() {
        this.render();
    }
 
    ngOnDestroy() {
        ReactDOM.unmountComponentAtNode(this.getRootDomNode())
    }
}