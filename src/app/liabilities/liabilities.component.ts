import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { AngularFireDatabase } from '@angular/fire/database';

import { Liability } from './liability.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-liabilities',
  templateUrl: './liabilities.component.html',
  styleUrls: ['./liabilities.component.css']
})
export class LiabilitiesComponent implements OnInit {
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  displayedColumns: string[] = ['category', 'name', 'balance', 'dueDate', 'note', 'actions'];
  dataSource: MatTableDataSource<Liability>;
  categories: string[] = ['Mortgage', 'Auto Loan', 'Student Loan', 'Credit Card', 'Other'];
  liabilities: Liability[] = [];
  editMode: Boolean = false;
  editId: string;

  liabilitySubscription: Subscription;

  newLiabilityForm = new FormGroup({
    name: new FormControl('', Validators.required),
    balance: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
    dueDate: new FormControl(''),
    note: new FormControl('')
  });

  constructor(private fireDatabase: AngularFireDatabase) { }

  ngOnInit(): void {
    this.liabilitySubscription = this.fireDatabase.list("liabilities").snapshotChanges().subscribe((res) => {
      this.liabilities = []; // clear the old liabilities array
      res.forEach((liability) => {
        let newLiability = liability.payload.val() as Liability;
        newLiability.id = liability.key;
        this.liabilities.push(newLiability);
      });
      this.dataSource = new MatTableDataSource(this.liabilities);
      this.dataSource.sort = this.sort;
    });
  }

  ngOnDestroy(): void {
    this.liabilitySubscription.unsubscribe();
  }

  getError(control: string) {
    return this.newLiabilityForm.get(control).hasError('required') ? 'Please enter a value' : '';
  }

  submitForm() {
    const liability: Liability = this.newLiabilityForm.value;
    const liabilitiesRef = this.fireDatabase.list('liabilities');

    if (liability.dueDate) {
      liability.dueDate = liability.dueDate.getTime();
    } else {
      liability.dueDate = "";
    }
    // Firebase doesn't take null/undefined, so set empty notes to empty string
    if (liability.note === undefined) {
      liability.note = "";
    }

    if (this.editMode === false) {
      liabilitiesRef.push(liability);
    } else if (this.editMode === true) {
      liabilitiesRef.set(this.editId, liability);
      // Reset the edit variables
      this.editId = null;
      this.editMode = false;
    }
    this.newLiabilityForm.reset();
  }

  getTotalBalance() {
    return this.liabilities.map(t => t.balance).reduce((acc, balance) => acc + balance, 0);
  }

  onEdit(id: string, liability: Liability) {
    // Set edit variables
    this.editMode = true;
    this.editId = id;

    let dueDate: Date;
    // Format the due date so it appears in the form
    if(liability.dueDate) {
      dueDate = new Date(liability.dueDate);
    }

    // Fill in the form with liability to edit
    this.newLiabilityForm.patchValue({
      name: liability.name,
      balance: liability.balance,
      category: liability.category,
      dueDate: dueDate,
      note: liability.note
    });
  }

  onDelete(id: string) {
    this.fireDatabase.list('liabilities').remove(id);
  }

  onReset() {
    // Reset the edit variables
    this.editId = null;
    this.editMode = false;
    this.newLiabilityForm.reset();
  }

}
