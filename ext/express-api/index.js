var express = require("express");
const bodyParser = require("body-parser")
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter, DocumentSnapshot } = require('firebase-admin/firestore');
const { format, zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz')


const today = new Date()
const timeZone = 'America/Denver'
const localToday = utcToZonedTime(today, timeZone)

console.log(format(localToday, 'yyyy-MM-dd HH:mm:ss'))

const apiKeyBase = require('/ext/apiKeyBase.json')
console.log(apiKeyBase.key)

const serviceAccount = require('/ext/AccountKey.json');
initializeApp({
    credential: cert(serviceAccount)
});
const db = getFirestore();

var app = express();

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw())

app.get('/pull-spam', async (req, res, next) => {
    // if (req.body.apiKey != apiKeyBase.key) {
    //     res.json({ 'result': 'bad Api Key' })
    //     return
    // }
    const snapshot = await db.collection('spamLog').get()
    // snapshot.forEach(doc => {
    //     console.log(doc.data())
    // })

    json_arr = []
    snapshot.forEach(doc => {
        json_arr.push(doc.data())
    })
    res.json(json_arr)


})

app.post("/call-log", async (req, res, next) => {
    if (req.body.apiKey != apiKeyBase.key) {
        res.json({ 'result': 'bad Api Key' })
        return
    }
    res.json({ 'result': 'success' });
    // console.log(req.body)
    const localTimeStamp = utcToZonedTime(new Date(), timeZone)
    const docRef = db.collection('callLog').doc(localTimeStamp.valueOf() + '-' + req.body.site);
    try {
        await docRef.set({
            Date: format(localTimeStamp, 'MM-dd-yyyy'),
            localTime: format(localTimeStamp, 'HH:mm:ss'),
            cnam: req.body.cnam,
            num: req.body.num,
            site: req.body.site,
            localTimeStamp: localTimeStamp.valueOf()
        });
    }
    catch { }
});

app.post("/spam-log", async (req, res, next) => {
    if (req.body.apiKey != apiKeyBase.key) {
        res.json({ 'result': 'bad Api Key' })
        return
    }
    res.json({ 'result': 'success' });
    console.log(req.body)
    const localTimeStamp = utcToZonedTime(new Date(), timeZone)
    const docRef = db.collection('spamLog').doc(localTimeStamp.valueOf() + '-' + req.body.site);
    try {
        await docRef.set({
            Date: format(localTimeStamp, 'MM-dd-yyyy'),
            localTime: format(localTimeStamp, 'HH:mm:ss'),
            cnam: req.body.cnam,
            num: req.body.num,
            site: req.body.site,
            localTimeStamp: localTimeStamp.valueOf()
        });
    }
    catch { }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});