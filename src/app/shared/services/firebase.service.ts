import { Injectable } from '@angular/core';
import { CollectionReference } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import 'firebase/firestore';

@Injectable({providedIn: 'root'})
export class FirebaseService {
  db: firebase.default.firestore.Firestore;

  constructor() {
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

  getLiabilitiesRef(): CollectionReference {
    return this.db.collection('liabilities');
  }

  getHistoricalLiabilitiesRef(id: string): CollectionReference {
    return this.db.collection('liabilities').doc(id).collection('historical');
  }

  getGoalsRef(): CollectionReference {
    return this.db.collection('goals');
  }

}
