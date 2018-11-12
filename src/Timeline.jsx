import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { scaleLinear, scaleBand, scaleTime } from 'd3-scale';
import { max, extent } from 'd3-array';
import { select } from 'd3-selection';
import { axisLeft } from 'd3-axis';

import schedule from './data/timelineData';
import './Timeline.css';

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
    this.windowHeight = window.innerHeight;
    this.windowWidth = window.innerWidth;
    this.setupTimeline();
    this.updateWindowDimensions();
    console.log(`this.state`, this.state);
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  componentDidUpdate(prevProps, prevState) {}

  updateWindowDimensions() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    this.update();
  }

  findEndtime() {}

  setupTimeline() {
    this.margin = {
      left: 72,
      right: 0,
      top: 0,
      bottom: 0
    };
    this.width = this.windowWidth - this.margin.left - this.margin.right;
    this.height = this.windowHeight / 2 - this.margin.top - this.margin.bottom;

    this.g = select('#timeline')
      .append('svg')
      .style('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .style('background-color', '#212121')
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    this.yAxisGroup = this.g.append('g').attr('class', 'y axis');
    this.startTime = schedule.startTime;
    this.endTime = +moment(schedule.startTime)
      .add(6, 'h')
      .format('x');
    console.log(`this.endTime`, this.endTime);
  }

  createTimeStamps() {
    let time = moment(this.startTime);
    const minutes = time.minutes();
    const endTime = moment(this.endTime);
    const timeStamps = [];

    if (minutes !== 0 && minutes !== 15 && minutes !== 30 && minutes !== 45) {
      const remainder = 30 - (time.minute() % 30);
      time = moment(time).add(remainder, 'minutes');
    }

    while (time.isSameOrBefore(endTime)) {
      timeStamps.push(+time.utc().format('x'));
      time.add(30, 'm');
    }
    this.timeStamps = timeStamps;
    console.log(`this.timeStamps`, this.timeStamps);
  }

  handleBorders() {
    const leftBorder = this.g.selectAll('line.left').data([1]);
    leftBorder.exit().remove();

    leftBorder
      .enter()
      .append('line')
      .attr('class', 'left')
      .style('stroke-width', 1)
      .style('stroke', '#ffffff')
      .style('opacity', '0.2')
      .merge(leftBorder)
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', this.height);

    const timeBorder = this.g.selectAll('line.time-border').data([1]);
    timeBorder.exit().remove();

    timeBorder
      .enter()
      .append('line')
      .attr('class', 'time-border')
      .style('stroke-width', 1)
      .style('stroke', '#ffffff')
      .style('opacity', '0.2')
      .merge(timeBorder)
      .attr('x1', 0)
      .attr('y1', this.yTime(2))
      .attr('x2', this.width)
      .attr('y2', this.yTime(2));
  }

  handleLabels() {
    const labelData = ['TIME'];
    const labels = this.g.selectAll('text.label').data(labelData, d => d);

    labels.exit().remove();

    labels
      .enter()
      .append('text')
      .attr('class', 'label')
      .merge(labels)
      .attr('x', this.xLabel(0.25))
      .attr('y', this.yTime(1.5))
      .text(d => d)
      .style('font-size', '13px')
      .style('fill', '#ffffff');

    const timeBorder = this.g.selectAll('line.time-label-line').data(labelData, d => d);

    timeBorder.exit().remove();

    timeBorder
      .enter()
      .append('line')
      .attr('class', 'time-label-line')
      .style('stroke-width', 1)
      .style('stroke', '#393939')
      .merge(timeBorder)
      .attr('x1', -this.margin.left)
      .attr('y1', this.yTime(2))
      .attr('x2', 0)
      .attr('y2', this.yTime(2));
  }

  handleTimeStamps() {
    const times = this.g.selectAll('text.time').data(this.timeStamps, d => d);

    times.exit().remove();

    times
      .enter()
      .append('text')
      .attr('class', 'time')
      .merge(times)
      .attr('x', d => this.x(new Date(d)))
      .attr('y', this.yTime(1.5))
      .attr('text-anchor', 'middle')
      .text(d =>
        moment(d)
          .utc()
          .format('HHmm')
      )
      .style('font-size', '13px')
      .style('fill', '#ffffff');
  }

  handleTimeTicks() {
    const timeTicks = this.g.selectAll('line.time').data(this.timeStamps, d => d);

    timeTicks.exit().remove();

    timeTicks
      .enter()
      .append('line')
      .attr('class', 'time')
      .style('stroke-width', 1)
      .style('stroke', '#ffffff')
      .style('opacity', '0.2')
      .merge(timeTicks)
      .attr('x1', d => this.x(new Date(d)))
      .attr('y1', this.yTime(2))
      .attr('x2', d => this.x(new Date(d)))
      .attr('y2', this.height);
  }

  handleEvents() {
    const eventsData = schedule.events;

    const events = this.g.selectAll('rect.event').data([1], d => d);

    events.exit().remove();

    events
      .enter()
      .append('rect')
      .attr('class', 'event')
      .style('fill', '#000000')
      .style('opacity', '0.9')
      .merge(events)
      .attr('x', -this.margin.left)
      .attr('y', 0)
      .attr('width', this.margin.left)
      .attr('height', this.height);
  }

  handleLabelBlock() {
    const labelBlock = this.g.selectAll('rect.label').data([1], d => d);

    labelBlock.exit().remove();

    labelBlock
      .enter()
      .append('rect')
      .attr('class', 'label')
      .style('fill', '#000000')
      .style('opacity', '0.9')
      .merge(labelBlock)
      .attr('x', -this.margin.left)
      .attr('y', 0)
      .attr('width', this.margin.left)
      .attr('height', this.height);
  }

  reScale() {
    // X Scales
    this.x = scaleTime()
      .range([0, this.width])
      .domain([new Date(this.startTime), new Date(this.endTime)]);
    this.xLabel = scaleLinear()
      .range([-this.margin.left, 0])
      .domain([0, 2]);

    // Y Scales
    this.yTime = scaleLinear()
      .range([0, 24])
      .domain([0, 2]);
    this.yEvent = scaleLinear()
      .range([24, 54])
      .domain([0, 1]);
  }

  update() {
    this.width = this.windowWidth - this.margin.left - this.margin.right;
    this.height = this.windowHeight - this.margin.top - this.margin.bottom;
    select('#timeline')
      .style('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);
    this.reScale();

    this.createTimeStamps();
    this.handleTimeStamps();
    this.handleTimeTicks();

    this.handleEvents();

    this.handleLabelBlock();
    this.handleLabels();
    this.handleBorders();
  }

  render() {
    return (
      <div
        id="timeline"
        ref={node => {
          this.node = node;
        }}
      />
    );
  }
}

Timeline.propTypes = {
  width: PropTypes.number
};

Timeline.defaultProps = {
  width: 2000
};

export default Timeline;
