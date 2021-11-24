import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import PouchDB from 'pouchdb';

@Injectable({
  providedIn: 'root'
})
export class PouchdbService {

  protected db: PouchDB;
  private DB_NAME = "name-gen";

  constructor(private http: HttpClient) {
    let isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    this.db = (isiOS) ? new PouchDB(this.DB_NAME, {
        adapter: 'fruitdown'
    }) : new PouchDB(this.DB_NAME);
  }

  loadDefaultDictionaries(): Boolean {
    var that = this;
    this.http.get('assets/data/name-gen.json').toPromise().then(function(result: any) {
      var i;
      for (i = 0; i < result.length; i += 1) {
        result[i].creationDate = new Date().getTime();
      }

      that.db.bulkDocs(result).then(function(result) {
        that.db.allDocs({
          include_docs: true
        }).then(function (response) {
            return response;
        });
      });
    })
    .catch(function (err) {
      return err;
    });

    return false;
  }

  getDictionaries(): Boolean {
    this.db.allDocs({
      include_docs: true
    }).then(function (result) {
      //add default presets on first load
      if (result.total_rows === 0) {
        this.loadDefaultDictionaries().then(function (response) {
          return response;
        });
      } else {
        return result;
      }

    }).catch(function (err) {
      return err;
    });

    return false;
  }

  saveDictionary(id, title, values): Boolean {
    if (typeof id === 'undefined') {
      this.db.post({
        title: title,
        values: values,
        creationDate: new Date().getTime()

      }).then(function (response) {
        return response;

      }).catch(function (err) {
        return err;
      });

    } else {
      this.db.get(id).then(function (doc) {
        return this.db.put({
          _id: id,
          _rev: doc._rev,
          title: title,
          values: values,
          creationDate: doc.creationDate
        });
      }).then(function (response) {
        return response;

      }).catch(function (err) {
        return err;
      });
    }

    return false;
  }

  renameDictionary(id, newTitle): Boolean {
    this.db.get(id).then(function (doc) {
      return this.db.put({
        _id: id,
        _rev: doc._rev,
        title: newTitle,
        values: doc.values,
        creationDate: doc.creationDate
      });
    }).then(function (response) {
      return response;

    }).catch(function (err) {
      return err;
    });

    return false;
  }

  removeDictionary(id): Boolean {
    this.db.get(id).then(function (doc) {
      return (this.db.remove(doc));

    }).catch(function (err) {
      return err;
    });

    return false;
  }

  insertDictionaries(dictionaries): Boolean {
    for (let i = 0; i < dictionaries.length; i += 1) {
      dictionaries[i].creationDate = new Date().getTime();
    }

    this.db.bulkDocs(dictionaries).then(function (result) {
      this.db.allDocs({
        include_docs: true
      }).then(function (response) {
        return response;
      });

    }).catch(function (err) {
      return err;
    });

    return false;
  }

  reset(): Boolean {
    this.db.destroy().then(function () {
      this.db = (this.isiOS) ? new PouchDB(this.DB_NAME, {
        adapter: 'fruitdown'
      }) : new PouchDB(this.DB_NAME);
      this.loadDefaultDictionaries().then(function (response) {
        return response;
      });
    }).catch(function (err) {
      return err;
    });

    return false;
  }
}
