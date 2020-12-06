import { Component, Input, OnChanges, OnInit} from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import * as moment from 'moment';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Color, Label } from 'ng2-charts';

import { Goal } from 'src/app/goals/goal.model';
import { FirebaseService } from '../services/firebase.service';
import { Asset } from 'src/app/assets/asset.model';
import { Liability } from 'src/app/liabilities/liability.model';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit, OnChanges {
  @Input()
  goal: Goal;

  // Chart Set up
  chartOptions: ChartOptions = {
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true,
          // Include a dollar sign in the ticks
          callback: function(value) {
            return this.currencyPipe.transform(value);
        }.bind(this)
        }
      }]
    },
    tooltips: {
      mode: "nearest",
      intersect: false,
      callbacks: {
        // Convert value in tooltip to currency
        label: function(tooltipItem, data) {
          let label = data.datasets[tooltipItem.datasetIndex].label || '';
          if (label) {
            label += ': ';
          }
          label += this.currencyPipe.transform(tooltipItem.yLabel);
          return label;
      }.bind(this)
      }
    }
  };
  chartColors: Color[] = [
    {
      borderColor: '#3700B3',
      backgroundColor: '#6200EE',
    }
  ];
  chartType: ChartType = 'line';
  chartLegend = true;
  chartPlugins = [];

  chartLabels: Label[];

  chartData: ChartDataSets[];

  ngOnChanges(): void {
    this.chartLabels = [];
    this.chartData = [];
    let historicalValues: number[] = [];
    if(this.goal.assetId) {
      this.dbs.db.collection('assets').doc(this.goal.assetId).collection('historical').orderBy("lastModified").get().then((res) => {
        res.forEach((entry) => {
          let historicalEntry = entry.data() as Asset;
          // Set the Last Modified Date to the X axis label
          let lastModified = moment(historicalEntry.lastModified).format('YYYY-MM-DD');
          this.chartLabels.push(lastModified);
          // Set the balance to the Y axis data
          historicalValues.push(historicalEntry.value);
        });
        this.chartData = [{
          data: historicalValues,
          label: this.goal.source + " value"
        }]
      });
    } else if (this.goal.liabilityId) {
      this.dbs.db.collection('liabilities').doc(this.goal.liabilityId).collection('historical').orderBy("lastModified").get().then((res) => {
        res.forEach((entry) => {
          let historicalEntry = entry.data() as Liability;
          // Set the Last Modified Date to the X axis label
          let lastModified = moment(historicalEntry.lastModified).format('YYYY-MM-DD');
          this.chartLabels.push(lastModified);
          // Set the balance to the Y axis data
          historicalValues.push(historicalEntry.balance);
        });
        this.chartData = [{
          data: historicalValues,
          label: this.goal.source + " balance due"
        }]
      });
    }
  }

  constructor(private dbs: FirebaseService, private currencyPipe: CurrencyPipe) { }

  ngOnInit(): void {
  }

}
