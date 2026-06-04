// 'use client';

// import { useState, useCallback, useEffect } from 'react';
// import Link from 'next/link';
// import { useCart, GIFT_CHARGE } from '@/lib/cartContext';
// import { useAuth } from '@/lib/authContext';
// import ExitIntent from '@/components/cart/ExitIntent';
// import UpperNav from '@/components/ui/UpperNav';
// import { apiRequest } from '@/lib/api';

// const PAYMENT_METHODS = [
//   { id: 'ONLINE', label: 'Pay Online in Full', sub: 'UPI, Credit/Debit Cards, NetBanking, Wallets via Razorpay', badge: 'Recommended' },
//   { id: 'PARTIAL_COD', label: 'Partial COD', sub: 'Pay a portion now, balance on delivery', badge: null },
//   { id: 'COD', label: 'Cash on Delivery', sub: 'Pay when your order arrives', badge: null },
// ];

// export default function CheckoutPage() {
//   const {
//     state, savings, shipping, total,
//     itemCount, toggleGift, clearCart
//   } = useCart();

//   const { items, isGift, discountCode, discountAmount } = state;

//   const [selectedMethod, setSelectedMethod] = useState('ONLINE');
//   const [partialPercentage, setPartialPercentage] = useState<25 | 50>(25);
//   const [loading, setLoading] = useState(false);
//   const [orderPlaced, setOrderPlaced] = useState(false);

//   const { user, refreshUser } = useAuth();
//   const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
//   const [showAddressForm, setShowAddressForm] = useState(false);
//   const [addressForm, setAddressForm] = useState({
//     fullAddress: '',
//     city: '',
//     state: '',
//     pincode: ''
//   });
//   const [addressBusy, setAddressBusy] = useState(false);

//   const [deliveryType, setDeliveryType] = useState<'standard' | 'express'>('standard');
//   const DELIVERY_OPTIONS = [
//     { id: 'standard', icon: '🚚', label: 'Standard', eta: '5–7 business days', price: 0, priceLabel: 'Free' },
//     { id: 'express', icon: '⚡', label: 'Express', eta: '1–2 business days', price: 149, priceLabel: '+₹149' },
//   ] as const;

//   // Gift (card-style, mirroring CartPage)
//   const CHECKOUT_GIFT_OPTIONS = [
//     { id: 'classic', title: 'Classic Gift Wrap', sub: 'Kraft paper & satin ribbon', price: 25, image: '/smallerBox.png' },
//     { id: 'luxury', title: 'Luxury Gift Hamper', sub: 'Ideal for 4+ products', price: 250, image: '/Biggerbox.jpg' },
//   ];
//   const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
//   const [checkoutGiftMsg, setCheckoutGiftMsg] = useState('');
//   const activeCheckoutGift = CHECKOUT_GIFT_OPTIONS.find(g => g.id === selectedGiftId) ?? null;
//   const giftCharge = activeCheckoutGift?.price ?? 0;
//   const deliveryCharge = deliveryType === 'express' ? 149 : 0;

//     const finalTotal = total + deliveryCharge + giftCharge;
//   let amountToPayNow = finalTotal;
//   if (selectedMethod === 'PARTIAL_COD') {
//     amountToPayNow = Math.round(finalTotal * (partialPercentage / 100));
//   } else if (selectedMethod === 'COD') {
//     amountToPayNow = 0;
//   }
//   // Load Razorpay script dynamically
//   useEffect(() => {
//     const script = document.createElement("script");
//     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//     script.async = true;
//     document.body.appendChild(script);
//     return () => { document.body.removeChild(script); };
//   }, []);

//   const handleSaveAddress = async () => {
//     if (!addressForm.fullAddress || !addressForm.city || !addressForm.state || !addressForm.pincode) {
//       alert("Please fill all address fields.");
//       return;
//     }
//     setAddressBusy(true);
//     try {
//       const addresses = [...(user?.addresses || []), addressForm];
//       await apiRequest('/users/profile', {
//         method: 'PUT',
//         body: JSON.stringify({ addresses })
//       });
//       await refreshUser();
//       setShowAddressForm(false);
//       setSelectedAddressIndex(addresses.length - 1);
//       setAddressForm({ fullAddress: '', city: '', state: '', pincode: '' });
//     } catch (err) {
//       console.error(err);
//       alert("Failed to save address.");
//     } finally {
//       setAddressBusy(false);
//     }
//   };

//   const handlePay = useCallback(async () => {
//     if (!selectedMethod) return;

//     let currentAddress = null;
//     if (user?.addresses && user.addresses.length > 0) {
//       currentAddress = user.addresses[selectedAddressIndex];
//     }

//     if (!currentAddress) {
//       alert("Please add a shipping address.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const orderPayload = {
//         amount: amountToPayNow,
//         totalAmount: finalTotal,
//         advanceAmount: amountToPayNow,
//         balanceAmount: Math.max(finalTotal - amountToPayNow, 0),
//         paymentMode: selectedMethod,
//         items: items.map(item => {
//           // Check if item.id is a valid 24-char hex string
//           const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(item.id);
//           const mappedProduct = (!item.id.startsWith('custom-') && isValidObjectId) ? item.id : undefined;

//           return {
//             product: mappedProduct,
//             name: item.name,
//             quantity: item.qty,
//             price: item.price,
//             customNote: item.customNote,
//             customImages: item.customImages,
//             selectedCharms: item.selectedCharms?.map((c: { id?: string; _id?: string } | string) => {
//               if (typeof c === 'string') return c;
//               return c.id || c._id || c;
//             }),
//           };
//         }),
//         shippingAddress: currentAddress,
//         isGift: isGift,
//         giftMessage: state.giftMessage,
//       };

//       if (selectedMethod === 'ONLINE' || selectedMethod === 'PARTIAL_COD') {
//         // Online Payment via Razorpay
//         const rzpOrder = await apiRequest<{ success: boolean, orderId: string, razorpayOrderId: string, amount: number, currency: string }>('/payment/create-order', {
//           method: 'POST',
//           body: JSON.stringify(orderPayload)
//         });

//         const options = {
//           key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_RmCmc4bECn3PRU", // Fallback if env is missing
//           amount: rzpOrder.amount * 100,
//           currency: rzpOrder.currency,
//           name: "MakeUsSparkle",
//           description: "Order Payment",
//           order_id: rzpOrder.razorpayOrderId,
//           handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
//             try {
//               setLoading(true);
//               await apiRequest('/payment/verify', {
//                 method: 'POST',
//                 body: JSON.stringify({
//                   orderId: rzpOrder.orderId,
//                   razorpayOrderId: response.razorpay_order_id,
//                   paymentId: response.razorpay_payment_id,
//                   signature: response.razorpay_signature,
//                   paymentMode: selectedMethod,
//                 })
//               });
//               clearCart();
//               setOrderPlaced(true);
//             } catch (err) {
//               console.error("Verification failed:", err);
//               alert("Payment verification failed. Please contact support.");
//             } finally {
//               setLoading(false);
//             }
//           },
//           prefill: {
//             name: user?.name || "",
//             email: user?.email || "",
//             contact: user?.phone || ""
//           },
//           theme: {
//             color: "#2d5a27"
//           }
//         };

//         const razorpayClass = (window as unknown as { Razorpay: new (opts: object) => { on: (event: string, handler: (res: { error: { description: string } }) => void) => void; open: () => void } }).Razorpay;
//         const rzp = new razorpayClass(options);
//         rzp.on('payment.failed', function (response: { error: { description: string } }) {
//           console.error(response.error);
//           alert("Payment failed: " + response.error.description);
//           setLoading(false);
//         });
//         rzp.open();

//       } else {
//         // COD Order
//         await apiRequest('/orders/create', {
//           method: 'POST',
//           body: JSON.stringify(orderPayload)
//         });

//         clearCart();
//         setOrderPlaced(true);
//       }
//     } catch (err) {
//       console.error("Order failed:", err);
//       alert("Failed to place order. Please try again.");
//       setLoading(false);
//     }
//   }, [selectedMethod, items, finalTotal, amountToPayNow, isGift, state.giftMessage, clearCart, user, selectedAddressIndex]);

