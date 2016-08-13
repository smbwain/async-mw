'use strict';

const asyncMW = require('../lib/async-mw');

const express = require('express');
const request = require('request');
const assert = require('assert');

const TEST_PORT = 23001;

function makeRequest(path, opts) {
    opts = opts || {};
    return new Promise((resolve, reject) => {
        request(`http://127.0.0.1:${TEST_PORT}${path}`, opts, (err, response, body) => {
            if (err) {
                reject(err);
                return;
            }
            if (response.statusCode != 200) {
                err = new Error(`Wrong status code: ${response.statusCode}`);
                err.statusCode = response.statusCode;
                reject(err);
                return;
            }
            resolve(body);
        })
    });
}

describe('async-mw', () => {

    let app, server;

    it('should start server', done => {
        app = express();
        app.get('/json', asyncMW(
            () => new Promise(resolve => {
                setTimeout(() => {
                    resolve({a: 1});
                }, 500);
            })
        ));
        app.get('/nothing', asyncMW(
            () => new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                }, 500);
            })
        ), (req, res) => {
            res.send('ok');
        });
        app.get('/null', asyncMW(
            () => new Promise(resolve => {
                setTimeout(() => {
                    resolve(null);
                }, 500);
            })
        ));
        app.get('/error1', asyncMW(
            () => {
                throw new Error('Oops 1');
            }
        ));
        app.get('/error2', asyncMW(
            () => new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject(new Error('Oops 2'));
                }, 500);
            })
        ));
        server = app.listen(TEST_PORT, done);
    });

    it('should return json', () => {
        return makeRequest('/json').then(body => {
            assert.deepEqual(JSON.parse(body), {a: 1});
        });
    });

    it('should return json', () => {
        return makeRequest('/nothing').then(body => {
            assert.equal(body, 'ok');
        });
    });

    it('should return null', function () {
        this.timeout(5000);
        return makeRequest('/null', {timeout: 3000}).then(() => {
            throw new Error('Response\'s been received');
        }, err => {
            if(err.code != 'ETIMEDOUT') {
                throw err;
            }
        });
    });

    it('shoud close server', done => {
        server.close(done);
    })

});