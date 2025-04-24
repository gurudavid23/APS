const express = require('express');
const { SdkManagerBuilder } = require('@aps_sdk/autodesk-sdkmanager');
const { AuthenticationClient } = require('@aps_sdk/authentication');
const { ModelDerivativeClient, Region } = require('@aps_sdk/model-derivative');
const { listShares, createShare, deleteShare } = require('../shares.js');
const { APS_CLIENT_ID, APS_CLIENT_SECRET, APS_APP_NAME } = require('../config.js');

const sdkManager = SdkManagerBuilder.create().build();
const authenticationClient = new AuthenticationClient(sdkManager);
const modelDerivativeClient = new ModelDerivativeClient(sdkManager);
const router = express.Router();

// Middleware to parse body
router.use(express.urlencoded({ extended: true }));

// Middleware to check session & refresh token
router.use('/shares', async (req, res, next) => {
  const { credentials, user } = req.session;
  try {
    if (!credentials || !user) throw new Error('Unauthorized');

    if (credentials.expires_at < Date.now()) {
      const refreshed = await authenticationClient.getRefreshToken(APS_CLIENT_ID, credentials.refresh_token, {
        clientSecret: APS_CLIENT_SECRET
      });
      refreshed.expires_at = Date.now() + refreshed.expires_in * 1000;
      req.session.credentials = refreshed;
    }

    req.user_id = user.id;
    next();
  } catch (err) {
    next(err);
  }
});

// GET /shares
router.get('/shares', async (req, res, next) => {
  try {
    const shares = await listShares(req.user_id);
    res.render('shares', {
      user: req.session.user,
      app: { id: APS_CLIENT_ID, name: APS_APP_NAME },
      shares
    });
  } catch (err) {
    next(err);
  }
});

// POST /shares
router.post('/shares', async (req, res, next) => {
  try {
    const { urn, description } = req.body;
    if (!urn.match(/^[-a-zA-Z0-9+=_]+$/)) throw new Error('Invalid URN');
    if (description && description.length > 512) throw new Error('Description too long');

    // Skip actual URN manifest validation to allow all base64 URNs
    await createShare(req.user_id, urn, description);
    res.redirect('/shares');
  } catch (err) {
    next(err);
  }
});

// DELETE /shares/:id
router.delete('/shares/:id', async (req, res, next) => {
  try {
    await deleteShare(req.user_id, req.params.id);
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

module.exports = router;