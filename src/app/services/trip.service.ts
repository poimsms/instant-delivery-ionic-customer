import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class TripService {

  service: any;

  rate$ =  new BehaviorSubject({ok: false});
  gps$ =  new BehaviorSubject({ok: false});
  rider$ =  new BehaviorSubject({ok: false});
  coupon$ =  new BehaviorSubject({ok: false});


  constructor() {
    this.service = new google.maps.DistanceMatrixService();
   }

   getDistanceAndTime(origin, destination) {

    const coors1 = new google.maps.LatLng(origin.lat, origin.lng);
    const coors2 = new google.maps.LatLng(destination.lat, destination.lng);

     return new Promise((resolve, reject) => {
      this.service.getDistanceMatrix(
        {
          origins: [coors1],
          destinations: [coors2],
          travelMode: 'DRIVING',
        }, (response, status) => {

          const distance = response.rows[0].elements[0].distance.value;
          const seconds = response.rows[0].elements[0].duration.value;

          const data = {
            distance: distance,
            times: {
              bike: Math.round(distance / (13 * 1000) * 60),
              motorbike: Math.round(seconds / 60 / 1.15),
              car: Math.round(seconds / 60 / 1.15)
            }
          }
          
          resolve(data)
        })
     })
   }

   getPrices(distance) {

   }

   applyCoupon(prices, coupon) {

  }

  loadTrip() {

  }

  loadRider() {

  }

  loadCoupon() {

  }

  loadRate() {

  }

  rate() {
    return this.rate$;
  }

  rider() {
    return this.rider$;
  }

  coupon() {
    return this.coupon$;
  }

  gps() {
    return this.rate$;
  }

  cancelTrip(body) {

  }
}
