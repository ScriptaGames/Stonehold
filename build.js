// Adapted from nativew's esbuild-serve: https://github.com/nativew/esbuild-serve

// ISC License

// Copyright (c) Antoine Boulanger (https://github.com/ABXlink)

// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.

// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

import esbuild from 'esbuild';
import serve, { error, log } from 'create-serve';
import chokidar from "chokidar";

export const isWatch = process.argv.includes('-w');

function reload(event, path)  {
    log(`🔃 Reload: ${event} ${path} at ${new Date().toLocaleTimeString()}`);
    serve.update();
}

async function esbuildServe(options = {}, serveOptions = {}) {
    try {
        let result = await esbuild
            .build({
                ...options,
                watch: isWatch && {
                    async onRebuild(err, result) {
                        const time = `${new Date().toLocaleTimeString()}`;
                        err ? error(`× Failed at ${time}`) : log(`✔️ Built at ${time}`);

                        serve.update();
                    }
                }
            })

        // only print the package size breakdown in regular build mode, it's
        // too spammy in watch mode
        !isWatch && console.log(await esbuild.analyzeMetafile(result.metafile, { color: true }));
    } catch (e) {
        process.exit(1);
    }

    if (isWatch) {
        serve.start(serveOptions);
        chokidar.watch(serveOptions.root, {
            ignored: "public/main.js*", // ignore the js bundle (and .map and .LEGAL.txt) because those reloads are triggered by esbuild onRebuild events
            ignoreInitial: true,
            atomic: true
        }).on("all", reload);
    }
}

await esbuildServe(
    // esbuild options
    {
        bundle: true,
        // analyze: true,
        minify: true,
        legalComments: "linked",
            entryPoints: ["main.js"],
        treeShaking: true,
            outfile: "public/main.js",
            outbase: "public",
            sourcemap: true,
            metafile: true,
    },
    // serve options
    {
        port: 7007,
            root: "public",
    }
);

// "build": "esbuild index.ts 
// --bundle 
// --define:DEBUG=false 
// --analyze 
// --legal-comments=linked 
// --tree-shaking=true 
// --minify 
// --target=es6 
// --outfile=public/index.js"


