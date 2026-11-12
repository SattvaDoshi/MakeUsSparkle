import watchBuyService from "../services/watchBuy.service.js";

const wrap = (label, fn) => async (req, res) => {
	try {
		await fn(req, res);
	} catch (error) {
		console.error(`${label} error:`, error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const getWatchBuyPublic = wrap("Get watch & buy", async (req, res) => {
	const result = await watchBuyService.listPublic(req.query.gender);
	// Public + CDN-cacheable: protects the API from homepage traffic spikes.
	res.set("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
	res.json(result);
});

export const getWatchBuyAdmin = wrap("Admin list watch & buy", async (req, res) => res.json(await watchBuyService.listAdmin(req.query.gender)));
export const signWatchBuyUpload = wrap("Sign watch & buy upload", async (req, res) => res.json(watchBuyService.signUpload()));
export const createWatchBuy = wrap("Create watch & buy", async (req, res) => res.status(201).json(await watchBuyService.create(req.body)));
export const updateWatchBuy = wrap("Update watch & buy", async (req, res) => res.json(await watchBuyService.update(req.params.id, req.body)));
export const deleteWatchBuy = wrap("Delete watch & buy", async (req, res) => res.json(await watchBuyService.remove(req.params.id)));
