import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { FirebaseService } from '../shared/services/firebase.service';
import { SnackbarServiceService } from '../shared/services/snackbar-service.service';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';

import { Goal } from './goal.model';
import { Asset } from '../assets/asset.model';
import { Liability } from '../liabilities/liability.model';

import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.css']
})
export class GoalsComponent implements OnInit, OnDestroy {
  // Form Set up
  newGoalForm = new FormGroup({
    category: new FormControl('', Validators.required),
    source: new FormControl('', Validators.required),
    amount: new FormControl('', [Validators.required, Validators.min(1)]),
    completionDate: new FormControl(''),
  });

  goals: Goal[] = [];

  categories: string[] = ['Savings', 'Debt Payoff'];
  selectedCategory: string;

  sources: string[] = [];
  selectedSource: string;

  assets: Asset[] = [];
  selectedAsset: Asset;

  liabilities: Liability[] = [];
  selectedLiability: Liability;

  payoffError: string;

  editMode: boolean = false;
  editId: string;
  isLoading: boolean = false;

  // db calls
  assetsRef = this.dbs.getAssetsRef();
  liabilitiesRef = this.dbs.getLiabilitiesRef();
  goalsRef = this.dbs.getGoalsRef();

  compDest: Subject<any> = new Subject<any>();

  constructor(private dbs: FirebaseService, private snackbarService: SnackbarServiceService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.isLoading = true;
    // Get all the assets from the db
    this.assetsRef.orderBy('name').onSnapshot(res => {
      this.assets = []; // clear the old asset array
      res.forEach(asset => {
        const newAsset = asset.data() as Asset;
        newAsset.id = asset.id;
        this.assets.push(newAsset);
      });
    }, () => {
      this.snackbarService.showFailureSnackbar('Error Fetching Assets');
    });

    // Get all the liabilties from the db
    this.liabilitiesRef.orderBy('name').onSnapshot(res => {
      this.liabilities = []; // clear the old liabilities array
      res.forEach(liability => {
        const newLiability = liability.data() as Liability;
        newLiability.id = liability.id;
        this.liabilities.push(newLiability);
      });
    }, () => {
      this.snackbarService.showFailureSnackbar('Error Fetching Liabilities');
    });

    // Get all the goals from the db
    this.goalsRef.orderBy('category').orderBy('source').onSnapshot(res => {
      this.goals = []; // clear the old goals array
      res.forEach(goal => {
        const newGoal = goal.data() as Goal;
        newGoal.id = goal.id;
        this.goals.push(newGoal);
      });
      this.isLoading = false;
    }, () => {
      this.snackbarService.showFailureSnackbar('Error Fetching Goals');
      this.isLoading = false;
    });

    this.newGoalForm.get('category').valueChanges.pipe(
      takeUntil(this.compDest)
    ).subscribe(newCategory => {
      this.onCategory(newCategory);
    });

    this.newGoalForm.get('source').valueChanges.pipe(
      takeUntil(this.compDest)
    ).subscribe(newSource => {
      this.onSource(newSource);
    });

    this.newGoalForm.get('amount').valueChanges.pipe(
      takeUntil(this.compDest),
      debounceTime(1500),
      distinctUntilChanged()
    ).subscribe(newAmount => {
      this.onAmount(newAmount);
    });
  }

  ngOnDestroy(): void {
    this.compDest.next();
    this.compDest.complete();
  }

  getError(control: string): string {
    if (this.newGoalForm.get(control).hasError('required')) {
      return 'Please enter a value';
    } else if (this.newGoalForm.get(control).hasError('min')) {
      return 'Please enter an amount greater than 1';
    } else {
      return 'Invalid value';
    }
  }

