import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../shared/services/firebase.service';

import { Goal } from './goal.model';
import { Asset } from '../assets/asset.model';
import { Liability } from '../liabilities/liability.model';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.css']
})
export class GoalsComponent implements OnInit {
  newGoalForm = new FormGroup({
    category: new FormControl('', Validators.required),
    source: new FormControl('', Validators.required),
    amount: new FormControl('', Validators.required),
    completionDate: new FormControl(''),
  });

  categories: string[] = ['Savings', 'Debt Payoff'];
  selectedCategory: string;
  selectedSource: string;
  sources: string[] = [];
  assets: Asset[] = [];
  liabilities: Liability[] = [];

  assetsRef = this.dbs.db.collection('assets');
  liabilitesRef = this.dbs.db.collection('liabilities');


  constructor(private dbs: FirebaseService) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {}

  getError(control: string) {
    return this.newGoalForm.get(control).hasError('required') ? 'Please enter a value' : '';
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
      let selectedLiability = this.liabilities.find(element => element.name === this.selectedSource);
      if (selectedLiability.dueDate !== "") {
        this.newGoalForm.patchValue({
          completionDate: new Date(selectedLiability.dueDate)
        });
      }
    }
  }

}
