import React, { useEffect, useState } from 'react';
import './PlansSreen.css';
import db from '../firebase';

function PlansSreen() {
    const [products, setProducts] = useState([]);

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
                        <button>Subscribe</button>
                    </div> 
                );
            })}

        </div>
    )
}

export default PlansSreen