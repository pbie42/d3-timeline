import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { scaleLinear, scaleTime } from 'd3-scale';
import { select } from 'd3-selection';

import schedule from './data/timelineData';
import './Timeline.css';

class Timeline extends Component {
  constructor(props) {
    super(props);
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

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

  setupTimeline() {
    this.timeRowHeight = 24;
    this.eventsRowHeight = 32;

    this.findSectionsAndRows();

    let tasksRowsCombinedHeight = 0;
    this.taskGroups.forEach(tg => {
      tasksRowsCombinedHeight += tg.tasks.length * 14 + tg.tasks.length + 1;
    });

    const timelineHeight = tasksRowsCombinedHeight + this.timeRowHeight + this.eventsRowHeight;

    this.margin = {
      left: 72,
      right: 0,
      top: 0,
      bottom: 0
    };
    const totalHeight = timelineHeight + this.margin.top + this.margin.bottom;
    this.width = this.windowWidth - this.margin.left - this.margin.right;
    this.height = totalHeight - this.margin.top - this.margin.bottom;

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
  }

  sortTasks(taskGroupName) {
    const taskGroup = schedule.taskGroups.find(t => t.name === taskGroupName);
    const rows = [];
    let placed = false;
    taskGroup.tasks.forEach((t, index) => {
      if (rows[0] === undefined) {
        rows.push([t]);
        return;
      }
      rows.forEach((r, i) => {
        const found = r.find(item => !(t.endTime <= item.startTime || t.startTime >= item.endTime));
        if (!found && !placed) {
          r.push(t);
          placed = true;
        }
      });
      if (!placed) {
        rows.push([t]);
      } else placed = false;
    });
    return rows;
  }

  findSectionsAndRows() {
    const taskGroups = schedule.taskGroups;
    const sortedTGs = [];

    taskGroups.forEach(tg => {
      sortedTGs.push({
        name: tg.name,
        tasks: this.sortTasks(tg.name)
      });
    });
    console.log(`sortedTGs`, sortedTGs);
    this.taskGroups = sortedTGs;
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
    console.log(`eventsData`, eventsData);

    const events = this.g.selectAll('rect.event').data(eventsData, d => d);

    events.exit().remove();

    events
      .enter()
      .append('rect')
      .attr('class', 'event')
      .style('fill', '#151515')
      .attr('rx', 6)
      .attr('ry', 6)
      .style('stroke-width', 1)
      .style('stroke', '#505050')
      .merge(events)
      .attr('x', d => this.x(d.startTime))
      .attr('y', this.yEvent(0) + 3)
      .attr('width', d => this.x(d.endTime) - this.x(d.startTime))
      .attr('height', 26);

    const eventsLabelsLeft = this.g.selectAll('text.event-left').data(eventsData, d => d);

    eventsLabelsLeft.exit().remove();

    eventsLabelsLeft
      .enter()
      .append('text')
      .attr('class', 'event-left')
      .style('fill', '#ffffff')
      .style('font-size', '11px')
      .merge(eventsLabelsLeft)
      .attr('text-anchor', 'start')
      .text(d => d.label)
      .attr('x', d => this.x(d.startTime) + 8)
      .attr('y', this.yEvent(1.25));

    const eventsLabelsRight = this.g.selectAll('text.event-right').data(eventsData, d => d);

    eventsLabelsRight.exit().remove();

    eventsLabelsRight
      .enter()
      .append('text')
      .attr('class', 'event-right')
      .style('fill', '#ffffff')
      .style('font-size', '11px')
      .merge(eventsLabelsRight)
      .attr('text-anchor', 'end')
      .text(d => d.label)
      .attr('x', d => this.x(d.endTime) - 8)
      .attr('y', this.yEvent(1.25));
  }

  handleTaskGroupLabel(taskGroup) {
    const className = taskGroup.name
      .toLowerCase()
      .split(' ')
      .join('-');
    const groupName = taskGroup.name.toLowerCase().split(' ')[0];
    const taskGroupLabels = this.g.selectAll(`text.${className}`).data([taskGroup.name], d => d);

    taskGroupLabels.exit().remove();

    taskGroupLabels
      .enter()
      .append('text')
      .attr('class', `${className}`)
      .merge(taskGroupLabels)
      .attr('x', this.xLabel(0.25))
      .attr('y', d => this[`y${groupName}`](taskGroup.tasks.length / 2) + 5)
      .text(groupName.toUpperCase().substr(0, 6) + '...')
      .style('font-size', '13px')
      .style('fill', '#ffffff');

    const taskGroupLabelBorder = this.g.selectAll(`line.${className}-label`).data([taskGroup.name], d => d);

    taskGroupLabelBorder.exit().remove();

    taskGroupLabelBorder
      .enter()
      .append('line')
      .attr('class', `${className}-label`)
      .style('stroke-width', 1)
      .style('stroke', '#393939')
      .merge(taskGroupLabelBorder)
      .attr('x1', -this.margin.left)
      .attr('y1', d => this[`y${groupName}`](taskGroup.tasks.length))
      .attr('x2', 0)
      .attr('y2', d => this[`y${groupName}`](taskGroup.tasks.length));

    const taskGroupLabel = this.g.selectAll(`line.${className}-border`).data([taskGroup.name], d => d);

    taskGroupLabel.exit().remove();

    taskGroupLabel
      .enter()
      .append('line')
      .attr('class', `${className}-border`)
      .style('stroke-width', 1)
      .style('stroke', '#ffffff')
      .style('opacity', '0.2')
      .merge(taskGroupLabel)
      .attr('x1', 0)
      .attr('y1', d => this[`y${groupName}`](taskGroup.tasks.length))
      .attr('x2', this.width)
      .attr('y2', d => this[`y${groupName}`](taskGroup.tasks.length));
  }

  handleTasks(tasks, taskGroupName, row) {
    const className = taskGroupName
      .toLowerCase()
      .split(' ')
      .join('-');
    const groupName = taskGroupName.toLowerCase().split(' ')[0];
    const taskRects = this.g.selectAll(`rect.${className}${row}`).data(tasks, d => d);

    taskRects.exit().remove();

    taskRects
      .enter()
      .append('rect')
      .attr('class', `${className}${row}`)
      .style('fill', d => (d.severity === 'SEVERE' ? '#ff3455' : '#f8e71c'))
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('name', d => d.title)
      .merge(taskRects)
      .attr('x', d => this.x(d.startTime))
      .attr('y', this[`y${groupName}`](row) + 1)
      .attr('width', d => this.x(d.endTime) - this.x(d.startTime))
      .attr('height', 14);
  }

  handleTaskGroup(taskGroup, row) {
    this.handleTaskGroupLabel(taskGroup);
    // this.handleTaskGroupBorder(taskGroup);
    taskGroup.tasks.forEach((tasks, i) => this.handleTasks(tasks, taskGroup.name, i));
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

  labelTextPosition(item) {
    switch (item) {
      case 'TIME':
        return this.yTime(1.5);
      case 'EVENTS':
        return this.yEvent(1.25);
      default:
        break;
    }
  }

  borderPosition(item) {
    switch (item) {
      case 'TIME':
        return this.yTime(2);
      case 'EVENTS':
        return this.yEvent(2);
      default:
        break;
    }
  }

  handleLabels() {
    const labelData = ['TIME', 'EVENTS'];
    const labels = this.g.selectAll('text.label').data(labelData, d => d);

    labels.exit().remove();

    labels
      .enter()
      .append('text')
      .attr('class', 'label')
      .merge(labels)
      .attr('x', this.xLabel(0.25))
      .attr('y', d => this.labelTextPosition(d))
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
      .attr('y1', d => this.borderPosition(d))
      .attr('x2', 0)
      .attr('y2', d => this.borderPosition(d));
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

    const labelData = ['TIME', 'EVENTS'];
    const sectionBorders = this.g.selectAll('line.section-border').data(labelData, d => d);
    sectionBorders.exit().remove();

    sectionBorders
      .enter()
      .append('line')
      .attr('class', 'section-border')
      .style('stroke-width', 1)
      .style('stroke', '#ffffff')
      .style('opacity', '0.2')
      .merge(sectionBorders)
      .attr('x1', 0)
      .attr('y1', d => this.borderPosition(d))
      .attr('x2', this.width)
      .attr('y2', d => this.borderPosition(d));
  }

  reScale() {
    // X Scales
    this.x = scaleTime()
      .range([0, this.width])
      .domain([new Date(this.startTime), new Date(this.endTime)]);
    this.xLabel = scaleLinear()
      .range([-this.margin.left, 0])
      .domain([0, 2]);

    // Y Scales that will always be the same
    this.yTime = scaleLinear()
      .range([0, this.timeRowHeight])
      .domain([0, 2]);
    const eventsRowRangeMax = this.timeRowHeight + this.eventsRowHeight;
    this.yEvent = scaleLinear()
      .range([this.timeRowHeight, eventsRowRangeMax])
      .domain([0, 2]);

    // Y scales created for each Task Group that comes after Event Row
    let increase = eventsRowRangeMax;
    this.taskGroups.forEach(tg => {
      const groupName = tg.name.toLowerCase().split(' ')[0];
      const taskBarsTotalHeight = tg.tasks.length * 14;
      const taskBarsPadding = tg.tasks.length + 1;
      const endRange = taskBarsTotalHeight + taskBarsPadding;
      this[`y${groupName}`] = scaleLinear()
        .range([increase, (increase += endRange)])
        .domain([0, tg.tasks.length]);
    });
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
    this.taskGroups.forEach((tg, i) => this.handleTaskGroup(tg, i));

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
