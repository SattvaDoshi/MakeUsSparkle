import HomeContent from "../models/homeContent.model.js";
import imageService from "../services/image.service.js";

export async function getHomeContent(req, res) {
  try {
    let homeContent = await HomeContent.findOne({ key: "home-page" });
    if (!homeContent) {
      try {
        homeContent = await HomeContent.create({ key: "home-page" });
      } catch (err) {
        if (err.code === 11000) {
          homeContent = await HomeContent.findOne({ key: "home-page" });
        } else {
          throw err;
        }
      }
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

    const targetGender = req.body.gender; // "women", "men", or "kids"

    if (req.body.promoBanners) {
      try {
        const parsedPromo = JSON.parse(req.body.promoBanners);
        if (Array.isArray(parsedPromo)) {
          if (targetGender && ["women", "men", "kids"].includes(targetGender)) {
            if (!homeContent.genderContent) homeContent.genderContent = {};
            if (!homeContent.genderContent[targetGender]) homeContent.genderContent[targetGender] = {};
            homeContent.genderContent[targetGender].promoBanners = parsedPromo;
          } else {
            homeContent.promoBanners = parsedPromo;
          }
        }
      } catch (e) {
        console.error("Failed to parse promoBanners", e);
      }
    }

    for (let i = 0; i < 2; i++) {
      const fileKey = targetGender ? `${targetGender}_promoImage_${i}` : `promoImage_${i}`;
      if (files[fileKey]) {
        const file = files[fileKey][0];
        
        let targetBanners = targetGender && homeContent.genderContent && homeContent.genderContent[targetGender] 
          ? homeContent.genderContent[targetGender].promoBanners 
          : homeContent.promoBanners;

        if (targetBanners?.[i]?.imagePublicId) {
          await imageService.deleteImage(targetBanners[i].imagePublicId);
        }

        const uploadedImage = await imageService.uploadImage(file.buffer, "home");
        
        if (targetGender && ["women", "men", "kids"].includes(targetGender)) {
           if (!homeContent.genderContent) homeContent.genderContent = {};
           if (!homeContent.genderContent[targetGender]) homeContent.genderContent[targetGender] = {};
           if (!homeContent.genderContent[targetGender].promoBanners) homeContent.genderContent[targetGender].promoBanners = [];
           if (!homeContent.genderContent[targetGender].promoBanners[i]) homeContent.genderContent[targetGender].promoBanners[i] = {};
           
           homeContent.genderContent[targetGender].promoBanners[i].image = uploadedImage.url;
           homeContent.genderContent[targetGender].promoBanners[i].imagePublicId = uploadedImage.publicId;
        } else {
           if (!homeContent.promoBanners[i]) {
             homeContent.promoBanners[i] = {};
           }
           homeContent.promoBanners[i].image = uploadedImage.url;
           homeContent.promoBanners[i].imagePublicId = uploadedImage.publicId;
        }
      }
    }

    await homeContent.save();

    res.json({ success: true, homeContent });
  } catch (error) {
    console.error("Update home content error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
}
