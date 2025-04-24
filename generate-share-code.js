// generate-share-code.js
const crypto = require("crypto");

const ownerId = "cv014rsc75rephj8k2t0"; // from JWT 'sub'
const shareId = crypto.randomUUID();   // unique id
const raw = `${ownerId}/${shareId}`;
const secret = "sdsdsdfdfdfdds";       // your SERVER_SESSION_SECRET

const key = crypto.createHash("md5").update(secret).digest(); // 16 bytes
const cipher = crypto.createCipheriv("aes-128-ecb", key, null);
let encrypted = cipher.update(raw, "utf8", "hex");
encrypted += cipher.final("hex");

console.log("✅ Encrypted Share Code:", encrypted);
console.log("🔗 Share Link:", `https://aps-shares-app.autodesk.io/token?share=${encrypted}`);
console.log("🧠 Raw:", raw);
