const initModel = {
  status: this.STATUS.NOT_STARTED,
  showOptions: false,
  origin: {
    address: '',
    lat: 0,
    lng: 0
  },
  destination: {
    address: '',
    lat: 0,
    lng: 0
  },
  prices: {
    motorbike: 0,
    bike: 0,
    car: 0
  },
  times: {
    motorbike: 0,
    bike: 0,
    car: 0
  },
  step: 0,
  time: 0,
  distance: 0,
  vehicle: '',
  price: 0,
  payment_method: '',
  rider: null,
  coupon: null
};

export default initModel;