#!/bin/bash

set -o errexit

cd /docker

# Poll until we can successfully connect to MongoDB
echo 'Connecting to MongoDB...'
node <<- 'EOJS'

const pWaitFor = (...args) => import('p-wait-for').then(
        ((pWaitFor) => {
                pWaitFor(()=>{
                        return new Promise(function (resolve, reject) {
                                require('mongodb').MongoClient.connect(process.env.MONGO_URL, function(err, client) {
                                        const successfullyConnected = err == null;
                                        if (successfullyConnected) {
                                                client.close();
                                                process.exit(0);
                                        } else {
                                                if(client) {
                                                        client.close();
                                                }
                                                resolve(false);
                                                return;
                                        }
                                        resolve(successfullyConnected);
                                });
                        });
                },
        {
            "interval":1000
        });
        })
)
EOJS

echo 'Starting app...'
cd /opt/bundle/bundle

exec "$@"
