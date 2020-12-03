import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../shared/services/firebase.service';

import { Goal } from './goal.model';
import { Asset } from '../assets/asset.model';
import { Liability } from '../liabilities/liability.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.css']
})
export class GoalsComponent implements OnInit, OnDestroy {
  newGoalForm = new FormGroup({
    category: new FormControl('', Validators.required),
    source: new FormControl('', Validators.required),
    amount: new FormControl('', [Validators.required, Validators.min(1)]),
    completionDate: new FormControl(''),
  });

  categories: string[] = ['Savings', 'Debt Payoff'];
  selectedCategory: string;
  selectedSource: string;
  sources: string[] = [];
  assets: Asset[] = [];
  liabilities: Liability[] = [];
  selectedLiability: Liability;
  payoffError: string;

  assetsRef = this.dbs.db.collection('assets');
  liabilitesRef = this.dbs.db.collection('liabilities');

  compDest: Subject<any> = new Subject;


  constructor(private dbs: FirebaseService) { }

  ngOnInit(): void {
    this.newGoalForm.get('category').valueChanges.pipe(
      takeUntil(this.compDest)
    ).subscribe((newCategory) => {
      this.onCategory(newCategory);
    });

    this.newGoalForm.get('source').valueChanges.pipe(
      takeUntil(this.compDest)
    ).subscribe((newSource) => {
      this.onSource(newSource);
    });

    this.newGoalForm.get('amount').valueChanges.pipe(
      takeUntil(this.compDest),
      debounceTime(1500),
      distinctUntilChanged()
    ).subscribe((newAmount) => {
      this.onAmount(newAmount);
    });


  }

  ngOnDestroy(): void {
    this.compDest.next();
    this.compDest.complete();
  }

  getError(control: string) {
    if (this.newGoalForm.get(control).hasError('required')) {
      return 'Please enter a value';
    } else if (this.newGoalForm.get(control).hasError('min')) {
      return 'Please enter an amount greater than 1';
    } else {
      return 'Invalid value';
    }


  }

  submitForm() {
    const goal: Goal = this.newGoalForm.value;
    console.log(goal);
    this.newGoalForm.reset();
  }

  onReset() {
    this.newGoalForm.reset();
  }

  onCategory(category: string) {
    this.selectedCategory = category;
    if (this.selectedCategory === 'Savings') {
      this.sources = []; // Clear the old array
      // fetch assets names
      let that = this;
      this.assetsRef.get().then((querySnapshot) => {
        querySnapshot.forEach(function(asset) {
          let newAsset = asset.data() as Asset;
          that.assets.push(newAsset);
          that.sources.push(newAsset.name);
        });
      });

    } else if (this.selectedCategory === 'Debt Payoff') {
      this.sources = []; // Clear the old array
      // fetch liabilities names
      let that = this;
      this.liabilitesRef.get().then((querySnapshot) => {
        querySnapshot.forEach(function(liability) {
          let newLiability = liability.data() as Liability;
          that.liabilities.push(newLiability);
          that.sources.push(newLiability.name);
        });
      });
    }
  }

  onSource(source: string) {
    this.selectedSource = source;
    if(this.selectedCategory === 'Debt Payoff') {
      // Set the completion date to the due date of the debt
      this.selectedLiability = this.liabilities.find(element => element.name === this.selectedSource);
      if (this.selectedLiability.dueDate !== "") {
        this.newGoalForm.patchValue({
          completionDate: new Date(this.selectedLiability.dueDate)
        });
      }
    }
  }

  onAmount(amount: number) {
    if(this.newGoalForm.valid && this.newGoalForm.get('completionDate').value) {
      let completionDate = moment(this.newGoalForm.get('completionDate').value);
      let today = moment();
      let monthsReq = this.selectedLiability.balance / amount;
      let monthsLeft = completionDate.diff(today, 'months');

      if (monthsReq > monthsLeft) {
        let monthsNeeded = (monthsReq - monthsLeft).toFixed(0);
        let amountNeeded = (this.selectedLiability.balance / monthsLeft).toFixed(2);
        this.payoffError = "The debt will not be paid off by the due date with the monthly amount specified. " +
        "At the current monthly amount, an additional " + monthsNeeded + " months are required. " +
        "Alternatively, the debt can be paid in time by paying more than $" + amountNeeded + " per month.";
      } else {
        this.payoffError = "";
      }
    }
  }

}
