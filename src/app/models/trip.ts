export default interface Trip {
    status: String;
    showOptions: Boolean;
    origin: Object;
    destination: Object;
    prices: Object;
    times: Object;
    step: Number;
    distance: Number;
    time: String;
    price: Number;
    vehicle: String;
    payment_method: String;
    rider: Object;
    coupon: Object;
}