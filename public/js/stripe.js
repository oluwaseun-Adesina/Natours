import axios from 'axios'; 
const stripe = Stripe('pk_test_51LZcjOBDMUzBnKQ1WHHzelUaRmKL7ScR0Ptm83XJT3cnEEuLs5Hr23XWhe9DZpzemdQxkeoMnanUymYke9y0dPHo00ecmiJlpQ');
import { showAlert } from './alerts';

export const bookTour = async tourId => {
    try {
        // 1) Get checkout session from API
        const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);

        // 2) Create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch (err) {
        console.log(err);
        showAlert('error', err.message);
    }
}
