const functions = require('firebase-functions');
const requestPromiseNative = require('request-promise-native');
const uuidv4 = require('uuidv4');
const azureTranslationKey = functions.config().azure_translate.key;

function azureOptions(text) {
    return {
        method: 'POST',
        baseUrl: 'https://api.cognitive.microsofttranslator.com/',
        url: 'translate',
        qs: {
          'api-version': '3.0',
          'to': 'hr',
        },
        headers: {
          'Ocp-Apim-Subscription-Key': azureTranslationKey,
          'Content-type': 'application/json',
          'X-ClientTraceId': uuidv4().toString()
        },
        body: [{
              'text': text
        }],
        json: true,
    };
}

exports.translateToCroatian = functions.https.onCall((data, context) => {
    if (!azureTranslationKey) {
        throw new Error('Azure Translation Key not set');
    }
    const text = data.text;
    
    let options = azureOptions(text);

    return requestPromiseNative(options)
        .then(([res]) => {
            if (!res || !res.translations) {
                throw new Error('No response from translation API');
            }
            const [translation] = res.translations;
            if (!translation) {
                throw new Error('No translation in response from API');
            }
            return translation.text;
        });
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
