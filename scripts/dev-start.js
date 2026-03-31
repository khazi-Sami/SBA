/* eslint-disable @typescript-eslint/no-require-imports */
// dev-start.js — preserve the original Windows sync flow, but run locally on macOS/Linux
const { execSync, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const D_ROOT = path.join(__dirname, "..");
const LOCAL_ROOT = D_ROOT;
const C_ROOT = "C:\\MyProjects\\sunnibrothersassociation";
const D_APP  = path.join(D_ROOT, "app");
const D_LIB = path.join(D_ROOT, "lib");
const D_PRISMA = path.join(D_ROOT, "prisma");
const C_APP  = path.join(C_ROOT, "app");
const C_LIB = path.join(C_ROOT, "lib");
const C_PRISMA = path.join(C_ROOT, "prisma");
const C_DEV  = path.join(C_ROOT, ".next", "dev");
const isWindows = process.platform === "win32";

if (!isWindows) {
  console.log("Starting Next.js dev server from local project root…");
  const next = spawn("npx", ["next", "dev"], {
    cwd: LOCAL_ROOT,
    stdio: "inherit",
    env: { ...process.env },
  });

  next.on("close", (code) => process.exit(code ?? 0));
  return;
}

// 1. Kill whatever is on port 3000
try {
  const out = execSync(
    `powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue).OwningProcess"`,
    { encoding: "utf8" }
  ).trim();
  const pid = parseInt(out, 10);
  if (!isNaN(pid) && pid > 0) {
    console.log(`Stopping PID ${pid} on port 3000…`);
    execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
    // give the OS 600 ms to release file handles
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 600);
  }
} catch {}

// 2. Remove stale .next/dev artifacts
try {
  if (fs.existsSync(C_DEV)) {
    fs.rmSync(C_DEV, { recursive: true, force: true });
    console.log("Removed stale .next/dev");
  }
} catch {}

// 3. Sync source folders D → C
try {
  console.log("Syncing source folders D → C…");
  execSync(`robocopy "${D_APP}" "${C_APP}" /MIR /NFL /NDL /NJH /NJS /NC /NS /NP`, {
    stdio: "ignore",
    // robocopy exit 0=no change, 1=files copied, both are success
  });
  execSync(`robocopy "${D_LIB}" "${C_LIB}" /MIR /NFL /NDL /NJH /NJS /NC /NS /NP`, {
    stdio: "ignore",
  });
  execSync(`robocopy "${D_PRISMA}" "${C_PRISMA}" /MIR /NFL /NDL /NJH /NJS /NC /NS /NP`, {
    stdio: "ignore",
  });

  const filesToCopy = ["tsconfig.json", "next-auth.d.ts", "package.json"];
  for (const file of filesToCopy) {
    const src = path.join(D_ROOT, file);
    const dst = path.join(C_ROOT, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
    }
  }
} catch (e) {
  // robocopy exits 1 when files were copied, which Node treats as an error — ignore ≤7
  if (e.status > 7) {
    console.error("robocopy failed with status", e.status);
  }
}

// 4. Start Next.js dev server from C project
console.log("Starting Next.js dev server…");
const next = spawn(
  "node",
  [path.join(C_ROOT, "node_modules", "next", "dist", "bin", "next"), "dev", "--webpack"],
  {
    cwd: C_ROOT,
    stdio: "inherit",
    env: { ...process.env },
  }
);

next.on("close", (code) => process.exit(code ?? 0));
