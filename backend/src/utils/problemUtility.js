const axios = require('axios');

const getLanguageById = (lang) => {
    const language = {
        "c++": 54,
        "java": 62,
        "javascript": 63
    };
    return language[lang.toLowerCase()];
};

// JUDGE0_URL  -> any Judge0 server, e.g. https://ce.judge0.com (free public, no key)
//                or http://localhost:2358 (self-hosted).
// Not set     -> falls back to RapidAPI, which needs JUDGE0_KEY.
const baseUrl = () => (process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com').replace(/\/+$/, '');

const buildHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (!process.env.JUDGE0_URL) {
        headers['x-rapidapi-key'] = process.env.JUDGE0_KEY;
        headers['x-rapidapi-host'] = 'judge0-ce.p.rapidapi.com';
    } else if (process.env.JUDGE0_KEY) {
        headers['X-Auth-Token'] = process.env.JUDGE0_KEY;
    }
    return headers;
};

const submitBatch = async (submissions) => {
    try {
        const response = await axios.request({
            method: 'POST',
            url: `${baseUrl()}/submissions/batch`,
            params: { base64_encoded: 'false' },
            headers: buildHeaders(),
            data: { submissions }
        });
        return response.data;
    } catch (error) {
        console.error('Judge0 submit failed:', error.response?.status, error.response?.data || error.message);
        throw new Error('Code runner is unavailable right now');
    }
};

const waiting = (timer) => new Promise((resolve) => setTimeout(resolve, timer));

const submitToken = async (resultToken) => {
    const options = {
        method: 'GET',
        url: `${baseUrl()}/submissions/batch`,
        params: {
            tokens: resultToken.join(","),
            base64_encoded: 'false',
            fields: '*'
        },
        headers: buildHeaders()
    };

    for (let attempt = 0; attempt < 30; attempt++) {
        try {
            const response = await axios.request(options);
            const done = response.data.submissions.every((r) => r.status_id > 2);
            if (done) return response.data.submissions;
        } catch (error) {
            console.error('Judge0 poll failed:', error.response?.status, error.response?.data || error.message);
        }
        await waiting(1000);
    }
    throw new Error('Code runner timed out');
};

module.exports = { getLanguageById, submitBatch, submitToken };