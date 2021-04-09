import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Chart from 'chart.js';

import { groupDownloadsByPeriod } from 'utils/groupDates';

const propTypes = {
  graphStats: PropTypes.arrayOf(PropTypes.object).isRequired,
  colors: PropTypes.arrayOf(PropTypes.array).isRequired,
};

class TrendGraph extends Component {
  componentDidMount() {
    this.loadChart();
  }

  componentDidUpdate() {
    this.loadChart();
  }

  loadChart = () => {
    const { graphStats, colors } = this.props;

    if (typeof this.downloadChart !== 'undefined') {
      this.downloadChart.destroy();
    }
    if (graphStats.length > 0) {
      const chartData = { labels: [], datasets: [] };
      graphStats.forEach((graphStat, i) => {
        const dataColor = colors[i].join(',');

        const groupedData = groupDownloadsByPeriod(graphStat.downloads, 'week');
        if (i === 0) {
          const labels = groupedData.map((periodData) => periodData.period);
          chartData.labels = labels;
        }

        const data = groupedData.map((periodData) => ({
          x: periodData.period,
          y: periodData.downloads,
        }));

        const dataset = {
          label: graphStat.package,
          backgroundColor: `rgba(${dataColor},1)`,
          borderColor: `rgba(${dataColor},1)`,
          pointRadius: 4,
          pointHoverRadius: 4,
          pointBorderWidth: 1,
          pointBackgroundColor: 'transparent',
          pointBorderColor: 'transparent',
          pointHoverBackgroundColor: `rgba(${dataColor},1)`,
          pointHoverBorderColor: '#ffffff',
          fill: false,
          data,
        };
        chartData.datasets.push(dataset);
      }, this);

      const firstDateForChartMoment = moment(graphStats[0].downloads[0].day);

      const monthsToNow = moment().diff(firstDateForChartMoment, 'months');

      let xAxisDispalyUnit = 'week';

      if (monthsToNow >= 24) {
        xAxisDispalyUnit = 'year';
      } else if (monthsToNow >= 12) {
        xAxisDispalyUnit = 'quarter';
      } else if (monthsToNow >= 3) {
        xAxisDispalyUnit = 'month';
      }

      const chartOptions = {
        scaleFontColor: '#000000',
        responsive: true,
        datasetFill: false,
        scaleLabel: "<%= ' ' + value%>",
        maintainAspectRatio: false,
        legend: {
          onClick: (e) => e.stopPropagation(),
          labels: {
            padding: 25,
            fontSize: 14,
            usePointStyle: true,
            generateLabels: (chart) => {
              const { data } = chart;
              if (!data.datasets.length) {
                return [];
              }

              return data.datasets.map((dataset) => ({
                text: dataset.label,
                fillStyle: dataset.borderColor,
                strokeStyle: 'transparent',
              }));
            },
          },
        },
        scales: {
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: 'Weekly Downloads',
              },
              ticks: {
                beginAtZero: true,
                callback: (value) => Number(value).toLocaleString(),
              },
            },
          ],
          xAxes: [
            {
              type: 'time',
              time: {
                unit: xAxisDispalyUnit,
                tooltipFormat: 'll',
                displayFormats: {
                  quarter: 'MMM YYYY',
                },
              },
            },
          ],
        },
        tooltips: {
          mode: 'index',
          intersect: false,
          displayColors: true,
          multiKeyBackground: 'transparent',
          xPadding: 10,
          yPadding: 10,
          titleMarginBottom: 10,
          bodySpacing: 10,
          callbacks: {
            label: (tooltipItem, data) => {
              const value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].y;
              return ` ${Number(value).toLocaleString()}`;
            },
            labelColor: (tooltipItem, chart) => ({
              backgroundColor: chart.data.datasets[tooltipItem.datasetIndex].backgroundColor,
              borderColor: 'transparent',
            }),
          },
        },
        hover: {
          mode: 'index',
          intersect: false,
        },
      };

      const ctx = document.getElementById('download_chart').getContext('2d');

      this.downloadChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: chartOptions,
      });
    }
  };

  render() {
    const { graphStats } = this.props;

    if (!graphStats.length) return null;

    return (
      <div className="graph-container">
        <canvas id="download_chart" />
      </div>
    );
  }
}

TrendGraph.propTypes = propTypes;

export default TrendGraph;
