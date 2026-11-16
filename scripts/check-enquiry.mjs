// Self-check for src/lib/enquiry.ts (validation, email body, rate limiter). Run: npm run check:enquiry (Node 22.18+ strips the types).
import assert from "node:assert/strict";
import { enquirySubject, enquiryText, rateLimiter, readEnquiry } from "../src/lib/enquiry.ts";

const form = (o) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(o)) (Array.isArray(v) ? v : [v]).forEach((x) => fd.append(k, x));
  return fd;
};
const base = { name: " Asha ", email: "asha@example.com", company: "", phone: "", date: "", headcount: "40", message: "Hi" };

const ok = readEnquiry(form({ ...base, service: ["VR event", "VR HUB"] }));
assert.ok(ok.success);
assert.equal(ok.data.name, "Asha");
assert.deepEqual(ok.data.services, ["VR event", "VR HUB"]);
assert.match(enquiryText(ok.data), /Services: VR event, VR HUB/);
assert.equal(enquirySubject({ ...ok.data, name: "A\r\nB" }), "New enquiry from A B");

assert.ok(!readEnquiry(form({ ...base, name: "  " })).success, "name required");
assert.ok(!readEnquiry(form({ ...base, email: "nope" })).success, "email checked");
assert.ok(!readEnquiry(form({ ...base, service: "Hacking" })).success, "unknown service rejected");
assert.ok(!readEnquiry(form({ ...base, headcount: "9999" })).success, "headcount bounded");
assert.ok(!readEnquiry(form({ ...base, date: "<script>" })).success, "date format checked");
assert.ok(!readEnquiry(form({ ...base, message: "x".repeat(5001) })).success, "message bounded");
assert.match(enquiryText(readEnquiry(form({ ...base, headcount: "250" })).data), /Headcount: 250\+/);

const allow = rateLimiter(2, 1000);
assert.equal(allow("a", 0), true);
assert.equal(allow("a", 10), true);
assert.equal(allow("a", 20), false, "third hit inside the window is blocked");
assert.equal(allow("b", 20), true, "keys are independent");
assert.equal(allow("a", 1011), true, "window slides");

console.log("enquiry checks passed");
