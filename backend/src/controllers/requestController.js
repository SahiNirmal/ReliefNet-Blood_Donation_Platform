const BloodRequest = require("../models/BloodRequest");
const User = require("../models/User");
const { distanceKm } = require("../utils/geo");
const { getIO, userRoom } = require("../socket");

async function listRequests(req, res, next) {
  try {
    const { bloodGroup, urgency, status, requesterId, lat, lng, radiusKm } = req.query;
    const filter = {};
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (urgency) filter.urgency = urgency;
    if (status) filter.status = status;
    if (requesterId) filter.requester = requesterId;

    let requests = await BloodRequest.find(filter)
      .populate("requester", "name email organization")
      .sort({ createdAt: -1 });

    if (lat && lng) {
      const originLat = Number(lat);
      const originLng = Number(lng);
      const radius = radiusKm ? Number(radiusKm) : null;

      requests = requests
        .map((r) => {
          const obj = r.toObject();
          obj.distanceKm = distanceKm(originLat, originLng, r.location?.lat, r.location?.lng);
          return obj;
        })
        .filter((r) => !radius || r.distanceKm === null || r.distanceKm <= radius)
        .sort((a, b) => {
          if (a.distanceKm === null) return 1;
          if (b.distanceKm === null) return -1;
          return a.distanceKm - b.distanceKm;
        });
    }

    res.json(requests);
  } catch (err) {
    next(err);
  }
}

async function getRequest(req, res, next) {
  try {
    const request = await BloodRequest.findById(req.params.id).populate(
      "requester",
      "name email organization"
    );
    if (!request) return res.status(404).json({ message: "Request not found." });
    res.json(request);
  } catch (err) {
    next(err);
  }
}

const NEARBY_RADIUS_KM = 25;

// Donors who never shared a location (browser permission blocked or
// dismissed, location services off, or accounts created by the seed
// script) can't be distance-checked. In an emergency system a silent
// drop is worse than one extra notification, so by default they are
// still alerted when their blood group matches. Set the environment
// variable NOTIFY_UNKNOWN_LOCATION_DONORS=false to alert only donors
// whose saved location is within range.
const NOTIFY_UNKNOWN_LOCATION_DONORS = process.env.NOTIFY_UNKNOWN_LOCATION_DONORS !== "false";

const hasCoords = (loc) => loc?.lat != null && loc?.lng != null;

async function createRequest(req, res, next) {
  try {
    const { patientName, bloodGroup, unitsNeeded, hospital, urgency, contactNumber, location } = req.body;
    const request = await BloodRequest.create({
      patientName,
      bloodGroup,
      unitsNeeded,
      hospital,
      urgency,
      contactNumber,
      location,
      requester: req.user._id,
    });

    // Sort every available donor with this blood group into: in range,
    // out of range, or unknown (no coordinates on the donor or the request).
    const candidates = await User.find({
      role: "donor",
      bloodGroup: request.bloodGroup,
      isAvailable: true,
    });

    const nearby = [];
    const unknown = [];
    let tooFar = 0;
    for (const donor of candidates) {
      if (!hasCoords(request.location) || !hasCoords(donor.location)) {
        unknown.push(donor);
        continue;
      }
      const dist = distanceKm(request.location.lat, request.location.lng, donor.location.lat, donor.location.lng);
      if (dist <= NEARBY_RADIUS_KM) nearby.push(donor);
      else tooFar++;
    }

    const toNotify = NOTIFY_UNKNOWN_LOCATION_DONORS ? [...nearby, ...unknown] : nearby;

    // Real-time push (Experiment 8): every donor to notify gets the new
    // request over their open WebSocket connection. getIO() is null if
    // sockets were never initialized (e.g. a test harness), in which case
    // this silently no-ops instead of crashing the request.
    let online = 0;
    const io = getIO();
    if (io && toNotify.length > 0) {
      // Built by hand rather than with request.populate(): populate()
      // mutates the document, which would turn `requester` in the HTTP
      // response below from an id into an object.
      const payload = {
        ...request.toObject(),
        requester: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          organization: req.user.organization,
        },
      };
      for (const donor of toNotify) {
        const room = userRoom(donor._id);
        if (io.sockets.adapter.rooms.get(room)?.size) online++;
        io.to(room).emit("new-request", payload);
      }
    }

    // One line that explains exactly who was (and wasn't) alerted and why.
    console.log(
      `[createRequest] ${request.bloodGroup} request: ${candidates.length} available donor(s) with this blood group -> ` +
        `${nearby.length} within ${NEARBY_RADIUS_KM} km, ${tooFar} too far, ${unknown.length} with no saved location. ` +
        `Notified ${toNotify.length}, of whom ${online} currently online.`
    );

    res.status(201).json({
      ...request.toObject(),
      // null (not 0) when the request has no coordinates, so the UI can
      // say "identifying donors" instead of a misleading "0 within 25 km".
      nearbyDonorsMatched: hasCoords(request.location) ? nearby.length : null,
      donorsNotified: toNotify.length,
    });
  } catch (err) {
    next(err);
  }
}

async function updateRequest(req, res, next) {
  try {
    const existing = await BloodRequest.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Request not found." });

    if (existing.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your own requests." });
    }

    const request = await BloodRequest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Live-notify the donor who was marked as having fulfilled this
    // request — they find out immediately rather than needing to revisit
    // their dashboard to see it.
    const io = getIO();
    if (io && request.status === "fulfilled" && request.fulfilledBy) {
      io.to(userRoom(request.fulfilledBy)).emit("request-fulfilled", {
        requestId: request._id,
        patientName: request.patientName,
      });
    }

    res.json(request);
  } catch (err) {
    next(err);
  }
}

async function deleteRequest(req, res, next) {
  try {
    const existing = await BloodRequest.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Request not found." });

    if (existing.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own requests." });
    }

    await existing.deleteOne();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listRequests, getRequest, createRequest, updateRequest, deleteRequest };