//   // Success screen
//   if (orderPlaced) {
//     return (
//       <>
//         <style>{`
//           @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Sans:wght@300;400;500;600&display=swap');
//           .ck-s{min-height:100vh;background:#f5f0e8;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;font-family:'DM Sans',sans-serif;text-align:center}
//           .ck-s-icon{font-size:64px;margin-bottom:20px;animation:pop .5s cubic-bezier(.34,1.56,.64,1)}
//           @keyframes pop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
//           .ck-s-title{font-family:'Cormorant Garamond',serif;font-size:36px;font-weight:300;color:#1a3a1a;margin-bottom:8px}
//           .ck-s-sub{font-size:14px;color:rgba(26,58,26,.6);line-height:1.7;margin-bottom:32px;max-width:320px}
//           .ck-s-btn{padding:14px 40px;background:#2d5a27;color:white;border:none;border-radius:50px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;cursor:pointer;text-decoration:none;display:inline-block}
//         `}</style>
//         <div className="ck-s">
//           <div className="ck-s-icon">✅</div>
//           <h1 className="ck-s-title">Order Placed!</h1>
//           <p className="ck-s-sub">Your order is confirmed. You&apos;ll receive a confirmation email shortly.</p>
//           <Link href="/shop" className="ck-s-btn">Continue Shopping</Link>
//         </div>
//       </>
//     );
//   }


//   const handleCheckoutGiftSelect = (id: string) => {
//     if (selectedGiftId === id) {
//       setSelectedGiftId(null);
//       if (isGift) toggleGift();
//     } else {
//       setSelectedGiftId(id);
//       if (!isGift) toggleGift();
//     }
//   };



//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400;500;600&display=swap');

//         :root {
//           --g900: #1a3a1a;
//           --g800: #1e4d1e;
//           --g700: #2d5a27;
//           --g600: #3a7a32;
//           --g500: #4a9e40;
//           --g400: #6abf5e;
//           --g100: #e8f5e9;
//           --g50:  #f0f7f0;
//           --beige:     #f5f0e8;
//           --beige-mid: #ede7d9;
//           --beige-drk: #cfc6b0;
//           --ink:   #1a2a1a;
//           --mist:  rgba(26,42,26,.42);
//           --border: rgba(45,90,39,.13);
//           --white: #ffffff;
//           --red:   #b5341c;
//         }

//         *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

//         .ck-root {
//           min-height: 100vh;
//           background: var(--beige);
//           font-family: 'DM Sans', sans-serif;
//           color: var(--ink);
//           margin-top: 60px;
//         }

//         .ck-savings-strip {
//           background: #e5f4e0;
//           padding: 9px 20px;
//           font-size: 12px; color: var(--g700); font-weight: 600;
//           border-bottom: 1px solid rgba(45,90,39,.09);
//           display: flex; align-items: center; gap: 6px; justify-content: center;
//         }

//         .ck-body {
//           padding: 20px 16px 48px;
//           max-width: 1060px; margin: 0 auto;
//         }
//         @media (min-width: 768px)  { .ck-body { padding: 32px 32px 60px; } }
//         @media (min-width: 1024px) { .ck-body { padding: 40px 48px 60px; } }

//         .ck-layout {
//           display: grid;
//           grid-template-columns: 1fr;
//           gap: 20px;
//         }
//         @media (min-width: 768px) {
//           .ck-layout { grid-template-columns: 1fr 360px; align-items: start; }
//         }
//         @media (min-width: 1024px) {
//           .ck-layout { grid-template-columns: 1fr 400px; gap: 28px; }
//         }

//         .ck-col-title {
//           font-family: 'Cormorant Garamond', serif;
//           font-size: 22px; font-weight: 500; letter-spacing: .08em;
//           color: var(--g900); margin-bottom: 14px;
//         }

//         .ck-panel {
//           background: var(--white);
//           border-radius: 16px;
//           overflow: hidden;
//           border: 1px solid var(--border);
//           box-shadow: 0 2px 14px rgba(45,90,39,.07);
//           margin-bottom: 14px;
//           animation: ckUp .35s ease both;
//         }
//         @keyframes ckUp {
//           from { opacity: 0; transform: translateY(10px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }
//         .ck-panel-head {
//           padding: 12px 20px 10px;
//           font-size: 9px; letter-spacing: .44em; text-transform: uppercase;
//           color: var(--mist); font-weight: 600;
//           border-bottom: 1px solid var(--border);
//           background: var(--beige);
//         }

//         .ck-method {
//           display: flex; align-items: flex-start; gap: 14px;
//           padding: 15px 20px;
//           border-bottom: 1px solid var(--border);
//           cursor: pointer; transition: background .15s; position: relative;
//         }
//         .ck-method:last-child { border-bottom: none; }
//         .ck-method:hover  { background: var(--beige); }
//         .ck-method.active { background: #eaf5ea; }

//         .ck-method-body { flex: 1; min-width: 0; }
//         .ck-method-label { font-size: 14px; font-weight: 600; color: var(--ink); margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
//         .ck-method-sub   { font-size: 12px; color: var(--mist); line-height: 1.4; }
//         .ck-method-badge {
//           font-size: 8px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
//           color: white; background: var(--g600); padding: 2px 7px; border-radius: 4px;
//         }

//         .ck-radio {
//           width: 20px; height: 20px; border-radius: 50%;
//           border: 2px solid var(--border); flex-shrink: 0;
//           display: flex; align-items: center; justify-content: center;
//           transition: all .2s; margin-top: 2px;
//         }
//         .ck-method.active .ck-radio { border-color: var(--g600); background: var(--g600); }
//         .ck-method.active .ck-radio::after {
//           content: ''; width: 8px; height: 8px; border-radius: 50%; background: white;
//         }

//         .ck-cod-note {
//           padding: 12px 20px;
//           background: rgba(181,52,28,.05); border-bottom: 1px solid rgba(181,52,28,.15);
//           font-size: 12px; color: #8b2e21; line-height: 1.6;
//         }
//         .ck-cod-note strong { font-weight: 700; }

//         .ck-partial-options {
//           display: flex; gap: 10px; margin-top: 10px;
//         }
//         .ck-partial-btn {
//           flex: 1; padding: 8px; border: 1.5px solid var(--border); border-radius: 8px;
//           background: var(--white); cursor: pointer; text-align: center;
//           font-size: 13px; font-weight: 600; color: var(--ink); transition: all 0.2s;
//         }
//         .ck-partial-btn.active {
//           border-color: var(--g600); background: var(--g50); color: var(--g700);
//         }

//         .ck-gift {
//           display: flex; align-items: center; gap: 14px;
//           padding: 16px 20px; cursor: pointer; transition: background .15s;
//         }
//         .ck-gift:hover { background: var(--beige); }
//         .ck-gift-body { flex: 1; }
//         .ck-gift-title { font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 2px; }
//         .ck-gift-sub   { font-size: 11px; color: var(--mist); }
//         .ck-gift-price { font-size: 13px; font-weight: 700; color: var(--g700); flex-shrink: 0; }
//         .ck-gift-check {
//           width: 22px; height: 22px; border-radius: 50%;
//           border: 2px solid var(--border);
//           display: flex; align-items: center; justify-content: center;
//           font-size: 11px; transition: all .22s; flex-shrink: 0;
//         }
//         .ck-gift-check.on { background: var(--g600); border-color: var(--g600); color: white; }

//         .ck-row {
//           display: flex; justify-content: space-between; align-items: center;
//           padding: 12px 20px; font-size: 13px; color: var(--mist);
//           border-bottom: 1px solid var(--border);
//         }
//         .ck-row:last-child { border-bottom: none; }
//         .ck-row span:last-child { font-weight: 500; color: var(--ink); }
//         .ck-row.total {
//           font-size: 15px; font-weight: 700; color: var(--g900);
//           background: var(--beige);
//         }
//         .ck-row.total span:last-child { font-size: 18px; font-weight: 800; color: var(--g900); }
//         .ck-row.save { color: var(--g700); font-weight: 600; }
//         .ck-free {
//           background: #bdd4bf; color: white;
//           font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 4px;
//           text-transform: uppercase; letter-spacing: .1em;
//         }

//         .ck-pay-btn {
//           display: flex; align-items: center; justify-content: center; gap: 10px;
//           width: 100%; padding: 18px;
//           background: linear-gradient(135deg, var(--g700), var(--g800));
//           color: white; border: none; border-radius: 14px;
//           font-family: 'DM Sans', sans-serif;
//           font-size: 13px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase;
//           cursor: pointer;
//           box-shadow: 0 6px 28px rgba(45,90,39,.26);
//           transition: all .22s; margin-top: 4px;
//         }
//         .ck-pay-btn:hover:not(:disabled) {
//           background: linear-gradient(135deg, var(--g600), var(--g700));
//           transform: translateY(-1px);
//           box-shadow: 0 8px 32px rgba(45,90,39,.32);
//         }
//         .ck-pay-btn:disabled { opacity: .45; cursor: not-allowed; }

