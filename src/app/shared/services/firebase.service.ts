import { Injectable } from '@angular/core';
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

}
