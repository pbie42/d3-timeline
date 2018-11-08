import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { scaleLinear, scaleBand } from 'd3-scale';
import { max } from 'd3-array';
import { select } from 'd3-selection';
import { axisLeft } from 'd3-axis';

class Timeline extends Component {
  constructor(props) {
    super(props);
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  state = {
    width: this.props.width,
    height: 130
  };

  componentDidMount() {
    this.updateWindowDimensions();
    console.log(`this.state`, this.state);
    this.setupTimeline();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  componentDidUpdate(prevProps, prevState) {}

  setupTimeline() {
    this.margin = {
      left: 24,
      right: 5,
      top: 0,
      bottom: 0
    };
    this.width = this.windowWidth - this.margin.left - this.margin.right;
    this.height = this.windowHeight - this.margin.top - this.margin.bottom;

    this.g = select('#timeline')
      .append('svg')
      .style('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
  }

  setupSVGHeight() {}

  updateWindowDimensions() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
  }

  render() {
    return <div id="timeline" />;
  }
}

Timeline.propTypes = {
  width: PropTypes.number
};

Timeline.defaultProps = {
  width: 2000
};

export default Timeline;
