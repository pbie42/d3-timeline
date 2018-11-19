import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { scaleLinear, scaleTime } from 'd3-scale';
import tip from 'd3-tip';
import { select } from 'd3-selection';

import schedule from './data/timelineDataLive';
import './Timeline.css';

class Timeline extends Component {
  constructor(props) {
    super(props);
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.state = {
      selected: '',
      selectedTime: ''
    };
  }

  componentDidMount() {
    this.windowHeight = window.innerHeight;
    this.windowWidth = window.innerWidth;
    this.setupTimeline();
    this.updateWindowDimensions();
    this.tickInterval = setInterval(() => this.tick(), 1000);

    // Listen for window resize
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    // Remove window resize listener and tick interval
    window.removeEventListener('resize', this.updateWindowDimensions);
    clearInterval(this.tickInterval);
  }

  updateWindowDimensions() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    this.update();
  }

  tick() {
    // Every second this is called to update the start and end times of the graph
    // which will change the timeScale allowing everything to "move" with the time
    this.startTime = +moment()
      .utc()
      .subtract(15, 'm')
      .format('x');
    this.endTime = +moment(this.startTime)
      .add(6, 'h')
      .format('x');
    this.update();
  }

  setupTimeline() {
    // Pre set heights for rows that will always display and will not need to change
    this.timeRowHeight = 24;
    this.eventsRowHeight = 32;

    this.sortTaskGroups();

    let tasksRowsCombinedHeight = 0;
    this.taskGroups.forEach(tg => {
      tasksRowsCombinedHeight += tg.tasks.length * 14 + tg.tasks.length + 1;
    });

    // Height of the actual timeline, not the svg
    this.timelineHeight = tasksRowsCombinedHeight + this.timeRowHeight + this.eventsRowHeight;

    // Add margin information if visible info or titles need to be added outside
    // the timeline, such as row labels.
    this.margin = {
      left: 72,
      right: 0,
      top: 0,
      bottom: 0
    };
    // Actual size calculations for the svg
    this.totalHeight = this.timelineHeight + this.margin.top + this.margin.bottom;
    this.width = this.windowWidth - this.margin.left - this.margin.right;

    // Create the SVG where everything will be placed inside
    this.g = select('#timeline')
      .append('svg')
      .style('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.totalHeight)
      .style('background-color', '#212121')
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    // An HTML tool tip was chosen so it could display outside of the SVG if needed.
    // Also needs to be created here to prevent making new tool tips each update.
    this.toolTip = tip()
      .attr('class', 'd3-tip timeline-tooltip')
      .html(d => this.handleTipHtml(d))
      .direction('s');

    this.startTime = schedule.startTime;
    this.endTime = +moment(schedule.startTime)
      .add(6, 'h')
      .format('x');
  }

  // Easy algorithm for sorting tasks whose times overlap into different "mini-rows"
  // that will be displayed on the graph in their respective "row".
  sortTasks(taskGroups, taskGroupName) {
    const taskGroup = taskGroups.find(t => t.name === taskGroupName);
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

  sortTaskGroups() {
    const taskGroups = schedule.taskGroups;
    this.taskGroups = taskGroups.map(tg => ({
      name: tg.name,
      tasks: this.sortTasks(taskGroups, tg.name)
    }));
  }

  createTimeStamps() {
    let time = moment(this.startTime);
    const minutes = time.minutes();
    const endTime = moment(this.endTime);
    const timeStamps = [];

    if (minutes !== 0 && minutes !== 30) {
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

  handleTimeStamps() {
    // An update property is added with the current time to force an update of
    // each time stamp position. This is used throughout the timeline handlers
    // in order to ensure everything is redrawn in the order it should be.
    const mappedStamps = this.timeStamps.map(t => ({ stamp: t, update: moment() }));

    const times = this.g.selectAll('text.time').data(mappedStamps, d => d.update);

    times.exit().remove();

    times
      .enter()
      .append('text')
      .attr('class', 'time')
      .merge(times)
      .attr('x', d => this.x(d.stamp))
      .attr('y', this.yTime(1.5))
      .attr('text-anchor', 'middle')
      .text(d =>
        moment(d.stamp)
          .utc()
          .format('HHmm')
      )
      .style('font-size', '13px')
      .style('fill', '#ffffff');
  }

  handleTimeTicks() {
    const mappedStamps = this.timeStamps.map(t => ({ stamp: t, update: moment() }));

    const timeTicks = this.g.selectAll('line.time').data(mappedStamps, d => d.update);

    timeTicks.exit().remove();

    timeTicks
      .enter()
      .append('line')
      .attr('class', 'time')
      .style('stroke-width', 1)
      .style('stroke', '#ffffff')
      .style('opacity', '0.2')
      .merge(timeTicks)
      .attr('x1', d => this.x(d.stamp))
      .attr('y1', this.yTime(2))
      .attr('x2', d => this.x(d.stamp))
      .attr('y2', this.timelineHeight);
  }

  handleDoNotDisturb() {
    const doNotData = schedule.doNotDisturb.map(d => ({ ...d, update: moment() }));

    const doNotRects = this.g.selectAll('rect.no-disturb').data(doNotData, d => d.update);

    doNotRects.exit().remove();

    doNotRects
      .enter()
      .append('rect')
      .attr('class', 'no-disturb')
      .style('fill', '#304ffe')
      .style('opacity', '0.5')
      .merge(doNotRects)
      .attr('x', d => this.x(d.startTime))
      .attr('y', this.yTime(0) + 2)
      .attr('width', d => this.x(d.endTime) - this.x(d.startTime))
      .attr('height', 22);

    const doNotLine = this.g.selectAll('line.no-disturb').data(doNotData, d => d.update);

    doNotLine.exit().remove();

    doNotLine
      .enter()
      .append('line')
      .attr('class', 'no-disturb')
      .style('stroke-width', 4)
      .style('stroke', '#304ffe')
      .merge(doNotLine)
      .attr('x1', d => this.x(d.startTime))
      .attr('x2', d => this.x(d.endTime))
      .attr('y1', 0)
      .attr('y2', 0);
  }

  handleEvents() {
    const eventsData = schedule.events.map(e => ({ ...e, update: moment() }));

    const events = this.g.selectAll('rect.event').data(eventsData, d => d.update);

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

    const eventsLabelsLeft = this.g.selectAll('text.event-left').data(eventsData, d => d.update);

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

    const eventsLabelsRight = this.g.selectAll('text.event-right').data(eventsData, d => d.update);

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
    const taskGroupLabels = this.g.selectAll(`text.${className}`).data([{ name: taskGroup.name, update: moment() }], d => d.update);

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

    const taskGroupLabelBorder = this.g
      .selectAll(`line.${className}-label`)
      .data([{ name: taskGroup.name, update: moment() }], d => d.update);

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

  handleTipHtml(d) {
    let html = '<div class="top-tooltip">';
    html += `<div class="tool-color ${d.severity === 'SEVERE' ? 'tool-severe' : 'tool-moderate'}">${d.taskGroupName
      .toUpperCase()
      .substr(0, 3)}</div>`;
    html += '<div class="tool-section">';
    html += ' <div class="tool-title">SECTOR</div>';
    html += '<div class="tool-info">A</div>';
    html += '</div>';
    html += '<div class="tool-section">';
    html += '<div class="tool-title">BEGIN</div>';
    html += `<div class="tool-info">${moment(d.startTime)
      .utc()
      .format('HHmm')}</div>`;
    html += '</div>';
    html += '<div class="tool-section">';
    html += '<div class="tool-title">END</div>';
    html += `<div class="tool-info">${moment(d.endTime)
      .utc()
      .format('HHmm')}</div>`;
    html += '</div>';
    html += '<div class="tool-section">';
    html += '<div class="tool-title">A/C</div>';
    html += `<div class="tool-info">${moment(d.endTime)
      .utc()
      .format('DD/MM')}</div>`;
    html += '</div>';
    html += '</div>';
    if (d.title) {
      html += '<div class="bottom-tooltip">';
      html += '<div class="status-block status-title"><div>STATUS</div></div>';
      html += `<div class="status-status">${d.title}</div>`;
      html += '<div class="status-block status-filler"></div>';
    }
    html += '</div>';
    return html;
  }

  handleSelectedTime(selected) {
    const selectedData = [{ time: selected, update: moment() }];

    const darkenedRect = this.g.selectAll('rect.darkened').data(selectedData, d => d.update);
    darkenedRect.exit().remove();

    darkenedRect
      .enter()
      .append('rect')
      .attr('class', 'darkened')
      .style('fill', d => 'rgba(0, 0, 0, 0.5)')
      .merge(darkenedRect)
      .on('click', d => {
        this.setState({ selected: '', selectedTime: '' });
        this.update();
      })
      .attr('x', d => 0)
      .attr('y', d => this.yTime(0))
      .attr('width', d => this.x(d.time))
      .attr('height', this.timelineHeight);

    const selectedStampRect = this.g.selectAll('rect.selected').data(selectedData, d => d.update);

    selectedStampRect.exit().remove();

    selectedStampRect
      .enter()
      .append('rect')
      .attr('class', 'selected')
      .style('fill', d => 'black')
      .attr('rx', 9)
      .attr('ry', 9)
      .style('stroke-width', 2)
      .style('stroke', '#ffffff')
      .merge(selectedStampRect)
      .attr('x', d => this.x(d.time) - 34)
      .attr('y', this.yTime(0) + 2)
      .attr('width', 68)
      .attr('height', this.timeRowHeight - 4);

    const selectedLine = this.g.selectAll('line.selected').data(selectedData, d => d.update);

    selectedLine.exit().remove();

    selectedLine
      .enter()
      .append('line')
      .attr('class', 'selected')
      .style('stroke-width', 2)
      .style('stroke', '#ffffff')
      .merge(selectedLine)
      .attr('x1', d => this.x(d.time))
      .attr('y1', this.yTime(2) - 2)
      .attr('x2', d => this.x(d.time))
      .attr('y2', this.timelineHeight);

    const selectedStamp = this.g.selectAll('text.selected').data(selectedData, d => d.update);

    selectedStamp.exit().remove();

    selectedStamp
      .enter()
      .append('text')
      .attr('class', 'selected')
      .merge(selectedStamp)
      .attr('x', d => this.x(d.time))
      .attr('y', this.yTime(1.5))
      .attr('text-anchor', 'middle')
      .text(d =>
        moment(d.time)
          .utc()
          .format('HHmm')
      )
      .style('font-size', '14px')
      .style('fill', '#ffffff');
  }

  handleSelection(task) {
    if (this.state.selected === task.title) {
      this.setState({ selected: '', selectedTime: '' });
      this.update();
    } else {
      this.setState({ selected: task.title, selectedTime: task.startTime });
      this.update();
    }
  }

  handleTasks(tasks, taskGroupName, row) {
    const { selectedTime } = this.state;
    const mappedTasks = tasks.map(t => ({ ...t, update: moment(), taskGroupName }));
    const className = taskGroupName
      .toLowerCase()
      .split(' ')
      .join('-');
    const groupName = taskGroupName.toLowerCase().split(' ')[0];

    const taskRects = this.g.selectAll(`rect.${className}${row}`).data(mappedTasks, d => d.update);

    this.g.call(this.toolTip);

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
      .on('mouseover', this.toolTip.show)
      .on('mouseout', this.toolTip.hide)
      .on('click', d => this.handleSelection(d))
      .style('opacity', d => (selectedTime && d.startTime !== selectedTime ? '0.5' : '1'))
      .style('stroke-width', d => (d.title === this.state.selected ? 2 : 0))
      .style('stroke', 'blue')
      .attr('x', d => this.x(d.startTime))
      .attr('y', this[`y${groupName}`](row) + 1)
      .attr('width', d => this.x(d.endTime) - this.x(d.startTime))
      .attr('height', 14);
  }

  handleTaskGroup(taskGroup) {
    taskGroup.tasks.forEach((tasks, i) => this.handleTasks(tasks, taskGroup.name, i));
  }

  handleLabelBlock() {
    const labelBlock = this.g.selectAll('rect.label').data([moment()], d => d);

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
      .attr('height', this.timelineHeight);
  }

  // Using switch cases in order to add new set rows more easily
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
    const labelData = [{ title: 'TIME', update: moment() }, { title: 'EVENTS', update: moment() }];

    const labels = this.g.selectAll('text.label').data(labelData, d => d.update);

    labels.exit().remove();

    labels
      .enter()
      .append('text')
      .attr('class', 'label')
      .merge(labels)
      .attr('x', this.xLabel(0.25))
      .attr('y', d => this.labelTextPosition(d.title))
      .text(d => d.title)
      .style('font-size', '13px')
      .style('fill', '#ffffff');

    const timeBorder = this.g.selectAll('line.time-label-line').data(labelData, d => d.update);

    timeBorder.exit().remove();

    timeBorder
      .enter()
      .append('line')
      .attr('class', 'time-label-line')
      .style('stroke-width', 1)
      .style('stroke', '#393939')
      .merge(timeBorder)
      .attr('x1', -this.margin.left)
      .attr('y1', d => this.borderPosition(d.title))
      .attr('x2', 0)
      .attr('y2', d => this.borderPosition(d.title));
  }

  handleBorders() {
    const leftBorder = this.g.selectAll('line.left').data([moment()], d => d);
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
      .attr('y2', this.timelineHeight);

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

  handleCurrentTime() {
    const current = +moment()
      .utc()
      .format('x');

    const currentStampRect = this.g.selectAll('rect.current').data([current], d => d);

    currentStampRect.exit().remove();

    currentStampRect
      .enter()
      .append('rect')
      .attr('class', 'current')
      .style('fill', d => 'black')
      .attr('rx', 9)
      .attr('ry', 9)
      .style('stroke-width', 2)
      .style('stroke', '#ffffff')
      .merge(currentStampRect)
      .attr('x', d => this.x(d) - 34)
      .attr('y', this.yTime(0) + 2)
      .attr('width', 68)
      .attr('height', this.timeRowHeight - 4);

    const currentLine = this.g.selectAll('line.current').data([current], d => d);

    currentLine.exit().remove();

    currentLine
      .enter()
      .append('line')
      .attr('class', 'current')
      .style('stroke-width', 2)
      .style('stroke', '#ffffff')
      .merge(currentLine)
      .attr('x1', d => this.x(d))
      .attr('y1', this.yTime(2) - 2)
      .attr('x2', d => this.x(d))
      .attr('y2', this.timelineHeight);

    const currentStamp = this.g.selectAll('text.current').data([current], d => d);

    currentStamp.exit().remove();

    currentStamp
      .enter()
      .append('text')
      .attr('class', 'current')
      .merge(currentStamp)
      .attr('x', d => this.x(d))
      .attr('y', this.yTime(1.5))
      .attr('text-anchor', 'middle')
      .text(d =>
        moment(d)
          .utc()
          .format('HHmm')
      )
      .style('font-size', '14px')
      .style('fill', '#ffffff');
  }

  reScale() {
    // X Scales
    this.x = scaleTime()
      .range([0, this.width])
      .domain([this.startTime, this.endTime]);
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

    // Y scales created for each Task Group that comes after set rows. Done so
    // that it is easier to place rows in positions based on the scale.
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
    this.totalHeight = this.timelineHeight + this.margin.top + this.margin.bottom;
    this.width = this.windowWidth - this.margin.left - this.margin.right;
    select('#timeline')
      .style('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.totalHeight);

    this.reScale();

    this.createTimeStamps();
    this.handleTimeStamps();
    this.handleTimeTicks();
    this.handleDoNotDisturb();

    this.handleEvents();
    this.taskGroups.forEach((tg, i) => this.handleTaskGroup(tg, i));

    this.handleLabelBlock();
    this.taskGroups.forEach((tg, i) => this.handleTaskGroupLabel(tg));

    this.handleLabels();
    this.handleBorders();
    this.handleCurrentTime();

    if (this.state.selected !== '') this.handleSelectedTime(this.state.selectedTime);
    else {
      this.g.selectAll('rect.selected').remove();
      this.g.selectAll('line.selected').remove();
      this.g.selectAll('text.selected').remove();
      this.g.selectAll('rect.darkened').remove();
    }
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
