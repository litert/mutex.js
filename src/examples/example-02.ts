/**
 *  Copyright 2020 Angus.Fenying <fenying@litert.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import * as Mutex from '../lib';

const mf = Mutex.createFactory();

mf.registerType('default', Mutex.createIntraprocessDriver());

let value: number = 0;

function sleep(ms: number): Promise<void> {

    return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function executeByInterval(fn: () => Promise<any>, ms: number): Promise<void> {

    while (1) {

        await sleep(ms);

        await fn();
    }
}

const STARTED_AT = Date.now();

function now(): number {

    return Date.now() - STARTED_AT;
}

async function task1(): Promise<void> {

    const mutex = mf.createMutex('default', 'write-value');

    if (await mutex.lock()) {

        value = value + 1;

        console.log(JSON.stringify([now(), 1, 'started']) + ',');

        await sleep(200);

        await mutex.unlock();
    }
    else {

        console.log(JSON.stringify([now(), 1, 'failed']) + ',');
    }

    console.log(JSON.stringify([now(), 1, 'ended']) + ',');
}

async function task2(): Promise<void> {

    const mutex = mf.createMutex('default', 'write-value');

    if (await mutex.lock()) {

        value = value + 2;

        console.log(JSON.stringify([now(), 2, 'started']) + ',');

        await sleep(500);

        await mutex.unlock();
    }
    else {

        console.log(JSON.stringify([now(), 2, 'failed']) + ',');
    }

    console.log(JSON.stringify([now(), 2, 'ended']) + ',');

}

executeByInterval(task1, 700).catch(console.error);

executeByInterval(task2, 500).catch(console.error);
