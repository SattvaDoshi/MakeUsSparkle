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
        .pdp-discount{display:inline-flex;align-items:center;background:#e8f3ec;color:#1f5a38;border:1px solid #cfe3d6;border-radius:99px;padding:4px 11px;font-size:12px;font-weight:600;letter-spacing:.01em;text-transform:none;white-space:nowrap}
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
        .gift-wrap{border:1.5px solid #e6e4da;border-radius:16px;background:#fff;overflow:hidden;transition:border-color .2s,background .2s,box-shadow .2s}
        .gift-wrap:hover{border-color:#d8cfa6}
        .gift-wrap.is-on{border-color:#2a4736;background:#f3f8f4;box-shadow:0 0 0 3px rgba(42,71,54,.08)}
        .gift-card{all:unset;box-sizing:border-box;display:flex;align-items:stretch;width:100%;cursor:pointer}
        .gift-card:focus-visible{outline:2px solid #2a4736;outline-offset:-2px;border-radius:14px}
        .gift-img{flex:0 0 58px;width:58px;min-height:58px;background:#f4f3ee;position:relative}
        .gift-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
        .gift-main{flex:1;min-width:0;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 12px 8px 12px}
        .gift-text{min-width:0;display:flex;flex-direction:column;gap:1px}
        .gift-title-row{display:flex;align-items:center;gap:2px;min-width:0}
        .gift-title{font-size:14.5px;font-weight:600;color:#1a1a14;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .gift-info{all:unset;box-sizing:border-box;flex:0 0 auto;width:24px;height:24px;margin:-2px 0;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#8a8a7e;cursor:pointer;transition:background .2s,color .2s}
        .gift-info:hover,.gift-info[aria-expanded="true"]{background:#eaf0ea;color:#2a4736}
        .gift-info:focus-visible{outline:2px solid #2a4736}
        .gift-price{font-size:13.5px;font-weight:700;color:#2a4736}
        .gift-add{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;gap:4px;min-width:62px;height:32px;padding:0 12px;border-radius:999px;border:1.5px solid #2a4736;color:#2a4736;font-size:12.5px;font-weight:700;letter-spacing:.03em;transition:background .2s,color .2s}
        .gift-wrap:hover .gift-add{background:#e8f3ec}
        .gift-wrap.is-on .gift-add{background:#2a4736;color:#fff}
        .gift-perks-open{list-style:none;margin:0;padding:12px 16px 14px;border-top:1px dashed #e0dcc8;display:flex;flex-direction:column;gap:8px;animation:giftOpen .22s ease}
        .gift-perks-open li{display:flex;align-items:center;gap:10px;font-size:13px;color:#2a2a22;line-height:1.3}
        .gift-perks-open li svg{width:18px;height:18px;padding:4px;border-radius:50%;background:#e1eee5;color:#2a4736;flex-shrink:0;box-sizing:border-box}
        @keyframes giftOpen{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
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
        @media (max-width:639px){.ctl-card{flex:0 0 150px}.ctl-arrows{display:none}}

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
          .acc-body{padding-left:2px}
          .acc-head-left{font-size:14.5px}
          /* compact variant pickers on mobile */
          .pdp-swatches{gap:8px;margin-bottom:12px}
          .pdp-swatch{width:22px;height:22px;border-width:2px}
          .pdp-sizes{gap:6px;margin-bottom:6px}
          .pdp-size-btn{min-width:0;height:auto;padding:6px 12px;font-size:10.5px;letter-spacing:.04em}
        }

        /* ── Info section: soft colour accents (cream cards, tinted icons) ── */
        .pdp-info .acc-item{background:#fdfbf5;border-color:#ece5cf}
        .pdp-info .acc-item:hover{border-color:#ddd0a4}
        .pdp-info .acc-item--open{background:#fffdf6;border-color:#d9c27a;box-shadow:0 6px 22px rgba(154,122,46,.10)}
        .pdp-info .acc-item:nth-of-type(4n+1) .acc-emoji{background:#e4efe7;color:#2a4736}
        .pdp-info .acc-item:nth-of-type(4n+2) .acc-emoji{background:#f7edcc;color:#8a6a1c}
        .pdp-info .acc-item:nth-of-type(4n+3) .acc-emoji{background:#f6e3df;color:#9a4a42}
        .pdp-info .acc-item:nth-of-type(4n+4) .acc-emoji{background:#e8e4f3;color:#5a4a8c}
        .pdp-info .acc-item--open .acc-emoji{background:#2a4736;color:#fff}
        .pdp-info .acc-chevron{background:#e4efe7;color:#2a4736}
        .pdp-info .acc-item--open .acc-chevron{background:#2a4736;color:#fff}
        .pdp-info .acc-head:hover{background:#faf6e8}
        .dlv-table{background:#fdfbf5;border-color:#ece5cf}
        .dlv-row{border-top-color:#ece5cf}
        .dlv-head{background:#f6f0dc;color:#8a6a1c}
        .dlv-row:nth-of-type(2) .est-ico{background:#e4efe7;color:#2a4736}
        .dlv-row:nth-of-type(3) .est-ico{background:#f7edcc;color:#8a6a1c}
        .dlv-free{background:#e4efe7;border:1px solid #cfe0d3}
        @media(max-width:639px){
          .pdp-info .acc-head{padding:11px 12px}
          .pdp-info .acc-emoji{width:30px;height:30px;font-size:14px}
          .pdp-info .acc-head-left{font-size:14px;gap:10px}
          .pdp-info .acc-chevron{width:24px;height:24px}
          .pdp-info .acc-item{margin-bottom:8px}
          .dlv{margin-top:16px}
          .dlv-title{font-size:20px;margin-bottom:10px}
          .dlv-title{font-size:19px;margin-bottom:8px}
          /* delivery: keep the table side by side, just tighter */
          .dlv-row{grid-template-columns:1.2fr 1fr 1fr .62fr;gap:6px;padding:9px 10px;font-size:12px}
          .dlv-head{padding:8px 10px;font-size:8.5px;letter-spacing:.05em;line-height:1.2}
          .dlv-name{gap:6px;font-size:12px}
          .dlv-name .est-ico{width:22px;height:22px;font-size:12px}
          .dlv-cell{font-size:12px;color:#4a4a40}
          .dlv-free{margin-top:8px;padding:9px 11px;font-size:12px;gap:8px}
          /* trust badges: three across, icon over text */
          .pdp-info .pdp-trust{grid-template-columns:repeat(3,1fr);gap:0;overflow:hidden;margin-top:16px}
          .pdp-info .pdp-trust-item{display:flex;flex-direction:column;align-items:center;text-align:center;gap:3px;min-width:0;padding:10px 4px;border-radius:0;border:0;border-right:1px solid #ecebe4}
          .pdp-info .pdp-trust-item:last-child{border-right:0}
          .pdp-info .pdp-trust-icon{width:22px;height:22px;margin:0}
          .pdp-info .pdp-trust-title{font-size:10px;letter-spacing:.02em;line-height:1.25}
          .pdp-info .pdp-trust-sub{font-size:9.5px;line-height:1.25}
        }

        /* Estimated delivery: Standard and Express as two cards side by side (all screen sizes) */
        .dlv-table{display:grid;grid-template-columns:1fr 1fr;gap:10px;border:0;background:transparent;border-radius:0;overflow:visible}
        .dlv-row{display:grid;grid-template-columns:1fr auto;grid-template-areas:"name rate" "metro metro" "rest rest";align-items:center;gap:4px 8px;padding:12px;border:1px solid #ece5cf;border-radius:14px;background:#fdfbf5;font-size:13px}
        .dlv-row:first-child{border-top:1px solid #ece5cf}
        .dlv-row.dlv-head{display:none}
        .dlv-name{grid-area:name;gap:8px;font-size:14px;min-width:0}
        .dlv-name .est-ico{width:26px;height:26px;font-size:13px}
        .dlv-rate{grid-area:rate;font-size:14px}
        .dlv-cell{display:flex;justify-content:space-between;align-items:baseline;gap:6px;font-size:13px;color:#1a1a14;font-weight:500}
        .dlv-cell::before{content:attr(data-l);font-size:11px;font-weight:400;color:#6f6f64;letter-spacing:.01em}
        .dlv-cell[data-l="Metro cities"]{grid-area:metro;margin-top:6px;padding-top:8px;border-top:1px dashed #e6dcb8}
        .dlv-cell[data-l="Rest of India"]{grid-area:rest}
        @media (max-width:480px){
          .dlv-table{gap:8px}
          .dlv-row{padding:10px}
          .dlv-name{font-size:13px;gap:6px}
          .dlv-name .est-ico{width:22px;height:22px;font-size:12px}
          .dlv-rate{font-size:13px}
          .dlv-cell{font-size:12px;flex-wrap:wrap;gap:0 6px}
          .dlv-cell::before{font-size:10.5px}
        }
`;
