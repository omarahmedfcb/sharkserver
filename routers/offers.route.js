const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { sendOffer } = require("../controllers/offer/sendoffer.controller");
const {
  getSentOffers,
} = require("../controllers/offer/getsentoffers.controller");
const {
  getReceivedOffers,
} = require("../controllers/offer/getreceivedoffers.controller");
const { acceptOffer } = require("../controllers/offer/acceptoffer.controller");
const { rejectOffer } = require("../controllers/offer/rejectoffer.controller");
const { cancelOffer } = require("../controllers/offer/canceloffer.controller");
const {
  getSingleOffer,
} = require("../controllers/offer/getsingleoffer.controller");
const router = express.Router();

router.post("/send", sendOffer);
router.get("/sent", requireAuth, getSentOffers);
router.get("/received", requireAuth, getReceivedOffers);
router.patch("/accept/:id", requireAuth, acceptOffer);
router.patch("/reject/:id", requireAuth, rejectOffer);
router.patch("/cancel/:id", requireAuth, cancelOffer);
router.get("/:id", requireAuth, getSingleOffer);
module.exports = router;