//         .ck-spinner {
//           width: 18px; height: 18px; border-radius: 50%;
//           border: 2px solid rgba(255,255,255,.3); border-top-color: white;
//           animation: spin .7s linear infinite;
//         }
//         @keyframes spin { to { transform: rotate(360deg); } }

//         .ck-secure-note {
//           display: flex; align-items: center; justify-content: center; gap: 5px;
//           font-size: 10px; color: var(--mist); margin-top: 10px;
//           font-weight: 500; letter-spacing: .05em;
//         }
//           /* ── Delivery Options ── */
// .ck-delivery-cards {
//   display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
//   padding: 14px 16px;
// }
// .ck-delivery-card {
//   border: 2px solid var(--border); border-radius: 14px;
//   padding: 14px 14px 12px; cursor: pointer;
//   background: var(--white); transition: border-color .2s, background .2s;
//   position: relative;
// }
// .ck-delivery-card:hover { border-color: var(--g500); }
// .ck-delivery-card.active { border-color: var(--g600); background: var(--g50); }
// .ck-delivery-card-icon { font-size: 22px; margin-bottom: 6px; }
// .ck-delivery-card-title { font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 2px; }
// .ck-delivery-card-eta   { font-size: 11px; color: var(--mist); margin-bottom: 6px; }
// .ck-delivery-card-price { font-size: 13px; font-weight: 700; color: var(--g700); }
// .ck-delivery-card-check {
//   position: absolute; top: 8px; right: 8px;
//   width: 18px; height: 18px; border-radius: 50%;
//   background: var(--g600); border: 2px solid white;
//   display: flex; align-items: center; justify-content: center;
//   font-size: 9px; color: white;
//   opacity: 0; transform: scale(.5);
//   transition: opacity .2s, transform .25s cubic-bezier(.34,1.56,.64,1);
// }
// .ck-delivery-card.active .ck-delivery-card-check { opacity: 1; transform: scale(1); }

// /* ── Gift Cards (ported from CartPage) ── */
// .ck-gift-cards {
//   display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
//   padding: 14px 16px 0;
// }
// .ck-gift-card {
//   position: relative; border: 2px solid var(--border);
//   border-radius: 14px; overflow: hidden; cursor: pointer;
//   background: var(--white); transition: border-color .2s, box-shadow .2s, transform .15s;
// }
// .ck-gift-card:hover { border-color: var(--g500); box-shadow: 0 4px 16px rgba(45,90,39,.12); transform: translateY(-2px); }
// .ck-gift-card.active { border-color: var(--g600); box-shadow: 0 6px 22px rgba(45,90,39,.2); }
// .ck-gift-card img { width: 100%; aspect-ratio: 1/1; object-fit: cover; display: block; background: var(--beige-mid); }
// .ck-gift-card-body { padding: 10px 12px 12px; }
// .ck-gift-card-title { font-size: 12.5px; font-weight: 700; color: var(--ink); margin-bottom: 2px; }
// .ck-gift-card-sub   { font-size: 11px; color: var(--mist); margin-bottom: 6px; line-height: 1.4; }
// .ck-gift-card-price { font-size: 13px; font-weight: 700; color: var(--g700); }
// .ck-gift-card-badge {
//   position: absolute; top: 8px; right: 8px;
//   width: 20px; height: 20px; border-radius: 50%;
//   background: var(--g600); border: 2px solid white;
//   display: flex; align-items: center; justify-content: center;
//   font-size: 10px; color: white;
//   opacity: 0; transform: scale(.5);
//   transition: opacity .2s, transform .25s cubic-bezier(.34,1.56,.64,1);
//   pointer-events: none;
// }
// .ck-gift-card.active .ck-gift-card-badge { opacity: 1; transform: scale(1); }
// .ck-gift-msg-wrap { padding: 12px 16px 16px; animation: ckUp .3s ease; }
// .ck-gift-msg {
//   width: 100%; padding: 11px 14px;
//   border: 1.5px solid var(--border); border-radius: 12px;
//   font-family: 'DM Sans', sans-serif; font-size: 12px; color: var(--ink);
//   background: white; outline: none; resize: none; height: 68px;
//   transition: border-color .2s;
// }
// .ck-gift-msg:focus { border-color: var(--g500); }
// .ck-gift-msg::placeholder { color: rgba(26,42,26,.3); }

// /* ── Address responsive ── */
// .ck-addr-grid {
//   display: grid;
//   grid-template-columns: 1fr;
//   gap: 10px;
// }
// @media (min-width: 480px) {
//   .ck-addr-grid { grid-template-columns: 1fr 1fr; }
//   .ck-addr-full { grid-column: 1 / -1; }
// }
// @media (min-width: 768px) {
//   .ck-addr-grid { grid-template-columns: 2fr 1fr 1fr; }
//   .ck-addr-full { grid-column: 1 / -1; }
// }
// .ck-addr-input {
//   padding: 10px 14px; border-radius: 10px;
//   border: 1.5px solid var(--border);
//   font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--ink);
//   background: white; outline: none; width: 100%;
//   transition: border-color .2s;
// }
// .ck-addr-input:focus { border-color: var(--g500); }
// .ck-addr-input::placeholder { color: rgba(26,42,26,.3); }
//       `}</style>

//       <div className="ck-root">
//         <ExitIntent />
//         <UpperNav />

//         {savings > 0 && (
//           <div className="ck-savings-strip">
//             🎉 You&apos;re saving <strong style={{ marginLeft: 3 }}>₹{savings.toLocaleString('en-IN')}</strong> on this order
//           </div>
//         )}

//         <div className="ck-body">
//           <div className="ck-layout">

//             {/* LEFT COLUMN */}
//             <div>
//               <p className="ck-col-title">Shipping Address</p>
//               <div className="ck-panel" style={{ animationDelay: '0s', padding: 20 }}>
//                 {user?.addresses && user.addresses.length > 0 ? (
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: showAddressForm ? 16 : 0 }}>
//                     {user.addresses.map((addr, idx) => (
//                       <label key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', padding: 12, border: selectedAddressIndex === idx ? '2px solid var(--g600)' : '1.5px solid var(--border)', borderRadius: 10, background: selectedAddressIndex === idx ? '#eaf5ea' : 'transparent' }}>
//                         <input type="radio" name="address" checked={selectedAddressIndex === idx} onChange={() => { setSelectedAddressIndex(idx); setShowAddressForm(false); }} style={{ marginTop: 4 }} />
//                         <div style={{ fontSize: 13, color: 'var(--ink)' }}>
//                           <div style={{ fontWeight: 600, marginBottom: 4 }}>{user.name}</div>
//                           <div>{addr.fullAddress}</div>
//                           <div>{addr.city}, {addr.state} - {addr.pincode}</div>
//                         </div>
//                       </label>
//                     ))}
//                   </div>
//                 ) : (
//                   <div style={{ fontSize: 13, color: 'var(--mist)', marginBottom: 16 }}>No saved addresses.</div>
//                 )}

//                 {!showAddressForm ? (
//                   <button onClick={() => setShowAddressForm(true)} style={{ background: 'none', border: '1.5px dashed var(--g500)', color: 'var(--g700)', padding: 12, borderRadius: 8, cursor: 'pointer', width: '100%', fontSize: 13, fontWeight: 600 }}>
//                     + Add New Address
//                   </button>
//                 ) : (
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//                     <div className="ck-addr-grid">
//                       <input className="ck-addr-input ck-addr-full" placeholder="Full Address (House No, Street, Area)" value={addressForm.fullAddress} onChange={e => setAddressForm({ ...addressForm, fullAddress: e.target.value })} />
//                       <input className="ck-addr-input" placeholder="City" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} />
//                       <input className="ck-addr-input" placeholder="State" value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} />
//                       <input className="ck-addr-input" placeholder="Pincode" value={addressForm.pincode} onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })} />
//                     </div>
//                     <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
//                       <button onClick={() => setShowAddressForm(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
//                       <button onClick={handleSaveAddress} disabled={addressBusy} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: 'var(--g700)', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
//                         {addressBusy ? 'Saving…' : 'Save Address'}
//                       </button>
//                     </div>

//                   </div>
//                 )}
//               </div>

//               <p className="ck-col-title" style={{ marginTop: 24 }}>Payment Options</p>
//               <div className="ck-panel" style={{ animationDelay: '.08s' }}>
//                 <div className="ck-panel-head">Select Payment Method</div>

//                 {PAYMENT_METHODS.map(method => {
//                   const isActive = selectedMethod === method.id;

