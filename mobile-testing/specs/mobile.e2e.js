// Single entrypoint so WDIO runs everything in one worker (more stable on emulators).
import "./00-login.e2e.js";
import "./01-forms.e2e.js";
import "./02-swipe.e2e.js";