  submitForm(): void {
    const goal: Goal = this.newGoalForm.value;
    goal.lastModified = new Date().getTime();
    if (goal.completionDate) {
      goal.completionDate = goal.completionDate.getTime();
    } else {
      goal.completionDate = '';
    }
    // Link the associated asset or liability via it's id as a FK in the goal
    if (goal.category === 'Savings' && this.selectedAsset) {
      goal.assetId = this.selectedAsset.id;
      goal.liabilityId = null; // In case the user change the category when editing
    } else if (goal.category === 'Debt Payoff' && this.selectedLiability) {
      goal.liabilityId = this.selectedLiability.id;
      goal.assetId = null; // In case the user change the category when editing
    }

    // Add or update the goal based on editMode or not
    if (this.editMode === false) {
      this.dbs.addGoal(goal);
    } else if (this.editMode === true) {
      this.dbs.updateGoal(goal, this.editId);

      // Reset the edit variables
      this.editId = null;
      this.editMode = false;
    }
    this.newGoalForm.reset();
  }

  onReset(): void {
    this.newGoalForm.reset();
  }

  onCategory(category: string): void {
    this.selectedCategory = category;
    if (this.selectedCategory === 'Savings') {
      this.sources = []; // Clear the old array
      // Set sources to asset names
      this.assets.forEach(asset => {
        this.sources.push(asset.name);
      });
    } else if (this.selectedCategory === 'Debt Payoff') {
      this.sources = []; // Clear the old array
      // Set sources to liability names
      this.liabilities.forEach(liability => {
        this.sources.push(liability.name);
      });
    }
  }

  onSource(source: string): void {
    this.selectedSource = source;
    if (this.selectedCategory === 'Debt Payoff') {
      // Set the completion date to the due date of the debt
      this.selectedLiability = this.liabilities.find(element => element.name === this.selectedSource);
      if (this.selectedLiability.dueDate !== '') {
        this.newGoalForm.patchValue({
          completionDate: new Date(this.selectedLiability.dueDate)
        });
      }
    } else if (this.selectedCategory === 'Savings') {
      // Set the selected asset
      this.selectedAsset = this.assets.find(element => element.name === this.selectedSource);
    }
  }

  onAmount(amount: number): void {
    if (this.newGoalForm.valid && this.newGoalForm.get('completionDate').value) {
      const completionDate = moment(this.newGoalForm.get('completionDate').value);
      const today = moment();
      const monthsReq = this.selectedLiability.balance / amount;
      const monthsLeft = completionDate.diff(today, 'months');

      if (monthsReq > monthsLeft) {
        const monthsNeeded = (monthsReq - monthsLeft).toFixed(0);
        const amountNeeded = (this.selectedLiability.balance / monthsLeft).toFixed(2);
        this.payoffError = 'The debt will not be paid off by the due date with the monthly amount specified. ' +
          'At the current monthly amount, an additional ' + monthsNeeded + ' months are required. ' +
          'Alternatively, the debt can be paid in time by paying more than $' + amountNeeded + ' per month.';
      } else {
        this.payoffError = '';
      }
    }
  }

  onEdit(goal: Goal): void {
    // Set edit variables
    this.editMode = true;
    this.editId = goal.id;

    let completionDate: Date;
    // Format the date for the form
    if (goal.completionDate) {
      completionDate = new Date(goal.completionDate);
    }

    // Fill in the form with the goal to edit
    this.newGoalForm.patchValue({
      category: goal.category,
      source: goal.source,
      amount: goal.amount,
      completionDate
    });
  }

  onDelete(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      data: {type: 'goal'}
    });

    dialogRef.afterClosed().subscribe(result => {
      // Only delete if the user selected yes
      if(result === true) {
        this.dbs.deleteGoal(id);
      }
    });
  }

  getBalance(type: string, id: string): number {
    let balance: number;
    // Depending on the type, use the fk to get the balance
    if (type === 'asset') {
      const asset: Asset = this.assets.find(element => element.id === id);
      balance = asset.value;
    } else if (type === 'liability') {
      const liability: Liability = this.liabilities.find(element => element.id === id);
      balance = liability.balance;
    } else {
      balance = null;
      this.snackbarService.showFailureSnackbar('Invalid type. Could not get balance.');
    }
    return balance;
  }
}
