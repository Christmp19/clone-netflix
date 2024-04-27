import React, { useEffect, useState } from 'react';
import './PlansSreen.css';
import db from '../firebase';
import { selectUser } from '../features/userSlice';
import { useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';

function PlansSreen() {
    const [products, setProducts] = useState([]);
    const user = useSelector(selectUser);
    const [subscription, setSubscription] = useState(null);

    useEffect(() => {
        db.collection('customers')
            .doc(user.uid)
            .collection('subscriptions')
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(async subscription => {
                    setSubscription({
                        role: subscription.data().role,
                        current_period_end: subscription.data().current_period_end.seconds,
                        current_period_start: subscription.data().current_period_start.seconds,
                    })
                })
            })
    }, [user.uid]);

    useEffect(() => {
        db.collection('products')
            .where('active', '==', true)
            .get()
            .then(querySnapshot => {
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
    console.log(subscription);

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
            <br />
            {subscription && (<p>
                Renewal date:{' '}
                {new Date(
                    subscription?.current_period_end * 1000
                ).toLocaleDateString()}
            </p>)}
            {Object.entries(products).map(([productId, productData]) => {
                // TODO: add some logic to check if user's subscription is active...
                const isCurrentPackage = productData.name
                        ?.toLowerCase()
                    .includes(subscription?.role);
                console.log("Is Current Package:", isCurrentPackage);

                return (
                    <div key={productId} className={`${isCurrentPackage && 'plansSreen_plan_disabled'} plansSreen_plan`}>
                        <div className='plansSreen_info'>
                            <h5>{productData.name}</h5>
                            <h6>{productData.description}</h6>
                        </div>
                        <button onClick={() =>
                            !isCurrentPackage && loadCheckout(productData.prices.priceId)}>
                            {isCurrentPackage ? 'Current Package' : 'Subscribe'}
                        </button>
                    </div>
                );
            })}

        </div>
    )
}

export default PlansSreen