//                   return (
//                     <div key={method.id}>
//                       <div className={`ck-method${isActive ? ' active' : ''}`} onClick={() => setSelectedMethod(method.id)}>
//                         <div className="ck-radio" />
//                         <div className="ck-method-body">
//                           <div className="ck-method-label">
//                             {method.label}
//                             {method.badge && <span className="ck-method-badge">{method.badge}</span>}
//                           </div>
//                           <div className="ck-method-sub">{method.sub}</div>

//                           {isActive && method.id === 'PARTIAL_COD' && (
//                             <div className="ck-partial-options" onClick={e => e.stopPropagation()}>
//                               <button
//                                 className={`ck-partial-btn ${partialPercentage === 25 ? 'active' : ''}`}
//                                 onClick={() => setPartialPercentage(25)}
//                               >
//                                 Pay 25% Advance
//                               </button>
//                               <button
//                                 className={`ck-partial-btn ${partialPercentage === 50 ? 'active' : ''}`}
//                                 onClick={() => setPartialPercentage(50)}
//                               >
//                                 Pay 50% Advance
//                               </button>
//                             </div>
//                           )}
//                         </div>
//                       </div>

//                       {isActive && method.id === 'PARTIAL_COD' && (
//                         <div className="ck-cod-note">
//                           Pay <strong>₹{Math.round(finalTotal * (partialPercentage / 100)).toLocaleString('en-IN')} now</strong> via Razorpay.<br />
//                           The balance of <strong>₹{(finalTotal - Math.round(finalTotal * (partialPercentage / 100))).toLocaleString('en-IN')}</strong> will be collected on delivery.
//                         </div>
//                       )}

//                       {isActive && method.id === 'COD' && (
//                         <div className="ck-cod-note">
//                           Pay the full amount of <strong>₹{finalTotal.toLocaleString('en-IN')}</strong> in cash or UPI when your order arrives.
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//               {/* ── ESTIMATED DELIVERY ── */}
//               <p className="ck-col-title" style={{ marginTop: 24 }}>Estimated Delivery</p>
//               <div className="ck-panel" style={{ animationDelay: '.18s' }}>
//                 <div className="ck-panel-head">Choose Delivery Speed</div>
//                 <div className="ck-delivery-cards">
//                   {DELIVERY_OPTIONS.map(opt => (
//                     <div
//                       key={opt.id}
//                       className={`ck-delivery-card${deliveryType === opt.id ? ' active' : ''}`}
//                       onClick={() => setDeliveryType(opt.id)}
//                       role="button" tabIndex={0}
//                       onKeyDown={e => e.key === 'Enter' && setDeliveryType(opt.id)}
//                     >
//                       <div className="ck-delivery-card-icon">{opt.icon}</div>
//                       <div className="ck-delivery-card-title">{opt.label}</div>
//                       <div className="ck-delivery-card-eta">{opt.eta}</div>
//                       <div className="ck-delivery-card-price">{opt.priceLabel}</div>
//                       <div className="ck-delivery-card-check">✓</div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//               {/* ── GIFT BOX SELECTOR (card-style) ── */}
//               <div className="ck-panel" style={{ animationDelay: '.22s' }}>
//                 <div className="ck-panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                   <span>Make it a Gift</span>
//                   <span style={{ fontSize: 9, fontStyle: 'italic', textTransform: 'none', letterSpacing: 0, color: 'var(--mist)' }}>optional</span>
//                 </div>
//                 <div className="ck-gift-cards">
//                   {CHECKOUT_GIFT_OPTIONS.map(opt => {
//                     const isSel = selectedGiftId === opt.id;
//                     return (
//                       <div
//                         key={opt.id}
//                         className={`ck-gift-card${isSel ? ' active' : ''}`}
//                         onClick={() => handleCheckoutGiftSelect(opt.id)}
//                         role="button" tabIndex={0}
//                         onKeyDown={e => e.key === 'Enter' && handleCheckoutGiftSelect(opt.id)}
//                         aria-pressed={isSel}
//                       >
//                         {/* eslint-disable-next-line @next/next/no-img-element */}
//                         <img src={opt.image} alt={opt.title} />
//                         <div className="ck-gift-card-body">
//                           <div className="ck-gift-card-title">{opt.title}</div>
//                           <div className="ck-gift-card-sub">{opt.sub}</div>
//                           <div className="ck-gift-card-price">+₹{opt.price}</div>
//                         </div>
//                         <div className="ck-gift-card-badge" aria-hidden="true">✓</div>
//                       </div>
//                     );
//                   })}
//                 </div>
//                 {selectedGiftId && (
//                   <div className="ck-gift-msg-wrap">
//                     <textarea
//                       className="ck-gift-msg"
//                       placeholder="Write a gift message (optional)…"
//                       value={checkoutGiftMsg}
//                       onChange={e => setCheckoutGiftMsg(e.target.value)}
//                       maxLength={160}
//                     />
//                   </div>
//                 )}
//               </div>
// </div>
//               {/* RIGHT COLUMN */}
//               <div>
//                 <p className="ck-col-title">Order Summary</p>

//                 <div className="ck-panel" style={{ animationDelay: '.18s' }}>
//                   <div className="ck-panel-head">{itemCount} Item{itemCount !== 1 ? 's' : ''}</div>

//                   {items.map(item => (
//                     <div key={`${item.id}-${item.colorHex}`}>
//                       <div className="ck-row">
//                         <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                           <span style={{ fontSize: 11, color: 'var(--mist)', flexShrink: 0 }}>×{item.qty}</span>
//                           {item.name}
//                         </span>
//                         <span>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
//                       </div>
//                       {item.selectedCharms && item.selectedCharms.length > 0 && (
//                         <div style={{ padding: '4px 20px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
//                           {item.selectedCharms.map((charm: { id?: string; _id?: string; name?: string; price?: number; emoji?: string }, idx: number) => (
//                             <div key={charm.id || charm._id || idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--mist)' }}>
//                               <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
//                                 <span>{charm.emoji || '◈'}</span> {charm.name}
//                               </span>
//                               <span style={{ fontWeight: 500 }}>₹{(charm.price || 0).toLocaleString('en-IN')}</span>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   ))}

//                   {savings > 0 && (
//                     <div className="ck-row save">
//                       <span>Savings</span>
//                       <span style={{ color: 'var(--g700)' }}>−₹{savings.toLocaleString('en-IN')}</span>
//                     </div>
//                   )}
//                   {discountAmount > 0 && (
//                     <div className="ck-row save">
//                       <span>Coupon ({discountCode})</span>
//                       <span style={{ color: 'var(--g700)' }}>−₹{discountAmount}</span>
//                     </div>
//                   )}

//                   <div className="ck-row">
//                     <span>Shipping</span>
//                     <span>{shipping === 0 ? <span className="ck-free">FREE</span> : `₹${shipping}`}</span>
//                   </div>

//                   {isGift && (
//                     <div className="ck-row">
//                       <span>Gift wrap</span>
//                       <span>₹{GIFT_CHARGE}</span>
//                     </div>
//                   )}

//                   <div className="ck-row total">
//                     <span>Total</span>
//                     {deliveryType === 'express' && (
//                       <div className="ck-row">
//                         <span>⚡ Express Delivery</span>
//                         <span>+₹149</span>
//                       </div>
//                     )}
//                     {activeCheckoutGift && (
//                       <div className="ck-row">
//                         <span>🎁 {activeCheckoutGift.title}</span>
//                         <span>+₹{activeCheckoutGift.price}</span>
//                       </div>
//                     )}
//                     <span>₹{finalTotal.toLocaleString('en-IN')}</span>
//                   </div>
//                 </div>

//                 <button
//                   className="ck-pay-btn"
//                   onClick={handlePay}
//                   disabled={!selectedMethod || loading}
//                 >
//                   {loading ? (
//                     <><div className="ck-spinner" /> Processing…</>
//                   ) : (
//                     <>
//                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                         <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
//                       </svg>
//                       {selectedMethod === 'PARTIAL_COD'
//                         ? `Pay Advance ₹${amountToPayNow.toLocaleString('en-IN')}`
//                         : selectedMethod === 'COD'
//                           ? `Place Order (Pay ₹${finalTotal.toLocaleString('en-IN')} on Delivery)`
//                           : `Pay ₹${finalTotal.toLocaleString('en-IN')} Now`
//                       }
//                     </>
//                   )}
//                 </button>

//                 <div className="ck-secure-note">
//                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
//                   </svg>
//                   100% Secure &amp; Encrypted Payment via Razorpay
//                 </div>
//               </div>

//             </div>
//           </div>
//         </div>
//       </>
//       );
// }


