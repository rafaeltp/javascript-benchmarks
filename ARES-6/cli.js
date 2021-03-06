/*
 * Copyright (C) 2017 Apple Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 
 */

const isInBrowser = false;

// Support for running in d8.
var readFile = readFile || read;
var runString = runString || function (source) {
  const realm = Realm.createAllowCrossRealmAccess();
  Realm.eval(realm, source);
  return Realm.global(realm);
};

function makeBenchmarkRunner(sources, benchmarkConstructor, numIterations = 200) {
    let source = "'use strict';"
    for (let file of sources) {
        source += readFile(file);
    }
    source += `
        this.results = [];
        var benchmark = new ${benchmarkConstructor}();
        var numIterations = ${numIterations};
        for (var i = 0; i < numIterations; ++i) {
            var before = currentTime();
            benchmark.runIteration();
            var after = currentTime();
            results.push(after - before);
        }
    `;
    return function doRun() {
        let globalObjectOfScript = runString(source);
        let results = globalObjectOfScript.results;
        reportResult(results);
    }
}

var benchmarks = {
    "air"       : "air_benchmark.js",
    "basic"     : "basic_benchmark.js",
    "babylon"   : "babylon_benchmark.js",
    "ml"        : "ml_benchmark.js"
};

load("driver.js");
load("results.js");
load("stats.js");

var target_benchmarks = ["air", "basic", "babylon", "ml"];

if (arguments !== null && arguments.length != 0) {
    target_benchmarks.length = 0;
    for (let benchmark of arguments) {
        target_benchmarks.push(benchmark);
    }
}

for (let benchmark of target_benchmarks) {
    load(benchmarks[benchmark]);
}

load("glue.js");

driver.start(6);
