import { build, analyzeMetafile } from "esbuild";
import { dtsPlugin as dts } from "esbuild-plugin-d.ts";

const watch = !!process.argv.find(v => v === "watch");

const common = {
  entryPoints: [ "./src/extend-event-target.js" ],
  platform: "browser",
  bundle: true,
  watch,
}

build({
  ...common,
  outfile: "./dist/extend-event-target.js",
  format: "esm",
  plugins: [ dts() ]
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
  .then(result => analyzeMetafile(result.metafile))
  .then(text => console.log(text))
