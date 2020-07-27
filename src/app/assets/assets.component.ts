import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import {MatSort} from '@angular/material/sort';

import { Asset } from './asset.model';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.css']
})
export class AssetsComponent implements OnInit {
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  displayedColumns: string[] = ['category', 'name', 'value', 'note'];
  dataSource: MatTableDataSource<Asset>;
  categories: string[] = ['Savings', 'Checking', 'CD', '401k', 'HSA', 'Other'];
  assets: Asset[] = [
    new Asset("Emergency Fund", 15000.00, "Savings", "3 months of expenses"),
    new Asset("Taxes & Insurance", 400.62, "Savings", "Updated in July")
  ];

  newAssetForm = new FormGroup({
    name: new FormControl('', Validators.required),
    value: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
    note: new FormControl('')
  });

  constructor() { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.assets);
    this.dataSource.sort = this.sort;
  }

  getError(control: string) {
    return this.newAssetForm.get(control).hasError('required') ? 'Please enter a value' : '';
  }

  submitForm() {
    const newAsset: Asset = this.newAssetForm.value;
    this.assets.push(newAsset);
    // Update the table to include the new asset
    this.dataSource = new MatTableDataSource(this.assets);
  }

  getTotalValue() {
    return this.assets.map(t => t.value).reduce((acc, value) => acc + value, 0);
  }
}
