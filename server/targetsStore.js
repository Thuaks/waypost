// targetsStore.js — the routing table, persisted to disk.
// Each target now holds an array of `instances` (URLs) instead of a
// single `url`, so the proxy can round-robin across multiple copies
// of the same backend service.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "targets.json");

const DEFAULT_TARGETS = [
  { name: "users-service", pathPrefix: "/api/users", instances: ["http://localhost:4001", "http://localhost:4006"] },
  { name: "orders-service", pathPrefix: "/api/orders", instances: ["http://localhost:4002"] },
];

function save(targets) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(targets, null, 2));
}

// Migrates any older-format entries (single `url` field) to the new
// `instances` array shape, so a targets.json from before this milestone
// still loads correctly instead of breaking.
function migrate(rawTargets) {
  return rawTargets.map((t) => {
    if (t.instances) return t;
    return { name: t.name, pathPrefix: t.pathPrefix, instances: [t.url] };
  });
}

function load() {
  if (!fs.existsSync(DATA_FILE)) {
    save(DEFAULT_TARGETS);
    return [...DEFAULT_TARGETS];
  }
  const raw = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  const migrated = migrate(raw);
  save(migrated); // persist the migrated shape so this only happens once
  return migrated;
}

let targets = load();

export function getTargets() {
  return targets;
}

export function addTarget({ name, pathPrefix, instances }) {
  if (targets.some((t) => t.name === name)) {
    throw new Error(`A target named "${name}" already exists`);
  }
  if (targets.some((t) => t.pathPrefix === pathPrefix)) {
    throw new Error(`Path prefix "${pathPrefix}" is already in use`);
  }
  if (!Array.isArray(instances) || instances.length === 0) {
    throw new Error("At least one instance URL is required");
  }
  targets = [...targets, { name, pathPrefix, instances }];
  save(targets);
  return targets;
}

export function removeTarget(name) {
  if (!targets.some((t) => t.name === name)) {
    throw new Error(`No target named "${name}" was found`);
  }
  targets = targets.filter((t) => t.name !== name);
  save(targets);
  return targets;
}
