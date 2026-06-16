import HomeContent from "../models/homeContent.model.js";
import imageService from "../services/image.service.js";

export async function getHomeContent(req, res) {
  try {
    let homeContent = await HomeContent.findOne({ key: "home-page" });
    if (!homeContent) {
      homeContent = await HomeContent.create({ key: "home-page" });
    }
    res.json({ success: true, homeContent });
  } catch (error) {
    console.error("Get home content error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateHomeContent(req, res) {
  try {
    let homeContent = await HomeContent.findOne({ key: "home-page" });
    if (!homeContent) {
      homeContent = new HomeContent({ key: "home-page" });
    }

    if (req.body.marqueeItems) {
      // It might come as a JSON string
      try {
        homeContent.marqueeItems = JSON.parse(req.body.marqueeItems);
      } catch (e) {
        homeContent.marqueeItems = req.body.marqueeItems;
      }
    }

    // Handle files upload
    const files = req.files || {};
    for (const gender of ["women", "men", "kids"]) {
      if (files[gender]) {
        const file = files[gender][0];
        
        // Delete old image if it exists and has publicId
        if (homeContent.heroContent?.[gender]?.imagePublicId) {
          await imageService.deleteImage(homeContent.heroContent[gender].imagePublicId);
        }

        const uploadedImage = await imageService.uploadImage(file.buffer, "home");
        
        if (!homeContent.heroContent) homeContent.heroContent = {};
        if (!homeContent.heroContent[gender]) homeContent.heroContent[gender] = {};
        
        homeContent.heroContent[gender].image = uploadedImage.url;
        homeContent.heroContent[gender].imagePublicId = uploadedImage.publicId;
      }
    }

    if (req.body.promoBanners) {
      try {
        const parsedPromo = JSON.parse(req.body.promoBanners);
        if (Array.isArray(parsedPromo)) {
          homeContent.promoBanners = parsedPromo;
        }
      } catch (e) {
        console.error("Failed to parse promoBanners", e);
      }
    }

    for (let i = 0; i < 2; i++) {
      if (files[`promoImage_${i}`]) {
        const file = files[`promoImage_${i}`][0];
        
        if (homeContent.promoBanners?.[i]?.imagePublicId) {
          await imageService.deleteImage(homeContent.promoBanners[i].imagePublicId);
        }

        const uploadedImage = await imageService.uploadImage(file.buffer, "home");
        
        if (!homeContent.promoBanners[i]) {
          homeContent.promoBanners[i] = {};
        }
        homeContent.promoBanners[i].image = uploadedImage.url;
        homeContent.promoBanners[i].imagePublicId = uploadedImage.publicId;
      }
    }

    await homeContent.save();

    res.json({ success: true, homeContent });
  } catch (error) {
    console.error("Update home content error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
}
