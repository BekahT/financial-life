import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { FirebaseService } from '../shared/services/firebase.service';

import { Liability } from './liability.model';

@Component({
  selector: 'app-liabilities',
  templateUrl: './liabilities.component.html',
  styleUrls: ['./liabilities.component.css']
})
export class LiabilitiesComponent implements OnInit {
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  displayedColumns: string[] = ['category', 'name', 'balance', 'dueDate', 'interestRate', 'note', 'lastModified', 'actions'];
  dataSource: MatTableDataSource<Liability>;
  categories: string[] = ['Mortgage', 'Auto Loan', 'Student Loan', 'Credit Card', 'Other'];
  liabilities: Liability[] = [];
  editMode: Boolean = false;
  editId: string;

  liabilitiesRef = this.dbs.db.collection('liabilities');

  newLiabilityForm = new FormGroup({
    name: new FormControl('', Validators.required),
    balance: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
    dueDate: new FormControl(''),
    interestRate: new FormControl(''),
    note: new FormControl('')
  });

  constructor(private dbs: FirebaseService) { }

  ngOnInit(): void {
    this.liabilitiesRef.onSnapshot((res) => {
      this.liabilities = []; // clear the old liabilities array
      res.forEach((liability) => {
        let newLiability = liability.data() as Liability;
        newLiability.id = liability.id;
        this.liabilities.push(newLiability);
      });
      this.dataSource = new MatTableDataSource(this.liabilities);
      this.dataSource.sort = this.sort;
    });
  }

  getError(control: string) {
    return this.newLiabilityForm.get(control).hasError('required') ? 'Please enter a value' : '';
  }

  submitForm() {
    let liability: Liability = this.newLiabilityForm.value;

    if (liability.dueDate) {
      liability.dueDate = liability.dueDate.getTime();
    } else {
      liability.dueDate = "";
    }

    if (liability.note === undefined || null) {
      liability.note = "";
    }

    // Always update the modified date
    liability.lastModified = new Date().getTime();

    // Add or update the liability based on editMode or not
    if (this.editMode === false) {
      let id: string;
      this.liabilitiesRef.add(liability).then((docRef) => {
        id = docRef.id;
        // add a copy to the historical liability information
        this.dbs.db.collection('liabilities').doc(id).collection('historical').add(liability);
      });
    } else if (this.editMode === true) {
      // update the current asset information
      this.liabilitiesRef.doc(this.editId).set(liability);
      // add a copy to the historical liability information
      this.dbs.db.collection('liabilities').doc(this.editId).collection('historical').add(liability);
      // Reset the edit variables
      this.editId = null;
      this.editMode = false;
    }
    this.newLiabilityForm.reset();
  }

  getTotalBalance() {
    return this.liabilities.map(t => t.balance).reduce((acc, balance) => acc + balance, 0);
  }

  onEdit(liability: Liability) {
    // Set edit variables
    this.editMode = true;
    this.editId = liability.id;

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
      interestRate: liability.interestRate,
      note: liability.note
    });
  }

  onDelete(id: string) {
    // Get all historical entries and delete them
    this.dbs.db.collection('liabilities').doc(id).collection('historical').get().then((res) => {
      res.forEach((entry) => {
        this.dbs.db.collection('liabilities').doc(id).collection('historical').doc(entry.id).delete();
      });
    });
    // Delete the liability itself
    this.liabilitiesRef.doc(id).delete();
  }

  onReset() {
    // Reset the edit variables
    this.editId = null;
    this.editMode = false;
    this.newLiabilityForm.reset();
  }

}
