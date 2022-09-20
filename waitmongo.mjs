import pWaitFor from 'p-wait-for';
import mdb from 'mongodb';

pWaitFor(function() {
	return new Promise(function (resolve, reject) {
		mdb.MongoClient.connect(process.env.MONGO_URL, function(err, client) {
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
}, 10000);
