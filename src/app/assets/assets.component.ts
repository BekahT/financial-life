import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { AngularFireDatabase } from '@angular/fire/database';

import { Asset } from './asset.model';
import { Subscription } from 'rxjs';

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
  assets: Asset[] = [];

  assetSubscription: Subscription;

  newAssetForm = new FormGroup({
    name: new FormControl('', Validators.required),
    value: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
    note: new FormControl('')
  });

  constructor(private fireDatabase: AngularFireDatabase) { }

  ngOnInit(): void {
    this.assetSubscription = this.fireDatabase.list("assets").valueChanges().subscribe((res) => {
      this.assets = res as Asset[];
      this.dataSource = new MatTableDataSource(this.assets);
      this.dataSource.sort = this.sort;
    });
  }

  ngOnDestroy(): void {
    this.assetSubscription.unsubscribe();
  }

  getError(control: string) {
    return this.newAssetForm.get(control).hasError('required') ? 'Please enter a value' : '';
  }

  submitForm() {
    const newAsset: Asset = this.newAssetForm.value;
    const assetsRef = this.fireDatabase.list('assets');
    assetsRef.push(newAsset);
    this.newAssetForm.reset();
  }

  getTotalValue() {
    return this.assets.map(t => t.value).reduce((acc, value) => acc + value, 0);
  }
}
