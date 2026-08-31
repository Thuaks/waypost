// targetsStore.js — the routing table, now dynamic and persisted to disk.
// Replaces the old static targets.js array. On first run, seeds itself
// with the same two default targets we started with.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "targets.json");

const DEFAULT_TARGETS = [
  { name: "users-service", pathPrefix: "/api/users", url: "http://localhost:4001" },
  { name: "orders-service", pathPrefix: "/api/orders", url: "http://localhost:4002" },
];

function save(targets) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(targets, null, 2));
}

function load() {
  if (!fs.existsSync(DATA_FILE)) {
    save(DEFAULT_TARGETS);
    return [...DEFAULT_TARGETS];
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

let targets = load();

export function getTargets() {
  return targets;
}

export function addTarget({ name, pathPrefix, url }) {
  if (targets.some((t) => t.name === name)) {
    throw new Error(`A target named "${name}" already exists`);
  }
  if (targets.some((t) => t.pathPrefix === pathPrefix)) {
    throw new Error(`Path prefix "${pathPrefix}" is already in use`);
  }
  targets = [...targets, { name, pathPrefix, url }];
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
