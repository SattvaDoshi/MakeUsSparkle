/** Shared look for every product-style page (product, charm, ...). Appended to each page's own <style>. */
export const PDP_THEME_CSS = `
        /* ── Revamp overrides ── */
        .pdp-layout{max-width:1480px;grid-template-columns:minmax(0,1.75fr) minmax(0,1fr)}
        .pdp-gallery{display:block;padding:10px 24px 40px 40px;align-self:start}
        .pdp-info{padding:10px 40px 40px 16px;align-self:start}
        .pdp-crumbs{display:flex;align-items:center;gap:8px;flex-wrap:nowrap;overflow:hidden;font-size:12.5px;color:var(--mist);letter-spacing:.03em;max-width:1480px;margin:0 auto;padding:14px 40px 4px}
        .pdp-crumbs>*{flex-shrink:0;white-space:nowrap}
        .pdp-crumbs .pdp-crumb-cur{flex-shrink:1;min-width:0;overflow:hidden;text-overflow:ellipsis;color:var(--ink)}
        .pdp-crumbs a{color:inherit;text-decoration:none}
        .pdp-crumbs a:hover{color:var(--ink);text-decoration:underline}
        .pdp-name{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:clamp(1.8rem,3vw,2.5rem);color:var(--ink)}
        .pdp-price{font-size:2rem}
        .pdp-discount{background:#2a4736;border-radius:99px;padding:4px 11px}
        .pdp-tax{font-size:12px;color:var(--mist);margin:0 0 8px;line-height:1.3}
        .pdp-info-top + .pdp-section-label, .pdp-info-top + div > .pdp-section-label{margin-top:0}
        .pdp-info .pdp-section-label{margin-bottom:10px}
        .pdp-swatches:empty{display:none}
        .pdp-price-row{margin-bottom:2px;gap:10px}
        .pdp-price{line-height:1.1}
        .pdp-offer{background:#fbf7ea;border-color:#eadfb8;border-radius:12px}
        .pdp-qty{border-color:#dcdacf}
        .pdp-size-btn{border-radius:10px}
        .pdp-size-btn.active{background:var(--ink);border-color:var(--ink)}
        .pdp-cta-row{grid-template-columns:auto 1fr;grid-template-areas:"qty cart" "buy buy";gap:10px}
        .pdp-qty--cta{grid-area:qty;height:54px;border-radius:999px;background:#fff}
        .pdp-qty--cta .pdp-qty-btn{height:52px;width:42px}
        .pdp-btn-wish{grid-area:wish;font-size:0;gap:0;padding:0;border-radius:999px;min-height:54px}
        .pdp-btn-wish svg{width:20px;height:20px}
        .pdp-btn-cart-wrap{grid-area:cart}
        .pdp-btn-buy{grid-area:buy}
        .pdp-btn-cart,.pdp-btn-buy{min-height:54px;border-radius:999px;font-size:12px;width:100%}
        .pdp-btn-cart{background:#2a4736}
        .pdp-btn-cart:hover{background:#1f3628}
        .pdp-btn-buy{background:var(--ink)}
        .pdp-btn-buy:hover{background:#000}
        .pdp-trust-item{border-radius:12px;background:#fafaf6;border-color:#ecebe4}
        @media(max-width:1023px){
          .pdp-layout{grid-template-columns:1fr}
          .pdp-gallery{position:static;padding:0}
          .pdp-info{padding:20px 16px 32px}
          .pdp-crumbs{padding:10px 16px 10px}
          .pdp-price{font-size:1.7rem}
        }

        /* ── Gift box + Complete the look redesign ── */
        .gift-card{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:14px;width:100%;padding:12px;border:1.5px solid #e6e4da;border-radius:16px;background:#fff;cursor:pointer;transition:border-color .2s,box-shadow .2s,background .2s}
        .gift-card:hover{border-color:#cfcbb8;box-shadow:0 6px 20px rgba(26,26,20,.06)}
        .gift-card:focus-visible{outline:2px solid #2a4736;outline-offset:2px}
        .gift-card.is-on{border-color:#2a4736;background:#f5f8f4;box-shadow:0 0 0 3px rgba(42,71,54,.08)}
        .gift-img{flex:0 0 76px;width:76px;height:76px;border-radius:12px;overflow:hidden;background:#f4f3ee}
        .gift-img img{width:100%;height:100%;object-fit:cover;display:block}
        .gift-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:5px}
        .gift-tag{align-self:flex-start;font-size:9.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#8c6b20;background:rgba(201,168,76,.14);padding:3px 9px;border-radius:999px}
        .gift-title-row{display:flex;align-items:baseline;justify-content:space-between;gap:10px}
        .gift-title{font-size:15px;font-weight:600;color:#1a1a14;line-height:1.2}
        .gift-price{font-size:14px;font-weight:600;color:#2a4736;flex-shrink:0}
        .gift-perks{display:flex;flex-wrap:wrap;gap:4px 12px}
        .gift-perk{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;color:#6f6f64}
        .gift-perk svg{color:#2a4736;flex-shrink:0}
        .gift-check{flex:0 0 32px;width:32px;height:32px;border-radius:50%;border:1.5px solid #d6d3c4;display:flex;align-items:center;justify-content:center;color:#1a1a14;transition:all .2s}
        .gift-card.is-on .gift-check{background:#2a4736;border-color:#2a4736;color:#fff}
        .ctl-strip{margin:26px 0 0;padding:0}
        .ctl-strip-header{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:14px}
        .ctl-strip-eyebrow{display:block;font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:600;letter-spacing:0;text-transform:none;color:#1a1a14;line-height:1.1;white-space:normal}
        .ctl-strip-sub{margin:4px 0 0;font-size:12.5px;color:#6f6f64}
        .ctl-strip-rule{display:none}
        .ctl-arrows{display:flex;gap:6px;flex-shrink:0}
        .ctl-arrows button{width:34px;height:34px;border-radius:50%;border:1px solid #dcdacf;background:#fff;font-size:20px;line-height:1;cursor:pointer;color:#1a1a14;transition:background .2s,color .2s}
        .ctl-arrows button:hover{background:#1a1a14;color:#fff}
        .ctl-strip-scroll{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;padding:2px 2px 10px;scrollbar-width:none}
        .ctl-strip-scroll::-webkit-scrollbar{display:none}
        .ctl-card{flex:0 0 176px;height:auto;scroll-snap-align:start;display:flex;flex-direction:column;gap:10px;border:0;background:none;border-radius:0;box-shadow:none;animation:none;opacity:1;transform:none}
        .ctl-card:hover{transform:none;box-shadow:none}
        .ctl-img-wrap{position:relative;flex:none;aspect-ratio:4/5;border-radius:14px;overflow:hidden;background:#f4f3ee}
        .ctl-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .6s ease}
        .ctl-card:hover .ctl-img{transform:scale(1.06)}
        .ctl-disc-badge{position:absolute;top:8px;left:8px;right:auto;font-size:10px;font-weight:600;letter-spacing:.06em;padding:4px 9px;border-radius:999px;background:#fff;color:#2a4736;box-shadow:0 2px 8px rgba(0,0,0,.08)}
        .ctl-card-info{flex:none;padding:0;border:0;gap:3px}
        .ctl-card-name{font-size:13.5px;font-weight:500;color:#1a1a14;white-space:normal;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;line-height:1.3}
        .ctl-card-price-row{display:flex;align-items:baseline;gap:7px}
        .ctl-card-price{font-size:14.5px;font-weight:600;color:#1a1a14}
        .ctl-card-original{font-size:12px;color:#8b8b80;text-decoration:line-through}
        @media (max-width:639px){.ctl-card{flex:0 0 150px}.ctl-arrows{display:none}.gift-img{flex-basis:64px;width:64px;height:64px}.gift-title{font-size:14px}}

        /* ── Accordion + delivery redesign ── */
        .acc-wrap-card, .pdp-info .acc-item{background:#fff}
        .pdp-info .acc-item{border:1px solid #ecebe4;border-radius:14px;margin-bottom:10px;overflow:hidden;transition:border-color .2s,box-shadow .2s}
        .pdp-info .acc-item:hover{border-color:#dcdacf}
        .pdp-info .acc-item--open{border-color:#cfd8cf;box-shadow:0 6px 22px rgba(26,26,20,.05)}
        .pdp-info .acc-head{padding:14px 16px;border-radius:0}
        .pdp-info .acc-head:hover{background:#fafaf6}
        .pdp-info .acc-head:focus-visible{outline:2px solid #2a4736;outline-offset:-2px}
        .pdp-info .acc-head-left{font-size:15px;font-weight:500}
        .pdp-info .acc-emoji{width:36px;height:36px;background:#f1f5f1}
        .pdp-info .acc-item--open .acc-emoji{background:#2a4736;color:#fff}
        .pdp-info .acc-chevron{width:28px;height:28px;border-radius:50%;background:#f4f3ee;color:#1a1a14;display:flex;align-items:center;justify-content:center;transform:none!important;transition:background .2s,color .2s}
        .pdp-info .acc-item--open .acc-chevron{background:#1a1a14;color:#fff}
        .pdp-info .acc-v{transition:opacity .25s,transform .25s;transform-origin:center}
        .pdp-info .acc-item--open .acc-v{opacity:0;transform:scaleY(0)}
        .pdp-info .acc-body{padding:2px 18px 20px 66px;border-top:0}
        .dlv{margin-top:22px}
        .dlv-title{margin:0 0 12px;font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:600;color:#1a1a14}
        .dlv-table{border:1px solid #ecebe4;border-radius:14px;overflow:hidden;background:#fff}
        .dlv-row{display:grid;grid-template-columns:1.25fr 1fr 1fr .7fr;align-items:center;gap:8px;padding:14px 16px;border-top:1px solid #ecebe4;font-size:14px;color:#1a1a14}
        .dlv-row:first-child{border-top:0}
        .dlv-head{background:#fafaf6;padding:10px 16px;font-size:10.5px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#6f6f64}
        .dlv-name{display:flex;align-items:center;gap:10px;font-weight:600}
        .dlv-name .est-ico{width:32px;height:32px;margin:0;flex-shrink:0}
        .dlv-rate{font-weight:600;color:#2a4736;text-align:right}
        .dlv-head span:last-child{text-align:right}
        .dlv-free{display:flex;align-items:center;gap:10px;margin:12px 0 0;padding:12px 14px;border-radius:12px;background:#f1f5f1;color:#1f3a2a;font-size:13.5px}
        @media (max-width:639px){
          .dlv-head{display:none}
          .dlv-row{grid-template-columns:1fr auto;grid-template-areas:"name rate" "m m" "r r";row-gap:4px}
          .dlv-name{grid-area:name}.dlv-rate{grid-area:rate}
          .dlv-cell:nth-of-type(1){grid-area:m}.dlv-cell:nth-of-type(2){grid-area:r}
          .dlv-cell{font-size:13px;color:#4a4a40}
          .dlv-cell::before{content:attr(data-l) ": ";color:#6f6f64}
          .pdp-info .acc-body{padding-left:18px}
        }

        /* ── Right column polish ── */
        .pdp-info{display:block}
        .pdp-name{margin-bottom:12px}
        .pdp-rating{gap:8px;margin-bottom:16px}
        .pdp-stars{font-size:14px;letter-spacing:2px}
        .pdp-rating-num{font-size:13px;color:var(--ink)}
        .pdp-review-cnt{font-size:12.5px}
        .pdp-section-label{font-size:12px;letter-spacing:.12em;font-weight:600;color:var(--ink);margin-bottom:12px}
        .pdp-section-label span{font-weight:500;color:var(--mist);margin-left:4px;letter-spacing:.02em;text-transform:none}
        .pdp-divider{height:1px;background:#ecebe4;margin:24px 0}
        .pdp-offer{padding:9px 14px;gap:8px;border-radius:999px;display:inline-flex;margin-bottom:20px}
        .pdp-offer-icon{display:inline-flex;color:#9a7a2e}
        .pdp-offer-text{font-size:12.5px;font-weight:500;letter-spacing:.02em;color:#7a5d17}
        .pdp-qty-row{gap:16px;margin-bottom:6px}
        .pdp-qty{height:46px;border-color:#dcdacf}
        .pdp-qty-btn{width:44px;height:44px;font-size:20px}
        .pdp-qty-val{min-width:40px;font-size:15px}
        .pdp-stock{font-size:12.5px;letter-spacing:.02em;color:#b45309;font-weight:500;animation:none}
        .pdp-swatches{gap:12px;margin-bottom:22px}
        .pdp-size-btn{min-width:56px;height:44px;padding:0 18px;font-size:12px;letter-spacing:.06em;border-color:#dcdacf;color:var(--ink)}
        .pdp-size-btn:hover{border-color:var(--ink);background:#fff}
        .pdp-desc{font-size:14.5px;line-height:1.75;color:#3a3a32;letter-spacing:0}
        .pdp-trust{grid-template-columns:repeat(3,1fr);gap:0;border:1px solid #ecebe4;border-radius:14px;overflow:hidden;margin:22px 0 0;background:#fff}
        .pdp-trust-item{display:grid;grid-template-columns:30px 1fr;column-gap:10px;align-items:center;text-align:left;padding:14px 14px;border:0;border-right:1px solid #ecebe4;border-radius:0;background:#fff}
        .pdp-trust-item:last-child{border-right:0}
        .pdp-trust-item:hover{transform:none;box-shadow:none}
        .pdp-trust-icon{grid-row:1 / span 2;width:30px;height:30px;margin:0;color:#2a4736}
        .pdp-trust-title{font-size:11px;letter-spacing:.06em;margin:0;color:var(--ink)}
        .pdp-trust-sub{font-size:11.5px;color:var(--mist)}
        .pdp-accordion{border-top:1px solid #ecebe4}
        .acc-item{border-bottom:1px solid #ecebe4}
        .acc-head{padding:18px 2px}
        .acc-head:hover{background:none}
        .acc-head-left{font-size:15px;font-weight:500;gap:14px;color:var(--ink)}
        .acc-emoji{width:34px;height:34px;border-radius:50%;background:#f4f3ee;display:inline-flex;align-items:center;justify-content:center;font-size:16px;color:#2a4736;flex-shrink:0}
        .acc-body{padding:0 2px 22px 48px;font-size:14.5px;line-height:1.75;color:#3a3a32;letter-spacing:0}
        .acc-body>div[style]{font-size:14px!important;font-weight:400!important;color:#3a3a32!important;letter-spacing:0!important;line-height:1.75!important}
        .acc-policy-link{color:#2a4736;border-color:#2a4736}
        .est-ico{width:38px;height:38px;border-radius:50%;background:#f1f5f1;color:#2a4736;display:flex;align-items:center;justify-content:center;margin-bottom:10px;font-size:18px}
        .pdp-cust-banner{border-radius:14px;background:#fbf7ea;border-color:#eadfb8}
        @media(max-width:639px){
          .pdp-trust{grid-template-columns:1fr}
          .pdp-trust-item{border-right:0;border-bottom:1px solid #ecebe4;padding:12px 14px}
          .pdp-trust-item:last-child{border-bottom:0}
          .acc-body{padding-left:2px}
          .acc-head-left{font-size:14.5px}
        }
`;
