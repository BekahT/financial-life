import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

import { FirebaseService } from '../shared/services/firebase.service';
import { SnackbarServiceService } from '../shared/services/snackbar-service.service';

import { Asset } from './asset.model';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.css']
})
export class AssetsComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = ['category', 'name', 'value', 'note', 'lastModified', 'actions'];
  dataSource: MatTableDataSource<Asset>;
  categories: string[] = ['Savings', 'Checking', 'CD', '401k', 'HSA', 'Other'];
  assets: Asset[] = [];
  editMode: Boolean = false;
  editId: string;
  isLoading: Boolean = false;

  assetsRef = this.dbs.getAssetsRef();

  newAssetForm = new FormGroup({
    name: new FormControl('', Validators.required),
    value: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
    note: new FormControl('')
  });

  constructor(private dbs: FirebaseService, private snackbarService: SnackbarServiceService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.assetsRef.orderBy("category").orderBy("name").onSnapshot((res) => {
      this.assets = []; // clear the old asset array
      res.forEach((asset) => {
        let newAsset = asset.data() as Asset;
        newAsset.id = asset.id;
        this.assets.push(newAsset);
      });
      this.dataSource = new MatTableDataSource(this.assets);
      this.dataSource.sort = this.sort;
      this.isLoading = false;
    }, (error) => {
      this.snackbarService.showFailureSnackbar("Error Fetching Assets");
      this.isLoading = false;
    });
  }

  getError(control: string): string {
    return this.newAssetForm.get(control).hasError('required') ? 'Please enter a value' : '';
  }

  submitForm(): void {
    let asset: Asset = this.newAssetForm.value;
    // Firebase doesn't take null/undefined, so set empty notes to empty string
    if (asset.note === undefined || null) {
      asset.note = "";
    }

    // Always update the modified date
    asset.lastModified = new Date().getTime();

    // Add or update the asset based on editMode or not
    if (this.editMode === false) {
      this.dbs.addAsset(asset);
    } else if (this.editMode === true) {
      this.dbs.updateAsset(asset, this.editId);

      // Reset the edit variables
      this.editId = null;
      this.editMode = false;
    }
    this.newAssetForm.reset();
  }

  getTotalValue(): number {
    return this.assets.map(t => t.value).reduce((acc, value) => acc + value, 0);
  }

  onEdit(asset: Asset): void {
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

  onDelete(id: string): void {
    this.dbs.deleteAsset(id);
  }

  onReset(): void {
    // Reset the edit variables
    this.editId = null;
    this.editMode = false;
    this.newAssetForm.reset();
  }
}
