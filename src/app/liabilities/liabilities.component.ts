import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

import { Liability } from './liability.model';

@Component({
  selector: 'app-liabilities',
  templateUrl: './liabilities.component.html',
  styleUrls: ['./liabilities.component.css']
})
export class LiabilitiesComponent implements OnInit {
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  displayedColumns: string[] = ['category', 'name', 'balance', 'dueDate', 'note'];
  dataSource: MatTableDataSource<Liability>;
  categories: string[] = ['Mortgage', 'Auto Loan', 'Student Loan', 'Credit Card', 'Other'];
  Liabilities: Liability[] = [
    new Liability("Townhouse", 250000.00, "Mortgage", new Date("11/15/2027")),
    new Liability("My Car", 5700.00, "Auto Loan", new Date("10/02/2022")),
    new Liability("Software Degree", 5400.74, "Student Loan")
  ];

  newLiabilityForm = new FormGroup({
    name: new FormControl('', Validators.required),
    balance: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
    dueDate: new FormControl(''),
    note: new FormControl('')
  });

  constructor() { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.Liabilities);
    this.dataSource.sort = this.sort;
  }

  getError(control: string) {
    return this.newLiabilityForm.get(control).hasError('required') ? 'Please enter a value' : '';
  }

  submitForm() {
    const newLiability: Liability = this.newLiabilityForm.value;
    this.Liabilities.push(newLiability);
    this.newLiabilityForm.reset();

    // Update the table to include the new Liability
    this.dataSource = new MatTableDataSource(this.Liabilities);
    this.dataSource.sort = this.sort;
  }

  getTotalBalance() {
    return this.Liabilities.map(t => t.balance).reduce((acc, balance) => acc + balance, 0);
  }

}
