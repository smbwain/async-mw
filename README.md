async-mw
========

Use async syntax (or Promises) to build express middlewares.

```js
npm install --save async-mw
```

Sample
======

```js
import express from 'express';
import asyncMW from 'async-mw';

const app = express();
app.get('/resource/:id', asyncMW(async req => {
    const list = await myDatabase.load(req.params.id);
    return list;
}));
```

What else?
==========
* asyncMW takes your async function(req, res)
* asyncMW returns express middleware function(req, res, next)
* your async function could return:
    * undefined: in this case asyncMW calls method next
    * null: asyncMW does nothing
    * any other value: asyncMW sends that value like json
* that's it