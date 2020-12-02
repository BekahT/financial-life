import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/database';

import { Goal } from './goal.model';
import { Subscription } from 'rxjs';
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
  sources: string[] = [];
  assets: Asset[] = [];
  liabilities: Liability[] = [];

  assetSubscription: Subscription;
  liabilitiesSubscription: Subscription;

  constructor(private fireDatabase: AngularFireDatabase) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.assetSubscription.unsubscribe();
    this.liabilitiesSubscription.unsubscribe();
  }

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

  onChange(category: string) {
    this.selectedCategory = category;
    if (this.selectedCategory === 'Savings') {
      // fetch assets names
      this.assetSubscription = this.fireDatabase.list("assets").snapshotChanges().subscribe((res) => {
        this.sources = []; // clear the old array
        res.forEach((asset) => {
          let newAsset = asset.payload.val() as Asset;
          this.assets.push(newAsset);
          this.sources.push(newAsset.name);
        });
      });
    } else if (this.selectedCategory === 'Debt Payoff') {
      // fetch liabilities names
      this.liabilitiesSubscription = this.fireDatabase.list("liabilities").snapshotChanges().subscribe((res) => {
        this.sources = []; // clear the old array
        res.forEach((asset) => {
          let newLiability = asset.payload.val() as Liability;
          this.liabilities.push(newLiability);
          this.sources.push(newLiability.name);
        });
      });
    }
  }

}