'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useCart, GIFT_CHARGE } from '@/lib/cartContext';
import { useAuth } from '@/lib/authContext';
import ExitIntent from '@/components/cart/ExitIntent';
import UpperNav from '@/components/ui/UpperNav';
import { apiRequest } from '@/lib/api';

const PAYMENT_METHODS = [
  { id: 'ONLINE', label: 'Pay Online in Full', sub: 'UPI, Credit/Debit Cards, NetBanking, Wallets via Razorpay', badge: 'Recommended' },
  { id: 'PARTIAL_COD', label: 'Partial COD', sub: 'Pay a portion now, balance on delivery', badge: null },
  { id: 'COD', label: 'Cash on Delivery', sub: 'Pay when your order arrives', badge: null },
];

export default function CheckoutPage() {
  const {
    state, savings, shipping, total,
    itemCount, toggleGift, clearCart
  } = useCart();

  const { items, isGift, discountCode, discountAmount } = state;

  const [selectedMethod, setSelectedMethod] = useState('ONLINE');
  const [partialPercentage, setPartialPercentage] = useState<25 | 50>(25);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const { user, refreshUser } = useAuth();
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullAddress: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [addressBusy, setAddressBusy] = useState(false);

  const [deliveryType, setDeliveryType] = useState<'standard' | 'express'>('standard');
  const DELIVERY_OPTIONS = [
    { id: 'standard', icon: '🚚', label: 'Standard', eta: '5–7 business days', price: 0, priceLabel: 'Free' },
    { id: 'express', icon: '⚡', label: 'Express', eta: '1–2 business days', price: 149, priceLabel: '+₹149' },
  ] as const;

  const CHECKOUT_GIFT_OPTIONS = [
    { id: 'classic', title: 'Classic Gift Wrap', sub: 'Kraft paper & satin ribbon', price: 25, image: '/smallerBox.png' },
    { id: 'luxury', title: 'Luxury Gift Hamper', sub: 'Ideal for 4+ products', price: 250, image: '/Biggerbox.jpg' },
  ];
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  const [checkoutGiftMsg, setCheckoutGiftMsg] = useState('');
  const activeCheckoutGift = CHECKOUT_GIFT_OPTIONS.find(g => g.id === selectedGiftId) ?? null;
  const giftCharge = activeCheckoutGift?.price ?? 0;
  const deliveryCharge = deliveryType === 'express' ? 149 : 0;

  const finalTotal = total + deliveryCharge + giftCharge;
  let amountToPayNow = finalTotal;
  if (selectedMethod === 'PARTIAL_COD') {
    amountToPayNow = Math.round(finalTotal * (partialPercentage / 100));
  } else if (selectedMethod === 'COD') {
    amountToPayNow = 0;
  }

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handleSaveAddress = async () => {
    if (!addressForm.fullAddress || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      alert("Please fill all address fields.");
      return;
    }
    setAddressBusy(true);
    try {
      const addresses = [...(user?.addresses || []), addressForm];
      await apiRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ addresses })
      });
      await refreshUser();
      setShowAddressForm(false);
      setSelectedAddressIndex(addresses.length - 1);
      setAddressForm({ fullAddress: '', city: '', state: '', pincode: '' });
    } catch (err) {
      console.error(err);
      alert("Failed to save address.");
    } finally {
      setAddressBusy(false);
    }
  };

  const handlePay = useCallback(async () => {
    if (!selectedMethod) return;

    let currentAddress = null;
    if (user?.addresses && user.addresses.length > 0) {
      currentAddress = user.addresses[selectedAddressIndex];
    }

    if (!currentAddress) {
      alert("Please add a shipping address.");
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        amount: amountToPayNow,
        totalAmount: finalTotal,
        advanceAmount: amountToPayNow,
        balanceAmount: Math.max(finalTotal - amountToPayNow, 0),
        paymentMode: selectedMethod,
        items: items.map(item => {
          const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(item.id);
          const mappedProduct = (!item.id.startsWith('custom-') && isValidObjectId) ? item.id : undefined;
          const selectedCharms = item.selectedCharms?.map((c: { id?: string; _id?: string } | string) => {
            if (typeof c === 'string') return c;
            return c.id || c._id || '';
          }).filter(Boolean);
          const selectionGroups = item.selectionGroups || (item.selectedCharms?.length ? [{
            type: 'multi_item_selection',
            category: item.category || item.sourceId,
            label: item.name,
            selectionKey: 'selectedCharms',
            itemRefModel: 'CharmItem',
            items: item.selectedCharms.map((c) => {
              const fallbackCharmPrice = item.selectedCharms?.length ? item.price / item.selectedCharms.length : 0;
              if (typeof c === 'string') return { id: c, quantity: 1, price: fallbackCharmPrice };
              return {
                id: c.id,
                sourceId: c.sourceId,
                name: c.name,
                quantity: c.quantity || 1,
                price: typeof c.price === 'number' && Number.isFinite(c.price) ? c.price : fallbackCharmPrice,
                image: c.image,
                images: c.images,
                emoji: c.emoji,
                customText: c.customText,
                customData: c.customData,
              };
            }),
          }] : undefined);
          return {
            product: mappedProduct,
            sourceId: item.sourceId,
            name: item.name,
            category: item.category,
            quantity: item.qty,
            price: item.price,
            customNote: item.customNote,
            customImages: item.customImages,
            selectedCharms,
            selectionGroups,
          };
        }),
        shippingAddress: currentAddress,
        isGift: isGift,
        giftMessage: state.giftMessage,
      };

      if (selectedMethod === 'ONLINE' || selectedMethod === 'PARTIAL_COD') {
        const rzpOrder = await apiRequest<{ success: boolean, orderId: string, razorpayOrderId: string, amount: number, currency: string }>('/payment/create-order', {
          method: 'POST',
          body: JSON.stringify(orderPayload)
        });

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_RmCmc4bECn3PRU",
          amount: rzpOrder.amount * 100,
          currency: rzpOrder.currency,
          name: "MakeUsSparkle",
          description: "Order Payment",
          order_id: rzpOrder.razorpayOrderId,
          handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
            try {
              setLoading(true);
              await apiRequest('/payment/verify', {
                method: 'POST',
                body: JSON.stringify({
                  orderId: rzpOrder.orderId,
                  razorpayOrderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  paymentMode: selectedMethod,
                })
              });
              clearCart();
              setOrderPlaced(true);
            } catch (err) {
              console.error("Verification failed:", err);
              alert("Payment verification failed. Please contact support.");
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
            contact: user?.phone || ""
          },
          theme: { color: "#2d5a27" }
        };

        const razorpayClass = (window as unknown as { Razorpay: new (opts: object) => { on: (event: string, handler: (res: { error: { description: string } }) => void) => void; open: () => void } }).Razorpay;
        const rzp = new razorpayClass(options);
        rzp.on('payment.failed', function (response: { error: { description: string } }) {
          console.error(response.error);
          alert("Payment failed: " + response.error.description);
          setLoading(false);
        });
        rzp.open();
      } else {
        await apiRequest('/orders/create', {
          method: 'POST',
          body: JSON.stringify(orderPayload)
        });
        clearCart();
        setOrderPlaced(true);
      }
    } catch (err) {
      console.error("Order failed:", err);
      alert("Failed to place order. Please try again.");
      setLoading(false);
    }
  }, [selectedMethod, items, finalTotal, amountToPayNow, isGift, state.giftMessage, clearCart, user, selectedAddressIndex]);

  if (orderPlaced) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Sans:wght@300;400;500;600&display=swap');
          .ck-s{min-height:100vh;background:#f5f0e8;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;font-family:'DM Sans',sans-serif;text-align:center}
          .ck-s-icon{font-size:64px;margin-bottom:20px;animation:pop .5s cubic-bezier(.34,1.56,.64,1)}
          @keyframes pop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
          .ck-s-title{font-family:'Cormorant Garamond',serif;font-size:36px;font-weight:300;color:#1a3a1a;margin-bottom:8px}
          .ck-s-sub{font-size:14px;color:rgba(26,58,26,.6);line-height:1.7;margin-bottom:32px;max-width:320px}
          .ck-s-btn{padding:14px 40px;background:#2d5a27;color:white;border:none;border-radius:50px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;cursor:pointer;text-decoration:none;display:inline-block}
        `}</style>
        <div className="ck-s">
          <div className="ck-s-icon">✅</div>
          <h1 className="ck-s-title">Order Placed!</h1>
          <p className="ck-s-sub">Your order is confirmed. You&apos;ll receive a confirmation email shortly.</p>
          <Link href="/shop" className="ck-s-btn">Continue Shopping</Link>
        </div>
      </>
    );
  }

  const handleCheckoutGiftSelect = (id: string) => {
    if (selectedGiftId === id) {
      setSelectedGiftId(null);
      if (isGift) toggleGift();
    } else {
      setSelectedGiftId(id);
      if (!isGift) toggleGift();
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --g900: #1a3a1a;
          --g800: #1e4d1e;
          --g700: #2d5a27;
          --g600: #3a7a32;
          --g500: #4a9e40;
          --g400: #6abf5e;
          --g100: #e8f5e9;
          --g50:  #f0f7f0;
          --beige:     #f5f0e8;
          --beige-mid: #ede7d9;
          --beige-drk: #cfc6b0;
          --ink:   #1a2a1a;
          --mist:  rgba(26,42,26,.42);
          --border: rgba(45,90,39,.13);
          --white: #ffffff;
          --red:   #b5341c;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Root ── */
        .ck-root {
          min-height: 100vh;
          background: var(--beige);
          font-family: 'DM Sans', sans-serif;
          color: var(--ink);
          margin-top: 60px;
          /* Prevent any horizontal overflow */
          overflow-x: hidden;
          width: 100%;
        }

        /* ── Savings strip ── */
        .ck-savings-strip {
          background: #e5f4e0;
          padding: 9px 16px;
          font-size: 12px;
          color: var(--g700);
          font-weight: 600;
          border-bottom: 1px solid rgba(45,90,39,.09);
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: center;
          flex-wrap: wrap;
          text-align: center;
        }

        /* ── Body wrapper ── */
        .ck-body {
          padding: 16px 12px 60px;
          max-width: 1060px;
          margin: 0 auto;
          width: 100%;
        }
        @media (min-width: 480px)  { .ck-body { padding: 20px 16px 60px; } }
        @media (min-width: 768px)  { .ck-body { padding: 32px 28px 60px; } }
        @media (min-width: 1024px) { .ck-body { padding: 40px 48px 60px; } }

        /* ── Two-column grid ── */
        .ck-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .ck-layout {
            grid-template-columns: 1fr 340px;
            align-items: start;
            gap: 20px;
          }
        }
        @media (min-width: 1024px) {
          .ck-layout {
            grid-template-columns: 1fr 400px;
            gap: 28px;
          }
        }

        /* ── On mobile, order summary comes AFTER left column ── */
        .ck-col-right { order: 2; }
        @media (min-width: 768px) { .ck-col-right { order: unset; } }

        /* ── Section title ── */
        .ck-col-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 500;
          letter-spacing: .06em;
          color: var(--g900);
          margin-bottom: 10px;
        }
        @media (min-width: 480px) { .ck-col-title { font-size: 22px; } }

        /* ── Panel card ── */
        .ck-panel {
          background: var(--white);
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid var(--border);
          box-shadow: 0 2px 14px rgba(45,90,39,.07);
          margin-bottom: 12px;
          animation: ckUp .35s ease both;
          /* Critical: prevent children from overflowing */
          width: 100%;
          min-width: 0;
        }
        @media (min-width: 480px) { .ck-panel { border-radius: 16px; margin-bottom: 14px; } }
        @keyframes ckUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ck-panel-head {
          padding: 11px 16px 9px;
          font-size: 9px;
          letter-spacing: .44em;
          text-transform: uppercase;
          color: var(--mist);
          font-weight: 600;
          border-bottom: 1px solid var(--border);
          background: var(--beige);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        @media (min-width: 480px) { .ck-panel-head { padding: 12px 20px 10px; } }

        /* ── Payment methods ── */
        .ck-method {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: background .15s;
          position: relative;
          /* Prevent overflow */
          min-width: 0;
          overflow: hidden;
        }
        @media (min-width: 480px) { .ck-method { gap: 14px; padding: 15px 20px; } }
        .ck-method:last-child { border-bottom: none; }
        .ck-method:hover  { background: var(--beige); }
        .ck-method.active { background: #eaf5ea; }

        .ck-method-body { flex: 1; min-width: 0; }
        .ck-method-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 3px;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        @media (min-width: 480px) { .ck-method-label { font-size: 14px; } }
        .ck-method-sub {
          font-size: 11px;
          color: var(--mist);
          line-height: 1.5;
          /* Allow wrapping on small screens */
          word-break: break-word;
        }
        @media (min-width: 480px) { .ck-method-sub { font-size: 12px; } }
        .ck-method-badge {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: white;
          background: var(--g600);
          padding: 2px 7px;
          border-radius: 4px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .ck-radio {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid var(--border);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all .2s;
          margin-top: 2px;
        }
        .ck-method.active .ck-radio { border-color: var(--g600); background: var(--g600); }
        .ck-method.active .ck-radio::after {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: white;
        }

        /* ── COD note ── */
        .ck-cod-note {
          padding: 11px 16px;
          background: rgba(181,52,28,.05);
          border-bottom: 1px solid rgba(181,52,28,.15);
          font-size: 12px;
          color: #8b2e21;
          line-height: 1.6;
          word-break: break-word;
        }
        @media (min-width: 480px) { .ck-cod-note { padding: 12px 20px; } }
        .ck-cod-note strong { font-weight: 700; }

        /* ── Partial options ── */
        .ck-partial-options {
          display: flex;
          gap: 8px;
          margin-top: 10px;
          flex-wrap: wrap;
        }
        .ck-partial-btn {
          flex: 1;
          min-width: 120px;
          padding: 8px 6px;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          background: var(--white);
          cursor: pointer;
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: var(--ink);
          transition: all 0.2s;
          white-space: nowrap;
        }
        @media (min-width: 400px) { .ck-partial-btn { font-size: 13px; } }
        .ck-partial-btn.active {
          border-color: var(--g600);
          background: var(--g50);
          color: var(--g700);
        }

        /* ── Delivery cards ── */
        .ck-delivery-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding: 12px;
        }
        @media (min-width: 480px) { .ck-delivery-cards { padding: 14px 16px; } }
        .ck-delivery-card {
          border: 2px solid var(--border);
          border-radius: 12px;
          padding: 12px 10px;
          cursor: pointer;
          background: var(--white);
          transition: border-color .2s, background .2s;
          position: relative;
          min-width: 0;
        }
        @media (min-width: 480px) { .ck-delivery-card { border-radius: 14px; padding: 14px 14px 12px; } }
        .ck-delivery-card:hover { border-color: var(--g500); }
        .ck-delivery-card.active { border-color: var(--g600); background: var(--g50); }
        .ck-delivery-card-icon { font-size: 20px; margin-bottom: 5px; }
        @media (min-width: 480px) { .ck-delivery-card-icon { font-size: 22px; } }
        .ck-delivery-card-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 2px;
        }
        @media (min-width: 480px) { .ck-delivery-card-title { font-size: 13px; } }
        .ck-delivery-card-eta {
          font-size: 10px;
          color: var(--mist);
          margin-bottom: 5px;
          line-height: 1.3;
        }
        @media (min-width: 480px) { .ck-delivery-card-eta { font-size: 11px; } }
        .ck-delivery-card-price {
          font-size: 12px;
          font-weight: 700;
          color: var(--g700);
        }
        @media (min-width: 480px) { .ck-delivery-card-price { font-size: 13px; } }
        .ck-delivery-card-check {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--g600);
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          color: white;
          opacity: 0;
          transform: scale(.5);
          transition: opacity .2s, transform .25s cubic-bezier(.34,1.56,.64,1);
        }
        .ck-delivery-card.active .ck-delivery-card-check { opacity: 1; transform: scale(1); }

        /* ── Gift cards ── */
        .ck-gift-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding: 12px;
        }
        @media (min-width: 480px) { .ck-gift-cards { padding: 14px 16px 0; } }
        .ck-gift-card {
          position: relative;
          border: 2px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          background: var(--white);
          transition: border-color .2s, box-shadow .2s, transform .15s;
          min-width: 0;
        }
        @media (min-width: 480px) { .ck-gift-card { border-radius: 14px; } }
        .ck-gift-card:hover {
          border-color: var(--g500);
          box-shadow: 0 4px 16px rgba(45,90,39,.12);
          transform: translateY(-2px);
        }
        .ck-gift-card.active {
          border-color: var(--g600);
          box-shadow: 0 6px 22px rgba(45,90,39,.2);
        }
        .ck-gift-card img {
          width: 100%;
          aspect-ratio: 1/1;
          object-fit: cover;
          display: block;
          background: var(--beige-mid);
        }
        .ck-gift-card-body { padding: 8px 10px 10px; }
        @media (min-width: 480px) { .ck-gift-card-body { padding: 10px 12px 12px; } }
        .ck-gift-card-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 2px;
        }
        @media (min-width: 480px) { .ck-gift-card-title { font-size: 12.5px; } }
        .ck-gift-card-sub {
          font-size: 10px;
          color: var(--mist);
          margin-bottom: 4px;
          line-height: 1.3;
        }
        @media (min-width: 480px) { .ck-gift-card-sub { font-size: 11px; margin-bottom: 6px; } }
        .ck-gift-card-price {
          font-size: 12px;
          font-weight: 700;
          color: var(--g700);
        }
        @media (min-width: 480px) { .ck-gift-card-price { font-size: 13px; } }
        .ck-gift-card-badge {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--g600);
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          color: white;
          opacity: 0;
          transform: scale(.5);
          transition: opacity .2s, transform .25s cubic-bezier(.34,1.56,.64,1);
          pointer-events: none;
        }
        .ck-gift-card.active .ck-gift-card-badge { opacity: 1; transform: scale(1); }
        .ck-gift-msg-wrap {
          padding: 10px 12px 12px;
          animation: ckUp .3s ease;
        }
        @media (min-width: 480px) { .ck-gift-msg-wrap { padding: 12px 16px 16px; } }
        .ck-gift-msg {
          width: 100%;
          padding: 10px 12px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: var(--ink);
          background: white;
          outline: none;
          resize: none;
          height: 68px;
          transition: border-color .2s;
        }
        .ck-gift-msg:focus { border-color: var(--g500); }
        .ck-gift-msg::placeholder { color: rgba(26,42,26,.3); }

        /* ── Order summary rows ── */
        .ck-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 11px 16px;
          font-size: 12px;
          color: var(--mist);
          border-bottom: 1px solid var(--border);
          gap: 8px;
          /* Allow item name to wrap if too long */
          min-width: 0;
        }
        @media (min-width: 480px) { .ck-row { padding: 12px 20px; font-size: 13px; } }
        .ck-row:last-child { border-bottom: none; }
        .ck-row-label {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          min-width: 0;
          /* Allow long names to wrap */
          flex-wrap: wrap;
        }
        .ck-row-label-text {
          /* Truncate very long product names */
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 160px;
        }
        @media (min-width: 360px) { .ck-row-label-text { max-width: 180px; } }
        @media (min-width: 480px) { .ck-row-label-text { max-width: 220px; } }
        @media (min-width: 768px) { .ck-row-label-text { max-width: none; white-space: normal; } }
        .ck-row-value {
          font-weight: 500;
          color: var(--ink);
          flex-shrink: 0;
          white-space: nowrap;
        }
        .ck-row.save .ck-row-value { color: var(--g700); }
        .ck-row.save { color: var(--g700); font-weight: 600; }
        .ck-row.total {
          font-size: 14px;
          font-weight: 700;
          color: var(--g900);
          background: var(--beige);
          padding: 14px 16px;
        }
        @media (min-width: 480px) { .ck-row.total { font-size: 15px; padding: 14px 20px; } }
        .ck-row.total .ck-row-value {
          font-size: 17px;
          font-weight: 800;
          color: var(--g900);
        }
        @media (min-width: 480px) { .ck-row.total .ck-row-value { font-size: 18px; } }
        .ck-free {
          background: #bdd4bf;
          color: white;
          font-size: 9px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: .1em;
          white-space: nowrap;
        }
        .ck-qty-badge {
          font-size: 11px;
          color: var(--mist);
          flex-shrink: 0;
        }

        /* ── Charms sub-rows ── */
        .ck-charms {
          padding: 0 16px 10px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        @media (min-width: 480px) { .ck-charms { padding: 0 20px 10px; } }
        .ck-charm-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--mist);
          gap: 6px;
          min-width: 0;
        }
        .ck-charm-name {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ck-charm-price {
          font-weight: 500;
          flex-shrink: 0;
          white-space: nowrap;
        }

        /* ── Pay button ── */
        .ck-pay-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 16px 12px;
          background: linear-gradient(135deg, var(--g700), var(--g800));
          color: white;
          border: none;
          border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .15em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 6px 28px rgba(45,90,39,.26);
          transition: all .22s;
          margin-top: 4px;
          /* Allow text to wrap on very small screens */
          flex-wrap: wrap;
          text-align: center;
          line-height: 1.4;
        }
        @media (min-width: 480px) {
          .ck-pay-btn { font-size: 13px; letter-spacing: .2em; padding: 18px; }
        }
        .ck-pay-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--g600), var(--g700));
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(45,90,39,.32);
        }
        .ck-pay-btn:disabled { opacity: .45; cursor: not-allowed; }

        .ck-spinner {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: white;
          animation: spin .7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .ck-secure-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 10px;
          color: var(--mist);
          margin-top: 10px;
          font-weight: 500;
          letter-spacing: .05em;
          flex-wrap: wrap;
          text-align: center;
        }

        /* ── Address form ── */
        .ck-addr-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }
        @media (min-width: 400px) {
          .ck-addr-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .ck-addr-full { grid-column: 1 / -1; }
        }
        .ck-addr-input {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1.5px solid var(--border);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: var(--ink);
          background: white;
          outline: none;
          width: 100%;
          transition: border-color .2s;
          /* Prevent iOS zoom on focus */
          font-size: 16px;
        }
        @media (min-width: 480px) { .ck-addr-input { font-size: 13px; padding: 10px 14px; } }
        .ck-addr-input:focus { border-color: var(--g500); }
        .ck-addr-input::placeholder { color: rgba(26,42,26,.3); }

        /* ── Address card ── */
        .ck-addr-card {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          cursor: pointer;
          padding: 11px 12px;
          border-radius: 10px;
          font-size: 13px;
          color: var(--ink);
          transition: background .15s, border-color .2s;
        }
        @media (min-width: 480px) { .ck-addr-card { padding: 12px; } }
      `}</style>

      <div className="ck-root">
        <ExitIntent />
        <UpperNav />

        {savings > 0 && (
          <div className="ck-savings-strip">
            🎉 You&apos;re saving <strong style={{ marginLeft: 3 }}>₹{savings.toLocaleString('en-IN')}</strong> on this order
          </div>
        )}

        <div className="ck-body">
          <div className="ck-layout">

            {/* ── LEFT COLUMN ── */}
            <div>

              {/* Shipping Address */}
              <p className="ck-col-title">Shipping Address</p>
              <div className="ck-panel" style={{ animationDelay: '0s', padding: 16 }}>
                {user?.addresses && user.addresses.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: showAddressForm ? 14 : 0 }}>
                    {user.addresses.map((addr, idx) => (
                      <label
                        key={idx}
                        className="ck-addr-card"
                        style={{
                          border: selectedAddressIndex === idx
                            ? '2px solid var(--g600)'
                            : '1.5px solid var(--border)',
                          background: selectedAddressIndex === idx ? '#eaf5ea' : 'transparent',
                        }}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressIndex === idx}
                          onChange={() => { setSelectedAddressIndex(idx); setShowAddressForm(false); }}
                          style={{ marginTop: 3, flexShrink: 0 }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: 3 }}>{user.name}</div>
                          <div style={{ color: 'var(--mist)', fontSize: 12, lineHeight: 1.5 }}>{addr.fullAddress}</div>
                          <div style={{ color: 'var(--mist)', fontSize: 12 }}>{addr.city}, {addr.state} - {addr.pincode}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--mist)', marginBottom: 14 }}>No saved addresses.</div>
                )}

                {!showAddressForm ? (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    style={{
                      background: 'none',
                      border: '1.5px dashed var(--g500)',
                      color: 'var(--g700)',
                      padding: '11px 12px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      width: '100%',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    + Add New Address
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="ck-addr-grid">
                      <input
                        className="ck-addr-input ck-addr-full"
                        placeholder="Full Address (House No, Street, Area)"
                        value={addressForm.fullAddress}
                        onChange={e => setAddressForm({ ...addressForm, fullAddress: e.target.value })}
                      />
                      <input
                        className="ck-addr-input"
                        placeholder="City"
                        value={addressForm.city}
                        onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                      />
                      <input
                        className="ck-addr-input"
                        placeholder="State"
                        value={addressForm.state}
                        onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                      />
                      <input
                        className="ck-addr-input"
                        placeholder="Pincode"
                        value={addressForm.pincode}
                        onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                      <button
                        onClick={() => setShowAddressForm(false)}
                        style={{
                          flex: 1,
                          padding: '10px 8px',
                          borderRadius: 8,
                          border: '1px solid var(--border)',
                          background: 'transparent',
                          cursor: 'pointer',
                          fontSize: 13,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveAddress}
                        disabled={addressBusy}
                        style={{
                          flex: 1,
                          padding: '10px 8px',
                          borderRadius: 8,
                          border: 'none',
                          background: 'var(--g700)',
                          color: 'white',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: 13,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {addressBusy ? 'Saving…' : 'Save Address'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Options */}
              <p className="ck-col-title" style={{ marginTop: 20 }}>Payment Options</p>
              <div className="ck-panel" style={{ animationDelay: '.08s' }}>
                <div className="ck-panel-head">Select Payment Method</div>

                {PAYMENT_METHODS.map(method => {
                  const isActive = selectedMethod === method.id;
                  return (
                    <div key={method.id}>
                      <div
                        className={`ck-method${isActive ? ' active' : ''}`}
                        onClick={() => setSelectedMethod(method.id)}
                      >
                        <div className="ck-radio" />
                        <div className="ck-method-body">
                          <div className="ck-method-label">
                            {method.label}
                            {method.badge && <span className="ck-method-badge">{method.badge}</span>}
                          </div>
                          <div className="ck-method-sub">{method.sub}</div>

                          {isActive && method.id === 'PARTIAL_COD' && (
                            <div className="ck-partial-options" onClick={e => e.stopPropagation()}>
                              <button
                                className={`ck-partial-btn${partialPercentage === 25 ? ' active' : ''}`}
                                onClick={() => setPartialPercentage(25)}
                              >
                                Pay 25% Advance
                              </button>
                              <button
                                className={`ck-partial-btn${partialPercentage === 50 ? ' active' : ''}`}
                                onClick={() => setPartialPercentage(50)}
                              >
                                Pay 50% Advance
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {isActive && method.id === 'PARTIAL_COD' && (
                        <div className="ck-cod-note">
                          Pay <strong>₹{Math.round(finalTotal * (partialPercentage / 100)).toLocaleString('en-IN')} now</strong> via Razorpay.<br />
                          Balance of <strong>₹{(finalTotal - Math.round(finalTotal * (partialPercentage / 100))).toLocaleString('en-IN')}</strong> collected on delivery.
                        </div>
                      )}

                      {isActive && method.id === 'COD' && (
                        <div className="ck-cod-note">
                          Pay the full amount of <strong>₹{finalTotal.toLocaleString('en-IN')}</strong> in cash or UPI when your order arrives.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Estimated Delivery */}
              <p className="ck-col-title" style={{ marginTop: 20 }}>Estimated Delivery</p>
              <div className="ck-panel" style={{ animationDelay: '.18s' }}>
                <div className="ck-panel-head">Choose Delivery Speed</div>
                <div className="ck-delivery-cards">
                  {DELIVERY_OPTIONS.map(opt => (
                    <div
                      key={opt.id}
                      className={`ck-delivery-card${deliveryType === opt.id ? ' active' : ''}`}
                      onClick={() => setDeliveryType(opt.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && setDeliveryType(opt.id)}
                    >
                      <div className="ck-delivery-card-icon">{opt.icon}</div>
                      <div className="ck-delivery-card-title">{opt.label}</div>
                      <div className="ck-delivery-card-eta">{opt.eta}</div>
                      <div className="ck-delivery-card-price">{opt.priceLabel}</div>
                      <div className="ck-delivery-card-check">✓</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gift Box Selector */}
              <div className="ck-panel" style={{ animationDelay: '.22s' }}>
                <div className="ck-panel-head">
                  <span>Make it a Gift</span>
                  <span style={{ fontSize: 9, fontStyle: 'italic', textTransform: 'none', letterSpacing: 0, color: 'var(--mist)' }}>optional</span>
                </div>
                <div className="ck-gift-cards">
                  {CHECKOUT_GIFT_OPTIONS.map(opt => {
                    const isSel = selectedGiftId === opt.id;
                    return (
                      <div
                        key={opt.id}
                        className={`ck-gift-card${isSel ? ' active' : ''}`}
                        onClick={() => handleCheckoutGiftSelect(opt.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && handleCheckoutGiftSelect(opt.id)}
                        aria-pressed={isSel}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={opt.image} alt={opt.title} />
                        <div className="ck-gift-card-body">
                          <div className="ck-gift-card-title">{opt.title}</div>
                          <div className="ck-gift-card-sub">{opt.sub}</div>
                          <div className="ck-gift-card-price">+₹{opt.price}</div>
                        </div>
                        <div className="ck-gift-card-badge" aria-hidden="true">✓</div>
                      </div>
                    );
                  })}
                </div>
                {selectedGiftId && (
                  <div className="ck-gift-msg-wrap">
                    <textarea
                      className="ck-gift-msg"
                      placeholder="Write a gift message (optional)…"
                      value={checkoutGiftMsg}
                      onChange={e => setCheckoutGiftMsg(e.target.value)}
                      maxLength={160}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="ck-col-right">
              <p className="ck-col-title">Order Summary</p>

              <div className="ck-panel" style={{ animationDelay: '.18s' }}>
                <div className="ck-panel-head">{itemCount} Item{itemCount !== 1 ? 's' : ''}</div>

                {items.map(item => (
                  <div key={`${item.id}-${item.colorHex}`}>
                    <div className="ck-row">
                      <div className="ck-row-label">
                        <span className="ck-qty-badge">×{item.qty}</span>
                        <span className="ck-row-label-text">{item.name}</span>
                      </div>
                      <span className="ck-row-value">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                    </div>
                    {item.selectedCharms && item.selectedCharms.length > 0 && (
                      <div className="ck-charms">
                        {item.selectedCharms.map((selection, idx: number) => {
                          const charm = typeof selection === 'string' ? { id: selection, name: selection } : selection;
                          const charmPrice = typeof charm.price === 'number' && Number.isFinite(charm.price)
                            ? charm.price
                            : item.selectedCharms?.length
                              ? item.price / item.selectedCharms.length
                              : 0;
                          return (
                          <div key={charm.id || charm._id || idx} className="ck-charm-row">
                            <span className="ck-charm-name">
                              <span>{charm.emoji || '◈'}</span>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{charm.name}</span>
                            </span>
                            <span className="ck-charm-price">₹{charmPrice.toLocaleString('en-IN')}</span>
                          </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}

                {savings > 0 && (
                  <div className="ck-row save">
                    <div className="ck-row-label">Savings</div>
                    <span className="ck-row-value" style={{ color: 'var(--g700)' }}>−₹{savings.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="ck-row save">
                    <div className="ck-row-label">Coupon ({discountCode})</div>
                    <span className="ck-row-value" style={{ color: 'var(--g700)' }}>−₹{discountAmount}</span>
                  </div>
                )}

                <div className="ck-row">
                  <div className="ck-row-label">Shipping</div>
                  <span className="ck-row-value">
                    {shipping === 0 ? <span className="ck-free">FREE</span> : `₹${shipping}`}
                  </span>
                </div>

                {isGift && (
                  <div className="ck-row">
                    <div className="ck-row-label">Gift wrap</div>
                    <span className="ck-row-value">₹{GIFT_CHARGE}</span>
                  </div>
                )}

                {deliveryType === 'express' && (
                  <div className="ck-row">
                    <div className="ck-row-label">⚡ Express Delivery</div>
                    <span className="ck-row-value">+₹149</span>
                  </div>
                )}

                {activeCheckoutGift && (
                  <div className="ck-row">
                    <div className="ck-row-label">🎁 {activeCheckoutGift.title}</div>
                    <span className="ck-row-value">+₹{activeCheckoutGift.price}</span>
                  </div>
                )}

                {/* Total row — fixed, no nested rows */}
                <div className="ck-row total">
                  <div className="ck-row-label" style={{ color: 'var(--g900)', fontWeight: 700 }}>Total</div>
                  <span className="ck-row-value">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                className="ck-pay-btn"
                onClick={handlePay}
                disabled={!selectedMethod || loading}
              >
                {loading ? (
                  <><div className="ck-spinner" /> Processing…</>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    {selectedMethod === 'PARTIAL_COD'
                      ? `Pay Advance ₹${amountToPayNow.toLocaleString('en-IN')}`
                      : selectedMethod === 'COD'
                        ? `Place Order · ₹${finalTotal.toLocaleString('en-IN')} on Delivery`
                        : `Pay ₹${finalTotal.toLocaleString('en-IN')} Now`
                    }
                  </>
                )}
              </button>

              <div className="ck-secure-note">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                100% Secure &amp; Encrypted Payment via Razorpay
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
