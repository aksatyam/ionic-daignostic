import { Component } from '@angular/core';
import { AlertController, NavController, Platform } from 'ionic-angular';

import { Camera, CameraOptions } from '@ionic-native/camera';
import { Contacts, Contact, ContactAddress, ContactField, ContactName } from '@ionic-native/contacts';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Geolocation } from '@ionic-native/geolocation';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  public isCameraEnabled: boolean = false;
  public isWifiEnabled: boolean = false;
  public isContactsEnabled: boolean = false;
  public isLocationEnabled: boolean = false;
  public latitude: any;
  public longitude: any;
  public isImageTaken: any = '';
  constructor(public navCtrl: NavController,
    private _ALERT: AlertController,
    private _CONTACTS: Contacts,
    private _DIAGNOSTIC: Diagnostic,
    private _GEO: Geolocation,
    private _CAMERA: Camera,
    private _IAP: InAppBrowser,
    private _PLATFORM: Platform) {
    this._PLATFORM.ready()
      .then(() => {
        this.isCameraAvailable();
        this.isLocationAvailable();
        this.isWifiAvailable();
        this.isContactsAuthorized();
      });
  }

  isCameraAvailable() {
    this._DIAGNOSTIC.isCameraPresent()
      .then((isAvailable: any) => {
        this.isCameraEnabled = true;
      })
      .catch((error: any) => {
        console.dir('Camera is:' + error);
      });
  }

  isLocationAvailable() {
    this._DIAGNOSTIC.isLocationAvailable()
      .then((isAvailable) => {

        this._GEO.getCurrentPosition()
          .then(({ coords }) => {
            const { latitude, longitude } = coords;
            this.isLocationEnabled = true;
            this.latitude = latitude;
            this.longitude = longitude;

          })
          .catch((error: any) => {
            console.log('Error getting location', error);
          });
      })
      .catch((error: any) => {
        console.dir('Location is:' + error);
      });
  }

  isWifiAvailable() {
    this._DIAGNOSTIC.isWifiAvailable()
      .then((isAvailable: any) => {
        this.isWifiEnabled = true;
      })
      .catch((error: any) => {
        console.dir('Wifi is:' + error);
      });
  }


  isContactsAuthorized() {
    this._DIAGNOSTIC.isContactsAuthorized()
      .then((isAuthorised: any) => {
        this.isContactsEnabled = true;
      })
      .catch((error: any) => {
        console.dir('Contacts is:' + error);
      });
  }

  openLink(link) {
    let target: string = '_blank',
      opts: string = 'clearcache=yes,clearsessioncache=yes,toolbar=yes,location=yes';

    this._IAP.create(link, target, opts);
  }

  selectPictureFromPhotoLibrary() {
    let options: CameraOptions = {
      quality: 100,
      destinationType: this._CAMERA.DestinationType.DATA_URL,
      encodingType: this._CAMERA.EncodingType.JPEG,
      saveToPhotoAlbum: true,
      sourceType: 0
    }

    this._CAMERA.getPicture(options)
      .then((data: any) => {
        this.isImageTaken = 'data:image/jpeg;base64,' + data;
      })
      .catch((err: any) => {
        console.dir(err);
      });
  }

  saveContact(obj) {
    let contact: Contact = this._CONTACTS.create();
    contact.name = new ContactName(null, obj.surname, obj.firstname);
    contact.nickname = obj.nickname;
    contact.addresses = [new ContactAddress(true, null, null, obj.address, null, null, null, null)];
    contact.phoneNumbers = [new ContactField('mobile', obj.mobile)];
    contact.emails = [new ContactField('email', obj.email)];
    contact.photos = [new ContactField('profile', this.isImageTaken)];


    contact.save()
      .then((data: any) => {
        let alert = this._ALERT.create({
          title: 'Congratulations',
          subTitle: `The contact - ${obj.firstname} ${obj.surname} - was successfully added to your Address book`,
          buttons: ['Cool!']
        });
        alert.present();
      })
      .catch((error: any) => {
        console.error('Error saving contact.', error);
      });
  }
}
