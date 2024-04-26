import React, { useEffect, useState } from 'react';
import './PlansSreen.css';
import db from '../firebase';
import { selectUser } from '../features/userSlice';
import { useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';


function PlansSreen() {
    const [products, setProducts] = useState([]);
    const user = useSelector(selectUser);

    useEffect(() => {
        db.collection('products').where('active', '==', true)
            .get().then(querySnapshot => {
                const products = {};
                querySnapshot.forEach(async (productDoc) => {
                    products[productDoc.id] = productDoc.data();
                    const priceSnap = await productDoc.ref.collection('prices').get();
                    priceSnap.docs.forEach(price => {
                        products[productDoc.id].prices = {
                            priceId: price.id,
                            priceData: price.data()
                        }
                    })
                });
                setProducts(products);
            });
    }, []);

    console.log(products);

    const loadCheckout = async (priceId) => {
        const docRef = await db
            .collection('customers')
            .doc(user.uid)
            .collection('checkout_sessions')
            .add({
                price: priceId,
                success_url: window.location.origin,
                cancel_url: window.location.origin,
            });

        docRef.onSnapshot(async (snap) => {
            const { error, sessionId } = snap.data();

            if (error) {
                // Show an error to your customer and
                // inspect your cloud function logs in the firebase console.
                alert(`An error occured: ${error.message}`);
            }

            if (sessionId) {
                // We have a sessions, let's rerirect to Checkout
                // Init Stripe
                const stripe = await loadStripe('pk_test_51P9TBC00eGP3dNCUstPZR8J0rhustmY23Thqt0pdr3AxlLPcgmFhCQbbiEokoRDSDBVBaWNA8cQDwI43ENJ32UnJ00OqP4rudm');
                stripe.redirectToCheckout({ sessionId });
            }

        })
    };

    return (
        <div className='plansSreen'>
            {Object.entries(products).map(([productId, productData]) => {
                // TODO: add some logic to check if user's subscription is active...
                return (
                    <div className='plansSreen_plan'>
                        <div className='plansSreen_info'>
                            <h5>{productData.name}</h5>
                            <h6>{productData.description}</h6>
                        </div>
                        <button onClick={() => loadCheckout(productData.prices.priceId)}>
                            Subscribe
                        </button>
                    </div>
                );
            })}

        </div>
    )
}

export default PlansSreen