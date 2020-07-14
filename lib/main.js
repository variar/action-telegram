"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github_1 = require("@actions/github");
const request = __importStar(require("request-promise-native"));
/**
 * Checksuit result notification through Telegram
 */
(function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const botToken = core.getInput('botToken');
            const chatId = core.getInput('chatId');
            const jobStatus = core.getInput('jobStatus');
            const commitHash = core.getInput('commitHash');
            const commitActor = core.getInput('commitActor');
            const skipSuccess = (core.getInput('skipSuccess') || 'true') === 'true';
            core.debug(`sending message, status=${jobStatus} skipSuccess=${skipSuccess} payload=${JSON.stringify(github_1.context.payload)}`);
            yield _sendMessage(botToken, chatId, commitHash, commitActor, jobStatus, skipSuccess);
            core.debug('message sent');
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
})();
/**
 * Send a Telegram message.
 * @param botToken the Telegram bot token to send the message
 * @param chatId id of targeted channel or group, to which the message will be sent
 * @param jobStatus status of the job
 */
function _sendMessage(botToken, chatId, commitHash, commitActor, jobStatus = 'success', skipSuccess = true) {
    return __awaiter(this, void 0, void 0, function* () {
        const status = (jobStatus || '').toLowerCase();
        if (status === 'success' && skipSuccess) {
            core.debug('skipping successful job');
            return;
        }
        
        const { workflow } = github_1.context;

        let icon;
        switch (status) {
            case 'success':
                icon = '✅';
                break;
            case 'failure':
                icon = '🔴';
                break;
            default:
                icon = '⚠️';
                break;
        }
        const uri = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const text = `${icon} ${workflow} *${jobStatus}* -- commit ${commitHash} by *${commitActor}*`;
        return request.post(uri, {
            body: {
                text,
                chat_id: chatId,
                parse_mode: 'Markdown',
            },
            json: true,
        });
    });
}
