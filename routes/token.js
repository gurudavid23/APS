const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const { APS_CLIENT_ID, APS_CLIENT_SECRET } = require('../config.js');

const router = express.Router();

router.get('/token', cors(), async (req, res, next) => {
    try {
        const curl = spawn('curl', [
            '-X', 'POST', 'https://developer.api.autodesk.com/authentication/v2/token',
            '--ssl-no-revoke',
            '-H', 'Content-Type: application/x-www-form-urlencoded',
            '-d', `client_id=${APS_CLIENT_ID}`,
            '-d', `client_secret=${APS_CLIENT_SECRET}`,
            '-d', 'grant_type=client_credentials',
            '-d', 'scope=data:read'
        ]);

        let data = '';
        curl.stdout.on('data', chunk => data += chunk);
        curl.stderr.on('data', err => console.error('stderr:', err.toString()));
        curl.on('close', () => {
            const token = JSON.parse(data);
            token.urn = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6eHBhYmhiOWswZnBqc2l4a3BhOG53aWczZ2pmOXZueG4ydXlka2E1emV3dzA2ZDF6LWJhc2ljLWFwcC9WMjAubndk'; // example URN
            res.json(token);
        });

    } catch (err) {
        next(err);
    }
});

module.exports = router;
