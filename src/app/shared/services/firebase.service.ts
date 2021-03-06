import { Injectable } from '@angular/core';
import { CollectionReference } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import 'firebase/firestore';

import { SnackbarServiceService } from './snackbar-service.service';

import { Asset } from 'src/app/assets/asset.model';
import { Liability } from 'src/app/liabilities/liability.model';
import { Goal } from 'src/app/goals/goal.model';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  db: firebase.default.firestore.Firestore;

  constructor(private snackbarService: SnackbarServiceService) {
    this.db = this.getDB();
  }

  getDB(): firebase.default.firestore.Firestore {
    return firebase.default.firestore();
  }

  getAssetsRef(): CollectionReference {
    return this.db.collection('assets');
  }

  getHistoricalAssetsRef(id: string): CollectionReference {
    return this.db.collection('assets').doc(id).collection('historical');
  }

  addAsset(asset: Asset): void {
    let id: string;
    // Add the asset, then get the id back
    this.getAssetsRef().add(asset).then(docRef => {
      id = docRef.id;
      // add a copy to the historical asset information
      this.getHistoricalAssetsRef(id).add(asset);
      this.snackbarService.showSuccessSnackbar('Asset Successfully Created');
    }).catch(() => {
      this.snackbarService.showFailureSnackbar('Error Creating Asset');
    });
  }

  updateAsset(asset: Asset, id: string): void {
    // update the current asset information
    this.getAssetsRef().doc(id).set(asset).then(() => {
      this.snackbarService.showSuccessSnackbar('Asset Successfully Updated');
    }).catch(() => {
      this.snackbarService.showFailureSnackbar('Error Updating Asset');
    });
    // add a copy to the historical asset information
    this.getHistoricalAssetsRef(id).add(asset).catch(() => {
      this.snackbarService.showFailureSnackbar('Error Updating Asset History');
    });
  }

  deleteAsset(id: string): void {
    // Delete any associated goals
    this.getGoalsRef().where('assetId', '==', id).get().then(res => {
      res.forEach(goal => {
        this.getGoalsRef().doc(goal.id).delete();
      });
    }).catch(() => {
      this.snackbarService.showFailureSnackbar('Error Deleting Linked Goal(s)');
    });
    // Get all historical entries and delete them
    this.getHistoricalAssetsRef(id).get().then(res => {
      res.forEach(entry => {
        this.getHistoricalAssetsRef(id).doc(entry.id).delete();
      });
    }).catch(() => {
      this.snackbarService.showFailureSnackbar('Error Deleting Asset History');
    });
    // Delete the asset itself
    this.getAssetsRef().doc(id).delete().then(() => {
      this.snackbarService.showSuccessSnackbar('Asset Successfully Deleted');
    }).catch(() => {
      this.snackbarService.showFailureSnackbar('Error Deleting Asset');
    });
  }

  getLiabilitiesRef(): CollectionReference {
    return this.db.collection('liabilities');
  }

  getHistoricalLiabilitiesRef(id: string): CollectionReference {
    return this.db.collection('liabilities').doc(id).collection('historical');
  }

  addLiability(liability: Liability): void {
    let id: string;
    this.getLiabilitiesRef().add(liability).then(docRef => {
      id = docRef.id;
      // add a copy to the historical liability information
      this.getHistoricalLiabilitiesRef(id).add(liability);
      this.snackbarService.showSuccessSnackbar('Liability Successfully Created');
    }).catch(() => {
      this.snackbarService.showFailureSnackbar('Error Creating Liability');
    });
  }

  updateLiability(liability: Liability, id: string): void {
    // update the current asset information
    this.getLiabilitiesRef().doc(id).set(liability).then(() => {
      this.snackbarService.showSuccessSnackbar('Liability Successfully Updated');
    }).catch(() => {
      this.snackbarService.showFailureSnackbar('Error Updating Liability');
    });
    // add a copy to the historical liability information
    this.getHistoricalLiabilitiesRef(id).add(liability).catch(() => {
      this.snackbarService.showFailureSnackbar('Error Updating Liability History');
    });
  }

  deleteLiability(id: string): void {
    // Delete any associated goals
    this.getGoalsRef().where('liabilityId', '==', id).get().then(res => {
      res.forEach(goal => {
        this.getGoalsRef().doc(goal.id).delete();
      });
    }).catch(() => {
      this.snackbarService.showFailureSnackbar('Error Deleting Linked Goal(s)');
    });
    // Get all historical entries and delete them
    this.getHistoricalLiabilitiesRef(id).get().then(res => {
      res.forEach(entry => {
        this.getHistoricalLiabilitiesRef(id).doc(entry.id).delete();
      });
    }).catch(() => {
      this.snackbarService.showFailureSnackbar('Error Deleting Liability History');
    });
    // Delete the liability itself
    this.getLiabilitiesRef().doc(id).delete().then(() => {
      this.snackbarService.showSuccessSnackbar('Liability Successfully Deleted');
    }).catch(() => {
      this.snackbarService.showFailureSnackbar('Error Deleting Liability');
    });
  }

  getGoalsRef(): CollectionReference {
    return this.db.collection('goals');
  }

  addGoal(goal: Goal): void {
    this.getGoalsRef().add(goal).then(() => {
      this.snackbarService.showSuccessSnackbar('Goal Successfully Created');
    }).catch(() => {
      this.snackbarService.showFailureSnackbar('Error Creating Goal');
    });
  }

  updateGoal(goal: Goal, id: string): void {
    this.getGoalsRef().doc(id).set(goal).then(() => {
      this.snackbarService.showSuccessSnackbar('Goal Successfully Updated');
    }).catch(() => {
      this.snackbarService.showFailureSnackbar('Error Updating Goal');
    });
  }

  deleteGoal(id: string): void {
    this.getGoalsRef().doc(id).delete().then(() => {
      this.snackbarService.showSuccessSnackbar('Goal Successfully Deleted');
    }).catch(() => {
      this.snackbarService.showFailureSnackbar('Error Deleting Goal');
    });
  }
}
