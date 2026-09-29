import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
const local=homedir()+'/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const browserName=process.env.E2E_BROWSER || 'chromium';
export default defineConfig({
  testDir:'./e2e',workers:1,fullyParallel:false,timeout:45000,
  outputDir:'test-results/artifacts',
  reporter:[['list'],['json',{outputFile:'test-results/results.json'}]],
  use:{baseURL:'http://127.0.0.1:3101',browserName,headless:true,viewport:{width:1440,height:1000},
    launchOptions:browserName !== 'chromium' ? {} : process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:existsSync(local)?{executablePath:local}:{},
    screenshot:'only-on-failure',trace:'retain-on-failure'},
  webServer:{command:'node e2e/server.mjs',url:'http://127.0.0.1:3101/api/saude',reuseExistingServer:false,timeout:30000},
});
