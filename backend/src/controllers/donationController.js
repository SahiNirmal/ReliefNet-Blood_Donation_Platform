const Donation = require("../models/Donation");
const BloodRequest = require("../models/BloodRequest");
const { getIO, userRoom } = require("../socket");

async function listDonations(req, res, next) {
  try {
    const { donorId, requestId } = req.query;
    const filter = {};
    if (donorId) filter.donor = donorId;
    if (requestId) filter.request = requestId;

    const donations = await Donation.find(filter)
      .populate("donor", "name phone email bloodGroup area")
      .populate({
        path: "request",
        select: "patientName hospital contactNumber bloodGroup unitsNeeded urgency requester status",
        populate: { path: "requester", select: "name phone email organization" },
      })
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (err) {
    next(err);
  }
}

async function createDonation(req, res, next) {
  try {
    const { request, hospital, units } = req.body;
    const donation = await Donation.create({
      donor: req.user._id,
      request,
      hospital,
      units,
      status: "scheduled",
    });
    const populated = await donation.populate([
      { path: "donor", select: "name phone email bloodGroup area" },
      {
        path: "request",
        select: "patientName hospital contactNumber bloodGroup unitsNeeded urgency requester status",
        populate: { path: "requester", select: "name phone email organization" },
      },
    ]);

    // Live-push to the requester who owns this request: they see the
    // donor's contact details appear immediately, without needing to
    // expand/reload their "Your requests" row to discover a response.
    const io = getIO();
    const requesterId = populated.request?.requester?._id || populated.request?.requester;
    if (io && requesterId) {
      io.to(userRoom(requesterId)).emit("new-response", populated.toObject());
    }

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
}

async function updateDonation(req, res, next) {
  try {
    const donation = await Donation.findById(req.params.id).populate("request", "requester");
    if (!donation) return res.status(404).json({ message: "Donation not found." });

    const isDonor = donation.donor.toString() === req.user._id.toString();
    const isOwningRequester = donation.request?.requester?.toString() === req.user._id.toString();
    if (!isDonor && !isOwningRequester) {
      return res.status(403).json({ message: "You are not authorized to update this response." });
    }

    donation.status = req.body.status;
    await donation.save();

    const populated = await donation.populate([
      { path: "donor", select: "name phone email bloodGroup area" },
      {
        path: "request",
        select: "patientName hospital contactNumber bloodGroup unitsNeeded urgency requester status",
        populate: { path: "requester", select: "name phone email organization" },
      },
    ]);
    res.json(populated);
  } catch (err) {
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const [activeRequests, registeredDonors, livesSaved] = await Promise.all([
      BloodRequest.countDocuments({ status: "open" }),
      require("../models/User").countDocuments({ role: "donor" }),
      Donation.countDocuments({ status: "completed" }),
    ]);
    res.json({ activeRequests, registeredDonors, livesSaved });
  } catch (err) {
    next(err);
  }
}

module.exports = { listDonations, createDonation, updateDonation, getStats };
