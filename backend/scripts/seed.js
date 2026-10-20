/**
 * Seed problems straight into MongoDB (no Judge0 needed).
 *
 * Usage (run from the backend folder):
 *   node scripts/seedProblems.js
 *   node scripts/seedProblems.js --email you@example.com --make-admin
 *   node scripts/seedProblems.js --file scripts/my-problems.json
 *   node scripts/seedProblems.js --dry-run
 *
 * Re-running is safe: problems are matched by title and updated, not duplicated.
 */
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Problem = require('../src/models/problem');
const User = require('../src/models/user');

const args = process.argv.slice(2);
const getArg = (name) => {
  const i = args.indexOf(name);
  return i !== -1 ? args[i + 1] : undefined;
};
const has = (name) => args.includes(name);

const file = path.resolve(getArg('--file') || path.join(__dirname, 'problems.json'));
const email = getArg('--email');
const dryRun = has('--dry-run');
const makeAdmin = has('--make-admin');

// The editor on the problem page needs a starter template for each of these.
const TEMPLATES = {
  'C++': `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Read the input from stdin, then print the answer.
    return 0;
}
`,
  Java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Read the input from sc, then print the answer.
    }
}
`,
  JavaScript: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
// Read the input from lines, then console.log() the answer.
`,
};

const fillStartCode = (problem) => {
  const have = new Map((problem.startCode || []).map((s) => [s.language, s.initialCode]));
  problem.startCode = Object.keys(TEMPLATES).map((language) => ({
    language,
    initialCode: have.get(language) || TEMPLATES[language],
  }));
  return problem;
};

async function main() {
  if (!fs.existsSync(file)) throw new Error(`File not found: ${file}`);
  const problems = JSON.parse(fs.readFileSync(file, 'utf8')).map(fillStartCode);
  console.log(`Loaded ${problems.length} problems from ${path.basename(file)}`);

  // Catch bad data before touching the database.
  const probs = [];
  problems.forEach((p, i) => {
    const err = new Problem({ ...p, problemCreator: new mongoose.Types.ObjectId() }).validateSync();
    if (err) probs.push(`#${i + 1} "${p.title}": ${Object.values(err.errors).map((e) => e.message).join('; ')}`);
  });
  if (probs.length) throw new Error('Invalid problems:\n  ' + probs.join('\n  '));

  if (dryRun) {
    console.log('Dry run OK: all problems pass schema validation. Nothing was written.');
    return;
  }

  await mongoose.connect(process.env.DB_CONNECT_STRING);

  let creator;
  if (email) {
    creator = await User.findOne({ emailId: email.toLowerCase() });
    if (!creator) throw new Error(`No user with email ${email}. Sign up in the app first.`);
  } else {
    creator = (await User.findOne({ role: 'admin' })) || (await User.findOne());
    if (!creator) throw new Error('No users in the database yet. Sign up in the app first, then run this again.');
  }

  if (makeAdmin && creator.role !== 'admin') {
    creator.role = 'admin';
    await creator.save();
    console.log(`Promoted ${creator.emailId} to admin. Log out and back in to pick it up.`);
  }

  let created = 0;
  let updated = 0;
  for (const p of problems) {
    const existing = await Problem.findOne({ title: p.title });
    await Problem.findOneAndUpdate(
      { title: p.title },
      { ...p, problemCreator: existing ? existing.problemCreator : creator._id },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    existing ? updated++ : created++;
    console.log(`  ${existing ? 'updated' : 'added  '}  ${p.title}  [${p.difficulty} / ${p.tags}]`);
  }
  console.log(`Done. ${created} added, ${updated} updated. Creator: ${creator.emailId}`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());