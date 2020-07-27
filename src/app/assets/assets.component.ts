import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Asset } from './asset.model';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.css']
})
export class AssetsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'value', 'note'];
  assets: Asset[] = [
    new Asset("Emergency Fund", 30000.00, "6 months of expenses"),
    new Asset("Taxes & Insurance", 400.62, "Updated in July")
  ];

  newAssetForm = new FormGroup({
    name: new FormControl('', Validators.required),
    value: new FormControl('', Validators.required),
    note: new FormControl('')
  });

  constructor() { }

  ngOnInit(): void {
  }

  submitForm() {
    console.log(this.newAssetForm.value);
    const newAsset: Asset = this.newAssetForm.value;
    this.assets.push(newAsset);

    console.log(this.assets);
  }

  getTotalValue() {
    return this.assets.map(t => t.value).reduce((acc, value) => acc + value, 0);
  }
}
