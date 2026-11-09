import svc from "../services/siteContent.service.js";

const wrap = (label, fn) => async (req, res) => {
	try { await fn(req, res); } catch (error) {
		console.error(`${label} error:`, error);
		res.status(400).json({ success: false, message: error.message });
	}
};
const cacheable = (res) => res.set("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");

// public
export const getFounderPublic = wrap("Get founder", async (req, res) => { cacheable(res); res.json({ success: true, founder: await svc.getFounder({ publicOnly: true }) }); });
export const getFaqsPublic = wrap("Get faqs", async (req, res) => { cacheable(res); res.json({ success: true, settings: await svc.getFaqSettings(), faqs: await svc.listFaqs({ activeOnly: true }) }); });
export const getFeaturedReviews = wrap("Featured reviews", async (req, res) => { cacheable(res); res.json(await svc.featuredReviews()); });

// admin
export const getFounderAdmin = wrap("Admin founder", async (req, res) => res.json({ success: true, founder: await svc.getFounder() }));
export const saveFounderAdmin = wrap("Save founder", async (req, res) => res.json({ success: true, founder: await svc.saveFounder(req.body, req.files) }));
export const getFaqsAdmin = wrap("Admin faqs", async (req, res) => res.json({ success: true, settings: await svc.getFaqSettings(), faqs: await svc.listFaqs() }));
export const saveFaqSettings = wrap("Save faq settings", async (req, res) => res.json({ success: true, settings: await svc.saveFaqSettings(req.body) }));
export const createFaq = wrap("Create faq", async (req, res) => res.status(201).json({ success: true, faq: await svc.createFaq(req.body) }));
export const updateFaq = wrap("Update faq", async (req, res) => res.json({ success: true, faq: await svc.updateFaq(req.params.id, req.body) }));
export const deleteFaq = wrap("Delete faq", async (req, res) => { await svc.deleteFaq(req.params.id); res.json({ success: true }); });
