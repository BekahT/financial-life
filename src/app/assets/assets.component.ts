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

  displayedColumns: string[] = ['category', 'name', 'value', 'note', 'actions'];
  dataSource: MatTableDataSource<Asset>;
  categories: string[] = ['Savings', 'Checking', 'CD', '401k', 'HSA', 'Other'];
  assets: Asset[] = [];
  editMode: Boolean = false;
  editId: string;

  assetSubscription: Subscription;

  newAssetForm = new FormGroup({
    name: new FormControl('', Validators.required),
    value: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
    note: new FormControl('')
  });

  constructor(private fireDatabase: AngularFireDatabase) { }

  ngOnInit(): void {
    this.assetSubscription = this.fireDatabase.list("assets").snapshotChanges().subscribe((res) => {
      this.assets = []; // clear the old asset array
      res.forEach((asset) => {
        let newAsset = asset.payload.val() as Asset;
        newAsset.id = asset.key;
        this.assets.push(newAsset);
      });
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
    const asset: Asset = this.newAssetForm.value;
    const assetsRef = this.fireDatabase.list('assets');
    // Firebase doesn't take null/undefined, so set empty notes to empty string
    if (asset.note === undefined) {
      asset.note = "";
    }

    if (this.editMode === false) {
      assetsRef.push(asset);
    } else if (this.editMode === true) {
      assetsRef.set(this.editId, asset);
      // Reset the edit variables
      this.editId = null;
      this.editMode = false;
    }
    this.newAssetForm.reset();
  }

  getTotalValue() {
    return this.assets.map(t => t.value).reduce((acc, value) => acc + value, 0);
  }

  onEdit(id: string, asset: Asset) {
    // Set edit variables
    this.editMode = true;
    this.editId = id;
    // Fill in the form with asset to edit
    this.newAssetForm.patchValue({
      name: asset.name,
      value: asset.value,
      category: asset.category,
      note: asset.note
    });
  }

  onDelete(id: string) {
    this.fireDatabase.list('assets').remove(id);
  }

  onReset() {
    // Reset the edit variables
    this.editId = null;
    this.editMode = false;
    this.newAssetForm.reset();
  }
}