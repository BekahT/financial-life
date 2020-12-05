import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { FirebaseService } from '../shared/services/firebase.service';

import { Asset } from './asset.model';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.css']
})
export class AssetsComponent implements OnInit {
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  displayedColumns: string[] = ['category', 'name', 'value', 'note', 'lastModified', 'actions'];
  dataSource: MatTableDataSource<Asset>;
  categories: string[] = ['Savings', 'Checking', 'CD', '401k', 'HSA', 'Other'];
  assets: Asset[] = [];
  editMode: Boolean = false;
  editId: string;

  assetsRef = this.dbs.db.collection('assets');

  newAssetForm = new FormGroup({
    name: new FormControl('', Validators.required),
    value: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
    note: new FormControl('')
  });

  constructor(private dbs: FirebaseService) { }

  ngOnInit(): void {
    this.assetsRef.onSnapshot((res) => {
      this.assets = []; // clear the old asset array
      res.forEach((asset) => {
        let newAsset = asset.data() as Asset;
        newAsset.id = asset.id;
        this.assets.push(newAsset);
      });
      this.dataSource = new MatTableDataSource(this.assets);
      this.dataSource.sort = this.sort;
    });
  }

  getError(control: string) {
    return this.newAssetForm.get(control).hasError('required') ? 'Please enter a value' : '';
  }

  submitForm() {
    const asset: Asset = this.newAssetForm.value;
    // Firebase doesn't take null/undefined, so set empty notes to empty string
    if (asset.note === undefined || null) {
      asset.note = "";
    }

    // Always update the modified date
    asset.lastModified = new Date().getTime();

    // Add or update the asset based on editMode or not
    if (this.editMode === false) {
      this.assetsRef.add(asset);
    } else if (this.editMode === true) {
      this.assetsRef.doc(this.editId).set(asset);
      // Reset the edit variables
      this.editId = null;
      this.editMode = false;
    }
    this.newAssetForm.reset();
  }

  getTotalValue() {
    return this.assets.map(t => t.value).reduce((acc, value) => acc + value, 0);
  }

  onEdit(asset: Asset) {
    // Set edit variables
    this.editMode = true;
    this.editId = asset.id;
    // Fill in the form with asset to edit
    this.newAssetForm.patchValue({
      name: asset.name,
      value: asset.value,
      category: asset.category,
      note: asset.note
    });
  }

  onDelete(id: string) {
    this.assetsRef.doc(id).delete();
  }

  onReset() {
    // Reset the edit variables
    this.editId = null;
    this.editMode = false;
    this.newAssetForm.reset();
  }
}
