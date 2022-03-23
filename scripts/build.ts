import { build, BuildConfig, dirname } from "estrella";

const common: BuildConfig = {
  entry: "./src/extend-event-target.js",
  platform: "browser",
  bundle: true,
  cwd: dirname(__dirname),
}

build({
  ...common,
  outfile: "./dist/extend-event-target.js",
  format: "esm",
  minify: false,
})

build({
  ...common,
  outfile: "./dist/extend-event-target.min.js",
  format: "iife",
  globalName: "extendEventTarget",
  minify: true,
  sourcemap: "external",
  metafile: true,
})
