import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

import { FirebaseService } from '../shared/services/firebase.service';
import { SnackbarServiceService } from '../shared/services/snackbar-service.service';

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
  isLoading: Boolean = false;

  liabilitiesRef = this.dbs.getLiabilitiesRef();

  newLiabilityForm = new FormGroup({
    name: new FormControl('', Validators.required),
    balance: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
    dueDate: new FormControl(''),
    interestRate: new FormControl(''),
    note: new FormControl('')
  });

  constructor(private dbs: FirebaseService, private snackbarService: SnackbarServiceService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.liabilitiesRef.orderBy("category").orderBy("name").onSnapshot((res) => {
      this.liabilities = []; // clear the old liabilities array
      res.forEach((liability) => {
        let newLiability = liability.data() as Liability;
        newLiability.id = liability.id;
        this.liabilities.push(newLiability);
      });
      this.dataSource = new MatTableDataSource(this.liabilities);
      this.dataSource.sort = this.sort;
      this.isLoading = false;
    }, (error) => {
      this.snackbarService.showFailureSnackbar("Error Fetching Liabilities");
      this.isLoading = false;
    });
  }

  getError(control: string): string {
    return this.newLiabilityForm.get(control).hasError('required') ? 'Please enter a value' : '';
  }

  submitForm(): void {
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
        this.dbs.getHistoricalLiabilitiesRef(id).add(liability);
        this.snackbarService.showSuccessSnackbar("Liability Successfully Created");
      }).catch((error) => {
        this.snackbarService.showFailureSnackbar("Error Creating Liability");
      });
    } else if (this.editMode === true) {
      // update the current asset information
      this.liabilitiesRef.doc(this.editId).set(liability).then((res) => {
        this.snackbarService.showSuccessSnackbar("Liability Successfully Updated");
      }).catch((error) => {
        this.snackbarService.showFailureSnackbar("Error Updating Liability");
      });
      // add a copy to the historical liability information
      this.dbs.getHistoricalLiabilitiesRef(this.editId).add(liability).catch((error) => {
        this.snackbarService.showFailureSnackbar("Error Updating Liability History");
      });

      // Reset the edit variables
      this.editId = null;
      this.editMode = false;
    }
    this.newLiabilityForm.reset();
  }

  getTotalBalance(): number {
    return this.liabilities.map(t => t.balance).reduce((acc, balance) => acc + balance, 0);
  }

  onEdit(liability: Liability): void {
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

  onDelete(id: string): void {
    // Get all historical entries and delete them
    this.dbs.getHistoricalLiabilitiesRef(id).get().then((res) => {
      res.forEach((entry) => {
        this.dbs.getHistoricalLiabilitiesRef(id).doc(entry.id).delete();
      });
    }).catch((error) => {
      this.snackbarService.showFailureSnackbar("Error Deleting Liability History");
    });
    // Delete the liability itself
    this.liabilitiesRef.doc(id).delete().then((res) => {
      this.snackbarService.showSuccessSnackbar("Liability Successfully Deleted");
    }).catch((error) => {
      this.snackbarService.showFailureSnackbar("Error Deleting Liability");
    });
  }

  onReset(): void {
    // Reset the edit variables
    this.editId = null;
    this.editMode = false;
    this.newLiabilityForm.reset();
  }

}
